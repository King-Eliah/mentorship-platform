FROM node:22-alpine

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Install dependencies
RUN npm ci

# Build the app (TypeScript compilation + Prisma generation)
RUN npm run build

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
