const Conversation = require('../models/conversation');
const User = require('../models/user');
const Message = require('../models/message');
const Connection = require('../models/connection'); // Add this at the top
const NotificationController = require('./notificationController'); // Add this import

// @desc Get all one-on-one conversations for the logged-in user
// @route GET /api/messages/conversations
exports.getConversations = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find all 1-1 conversations for the user
    const conversations = await Conversation.find({
      participants: req.user._id,
      isGroup: false
    })
      .populate('participants', 'name username avatarUrl email isOnline lastSeen')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name username avatarUrl email' }
      })
      .sort({ updatedAt: -1 });

    // Filter out self-conversations
    const filteredConversations = conversations.filter(conv =>
      conv.participants.length > 1 &&
      conv.participants.some(p => p && p._id.toString() !== req.user._id.toString())
    );

    // Format for frontend: always include the other participant
    const formatted = await Promise.all(filteredConversations.map(async conv => {
      let otherParticipant = (conv.participants || []).find(
        p => p && p._id.toString() !== req.user._id.toString()
      );
      // If otherParticipant is missing, try to fetch from DB
      if (!otherParticipant) {
        const otherId = (conv.participants || []).find(
          p => p && p.toString() !== req.user._id.toString()
        );
        if (otherId) {
          otherParticipant = await User.findById(otherId).select('name username avatarUrl email isOnline lastSeen');
        }
      }
      // If still missing, mark as Deleted User
      if (!otherParticipant) {
        otherParticipant = { name: 'Deleted User', username: '', email: '', avatarUrl: '', isOnline: false, lastSeen: null };
      }
      // Count unread messages for this conversation
      const unreadCount = await Message.countDocuments({
        conversation: conv._id,
        'readBy.user': { $ne: req.user._id },
        receiver: req.user._id
      });
      return {
        _id: conv._id,
        otherParticipant,
        lastMessage: conv.lastMessage,
        updatedAt: conv.updatedAt,
        unreadCount,
      };
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Get all messages in a conversation
// @route GET /api/messages/:conversationId
exports.getMessages = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Accept either conversationId or userId as param
    let { conversationId, userId } = req.params;
    let conversation;

    // If conversationId is a valid ObjectId, try to find by id
    if (conversationId && conversationId.match(/^[0-9a-fA-F]{24}$/)) {
      conversation = await Conversation.findById(conversationId);
    }

    // If not found, or not provided, try to find by userId (other participant)
    if (!conversation) {
      userId = userId || req.body.receiverId;
      // Guard: if userId is missing or not a valid ObjectId, return []
      if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) return res.json([]);
      conversation = await Conversation.findOne({
        participants: { $all: [req.user._id, userId] },
        isGroup: false
      });
    }

    if (!conversation) {
      return res.json([]); // No messages yet
    }

    // Pagination logic
    const PAGE_SIZE = 20;
    const { before } = req.query;
    let query = { conversation: conversation._id };
    if (before) {
      const beforeMsg = await Message.findById(before);
      if (beforeMsg) {
        query.createdAt = { $lt: beforeMsg.createdAt };
      }
    }

    const messages = await Message.find(query)
      .populate('sender', 'name username avatarUrl email')
      .populate('receiver', 'name username avatarUrl email')
      .sort({ createdAt: -1 }) // newest first
      .limit(PAGE_SIZE);

    // Mark all as read for this user
    await Message.updateMany(
      { conversation: conversation._id, 'readBy.user': { $ne: req.user._id } },
      { $push: { readBy: { user: req.user._id, readAt: new Date() } } }
    );

    res.json(messages.reverse()); // send oldest first
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Send a message in a conversation
// @route POST /api/messages
exports.sendMessage = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    let { conversationId, content, receiverId } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });

    // Prevent sending to self
    if (receiverId && receiverId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot message yourself.' });
    }

    // Only allow messaging if users are connected
    if (receiverId) {
      const myId = req.user._id.toString();
      const connection = await Connection.findOne({
        $or: [
          { user1: myId, user2: receiverId },
          { user1: receiverId, user2: myId }
        ],
        status: "accepted"
      });
      if (!connection) {
        return res.status(403).json({ message: "You can only message your connections." });
      }
    }

    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    } else if (receiverId) {
      conversation = await Conversation.findOne({
        participants: { $all: [req.user._id, receiverId] },
        isGroup: false
      });
      if (!conversation) {
        conversation = await Conversation.create({
          participants: [req.user._id, receiverId],
          isGroup: false
        });
      }
    } else {
      return res.status(400).json({ message: 'receiverId or conversationId required' });
    }

    const otherId = conversation.participants.find(
      (id) => id.toString() !== req.user._id.toString()
    );
    if (!otherId) {
      return res.status(400).json({ message: 'Receiver not found in conversation' });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: otherId,
      content,
      conversation: conversation._id
    });

    // Mark as unread for receiver
    // Remove any previous readBy for receiver
    message.readBy = message.readBy.filter(rb => String(rb.user) !== String(otherId));
    await message.save();

    // Create notification for receiver
    NotificationController.createNotification(otherId, req.user._id, 'message', `${req.user.name || 'Someone'} sent you a message.`);

    conversation.lastMessage = message._id;
    await conversation.save();

    await message.populate('sender', 'name username avatarUrl email');
    await message.populate('receiver', 'name username avatarUrl email');

    if (req.io) {
      req.io.to(otherId.toString()).emit('newMessage', message);
      req.io.to(req.user._id.toString()).emit('newMessage', message);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};