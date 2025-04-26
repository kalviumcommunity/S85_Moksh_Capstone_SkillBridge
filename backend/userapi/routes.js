const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Adjust path if needed

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

module.exports = router;
