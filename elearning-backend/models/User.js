const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
    match: /^[a-zA-Z0-9_]+$/
  },
  email: { type: String, required: true, unique: true },
  phoneNumber: {
    type: String,
    sparse: true, // Allows null values but enforces uniqueness when present
    unique: true,
    trim: true
  },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['Student', 'Instructor', 'Admin'],
    default: 'Student',
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 