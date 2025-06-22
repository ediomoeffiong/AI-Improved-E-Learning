// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the elearning database
db = db.getSiblingDB('elearning');

// Create a user for the elearning database
db.createUser({
  user: 'elearning_user',
  pwd: 'elearning_password',
  roles: [
    {
      role: 'readWrite',
      db: 'elearning'
    }
  ]
});

// Create initial collections with indexes
db.createCollection('users');
db.createCollection('institutions');
db.createCollection('userapprovals');
db.createCollection('institutionmemberships');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "institution": 1 });

db.institutions.createIndex({ "name": 1 }, { unique: true });
db.institutions.createIndex({ "code": 1 }, { unique: true });
db.institutions.createIndex({ "status": 1 });

print('MongoDB initialization completed for elearning database');
