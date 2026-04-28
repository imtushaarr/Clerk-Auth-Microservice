#!/bin/bash

# Clerk Auth Microservice - Installation Guide

echo "🚀 Clerk Auth Microservice Setup"
echo "================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "📝 Environment Setup"
echo "===================="
echo ""
echo "Create a .env.local file with the following variables:"
echo ""
echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key_here"
echo "CLERK_SECRET_KEY=your_key_here"
echo "CLERK_WEBHOOK_SECRET=your_secret_here"
echo "TESTMAIL_NAMESPACE=your_namespace_here"
echo "TESTMAIL_API_KEY=your_api_key_here"
echo ""
echo "📚 Get your credentials from:"
echo "  - Clerk: https://dashboard.clerk.com"
echo "  - testmail.app: https://testmail.app"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Please create it with your credentials."
    echo ""
fi

echo "🎉 Setup complete!"
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "The application will be available at: http://localhost:5173"
