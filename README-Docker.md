# 🐋 J.A.R.V.I.S Docker Deployment

This guide covers how to run J.A.R.V.I.S (Just a Reality Versatile System) using Docker containers.

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB RAM available
- OpenAI API key

## 🚀 Quick Start

### 1. Clone and Setup Environment

```bash
git clone <your-repo-url>
cd JARVIS
cp .env.example .env
# Edit .env and add your OpenAI API key
```

### 2. Production Deployment

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:3001
```

### 3. Development Mode

```bash
# Start with hot reloading
docker-compose -f docker-compose.dev.yml up -d

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3001
```

## 🏗️ Build Commands

```bash
# Build images manually
./scripts/docker-build.sh

# Or build individually
docker build -f Dockerfile.backend -t jarvis-backend .
docker build -f Dockerfile.frontend -t jarvis-frontend .
```

## 🛠️ Management Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart a specific service
docker-compose restart backend

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Update and rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Clean up
docker-compose down -v --rmi all
```

## 📊 Container Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   (nginx:80)    │◄──►│  (node:3001)    │
│                 │    │                 │
│ • React App     │    │ • Express API   │
│ • Nginx Proxy   │    │ • Socket.IO     │
│ • Static Files  │    │ • TensorFlow.js │
└─────────────────┘    └─────────────────┘
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with:

```env
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=production
PORT=3001
```

### Volume Mounts

- `./uploads:/app/uploads` - File upload storage
- `./server:/app/server` - Backend code (dev mode)
- `./src:/app/src` - Frontend code (dev mode)

### Network Configuration

- **jarvis-network**: Internal bridge network
- **Frontend**: Port 80 (production) or 5173 (development)
- **Backend**: Port 3001
- **API Proxy**: `/api/*` and `/socket.io/*` routed to backend

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**:
   ```bash
   # Check what's using ports
   lsof -i :80 -i :3001 -i :5173
   
   # Kill conflicting processes
   sudo pkill -f "node server/index.js"
   ```

2. **Permission issues**:
   ```bash
   # Fix upload directory permissions
   sudo chown -R $USER:$USER uploads/
   chmod 755 uploads/
   ```

3. **Image rebuild needed**:
   ```bash
   # Force rebuild without cache
   docker-compose build --no-cache
   ```

4. **Memory issues**:
   ```bash
   # Check Docker memory usage
   docker stats
   
   # Increase Docker memory limit in Docker Desktop
   ```

### Health Checks

```bash
# Check container health
docker-compose ps

# Backend health endpoint
curl http://localhost:3001/api/status

# Frontend health
curl http://localhost/
```

## 🔒 Security Notes

- Environment variables are isolated per container
- Internal network communication only
- Nginx handles static file serving
- API requests are proxied securely
- File uploads are containerized

## 📈 Performance Optimization

### Production Optimizations

- Multi-stage builds for smaller images
- Nginx gzip compression enabled
- Node.js production mode
- Health checks for auto-recovery
- Volume mounts for persistent storage

### Resource Limits

Add to `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 1G
          cpus: '0.5'
```

## 🚀 Deployment to Cloud

### Docker Hub

```bash
# Tag and push images
docker tag jarvis-backend your-username/jarvis-backend:latest
docker tag jarvis-frontend your-username/jarvis-frontend:latest

docker push your-username/jarvis-backend:latest
docker push your-username/jarvis-frontend:latest
```

### Using Pre-built Images

Update `docker-compose.yml`:

```yaml
services:
  backend:
    image: your-username/jarvis-backend:latest
    # Remove build section
  
  frontend:
    image: your-username/jarvis-frontend:latest
    # Remove build section
```

---

**🤖 J.A.R.V.I.S is now containerized and ready for deployment!** 