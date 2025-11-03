#!/bin/bash
# Start script for Render deployment

echo "🚀 Starting application..."

# Run migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy

# Seed database if needed (optional)
# npx prisma db seed

# Start the server
echo "🌐 Starting server..."
npm start
