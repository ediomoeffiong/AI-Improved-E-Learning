# Hierarchical Role System Testing Guide

## Overview
This document provides comprehensive testing instructions for the newly implemented hierarchical user role system in the AI-Improved E-Learning platform.

## System Architecture

### Role Hierarchy
1. **Super Admin** (Level 6) - Highest privileges
2. **Super Moderator** (Level 5) - Platform oversight
3. **Institution Admin** (Level 4) - Institution management
4. **Institution Moderator** (Level 3) - Limited institution management
5. **Instructor** (Level 2) - Course management
6. **Student** (Level 1) - Basic access

### Default Super Admin Accounts
- **Super Admin**: 
  - Email: `superadmin@app.com`
  - Username: `superadmin`
  - Password: `SuperAdmin123!`
  
- **Super Moderator**:
  - Email: `supermod@app.com`
  - Username: `supermod`
  - Password: `SuperMod123!`

## Testing Checklist

### 1. Database Setup and Seeding

#### Prerequisites
- MongoDB connection established
- Backend server running on port 5000
- Frontend server running on port 5173

#### Seeding Commands
```bash
# Navigate to backend directory
cd elearning-backend

# Seed Super Admin accounts
npm run seed:super-admins

# Or run full deployment script
npm run deploy

# Verify seeding
npm run deploy:verify
```

#### Expected Results
- ✅ Super Admin and Super Moderator accounts created
- ✅ Database indexes created
- ✅ All required collections exist
- ✅ No errors in console

### 2. Super Admin Authentication Testing

#### Test Cases

**Test 2.1: Super Admin Login with Email**
1. Navigate to `/super-admin-login`
2. Select "Super Admin" role
3. Enter email: `superadmin@app.com`
4. Enter password: `SuperAdmin123!`
5. Click "Sign in to Admin Portal"

**Expected Result**: ✅ Successful login, redirect to dashboard

**Test 2.2: Super Admin Login with Username**
1. Navigate to `/super-admin-login`
2. Select "Super Admin" role
3. Enter username: `superadmin`
4. Enter password: `SuperAdmin123!`
5. Click "Sign in to Admin Portal"

**Expected Result**: ✅ Successful login, redirect to dashboard

**Test 2.3: Super Moderator Login**
1. Navigate to `/super-admin-login`
2. Select "Super Moderator" role
3. Enter email: `supermod@app.com`
4. Enter password: `SuperMod123!`
5. Click "Sign in to Admin Portal"

**Expected Result**: ✅ Successful login, redirect to dashboard

**Test 2.4: Invalid Credentials**
1. Navigate to `/super-admin-login`
2. Enter invalid email/password combination
3. Click "Sign in to Admin Portal"

**Expected Result**: ❌ Error message displayed

**Test 2.5: Role Mismatch**
1. Navigate to `/super-admin-login`
2. Select "Super Admin" role
3. Enter Super Moderator credentials
4. Click "Sign in to Admin Portal"

**Expected Result**: ❌ "Invalid credentials or insufficient privileges" error

### 3. Super Admin Dashboard Testing

#### Test Cases

**Test 3.1: Dashboard Access**
1. Login as Super Admin
2. Verify dashboard loads correctly
3. Check all statistics display
4. Verify quick actions are available

**Expected Result**: ✅ Dashboard displays with stats and quick actions

**Test 3.2: Create Admin Form**
1. Login as Super Admin
2. Click "Create Super Admin" quick action
3. Verify form loads correctly
4. Test form validation
5. Submit valid admin creation

**Expected Result**: ✅ Form works, validation active, admin created

**Test 3.3: Super Moderator Restrictions**
1. Login as Super Moderator
2. Verify "Create Super Admin" action is hidden
3. Check available permissions

**Expected Result**: ✅ Limited permissions for Super Moderator

### 4. Institution Management Testing

#### Test Cases

**Test 4.1: Institution Join Request**
1. Login as regular user
2. Navigate to institution settings
3. Select an institution
4. Submit join request

**Expected Result**: ✅ Request submitted, status shows "pending"

**Test 4.2: Admin Approval Workflow**
1. Login as Institution Admin
2. Navigate to pending approvals
3. Approve/reject member requests
4. Verify user status updates

**Expected Result**: ✅ Approval workflow functions correctly

### 5. Role-Based Access Control Testing

#### Test Cases

**Test 5.1: Hierarchical Access**
1. Test each role's access to different endpoints
2. Verify higher roles can access lower-level functions
3. Confirm access restrictions work

**Expected Result**: ✅ Proper access control enforced

**Test 5.2: Institution-Specific Access**
1. Create users in different institutions
2. Verify admins can only manage their institution
3. Test cross-institution access restrictions

**Expected Result**: ✅ Institution boundaries respected

### 6. API Endpoint Testing

#### Backend Endpoints to Test

**Authentication Endpoints**
- `POST /api/auth/app-admin-login` - Super Admin login
- `POST /api/auth/login` - Regular user login
- `POST /api/auth/register` - User registration

**Super Admin Endpoints**
- `GET /api/super-admin/users` - Get all users
- `POST /api/super-admin/create-admin` - Create admin
- `GET /api/super-admin/pending-admins` - Get pending approvals
- `POST /api/super-admin/approve-admin/:id` - Approve admin
- `GET /api/super-admin/stats` - Get platform stats

**Institution Admin Endpoints**
- `GET /api/institution-admin/dashboard` - Get dashboard data
- `GET /api/institution-admin/pending-approvals` - Get pending members
- `POST /api/institution-admin/approve-member/:id` - Approve member
- `GET /api/institution-admin/members` - Get institution members

**Institution Membership Endpoints**
- `POST /api/institution-membership/join-request` - Submit join request
- `GET /api/institution-membership/my-status` - Get user status
- `GET /api/institution-membership/available-institutions` - Get institutions

### 7. Error Handling Testing

#### Test Cases

**Test 7.1: Database Connectivity**
1. Test with MongoDB disconnected
2. Verify fallback to in-memory data
3. Check error messages are user-friendly

**Test 7.2: Invalid Requests**
1. Send malformed API requests
2. Test with missing required fields
3. Verify proper error responses

**Test 7.3: Permission Violations**
1. Attempt unauthorized actions
2. Test role escalation attempts
3. Verify security measures

### 8. Frontend Integration Testing

#### Test Cases

**Test 8.1: Role-Based UI**
1. Login with different roles
2. Verify appropriate UI elements show/hide
3. Test navigation restrictions

**Test 8.2: Form Validation**
1. Test all forms with invalid data
2. Verify client-side validation
3. Check error message display

**Test 8.3: State Management**
1. Test login/logout flows
2. Verify token storage and retrieval
3. Check session persistence

## Production Deployment Checklist

### Pre-Deployment
- [ ] Run full test suite
- [ ] Verify all environment variables set
- [ ] Check MongoDB connection string
- [ ] Validate SSL certificates
- [ ] Review security configurations

### Deployment Steps
1. Deploy backend to production server
2. Run deployment script: `npm run deploy`
3. Verify database seeding completed
4. Deploy frontend to Vercel
5. Test production endpoints
6. Verify super admin login works

### Post-Deployment
- [ ] Test super admin login in production
- [ ] Verify all API endpoints respond
- [ ] Check database connections
- [ ] Monitor error logs
- [ ] Test user registration flow
- [ ] Validate institution workflows

## Security Considerations

### Password Security
- Default passwords must be changed in production
- Implement password complexity requirements
- Consider implementing 2FA for super admins

### Access Control
- Verify JWT token validation
- Check role-based restrictions
- Test session management
- Validate CORS settings

### Data Protection
- Ensure sensitive data is not logged
- Verify user data encryption
- Check API rate limiting
- Validate input sanitization

## Troubleshooting

### Common Issues

**Database Connection Errors**
- Check MongoDB URI format
- Verify network connectivity
- Validate credentials
- Check firewall settings

**Authentication Failures**
- Verify JWT secret configuration
- Check token expiration settings
- Validate user credentials
- Review role assignments

**Permission Errors**
- Check role hierarchy implementation
- Verify middleware order
- Validate permission assignments
- Review access control logic

## Success Criteria

The hierarchical role system is considered successfully implemented when:

- ✅ All super admin accounts can login
- ✅ Role-based access control works correctly
- ✅ Institution approval workflows function
- ✅ User management features operate properly
- ✅ Database seeding completes without errors
- ✅ Frontend integrates seamlessly with backend
- ✅ Security measures are properly enforced
- ✅ Error handling works as expected
- ✅ Production deployment succeeds
- ✅ All test cases pass

## Next Steps

After successful testing:

1. **User Training**: Create documentation for different user roles
2. **Monitoring**: Set up logging and monitoring for the new system
3. **Backup**: Implement regular database backups
4. **Maintenance**: Plan regular security updates and patches
5. **Scaling**: Monitor performance and plan for scaling needs

## Contact Information

For issues or questions regarding the hierarchical role system:
- Technical Lead: [Your Name]
- System Administrator: [Admin Name]
- Database Administrator: [DBA Name]

---

**Last Updated**: 2024-01-22
**Version**: 1.0
**Status**: Ready for Testing
