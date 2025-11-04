# 🚀 Deploy to Netlify - Complete Guide

Netlify offers a generous free tier that's perfect for full-stack applications!

## 📊 What You Get FREE on Netlify:

- ✅ **100GB bandwidth/month**
- ✅ **Unlimited sites**
- ✅ **Automatic HTTPS**
- ✅ **Continuous deployment from Git**
- ✅ **Serverless functions** (125k requests/month)
- ✅ **Form handling**
- ✅ **Split testing**
- ✅ **Deploy previews**

---

## 🎯 Deployment Options

### Option 1: Frontend Only (Simplest - Use External Backend)

Deploy just the frontend on Netlify and connect to a separate backend (Railway, Render, etc.)

### Option 2: Full-Stack with Netlify Functions (Recommended)

Deploy both frontend and backend on Netlify using serverless functions.

---

## 🚀 Option 1: Frontend Only Deployment

### Step 1: Prepare Your App

1. **Update frontend environment variables** (create `.env.production`):

   ```bash
   cd frontend
   ```

   Create `frontend/.env.production`:

   ```env
   VITE_API_URL=https://your-backend-url.com
   VITE_WS_URL=wss://your-backend-url.com
   ```

### Step 2: Deploy via Netlify Dashboard

1. Go to: **https://app.netlify.com/start**

2. Click **"Import an existing project"**

3. Choose **"Deploy with GitHub"** (or GitLab/Bitbucket)

4. Authorize Netlify to access your GitHub account

5. Select repository: **`King-Eliah/mentorship-platform`**

6. Configure build settings:

   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/dist
   ```

7. **Add environment variables:**

   - Click **"Show advanced"**
   - Click **"New variable"**
   - Add:
     ```
     VITE_API_URL=https://your-backend-url.com
     VITE_WS_URL=wss://your-backend-url.com
     ```

8. Click **"Deploy site"**

9. Wait 2-3 minutes for build

10. **Your frontend is live!** 🎉

    ```
    https://random-name-123.netlify.app
    ```

11. **Customize domain** (optional):
    - Go to **"Site settings"** → **"Domain management"**
    - Click **"Options"** → **"Edit site name"**
    - Change to: `mentorship-platform`
    - New URL: `https://mentorship-platform.netlify.app`

---

## 🔧 Option 2: Full-Stack Deployment (Advanced)

### Deploy Backend to External Service First

Since Netlify Functions have limitations (no WebSockets, 10s timeout), I recommend:

**For Backend:**

1. Deploy to **Railway** (FREE $5 credit):

   - Go to: https://railway.app
   - Import your repo
   - Select `backend` folder
   - Add PostgreSQL database
   - Deploy!

2. Or use **Render** (FREE tier):
   - Go to: https://render.com
   - Create PostgreSQL database
   - Create Web Service
   - Point to `backend` folder

**For Frontend:**

1. Deploy to Netlify (as described in Option 1)
2. Use backend URL from Railway/Render

---

## 🌐 Using Netlify CLI (Alternative)

### Install Netlify CLI:

```bash
npm install -g netlify-cli
```

### Login:

```bash
netlify login
```

### Deploy:

```bash
cd frontend
netlify deploy --prod
```

### Follow prompts:

- Create new site? **Yes**
- Site name: **mentorship-platform**
- Publish directory: **dist**

---

## 🔗 Connect Frontend to Backend

After deploying both:

1. **Get your Netlify frontend URL:**

   ```
   https://mentorship-platform.netlify.app
   ```

2. **Update backend CORS settings:**

   - Add your Netlify URL to allowed origins
   - Update `FRONTEND_URL` and `CORS_ORIGIN` env vars

3. **Update frontend API URL:**
   - In Netlify dashboard: **Site settings** → **Environment variables**
   - Update `VITE_API_URL` with your backend URL
   - Redeploy: **Deploys** → **Trigger deploy** → **Deploy site**

---

## 📱 Recommended Full Setup (Best Free Option)

### Frontend: Netlify

- ✅ 100% FREE
- ✅ 100GB bandwidth
- ✅ Global CDN
- ✅ Auto HTTPS

### Backend: Railway

- ✅ FREE $5 credit (~2 weeks)
- ✅ PostgreSQL included
- ✅ WebSocket support
- ✅ Easy to use

**Total Cost: $0 for testing!**

---

## 🎯 Quick Deploy Steps (Frontend Only)

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Build your frontend
cd frontend
npm run build

# 4. Deploy
netlify deploy --prod --dir=dist

# 5. Set environment variables in Netlify dashboard
# Site settings > Environment variables
# Add: VITE_API_URL, VITE_WS_URL

# 6. Redeploy
netlify deploy --prod --dir=dist
```

---

## ✅ Testing Your Deployment

### Frontend:

Visit: `https://your-site.netlify.app`

### Health Check:

If you deployed backend to Netlify Functions:
Visit: `https://your-site.netlify.app/.netlify/functions/api/health`

---

## 🔧 Troubleshooting

### Build fails?

1. Check build logs in Netlify dashboard
2. Verify `frontend/dist` folder is created
3. Check Node version (should be 18+)

### API calls fail?

1. Check `VITE_API_URL` is set correctly
2. Verify CORS settings on backend
3. Check browser console for errors

### Environment variables not working?

1. Variables must start with `VITE_` for Vite
2. Redeploy after adding variables
3. Check they're visible in build logs

---

## 💰 Pricing

**Netlify Free Tier:**

- 100GB bandwidth/month
- 300 build minutes/month
- 125k serverless function requests/month

**Perfect for:**

- ✅ Testing and validation
- ✅ 500-1000 users
- ✅ Portfolio projects
- ✅ MVP launches

**Upgrade when:**

- Need more than 100GB bandwidth
- Need team collaboration
- Need advanced features

---

## 🎊 Success!

Your app is now deployed on Netlify! 🚀

**Next steps:**

1. Share your Netlify URL with testers
2. Monitor analytics in Netlify dashboard
3. Set up custom domain (optional)
4. Enable deploy previews for pull requests

---

## 🆘 Need Help?

- Netlify Docs: https://docs.netlify.com
- Netlify Community: https://answers.netlify.com
- Status: https://www.netlifystatus.com

---

**Happy deploying!** 🎉
