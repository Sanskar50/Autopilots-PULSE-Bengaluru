# Autopilots Deployment Configuration

## Prerequisites
- Python 3.8+
- Node.js 18+
- Git

## Environment Setup

### 1. Clone and Setup
```bash
git clone <your-repo>
cd Autopilots
chmod +x deploy.sh
./deploy.sh
```

### 2. Configure Environment Variables
Edit `.env` file with your Firebase credentials:
```bash
# Firebase Configuration
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com/
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Reddit API (optional)
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=your_app_name

# Google AI (for agent.py)
GOOGLE_API_KEY=your_google_ai_api_key
```

## Running the Application

### Development Mode
```bash
# Terminal 1: Backend API
uvicorn main:app --reload --port 9000

# Terminal 2: Agent Server
python agent.py

# Terminal 3: Frontend Development
cd frontend && npm run dev

# Terminal 4: Scrapers (optional)
cd Scrapers && python central_scraper.py
```

### Production Mode
```bash
# Backend API
uvicorn main:app --host 0.0.0.0 --port 9000

# Agent Server
python agent.py

# Frontend (serve built files)
# Use nginx, apache, or any static file server to serve frontend/dist/

# Scrapers (background service)
nohup python Scrapers/central_scraper.py &
```

## Docker Deployment (Optional)

### Backend Dockerfile
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 9000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "9000"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine AS build

WORKDIR /app
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

## API Endpoints

### Main API (Port 9000)
- `POST /submit` - Submit new report
- `GET /feed` - Get all reports
- `GET /feed/firebase` - Get reports from Firebase
- `GET /report/{id}` - Get specific report
- `DELETE /report/firebase/{key}` - Delete report

### Agent API (Port 5000)
- `POST /api/start-agent` - Start AI agent analysis
- `GET /api/alerts` - Get generated alerts

## Firebase Setup
1. Create Firebase project
2. Enable Realtime Database
3. Set database rules for read/write access
4. Get configuration from Project Settings
5. Update `.env` file with credentials

## Monitoring and Logs
- Backend logs: Check uvicorn output
- Agent logs: Check agent.py output
- Scraper logs: Check Scrapers/ output files
- Frontend logs: Browser developer console

## Troubleshooting
- Ensure all ports (9000, 5000, 3000) are available
- Check Firebase credentials and database rules
- Verify Google AI API key for agent functionality
- Check network connectivity for scrapers
