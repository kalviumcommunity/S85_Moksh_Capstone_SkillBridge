const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getConversations,
  getMessages,
  sendMessage
} = require('../controllers/messageController');

// All routes require authentication
router.use(auth);

// GET all conversations
router.get('/conversations', getConversations);

// ✅ FIXED: use /user/:userId for clarity and controller compatibility
router.get('/user/:userId', getMessages);

// Send a message
router.post('/', sendMessage);

module.exports = router;
