const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Simple production seeding script that can be run via Render console
async function seedProductionAdmins() {
  try {
    // Use environment variables from Render
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI environment variable not set');
      process.exit(1);
    }

    console.log('🔗 Connecting to production MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to production MongoDB');

    // Define User schema inline (in case models aren't loaded)
    const userSchema = new mongoose.Schema({
      name: { type: String, required: true },
      username: { type: String, required: true, unique: true },
      email: { type: String, required: true, unique: true },
      phoneNumber: { type: String },
      password: { type: String, required: true },
      role: { type: String, required: true },
      adminType: { type: String, enum: ['primary', 'secondary', null], default: null },
      isSuperAdmin: { type: Boolean, default: false },
      isVerified: { type: Boolean, default: false },
      verificationStatus: { type: String, default: 'not_required' },
      permissions: [String],
      isActive: { type: Boolean, default: true }
    }, { timestamps: true });

    const User = mongoose.models.User || mongoose.model('User', userSchema);

    // Super Admin accounts to create
    const superAdminAccounts = [
      {
        name: 'Super Administrator',
        username: 'superadmin',
        email: 'superadmin@app.com',
        phoneNumber: '+234-800-000-0001',
        password: 'SuperAdmin123!',
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
        password: 'SuperMod123!',
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

    console.log('👤 Creating Super Admin accounts...');

    for (const adminData of superAdminAccounts) {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { email: adminData.email },
          { username: adminData.username }
        ]
      });

      if (existingUser) {
        console.log(`⚠️  Super Admin ${adminData.email} already exists, skipping...`);
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

    console.log('\n🎉 Production Super Admin seeding completed successfully!');
    console.log('\n📋 Super Admin Accounts Created:');
    console.log('1. Super Admin: superadmin@app.com / username: superadmin / password: SuperAdmin123!');
    console.log('2. Super Moderator: supermod@app.com / username: supermod / password: SuperMod123!');
    console.log('\n⚠️  IMPORTANT: Change these default passwords immediately after first login!');

    // Verify accounts were created
    const createdAdmins = await User.find({
      role: { $in: ['Super Admin', 'Super Moderator'] }
    }).select('name email role');

    console.log('\n🔍 Verification - Found Super Admin accounts:');
    createdAdmins.forEach(admin => {
      console.log(`  - ${admin.name} (${admin.email}) - ${admin.role}`);
    });

  } catch (error) {
    console.error('❌ Error seeding production Super Admins:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seeding
seedProductionAdmins();

module.exports = { seedProductionAdmins };
