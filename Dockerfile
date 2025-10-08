# Miyabi Agent Runtime - Multi-stage Docker Image
# Optimized for running autonomous agents in containerized environments

# Stage 1: Base image with Node.js and dependencies
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    git \
    openssh-client \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Stage 2: Dependencies installation
FROM base AS deps

# Copy package files
COPY package*.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/miyabi-agent-sdk/package.json ./packages/miyabi-agent-sdk/
COPY packages/core/package.json ./packages/core/
COPY packages/cli/package.json ./packages/cli/

# Install pnpm
RUN npm install -g pnpm@9

# Install dependencies (production only)
RUN pnpm install --frozen-lockfile --prod

# Stage 3: Build stage
FROM base AS builder

# Copy package files
COPY package*.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/miyabi-agent-sdk/package.json ./packages/miyabi-agent-sdk/
COPY packages/core/package.json ./packages/core/
COPY packages/cli/package.json ./packages/cli/

# Install pnpm and all dependencies (including dev)
RUN npm install -g pnpm@9
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build all packages
RUN pnpm -r run build

# Stage 4: Runtime image
FROM base AS runtime

# Create non-root user
RUN addgroup -g 1001 -S miyabi && \
    adduser -S miyabi -u 1001

# Copy production dependencies from deps stage
COPY --from=deps --chown=miyabi:miyabi /app/node_modules ./node_modules
COPY --from=deps --chown=miyabi:miyabi /app/packages ./packages

# Copy built artifacts from builder stage
COPY --from=builder --chown=miyabi:miyabi /app/dist ./dist
COPY --from=builder --chown=miyabi:miyabi /app/packages/miyabi-agent-sdk/dist ./packages/miyabi-agent-sdk/dist
COPY --from=builder --chown=miyabi:miyabi /app/packages/core/dist ./packages/core/dist
COPY --from=builder --chown=miyabi:miyabi /app/packages/cli/dist ./packages/cli/dist

# Copy runtime configuration
COPY --chown=miyabi:miyabi package.json ./
COPY --chown=miyabi:miyabi scripts ./scripts
COPY --chown=miyabi:miyabi agents ./agents

# Create necessary directories
RUN mkdir -p /app/.ai /app/logs /app/output && \
    chown -R miyabi:miyabi /app/.ai /app/logs /app/output

# Switch to non-root user
USER miyabi

# Set environment variables
ENV NODE_ENV=production \
    WORKDIR=/app \
    LOG_LEVEL=info

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "console.log('OK')" || exit 1

# Default command
CMD ["node", "scripts/agentic.ts"]

# Labels
LABEL org.opencontainers.image.title="Miyabi Agent Runtime"
LABEL org.opencontainers.image.description="Container runtime for Miyabi autonomous agents"
LABEL org.opencontainers.image.vendor="Miyabi Team"
LABEL org.opencontainers.image.source="https://github.com/yourusername/Autonomous-Operations"
LABEL org.opencontainers.image.documentation="https://github.com/yourusername/Autonomous-Operations/blob/main/docs/DOCKER.md"
