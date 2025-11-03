# 🚀 Quick Deployment Guide

**Ready to deploy in 30 minutes!**

---

## Prerequisites

✅ Already completed:

- Code is production-ready
- Build successful (118KB gzipped)
- All TypeScript errors fixed
- Features tested locally

🎯 You need:

- Railway account (https://railway.app)
- Vercel account (https://vercel.com)
- Credit card for production services
- 30 minutes of your time

---

## 🎬 Step-by-Step Deployment

### Step 1: Generate Secrets (2 minutes)

Run this command in the root directory:

```bash
node setup-deployment.js
```

This will:

- Generate secure JWT_SECRET and SESSION_SECRET
- Create `.env.production` files for both backend and frontend
- Show you the next steps

**Save the generated secrets somewhere safe!**

---

### Step 2: Deploy Backend to Railway (15 minutes)

#### A. Install Railway CLI

```bash
npm install -g @railway/cli
```

#### B. Deploy

```bash
cd backend

# Login to Railway
railway login

# Initialize project
railway init

# Add PostgreSQL database
railway add --plugin postgresql

# Deploy!
railway up
```

#### C. Set Environment Variables

In Railway dashboard (https://railway.app/dashboard):

1. Click your project
2. Go to Variables tab
3. Add these variables (copy from `.env.production`):
   - `JWT_SECRET` - from generated file
   - `SESSION_SECRET` - from generated file
   - `NODE_ENV` - set to `production`
   - `PORT` - set to `5000`
   - `FRONTEND_URL` - will update later
   - `CORS_ORIGIN` - will update later

#### D. Run Migrations

```bash
railway run npx prisma migrate deploy
railway run npx prisma db seed  # Optional
```

#### E. Get Your Backend URL

```bash
railway status
```

**Save this URL!** You'll need it for frontend.

Example: `https://mentorship-backend-production.railway.app`

---

### Step 3: Deploy Frontend to Vercel (10 minutes)

#### A. Update Frontend Environment

Edit `frontend/.env.production`:

```env
VITE_API_URL=https://YOUR-RAILWAY-URL.railway.app/api
VITE_WS_URL=wss://YOUR-RAILWAY-URL.railway.app
```

Replace `YOUR-RAILWAY-URL` with your actual Railway backend URL.

#### B. Install Vercel CLI

```bash
npm install -g vercel
```

#### C. Deploy

```bash
cd frontend

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

Follow the prompts:

- Setup and deploy? `Y`
- Link to existing project? `N`
- Project name? `mentorship-platform` (or your choice)
- Override settings? `N`

#### D. Configure Environment Variables

In Vercel dashboard (https://vercel.com/dashboard):

1. Select your project
2. Settings > Environment Variables
3. Add:
   - `VITE_API_URL` = `https://your-railway-url.railway.app/api`
   - `VITE_WS_URL` = `wss://your-railway-url.railway.app`

#### E. Redeploy

```bash
vercel --prod
```

#### F. Get Your Frontend URL

Vercel will show you the URL after deployment.

Example: `https://mentorship-platform.vercel.app`

---

### Step 4: Update Backend CORS (3 minutes)

Now that you have your Vercel URL, update Railway:

```bash
cd backend
railway variables set FRONTEND_URL="https://your-vercel-url.vercel.app"
railway variables set CORS_ORIGIN="https://your-vercel-url.vercel.app"
```

Railway will automatically redeploy with the new settings.

---

### Step 5: Test Everything! (5 minutes)

Visit your Vercel URL and test:

- [ ] Registration works
- [ ] Login works
- [ ] Create event works
- [ ] Send message works (WebSocket test)
- [ ] Upload resource works
- [ ] No console errors

**If everything works: Congratulations! 🎉**

---

## 🔥 Alternative: One-Click Deploy

### Backend (Render)

If you prefer Render over Railway:

1. Go to https://render.com
2. New > Web Service
3. Connect your GitHub repo
4. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npx prisma migrate deploy && npm start`
5. Add PostgreSQL database
6. Set environment variables
7. Deploy!

### Frontend (Vercel via GitHub)

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables
5. Deploy!

---

## 📊 Cost Breakdown

### Production Setup (2000 users)

- **Vercel Pro**: $20/month
- **Railway**: $20-30/month (includes PostgreSQL)
- **Total**: ~$40-50/month

### Free Tier (Testing only - NOT for 2000 users)

- **Vercel Hobby**: Free (limited bandwidth)
- **Railway Trial**: $5 credit
- **Good for**: < 500 users, testing only

---

## 🆘 Troubleshooting

### "CORS Error"

**Fix**: Make sure `FRONTEND_URL` and `CORS_ORIGIN` in Railway match your Vercel URL exactly (no trailing slash).

### "WebSocket Connection Failed"

**Fix**: Ensure WebSocket URL uses `wss://` (not `ws://`)

### "Database Connection Error"

**Fix**: Railway sets `DATABASE_URL` automatically. Don't override it.

### "Build Failed on Railway"

**Fix**: Make sure you have a `build` script in backend/package.json:

```json
"scripts": {
  "build": "tsc"
}
```

### "Environment Variables Not Working"

**Fix**:

- Vercel: Redeploy after adding variables (`vercel --prod`)
- Railway: Variables auto-trigger redeployment

---

## 📚 Detailed Guides

For more detailed information:

- **DEPLOYMENT_CHECKLIST.md** - Complete checklist
- **DEPLOYMENT_PLAN.md** - Full deployment strategy
- **VERCEL_DEPLOYMENT_GUIDE.md** - Detailed Vercel instructions

---

## 🎯 Success Metrics

After deployment, verify:

- ✅ Page load < 3 seconds
- ✅ API response < 2 seconds
- ✅ No CORS errors
- ✅ WebSocket connection stable
- ✅ All features working
- ✅ SSL certificates active

---

## 🚀 You're Ready!

Run this command to start:

```bash
node setup-deployment.js
```

Then follow the steps above.

**Questions?** Check the troubleshooting section or the detailed guides.

**Good luck with your deployment! 🎉**
