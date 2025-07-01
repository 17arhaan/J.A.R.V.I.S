# 🚄 Railway Deployment Guide for J.A.R.V.I.S

Deploy your J.A.R.V.I.S (Just a Reality Versatile System) to Railway cloud platform.

## 📋 Prerequisites

- [Railway Account](https://railway.app) (free tier available)
- [Railway CLI](https://docs.railway.app/develop/cli) installed
- OpenAI API key
- Git repository with your J.A.R.V.I.S code

## 🚀 Quick Deploy (One-Click)

### Option 1: Deploy from GitHub

1. **Fork the Repository**
   ```bash
   # Clone and push to your GitHub account
   git clone <your-jarvis-repo>
   cd JARVIS
   git remote set-url origin https://github.com/yourusername/jarvis.git
   git push -u origin main
   ```

2. **Deploy on Railway**
   - Visit [railway.app](https://railway.app)
   - Click "Deploy from GitHub repo"
   - Select your J.A.R.V.I.S repository
   - Railway will auto-detect and deploy!

### Option 2: One-Click Deploy Button

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template-id)

## 🛠️ Manual Deployment

### Step 1: Install Railway CLI

```bash
# macOS
brew install railway

# npm
npm install -g @railway/cli

# Linux/Windows
curl -fsSL https://railway.app/install.sh | sh
```

### Step 2: Login to Railway

```bash
railway login
```

### Step 3: Initialize Project

```bash
# In your J.A.R.V.I.S directory
railway init

# Or create new project
railway init jarvis-reality-system
```

### Step 4: Set Environment Variables

```bash
# Set your OpenAI API key
railway variables set OPENAI_API_KEY=your_openai_api_key_here

# Set production environment
railway variables set NODE_ENV=production

# Set port (Railway will override this)
railway variables set PORT=3001
```

### Step 5: Deploy

```bash
# Deploy using Railway Dockerfile
railway up --dockerfile Dockerfile.railway

# Or deploy with automatic detection
railway up
```

## ⚙️ Configuration Files

### Railway Configuration (`railway.json`)

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile.railway"
  },
  "deploy": {
    "startCommand": "/app/start.sh",
    "healthcheckPath": "/api/status",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | `sk-proj-...` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port (auto-assigned by Railway) | `3001` |

## 🌐 Domain & SSL

### Custom Domain Setup

1. **Add Custom Domain**
   ```bash
   railway domain add yourdomain.com
   ```

2. **DNS Configuration**
   - Add CNAME record: `your-subdomain` → `your-app.railway.app`
   - Or A record to Railway's IP

3. **SSL Certificate**
   - Railway automatically provides SSL certificates
   - Access your app via `https://yourdomain.com`

### Railway Subdomain

Your app will be available at:
- `https://your-project-name.railway.app`

## 📊 Monitoring & Logs

### View Logs

```bash
# Real-time logs
railway logs

# Follow logs
railway logs --follow

# Service-specific logs
railway logs --service backend
```

### Monitoring Dashboard

1. Visit your Railway dashboard
2. Navigate to your project
3. Monitor:
   - CPU usage
   - Memory consumption
   - Request metrics
   - Error rates

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check build logs
   railway logs --build
   
   # Rebuild from scratch
   railway up --detach
   ```

2. **Environment Variables Not Set**
   ```bash
   # List all variables
   railway variables
   
   # Set missing variables
   railway variables set VARIABLE_NAME=value
   ```

3. **Port Binding Issues**
   ```javascript
   // Ensure your server uses Railway's PORT
   const PORT = process.env.PORT || 3001;
   server.listen(PORT, '0.0.0.0', () => {
     console.log(`Server running on port ${PORT}`);
   });
   ```

4. **File Upload Issues**
   ```bash
   # Railway has ephemeral storage
   # Use cloud storage for persistent files
   railway variables set UPLOAD_STORAGE=cloudinary
   ```

### Health Check

Railway automatically monitors your app's health via `/api/status`

## 🔄 CI/CD Pipeline

### Automatic Deployments

1. **Connect GitHub**
   - Link your GitHub repository
   - Enable automatic deployments
   - Every push to main branch deploys automatically

2. **Manual Deployments**
   ```bash
   # Deploy specific branch
   railway up --branch feature-branch
   
   # Deploy with build args
   railway up --build-arg NODE_ENV=production
   ```

## 💰 Pricing & Limits

### Free Tier (Hobby Plan)
- $5 credit per month
- Up to 500 hours of usage
- 1GB RAM
- 1GB storage (ephemeral)

### Pro Plan
- $20/month base
- Pay-as-you-use
- More resources
- Team collaboration

## 📈 Performance Optimization

### Railway-Specific Optimizations

1. **Resource Allocation**
   ```bash
   # Set memory limit
   railway variables set RAILWAY_MEMORY_LIMIT=1024
   
   # Set CPU limit
   railway variables set RAILWAY_CPU_LIMIT=1000
   ```

2. **Build Optimization**
   ```dockerfile
   # Use multi-stage builds (already in Dockerfile.railway)
   # Cache npm dependencies
   # Minimize image size
   ```

3. **Database Optimization**
   ```bash
   # Add PostgreSQL
   railway add postgresql
   
   # Add Redis for caching
   railway add redis
   ```

## 🔐 Security Best Practices

### Environment Security

```bash
# Never commit secrets
echo "*.env*" >> .gitignore

# Use Railway's secure variable storage
railway variables set SECRET_KEY=your_secret_key
```

### Network Security

- Railway provides HTTPS by default
- Use environment variables for all secrets
- Enable CORS properly in production
- Validate all user inputs

## 🚀 Scaling

### Horizontal Scaling

```bash
# Scale replicas (Pro plan)
railway scale --replicas 3

# Auto-scaling based on CPU
railway autoscale --min 1 --max 5 --cpu 80
```

### Vertical Scaling

```bash
# Increase memory
railway scale --memory 2048

# Increase CPU
railway scale --cpu 2000
```

## 📱 Mobile & PWA Support

Your J.A.R.V.I.S deployment supports:
- Mobile responsive design
- Progressive Web App features
- Offline functionality
- Push notifications

## 🔧 Advanced Configuration

### Custom Build Commands

```json
{
  "build": {
    "builder": "DOCKERFILE",
    "buildCommand": "npm run build:railway"
  }
}
```

### Multiple Services

```yaml
# railway.yaml for multiple services
services:
  backend:
    source: .
    dockerfile: Dockerfile.backend
  
  frontend:
    source: .
    dockerfile: Dockerfile.frontend
```

## 📞 Support & Resources

### Railway Documentation
- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Railway Blog](https://blog.railway.app)

### J.A.R.V.I.S Specific
- Check your repository's Issues tab
- Railway deployment logs
- System status at `/api/status`

---

## 🎉 Deployment Success!

After deployment, your J.A.R.V.I.S will be available at:
- **Production URL**: `https://your-project.railway.app`
- **API Endpoint**: `https://your-project.railway.app/api/status`
- **Health Check**: `https://your-project.railway.app/health`

### Quick Verification

```bash
# Test your deployment
curl https://your-project.railway.app/api/status

# Expected response:
# {"status":{"neuralNetworks":"Simulated","voiceRecognition":"Ready",...}
```

**🎊 Congratulations! Your J.A.R.V.I.S - Just a Reality Versatile System is now live on Railway!** 