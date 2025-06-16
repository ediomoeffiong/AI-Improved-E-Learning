# Deploy Backend to Vercel (24/7 Availability)

## 🎯 Why Vercel for Backend?

- ✅ **Unlimited hours** (no 750-hour limit like Render)
- ✅ **No sleeping** - always available
- ✅ **Same platform** as your frontend
- ✅ **Instant scaling**
- ✅ **Free tier** with generous limits

## 🚀 Deployment Steps

### Step 1: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Login with GitHub** (same account as frontend)
3. **Click "Add New..." → "Project"**
4. **Import your repository: `AI-Improved-E-Learning`**
5. **Configure the project:**
   - **Framework Preset:** Other
   - **Root Directory:** `elearning-backend`
   - **Build Command:** `npm install` (or leave empty)
   - **Output Directory:** Leave empty
   - **Install Command:** `npm install`

### Step 2: Set Environment Variables

In Vercel dashboard → Your Project → Settings → Environment Variables:

```
NODE_ENV = production
MONGODB_URI = mongodb+srv://ediomoemmaeffiong:Ed10m0Ed10m0@aielearning.cr977qp.mongodb.net/test?retryWrites=true&w=majority
JWT_SECRET = your-secure-jwt-secret-here
CORS_ORIGIN = https://ai-improved-e-learning.vercel.app
PORT = 3000
```

### Step 3: Get Your Backend URL

After deployment, you'll get a URL like:
`https://your-backend-name.vercel.app`

### Step 4: Update Frontend Configuration

Update `elearning-frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-name.vercel.app/api
```

### Step 5: Redeploy Frontend

Push changes to trigger frontend redeploy on Vercel.

## 🔧 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB Atlas user exists with correct permissions
- Whitelist IP: 0.0.0.0/0 (allow from anywhere)
- Use the connection string with `/test` database

### CORS Issues
- Ensure CORS_ORIGIN matches your frontend URL exactly
- No trailing slashes in URLs

### Cold Starts
- First request might be slower (1-2 seconds)
- Subsequent requests are instant

## ✅ Final Architecture

```
Frontend (Vercel) → Backend (Vercel) → MongoDB Atlas
     ↓                    ↓
24/7 Available      24/7 Available
```

## 🎉 Benefits

- **True 24/7 availability** for both frontend and backend
- **Single platform** management
- **Automatic deployments** from Git
- **No usage limits** on free tier
- **Global CDN** for fast response times
