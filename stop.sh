#!/bin/bash

# Stop all Autopilots services
echo "🛑 Stopping Autopilots services..."

# Function to stop service by PID file
stop_service() {
    local service_name=$1
    local pid_file="logs/$service_name.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo "🛑 Stopping $service_name (PID: $pid)..."
            kill "$pid"
            rm "$pid_file"
            echo "✅ $service_name stopped"
        else
            echo "⚠️ $service_name process not found"
            rm "$pid_file"
        fi
    else
        echo "⚠️ No PID file found for $service_name"
    fi
}

# Stop all services
stop_service "backend"
stop_service "agent"
stop_service "scrapers"

# Kill any remaining processes on the ports
echo "🔍 Checking for remaining processes..."

# Kill processes on port 9000 (backend)
if lsof -Pi :9000 -sTCP:LISTEN -t >/dev/null ; then
    echo "🛑 Killing remaining processes on port 9000..."
    lsof -Pi :9000 -sTCP:LISTEN -t | xargs kill -9
fi

# Kill processes on port 5000 (agent)
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo "🛑 Killing remaining processes on port 5000..."
    lsof -Pi :5000 -sTCP:LISTEN -t | xargs kill -9
fi

echo ""
echo "✅ All Autopilots services stopped"
echo "📝 Logs are preserved in logs/ directory"
