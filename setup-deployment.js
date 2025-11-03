#!/usr/bin/env node

/**
 * Deployment Setup Helper
 * Generates secure secrets and helps configure environment
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🚀 Mentorship Platform - Deployment Setup Helper\n');

// Generate secrets
const jwtSecret = crypto.randomBytes(64).toString('hex');
const sessionSecret = crypto.randomBytes(64).toString('hex');

console.log('🔐 Generated Secrets:\n');
console.log('JWT_SECRET (copy this):');
console.log(`${jwtSecret}\n`);
console.log('SESSION_SECRET (copy this):');
console.log(`${sessionSecret}\n`);

// Create backend .env file
const backendEnvContent = `# Generated on ${new Date().toISOString()}
# Production Environment Variables for Backend

# Database (will be auto-set by Railway)
DATABASE_URL="postgresql://username:password@hostname:5432/database"

# JWT Secret
JWT_SECRET="${jwtSecret}"

# Session Secret
SESSION_SECRET="${sessionSecret}"

# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL (update after deploying frontend)
FRONTEND_URL="https://your-app-name.vercel.app"
CORS_ORIGIN="https://your-app-name.vercel.app"

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# WebSocket Configuration
WS_PING_INTERVAL=30000
WS_PING_TIMEOUT=60000
`;

const backendEnvPath = path.join(__dirname, 'backend', '.env.production');

try {
  fs.writeFileSync(backendEnvPath, backendEnvContent);
  console.log(`✅ Created ${backendEnvPath}\n`);
} catch (error) {
  console.log(`⚠️  Could not create .env.production file. Please create it manually.\n`);
}

// Create frontend .env file
const frontendEnvContent = `# Generated on ${new Date().toISOString()}
# Frontend Production Environment Variables

# Backend API URL (update with your Railway backend URL after deployment)
VITE_API_URL=https://your-backend-name.railway.app/api

# WebSocket URL (update with your Railway backend URL after deployment)
VITE_WS_URL=wss://your-backend-name.railway.app
`;

const frontendEnvPath = path.join(__dirname, 'frontend', '.env.production');

try {
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log(`✅ Created ${frontendEnvPath}\n`);
} catch (error) {
  console.log(`⚠️  Could not create .env.production file. Please create it manually.\n`);
}

console.log('📋 Next Steps:\n');
console.log('1. Review the generated .env.production files');
console.log('2. Update FRONTEND_URL after deploying to Vercel');
console.log('3. Update VITE_API_URL and VITE_WS_URL after deploying backend');
console.log('4. Follow DEPLOYMENT_CHECKLIST.md for deployment steps\n');

console.log('🔗 Quick Deploy Commands:\n');
console.log('Backend (Railway):');
console.log('  cd backend');
console.log('  railway login');
console.log('  railway init');
console.log('  railway add --plugin postgresql');
console.log('  railway up\n');

console.log('Frontend (Vercel):');
console.log('  cd frontend');
console.log('  vercel login');
console.log('  vercel --prod\n');

console.log('✨ Setup complete! Ready to deploy!\n');
