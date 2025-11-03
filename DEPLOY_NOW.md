# 🚀 Deploy Your Mentorship Platform - 100% FREE!

Your app is ready to deploy to **completely FREE platforms**!

## ✅ What You're Deploying

- **Backend**: Render.com (FREE tier)
  - PostgreSQL database included
  - 750 hours/month free
  - Automatic HTTPS
  - Auto-deploy on git push

- **Frontend**: Vercel (FREE forever)
  - 100GB bandwidth/month
  - Unlimited deployments
  - Automatic HTTPS
  - Global CDN

**Total Cost: $0 Forever!** 🎉

---

## 🎯 Automated Deployment (I'll Handle Everything!)

Since you asked me to handle deployment, I'll guide you through connecting to GitHub and letting the platforms auto-deploy.

### Step 1: Push to GitHub (If Not Already)

```bash
cd c:\Users\USER\Desktop\mentorship

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial deployment setup"

# Add your GitHub repository
git remote add origin https://github.com/King-Eliah/mentorship-platform.git

# Push
git push -u origin main
```

---

## 🔧 Step 2: Deploy Backend to Render.com

I've created `backend/render.yaml` with all configurations!

### Option A: Auto-Deploy from GitHub (Recommended)

1. Go to https://render.com
2. Sign in with GitHub
3. Click **"New +"** → **"Blueprint"**
4. Connect your repository: `King-Eliah/mentorship-platform`
5. Render will detect `render.yaml` automatically
6. Click **"Apply"**
7. Wait 5-10 minutes for deployment

**That's it!** Render will:
- Create PostgreSQL database
- Install dependencies
- Build your app
- Run migrations
- Start the server

### Option B: Manual Setup (If Blueprint doesn't work)

1. Go to https://render.com
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repo: `King-Eliah/mentorship-platform`
4. Configure:
   - **Name**: mentorship-backend
   - **Root Directory**: backend
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm start`
   - **Environment**: Node
   - **Plan**: Free

5. Add PostgreSQL database:
   - Click **"New +"** → **"PostgreSQL"**
   - **Name**: mentorship-db
   - **Plan**: Free
   - Copy connection string

6. Add environment variables (use values from below)

7. Click **"Create Web Service"**

---

## 🌐 Step 3: Deploy Frontend to Vercel

I've created `vercel.json` with all configurations!

### Option A: Auto-Deploy from GitHub (Recommended)

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **"Add New..."** → **"Project"**
4. Import `King-Eliah/mentorship-platform`
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: dist
6. Add environment variables:
   ```
   VITE_API_URL=https://mentorship-backend.onrender.com
   VITE_WS_URL=wss://mentorship-backend.onrender.com
   ```
7. Click **"Deploy"**

**Done!** Vercel will:
- Build your React app
- Deploy to global CDN
- Provide HTTPS URL

### Option B: CLI Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod

# When prompted:
# - Link to existing project? No
# - Project name: mentorship-platform
# - Directory: ./
# - Override settings? No
```

---

## 🔗 Step 4: Update URLs

After both deployments, you'll have URLs like:

- **Backend**: `https://mentorship-backend.onrender.com`
- **Frontend**: `https://mentorship-platform.vercel.app`

### Update Backend CORS:

1. Go to Render.com → Your service → Environment
2. Update these variables:
   ```
   FRONTEND_URL=https://mentorship-platform.vercel.app
   CORS_ORIGIN=https://mentorship-platform.vercel.app
   ```
3. Click **"Save Changes"** (auto-redeploys)

### Update Frontend API URL:

1. Go to Vercel → Your project → Settings → Environment Variables
2. Update:
   ```
   VITE_API_URL=https://mentorship-backend.onrender.com
   VITE_WS_URL=wss://mentorship-backend.onrender.com
   ```
3. Go to Deployments → Click **"Redeploy"**

---

## 📊 Step 5: Verify Deployment

### Test Backend:
```bash
# Health check
curl https://mentorship-backend.onrender.com/health

# Should return: {"status":"ok"}
```

### Test Frontend:
Open: `https://mentorship-platform.vercel.app`

You should see your app! 🎉

---

## 🎯 Environment Variables Reference

### Backend (Render.com)

Already configured in `render.yaml`, but here's the list:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=<auto-set-by-render>
JWT_SECRET=ba1aaee478498565486dd6077d1453267670b74cf8e5597ace02ce548c9821b91a7570870d513ace0248af812f1b0392f607d5fcbf5133e4e14602c036f55ce4
SESSION_SECRET=0694e6d34a40cc899b27b3345746e002b570183b938650d8187d03213f8c6961d973d1003925270210ebf8259c3afe603f01dea0b1005d05cc5fa10b642273b6
FRONTEND_URL=https://mentorship-platform.vercel.app
CORS_ORIGIN=https://mentorship-platform.vercel.app
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
WS_PING_INTERVAL=30000
WS_PING_TIMEOUT=60000
```

### Frontend (Vercel)

```env
VITE_API_URL=https://mentorship-backend.onrender.com
VITE_WS_URL=wss://mentorship-backend.onrender.com
```

---

## 🚨 Important Notes

### Render.com Free Tier Limitations:

- ⚠️ **Spins down after 15 minutes of inactivity**
  - First request takes 30-60 seconds (cold start)
  - Subsequent requests are fast
  - Good for testing, not high-traffic production

- ✅ **750 hours/month free** (enough for 1 app running 24/7)
- ✅ **512MB RAM** (enough for your app)
- ✅ **PostgreSQL included** (1GB storage free)

### Keeping Backend Active:

**Option 1: UptimeRobot (FREE monitoring)**
1. Go to https://uptimerobot.com
2. Add monitor: `https://mentorship-backend.onrender.com/health`
3. Check interval: Every 5 minutes
4. This keeps your backend warm!

**Option 2: Cron Job**
Add to `render.yaml`:
```yaml
  - type: cron
    name: keep-alive
    env: node
    schedule: "*/10 * * * *"
    buildCommand: echo "Keep alive"
    startCommand: curl https://mentorship-backend.onrender.com/health
```

### Vercel Free Tier:

- ✅ **100% free forever** for personal projects
- ✅ **100GB bandwidth/month** (good for 5000+ users)
- ✅ **Unlimited deployments**
- ✅ **No cold starts** (always fast!)

---

## 🎊 Success Criteria

After deployment, you should have:

✅ Backend live at: `https://mentorship-backend.onrender.com/health`  
✅ Frontend live at: `https://mentorship-platform.vercel.app`  
✅ PostgreSQL database running  
✅ Automatic HTTPS on both  
✅ Auto-deploy on git push  
✅ Free feedback widget active  
✅ Analytics tracking ready  

---

## 🆘 Troubleshooting

### Backend won't start?
1. Check Render logs: Dashboard → Your Service → Logs
2. Common issues:
   - Database not connected → Check DATABASE_URL
   - Build failed → Check `package.json` scripts
   - Port issues → Render uses PORT env var automatically

### Frontend shows API errors?
1. Check browser console (F12)
2. Verify VITE_API_URL is correct
3. Check CORS settings in backend
4. Test backend health: `curl https://your-backend.onrender.com/health`

### Database migrations failed?
```bash
# Manual migration via Render Shell
# Go to Render Dashboard → Your Service → Shell
npx prisma migrate deploy
```

---

## 📈 Next Steps After Deployment

1. **Test everything**:
   - User registration/login
   - Create events
   - Send messages
   - Upload resources
   - Check WebSocket connections

2. **Share with testers**:
   - Send them your Vercel URL
   - Use FeedbackWidget to collect feedback
   - Monitor analytics

3. **Monitor performance**:
   - Vercel Analytics (free): https://vercel.com/dashboard/analytics
   - Render metrics: https://render.com/dashboard

4. **Optimize for free tier**:
   - Use UptimeRobot to prevent cold starts
   - Enable Vercel caching
   - Optimize images/assets

5. **When ready for production**:
   - Upgrade Render to Starter plan ($7/month)
   - Or migrate to Railway/Heroku
   - Keep Vercel free (it's great!)

---

## 🎯 Quick Deploy Checklist

- [ ] Push code to GitHub
- [ ] Deploy backend to Render.com (10 min)
- [ ] Deploy frontend to Vercel (5 min)
- [ ] Update environment variables (5 min)
- [ ] Test health endpoint
- [ ] Test frontend app
- [ ] Setup UptimeRobot monitoring
- [ ] Share with testers!

---

**Ready to deploy? Start with Step 1 above!** 🚀

**Need help?** Just ask, I'm here to assist! 😊
