const User = require('../models/user');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');

const JWT_SECRET = 'ASDFGHJKL'; // Use env in production
const CLIENT_ID = '196564239232-f94gsenprde6m8csolnnsr4o0kf38sjt.apps.googleusercontent.com'
// Replace with your actual client ID

// Utility function
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Signup Controller
exports.signup = async (req, res) => {
  try {
    const { email, password, role, name, skills, bio, companyName, website, profilePicture, username } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, Password and Role are required.' });
    }

    // Generate a username if not provided
    let finalUsername = username;
    if (!finalUsername) {
      let baseUsername = email ? email.split('@')[0] : (name || 'user').replace(/\s+/g, '').toLowerCase();
      let uniqueUsername = baseUsername;
      let counter = 1;
      while (await User.findOne({ username: uniqueUsername })) {
        uniqueUsername = `${baseUsername}${counter}`;
        counter++;
      }
      finalUsername = uniqueUsername;
    }

    let newUser = new User({
      email,
      password,
      role,
      bio: bio || '',
      profilePicture: profilePicture || '',
      username: finalUsername
    });

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
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    res.status(500).json({ message: 'Server error.' });
  }
};

// Google Login Controller
exports.googleLogin = async (req, res) => {
  const { token } = req.body; // frontend should send { token: id_token }
  console.log(token);
  
  if (!token) return res.status(400).json({ message: 'No token provided' });

  try {
    const client = new OAuth2Client(CLIENT_ID);
    console.log(token);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();

    let user = await User.findOne({ email: payload.email });
    if (!user) {
      // Generate a base username from Google profile (email prefix or name)
      let baseUsername = (payload.email ? payload.email.split('@')[0] : payload.name.replace(/\s+/g, '').toLowerCase());
      let username = baseUsername;
      let counter = 1;
      // Ensure username is unique
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }
      user = new User({
        email: payload.email,
        name: payload.name,
        profilePicture: payload.picture,
        role: 'student',
        googleId: payload.sub,
        password: "11225", // No password needed for Google login
        username: username,
      });
      await user.save();
    }

    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token: jwtToken, user });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Invalid Google ID token' });
  }
};


// Email + Password Login Controller
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and Password are required.' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // If user registered via Google, prevent login using password
    if (user.googleId) {
      return res.status(403).json({
        message: 'This account is registered using Google. Please use Google login.',
      });
    }

    // Check password match
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, email, skills } = req.query;
    const filter = {};

    if (role) {
      if (!['student', 'company'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role specified' });
      }
      filter.role = role;
    }
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
      filter.email = email;
    }
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim().toLowerCase());
      filter.skills = { $in: skillsArray };
    }

    const users = await User.find(filter);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
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
};

// Update user
exports.updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    Object.assign(user, req.body);
    await user.save();

    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};