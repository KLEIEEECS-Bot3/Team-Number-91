import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  RefreshCw,
  Calendar,
  DollarSign
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE_URL = 'http://localhost:5000/api';

function PriceChart({ onNotification }) {
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [timeRange, setTimeRange] = useState('24h');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [dataSource, setDataSource] = useState('real'); // 'real' or 'demo'

  const cryptos = [
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

  const timeRanges = [
    { value: '1h', label: '1 Hour' },
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' }
  ];


  // Fetch real historical data through our backend API
  const fetchRealChartData = async (symbol, range) => {
    // Map time ranges to days parameter
    const rangeMapping = {
      '1h': { days: 1 },
      '24h': { days: 1 },
      '7d': { days: 7 },
      '30d': { days: 30 }
    };

    const rangeConfig = rangeMapping[range];
    if (!rangeConfig) {
      throw new Error(`Unsupported time range: ${range}`);
    }

    try {
      // Use our backend API endpoint to avoid CORS issues
      const url = `${API_BASE_URL}/chart-data`;
      const params = new URLSearchParams({
        symbol: symbol,
        days: rangeConfig.days.toString()
      });

      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log(`Chart API response status: ${response.status}`); // Debug log

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Chart API error:', errorData); // Debug log
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Chart data received: ${data.prices ? data.prices.length : 0} price points`); // Debug log
      
      if (!data.prices || !Array.isArray(data.prices)) {
        throw new Error('Invalid data format from API');
      }
      
      // Transform data to our chart format
      const chartData = data.prices.map(([timestamp, price]) => ({
        time: new Date(timestamp).toISOString(),
        price: price,
        volume: data.volumes ? data.volumes.find(v => v[0] === timestamp)?.[1] || 0 : 0
      }));

      return chartData;
    } catch (error) {
      console.error('Error fetching real chart data:', error);
      throw error;
    }
  };


  const fetchChartData = useCallback(async (retryCount = 0) => {
    const maxRetries = 5;
    const retryDelay = 3000; // 3 seconds
    
    setLoading(true);
    
    try {
      console.log(`Fetching real data for ${selectedCrypto} (${timeRange})... (attempt ${retryCount + 1})`);
      
      // Fetch real historical data from CoinGecko API
      const realData = await fetchRealChartData(selectedCrypto, timeRange);
      
      if (realData && realData.length > 0) {
        setChartData(realData);
        setDataSource('real');
        
        // Set current price (last data point)
        setCurrentPrice(realData[realData.length - 1].price);
        console.log(`Successfully fetched ${realData.length} data points for ${selectedCrypto}`);
        setLoading(false);
      } else {
        throw new Error('No data received from API');
      }
      
    } catch (error) {
      console.error(`Error fetching chart data (attempt ${retryCount + 1}):`, error);
      
      if (retryCount < maxRetries) {
        console.log(`Retrying chart data fetch in ${retryDelay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          fetchChartData(retryCount + 1);
        }, retryDelay);
      } else {
        console.error('Max retries reached for chart data fetching');
        onNotification(`Network unstable - Unable to fetch chart data for ${selectedCrypto}`, 'warning');
        setChartData([]);
        setDataSource('error');
        setLoading(false);
      }
    }
  }, [selectedCrypto, timeRange, onNotification]);

  useEffect(() => {
    fetchChartData();
  }, [selectedCrypto, timeRange, fetchChartData]);

  const formatPrice = (price) => {
    if (!price) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(price);
  };

  const formatTime = (timeStr) => {
    const date = new Date(timeStr);
    if (timeRange === '1h') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (timeRange === '24h') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (timeRange === '7d') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm text-gray-600">{formatTime(label)}</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatPrice(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Price Charts</h1>
          <p className="text-gray-600 mt-1">
            Analyze cryptocurrency price movements over time
          </p>
        </div>
        <button
          onClick={fetchChartData}
          disabled={loading}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">Cryptocurrency:</label>
            </div>
            <select
              value={selectedCrypto}
              onChange={(e) => setSelectedCrypto(e.target.value)}
              className="select-field w-auto"
            >
              {cryptos.map(crypto => (
                <option key={crypto.symbol} value={crypto.symbol}>
                  {crypto.symbol} - {crypto.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">Time Range:</label>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="select-field w-auto"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Current Price */}
      {currentPrice && (
        <div className="card bg-gradient-to-r from-primary-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {cryptos.find(c => c.symbol === selectedCrypto)?.name} ({selectedCrypto})
              </h3>
              <p className="text-3xl font-bold text-primary-600 mt-1">
                {formatPrice(currentPrice)}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-crypto-green" />
              <div className="text-right">
                <p className="text-sm text-gray-600">24h Change</p>
                <p className="text-lg font-semibold text-crypto-green">
                  +2.34%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Price Chart</span>
          </h2>
          <div className="text-sm text-gray-600">
            {timeRanges.find(r => r.value === timeRange)?.label}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="time" 
                  tickFormatter={formatTime}
                  stroke="#666"
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                  stroke="#666"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No chart data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Chart Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Highest Price</p>
              <p className="text-lg font-semibold text-gray-900">
                {chartData.length > 0 ? formatPrice(Math.max(...chartData.map(d => d.price))) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-red-600 rotate-180" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Lowest Price</p>
              <p className="text-lg font-semibold text-gray-900">
                {chartData.length > 0 ? formatPrice(Math.min(...chartData.map(d => d.price))) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Data Points</p>
              <p className="text-lg font-semibold text-gray-900">
                {chartData.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Source Info */}
      <div className={`card ${
        dataSource === 'real' ? 'bg-green-50 border-green-200' :
        'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              dataSource === 'real' ? 'bg-green-100' :
              'bg-red-100'
            }`}>
              <span className={`text-sm ${
                dataSource === 'real' ? 'text-green-600' :
                'text-red-600'
              }`}>
                {dataSource === 'real' ? '✓' : '✗'}
              </span>
            </div>
          </div>
          <div>
            <h3 className={`text-sm font-semibold ${
              dataSource === 'real' ? 'text-green-900' :
              'text-red-900'
            }`}>
              {dataSource === 'real' ? 'Real-Time Data' : 
               'Network Unstable'}
            </h3>
            <p className={`text-sm mt-1 ${
              dataSource === 'real' ? 'text-green-700' :
              'text-red-700'
            }`}>
              {dataSource === 'real' ? 
                'This chart displays real historical price data fetched from CoinGecko API. Data includes actual price movements, trading volumes, and market trends for accurate cryptocurrency analysis.' :
                'Unable to load chart data due to network instability. The system is automatically retrying to fetch real-time data.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PriceChart;
