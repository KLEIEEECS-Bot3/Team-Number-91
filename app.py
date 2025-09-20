from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import requests
import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import logging
from functools import wraps
import time
from collections import defaultdict
import validators

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///crypto_alerts.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
CORS(app)

# Security: Rate limiting
request_counts = defaultdict(list)
RATE_LIMIT_REQUESTS = 100  # requests per minute
RATE_LIMIT_WINDOW = 60  # seconds

def rate_limit(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        client_ip = request.remote_addr
        current_time = time.time()
        
        # Clean old requests
        request_counts[client_ip] = [
            req_time for req_time in request_counts[client_ip] 
            if current_time - req_time < RATE_LIMIT_WINDOW
        ]
        
        # Check rate limit
        if len(request_counts[client_ip]) >= RATE_LIMIT_REQUESTS:
            return jsonify({'error': 'Rate limit exceeded'}), 429
        
        # Add current request
        request_counts[client_ip].append(current_time)
        
        return f(*args, **kwargs)
    return decorated_function

# Database Models
class Alert(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    crypto_symbol = db.Column(db.String(10), nullable=False)
    threshold_price = db.Column(db.Float, nullable=False)
    is_above = db.Column(db.Boolean, nullable=False)  # True if alert when price goes above threshold
    telegram_chat_id = db.Column(db.String(50), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    triggered_at = db.Column(db.DateTime, nullable=True)
    last_checked_price = db.Column(db.Float, nullable=True)  # Track last price to detect crossings

    def to_dict(self):
        return {
            'id': self.id,
            'crypto_symbol': self.crypto_symbol,
            'threshold_price': self.threshold_price,
            'is_above': self.is_above,
            'telegram_chat_id': self.telegram_chat_id,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'triggered_at': self.triggered_at.isoformat() if self.triggered_at else None
        }

# Security: Input validation
def validate_crypto_symbol(symbol):
    if not symbol or not isinstance(symbol, str):
        return False
    return symbol.upper().isalpha() and len(symbol) <= 10

def validate_price(price):
    try:
        price_float = float(price)
        return price_float > 0
    except (ValueError, TypeError):
        return False

def validate_telegram_chat_id(chat_id):
    if not chat_id or not isinstance(chat_id, str):
        return False
    # Basic validation for Telegram chat ID format
    return chat_id.replace('-', '').replace('@', '').isalnum()

# Crypto API Service
class CryptoService:
    def __init__(self):
        self.api_key = os.getenv('COINMARKETCAP_API_KEY')
        self.base_url = 'https://pro-api.coinmarketcap.com/v1'
        self.headers = {
            'X-CMC_PRO_API_KEY': self.api_key,
            'Accept': 'application/json'
        } if self.api_key else {}
        
    def get_crypto_prices(self, symbols):
        """Get current prices for given cryptocurrency symbols"""
        if not self.api_key or self.api_key == 'your-coinmarketcap-api-key':
            # Fallback to free API if no API key or placeholder key
            return self._get_free_crypto_prices(symbols)
            
        try:
            symbols_str = ','.join(symbols)
            url = f"{self.base_url}/cryptocurrency/quotes/latest"
            params = {
                'symbol': symbols_str,
                'convert': 'USD'
            }
            
            response = requests.get(url, headers=self.headers, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            prices = {}
            for symbol in symbols:
                if symbol in data.get('data', {}):
                    price = data['data'][symbol]['quote']['USD']['price']
                    prices[symbol] = price
                    
            return prices
            
        except Exception as e:
            app.logger.error(f"Error fetching crypto prices: {e}")
            return self._get_free_crypto_prices(symbols)
    
    def _get_free_crypto_prices(self, symbols):
        """Fallback free API for crypto prices"""
        prices = {}
        try:
            # Use CoinGecko's free API with proper coin IDs
            coin_mapping = {
                'BTC': 'bitcoin',
                'ETH': 'ethereum', 
                'ADA': 'cardano',
                'DOT': 'polkadot',
                'LINK': 'chainlink',
                'UNI': 'uniswap',
                'AAVE': 'aave',
                'SOL': 'solana',
                'MATIC': 'matic-network',
                'AVAX': 'avalanche-2'
            }
            
            # Get all prices in one request
            coin_ids = []
            for symbol in symbols:
                if symbol in coin_mapping:
                    coin_ids.append(coin_mapping[symbol])
            
            if coin_ids:
                url = f"https://api.coingecko.com/api/v3/simple/price?ids={','.join(coin_ids)}&vs_currencies=usd"
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    for symbol in symbols:
                        if symbol in coin_mapping and coin_mapping[symbol] in data:
                            prices[symbol] = data[coin_mapping[symbol]]['usd']
        except Exception as e:
            app.logger.error(f"Error with free API: {e}")
            # Return mock prices if API fails
            mock_prices = {
                'BTC': 45000.0, 'ETH': 3000.0, 'ADA': 0.5, 'DOT': 20.0,
                'LINK': 15.0, 'UNI': 8.0, 'AAVE': 100.0, 'SOL': 25.0,
                'MATIC': 0.8, 'AVAX': 35.0
            }
            for symbol in symbols:
                if symbol in mock_prices:
                    prices[symbol] = mock_prices[symbol]
        return prices

# Telegram Service
class TelegramService:
    def __init__(self):
        self.bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        
    def send_message(self, chat_id, message):
        """Send message via Telegram bot"""
        if not self.bot_token or self.bot_token == 'your-telegram-bot-token':
            app.logger.warning("Telegram bot token not configured - using demo mode")
            print(f"📱 DEMO: Would send to chat {chat_id}: {message}")
            return True
            
        try:
            url = f"https://api.telegram.org/bot{self.bot_token}/sendMessage"
            data = {
                'chat_id': chat_id,
                'text': message,
                'parse_mode': 'HTML'
            }
            
            response = requests.post(url, data=data, timeout=10)
            response.raise_for_status()
            return True
            
        except Exception as e:
            app.logger.error(f"Error sending Telegram message: {e}")
            return False

# Initialize services
crypto_service = CryptoService()
telegram_service = TelegramService()

# API Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now(timezone.utc).isoformat()})

@app.route('/api/cryptos', methods=['GET'])
@rate_limit
def get_cryptos():
    """Get list of popular cryptocurrencies"""
    popular_cryptos = [
        {'symbol': 'BTC', 'name': 'Bitcoin'},
        {'symbol': 'ETH', 'name': 'Ethereum'},
        {'symbol': 'ADA', 'name': 'Cardano'},
        {'symbol': 'DOT', 'name': 'Polkadot'},
        {'symbol': 'LINK', 'name': 'Chainlink'},
        {'symbol': 'UNI', 'name': 'Uniswap'},
        {'symbol': 'AAVE', 'name': 'Aave'},
        {'symbol': 'SOL', 'name': 'Solana'},
        {'symbol': 'MATIC', 'name': 'Polygon'},
        {'symbol': 'AVAX', 'name': 'Avalanche'}
    ]
    return jsonify(popular_cryptos)

@app.route('/api/prices', methods=['GET'])
@rate_limit
def get_prices():
    """Get current prices for requested cryptocurrencies"""
    # Handle both formats: symbols[]=BTC&symbols[]=ETH and symbols=BTC&symbols=ETH
    symbols = request.args.getlist('symbols[]') or request.args.getlist('symbols')
    
    if not symbols:
        return jsonify({'error': 'No symbols provided'}), 400
    
    # Validate symbols
    for symbol in symbols:
        if not validate_crypto_symbol(symbol):
            return jsonify({'error': f'Invalid symbol: {symbol}'}), 400
    
    prices = crypto_service.get_crypto_prices(symbols)
    return jsonify(prices)

@app.route('/api/alerts', methods=['GET'])
@rate_limit
def get_alerts():
    """Get all active alerts"""
    chat_id = request.args.get('chat_id')
    
    if not chat_id:
        return jsonify({'error': 'chat_id parameter required'}), 400
    
    if not validate_telegram_chat_id(chat_id):
        return jsonify({'error': 'Invalid chat_id format'}), 400
    
    alerts = Alert.query.filter_by(
        telegram_chat_id=chat_id, 
        is_active=True
    ).all()
    
    return jsonify([alert.to_dict() for alert in alerts])

@app.route('/api/alerts', methods=['POST'])
@rate_limit
def create_alert():
    """Create a new price alert"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Validate required fields
    required_fields = ['crypto_symbol', 'threshold_price', 'is_above', 'telegram_chat_id']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Validate data
    if not validate_crypto_symbol(data['crypto_symbol']):
        return jsonify({'error': 'Invalid crypto symbol'}), 400
    
    if not validate_price(data['threshold_price']):
        return jsonify({'error': 'Invalid threshold price'}), 400
    
    if not isinstance(data['is_above'], bool):
        return jsonify({'error': 'is_above must be boolean'}), 400
    
    if not validate_telegram_chat_id(data['telegram_chat_id']):
        return jsonify({'error': 'Invalid telegram chat ID'}), 400
    
    # Create alert
    alert = Alert(
        crypto_symbol=data['crypto_symbol'].upper(),
        threshold_price=float(data['threshold_price']),
        is_above=data['is_above'],
        telegram_chat_id=data['telegram_chat_id']
    )
    
    db.session.add(alert)
    db.session.commit()
    
    return jsonify(alert.to_dict()), 201

@app.route('/api/alerts/<int:alert_id>', methods=['DELETE'])
@rate_limit
def delete_alert(alert_id):
    """Delete an alert"""
    chat_id = request.args.get('chat_id')
    
    if not chat_id:
        return jsonify({'error': 'chat_id parameter required'}), 400
    
    alert = Alert.query.filter_by(
        id=alert_id, 
        telegram_chat_id=chat_id
    ).first()
    
    if not alert:
        return jsonify({'error': 'Alert not found'}), 404
    
    db.session.delete(alert)
    db.session.commit()
    
    return jsonify({'message': 'Alert deleted successfully'})

@app.route('/api/telegram/setup', methods=['POST'])
@rate_limit
def setup_telegram():
    """Setup Telegram integration"""
    data = request.get_json()
    
    if not data or 'chat_id' not in data:
        return jsonify({'error': 'chat_id required'}), 400
    
    chat_id = data['chat_id']
    
    if not validate_telegram_chat_id(chat_id):
        return jsonify({'error': 'Invalid chat_id format'}), 400
    
    # Send test message
    test_message = "🔔 <b>Crypto Price Alert Assistant</b>\n\nYour Telegram integration is now active! You'll receive price alerts here."
    
    if telegram_service.send_message(chat_id, test_message):
        return jsonify({'message': 'Telegram setup successful'})
    else:
        return jsonify({'error': 'Failed to send test message'}), 500

@app.route('/api/chart-data', methods=['GET'])
@rate_limit
def get_chart_data():
    """Get cryptocurrency chart data from CoinGecko API"""
    try:
        symbol = request.args.get('symbol', 'BTC').upper()
        days = request.args.get('days', '1')
        
        # CoinGecko API mapping
        coin_mapping = {
            'BTC': 'bitcoin',
            'ETH': 'ethereum',
            'ADA': 'cardano',
            'DOT': 'polkadot',
            'LINK': 'chainlink',
            'UNI': 'uniswap',
            'AAVE': 'aave',
            'SOL': 'solana',
            'MATIC': 'matic-network',
            'AVAX': 'avalanche-2'
        }
        
        coin_id = coin_mapping.get(symbol)
        if not coin_id:
            return jsonify({'error': f'Unsupported cryptocurrency: {symbol}'}), 400
        
        # Fetch data from CoinGecko API
        url = f'https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart'
        params = {
            'vs_currency': 'usd',
            'days': days
        }
        
        response = requests.get(url, params=params, headers={
            'Accept': 'application/json',
            'User-Agent': 'Crypto-Price-Alert-Assistant/1.0'
        })
        
        if response.status_code == 200:
            data = response.json()
            return jsonify({
                'prices': data.get('prices', []),
                'volumes': data.get('total_volumes', [])
            })
        else:
            return jsonify({'error': f'CoinGecko API error: {response.status_code}'}), 500
            
    except Exception as e:
        app.logger.error(f"Chart data error: {str(e)}")
        return jsonify({'error': 'Failed to fetch chart data'}), 500

# Background task for monitoring prices
def check_alerts():
    """Check all active alerts and send notifications"""
    with app.app_context():
        active_alerts = Alert.query.filter_by(is_active=True).all()
        
        if not active_alerts:
            return
        
        # Group alerts by crypto symbol for efficient API calls
        symbols_to_check = list(set([alert.crypto_symbol for alert in active_alerts]))
        current_prices = crypto_service.get_crypto_prices(symbols_to_check)
        
        for alert in active_alerts:
            if alert.crypto_symbol not in current_prices:
                continue
                
            current_price = current_prices[alert.crypto_symbol]
            threshold = alert.threshold_price
            last_price = alert.last_checked_price
            
            # Check if alert should trigger (detect actual crossing)
            should_trigger = False
            
            if alert.is_above:
                # Alert when price goes above threshold
                if current_price >= threshold and (last_price is None or last_price < threshold):
                    should_trigger = True
            else:
                # Alert when price goes below threshold
                if current_price <= threshold and (last_price is None or last_price > threshold):
                    should_trigger = True
            
            # Update last checked price
            alert.last_checked_price = current_price
            
            if should_trigger:
                # Send notification
                direction = "above" if alert.is_above else "below"
                price_change = ""
                if last_price:
                    change = current_price - last_price
                    change_pct = (change / last_price) * 100
                    price_change = f"\n📈 Price change: ${change:.2f} ({change_pct:+.2f}%)"
                
                message = f"🚨 <b>Price Alert!</b>\n\n"
                message += f"💰 {alert.crypto_symbol} is now ${current_price:.2f}\n"
                message += f"📊 This is {direction} your threshold of ${threshold:.2f}{price_change}\n\n"
                message += f"⏰ Alert triggered at {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')} UTC"
                
                # Always mark alert as triggered when price crosses threshold
                alert.triggered_at = datetime.now(timezone.utc)
                alert.is_active = False  # Deactivate after triggering
                
                # Try to send Telegram message
                telegram_success = telegram_service.send_message(alert.telegram_chat_id, message)
                
                if telegram_success:
                    app.logger.info(f"Alert triggered for {alert.crypto_symbol} - Price crossed threshold! Telegram sent.")
                else:
                    app.logger.warning(f"Alert triggered for {alert.crypto_symbol} - Price crossed threshold! Telegram failed.")
                
                db.session.commit()
            else:
                # Just update the last price without triggering
                db.session.commit()

# Initialize scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(
    func=check_alerts,
    trigger=IntervalTrigger(seconds=10),  # Check every 10 seconds for faster alerts
    id='check_alerts',
    name='Check cryptocurrency price alerts',
    replace_existing=True
)

if __name__ == '__main__':
    # Create database tables
    with app.app_context():
        db.create_all()
    
    # Start scheduler
    scheduler.start()
    
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    try:
        app.run(debug=True, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        scheduler.shutdown()
