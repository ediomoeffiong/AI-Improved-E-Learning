# Elearning Backend

This is the backend for the AI Improved E-Learning platform.

## Tech Stack
- Node.js
- Express
- MongoDB (Mongoose)

## Setup

### Development (Localhost)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Update the `.env` file with your local configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/elearning
   JWT_SECRET=mysecret123
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173,http://localhost:3000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Available Scripts
- `npm run dev` - Start development server (uses .env.development)
- `npm run start` - Start production server (auto-detects environment)
- `npm run dev:prod` - Start development server with production config
- `npm run start:prod` - Force production mode
- `npm run test:env` - Test environment detection

### Environment Detection
The application automatically detects the environment and loads the appropriate configuration:

**Development Mode** (uses `.env.development`):
- When NODE_ENV is not set
- When NODE_ENV=development
- When running locally without deployment platform variables

**Production Mode** (uses `.env.production`):
- When NODE_ENV=production
- When deployed on Vercel (VERCEL env var present)
- When deployed on Render (RENDER env var present)
- When deployed on Railway (RAILWAY env var present)
- When deployed on Heroku (HEROKU env var present)

For production deployments (Vercel, Render, etc.), set these environment variables:
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-production-secret
CORS_ORIGIN=https://ai-improved-e-learning.vercel.app
```

### Environment Files
- `.env` - Default/fallback configuration
- `.env.development` - Development-specific configuration
- `.env.production` - Production-specific configuration
- `.env.example` - Template with all available options

## Project Structure
- `controllers/` - Route logic
- `models/` - Mongoose models
- `routes/` - Express routes
- `middleware/` - Custom middleware (auth, roles)
- `app.js` - Entry point

## Roles
- Student
- Instructor
- Admin 