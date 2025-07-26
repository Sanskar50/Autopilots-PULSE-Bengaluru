#!/bin/bash

# Autopilots Deployment Script
echo "🚀 Starting Autopilots deployment setup..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup Python environment
echo "📦 Setting up Python environment..."
python3 -m pip install --upgrade pip

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo "✅ Python dependencies installed"

# Setup Frontend
echo "🎨 Setting up Frontend..."
cd frontend

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

echo "✅ Frontend dependencies installed"

# Build frontend for production
echo "🔨 Building frontend for production..."
npm run build

echo "✅ Frontend built successfully"

cd ..

# Setup environment files
echo "⚙️ Setting up environment configuration..."

if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "❗ Please edit .env file with your Firebase credentials"
fi

# Create uploads directory
mkdir -p uploads

# Setup Scrapers environment
echo "⚙️ Setting up Scrapers environment..."
if [ ! -f "Scrapers/.env" ]; then
    echo "📝 Creating Scrapers/.env file..."
    cp .env Scrapers/.env
fi

echo "✅ Environment setup complete"

# Display final instructions
echo ""
echo "🎉 Deployment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your Firebase credentials"
echo "2. Start the backend server: python main.py"
echo "3. Start the agent server: python agent.py"
echo "4. Start the scrapers: cd Scrapers && python central_scraper.py"
echo "5. Frontend is built and ready for serving"
echo ""
echo "🔧 Development mode:"
echo "- Backend: uvicorn main:app --reload --port 9000"
echo "- Frontend: cd frontend && npm run dev"
echo "- Agent: python agent.py"
echo ""
echo "🌐 Production URLs:"
echo "- Backend API: http://localhost:9000"
echo "- Agent API: http://localhost:5000"
echo "- Frontend: Serve frontend/dist/ with a web server"
