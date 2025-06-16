# Render Deployment Guide

## Backend Deployment on Render

### Environment Variables Required

Set these environment variables in your Render dashboard:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://covenanteffiong555:P@ssw0rd@appbackend.encifsv.mongodb.net/?retryWrites=true&w=majority&appName=AppBackend
JWT_SECRET=CHANGE-THIS-TO-A-SECURE-RANDOM-STRING-IN-PRODUCTION
CORS_ORIGIN=https://ai-improved-e-learning.vercel.app,https://ai-improved-e-learning.onrender.com
PORT=10000
```

### Deployment Settings

1. **Service Type**: Web Service
2. **Build Command**: `npm install`
3. **Start Command**: `npm start`
4. **Node Version**: 18.x or higher
5. **Auto-Deploy**: Yes (from main branch)

### Backend URL

Your backend is deployed at: `https://ai-improved-e-learning.onrender.com`

### API Endpoints

- Health Check: `https://ai-improved-e-learning.onrender.com/api`
- Auth Test: `https://ai-improved-e-learning.onrender.com/api/auth/test`
- Login: `https://ai-improved-e-learning.onrender.com/api/auth/login`
- Register: `https://ai-improved-e-learning.onrender.com/api/auth/register`

### Important Notes

1. **Free Tier Limitations**: Render free tier services spin down after 15 minutes of inactivity
2. **Cold Starts**: First request after inactivity may take 30-60 seconds
3. **MongoDB Connection**: Ensure MongoDB Atlas allows connections from 0.0.0.0/0
4. **CORS Configuration**: Frontend domain is whitelisted in CORS_ORIGIN

### Troubleshooting

1. **Service Won't Start**: Check logs in Render dashboard
2. **Database Connection Issues**: Verify MongoDB URI and network access
3. **CORS Errors**: Ensure frontend domain is in CORS_ORIGIN
4. **Environment Variables**: Double-check all required env vars are set

### Frontend Configuration

Update your frontend environment variables to point to Render:

```
VITE_API_URL=https://ai-improved-e-learning.onrender.com/api
```

### Monitoring

- Check service logs in Render dashboard
- Monitor uptime and response times
- Set up health check endpoints for monitoring
