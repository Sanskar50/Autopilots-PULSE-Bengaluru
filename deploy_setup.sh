#!/bin/bash

# 🚀 Deployment Setup Script
echo "🚀 Setting up your application for deployment..."

# Update Frontend API URL
echo "📝 Updating frontend API configuration..."
cd frontend

# Create production environment file
cat > .env.production << EOF
VITE_API_URL=https://your-railway-app.railway.app
VITE_APP_TITLE=Pulse Bengaluru
EOF

echo "✅ Created .env.production file"

# Update MapContainer.tsx to use environment variables
echo "📝 Updating MapContainer.tsx..."

# Backup original file
cp src/components/MapContainer.tsx src/components/MapContainer.tsx.backup

# Update the API URL in MapContainer
sed -i 's|fetch("http://localhost:9000/feed")|fetch(`${import.meta.env.VITE_API_URL || "http://localhost:9000"}/feed`)|g' src/components/MapContainer.tsx

echo "✅ Updated MapContainer.tsx to use environment variables"

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Build frontend to check for errors
echo "🔨 Building frontend..."
npm run build

cd ..

# Update CORS in main.py
echo "📝 Updating CORS configuration in main.py..."
cp main.py main.py.backup

# Create updated CORS configuration
cat > cors_update.py << 'EOF'
import re

# Read the main.py file
with open('main.py', 'r') as f:
    content = f.read()

# Update CORS configuration
cors_pattern = r'allow_origins=\[".*?"\]'
new_cors = 'allow_origins=["https://your-app-name.vercel.app", "http://localhost:3000", "http://localhost:5173", "http://localhost:9000"]'

updated_content = re.sub(cors_pattern, new_cors, content)

# Write back to file
with open('main.py', 'w') as f:
    f.write(updated_content)

print("✅ Updated CORS configuration")
EOF

python cors_update.py
rm cors_update.py

# Create deployment files
echo "📝 Creating deployment configuration files..."

# Create Procfile for Heroku/Railway
cat > Procfile << EOF
web: uvicorn main:app --host 0.0.0.0 --port \$PORT
EOF

# Create railway.json
cat > railway.json << EOF
{
  "\$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port \$PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF

# Create Docker file (optional)
cat > Dockerfile << EOF
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

# Create .dockerignore
cat > .dockerignore << EOF
node_modules
frontend/node_modules
frontend/dist
.git
.env
*.pyc
__pycache__
.pytest_cache
.coverage
uploads/*
!uploads/.gitkeep
EOF

echo "✅ Created deployment configuration files"

# Test backend locally
echo "🧪 Testing backend..."
python -c "
import requests
import subprocess
import time
import os

# Start server in background
server = subprocess.Popen(['uvicorn', 'main:app', '--port', '8001'], 
                         stdout=subprocess.DEVNULL, 
                         stderr=subprocess.DEVNULL)

# Wait for server to start
time.sleep(3)

try:
    # Test API
    response = requests.get('http://localhost:8001/feed')
    if response.status_code == 200:
        print('✅ Backend API is working')
    else:
        print(f'❌ Backend API error: {response.status_code}')
except Exception as e:
    print(f'❌ Backend test failed: {e}')
finally:
    server.terminate()
"

echo ""
echo "🎉 Deployment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Deployment setup'"
echo "   git push origin main"
echo ""
echo "2. Deploy backend on Railway:"
echo "   - Go to railway.app"
echo "   - Connect your GitHub repo"
echo "   - Set environment variables from .env file"
echo ""
echo "3. Deploy frontend on Vercel:"
echo "   - Go to vercel.com"
echo "   - Connect your GitHub repo"
echo "   - Set root directory to 'frontend'"
echo "   - Add environment variables from frontend/.env.production"
echo ""
echo "4. Update frontend/.env.production with your Railway URL"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"
