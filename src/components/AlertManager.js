import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  Bell, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

function AlertManager({ onNotification }) {
  const { token, user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    crypto_symbol: '',
    threshold_price: '',
    is_above: true
  });

  const fetchCryptos = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cryptos`);
      setCryptos(response.data);
    } catch (error) {
      console.error('Error fetching cryptos:', error);
      onNotification('Failed to fetch cryptocurrency list', 'error');
    } finally {
      setLoading(false);
    }
  }, [onNotification]);

  const fetchAlerts = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/alerts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      onNotification('Failed to fetch alerts', 'error');
    }
  }, [token, onNotification]);

  useEffect(() => {
    fetchCryptos();
    if (token) {
      fetchAlerts();
    } else {
      setLoading(false);
    }
  }, [token, fetchCryptos, fetchAlerts]);

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    
    if (!token) {
      onNotification('Please log in to create alerts', 'warning');
      return;
    }

    try {
      const alertData = {
        ...newAlert,
        threshold_price: parseFloat(newAlert.threshold_price)
      };

      const response = await axios.post(`${API_BASE_URL}/alerts`, alertData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setAlerts(prev => [response.data.alert, ...prev]);
      setNewAlert({ crypto_symbol: '', threshold_price: '', is_above: true });
      setShowCreateForm(false);
      
      onNotification('Alert created successfully!', 'success');
    } catch (error) {
      console.error('Error creating alert:', error);
      onNotification(error.response?.data?.error || 'Failed to create alert', 'error');
    }
  };

  const handleDeleteAlert = async (alertId) => {
    if (!token) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/alerts/${alertId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      onNotification('Alert deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting alert:', error);
      onNotification('Failed to delete alert', 'error');
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Price Alerts</h1>
          <p className="text-gray-600 mt-1">
            Manage your cryptocurrency price notifications
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Alert</span>
        </button>
      </div>

      {/* Setup Warning */}
      {!user?.telegram_chat_id && (
        <div className="card bg-orange-50 border-orange-200">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-orange-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-orange-900">
                Telegram Setup Required
              </h3>
              <p className="text-orange-700 mt-1">
                You need to set up your Telegram chat ID in Settings before creating alerts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create Alert Form */}
      {showCreateForm && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Create New Alert</h2>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleCreateAlert} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cryptocurrency
                </label>
                <select
                  value={newAlert.crypto_symbol}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, crypto_symbol: e.target.value }))}
                  className="select-field"
                  required
                >
                  <option value="">Select a cryptocurrency</option>
                  {cryptos.map(crypto => (
                    <option key={crypto.symbol} value={crypto.symbol}>
                      {crypto.symbol} - {crypto.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Threshold Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newAlert.threshold_price}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, threshold_price: e.target.value }))}
                  className="input-field"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert When Price Goes
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setNewAlert(prev => ({ ...prev, is_above: true }))}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg border transition-colors ${
                      newAlert.is_above
                        ? 'bg-green-100 border-green-500 text-green-700'
                        : 'bg-gray-100 border-gray-300 text-gray-700'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Above</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAlert(prev => ({ ...prev, is_above: false }))}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg border transition-colors ${
                      !newAlert.is_above
                        ? 'bg-red-100 border-red-500 text-red-700'
                        : 'bg-gray-100 border-gray-300 text-gray-700'
                    }`}
                  >
                    <TrendingDown className="w-4 h-4" />
                    <span>Below</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button type="submit" className="btn-primary">
                Create Alert
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Alerts List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Alerts ({alerts.length})
          </h2>
          {alerts.length > 0 && (
            <button
              onClick={fetchAlerts}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Refresh
            </button>
          )}
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first price alert to get notified when cryptocurrencies reach your target prices.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
              disabled={!user?.telegram_chat_id}
            >
              Create Your First Alert
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">
                        {alert.crypto_symbol}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        alert.is_above
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {alert.is_above ? (
                          <>
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Above
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-3 h-3 mr-1" />
                            Below
                          </>
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Alert when price goes {alert.is_above ? 'above' : 'below'} ${alert.threshold_price}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Created {new Date(alert.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    alert.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {alert.is_active ? 'Active' : 'Triggered'}
                  </span>
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="Delete alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AlertManager;
