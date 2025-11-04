FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma

# Install dependencies
RUN npm ci

# Build the app (TypeScript compilation + Prisma generation)
RUN npm run build

# Copy source
COPY src ./src

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
