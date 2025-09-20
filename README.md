# 🚀 Crypto Price Alert Assistant

A comprehensive cryptocurrency price monitoring and alert system built for cybersecurity hackathons. This application provides real-time price tracking, automated Telegram notifications, and interactive charts with robust security features.

## 🌟 Features

### Core Functionality
- **Real-time Price Monitoring**: Track 10+ major cryptocurrencies
- **Telegram Notifications**: Instant alerts when price thresholds are crossed
- **Interactive Charts**: Live price charts with historical data from CoinGecko API
- **Alert Management**: Create, manage, and delete price alerts
- **Responsive Design**: Modern UI that works on all devices

### Security Features
- **Rate Limiting**: Prevents API abuse and DDoS attacks
- **Input Validation**: Sanitizes all user inputs
- **CORS Protection**: Secure cross-origin resource sharing
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy headers
- **Secure Configuration**: Environment-based secrets management
- **Error Handling**: Comprehensive error logging and handling

## 🛠️ Technology Stack

### Backend
- **Python 3.13+** with Flask framework
- **SQLAlchemy** for database management
- **SQLite** for data persistence
- **APScheduler** for background task scheduling
- **Requests** for API integrations
- **Flask-CORS** for cross-origin requests

### Frontend
- **React 18** with modern hooks
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Axios** for API communication
- **Lucide React** for icons

### APIs & Services
- **CoinGecko API** for cryptocurrency data
- **Telegram Bot API** for notifications
- **CoinMarketCap API** (optional, premium)

## 📋 Prerequisites

- Python 3.13 or higher
- Node.js 18 or higher
- npm or yarn package manager
- Telegram Bot Token (for notifications)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/KLEIEEECS-Bot3/XYZ.git
cd CyberSecurityHackathon
```

### 2. Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Copy environment template
cp env.example .env

# Edit .env file with your configuration
# Add your Telegram Bot Token and other settings
```

### 3. Frontend Setup
```bash
# Install Node.js dependencies
npm install

# Build the frontend
npm run build
```

### 4. Run the Application
```bash
# Start the Flask backend
python app.py

# In another terminal, start the React frontend
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## ⚙️ Configuration

### Environment Variables (.env)
```env
# Flask Configuration
FLASK_SECRET_KEY=your-secret-key-here
FLASK_ENV=development

# Telegram Bot Configuration
# Get your bot token from @BotFather on Telegram
TELEGRAM_BOT_TOKEN=your-telegram-bot-token-here

# Optional: CoinMarketCap API Key (for premium features)
COINMARKETCAP_API_KEY=your-coinmarketcap-api-key

# Note: TELEGRAM_CHAT_ID is no longer needed in .env
# Users will provide their chat ID through the web interface
```

### Telegram Bot Setup
1. Create a bot with [@BotFather](https://t.me/botfather)
2. Get your bot token and add it to `.env`
3. **No need to add chat ID to .env** - users will provide it through the web interface
4. Users can get their chat ID from [@userinfobot](https://t.me/userinfobot) when setting up alerts

## 📱 Usage

### Creating Price Alerts
1. Navigate to the **Alerts** page
2. Click **"+ Create Alert"**
3. Select cryptocurrency (BTC, ETH, ADA, etc.)
4. Set threshold price
5. Choose "Above" or "Below" condition
6. Enter your Telegram Chat ID
7. Click **"Create Alert"**

### Monitoring Prices
- **Dashboard**: View real-time prices for all supported cryptocurrencies
- **Charts**: Analyze price trends with interactive charts
- **Alerts**: Manage your active price alerts

### Telegram Notifications
When price thresholds are crossed, you'll receive notifications like:
```
🚨 CRYPTO ALERT 🚨

💰 BTC is now $65,420.00
📊 This is above your threshold of $60,000.00
📈 Price change: +8.5%
⏰ Alert triggered at 2025-09-20 14:30:15 UTC

🔔 Alert ID: #12345
```

## 🔧 API Endpoints

### Price Data
- `GET /api/prices?symbols[]=BTC&symbols[]=ETH` - Get current prices
- `GET /api/cryptos` - Get supported cryptocurrencies
- `GET /api/chart-data?symbol=BTC&days=7` - Get historical chart data

### Alert Management
- `GET /api/alerts?chat_id=123456` - Get user alerts
- `POST /api/alerts` - Create new alert
- `DELETE /api/alerts/{id}?chat_id=123456` - Delete alert

### System
- `GET /api/health` - Health check endpoint
- `POST /api/telegram/setup` - Setup Telegram integration

## 🛡️ Security Features

### Rate Limiting
- API endpoints protected with rate limiting
- Prevents abuse and ensures fair usage

### Input Validation
- All user inputs are validated and sanitized
- Prevents injection attacks

### CORS Protection
- Configured for secure cross-origin requests
- Prevents unauthorized access

### Database Security
- Parameterized queries prevent SQL injection
- Secure data storage and retrieval

### Error Handling
- Comprehensive error logging
- Graceful error handling without exposing sensitive information

## 📊 Monitoring & Logging

The application includes comprehensive logging:
- **Price monitoring**: Real-time price checks every 10 seconds
- **Alert triggers**: Detailed logging of alert activations
- **API requests**: All API calls are logged
- **Error tracking**: Detailed error logging for debugging

## 🚀 Deployment

### Production Deployment
1. Set `FLASK_ENV=production` in your environment
2. Use a production WSGI server (Gunicorn, uWSGI)
3. Set up a reverse proxy (Nginx)
4. Configure SSL certificates
5. Set up monitoring and logging

### Docker Deployment
```bash
# Build Docker image
docker build -t crypto-alert-assistant .

# Run container
docker run -p 5000:5000 crypto-alert-assistant
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Hackathon Features

This project was specifically designed for cybersecurity hackathons and includes:

- **Security-first approach**: Multiple layers of security protection
- **Real-time monitoring**: Live cryptocurrency price tracking
- **Professional UI/UX**: Modern, responsive design
- **Comprehensive documentation**: Detailed setup and usage instructions
- **Scalable architecture**: Built for production deployment
- **Error resilience**: Robust error handling and retry mechanisms

## 📞 Support

For support, email your-team@example.com or create an issue in the repository.

## 🙏 Acknowledgments

- [CoinGecko](https://coingecko.com) for cryptocurrency data API
- [Telegram](https://telegram.org) for notification services
- [Tailwind CSS](https://tailwindcss.com) for styling framework
- [React](https://reactjs.org) for frontend framework
- [Flask](https://flask.palletsprojects.com) for backend framework

---

**Built with ❤️ for Cybersecurity Hackathon 2024**
