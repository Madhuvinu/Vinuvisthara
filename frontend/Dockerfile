# Frontend Next.js Dockerfile - Production & Local Ready

FROM node:18-alpine AS builder

WORKDIR /app

ARG APP_ENV=local
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_MEDUSA_ADMIN_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create .env.local: use env-specific file, then override with build args (production URLs from server)
RUN if [ -f ".env.${APP_ENV}" ]; then cp ".env.${APP_ENV}" .env.local; else touch .env.local; fi
RUN if [ -n "$NEXT_PUBLIC_API_URL" ]; then echo "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL" >> .env.local; fi
RUN if [ -n "$NEXT_PUBLIC_MEDUSA_ADMIN_URL" ]; then echo "NEXT_PUBLIC_MEDUSA_ADMIN_URL=$NEXT_PUBLIC_MEDUSA_ADMIN_URL" >> .env.local; fi

# Build application (bakes in NEXT_PUBLIC_* from .env.local)
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
COPY --from=builder /app/.env.local ./.env.local

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=${APP_ENV}

# Listen on all interfaces so nginx (in another container) can proxy to this container.
CMD ["npx", "next", "start", "-H", "0.0.0.0"]
