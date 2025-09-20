import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Bell, 
  Settings, 
  Shield, 
  Zap,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AlertManager from './components/AlertManager';
import TelegramSetup from './components/TelegramSetup';
import PriceChart from './components/PriceChart';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Load saved Telegram chat ID
    const savedChatId = localStorage.getItem('telegramChatId');
    if (savedChatId) {
      setTelegramChatId(savedChatId);
    }
  }, []);

  const addNotification = (message, type = 'info') => {
    // Only show success and info notifications, filter out errors
    if (type === 'error') {
      return; // Don't show error notifications
    }
    
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep last 5 notifications
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'chart', label: 'Charts', icon: Zap },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Notification Area */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`flex items-center p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 ${
              notification.type === 'success' ? 'bg-green-500 text-white' :
              notification.type === 'error' ? 'bg-red-500 text-white' :
              notification.type === 'warning' ? 'bg-orange-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            {notification.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
            {notification.type === 'error' && <X className="w-5 h-5 mr-2" />}
            {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 mr-2" />}
            <span className="flex-1 text-sm">{notification.message}</span>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 hover:bg-white hover:bg-opacity-20 rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {activeTab === 'dashboard' && (
          <Dashboard 
            telegramChatId={telegramChatId}
            onNotification={addNotification}
          />
        )}
        
        {activeTab === 'alerts' && (
          <AlertManager 
            telegramChatId={telegramChatId}
            onNotification={addNotification}
          />
        )}
        
        {activeTab === 'chart' && (
          <PriceChart 
            onNotification={addNotification}
          />
        )}
        
        {activeTab === 'settings' && (
          <TelegramSetup 
            telegramChatId={telegramChatId}
            setTelegramChatId={setTelegramChatId}
            onNotification={addNotification}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-crypto-green" />
              <span className="text-lg font-bold">Crypto Price Alert Assistant</span>
            </div>
            <div className="text-sm text-gray-400">
              Built with security in mind • Cybersecurity Hackathon 2024
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
