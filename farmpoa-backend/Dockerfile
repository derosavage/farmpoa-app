# =============================================================================
# Stage 1: Dependencies
# =============================================================================
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# =============================================================================
# Stage 2: Build
# =============================================================================
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig*.json ./
RUN npm ci
COPY src ./src
RUN npm run build

# =============================================================================
# Stage 3: Production runtime (minimal image)
# =============================================================================
FROM node:20-alpine AS runner
WORKDIR /app

# Security: run as non-root
RUN addgroup --system --gid 1001 farmpoa && \
    adduser --system --uid 1001 --ingroup farmpoa farmpoa

# Copy built assets and prod deps
COPY --from=deps    --chown=farmpoa:farmpoa /app/node_modules ./node_modules
COPY --from=builder --chown=farmpoa:farmpoa /app/dist ./dist
COPY --from=builder --chown=farmpoa:farmpoa /app/package.json ./package.json

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

USER farmpoa
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

CMD ["node", "dist/server.js"]
