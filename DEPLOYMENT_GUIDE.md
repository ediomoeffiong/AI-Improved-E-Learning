# Deployment Guide for E-Learning Platform

## Overview
This guide will help you deploy both the backend and frontend of your e-learning platform to make it fully functional in production.

## Backend Deployment

### Option 1: Railway (Recommended - Free tier available)

1. **Sign up for Railway**: Go to [railway.app](https://railway.app) and sign up with GitHub
2. **Create a new project**: Click "New Project" → "Deploy from GitHub repo"
3. **Select your repository**: Choose your `AI-Improved-E-Learning` repository
4. **Configure the service**:
   - Set the root directory to `elearning-backend`
   - Railway will automatically detect it's a Node.js app
5. **Set environment variables** in Railway dashboard:
   ```
   MONGODB_URI=mongodb+srv://your-mongodb-atlas-connection-string
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   NODE_ENV=production
   CORS_ORIGIN=https://your-vercel-app-url.vercel.app
   ```
6. **Deploy**: Railway will automatically deploy your backend

### Option 2: Render (Alternative free option)

1. **Sign up for Render**: Go to [render.com](https://render.com)
2. **Create a new Web Service**: Connect your GitHub repository
3. **Configure**:
   - Root Directory: `elearning-backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Set environment variables** (same as Railway above)

### Option 3: Heroku

1. **Install Heroku CLI** and login
2. **Create a new app**:
   ```bash
   cd elearning-backend
   heroku create your-app-name
   ```
3. **Set environment variables**:
   ```bash
   heroku config:set MONGODB_URI=your-mongodb-connection-string
   heroku config:set JWT_SECRET=your-secret-key
   heroku config:set NODE_ENV=production
   heroku config:set CORS_ORIGIN=https://your-vercel-app-url.vercel.app
   ```
4. **Deploy**:
   ```bash
   git subtree push --prefix elearning-backend heroku main
   ```

## Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas account**: Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. **Create a cluster**: Choose the free tier
3. **Create a database user**: Set username and password
4. **Whitelist IP addresses**: Add `0.0.0.0/0` for all IPs (or specific IPs)
5. **Get connection string**: Copy the connection string and replace `<password>` with your database password

## Frontend Configuration

### Update Environment Variables for Production

1. **In your Vercel dashboard**:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add: `VITE_API_URL` = `https://your-backend-url.railway.app/api` (or your chosen backend URL)

2. **Redeploy your frontend**: Vercel will automatically redeploy with the new environment variable

## Testing the Deployment

1. **Test backend**: Visit your backend URL (e.g., `https://your-backend-url.railway.app`)
2. **Test API endpoints**: Try `https://your-backend-url.railway.app/api/courses`
3. **Test frontend**: Visit your Vercel app and try logging in

## Troubleshooting

### Common Issues:

1. **CORS errors**: Make sure `CORS_ORIGIN` in backend matches your frontend URL exactly
2. **Database connection**: Verify MongoDB Atlas connection string and IP whitelist
3. **Environment variables**: Ensure all required env vars are set in both backend and frontend
4. **Build failures**: Check logs in your deployment platform

### Debug Steps:

1. **Check backend logs**: Look at deployment platform logs
2. **Check frontend console**: Open browser dev tools for errors
3. **Test API directly**: Use Postman or curl to test backend endpoints
4. **Verify environment variables**: Ensure they're properly set in deployment platforms

## Security Notes

- Never commit `.env` files to git
- Use strong, random JWT secrets
- Regularly rotate secrets
- Use HTTPS in production
- Restrict CORS origins to your actual frontend domains
