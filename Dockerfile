FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies using lockfile for reproducible builds
RUN npm ci --omit=dev=false

# Copy source code
COPY . .

# Build the application — fails loudly on any error
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Expose port
EXPOSE 5173

# Healthcheck: verify the service is responding on the health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:5173/api/health || exit 1

# Start the application
CMD ["npm", "start"]
