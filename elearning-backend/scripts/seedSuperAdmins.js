const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

// Super Admin accounts to seed
const superAdminAccounts = [
  {
    name: 'Super Administrator',
    username: 'superadmin',
    email: 'superadmin@app.com',
    phoneNumber: '+234-800-000-0001',
    password: 'SuperAdmin123!', // Will be hashed
    role: 'Super Admin',
    isSuperAdmin: true,
    isVerified: true,
    verificationStatus: 'not_required',
    permissions: [
      'manage_users', 
      'manage_institutions', 
      'manage_platform', 
      'view_analytics',
      'approve_admins',
      'approve_moderators',
      'create_secondary_admins'
    ],
    isActive: true
  },
  {
    name: 'Super Moderator',
    username: 'supermod',
    email: 'supermod@app.com',
    phoneNumber: '+234-800-000-0002',
    password: 'SuperMod123!', // Will be hashed
    role: 'Super Moderator',
    isSuperAdmin: false,
    isVerified: true,
    verificationStatus: 'not_required',
    permissions: [
      'manage_institutions', 
      'view_analytics', 
      'approve_admins',
      'approve_moderators'
    ],
    isActive: true
  }
];

async function seedSuperAdmins() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    for (const adminData of superAdminAccounts) {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { email: adminData.email },
          { username: adminData.username }
        ]
      });

      if (existingUser) {
        console.log(`Super Admin ${adminData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(adminData.password, 12);

      // Create new super admin user
      const superAdmin = new User({
        ...adminData,
        password: hashedPassword
      });

      await superAdmin.save();
      console.log(`✅ Created Super Admin: ${adminData.name} (${adminData.email})`);
    }

    console.log('\n🎉 Super Admin seeding completed successfully!');
    console.log('\nDefault Super Admin Accounts:');
    console.log('1. Super Admin: superadmin@app.com / username: superadmin / password: SuperAdmin123!');
    console.log('2. Super Moderator: supermod@app.com / username: supermod / password: SuperMod123!');
    console.log('\n⚠️  Please change these default passwords in production!');

  } catch (error) {
    console.error('Error seeding Super Admins:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Function to update existing super admin accounts (for migrations)
async function updateSuperAdmins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB for updates');

    for (const adminData of superAdminAccounts) {
      const existingUser = await User.findOne({
        $or: [
          { email: adminData.email },
          { username: adminData.username }
        ]
      });

      if (existingUser) {
        // Update existing user with new fields
        existingUser.role = adminData.role;
        existingUser.isSuperAdmin = adminData.isSuperAdmin;
        existingUser.isVerified = adminData.isVerified;
        existingUser.verificationStatus = adminData.verificationStatus;
        existingUser.permissions = adminData.permissions;
        existingUser.isActive = adminData.isActive;

        await existingUser.save();
        console.log(`✅ Updated Super Admin: ${adminData.name} (${adminData.email})`);
      } else {
        console.log(`Super Admin ${adminData.email} not found, creating new...`);
        
        // Hash password
        const hashedPassword = await bcrypt.hash(adminData.password, 12);

        // Create new super admin user
        const superAdmin = new User({
          ...adminData,
          password: hashedPassword
        });

        await superAdmin.save();
        console.log(`✅ Created Super Admin: ${adminData.name} (${adminData.email})`);
      }
    }

    console.log('\n🎉 Super Admin update completed successfully!');

  } catch (error) {
    console.error('Error updating Super Admins:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Check command line arguments
const command = process.argv[2];

if (command === 'update') {
  updateSuperAdmins();
} else {
  seedSuperAdmins();
}

// Functions that work with existing database connections (for deployment script)
async function seedSuperAdminsWithConnection() {
  try {
    for (const adminData of superAdminAccounts) {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { email: adminData.email },
          { username: adminData.username }
        ]
      });

      if (existingUser) {
        console.log(`Super Admin ${adminData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(adminData.password, 12);

      // Create new super admin user
      const superAdmin = new User({
        ...adminData,
        password: hashedPassword
      });

      await superAdmin.save();
      console.log(`✅ Created Super Admin: ${adminData.name} (${adminData.email})`);
    }

    console.log('\n🎉 Super Admin seeding completed successfully!');
    console.log('\nDefault Super Admin Accounts:');
    console.log('1. Super Admin: superadmin@app.com / username: superadmin / password: SuperAdmin123!');
    console.log('2. Super Moderator: supermod@app.com / username: supermod / password: SuperMod123!');
    console.log('\n⚠️  Please change these default passwords in production!');

  } catch (error) {
    console.error('Error seeding Super Admins:', error);
    throw error;
  }
}

async function updateSuperAdminsWithConnection() {
  try {
    for (const adminData of superAdminAccounts) {
      const existingUser = await User.findOne({
        $or: [
          { email: adminData.email },
          { username: adminData.username }
        ]
      });

      if (existingUser) {
        // Update existing user with new fields
        existingUser.role = adminData.role;
        existingUser.isSuperAdmin = adminData.isSuperAdmin;
        existingUser.isVerified = adminData.isVerified;
        existingUser.verificationStatus = adminData.verificationStatus;
        existingUser.permissions = adminData.permissions;
        existingUser.isActive = adminData.isActive;

        await existingUser.save();
        console.log(`✅ Updated Super Admin: ${adminData.name} (${adminData.email})`);
      } else {
        console.log(`Super Admin ${adminData.email} not found, creating new...`);

        // Hash password
        const hashedPassword = await bcrypt.hash(adminData.password, 12);

        // Create new super admin user
        const superAdmin = new User({
          ...adminData,
          password: hashedPassword
        });

        await superAdmin.save();
        console.log(`✅ Created Super Admin: ${adminData.name} (${adminData.email})`);
      }
    }

    console.log('\n🎉 Super Admin update completed successfully!');

  } catch (error) {
    console.error('Error updating Super Admins:', error);
    throw error;
  }
}

module.exports = {
  seedSuperAdmins,
  updateSuperAdmins,
  seedSuperAdminsWithConnection,
  updateSuperAdminsWithConnection
};
