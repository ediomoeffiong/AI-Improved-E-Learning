# 2FA Quick Test Guide

## 🚀 Quick Testing Steps

### Prerequisites
1. **Backend Running**: Ensure backend is running on `http://localhost:5000`
2. **Frontend Running**: Ensure frontend is running on `http://localhost:5173`
3. **Authenticator App**: Have Google Authenticator, Authy, or similar app ready

### Test 1: Super Admin 2FA (Existing Flow)

#### Step 1: Access Super Admin Login
1. Go to `http://localhost:5173/app-admin-login`
2. Login with:
   - **Email**: `superadmin@app.com`
   - **Password**: `SuperAdmin123!`
   - **Role**: `Super Admin`

#### Step 2: Enable 2FA
1. After login, go to Dashboard
2. Click "2FA Settings" quick action
3. Click "Enable Two-Factor Authentication"
4. Follow the setup wizard:
   - Scan QR code with authenticator app
   - Enter 6-digit verification code
   - Save backup codes

#### Step 3: Test 2FA Login
1. Logout from dashboard
2. Login again with same credentials
3. Verify 2FA verification screen appears
4. Enter 6-digit code from authenticator app
5. Complete login successfully

**Expected Result**: ✅ Super Admin 2FA works end-to-end

### Test 2: Regular User 2FA (New Feature)

#### Step 1: Register/Login as Regular User
1. Go to `http://localhost:5173/login`
2. Either register a new account or use existing credentials
3. Login as Student, Instructor, or any regular user

#### Step 2: Enable 2FA from Settings
1. After login, go to Settings (user menu → Settings)
2. Click on "Security" tab
3. Find "Two-Factor Authentication" section
4. Click "Enable Two-Factor Authentication"
5. Complete setup wizard:
   - Scan QR code with authenticator app
   - Enter verification code
   - Save backup codes

#### Step 3: Test Regular User 2FA Login
1. Logout from account
2. Login again with same credentials
3. Verify 2FA verification screen appears
4. Enter 6-digit code from authenticator app
5. Complete login and access dashboard

**Expected Result**: ✅ Regular user 2FA works end-to-end

### Test 3: Backup Code Testing

#### Step 1: Use Backup Code
1. During 2FA verification step
2. Click "Backup Code" tab
3. Enter one of your saved backup codes
4. Complete login successfully

#### Step 2: Verify Code is Used
1. Go back to 2FA settings
2. Check that backup codes remaining count decreased
3. Verify used code no longer works

**Expected Result**: ✅ Backup codes work correctly

### Test 4: Error Handling

#### Step 1: Test Invalid Codes
1. During 2FA verification
2. Enter incorrect 6-digit codes
3. Verify error messages appear
4. Check attempt counter decreases

#### Step 2: Test Account Lockout
1. Make 5 failed 2FA attempts
2. Verify account gets locked
3. Check lockout message appears
4. Wait for lockout to expire (or use backup code)

**Expected Result**: ✅ Security measures work correctly

## 🔧 Troubleshooting

### Common Issues

#### QR Code Not Displaying
- **Solution**: Refresh the page and try again
- **Alternative**: Use manual entry key instead

#### "Module not found" Errors
- **Solution**: Restart frontend development server
- **Command**: `npm run dev` in frontend directory

#### 2FA Settings Not Visible
- **Check**: User is logged in
- **Check**: Settings page loads correctly
- **Solution**: Clear browser cache and reload

#### Backend Connection Issues
- **Check**: Backend server is running on port 5000
- **Check**: MongoDB is connected
- **Solution**: Restart backend server

### Quick Fixes

#### Clear Browser Cache
```bash
# Chrome: Ctrl+Shift+Delete
# Firefox: Ctrl+Shift+Delete
# Or use incognito/private mode
```

#### Restart Servers
```bash
# Backend
cd elearning-backend
npm start

# Frontend  
cd elearning-frontend
npm run dev
```

#### Check Server Status
```bash
# Backend API test
curl http://localhost:5000/api

# Frontend access
# Open http://localhost:5173 in browser
```

## ✅ Success Criteria

### For Super Admins
- [ ] Can access 2FA settings from dashboard
- [ ] Can enable 2FA with QR code setup
- [ ] Can login with 2FA verification
- [ ] Can use backup codes for recovery
- [ ] Can manage 2FA settings (disable, regenerate codes)

### For Regular Users
- [ ] Can access 2FA settings from user settings
- [ ] Can enable 2FA with same setup process
- [ ] Can login with 2FA verification
- [ ] Can use backup codes for recovery
- [ ] Can manage 2FA settings

### Security Features
- [ ] Rate limiting prevents abuse
- [ ] Account lockout after failed attempts
- [ ] Backup codes work only once
- [ ] QR codes generate correctly
- [ ] Error messages are clear and helpful

## 🎯 Quick Verification Commands

### Check Backend 2FA Routes
```bash
# Test 2FA status endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/2fa/status

# Test 2FA setup endpoint
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/2fa/setup
```

### Check Frontend Components
1. Open browser developer tools
2. Check for console errors
3. Verify network requests to 2FA endpoints
4. Test responsive design on mobile

## 📱 Mobile Testing

### Responsive Design
1. Open browser developer tools
2. Switch to mobile view
3. Test 2FA setup on mobile screen
4. Verify QR code scanning works
5. Test input fields are properly sized

### Authenticator App Testing
1. **Google Authenticator**: Scan QR code, verify codes work
2. **Authy**: Test multi-device sync
3. **Microsoft Authenticator**: Verify compatibility
4. **1Password**: Test built-in authenticator

## 🔐 Security Validation

### TOTP Compliance
- [ ] 6-digit codes generated every 30 seconds
- [ ] Time window tolerance works (±60 seconds)
- [ ] Codes are unique per user account
- [ ] Secret keys are properly encrypted

### Rate Limiting
- [ ] 2FA verification limited to 10 attempts per 15 minutes
- [ ] Setup attempts limited to 5 per hour
- [ ] Backup code generation limited to 3 per day
- [ ] Login attempts properly rate limited

### Data Protection
- [ ] 2FA secrets encrypted in database
- [ ] Backup codes hashed and salted
- [ ] No sensitive data in browser console
- [ ] Proper session management

---

**Testing Time**: ~15-20 minutes for complete validation
**Status**: Ready for testing
**Last Updated**: 2025-06-22
