const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const conversationController = require('../controllers/conversationController');



router.post("/", auth, conversationController.createConversation);
router.get("/", auth, conversationController.getAllConversations);
router.get("/:conversationId/messages", auth, conversationController.getMessages);
router.post("/:conversationId/messages", auth, conversationController.sendMessage);

module.exports = router;