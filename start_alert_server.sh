#!/bin/bash

# Startup script for Pulse Bengaluru Alert System

echo "🚀 Starting Pulse Bengaluru Alert System"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating example .env file..."
    cat > .env << EOL
# Gemini AI API Key
GOOGLE_API_KEY=your_gemini_api_key_here

# Firebase Configuration
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com/
FIREBASE_PROJECT_ID=your-project-id

# Reddit API (for scrapers)
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
EOL
    echo "❌ Please configure your .env file with the appropriate API keys and run again."
    exit 1
fi

echo "🔄 Starting Flask server for alerts API..."
python agent.py --server
