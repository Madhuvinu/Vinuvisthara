# Frontend Next.js Dockerfile - Production & Local Ready

FROM node:18-alpine as builder

WORKDIR /app

ARG APP_ENV=local

# Copy package files
COPY package*.json ./
COPY .env.${APP_ENV} .env.local || true

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

ARG APP_ENV=local

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY .env.${APP_ENV} .env.local || true

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=${APP_ENV}

# Start application
CMD ["npm", "start"]
