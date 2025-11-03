# 🎯 DEPLOY YOUR BACKEND NOW - Simple 3-Step Guide

## Skip the Blueprint! Manual deployment is faster and more reliable.

---

## ✅ Step 1: Create PostgreSQL Database (2 minutes)

1. Go to: **https://dashboard.render.com/new/database**

2. Fill in:
   ```
   Name: mentorship-db
   Database: mentorship
   User: mentorship_user
   Region: Oregon (US West)
   Plan: Free
   ```

3. Click **"Create Database"**

4. **WAIT** for status to show "Available" (1-2 minutes)

5. Click on your database name → Click **"Connect"** → Copy the **"Internal Database URL"**
   
   It looks like:
   ```
   postgresql://mentorship_user:xxxxxxxxxxxxx@dpg-xxxxx-oregon-postgres.render.com/mentorship
   ```
   
   **SAVE THIS URL** - you need it in Step 2!

---

## ✅ Step 2: Create Web Service (5 minutes)

1. Go to: **https://dashboard.render.com/create?type=web**

2. Click **"Build and deploy from a Git repository"** → **"Next"**

3. Connect your GitHub account if not already connected

4. Find **`King-Eliah/mentorship-platform`** → Click **"Connect"**

### Fill in the form:

**Name:**
```
mentorship-backend
```

**Region:**
```
Oregon (US West)
```

**Branch:**
```
main
```

**Root Directory:**
```
backend
```

**Runtime:**
```
Node
```

**Build Command:**
```
npm install && npx prisma generate && npm run build
```

**Start Command:**
```
npx prisma migrate deploy && node dist/server.js
```

**Instance Type:**
```
Free
```

---

## ✅ Step 3: Add Environment Variables (3 minutes)

Scroll down to **"Environment Variables"** section.

### Click "Add Environment Variable" and add these ONE BY ONE:

#### 1. NODE_ENV
```
production
```

#### 2. PORT  
```
10000
```

#### 3. DATABASE_URL ⚠️ IMPORTANT
```
<PASTE YOUR DATABASE URL FROM STEP 1 HERE>
```

#### 4. JWT_SECRET
```
ba1aaee478498565486dd6077d1453267670b74cf8e5597ace02ce548c9821b91a7570870d513ace0248af812f1b0392f607d5fcbf5133e4e14602c036f55ce4
```

#### 5. SESSION_SECRET
```
0694e6d34a40cc899b27b3345746e002b570183b938650d8187d03213f8c6961d973d1003925270210ebf8259c3afe603f01dea0b1005d05cc5fa10b642273b6
```

#### 6. FRONTEND_URL
```
https://mentorship-platform.vercel.app
```

#### 7. CORS_ORIGIN
```
https://mentorship-platform.vercel.app
```

#### 8. MAX_FILE_SIZE
```
10485760
```

#### 9. UPLOAD_DIR
```
./uploads
```

#### 10. RATE_LIMIT_WINDOW_MS
```
900000
```

#### 11. RATE_LIMIT_MAX_REQUESTS
```
100
```

#### 12. WS_PING_INTERVAL
```
30000
```

#### 13. WS_PING_TIMEOUT
```
60000
```

---

## ✅ Step 4: Advanced Settings

Scroll to **"Advanced"** section:

- **Health Check Path:** `/health`
- **Auto-Deploy:** `Yes`

---

## ✅ Step 5: CREATE!

Click the big blue **"Create Web Service"** button at the bottom!

---

## 🚀 Wait for Deployment (8-10 minutes)

Render will now:
1. ✅ Clone your repository
2. ✅ Install dependencies (npm install)
3. ✅ Generate Prisma client
4. ✅ Build TypeScript
5. ✅ Run database migrations
6. ✅ Start your server

### Watch the Logs!

Click the **"Logs"** tab to see real-time progress.

You should see:
```
==> Installing dependencies...
==> added 282 packages
==> Generating Prisma Client...
==> Generated Prisma Client
==> Building TypeScript...
==> Build successful!
==> Running migrations...
==> Applying migration...
==> Starting server...
==> Server listening on port 10000
==> Your service is live 🎉
```

---

## ✅ Step 6: Test Your Backend!

Your backend URL will be:
```
https://mentorship-backend.onrender.com
```

### Test health endpoint:

**In your browser, go to:**
```
https://mentorship-backend.onrender.com/health
```

**You should see:**
```json
{"status":"ok"}
```

### Or use curl:
```bash
curl https://mentorship-backend.onrender.com/health
```

---

## 🎉 SUCCESS! Backend is Live!

Your backend is now:
- ✅ Deployed on Render (FREE)
- ✅ Connected to PostgreSQL (FREE)
- ✅ Running migrations automatically
- ✅ HTTPS enabled
- ✅ Auto-deploy on git push

---

## 🌐 Next: Deploy Frontend to Vercel

Now let's deploy your frontend! It's even easier:

1. Go to: **https://vercel.com/new**

2. Import: `King-Eliah/mentorship-platform`

3. Configure:
   - **Framework:** Vite
   - **Root Directory:** `frontend`
   
4. Add environment variables:
   ```
   VITE_API_URL=https://mentorship-backend.onrender.com
   VITE_WS_URL=wss://mentorship-backend.onrender.com
   ```

5. Click **"Deploy"**

6. Wait 2-3 minutes

7. Your app is live! 🎉

---

## 🔧 Troubleshooting

### Build failed?

**Check the Logs tab.** Common issues:

1. **"Cannot find module"** → Missing dependency
   - Fix: Add to `package.json` and push to GitHub
   
2. **"Prisma error"** → Database URL wrong
   - Fix: Check `DATABASE_URL` in environment variables
   
3. **"TypeScript error"** → Code issue
   - Fix: Run `npm run build` locally to see the error

### Database connection failed?

1. Check database status is "Available"
2. Verify `DATABASE_URL` is the **Internal** URL (not External)
3. Make sure you copied the entire URL including password

### Service keeps restarting?

1. Check logs for errors
2. Make sure PORT is set to `10000`
3. Verify start command: `npx prisma migrate deploy && node dist/server.js`

---

## 💰 Cost: $0/month

- Render Web Service (Free): $0
- Render PostgreSQL (Free): $0
- **Total: $0** 🎉

---

## 🎊 You Did It!

Your backend is LIVE and FREE!

**Backend URL:** https://mentorship-backend.onrender.com

**Next:** Deploy your frontend to Vercel and you're done! 🚀
