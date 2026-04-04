#!/bin/bash

# GigShield Vercel Deployment Script

echo "🛡️  GigShield - Vercel Deployment Script"
echo "========================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
else
    echo "✅ Vercel CLI found"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Building web version..."
npm run build:web

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "🚀 Deploying to Vercel..."
    echo ""
    
    # Deploy to Vercel
    vercel --prod
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 Deployment successful!"
        echo ""
        echo "Your app is now live on Vercel!"
    else
        echo ""
        echo "❌ Deployment failed. Check the error messages above."
        exit 1
    fi
else
    echo ""
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi
