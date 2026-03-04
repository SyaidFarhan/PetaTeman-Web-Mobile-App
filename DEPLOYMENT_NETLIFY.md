# Netlify Deployment Guide for Peta Frontend

This guide walks you through deploying the Peta frontend to Netlify.

## ✅ Prerequisites

1. **GitHub Account** - Your code is already pushed to GitHub ✓
2. **Netlify Account** - Create one at https://netlify.com
3. **Environment Variables** - Prepare your API configuration

## 📋 Deployment Steps

### Step 1: Sign Up / Login to Netlify

1. Go to https://netlify.com
2. Click **"Sign up"** or **"Log in"**
3. Choose **"GitHub"** as your authentication method
4. Authorize Netlify to access your GitHub account

### Step 2: Create New Site from Git

1. After logging in, click **"Add new site"** → **"Import an existing project"**
2. Click **"GitHub"** to connect your repository
3. Search for **`PetaTeman-Web-Mobile-App`**
4. Click **"Install"** if prompted to authorize Netlify for GitHub
5. Select your repository

### Step 3: Configure Build Settings

Netlify should auto-detect your settings, but verify:

**Repository and Branch:**
- Repository: `PetaTeman-Web-Mobile-App`
- Branch to deploy: `main`

**Build Settings:**
- Base directory: `frontend` ⚠️ **Important!**
- Build command: `npm run build`
- Publish directory: `dist`

### Step 4: Add Environment Variables

Before deploying, add your environment variables:

1. In the Netlify dashboard, go to **"Site settings"** → **"Build & deploy"** → **"Environment"**
2. Click **"Edit variables"**
3. Add the following variables:

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

1. Click **"Deploy [Site Name]"**
2. Wait for the build to complete (usually 1-2 minutes)
3. You'll get a deployment URL like: `https://peta-[random-name].netlify.app`

### Step 6: Configure Custom Domain (Optional)

1. In Netlify dashboard, go to **"Site settings"** → **"Domain management"** → **"Domains"**
2. Click **"Add domain"** or **"Add alias"**
3. Follow DNS configuration instructions
4. Set up automatic HTTPS (included free with Netlify)

## 🔄 Automatic Deployments

- **Production**: Every push to `main` branch auto-deploys
- **Preview**: Every pull request gets a preview URL
- **Draft**: Use Netlify CLI for draft deployments
- **Manual**: Can manually redeploy from Netlify dashboard

## ⚙️ Advanced Features

### Netlify Functions (Optional Serverless Backend)

You can use Netlify Functions as lightweight API endpoints:

1. Create `netlify/functions/` directory
2. Add JavaScript/TypeScript function files
3. Access via `/.netlify/functions/function-name`

### Notifications & Webhooks

Set up Slack, email, or webhook notifications for:
- Deploy started/succeeded/failed
- Error tracking
- Build logs

## 🐛 Troubleshooting

### Build Fails

**Error: "Cannot find module"**
- Solution: Ensure `package.json` is in `frontend/` folder
- Check that **Base directory** is set to `frontend`

**Error: "VITE_* is not defined"**
- Solution: Add environment variables in Netlify dashboard
- Prefix must be `VITE_` for Vite to recognize them
- Rebuild after adding variables

### API Calls Don't Work

**Issue: Requests to wrong URL**
- Check `VITE_API_URL` environment variable
- Verify backend API is running and accessible
- Check CORS configuration on backend

**Issue: WebSocket connections fail**
- Ensure `VITE_WS_URL` uses `wss://` for production
- Backend must support WebSocket
- Check firewall/proxy settings

### White Screen or 404 Errors

- **Solution**: Netlify automatically redirects all routes to `index.html` (configured in `netlify.toml`)
- If still having issues:
  - Clear browser cache (Ctrl+Shift+Delete)
  - Check browser console for errors (F12)
  - View deployment logs in Netlify dashboard

### Slow Builds

- **Solution**: Netlify provides generous build limits
- If you exceed limits, upgrade your plan
- Consider splitting frontend and backend

## 📊 Monitoring Your Deployment

1. **Deploys Page**: See all deployments and their status
2. **Logs**: View build logs and error messages
3. **Analytics**: Monitor performance (with Pro plan)
4. **Functions**: Monitor serverless function usage
5. **Notifications**: Get alerts for deployment failures

## ✨ Netlify vs Vercel Comparison

| Feature | Netlify | Vercel |
|---------|---------|--------|
| **Ease of Setup** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Free Build Time** | 300 min/month | Unlimited* |
| **Preview URLs** | ✅ Per PR | ✅ Per PR |
| **Custom Domains** | ✅ Free | ✅ Free |
| **Functions** | ✅ Included | ✅ Included |
| **CMS Integration** | ✅ Netlify CMS | ❌ |
| **CLI Tools** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

*Vercel offers more generous free limits for small projects

## 🚀 Next: Deploy Backend

Your frontend is now deployed! Next, deploy your Go backend to:

- **Railway** (Recommended - easy setup)
- **Render** (Free tier available)
- **Heroku** (Popular option)
- **DigitalOcean** (VPS option)
- **AWS/Google Cloud** (Scalable)

## 🔗 Useful Links

- Netlify Docs: https://docs.netlify.com
- Netlify TOML: https://docs.netlify.com/configure-builds/file-based-configuration/
- Vite Deployment: https://vitejs.dev/guide/static-deploy.html
- Environment Variables: https://docs.netlify.com/configure-builds/environment-variables/

## 💡 Pro Tips

1. **Use Git-based deployments** for automatic CI/CD
2. **Set up branch deploys** for testing features
3. **Enable build notifications** for team updates
4. **Monitor build time** and optimize if needed
5. **Use Netlify Analytics** to track user metrics
6. **Consider Netlify Forms** for form submissions without backend
7. **Deploy previews** before merging to main

---

**Happy Deploying!** 🎉
