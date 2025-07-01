#!/bin/bash

# Docker build script for J.A.R.V.I.S - Just a Reality Versatile System

echo "🤖 Building J.A.R.V.I.S Docker Images..."

# Build backend image
echo "📦 Building backend image..."
docker build -f Dockerfile.backend -t jarvis-backend:latest .

# Build frontend image
echo "🌐 Building frontend image..."
docker build -f Dockerfile.frontend -t jarvis-frontend:latest .

echo "✅ Docker images built successfully!"
echo ""
echo "To run the application:"
echo "  Production: docker-compose up -d"
echo "  Development: docker-compose -f docker-compose.dev.yml up -d"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop:"
echo "  docker-compose down" 