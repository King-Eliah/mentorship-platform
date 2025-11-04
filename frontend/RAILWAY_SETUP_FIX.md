# 🚨 Railway Setup Fix Required

## Current Issue

The backend code was deployed to the **PostgreSQL database service** instead of a separate backend service. This is why signup returns a 500 error - the app can't connect to the database.

## How to Fix This

### Option 1: Create New Service via Railway Dashboard (Recommended)

1. **Go to Railway Dashboard:** https://railway.com/project/d4d0392a-538b-4a45-aea5-0153bc05f6c6

2. **Create New Service:**

   - Click "+ New Service"
   - Select "Empty Service"
   - Name it "backend"

3. **Connect to GitHub:**

   - In the new "backend" service
   - Click "Settings" → "Service" → "Connect Repo"
   - Select: `King-Eliah/mentorship-platform`
   - Root Directory: `/backend`
   - Branch: `main`

4. **Set Environment Variables:**

   - In "backend" service → "Variables"
   - Add these variables:
     ```
     DATABASE_URL=${Postgres.DATABASE_URL}
     JWT_SECRET=ba1aaee478498565486dd6077d1453267670b74cf8e5597ace02ce548c9821b91a7570870d513ace0248af812f1b0392f607d5fcbf5133e4e14602c036f55ce4
     SESSION_SECRET=0694e6d34a40cc899b27b3345746e002b570183b938650d8187d03213f8c6961d973d1003925270210ebf8259c3afe603f01dea0b1005d05cc5fa10b642273b6
     FRONTEND_URL=https://tiny-brioche-dbfd65.netlify.app
     CORS_ORIGIN=https://tiny-brioche-dbfd65.netlify.app
     NODE_ENV=production
     PORT=${{RAILWAY_PUBLIC_PORT}}
     ```

5. **Generate Domain:**

   - In "backend" service → "Settings" → "Networking"
   - Click "Generate Domain"
   - Copy the new domain (e.g., `backend-production-xxxx.up.railway.app`)

6. **Update Netlify Environment Variables:**

   ```bash
   netlify env:set VITE_API_URL "https://NEW_BACKEND_DOMAIN/api"
   netlify env:set VITE_WS_URL "wss://NEW_BACKEND_DOMAIN"
   ```

7. **Redeploy Netlify:**

   ```bash
   netlify deploy --prod
   ```

8. **Run Migrations:**
   - In Railway dashboard → "backend" service
   - Go to "Deployments"
   - Click the latest deployment
   - In the deployment logs, you should see migrations running automatically

### Option 2: Use Render.com Instead (Alternative)

If Railway is too complex, we can deploy to Render.com which has simpler PostgreSQL integration:

1. Go to https://render.com
2. Create a new "Web Service"
3. Connect GitHub repo
4. Auto-deploy will handle everything

## Current Status

- ✅ Frontend: https://tiny-brioche-dbfd65.netlify.app (Working)
- ❌ Backend: https://postgres-production-38ce.up.railway.app (Not properly configured)
- ❌ Database: Connected but migrations not run
- ❌ Signup: Returns 500 error

## What Needs to Happen

1. Create proper backend service (separate from database)
2. Connect backend to database
3. Run Prisma migrations
4. Seed database with test users
5. Update Netlify to point to new backend URL

## Alternative: Quick Local Test

While we fix Railway, you can test locally:

1. **Start Local Backend:**

   ```bash
   cd backend
   npm run dev
   ```

2. **Update Frontend to Use Local API:**

   - Create `frontend/.env.local`:
     ```
     VITE_API_URL=http://localhost:5000/api
     VITE_WS_URL=ws://localhost:5000
     ```

3. **Start Local Frontend:**

   ```bash
   cd frontend
   npm run dev
   ```

4. **Access at:** http://localhost:5173

This way you can test everything locally while we fix the production deployment.

## Need Help?

Let me know which option you prefer:

- Fix Railway setup (via dashboard)
- Switch to Render.com
- Test locally first

I can guide you through any of these options! 🚀
