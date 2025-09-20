#!/usr/bin/env python3
"""
Telegram Bot Test Script
This script helps you test your Telegram bot connection and find your chat ID.
"""

import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')

def test_bot_info():
    """Test if bot token is valid"""
    print("🤖 Testing Bot Token...")
    try:
        response = requests.get(f'https://api.telegram.org/bot{BOT_TOKEN}/getMe')
        if response.status_code == 200:
            bot_info = response.json()
            if bot_info['ok']:
                print(f"✅ Bot is active: {bot_info['result']['first_name']} (@{bot_info['result']['username']})")
                return True
            else:
                print(f"❌ Bot error: {bot_info}")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

def test_chat_id(chat_id):
    """Test sending message to specific chat ID"""
    print(f"\n📱 Testing Chat ID: {chat_id}")
    try:
        response = requests.post(
            f'https://api.telegram.org/bot{BOT_TOKEN}/sendMessage',
            data={
                'chat_id': chat_id,
                'text': '🔔 Test message from Crypto Price Alert Assistant!\n\nIf you receive this, your chat ID is working correctly.'
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            if result['ok']:
                print(f"✅ Message sent successfully!")
                print(f"   Chat: {result['result']['chat']['first_name']} ({result['result']['chat']['type']})")
                return True
            else:
                print(f"❌ Telegram API error: {result}")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

def main():
    print("🚀 Telegram Bot Connection Test")
    print("=" * 40)
    
    if not BOT_TOKEN or BOT_TOKEN == 'your-telegram-bot-token':
        print("❌ No bot token found in .env file")
        print("   Please add TELEGRAM_BOT_TOKEN to your .env file")
        return
    
    # Test bot info
    if not test_bot_info():
        return
    
    # Test with your known working chat ID
    print(f"\n🧪 Testing with known chat ID...")
    test_chat_id('5045738264')
    
    # Ask user for their chat ID
    print(f"\n" + "=" * 40)
    print("📝 To test your own chat ID:")
    print("1. Start a chat with @Cryptoshribot")
    print("2. Send any message to the bot")
    print("3. Get your chat ID from @userinfobot")
    print("4. Enter your chat ID below (or press Enter to skip)")
    
    user_chat_id = input("\nEnter your chat ID: ").strip()
    if user_chat_id:
        test_chat_id(user_chat_id)

if __name__ == "__main__":
    main()
