const express = require('express');
const router = express.Router();
const {
  signup,
  googleLogin,
  login,         // <-- Add this line
  getAllUsers,
  getUserById,
  updateUser
} = require('../controllers/authController');
const validateUserUpdate = require('../middleware/validateUserUpdate');

// POST /api/signup
router.post('/signup', signup);

// POST /api/google-login
router.post('/google-login', googleLogin);

// ✅ POST /api/login (Gmail + Password login)
router.post('/login', login);

// (Optional) Uncomment these if needed
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/users/:id', validateUserUpdate, updateUser);

module.exports = router;
