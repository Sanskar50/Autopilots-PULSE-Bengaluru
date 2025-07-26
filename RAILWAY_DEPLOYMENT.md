# Railway Deployment Guide for Multiple Services

## Option 1: Single Service with Process Manager (Current Setup)

1. **Use the provided `start_servers.py`**
   - Procfile: `web: python start_servers.py`
   - Both servers run in one Railway service

## Option 2: Separate Railway Services (Recommended)

### Service 1: Main API Server

1. **Create Railway Project for Main API**
   ```bash
   # In your project root
   railway login
   railway new
   railway link
   ```

2. **Configure Main API Service**
   ```
   Procfile: web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

3. **Environment Variables for Main API**
   ```
   FIREBASE_DATABASE_URL=https://pulse-bengaluru-2933b-default-rtdb.firebaseio.com/
   FIREBASE_PROJECT_ID=pulse-bengaluru-2933b
   ```

4. **Deploy Main API**
   ```bash
   railway up
   ```

### Service 2: Agent Server

1. **Create Second Railway Project for Agent**
   ```bash
   # Create new directory for agent
   mkdir agent-service
   cd agent-service
   
   # Copy necessary files
   cp ../agent.py .
   cp ../requirements.txt .
   cp ../.env .
   
   railway login
   railway new
   railway link
   ```

2. **Create Agent Procfile**
   ```
   web: python agent.py
   ```

3. **Update agent.py for Railway**
   ```python
   # Add this to agent.py
   import os
   
   if __name__ == "__main__":
       port = int(os.environ.get("PORT", 5000))
       app.run(host="0.0.0.0", port=port, debug=False)
   ```

4. **Deploy Agent Service**
   ```bash
   railway up
   ```

## Option 3: Use Railway Services Feature

1. **railway.json configuration**
   ```json
   {
     "deploy": {
       "restartPolicyType": "always",
       "numReplicas": 1
     },
     "build": {
       "builder": "nixpacks"
     }
   }
   ```

2. **Create multiple services in one project**
   - Main API service
   - Agent service
   - Each with their own Procfile and configuration
