# 🚀 Complete Free Deployment Guide

## Overview
This guide will help you deploy your full-stack application for FREE using:
- **Backend**: Railway (Free tier: 500 hours/month, $5 credit)
- **Frontend**: Vercel (Free tier: unlimited static sites)
- **Database**: Firebase Realtime Database (Free tier: 1GB storage, 10GB transfer)

## Prerequisites
- GitHub account
- Railway account (sign up at railway.app)
- Vercel account (sign up at vercel.com)
- Firebase project (console.firebase.google.com)

---

## 📋 Step 1: Prepare Your Code

### 1.1 Update Frontend API URL
Create `/frontend/.env.production`:
```env
VITE_API_URL=https://your-app-name.railway.app
VITE_APP_TITLE=Pulse Bengaluru
```

### 1.2 Update MapContainer API calls
In `/frontend/src/components/MapContainer.tsx`, update the fetch URL:
```typescript
// Replace hardcoded localhost with environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

fetch(`${API_URL}/feed`)
```

### 1.3 Push to GitHub
```bash
cd /path/to/your/project
git init
git add .
git commit -m "Initial commit for deployment"
git remote add origin https://github.com/yourusername/your-repo-name.git
git push -u origin main
```

---

## 🚂 Step 2: Deploy Backend on Railway

### 2.1 Sign up and Connect GitHub
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository

### 2.2 Configure Railway Project
1. Railway will auto-detect your Python app
2. Go to your project dashboard
3. Click on your service → "Variables" tab
4. Add these environment variables:

```env
FIREBASE_DATABASE_URL=https://pulse-bengaluru-2933b-default-rtdb.firebaseio.com/
FIREBASE_PROJECT_ID=pulse-bengaluru-2933b
FIREBASE_API_KEY=AIzaSyBIQxPDbrM6IjQbiwhzXxuTnuIAheIAm8E
FIREBASE_AUTH_DOMAIN=pulse-bengaluru-2933b.firebaseapp.com
FIREBASE_STORAGE_BUCKET=pulse-bengaluru-2933b.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=996937152183
FIREBASE_APP_ID=1:996937152183:web:f080a75f2c27387be2ff32
REDDIT_CLIENT_ID=cRF1DR6DkI4B80ydYp529Q
REDDIT_CLIENT_SECRET=y3w0QAwiyacZ2s40MMzg8z4IQY1mOA
PORT=8000
```

### 2.3 Deploy
1. Railway will automatically deploy when you push to GitHub
2. Get your deployment URL (e.g., `https://your-app-name.railway.app`)
3. Test your API endpoints:
   - `https://your-app-name.railway.app/feed`
   - `https://your-app-name.railway.app/docs` (FastAPI docs)

---

## ▲ Step 3: Deploy Frontend on Vercel

### 3.1 Sign up and Connect GitHub
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your GitHub repository

### 3.2 Configure Vercel Project
1. Set **Root Directory** to `frontend`
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Install Command**: `npm install`

### 3.3 Add Environment Variables
In Vercel dashboard → Settings → Environment Variables:
```env
VITE_API_URL=https://your-railway-app.railway.app
VITE_APP_TITLE=Pulse Bengaluru
```

### 3.4 Deploy
1. Click "Deploy"
2. Vercel will build and deploy your frontend
3. Get your frontend URL (e.g., `https://your-app-name.vercel.app`)

---

## 🔥 Step 4: Configure Firebase

### 4.1 Firebase Console Setup
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Select your project: `pulse-bengaluru-2933b`
3. Go to "Realtime Database"
4. Make sure rules allow read/write:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### 4.2 Test Firebase Connection
Test your Firebase integration by submitting a report through your deployed frontend.

---

## ⚙️ Step 5: Update CORS for Production

Update your `main.py` CORS settings:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-app-name.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🔄 Step 6: Continuous Deployment

### 6.1 Auto-deploy on GitHub Push
Both Railway and Vercel automatically redeploy when you push to your main branch.

### 6.2 Branch Protection (Optional)
Set up staging environments by deploying different branches to different services.

---

## 🎯 Alternative Free Deployment Options

### Option 2: Render + Vercel
- **Backend**: [render.com](https://render.com) (Free tier: 750 hours/month)
- **Frontend**: Vercel
- Similar setup process

### Option 3: Heroku + Netlify
- **Backend**: Heroku (limited free tier)
- **Frontend**: Netlify
- More configuration required

### Option 4: All-in-one Solutions
- **Streamlit Cloud**: For simple apps
- **Replit**: For development/testing
- **CodeSandbox**: For prototyping

---

## 📊 Free Tier Limits

### Railway
- 500 execution hours/month
- $5 free credit monthly
- 1GB RAM, 1 vCPU
- 1GB disk storage

### Vercel
- Unlimited static deployments
- 100GB bandwidth/month
- 6,000 build minutes/month

### Firebase
- 1GB storage
- 10GB/month transfer
- 100,000 simultaneous connections

---

## 🛠️ Troubleshooting

### Common Issues

1. **CORS Errors**: Update allowed origins in main.py
2. **Environment Variables**: Double-check all env vars are set
3. **Build Failures**: Check Node.js version compatibility
4. **API Connection**: Verify backend URL in frontend config

### Debug Commands
```bash
# Test backend locally
uvicorn main:app --reload

# Test frontend locally
cd frontend && npm run dev

# Check build
cd frontend && npm run build
```

---

## 📝 Final Checklist

- [ ] Code pushed to GitHub
- [ ] Railway backend deployed and working
- [ ] Vercel frontend deployed and working
- [ ] Firebase database connected
- [ ] Environment variables configured
- [ ] CORS properly set up
- [ ] API endpoints tested
- [ ] Frontend can submit and view reports

Your app should now be live at:
- **Frontend**: `https://your-app-name.vercel.app`
- **Backend**: `https://your-app-name.railway.app`
- **API Docs**: `https://your-app-name.railway.app/docs`

🎉 **Congratulations! Your full-stack app is now deployed for FREE!**
