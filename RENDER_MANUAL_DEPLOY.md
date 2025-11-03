# 🚀 Quick Manual Deployment to Render (If Blueprint Fails)

## The Blueprint is having issues, so let's deploy manually - it's actually faster!

---

## Step 1: Create PostgreSQL Database (2 minutes)

1. Go to: https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Fill in:
   - **Name**: `mentorship-db`
   - **Database**: `mentorship`
   - **User**: `mentorship_user`  
   - **Region**: **Oregon (US West)** *(cheapest)*
   - **Plan**: **Free**
4. Click **"Create Database"**
5. **IMPORTANT**: Copy the **"Internal Database URL"** 
   - It looks like: `postgresql://mentorship_user:xxxxx@dpg-xxxxx/mentorship`
   - You'll need this in Step 2!

---

## Step 2: Create Web Service (5 minutes)

1. Still on Render Dashboard, click **"New +"** → **"Web Service"**
2. Click **"Build and deploy from a Git repository"**
3. Click **"Connect account"** and authorize GitHub
4. Find and select: **`King-Eliah/mentorship-platform`**
5. Click **"Connect"**

### Configure the service:

**Basic Settings:**
- **Name**: `mentorship-backend`
- **Region**: **Oregon (US West)** *(same as database)*
- **Branch**: `main`
- **Root Directory**: `backend`
- **Environment**: **Node**

**Build & Deploy:**
- **Build Command**: 
  ```
  npm install && npx prisma generate && npm run build
  ```
- **Start Command**: 
  ```
  npx prisma migrate deploy && node dist/server.js
  ```

**Plan:**
- **Instance Type**: **Free**

**Advanced Settings (scroll down):**
- **Health Check Path**: `/health`
- **Auto-Deploy**: **Yes**

---

## Step 3: Add Environment Variables (3 minutes)

Scroll down to **"Environment Variables"** section.

Click **"Add Environment Variable"** for each of these:

```bash
# 1. Node Environment
NODE_ENV=production

# 2. Port (Render auto-assigns, but we set default)
PORT=10000

# 3. Database URL (PASTE the Internal URL from Step 1)
DATABASE_URL=<paste-your-internal-database-url-here>

# 4. JWT Secret
JWT_SECRET=ba1aaee478498565486dd6077d1453267670b74cf8e5597ace02ce548c9821b91a7570870d513ace0248af812f1b0392f607d5fcbf5133e4e14602c036f55ce4

# 5. Session Secret
SESSION_SECRET=0694e6d34a40cc899b27b3345746e002b570183b938650d8187d03213f8c6961d973d1003925270210ebf8259c3afe603f01dea0b1005d05cc5fa10b642273b6

# 6. Frontend URL (we'll update this later with actual Vercel URL)
FRONTEND_URL=https://mentorship-platform.vercel.app

# 7. CORS Origin (same as frontend)
CORS_ORIGIN=https://mentorship-platform.vercel.app

# 8. File Upload Settings
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# 9. Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# 10. WebSocket Settings
WS_PING_INTERVAL=30000
WS_PING_TIMEOUT=60000
```

**TIP**: Copy-paste each one carefully!

---

## Step 4: Deploy! (8-10 minutes)

1. Click **"Create Web Service"** at the bottom
2. Render will start building your backend
3. Watch the **"Logs"** tab - you'll see:
   ```
   Installing dependencies...
   Generating Prisma client...
   Building TypeScript...
   Running migrations...
   Server started on port 10000
   ```
4. When you see **"Your service is live 🎉"** - you're done!

---

## Step 5: Get Your Backend URL

Your backend will be live at:
```
https://mentorship-backend.onrender.com
```

### Test it:
```bash
curl https://mentorship-backend.onrender.com/health
```

Should return:
```json
{"status":"ok"}
```

---

## ✅ Backend Deployed Successfully!

Now you have:
- ✅ Backend API running on Render (FREE)
- ✅ PostgreSQL database connected (FREE)  
- ✅ Auto-deploy on git push enabled
- ✅ HTTPS/SSL automatic

---

## 🌐 Next: Deploy Frontend to Vercel

See **VERCEL_DEPLOYMENT_GUIDE.md** or follow these quick steps:

1. Go to: https://vercel.com/new
2. Import: `King-Eliah/mentorship-platform`
3. Root Directory: `frontend`
4. Framework: Vite
5. Add env vars:
   ```
   VITE_API_URL=https://mentorship-backend.onrender.com
   VITE_WS_URL=wss://mentorship-backend.onrender.com
   ```
6. Deploy!

---

## 🔧 Troubleshooting

### Build Fails?
**Check Logs** → Look for:
- `npm ERR!` - Dependency issue
- `error TS` - TypeScript error  
- `Prisma error` - Database connection issue

**Common fixes:**
- Wrong root directory → Set to `backend`
- Missing DATABASE_URL → Check Step 3
- Port conflict → Render auto-handles PORT

### Database Connection Fails?
1. Go to your PostgreSQL database on Render
2. Check **"Status"** is "Available"
3. Copy **"Internal Database URL"** again
4. Update `DATABASE_URL` in web service environment variables
5. Go to **"Manual Deploy"** → **"Deploy latest commit"**

### Can't Access Backend?
1. Check service is **"Live"** (green dot)
2. Try health check: `https://your-service.onrender.com/health`
3. Check **"Events"** tab for errors
4. Free tier spins down after 15 min → First request takes 30-60 sec

---

## 💰 Costs

**Current Setup: $0/month**
- Render Free Web Service: $0
- Render Free PostgreSQL: $0
- Total: **$0** 🎉

**Limitations:**
- Backend spins down after 15 min inactivity
- 750 hours/month (24/7 = 720 hours = fits!)
- 512 MB RAM
- 1 GB database storage

**Perfect for testing with 100-500 users!**

---

## 🎊 Success!

Your backend is now LIVE and FREE! 🚀

Next up: Deploy frontend to Vercel and connect them!
