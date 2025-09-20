import React from 'react';
import { Shield, Zap, TrendingUp } from 'lucide-react';

function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-primary-600 to-crypto-green rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Crypto Price Alert Assistant
              </h1>
              <p className="text-sm text-gray-500">
                Secure • Real-time • Telegram Notifications
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <Zap className="w-4 h-4 text-crypto-orange" />
              <span>Real-time monitoring</span>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <TrendingUp className="w-4 h-4 text-crypto-green" />
              <span>Price alerts active</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
