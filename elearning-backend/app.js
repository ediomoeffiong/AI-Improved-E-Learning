// Load environment configuration
require('dotenv').config();

console.log('=== Environment Configuration ===');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`MongoDB URI: ${process.env.MONGODB_URI ? 'Configured' : 'Not configured'}`);
console.log(`Port: ${process.env.PORT || 5000}`);
console.log('================================');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Trust proxy for production deployment (Render, Heroku, etc.)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Trust first proxy
  console.log('🔒 Trust proxy enabled for production');
} else {
  console.log('🔒 Trust proxy disabled for development');
}

// CORS configuration
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

// Add debug logging for CORS
console.log('🔧 CORS Configuration:');
console.log('CORS_ORIGIN env var:', process.env.CORS_ORIGIN);
console.log('Allowed origins:', corsOrigins);

const corsOptions = {
  origin: corsOrigins,
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Elearning Backend API');
});

// API health check
app.get('/api', (req, res) => {
  res.json({
    message: 'Elearning Backend API is running',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/practice-tests', require('./routes/practiceTests'));
app.use('/api/assessments', require('./routes/assessments'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/super-admin', require('./routes/superAdmin'));
app.use('/api/institution-admin', require('./routes/institutionAdmin'));
app.use('/api/institution-membership', require('./routes/institutionMembership'));
app.use('/api/2fa', require('./routes/twoFactorAuth'));

// Connect to MongoDB with enhanced error handling and fallback
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Connected to database: ${mongoose.connection.name}`);

    // Run deployment tasks in production after successful connection
    if (process.env.NODE_ENV === 'production') {
      console.log('🚀 Production environment detected - running deployment tasks...');
      try {
        const { runDeploymentTasksWithConnection } = require('./scripts/deploy');
        await runDeploymentTasksWithConnection();
      } catch (deployError) {
        console.error('⚠️  Deployment tasks failed, but app will continue:', deployError.message);
        console.log('💡 Institutions may need to be seeded manually if this is the first deployment');
      }
    }
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('\n🔧 Local MongoDB Setup Required:');
    console.log('1. Install MongoDB Community Server: https://www.mongodb.com/try/download/community');
    console.log('2. Or use Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest');
    console.log('3. Ensure MongoDB is running on localhost:27017');
    console.log('\n⚠️  Running in development mode without database');
    console.log('📝 Note: Authentication will work with in-memory storage for development');
  }
};

connectDB();

// Start server for all environments except Vercel serverless
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📍 Backend URL: ${process.env.NODE_ENV === 'production' ? 'https://ai-improved-e-learning.onrender.com' : `http://localhost:${PORT}`}`);
});

// Export for serverless platforms (Vercel, etc.)
module.exports = app;