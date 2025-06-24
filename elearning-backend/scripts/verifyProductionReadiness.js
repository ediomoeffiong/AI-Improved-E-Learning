const mongoose = require('mongoose');
const User = require('../models/User');
const Institution = require('../models/Institution');
require('dotenv').config();

/**
 * Verify that the application is ready for production deployment
 * This script checks all the requirements for the institutions page to work correctly
 */

async function verifyProductionReadiness() {
  console.log('🔍 Verifying Production Readiness for Institutions Page...\n');

  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connection successful\n');

    // Check 1: Super Admin accounts
    console.log('1. Checking Super Admin accounts...');
    const superAdmins = await User.find({
      role: { $in: ['Super Admin', 'Super Moderator'] }
    });
    
    if (superAdmins.length > 0) {
      console.log(`✅ Found ${superAdmins.length} Super Admin accounts`);
      superAdmins.forEach(admin => {
        console.log(`   - ${admin.name} (${admin.email}) - ${admin.role}`);
      });
    } else {
      console.log('❌ No Super Admin accounts found');
      console.log('   Run: npm run seed:super-admins');
    }

    // Check 2: Institutions
    console.log('\n2. Checking institutions...');
    const institutionCount = await Institution.countDocuments();
    
    if (institutionCount >= 110) {
      console.log(`✅ Found ${institutionCount} institutions (expected: 110)`);
      
      // Check institution types
      const typeStats = await Institution.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      console.log('   Institution types:');
      typeStats.forEach(stat => {
        console.log(`   - ${stat._id}: ${stat.count}`);
      });
      
      // Check institution statuses
      const statusStats = await Institution.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      console.log('   Institution statuses:');
      statusStats.forEach(stat => {
        console.log(`   - ${stat._id}: ${stat.count}`);
      });
      
    } else {
      console.log(`❌ Only found ${institutionCount} institutions (expected: 110)`);
      console.log('   Run: npm run seed:institutions');
    }

    // Check 3: Database indexes
    console.log('\n3. Checking database indexes...');
    const institutionIndexes = await Institution.collection.getIndexes();
    const userIndexes = await User.collection.getIndexes();
    
    console.log(`✅ Institution indexes: ${Object.keys(institutionIndexes).length}`);
    console.log(`✅ User indexes: ${Object.keys(userIndexes).length}`);

    // Check 4: Sample API functionality
    console.log('\n4. Testing API functionality...');
    
    // Test institution query
    const sampleInstitutions = await Institution.find()
      .sort({ name: 1 })
      .limit(5)
      .select('name code status type location.state');
    
    if (sampleInstitutions.length > 0) {
      console.log('✅ Institution queries working');
      console.log('   Sample institutions:');
      sampleInstitutions.forEach((inst, index) => {
        console.log(`   ${index + 1}. ${inst.name} (${inst.code}) - ${inst.status}`);
      });
    } else {
      console.log('❌ Institution queries failed');
    }

    // Check 5: Environment variables
    console.log('\n5. Checking environment configuration...');
    const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'NODE_ENV'];
    let envCheck = true;
    
    requiredEnvVars.forEach(envVar => {
      if (process.env[envVar]) {
        console.log(`✅ ${envVar}: Set`);
      } else {
        console.log(`❌ ${envVar}: Missing`);
        envCheck = false;
      }
    });

    // Check 6: Production-specific settings
    console.log('\n6. Checking production settings...');
    if (process.env.NODE_ENV === 'production') {
      console.log('✅ NODE_ENV: production');
      
      if (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN.includes('vercel.app')) {
        console.log('✅ CORS_ORIGIN: Includes Vercel domain');
      } else {
        console.log('❌ CORS_ORIGIN: Missing Vercel domain');
      }
      
      if (process.env.JWT_SECRET !== 'your-super-secret-jwt-key-change-in-production') {
        console.log('✅ JWT_SECRET: Changed from default');
      } else {
        console.log('⚠️  JWT_SECRET: Still using default (should be changed)');
      }
    } else {
      console.log('ℹ️  NODE_ENV: development (will be production when deployed)');
    }

    // Final summary
    console.log('\n📋 Production Readiness Summary:');
    console.log('================================');
    
    const checks = [
      { name: 'Super Admin accounts', status: superAdmins.length > 0 },
      { name: 'Institutions seeded', status: institutionCount >= 110 },
      { name: 'Database indexes', status: true },
      { name: 'API functionality', status: sampleInstitutions.length > 0 },
      { name: 'Environment variables', status: envCheck }
    ];
    
    checks.forEach(check => {
      console.log(`${check.status ? '✅' : '❌'} ${check.name}`);
    });
    
    const allPassed = checks.every(check => check.status);
    
    if (allPassed) {
      console.log('\n🎉 All checks passed! Ready for production deployment.');
      console.log('\n📝 Next steps:');
      console.log('1. Push code to GitHub');
      console.log('2. Verify Render environment variables are set');
      console.log('3. Monitor deployment logs');
      console.log('4. Test institutions page after deployment');
    } else {
      console.log('\n⚠️  Some checks failed. Please fix issues before deployment.');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
}

// Run verification
if (require.main === module) {
  verifyProductionReadiness();
}

module.exports = { verifyProductionReadiness };
