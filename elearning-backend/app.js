// Load environment-specific configuration
const path = require('path');

// Determine environment
const isProduction = process.env.NODE_ENV === 'production' ||
                    process.env.VERCEL ||
                    process.env.RENDER ||
                    !process.env.NODE_ENV?.includes('dev');

// Load appropriate .env file
const envFile = isProduction ? '.env.production' : '.env.development';
const envPath = path.join(__dirname, envFile);

require('dotenv').config({ path: envPath });

// Fallback to default .env if specific env file doesn't exist
require('dotenv').config();

console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Loading config from: ${envFile}`);
console.log(`MongoDB URI: ${process.env.MONGODB_URI ? 'Configured' : 'Not configured'}`);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS configuration
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

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

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/enrollments', require('./routes/enrollments'));

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
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);

    if (err.message.includes('authentication failed')) {
      console.log('\n🔧 MongoDB Atlas Authentication Fix Required:');
      console.log('1. Go to https://cloud.mongodb.com/');
      console.log('2. Navigate to Database Access');
      console.log('3. Verify user "ediomoemmaeffiong" exists');
      console.log('4. If user doesn\'t exist, create it with password "Ed10m0Ed10m0"');
      console.log('5. Ensure user has "Atlas admin" or "Read and write to any database" role');
      console.log('6. Go to Network Access and add IP 0.0.0.0/0 (allow from anywhere)');
      console.log('7. Wait 1-2 minutes for changes to propagate');
    }

    console.log('\n⚠️  Running in development mode without database');
    console.log('📝 Note: Authentication will work with in-memory storage for development');
  }
};

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 