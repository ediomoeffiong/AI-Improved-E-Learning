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

### Production Deployment
The application automatically detects the environment and loads the appropriate configuration:

- **Development**: Uses `.env.development` or falls back to `.env`
- **Production**: Uses `.env.production` or environment variables

For production deployments (Vercel, Render, etc.), set these environment variables:
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-production-secret
CORS_ORIGIN=https://your-frontend-domain.com
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