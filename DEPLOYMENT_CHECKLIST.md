# 🚀 Deployment Execution Checklist

**Date**: ****\_\_\_****
**Deployed By**: ****\_\_\_****

---

## Pre-Deployment Tasks

### 1. Code Preparation

- [ ] All TypeScript errors fixed ✅ (already done!)
- [ ] Production build successful ✅ (already tested!)
- [ ] All features tested locally
- [ ] Git repository up to date
- [ ] `.gitignore` properly configured

### 2. Accounts Setup

- [ ] Railway account created (https://railway.app)
- [ ] Vercel account created (https://vercel.com)
- [ ] GitHub account ready
- [ ] Payment method added (required for production)

### 3. Security Preparation

```bash
# Generate strong JWT secret (run this):
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Save the output - you'll need it!
# Example: a7f3c2e8b9d4f6a1c3e5d7b9f2a4c6e8d0f2a4c6e8d0f2a4c6e8d0f2a4c6e8d0
```

- [ ] JWT_SECRET generated (min 64 characters)
- [ ] SESSION_SECRET generated
- [ ] Strong passwords ready
- [ ] Environment variables template filled

---

## Backend Deployment (Railway)

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

- [ ] Railway CLI installed

### Step 2: Login to Railway

```bash
railway login
```

- [ ] Logged in successfully
- [ ] Browser authentication completed

### Step 3: Initialize Project

```bash
cd backend
railway init
```

**Answer the prompts:**

- Project name: `mentorship-backend` (or your choice)
- [ ] Project created

### Step 4: Add PostgreSQL Database

```bash
railway add --plugin postgresql
```

- [ ] PostgreSQL database added
- [ ] Database URL automatically configured

### Step 5: Set Environment Variables

```bash
# Set each variable manually in Railway dashboard OR use CLI:
railway variables set JWT_SECRET="your-generated-secret-here"
railway variables set NODE_ENV="production"
railway variables set PORT="5000"
railway variables set FRONTEND_URL="https://your-app.vercel.app"
railway variables set CORS_ORIGIN="https://your-app.vercel.app"
railway variables set SESSION_SECRET="your-session-secret-here"
```

**Environment Variables to Set:**

- [ ] `DATABASE_URL` (auto-set by Railway)
- [ ] `JWT_SECRET`
- [ ] `NODE_ENV=production`
- [ ] `PORT=5000`
- [ ] `FRONTEND_URL` (will update after frontend deployment)
- [ ] `CORS_ORIGIN` (will update after frontend deployment)
- [ ] `SESSION_SECRET`
- [ ] `MAX_FILE_SIZE=10485760`
- [ ] `RATE_LIMIT_WINDOW_MS=900000`
- [ ] `RATE_LIMIT_MAX_REQUESTS=100`

### Step 6: Deploy Backend

```bash
railway up
```

- [ ] Deployment started
- [ ] Build completed successfully
- [ ] Deployment successful

### Step 7: Run Database Migrations

```bash
railway run npx prisma migrate deploy
```

- [ ] Migrations completed successfully

### Step 8: Seed Database (Optional - for testing)

```bash
railway run npx prisma db seed
```

- [ ] Database seeded (if needed)

### Step 9: Get Backend URL

```bash
railway status
```

- [ ] Backend URL noted: `https://_____________________.railway.app`

### Step 10: Test Backend

```bash
# Test health endpoint
curl https://your-backend.railway.app/health
```

- [ ] Health check returns `{"status":"OK","message":"Server is running"}`
- [ ] Backend is accessible

---

## Frontend Deployment (Vercel)

### Step 1: Update Frontend Environment

Edit `frontend/.env.production`:

```env
VITE_API_URL=https://YOUR-BACKEND-URL.railway.app/api
VITE_WS_URL=wss://YOUR-BACKEND-URL.railway.app
```

- [ ] `.env.production` updated with Railway backend URL
- [ ] File saved

### Step 2: Install Vercel CLI

```bash
npm install -g vercel
```

- [ ] Vercel CLI installed

### Step 3: Login to Vercel

```bash
vercel login
```

- [ ] Logged in successfully
- [ ] Email verification completed

### Step 4: Deploy Frontend

```bash
cd frontend
vercel --prod
```

**Answer the prompts:**

- Setup and deploy? `Y`
- Which scope? Choose your account
- Link to existing project? `N`
- Project name: `mentorship-platform` (or your choice)
- Directory location: `./` (current directory)
- Override settings? `N`

- [ ] Deployment started
- [ ] Build completed
- [ ] Deployment successful

### Step 5: Get Frontend URL

The CLI will output your production URL

- [ ] Frontend URL noted: `https://_____________________.vercel.app`

### Step 6: Configure Environment Variables in Vercel

**Via Vercel Dashboard:**

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add:
   - `VITE_API_URL` = `https://your-backend.railway.app/api`
   - `VITE_WS_URL` = `wss://your-backend.railway.app`

**OR via CLI:**

```bash
vercel env add VITE_API_URL production
# Paste: https://your-backend.railway.app/api

vercel env add VITE_WS_URL production
# Paste: wss://your-backend.railway.app
```

- [ ] `VITE_API_URL` configured
- [ ] `VITE_WS_URL` configured

### Step 7: Redeploy with Environment Variables

```bash
vercel --prod
```

- [ ] Redeployed with environment variables

---

## Backend CORS Update

### Update Railway Environment Variables

Now that you have the frontend URL, update backend:

```bash
cd backend
railway variables set FRONTEND_URL="https://your-app.vercel.app"
railway variables set CORS_ORIGIN="https://your-app.vercel.app"
```

- [ ] `FRONTEND_URL` updated in Railway
- [ ] `CORS_ORIGIN` updated in Railway
- [ ] Backend automatically redeployed

---

## Testing & Verification

### Backend Tests

- [ ] Health endpoint: `curl https://your-backend.railway.app/health`
- [ ] Returns 200 OK
- [ ] Database connection working

### Frontend Tests

Visit your Vercel URL and test:

- [ ] Homepage loads
- [ ] Registration page works
- [ ] Login page works
- [ ] No console errors
- [ ] Assets load correctly

### Integration Tests

- [ ] Register a new user
- [ ] Login with credentials
- [ ] Create an event
- [ ] Send a message (WebSocket test)
- [ ] Upload a resource
- [ ] Submit feedback
- [ ] Check notifications

### Performance Tests

- [ ] Page load time < 3 seconds
- [ ] API response time < 2 seconds
- [ ] No CORS errors
- [ ] WebSocket connection stable

---

## Post-Deployment Setup

### 1. Custom Domain (Optional)

**Vercel:**

- [ ] Add custom domain in Vercel settings
- [ ] Configure DNS records
- [ ] SSL certificate auto-generated
- [ ] Domain verified

**Railway (for backend):**

- [ ] Add custom domain in Railway settings
- [ ] Configure DNS records

### 2. Monitoring Setup

- [ ] Railway logs accessible
- [ ] Vercel deployment logs accessible
- [ ] Error tracking configured (Sentry - optional)
- [ ] Uptime monitoring (UptimeRobot - optional)

### 3. Backup Strategy

- [ ] Database backup enabled in Railway
- [ ] Backup schedule configured
- [ ] Restore procedure documented

### 4. Documentation

- [ ] Deployment URLs documented
- [ ] Environment variables documented
- [ ] Admin credentials stored securely
- [ ] Emergency contact info ready

---

## Scaling Configuration

### Railway Settings

- [ ] Auto-scaling enabled (if available on plan)
- [ ] Health check configured
- [ ] Restart policy set

### Vercel Settings

- [ ] Analytics enabled
- [ ] Function timeout configured
- [ ] Edge caching configured

---

## Security Final Checks

- [ ] All `.env` files in `.gitignore`
- [ ] No secrets in GitHub repository
- [ ] HTTPS enforced on both domains
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] SQL injection protection (Prisma ✅)
- [ ] XSS protection enabled

---

## Team Notification

### Notify Stakeholders

- [ ] Share production URLs with team
- [ ] Document access credentials (securely)
- [ ] Share monitoring dashboard access
- [ ] Provide support contact info

### Launch Communication

- [ ] Announcement ready
- [ ] Support channels ready
- [ ] User documentation ready
- [ ] FAQ prepared

---

## Emergency Procedures

### Rollback Procedure

**Frontend (Vercel):**

```bash
# Via dashboard: Deployments > Previous deployment > Promote to Production
# OR redeploy previous version
```

**Backend (Railway):**

```bash
# Via dashboard: Deployments > Rollback
# OR redeploy previous git commit
```

- [ ] Rollback procedure tested
- [ ] Emergency contacts documented

### Support Checklist

- [ ] Railway dashboard bookmarked
- [ ] Vercel dashboard bookmarked
- [ ] Database backup location known
- [ ] Admin access credentials secured

---

## Success Criteria ✅

- [ ] ✅ Backend deployed and healthy
- [ ] ✅ Frontend deployed and accessible
- [ ] ✅ Database migrated and seeded
- [ ] ✅ All features working
- [ ] ✅ No critical errors
- [ ] ✅ SSL certificates active
- [ ] ✅ Performance acceptable (< 2s response)
- [ ] ✅ Monitoring active
- [ ] ✅ Team notified
- [ ] ✅ Documentation complete

---

## 🎉 Deployment Complete!

**Deployed URLs:**

- Frontend: `https://___________________.vercel.app`
- Backend: `https://___________________.railway.app`
- Database: (Railway internal)

**Deployed By**: ****\_\_\_****
**Deployment Date**: ****\_\_\_****
**Deployment Time**: ****\_\_\_****

---

## Notes & Issues

_Record any issues encountered during deployment:_

```
Issue 1:


Resolution:


Issue 2:


Resolution:

```

---

**Next Steps:**

1. Monitor application for 24 hours
2. Collect user feedback
3. Review logs and metrics
4. Plan optimization improvements
5. Schedule regular backups

---

**Congratulations! Your application is now live! 🚀**
