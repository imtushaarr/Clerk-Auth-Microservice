FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (fail loudly on errors)
RUN npm ci --frozen-lockfile

# Copy source code
COPY . .

# Build the application (fail loudly on errors)
RUN npm run build

# Expose port
EXPOSE 3000

# Healthcheck: verify the service responds to the /api/health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["npm", "start"]
