#!/bin/bash

# Railway Deployment Script for J.A.R.V.I.S
# Just a Reality Versatile System by Arhaan

set -e

echo "🚄 Starting Railway Deployment for J.A.R.V.I.S"
echo "============================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed"
    echo "📥 Installing Railway CLI..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install railway
        else
            curl -fsSL https://railway.app/install.sh | sh
        fi
    else
        # Linux/Windows
        curl -fsSL https://railway.app/install.sh | sh
    fi
    
    echo "✅ Railway CLI installed successfully"
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway..."
    railway login
fi

echo "👤 Logged in as: $(railway whoami)"

# Check if project exists, if not create it
if ! railway status &> /dev/null; then
    echo "🆕 Creating new Railway project..."
    railway init jarvis-reality-system
    echo "✅ Project created successfully"
else
    echo "✅ Using existing Railway project"
fi

# Check for required environment variables
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  OPENAI_API_KEY not found in environment"
    read -p "🔑 Enter your OpenAI API key: " OPENAI_API_KEY
    
    if [ -z "$OPENAI_API_KEY" ]; then
        echo "❌ OpenAI API key is required for deployment"
        exit 1
    fi
fi

echo "🔧 Setting up environment variables..."

# Set environment variables
railway variables set OPENAI_API_KEY="$OPENAI_API_KEY"
railway variables set NODE_ENV=production
railway variables set PORT=3001

echo "✅ Environment variables configured"

# Build and deploy
echo "🚀 Starting deployment..."
echo "📦 Building Docker image..."

# Deploy using Railway optimized Dockerfile
railway up --dockerfile Dockerfile.railway

echo "⏳ Waiting for deployment to complete..."
sleep 10

# Get deployment URL
DEPLOYMENT_URL=$(railway domain 2>/dev/null || echo "Check Railway dashboard for URL")

echo ""
echo "🎉 J.A.R.V.I.S Deployment Complete!"
echo "=================================="
echo ""
echo "🌐 Your application is now live!"
echo "📍 URL: $DEPLOYMENT_URL"
echo ""
echo "🔍 Quick Links:"
echo "   • Dashboard: https://railway.app/dashboard"
echo "   • Logs: railway logs --follow"
echo "   • Status: railway status"
echo ""
echo "🔧 Useful Commands:"
echo "   • View logs: railway logs"
echo "   • Check status: railway status"
echo "   • Update vars: railway variables set KEY=value"
echo "   • Redeploy: railway up"
echo ""
echo "📊 To verify deployment:"
echo "   curl $DEPLOYMENT_URL/api/status"
echo ""

# Test the deployment
echo "🧪 Testing deployment..."
if [ "$DEPLOYMENT_URL" != "Check Railway dashboard for URL" ]; then
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/api/status" || echo "000")
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo "✅ Deployment successful! API is responding"
    else
        echo "⚠️  Deployment may still be starting (HTTP $HTTP_STATUS)"
        echo "   Check logs with: railway logs"
    fi
else
    echo "ℹ️  Check your Railway dashboard for the deployment URL"
fi

echo ""
echo "🎊 J.A.R.V.I.S - Just a Reality Versatile System is now live on Railway!"
echo "   Built with ❤️ by Arhaan" 