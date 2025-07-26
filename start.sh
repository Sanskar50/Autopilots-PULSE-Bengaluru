#!/bin/bash

# Production startup script for Autopilots
echo "🚀 Starting Autopilots in production mode..."

# Function to check if port is available
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Port $1 is already in use"
        return 1
    else
        echo "✅ Port $1 is available"
        return 0
    fi
}

# Check required ports
echo "🔍 Checking port availability..."
check_port 9000 || exit 1
check_port 5000 || exit 1

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please run ./deploy.sh first"
    exit 1
fi

echo "✅ Environment checks passed"

# Create logs directory
mkdir -p logs

# Start backend API
echo "🔧 Starting Backend API on port 9000..."
nohup uvicorn main:app --host 0.0.0.0 --port 9000 > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend started with PID: $BACKEND_PID"

# Wait a moment for backend to start
sleep 2

# Start agent server
echo "🤖 Starting Agent server on port 5000..."
nohup python agent.py > logs/agent.log 2>&1 &
AGENT_PID=$!
echo "✅ Agent started with PID: $AGENT_PID"

# Wait a moment for agent to start
sleep 2

# Start scrapers (optional)
echo "🕷️ Starting Scrapers..."
cd Scrapers
nohup python central_scraper.py > ../logs/scrapers.log 2>&1 &
SCRAPER_PID=$!
echo "✅ Scrapers started with PID: $SCRAPER_PID"
cd ..

# Save PIDs for cleanup
echo "$BACKEND_PID" > logs/backend.pid
echo "$AGENT_PID" > logs/agent.pid
echo "$SCRAPER_PID" > logs/scrapers.pid

echo ""
echo "🎉 Autopilots started successfully!"
echo ""
echo "📊 Service Status:"
echo "- Backend API: http://localhost:9000 (PID: $BACKEND_PID)"
echo "- Agent API: http://localhost:5000 (PID: $AGENT_PID)"
echo "- Scrapers: Running (PID: $SCRAPER_PID)"
echo ""
echo "📝 Logs available in logs/ directory"
echo "🛑 To stop all services, run: ./stop.sh"
echo ""
echo "🌐 Frontend files are in frontend/dist/"
echo "   Serve with: python -m http.server 3000 --directory frontend/dist"
echo "   Or use nginx/apache to serve the static files"
