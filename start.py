#!/usr/bin/env python3
"""
Crypto Price Alert Assistant - Startup Script
This script helps you get started with the application
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def print_banner():
    banner = """
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║        🔐 CRYPTO PRICE ALERT ASSISTANT 🔐                   ║
    ║                                                              ║
    ║        Cybersecurity Hackathon Project                      ║
    ║        Real-time Crypto Monitoring with Telegram Alerts     ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
    """
    print(banner)

def check_python():
    """Check if Python 3.7+ is available"""
    if sys.version_info < (3, 7):
        print("❌ Python 3.7 or higher is required")
        print(f"Current version: {sys.version}")
        return False
    print(f"✅ Python {sys.version.split()[0]} detected")
    return True

def check_node():
    """Check if Node.js is available"""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Node.js {result.stdout.strip()} detected")
            return True
        else:
            print("❌ Node.js not found")
            return False
    except FileNotFoundError:
        print("❌ Node.js not found. Please install Node.js 16+ from https://nodejs.org/")
        return False

def setup_backend():
    """Setup Python backend dependencies"""
    print("\n🔧 Setting up Python backend...")
    
    # Create virtual environment if it doesn't exist
    venv_path = Path("venv")
    if not venv_path.exists():
        print("Creating virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", "venv"])
    
    # Determine activation script based on OS
    if os.name == 'nt':  # Windows
        activate_script = "venv\\Scripts\\activate"
        python_exec = "venv\\Scripts\\python"
        pip_exec = "venv\\Scripts\\pip"
    else:  # Unix/Linux/macOS
        activate_script = "source venv/bin/activate"
        python_exec = "venv/bin/python"
        pip_exec = "venv/bin/pip"
    
    # Install requirements
    print("Installing Python dependencies...")
    subprocess.run([pip_exec, "install", "-r", "requirements.txt"])
    
    print("✅ Backend setup complete")
    return python_exec

def setup_frontend():
    """Setup React frontend dependencies"""
    print("\n🔧 Setting up React frontend...")
    
    # Install npm dependencies
    print("Installing Node.js dependencies...")
    subprocess.run(["npm", "install"])
    
    print("✅ Frontend setup complete")

def create_env_file():
    """Create .env file if it doesn't exist"""
    env_file = Path(".env")
    env_example = Path("env.example")
    
    if not env_file.exists() and env_example.exists():
        print("\n📝 Creating .env file...")
        
        with open(env_example, 'r') as f:
            content = f.read()
        
        with open(env_file, 'w') as f:
            f.write(content)
        
        print("✅ .env file created from template")
        print("⚠️  Please edit .env file with your API keys before running the application")
    elif env_file.exists():
        print("✅ .env file already exists")
    else:
        print("⚠️  No .env template found, creating basic .env file...")
        
        basic_env = """FLASK_SECRET_KEY=dev-secret-key-change-in-production
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id
COINMARKETCAP_API_KEY=your-coinmarketcap-api-key
FLASK_ENV=development
"""
        with open(env_file, 'w') as f:
            f.write(basic_env)
        
        print("✅ Basic .env file created")
        print("⚠️  Please edit .env file with your API keys")

def show_next_steps():
    """Show next steps to the user"""
    print("\n" + "="*60)
    print("🚀 SETUP COMPLETE! Next steps:")
    print("="*60)
    print()
    print("1. 📝 Edit .env file with your API keys:")
    print("   - Get Telegram Bot Token: https://t.me/BotFather")
    print("   - Get CoinMarketCap API Key: https://coinmarketcap.com/api/")
    print("   - Get your Telegram Chat ID: Message @userinfobot")
    print()
    print("2. 🔧 Start the backend server:")
    if os.name == 'nt':  # Windows
        print("   venv\\Scripts\\python app.py")
    else:  # Unix/Linux/macOS
        print("   source venv/bin/activate && python app.py")
    print()
    print("3. 🌐 Start the frontend (in a new terminal):")
    print("   npm start")
    print()
    print("4. 📱 Open your browser to http://localhost:3000")
    print()
    print("5. 🔔 Set up Telegram in the Settings tab")
    print()
    print("📚 For more information, check the README.md file")
    print("="*60)

def main():
    print_banner()
    
    # Check requirements
    if not check_python():
        return
    
    if not check_node():
        print("\n⚠️  Node.js is required for the frontend. Please install it first.")
        return
    
    # Setup components
    try:
        python_exec = setup_backend()
        setup_frontend()
        create_env_file()
        show_next_steps()
        
        print("\n🎉 Crypto Price Alert Assistant is ready to go!")
        
    except KeyboardInterrupt:
        print("\n\n❌ Setup cancelled by user")
    except Exception as e:
        print(f"\n❌ Setup failed: {e}")
        print("Please check the error and try again")

if __name__ == "__main__":
    main()
