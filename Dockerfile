# Base Node image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Default to production; override in docker-compose.dev.yml for dev
ENV NODE_ENV=production

# Install dependencies first (better layer caching)
COPY package.json ./
RUN npm install --omit=dev

# Copy application source
COPY . .

# Expose the HTTP port
EXPOSE 3000

# Default command (overridden in docker-compose.dev.yml for dev)
CMD ["npm", "start"]
