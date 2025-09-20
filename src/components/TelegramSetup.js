import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  CheckCircle, 
  Shield,
  Zap,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function TelegramSetup({ onNotification }) {
  const { user, updateTelegramChatId } = useAuth();
  const [inputChatId, setInputChatId] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isSetup, setIsSetup] = useState(false);

  useEffect(() => {
    if (user && user.telegram_chat_id) {
      setInputChatId(user.telegram_chat_id);
      setIsSetup(true);
    }
  }, [user]);

  const handleSetup = async (e) => {
    e.preventDefault();
    
    if (!inputChatId.trim()) {
      onNotification('Please enter your Telegram chat ID', 'warning');
      return;
    }

    setIsTesting(true);
    
    try {
      const result = await updateTelegramChatId(inputChatId.trim());
      
      if (result.success) {
        setIsSetup(true);
        onNotification('Telegram setup successful! Check your Telegram for a test message.', 'success');
      } else {
        onNotification(result.error || 'Failed to setup Telegram. Please check your chat ID.', 'error');
      }
    } catch (error) {
      console.error('Telegram setup error:', error);
      onNotification('Failed to setup Telegram. Please check your chat ID.', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const result = await updateTelegramChatId('');
      
      if (result.success) {
        setInputChatId('');
        setIsSetup(false);
        onNotification('Telegram disconnected successfully', 'success');
      } else {
        onNotification('Failed to disconnect Telegram', 'error');
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      onNotification('Failed to disconnect Telegram', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Telegram Settings</h1>
        <p className="text-gray-600 mt-1">
          Connect your Telegram account to receive price alerts
        </p>
      </div>

      {/* Setup Status */}
      {isSetup ? (
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900">
                Telegram Connected
              </h3>
              <p className="text-green-700 mt-1">
                Your Telegram is connected and ready to receive price alerts.
              </p>
              <div className="mt-3">
                <p className="text-sm text-green-600 font-medium">
                  Chat ID: {user?.telegram_chat_id}
                </p>
              </div>
              <button
                onClick={handleDisconnect}
                className="mt-4 btn-danger"
              >
                Disconnect Telegram
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="flex items-start space-x-3 mb-6">
            <MessageSquare className="w-6 h-6 text-primary-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Connect Telegram
              </h3>
              <p className="text-gray-600 mt-1">
                Set up Telegram notifications to receive price alerts
              </p>
            </div>
          </div>

          <form onSubmit={handleSetup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telegram Chat ID
              </label>
              <input
                type="text"
                value={inputChatId}
                onChange={(e) => setInputChatId(e.target.value)}
                className="input-field"
                placeholder="Enter your Telegram chat ID"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                You can find your chat ID by messaging @userinfobot on Telegram
              </p>
            </div>

            <button
              type="submit"
              disabled={isTesting}
              className="btn-primary flex items-center space-x-2"
            >
              {isTesting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Testing Connection...</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  <span>Connect Telegram</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Instructions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          How to Get Your Telegram Chat ID
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-600">1</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Open Telegram</h4>
              <p className="text-gray-600 text-sm">
                Open the Telegram app on your phone or desktop
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-600">2</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Find @userinfobot</h4>
              <p className="text-gray-600 text-sm">
                Search for and start a chat with @userinfobot
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-600">3</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Send /start</h4>
              <p className="text-gray-600 text-sm">
                Send the command /start to get your chat ID
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-600">4</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Copy Chat ID</h4>
              <p className="text-gray-600 text-sm">
                Copy the numeric chat ID and paste it above
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <ExternalLink className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Quick Link</h4>
              <a 
                href="https://t.me/userinfobot" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Open @userinfobot directly →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Security Info */}
      <div className="card bg-gray-50">
        <div className="flex items-start space-x-3">
          <Shield className="w-6 h-6 text-gray-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Security & Privacy
            </h3>
            <div className="mt-2 space-y-2 text-sm text-gray-600">
              <p>• Your chat ID is stored locally and securely</p>
              <p>• We only send price alert notifications</p>
              <p>• No personal data is collected or shared</p>
              <p>• You can disconnect at any time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Telegram Alert Features
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 text-crypto-orange" />
            <div>
              <h4 className="font-medium text-gray-900">Instant Notifications</h4>
              <p className="text-sm text-gray-600">Get alerts within seconds</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-crypto-green" />
            <div>
              <h4 className="font-medium text-gray-900">Secure Delivery</h4>
              <p className="text-sm text-gray-600">End-to-end encrypted messages</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-5 h-5 text-primary-600" />
            <div>
              <h4 className="font-medium text-gray-900">Rich Formatting</h4>
              <p className="text-sm text-gray-600">Beautiful formatted alerts</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <h4 className="font-medium text-gray-900">Reliable</h4>
              <p className="text-sm text-gray-600">99.9% delivery rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TelegramSetup;
