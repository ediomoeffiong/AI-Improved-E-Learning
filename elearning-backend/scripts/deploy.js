const mongoose = require('mongoose');
const { seedSuperAdmins, updateSuperAdmins, seedSuperAdminsWithConnection, updateSuperAdminsWithConnection } = require('./seedSuperAdmins');
const { seedInstitutions, seedInstitutionsWithConnection } = require('./seedInstitutions');
require('dotenv').config();

/**
 * Deployment script that handles database initialization and seeding
 * This script should be run after deployment to ensure the database is properly set up
 */

async function runDeploymentTasks() {
  console.log('🚀 Starting deployment tasks...\n');

  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully\n');

    // Check if this is a fresh deployment or an update
    const User = require('../models/User');
    const Institution = require('../models/Institution');

    const existingSuperAdmins = await User.countDocuments({
      role: { $in: ['Super Admin', 'Super Moderator'] }
    });
    const existingInstitutions = await Institution.countDocuments();

    if (existingSuperAdmins === 0) {
      console.log('🆕 Fresh deployment detected - seeding Super Admin accounts...');
      await seedSuperAdminsWithConnection();
    } else {
      console.log('🔄 Existing deployment detected - updating Super Admin accounts...');
      await updateSuperAdminsWithConnection();
    }

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
    console.log('- Super Admin accounts: ✅ Ready');
    console.log('- Nigerian universities: ✅ Seeded');
    console.log('- Database indexes: ✅ Created');
    console.log('- System verification: ✅ Passed');
    console.log('\n🔐 Default Super Admin Credentials:');
    console.log('Email: superadmin@app.com | Username: superadmin | Password: SuperAdmin123!');
    console.log('Email: supermod@app.com | Username: supermod | Password: SuperMod123!');
    console.log('\n⚠️  IMPORTANT: Change default passwords in production!');

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
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

module.exports = {
  runDeploymentTasks,
  createDatabaseIndexes,
  verifyDeployment
};
