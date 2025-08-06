// This script seeds the database with dummy users, posts, and hashtags for testing the Explore page.
// Run with: node backend/scripts/seedDummyData.js

const mongoose = require('mongoose');
const User = require('../models/user');
const Post = require('../models/post');
const Hashtag = require('../models/hashtag');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/skillBridge', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Dummy users
const users = [
  { name: 'Alice', email: 'alice@example.com', password: 'password123', role: 'student', username: 'alice' },
  { name: 'Bob', email: 'bob@example.com', password: 'password123', role: 'student', username: 'bob' },
  { name: 'Charlie', email: 'charlie@example.com', password: 'password123', role: 'company', companyName: 'Charlie Inc', username: 'charlie' },
];

// Dummy hashtags
const hashtags = [
  { tag: 'javascript', count: 15 },
  { tag: 'react', count: 10 },
  { tag: 'nodejs', count: 8 },
  { tag: 'webdev', count: 5 },
  { tag: 'mongodb', count: 3 },
];

async function seed() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Hashtag.deleteMany({});

    // Insert users
    const createdUsers = await User.insertMany(users);

    // Insert hashtags
    const createdHashtags = await Hashtag.insertMany(hashtags);

    // Dummy posts
    const posts = [
      {
        author: createdUsers[0]._id,
        caption: 'Learning JavaScript is fun! #javascript',
        imageUrl: 'https://via.placeholder.com/300',
        likes: 12,
        views: 50,
        hashtags: ['javascript'],
      },
      {
        author: createdUsers[1]._id,
        caption: 'React makes UI easy. #react',
        imageUrl: 'https://via.placeholder.com/300',
        likes: 8,
        views: 30,
        hashtags: ['react'],
      },
      {
        author: createdUsers[2]._id,
        caption: 'Node.js powers the backend! #nodejs',
        imageUrl: 'https://via.placeholder.com/300',
        likes: 5,
        views: 20,
        hashtags: ['nodejs'],
      },
      {
        author: createdUsers[0]._id,
        caption: 'Web development is awesome. #webdev',
        imageUrl: 'https://via.placeholder.com/300',
        likes: 3,
        views: 10,
        hashtags: ['webdev'],
      },
      {
        author: createdUsers[1]._id,
        caption: 'MongoDB is great for NoSQL. #mongodb',
        imageUrl: 'https://via.placeholder.com/300',
        likes: 2,
        views: 5,
        hashtags: ['mongodb'],
      },
    ];

    // Insert posts
    await Post.insertMany(posts);

    console.log('Dummy data seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding dummy data:', err);
    process.exit(1);
  }
}

seed(); 