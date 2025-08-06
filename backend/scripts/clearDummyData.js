// This script removes all users, posts, and hashtags from the database.
// Run with: node backend/scripts/clearDummyData.js

const mongoose = require('mongoose');
const User = require('../models/user');
const Post = require('../models/post');
const Hashtag = require('../models/hashtag');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/skillBridge', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function clear() {
  try {
    // Remove all users
    await User.deleteMany({});
    // Remove all posts
    await Post.deleteMany({});
    // Remove all hashtags
    await Hashtag.deleteMany({});

    console.log('All dummy data removed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error removing dummy data:', err);
    process.exit(1);
  }
}

clear(); 