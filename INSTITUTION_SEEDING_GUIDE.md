# Institution Seeding Guide

This guide explains how the institution seeding system works in the AI-Improved E-Learning platform.

## Overview

The platform automatically seeds all Nigerian universities into the database during deployment. This ensures that the Super Admin dashboard has access to a comprehensive list of educational institutions for management and verification.

## What Gets Seeded

- **123+ Nigerian Universities** from all 36 states + FCT
- **Institution Types**: Universities, Polytechnics, Colleges, Institutes
- **Complete Information**: Name, code, location, contact details, settings
- **Default Status**: All institutions start as "verified" for immediate use

## Automatic Seeding

### During Deployment

The seeding happens automatically when you deploy to Render:

1. **Render Deployment**: When you push to GitHub, Render automatically deploys
2. **Post-Deploy Hook**: `npm run deploy` runs after successful deployment
3. **Institution Check**: System checks if institutions exist in database
4. **Automatic Seeding**: If no institutions found, seeds all Nigerian universities
5. **Skip if Exists**: If institutions already exist, skipping seeding to avoid duplicates

### Deployment Configuration

In `render.yaml`:
```yaml
services:
  - type: web
    name: elearning-backend
    postDeployCommand: npm run deploy  # This runs the seeding
```

## Manual Seeding Options

### 1. Seed Institutions Only
```bash
npm run seed:institutions
```
- Seeds only institutions
- Skips if institutions already exist
- Safe to run multiple times

### 2. Deploy Institutions Only
```bash
npm run deploy:institutions
```
- Connects to production database
- Seeds institutions only
- Includes proper error handling

### 3. Full Deployment
```bash
npm run deploy
```
- Seeds Super Admin accounts
- Seeds institutions (if none exist)
- Creates database indexes
- Runs system verification

## Institution Data Structure

Each seeded institution includes:

```javascript
{
  name: "University of Lagos",
  code: "UNILAG",
  type: "university",
  location: {
    state: "Lagos",
    city: "Lagos",
    country: "Nigeria"
  },
  contact: {
    email: "info@unilag.edu.ng",
    phone: "+234-800-000-0000",
    website: "https://unilag.edu.ng"
  },
  status: "verified",
  settings: {
    allowSelfRegistration: true,
    requireApproval: true,
    maxAdmins: 2,
    maxModerators: 5,
    enableCBT: false,
    enableClassroom: false
  },
  stats: {
    totalUsers: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalAdmins: 0,
    totalModerators: 0,
    activeCourses: 0,
    totalAssessments: 0
  }
}
```

## Super Admin Dashboard Features

After seeding, Super Admins can:

### 1. View All Institutions
- Comprehensive list with filtering and search
- Sort by name, status, type, location
- Pagination for large datasets

### 2. Institution Management
- Change status (verify, suspend, reject)
- Bulk operations on multiple institutions
- View detailed institution profiles

### 3. Statistics Dashboard
- Total institutions count
- Breakdown by status (verified, pending, suspended)
- Breakdown by type (university, polytechnic, etc.)
- Breakdown by state

### 4. Institution Details
- Basic information and contact details
- User statistics and activity
- Settings configuration
- Admin and moderator limits

## Verification Process

### Deployment Verification
The system automatically verifies successful seeding:

```bash
✅ Connected to MongoDB successfully
🌱 Starting institution seeding...
📚 Preparing to seed 123 institutions...
✅ Inserted batch 1: 50 institutions
✅ Inserted batch 2: 50 institutions
✅ Inserted batch 3: 23 institutions
🎉 Institution seeding completed successfully!
📊 Total institutions inserted: 123
🏛️ All Nigerian universities are now available in the system
📈 Institution breakdown by type:
   university: 110
   polytechnic: 8
   college: 3
   institute: 2
```

### Dashboard Verification
1. Login as Super Admin
2. Navigate to Institution Management
3. Verify institutions are listed
4. Check statistics show correct counts

## Troubleshooting

### Common Issues

#### 1. Seeding Skipped
**Symptom**: "Found X existing institutions - skipping institution seeding"
**Solution**: This is normal behavior to prevent duplicates

#### 2. Connection Errors
**Symptom**: MongoDB connection failures
**Solution**: 
- Check MONGODB_URI environment variable
- Verify database credentials
- Ensure network connectivity

#### 3. Duplicate Key Errors
**Symptom**: "Institution with this name/code already exists"
**Solution**: 
- Normal during batch processing
- System handles duplicates gracefully
- Check final count in logs

### Manual Troubleshooting

#### Force Re-seed (Development Only)
```javascript
// Connect to MongoDB
const mongoose = require('mongoose');
const Institution = require('./models/Institution');

// Clear existing institutions (DANGER: Only in development!)
await Institution.deleteMany({});

// Run seeding
npm run seed:institutions
```

#### Check Institution Count
```bash
# Connect to MongoDB and check count
db.institutions.countDocuments()
```

## Environment Variables

Required for seeding:
- `MONGODB_URI`: MongoDB connection string
- `NODE_ENV`: Set to "production" for production seeding

## Security Considerations

1. **Default Credentials**: All institutions start with placeholder contact info
2. **Status Management**: Only Super Admins can change institution status
3. **Bulk Operations**: Restricted to Super Admin role
4. **Data Validation**: All institution data is validated before insertion

## Integration with User Registration

After seeding, users can:
1. Select their institution from the dropdown in settings
2. Enable institution features
3. Request to join their institution
4. Wait for admin approval (if required)

The seeded institutions provide the foundation for the hierarchical role system and institution-based user management.

## Next Steps

After successful seeding:
1. Test Super Admin login
2. Verify institution management interface
3. Test user institution selection
4. Configure institution-specific settings as needed

For more information, see:
- [Hierarchical Role System Implementation](HIERARCHICAL_ROLE_SYSTEM_IMPLEMENTATION.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Super Admin Dashboard Documentation](elearning-frontend/src/pages/admin/README.md)
