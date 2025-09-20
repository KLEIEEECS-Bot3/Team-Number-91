import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle,
  RefreshCw,
  Bell,
  Shield,
  Zap
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

function Dashboard({ telegramChatId, onNotification }) {
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);

  const popularCryptos = [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'ADA', name: 'Cardano' },
    { symbol: 'DOT', name: 'Polkadot' },
    { symbol: 'LINK', name: 'Chainlink' },
    { symbol: 'UNI', name: 'Uniswap' },
    { symbol: 'AAVE', name: 'Aave' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'MATIC', name: 'Polygon' },
    { symbol: 'AVAX', name: 'Avalanche' }
  ];

  const fetchPrices = async (retryCount = 0) => {
    const maxRetries = 5;
    const retryDelay = 2000; // 2 seconds
    
    try {
      const symbols = popularCryptos.map(crypto => crypto.symbol);
      const response = await axios.get(`${API_BASE_URL}/prices`, {
        params: { 'symbols[]': symbols }
      });
      console.log('Fetched prices:', response.data); // Debug log
      setCryptoPrices(response.data);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error(`Error fetching prices (attempt ${retryCount + 1}):`, error);
      
      if (retryCount < maxRetries) {
        console.log(`Retrying in ${retryDelay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          fetchPrices(retryCount + 1);
        }, retryDelay);
      } else {
        console.error('Max retries reached for price fetching');
        onNotification('Network unstable - Unable to fetch cryptocurrency prices', 'warning');
        setLoading(false);
      }
    }
  };

  const fetchAlerts = async () => {
    if (!telegramChatId) return;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/alerts`, {
        params: { chat_id: telegramChatId }
      });
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  useEffect(() => {
    fetchPrices();
    fetchAlerts();
    
    // Refresh prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [telegramChatId]);

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(price);
  };

  const getPriceChangeColor = (price) => {
    // Mock price change logic - in real app, you'd compare with previous prices
    return Math.random() > 0.5 ? 'text-crypto-green' : 'text-crypto-red';
  };

  const getPriceChangeIcon = (price) => {
    // Mock price change logic
    return Math.random() > 0.5 ? TrendingUp : TrendingDown;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Cryptos</p>
              <p className="text-2xl font-bold text-gray-900">{popularCryptos.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Bell className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Security Status</p>
              <p className="text-2xl font-bold text-green-600">Secure</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monitoring</p>
              <p className="text-2xl font-bold text-green-600">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Price Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Cryptocurrency Prices</h2>
          <div className="flex items-center space-x-4">
            {lastUpdate && (
              <p className="text-sm text-gray-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            )}
            <button
              onClick={fetchPrices}
              className="flex items-center space-x-2 btn-secondary"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {popularCryptos.map(crypto => {
            const price = cryptoPrices[crypto.symbol];
            const PriceIcon = getPriceChangeIcon(price);
            const priceChangeColor = getPriceChangeColor(price);

            return (
              <div key={crypto.symbol} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{crypto.symbol}</h3>
                    <p className="text-sm text-gray-600">{crypto.name}</p>
                  </div>
                  <PriceIcon className={`w-5 h-5 ${priceChangeColor}`} />
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {formatPrice(price)}
                </div>
                <div className={`text-sm ${priceChangeColor} mt-1`}>
                  {Math.random() > 0.5 ? '+' : ''}{(Math.random() * 10 - 5).toFixed(2)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Setup Reminder */}
      {!telegramChatId && (
        <div className="card bg-orange-50 border-orange-200">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-orange-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-orange-900">
                Telegram Setup Required
              </h3>
              <p className="text-orange-700 mt-1">
                To receive price alerts, please set up your Telegram chat ID in the Settings tab.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Active Alerts</h2>
          <div className="space-y-3">
            {alerts.slice(0, 5).map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {alert.crypto_symbol} {alert.is_above ? 'above' : 'below'} ${alert.threshold_price}
                    </p>
                    <p className="text-sm text-gray-600">
                      Created {new Date(alert.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-green-600 font-medium">Active</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
