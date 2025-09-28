FROM node:22-bullseye-slim

# Install pnpm
RUN npm install -g pnpm

# Create app directory
WORKDIR /app

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY src/ ./src/
COPY tsconfig.json ./

# Build the application
RUN pnpm run build

# Create storage directory with proper permissions
RUN mkdir -p storage/app storage/public && \
    chown -R node:node /app && \
    chmod -R 755 storage

# Create volume mount point
VOLUME ["/app/storage"]

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]