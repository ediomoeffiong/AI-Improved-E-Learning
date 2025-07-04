#!/bin/bash

# Deployment helper script for E-Learning Platform

echo "🚀 E-Learning Platform Deployment Helper"
echo "========================================"

echo ""
echo "📋 Pre-deployment Checklist:"
echo "1. ✅ Backend configuration files created"
echo "2. ✅ Frontend environment variables configured"
echo "3. ✅ Institution seeding script ready"
echo "4. ⏳ MongoDB Atlas database setup (manual step)"
echo "5. ⏳ Backend deployment (manual step)"
echo "6. ⏳ Frontend environment variable update (manual step)"

echo ""
echo "🔧 Next Steps:"
echo ""
echo "1. Set up MongoDB Atlas:"
echo "   - Go to https://mongodb.com/atlas"
echo "   - Create a free cluster"
echo "   - Create database user and get connection string"
echo ""
echo "2. Deploy Backend (choose one):"
echo "   a) Railway: https://railway.app"
echo "   b) Render: https://render.com"
echo "   c) Heroku: https://heroku.com"
echo ""
echo "3. Update Frontend Environment:"
echo "   - Go to your Vercel dashboard"
echo "   - Add VITE_API_URL environment variable"
echo "   - Set it to your deployed backend URL + '/api'"
echo ""
echo "4. Test your deployment:"
echo "   - Visit your Vercel app"
echo "   - Try logging in"
echo "   - Check browser console for errors"
echo "   - Verify institutions are seeded in Super Admin dashboard"

echo ""
echo "🏛️ Institution Seeding:"
echo "   - Automatically runs on first deployment"
echo "   - Seeds 123+ Nigerian universities"
echo "   - Manual seeding: npm run seed:institutions"
echo "   - Deploy institutions only: npm run deploy:institutions"

echo ""
echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo ""
echo "🆘 Need help? Check the troubleshooting section in the deployment guide."
