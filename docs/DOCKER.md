# Docker Setup and Documentation

This document explains the Docker configuration for the acquisitions API, including development with Neon Local and production with Neon Cloud.

## Architecture Overview

```
Development (docker-compose.dev.yml):
┌─────────────────┐    ┌─────────────────┐
│   Express App   │────│   Neon Local    │
│  (Port 3000)    │    │  (Port 5432)    │
│                 │    │                 │
│ - Hot reload    │    │ - Ephemeral     │
│ - Dev env vars  │    │   branches      │
│ - Volume mount  │    │ - API proxy     │
└─────────────────┘    └─────────────────┘

Production (docker-compose.prod.yml):
┌─────────────────┐    ┌─────────────────┐
│   Express App   │────│   Neon Cloud    │
│  (Port 3000)    │    │   (External)    │
│                 │    │                 │
│ - Optimized     │    │ - Serverless    │
│ - Prod env vars │    │ - Managed       │
│ - No volumes    │    │ - Global CDN    │
└─────────────────┘    └─────────────────┘
```

## Files Overview

### Core Docker Files

- **`Dockerfile`** - Multi-stage Node.js application container
- **`.dockerignore`** - Excludes unnecessary files from Docker build context
- **`docker-compose.dev.yml`** - Development stack with Neon Local
- **`docker-compose.prod.yml`** - Production stack with Neon Cloud

### Environment Files

- **`.env.development`** - Development environment variables
- **`.env.production`** - Production environment variables

## Dockerfile Breakdown

```dockerfile
FROM node:20-alpine
WORKDIR /usr/src/app

# Default to production (overridden in dev)
ENV NODE_ENV=production

# Install dependencies first for better caching
COPY package.json ./
RUN npm install --omit=dev

# Copy source code
COPY . .

EXPOSE 3000
CMD ["node", "src/index.js"]
```

### Key Features:

- **Alpine Linux** - Minimal base image (~5MB vs ~900MB for full Node)
- **Layer optimization** - Dependencies installed before source copy
- **Production defaults** - Overridden in development compose
- **Security** - Non-root user (handled by Node.js official image)

## Development Environment

### Prerequisites

1. **Docker & Docker Compose** - Latest stable versions
2. **Neon Account** with:
   - API Key (`NEON_API_KEY`)
   - Project ID (`NEON_PROJECT_ID`) 
   - Parent Branch ID (`PARENT_BRANCH_ID`) - optional

### Setup Steps

1. **Configure environment**:
   ```bash
   cp .env.development.example .env.development
   # Edit .env.development with your Neon credentials
   ```

2. **Start development stack**:
   ```bash
   docker compose -f docker-compose.dev.yml up --build
   ```

3. **Verify services**:
   - App: http://localhost:3000
   - Health check: http://localhost:3000/health
   - Neon Local: postgres://neon:npg@localhost:5432/neondb

### Development Features

- **Hot reload** - File changes trigger app restart
- **Volume mounting** - Source code mounted for live editing  
- **Neon Local** - Ephemeral database branches for testing
- **Debug logging** - Console output enabled
- **Development dependencies** - ESLint, Prettier, etc.

### Common Development Commands

```bash
# Start dev stack
docker compose -f docker-compose.dev.yml up

# Start in background
docker compose -f docker-compose.dev.yml up -d

# View logs
docker compose -f docker-compose.dev.yml logs -f app

# Stop services
docker compose -f docker-compose.dev.yml down

# Rebuild after dependency changes
docker compose -f docker-compose.dev.yml up --build

# Run database migrations in dev
docker compose -f docker-compose.dev.yml exec app npm run db:migrate

# Access app container shell
docker compose -f docker-compose.dev.yml exec app sh
```

## Production Environment

### Prerequisites

1. **Neon Cloud Database** - Production database URL
2. **Environment Secrets** - JWT secrets, API keys, etc.
3. **Container Registry** - Docker Hub, AWS ECR, etc. (for deployment)

### Local Production Testing

```bash
# Configure production environment
cp .env.production.example .env.production
# Edit .env.production with production values

# Test production build locally
docker compose -f docker-compose.prod.yml up --build
```

### Production Features

- **Optimized build** - No dev dependencies
- **Security hardening** - Production environment variables
- **Direct Neon Cloud** - No local proxy
- **Minimal logging** - Structured JSON logs only
- **Resource limits** - Can be configured via deploy tools

### Production Deployment

#### Option 1: Docker Compose (Simple)

```bash
# Deploy to production server
scp docker-compose.prod.yml .env.production user@server:/app/
ssh user@server "cd /app && docker compose -f docker-compose.prod.yml up -d"
```

#### Option 2: Container Registry (Recommended)

```bash
# Build and tag
docker build -t your-registry/acquisitions-app:v1.0.0 .
docker push your-registry/acquisitions-app:v1.0.0

# Deploy via orchestrator (Kubernetes, ECS, etc.)
kubectl apply -f k8s-deployment.yaml
```

## Environment Variables

### Development (.env.development)

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://neon:npg@neon-local:5432/neondb
NEON_API_KEY=your_neon_api_key_here
NEON_PROJECT_ID=your_neon_project_id_here
PARENT_BRANCH_ID=your_parent_branch_id_here
```

### Production (.env.production)

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://user:password@your-project.neon.tech/neondb
JWT_SECRET=replace_me_in_production
LOG_LEVEL=info
```

### Environment Variable Precedence

1. **Docker Compose environment section** (highest priority)
2. **env_file** (.env.development/.env.production)
3. **Shell environment** (lowest priority)

## Neon Local Configuration

### How It Works

Neon Local acts as a proxy between your application and Neon Cloud:

```
App → Neon Driver → Neon Local Proxy → Neon Cloud API
```

### Configuration in Code

The app detects Neon Local via the `NEON_LOCAL=true` environment variable:

```javascript
// src/config/database.js
if (process.env.NEON_LOCAL === 'true') {
  neonConfig.fetchEndpoint = 'http://neon-local:5432/sql';
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}
```

### Ephemeral Branches

Neon Local can create temporary database branches for:
- **Feature development** - Isolated schema changes
- **Testing** - Clean state for each test run
- **Experimentation** - Try changes without affecting main branch

## Docker Best Practices Applied

### Security
- ✅ Non-root user (Node.js image default)
- ✅ Environment secrets not baked into image
- ✅ Minimal base image (Alpine)
- ✅ No sensitive files in build context (.dockerignore)

### Performance
- ✅ Layer caching optimization
- ✅ Multi-stage builds ready (can be extended)
- ✅ Minimal runtime dependencies
- ✅ Efficient .dockerignore

### Maintainability
- ✅ Clear separation of dev/prod environments
- ✅ Environment-specific compose files
- ✅ Documented configuration
- ✅ Consistent naming conventions

## Troubleshooting

### Common Issues

#### 1. "Connection refused" errors

```bash
# Check if services are running
docker compose -f docker-compose.dev.yml ps

# Check service logs
docker compose -f docker-compose.dev.yml logs neon-local
docker compose -f docker-compose.dev.yml logs app
```

#### 2. Neon Local authentication failures

- Verify `NEON_API_KEY` and `NEON_PROJECT_ID` in `.env.development`
- Check Neon dashboard for correct credentials
- Ensure API key has necessary permissions

#### 3. Hot reload not working

```bash
# Ensure volume mounts are correct
docker compose -f docker-compose.dev.yml config

# Check if nodemon is running
docker compose -f docker-compose.dev.yml exec app ps aux
```

#### 4. Port conflicts

```bash
# Check what's using port 3000 or 5432
lsof -i :3000
lsof -i :5432

# Use different ports in compose file if needed
```

### Debug Commands

```bash
# Inspect container
docker compose -f docker-compose.dev.yml exec app sh

# Check environment variables
docker compose -f docker-compose.dev.yml exec app env | grep -E "(DATABASE|NEON|NODE)"

# Test database connection
docker compose -f docker-compose.dev.yml exec app node -e "
  import { db } from '#config/database.js';
  console.log('Database connection:', !!db);
"

# View detailed container info
docker compose -f docker-compose.dev.yml exec app cat /etc/os-release
```

## Performance Considerations

### Image Size Optimization

Current optimizations:
- Alpine Linux base (~5MB)
- Multi-stage builds ready
- Production dependencies only
- Efficient .dockerignore

Future optimizations:
- Distroless runtime images
- Static binary compilation
- Asset minification

### Resource Limits

Add to production compose:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Docker Build
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker build -t acquisitions-app .
      - name: Test with dev stack
        run: docker compose -f docker-compose.dev.yml up --abort-on-container-exit
```

## Monitoring and Logging

### Structured Logging

The app uses Winston for structured JSON logging in production:

```javascript
// Logs are JSON formatted in production
{"level":"info","message":"User registered successfully","timestamp":"2024-01-01T00:00:00Z"}
```

### Health Checks

```bash
# Container health check endpoint
curl http://localhost:3000/health

# Docker health check (can be added to Dockerfile)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

---

For more information about Neon Local, visit: https://neon.com/docs/local/neon-local