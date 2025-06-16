# MongoDB Atlas Setup Guide

## 🚨 Current Issue: Authentication Failed

The MongoDB Atlas connection is failing with "bad auth: authentication failed". This guide will help you fix it.

## 🔧 Step-by-Step Fix

### 1. Access MongoDB Atlas Dashboard
- Go to [https://cloud.mongodb.com/](https://cloud.mongodb.com/)
- Log in to your MongoDB Atlas account

### 2. Check Database Access (Users)
- Click on "Database Access" in the left sidebar
- Look for user: `ediomoemmaeffiong`

**If user exists:**
- Click "Edit" next to the user
- Verify the password is: `Ed10m0Ed10m0`
- Ensure the user has one of these roles:
  - `Atlas admin` (recommended)
  - `Read and write to any database`

**If user doesn't exist:**
- Click "Add New Database User"
- Choose "Password" authentication
- Username: `ediomoemmaeffiong`
- Password: `Ed10m0Ed10m0`
- Database User Privileges: Select "Atlas admin"
- Click "Add User"

### 3. Check Network Access (IP Whitelist)
- Click on "Network Access" in the left sidebar
- You should see at least one IP address entry

**Add IP Access (for testing):**
- Click "Add IP Address"
- Click "Allow Access from Anywhere" (adds 0.0.0.0/0)
- Click "Confirm"

### 4. Verify Cluster Status
- Go to "Database" (Clusters)
- Ensure your cluster `aielearning` is running (not paused)
- If paused, click "Resume"

### 5. Verify Connection String
Your current connection string should be:
```
mongodb+srv://ediomoemmaeffiong:Ed10m0Ed10m0@elearninggbackend.44far0a.mongodb.net/?retryWrites=true&w=majority&appName=ELearningGBackend
```

If you need a fresh connection string:
- Click "Connect" on your cluster
- Choose "Connect your application"
- Select "Node.js" and version "4.1 or later"
- Copy the connection string
- Replace `<password>` with `Ed10m0Ed10m0`

## 🧪 Test Connection

After making changes, wait 1-2 minutes for propagation, then test:

```bash
cd elearning-backend
node test-mongodb.js
```

## 🔄 Alternative Connection Strings to Try

If the main connection string doesn't work, try these in `.env.production`:

```env
# Option 1: With test database (default)
MONGODB_URI=mongodb+srv://ediomoemmaeffiong:Ed10m0Ed10m0@aielearning.cr977qp.mongodb.net/test?retryWrites=true&w=majority

# Option 2: Without specific database
MONGODB_URI=mongodb+srv://ediomoemmaeffiong:Ed10m0Ed10m0@aielearning.cr977qp.mongodb.net/?retryWrites=true&w=majority

# Option 3: With admin database
MONGODB_URI=mongodb+srv://ediomoemmaeffiong:Ed10m0Ed10m0@aielearning.cr977qp.mongodb.net/admin?retryWrites=true&w=majority
```

## 🆘 If Still Not Working

1. **Create a new user:**
   - Use a simple username like `testuser`
   - Use a simple password like `testpass123`
   - Give it "Atlas admin" role

2. **Check cluster region:**
   - Ensure your cluster is in a region close to your deployment

3. **Contact MongoDB Support:**
   - If you have a paid plan, contact MongoDB Atlas support

## ✅ Success Indicators

When working correctly, you should see:
```
✅ MongoDB connected successfully
📊 Connected to database: test
```

## 🔒 Security Note

After testing, you should:
1. Replace the broad IP access (0.0.0.0/0) with specific IPs
2. Use a stronger password for production
3. Consider using MongoDB Atlas API keys for enhanced security
