# ============================================================================
# Multi-stage Dockerfile for Miyabi (Autonomous Operations)
# ============================================================================

# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for building
RUN apk add --no-cache git python3 make g++

# Copy package files
COPY package*.json ./
COPY packages/cli/package*.json ./packages/cli/
COPY packages/core/package*.json ./packages/core/ 2>/dev/null || true

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# ============================================================================
# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Install git (required for GitHub operations)
RUN apk add --no-cache git

# Copy built files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/agents ./agents
COPY --from=builder /app/templates ./templates 2>/dev/null || true
COPY --from=builder /app/.claude ./.claude 2>/dev/null || true

# Create non-root user
RUN addgroup -g 1001 -S miyabi && \
    adduser -S miyabi -u 1001

# Set ownership
RUN chown -R miyabi:miyabi /app

USER miyabi

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('OK')" || exit 1

# Default command
CMD ["node", "packages/cli/dist/index.js"]
