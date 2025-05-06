const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Adjust path if needed
const mongoose = require('mongoose');

// POST /api/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, role, name, skills, bio, companyName, website, profilePicture } = req.body;

    // Basic Validation
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, Password and Role are required.' });
    }

    let newUser = new User({
      email,
      password,
      role,
      bio: bio || '',
      profilePicture: profilePicture || ''
    });

    // Set fields based on role
    if (role === 'student') {
      newUser.name = name;
      newUser.skills = skills || [];
    } else if (role === 'company') {
      newUser.companyName = companyName;
      newUser.website = website;
    } else {
      return res.status(400).json({ message: 'Invalid role. Must be student or company.' });
    }

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
});



// Utility function to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET all users with optional filters: ?role=student&email=abc@example.com&skills=js,node
router.get('/', async (req, res) => {
  try {
    const { role, email, skills } = req.query;

    const filter = {};

    // Validate role
    if (role) {
      if (!['student', 'company'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role specified' });
      }
      filter.role = role;
    }

    // Validate email
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
      filter.email = email;
    }

    // Validate skills (expects comma-separated values)
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim().toLowerCase());
      filter.skills = { $in: skillsArray };
    }

    const users = await User.find(filter);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET user by ID
router.get('/:id', async (req, res) => {
  const userId = req.params.id;

  if (!isValidObjectId(userId)) {
    return res.status(400).json({ message: 'Invalid user ID format' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



module.exports = router;
