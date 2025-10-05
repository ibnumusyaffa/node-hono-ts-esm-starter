# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:22-bullseye-slim AS deps

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install all dependencies (including dev) for build stage
RUN pnpm install --frozen-lockfile

# ============================================
# Stage 2: Build
# ============================================
FROM node:22-bullseye-slim AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./

# Copy source files
COPY src/ ./src/
COPY tsconfig.json ./

# Build the application
RUN pnpm run build

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# ============================================
# Stage 3: Production Runtime
# ============================================
FROM node:22-bullseye-slim AS runtime

# Install dumb-init for proper signal handling
RUN apt-get update && \
    apt-get install -y --no-install-recommends dumb-init && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy production dependencies and built files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Create storage directories with proper permissions
RUN mkdir -p storage/app storage/public && \
    chown -R node:node /app && \
    chmod -R 755 storage

# Create volume mount point
VOLUME ["/app/storage"]

# Switch to non-root user for security
USER node

# Expose port
EXPOSE 3000


# Start the application with dumb-init
CMD ["dumb-init", "node", "./dist/server.js"]