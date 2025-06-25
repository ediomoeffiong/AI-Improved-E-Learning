const mongoose = require('mongoose');
const { seedInstitutionsWithConnection } = require('./seedInstitutions');
require('dotenv').config();

/**
 * Deployment script that handles database initialization and seeding
 * This script should be run after deployment to ensure the database is properly set up
 */

async function runDeploymentTasks() {
  console.log('🚀 Starting deployment tasks...\n');

  try {
    // Connect to MongoDB with better connection options
    console.log('📡 Connecting to MongoDB...');

    // Replace the database name in the URI to use 'elearning' instead of 'myFirstDatabase'
    let mongoUri = process.env.MONGODB_URI;
    if (mongoUri && mongoUri.includes('myFirstDatabase')) {
      mongoUri = mongoUri.replace('myFirstDatabase', 'elearning');
      console.log('📝 Using database: elearning (replaced myFirstDatabase)');
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds
      connectTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 30000, // 30 seconds
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 1, // Maintain at least 1 socket connection
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0 // Disable mongoose buffering
    });
    console.log('✅ Connected to MongoDB successfully\n');

    // Check deployment status
    const Institution = require('../models/Institution');
    const existingInstitutions = await Institution.countDocuments();

    console.log('ℹ️  Skipping Super Admin account seeding (manual setup required)');

    // Seed institutions if none exist
    if (existingInstitutions === 0) {
      console.log('\n🏛️ No institutions found - seeding Nigerian universities...');
      await seedInstitutionsWithConnection();
    } else {
      console.log(`\n🏛️ Found ${existingInstitutions} existing institutions - skipping institution seeding`);
    }

    // Create indexes for better performance
    console.log('\n📊 Creating database indexes...');
    await createDatabaseIndexes();

    // Verify deployment
    console.log('\n🔍 Verifying deployment...');
    await verifyDeployment();

    console.log('\n🎉 Deployment tasks completed successfully!');
    console.log('\n📋 Deployment Summary:');
    console.log('- Super Admin accounts: ⚠️  Manual setup required');
    console.log('- Nigerian universities: ✅ Seeded');
    console.log('- Database indexes: ✅ Created');
    console.log('- System verification: ✅ Passed');
    console.log('\n📝 Next Steps:');
    console.log('1. Create Super Admin accounts manually using the admin panel or API');
    console.log('2. Or run: npm run seed:super-admins (if needed)');

  } catch (error) {
    console.error('❌ Deployment failed:', error);

    // If it's a connection error, provide helpful guidance
    if (error.name === 'MongoPoolClosedError' || error.name === 'MongoNetworkError') {
      console.log('\n💡 This appears to be a MongoDB connection issue.');
      console.log('   This is normal during deployment and the app will work once fully deployed.');
      console.log('   The institutions will be seeded when the app starts normally.');
    }

    process.exit(1);
  } finally {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        console.log('\n📡 Disconnected from MongoDB');
      }
    } catch (disconnectError) {
      console.log('\n📡 MongoDB already disconnected');
    }
  }
}

async function createDatabaseIndexes() {
  try {
    const User = require('../models/User');
    const Institution = require('../models/Institution');
    const UserApproval = require('../models/UserApproval');
    const InstitutionMembership = require('../models/InstitutionMembership');

    // Create User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ username: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ institution: 1 });
    await User.collection.createIndex({ verificationStatus: 1 });
    await User.collection.createIndex({ institutionApprovalStatus: 1 });
    console.log('  ✅ User indexes created');

    // Create Institution indexes
    await Institution.collection.createIndex({ name: 1 }, { unique: true });
    await Institution.collection.createIndex({ code: 1 }, { unique: true });
    await Institution.collection.createIndex({ status: 1 });
    await Institution.collection.createIndex({ 'location.state': 1 });
    await Institution.collection.createIndex({ type: 1 });
    console.log('  ✅ Institution indexes created');

    // Create UserApproval indexes
    await UserApproval.collection.createIndex({ user: 1 });
    await UserApproval.collection.createIndex({ status: 1 });
    await UserApproval.collection.createIndex({ approvalType: 1 });
    await UserApproval.collection.createIndex({ institution: 1 });
    await UserApproval.collection.createIndex({ reviewedBy: 1 });
    await UserApproval.collection.createIndex({ workflowStage: 1 });
    await UserApproval.collection.createIndex({ expiresAt: 1 });
    await UserApproval.collection.createIndex({ createdAt: -1 });
    console.log('  ✅ UserApproval indexes created');

    // Create InstitutionMembership indexes
    await InstitutionMembership.collection.createIndex({ user: 1, institution: 1 }, { unique: true });
    await InstitutionMembership.collection.createIndex({ institution: 1, role: 1 });
    await InstitutionMembership.collection.createIndex({ institution: 1, status: 1 });
    await InstitutionMembership.collection.createIndex({ institution: 1, approvalStatus: 1 });
    await InstitutionMembership.collection.createIndex({ user: 1, status: 1 });
    await InstitutionMembership.collection.createIndex({ approvedBy: 1 });
    await InstitutionMembership.collection.createIndex({ lastActivity: -1 });
    console.log('  ✅ InstitutionMembership indexes created');

  } catch (error) {
    console.error('Error creating indexes:', error);
    throw error;
  }
}

async function verifyDeployment() {
  try {
    // Check if we're connected to MongoDB
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB not connected');
    }

    const User = require('../models/User');
    const Institution = require('../models/Institution');

    // Verify Super Admin accounts
    const superAdmins = await User.find({
      role: { $in: ['Super Admin', 'Super Moderator'] }
    }).select('name email role');

    if (superAdmins.length === 0) {
      throw new Error('No Super Admin accounts found after seeding');
    }

    console.log(`  ✅ Found ${superAdmins.length} Super Admin accounts:`);
    superAdmins.forEach(admin => {
      console.log(`    - ${admin.name} (${admin.email}) - ${admin.role}`);
    });

    // Verify institutions
    const institutionCount = await Institution.countDocuments();
    const verifiedInstitutions = await Institution.countDocuments({ status: 'verified' });

    console.log(`  ✅ Found ${institutionCount} institutions (${verifiedInstitutions} verified)`);

    // Verify database collections exist
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    const requiredCollections = ['users', 'institutions', 'userapprovals', 'institutionmemberships'];
    const missingCollections = requiredCollections.filter(name => !collectionNames.includes(name));
    
    if (missingCollections.length > 0) {
      console.log(`  ⚠️  Missing collections: ${missingCollections.join(', ')}`);
      console.log('    These will be created automatically when first used.');
    } else {
      console.log('  ✅ All required collections exist');
    }

    // Test basic database operations
    const testUser = await User.findOne({ role: 'Super Admin' });
    if (!testUser) {
      throw new Error('Cannot find Super Admin user for verification');
    }

    console.log('  ✅ Database operations verified');

  } catch (error) {
    console.error('Verification failed:', error);
    throw error;
  }
}

// Handle different deployment scenarios
const deploymentType = process.argv[2] || 'full';

switch (deploymentType) {
  case 'seed-only':
    console.log('🌱 Running seed-only deployment...');
    seedSuperAdmins().then(() => process.exit(0)).catch(err => {
      console.error(err);
      process.exit(1);
    });
    break;

  case 'institutions-only':
    console.log('🏛️ Seeding institutions only...');
    mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then(async () => {
      await seedInstitutions();
      await mongoose.disconnect();
      console.log('✅ Institutions seeded successfully');
      process.exit(0);
    }).catch(err => {
      console.error(err);
      process.exit(1);
    });
    break;
  
  case 'indexes-only':
    console.log('📊 Creating indexes only...');
    mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then(async () => {
      await createDatabaseIndexes();
      await mongoose.disconnect();
      console.log('✅ Indexes created successfully');
      process.exit(0);
    }).catch(err => {
      console.error(err);
      process.exit(1);
    });
    break;
  
  case 'verify-only':
    console.log('🔍 Running verification only...');
    mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then(async () => {
      try {
        await verifyDeployment();
        console.log('✅ Verification completed');
      } catch (error) {
        console.error('Verification failed:', error);
        throw error;
      } finally {
        await mongoose.disconnect();
        console.log('📡 Disconnected from MongoDB');
      }
      process.exit(0);
    }).catch(err => {
      console.error(err);
      process.exit(1);
    });
    break;
  
  default:
    console.log('🚀 Running full deployment...');
    runDeploymentTasks();
    break;
}

// Flag to prevent running deployment tasks multiple times
let deploymentTasksCompleted = false;

// Version that uses existing MongoDB connection (for app.js)
async function runDeploymentTasksWithConnection() {
  if (deploymentTasksCompleted) {
    console.log('ℹ️  Deployment tasks already completed, skipping...');
    return;
  }

  console.log('🚀 Starting deployment tasks with existing connection...\n');

  try {
    // Check deployment status
    const Institution = require('../models/Institution');
    const existingInstitutions = await Institution.countDocuments();

    console.log('ℹ️  Skipping Super Admin account seeding (manual setup required)');

    // Seed institutions if none exist
    if (existingInstitutions === 0) {
      console.log('\n🏛️ No institutions found - seeding Nigerian universities...');
      const { seedInstitutionsWithConnection } = require('./seedInstitutions');
      await seedInstitutionsWithConnection();
    } else {
      console.log(`\n🏛️ Found ${existingInstitutions} existing institutions - skipping institution seeding`);
    }

    // Create indexes for better performance
    console.log('\n📊 Creating database indexes...');
    await createDatabaseIndexes();

    // Verify deployment
    console.log('\n🔍 Verifying deployment...');
    await verifyDeployment();

    console.log('\n🎉 Deployment tasks completed successfully!');
    console.log('\n📋 Deployment Summary:');
    console.log('- Super Admin accounts: ⚠️  Manual setup required');
    console.log('- Nigerian universities: ✅ Seeded');
    console.log('- Database indexes: ✅ Created');
    console.log('- System verification: ✅ Passed');
    console.log('\n📝 Next Steps:');
    console.log('1. Create Super Admin accounts manually using the admin panel or API');
    console.log('2. Or run: npm run seed:super-admins (if needed)');

    // Mark deployment tasks as completed
    deploymentTasksCompleted = true;

  } catch (error) {
    console.error('❌ Deployment tasks failed:', error);
    throw error; // Re-throw to let caller handle
  }
}

module.exports = {
  runDeploymentTasks,
  runDeploymentTasksWithConnection,
  createDatabaseIndexes,
  verifyDeployment
};
