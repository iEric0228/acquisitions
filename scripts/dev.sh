#!/bin/bash

# Development startup script for Acquisition App
# This script starts the application in development mode with PostgreSQL

echo "🚀 Starting Acquisition App in Development Mode"
echo "================================================"

# Check if .env.development exists
if [ ! -f environments/.env.development ]; then
    echo "❌ Error: environments/.env.development file not found!"
    echo "   Please copy environments/.env.example to environments/.env.development and update with your values."
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "   Please start Docker Desktop and try again."
    exit 1
fi

echo "📦 Building and starting development containers..."
echo "   - PostgreSQL database will be started"
echo "   - Application will run with hot reload enabled"
echo ""

# Start development environment in detached mode
echo "🐳 Starting Docker containers..."
docker compose -f config/docker/docker-compose.dev.yml up --build -d

# Wait for the database to be ready
echo "⏳ Waiting for the database to be ready..."
sleep 15

# Run migrations with Drizzle
echo "📜 Applying latest schema with Drizzle..."
npm run db:generate 2>/dev/null || echo "No schema changes to generate"
npm run db:migrate

# Show container status
echo ""
echo "📊 Container Status:"
docker compose -f config/docker/docker-compose.dev.yml ps

echo ""
echo "🎉 Development environment started!"
echo "   Application: http://localhost:3000"
echo "   Database: postgres://neon:npg@localhost:5432/neondb"
echo ""
echo "📄 To view logs:"
echo "   docker compose -f config/docker/docker-compose.dev.yml logs -f app"
echo ""
echo "🛑 To stop the environment:"
echo "   docker compose -f config/docker/docker-compose.dev.yml down"