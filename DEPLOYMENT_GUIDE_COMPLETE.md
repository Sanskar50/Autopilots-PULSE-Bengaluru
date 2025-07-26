# 🚀 Complete Free Deployment Guide for Autopilots

## Strategy: Separate Services (Recommended for Railway)

You need to deploy 2 backend services and 1 frontend. Here's the optimal approach:

### 📋 Prerequisites
- Git repository with your code
- Railway account (railway.app)
- Vercel account (vercel.com)
- Firebase project setup

---

## 🔧 Step 1: Deploy Main API on Railway

### 1.1 Prepare Main API Service
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login
```

### 1.2 Create Main API Service
```bash
# In your project root directory
railway new
# Choose: "Deploy from GitHub repo" or "Empty Project"
# Name: autopilots-main-api

# Link your current directory
railway link
```

### 1.3 Configure Main API
```bash
# Copy the main API Procfile
cp Procfile.main Procfile

# Your Procfile should contain:
# web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### 1.4 Set Environment Variables for Main API
In Railway dashboard or CLI:
```bash
railway variables set FIREBASE_DATABASE_URL="https://pulse-bengaluru-2933b-default-rtdb.firebaseio.com/"
railway variables set FIREBASE_PROJECT_ID="pulse-bengaluru-2933b"
railway variables set FIREBASE_API_KEY="your_api_key"
railway variables set FIREBASE_AUTH_DOMAIN="pulse-bengaluru-2933b.firebaseapp.com"
```

### 1.5 Deploy Main API
```bash
railway up
# Your main API will be available at: https://your-app.railway.app
```

---

## 🤖 Step 2: Deploy Agent Service on Railway

### 2.1 Create Second Railway Service
```bash
# Create new Railway project for Agent
railway new
# Name: autopilots-agent
railway link
```

### 2.2 Configure Agent Service
```bash
# Copy the agent Procfile
cp Procfile.agent Procfile

# Your Procfile should contain:
# web: python agent.py --server
```

### 2.3 Set Environment Variables for Agent
```bash
railway variables set FIREBASE_DATABASE_URL="https://pulse-bengaluru-2933b-default-rtdb.firebaseio.com/"
railway variables set FIREBASE_PROJECT_ID="pulse-bengaluru-2933b"
railway variables set GOOGLE_API_KEY="your_google_ai_api_key"
railway variables set REDDIT_CLIENT_ID="your_reddit_client_id"
railway variables set REDDIT_CLIENT_SECRET="your_reddit_client_secret"
```

### 2.4 Deploy Agent Service
```bash
railway up
# Your agent API will be available at: https://your-agent.railway.app
```

---

## 🎨 Step 3: Deploy Frontend on Vercel

### 3.1 Prepare Frontend
```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login
```

### 3.2 Configure Frontend Environment
Create `frontend/.env.production`:
```bash
VITE_API_URL=https://your-main-api.railway.app
VITE_AGENT_URL=https://your-agent.railway.app
```

### 3.3 Update Frontend Code
Update `frontend/src/components/MapContainer.tsx`:
```typescript
// Replace localhost URLs with environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

// In your fetch call
fetch(`${API_URL}/feed`)
```

### 3.4 Deploy to Vercel
```bash
# Deploy from frontend directory
vercel --prod

# Or connect your GitHub repo for automatic deployments
```

---

## 🔧 Alternative: Single Railway Service

If you prefer one Railway service for both backend APIs:

### Use Process Manager Approach
```bash
# Use the combined Procfile
cp Procfile Procfile.backup
echo "web: python start_servers.py" > Procfile

# Deploy
railway up
```

This runs both servers in one Railway service but uses more resources.

---

## 🌐 Step 4: Update CORS and URLs

### 4.1 Update main.py CORS settings
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend.vercel.app",
        "http://localhost:3000",  # For development
        "https://*.vercel.app",   # For preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 4.2 Update agent.py CORS settings
```python
CORS(app, origins=[
    "https://your-frontend.vercel.app",
    "http://localhost:3000",
    "https://*.vercel.app"
])
```

---

## 📊 Step 5: Test Your Deployment

### 5.1 Test APIs
- Main API: `https://your-main-api.railway.app/feed`
- Agent API: `https://your-agent.railway.app/api/alerts`
- API Docs: `https://your-main-api.railway.app/docs`

### 5.2 Test Frontend
- Frontend: `https://your-frontend.vercel.app`
- Check browser console for any CORS or API errors

### 5.3 Monitor Logs
```bash
# Railway logs
railway logs --tail

# Vercel logs
vercel logs
```

---

## 💰 Free Tier Limits & Tips

### Railway Free Tier:
- $5 credit per month (resets monthly)
- ~500 hours execution time
- 1GB RAM per service
- 1GB disk space per service

### Vercel Free Tier:
- 100GB bandwidth per month
- 6000 build minutes per month
- Unlimited static sites

### Optimization Tips:
1. **Use 2 separate Railway services** (Main API + Agent)
2. **Optimize your code** to reduce CPU usage
3. **Monitor usage** in Railway dashboard
4. **Use efficient database queries**
5. **Implement rate limiting** if needed

---

## 🚨 Troubleshooting Guide

### Common Issues:

#### 1. Port Binding Errors
```python
# Make sure both main.py and agent.py use PORT environment variable
port = int(os.environ.get("PORT", 9000))  # main.py
port = int(os.environ.get("PORT", 5000))  # agent.py
```

#### 2. CORS Errors
```python
# Update CORS origins with your actual Vercel URL
allow_origins=["https://your-actual-vercel-url.vercel.app"]
```

#### 3. Environment Variables Not Loading
- Check Railway dashboard → Variables tab
- Ensure all required variables are set
- Restart the service after adding variables

#### 4. Build Failures
```bash
# Check Python version (Railway uses Python 3.9+)
# Verify requirements.txt has all dependencies
# Check Railway build logs for specific errors
```

#### 5. Firebase Connection Issues
- Verify Firebase database URL
- Check Firebase security rules
- Ensure all Firebase config variables are set

### Debugging Commands:
```bash
# Check Railway service status
railway status

# View real-time logs
railway logs --tail

# Check build logs
railway logs --build

# Redeploy if needed
railway up --detach
```

---

## 📝 Final Checklist

### Pre-Deployment:
- [ ] All code committed to Git
- [ ] requirements.txt updated with all dependencies
- [ ] Firebase project configured
- [ ] Environment variables prepared

### Railway Deployment:
- [ ] Main API service deployed and running
- [ ] Agent service deployed and running
- [ ] All environment variables configured
- [ ] Services responding to health checks

### Vercel Deployment:
- [ ] Frontend built successfully
- [ ] Environment variables configured
- [ ] Domain working correctly

### Testing:
- [ ] API endpoints responding correctly
- [ ] Frontend loads without errors
- [ ] Map displays reports from Firebase
- [ ] Form submissions work
- [ ] Agent generates alerts

### URLs to Save:
- Main API: `https://your-main-api.railway.app`
- Agent API: `https://your-agent.railway.app`
- Frontend: `https://your-frontend.vercel.app`

---

## 🎉 Success!

Your Autopilots application is now deployed and accessible worldwide for free! 

**Total monthly costs: $0** (within free tier limits)

### What's Deployed:
1. ✅ **Main API Server** - Handles reports, file uploads, Firebase integration
2. ✅ **Agent AI Server** - Generates intelligent alerts using Google AI
3. ✅ **Frontend Web App** - Interactive map and dashboard
4. ✅ **Firebase Database** - Real-time data storage

### Next Steps:
- Monitor usage in Railway dashboard
- Set up custom domains (optional)
- Add monitoring and alerting
- Scale up when needed
