const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'company'],
    required: true
  },
  // Student specific fields
  name: {
    type: String,
    trim: true
  },
  skills: {
    type: [String], // array of skills
    default: []
  },
  bio: {
    type: String,
    default: ''
  },
  // Company specific fields
  companyName: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String,
    default: '' // URL of profile image (optional)
  },
  tasksCompleted: {
    type: Number,
    default: 0 // For students only
  },
  bountyEarned: {
    type: Number,
    default: 0 // For students only
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
