# Vercel Deployment Guide for Peta Frontend

This guide walks you through deploying the Peta frontend to Vercel.

## ✅ Prerequisites

1. **GitHub Account** - Your code is already pushed to GitHub ✓
2. **Vercel Account** - Create one at https://vercel.com
3. **Environment Variables** - Prepare your API configuration

## 📋 Deployment Steps

### Step 1: Sign Up / Login to Vercel

1. Go to https://vercel.com
2. Click "Sign Up" or "Log In"
3. Choose "GitHub" as your authentication method
4. Authorize Vercel to access your GitHub account

### Step 2: Import Your Project

1. After logging in, click **"Add New..."** button
2. Select **"Project"**
3. Click **"Import Git Repository"**
4. Search for your repository: `PetaTeman-Web-Mobile-App`
5. Click **"Import"**

### Step 3: Configure Project Settings

**Framework Preset:**
- Vercel should auto-detect Vite
- If not, select **"Vite"** from the dropdown

**Root Directory:**
- Set to: `frontend`

**Build Command:**
- Leave as default or set to: `npm run build`

**Output Directory:**
- Leave as default or set to: `dist`

**Install Command:**
- Leave as default: `npm install`

### Step 4: Add Environment Variables

Before deploying, add your environment variables:

1. In the Vercel dashboard, under "Environment Variables" section, add:

```
VITE_API_URL = https://your-backend-api.com
VITE_SUPABASE_URL = your_supabase_url
VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
VITE_WS_URL = wss://your-backend-websocket-url
```

**Important:** 
- Use HTTPS URLs for production
- For WebSocket, use `wss://` (secure WebSocket)
- Get these values from your backend deployment

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 1-2 minutes)
3. You'll get a deployment URL like: `https://peta-frontend.vercel.app`

### Step 6: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to **"Settings"** → **"Domains"**
2. Add your custom domain
3. Follow DNS configuration instructions

## 🔄 Automatic Deployments

- **Production**: Every push to `main` branch auto-deploys
- **Preview**: Every pull request gets a preview URL
- **Manual**: Can manually redeploy from Vercel dashboard

## 🐛 Troubleshooting

### Build Fails

**Error: "Cannot find module"**
- Solution: Ensure `package.json` is in `frontend/` folder
- Run: `npm install` locally to verify dependencies

**Error: "VITE_* is not defined"**
- Solution: Add environment variables in Vercel dashboard
- Prefix must be `VITE_` for Vite to recognize them

### API Calls Don't Work

**Issue: Requests to wrong URL**
- Check `VITE_API_URL` environment variable
- Verify backend API is running and accessible
- Check CORS configuration on backend

**Issue: WebSocket connections fail**
- Ensure `VITE_WS_URL` uses `wss://` for production
- Backend must support WebSocket
- Check firewall/proxy settings

### White Screen of Death

- Check browser console for errors (F12)
- Check Vercel deployment logs
- Verify all environment variables are set
- Try clearing cache and redeploying

## 📊 Monitoring Your Deployment

1. **Analytics**: Vercel dashboard shows performance metrics
2. **Logs**: View build and runtime logs in Vercel dashboard
3. **Error Tracking**: Check Vercel's error reporting
4. **Performance**: Monitor with Vercel Analytics

## 🚀 Next: Deploy Backend

Your frontend is now deployed! Next, deploy your Go backend to:

- **Railway** (Recommended - easy setup)
- **Render** (Free tier available)
- **Heroku** (Popular option)
- **DigitalOcean** (VPS option)
- **AWS/Google Cloud** (Scalable)

## 🔗 Useful Links

- Vercel Docs: https://vercel.com/docs
- Vite Deployment: https://vitejs.dev/guide/static-deploy.html
- Environment Variables: https://vercel.com/docs/projects/environment-variables

## 💡 Tips

- Use Preview URLs to test before merging to main
- Set up GitHub branch protection rules
- Monitor performance in Vercel Analytics
- Set up error notifications/webhooks
- Consider using Vercel Functions for API routes if needed

---

**Happy Deploying!** 🎉
