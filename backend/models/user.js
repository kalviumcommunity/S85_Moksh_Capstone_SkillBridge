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
    required: function() {
      return !this.googleId; // Password is required if not using Google login
    }
  },
  googleId: {
    type: String
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
  username: {
    type: String,
    trim: true,
    unique: true,
    sparse: true // allows null for users who don't set it
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
  },
  avatarUrl: {
    type: String
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date
  },
  connections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
