#!/bin/bash
# Build script for Render deployment

echo "🔧 Starting build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Generate Prisma Client (using a dummy DATABASE_URL if not set)
echo "🔨 Generating Prisma client..."
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL not set, using dummy for generation..."
  export DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
fi
npx prisma generate

# Build TypeScript
echo "🏗️ Building TypeScript..."
npm run build

echo "✅ Build complete!"
