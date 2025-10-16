const Conversation = require('../models/conversation');
const User = require('../models/user');
const Message = require('../models/message');
const Connection = require('../models/connection'); // Add this at the top
const NotificationController = require('./notificationController'); // Add this import

// @desc Create a new conversation
// @route POST /api/conversations
exports.createConversation = async (req, res) => {
  try {
    const { participantId } = req.body;

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId] },
      isGroup: false,
    });

    if (conversation) {
      await conversation.populate("participants", "name username avatarUrl isOnline lastSeen email");
      return res.json(conversation);
    }

    // Create new conversation
    conversation = new Conversation({
      participants: [req.user._id, participantId],
    });

    await conversation.save();
    await conversation.populate("participants", "name username avatarUrl isOnline lastSeen email");

    res.status(201).json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Get all one-on-one conversations for the logged-in user
// @route GET /api/messages/conversations
exports.getConversations = async (req, res) => {
  try {
    console.log('🔍 [getConversations] Starting - User ID:', req.user?._id);
    
    if (!req.user) {
      console.log('❌ [getConversations] No user found in request');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log('📋 [getConversations] Fetching conversations for user:', req.user._id);
    
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

    console.log('📊 [getConversations] Found conversations:', conversations.length);
    console.log('📊 [getConversations] Raw conversations:', conversations.map(c => ({ 
      _id: c._id, 
      participants: c.participants.map(p => p._id || p),
      isGroup: c.isGroup 
    })));

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
        participants: conv.participants, // Include original participants array
        otherParticipant,
        lastMessage: conv.lastMessage,
        updatedAt: conv.updatedAt,
        unreadCount,
      };
    }));

    console.log('✅ [getConversations] Returning formatted conversations:', formatted.length);
    console.log('✅ [getConversations] Formatted data sample:', formatted.slice(0, 2));
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
    console.log('🔍 [getMessages] Starting - User ID:', req.user?._id);
    console.log('🔍 [getMessages] Request params:', req.params);
    
    if (!req.user) {
      console.log('❌ [getMessages] No user found in request');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Accept either conversationId or userId as param
    let { conversationId, userId } = req.params;
    // The route is /user/:userId, so userId should be available directly
    if (!userId) {
      userId = req.params.userId;
    }
    console.log('📋 [getMessages] Extracted params - conversationId:', conversationId, 'userId:', userId);
    let conversation;

    // If conversationId is a valid ObjectId, try to find by id
    if (conversationId && conversationId.match(/^[0-9a-fA-F]{24}$/)) {
      conversation = await Conversation.findById(conversationId);
    }

    // If not found, or not provided, try to find by userId (other participant)
    if (!conversation) {
      userId = userId || req.body.receiverId;
      console.log('🔍 [getMessages] Trying to find conversation by userId:', userId);
      // Guard: if userId is missing or not a valid ObjectId, return []
      if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
        console.log('⚠️ [getMessages] Invalid or missing userId, returning empty array');
        return res.json([]);
      }
      conversation = await Conversation.findOne({
        participants: { $all: [req.user._id, userId] },
        isGroup: false
      });
      console.log('🔍 [getMessages] Conversation found by userId:', conversation?._id || 'none');
    }

    if (!conversation) {
      console.log('⚠️ [getMessages] No conversation found, returning empty array');
      return res.json([]); // No messages yet
    }
    
    console.log('📋 [getMessages] Found conversation:', conversation._id);

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

    console.log('✅ [getMessages] Returning messages:', messages.length);
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
    console.log('🔍 [sendMessage] Starting - User ID:', req.user?._id);
    console.log('🔍 [sendMessage] Request body:', req.body);
    console.log('🔍 [sendMessage] Database connection state:', require('mongoose').connection.readyState);
    
    if (!req.user) {
      console.log('❌ [sendMessage] No user found in request');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let { conversationId, content, receiverId } = req.body;
    if (!content || content.trim() === '') {
      console.log('❌ [sendMessage] No content provided or empty content');
      return res.status(400).json({ message: 'Content is required' });
    }
    
    console.log('📋 [sendMessage] Params - conversationId:', conversationId, 'receiverId:', receiverId, 'content length:', content.length);

    // Prevent sending to self
    if (receiverId && receiverId === req.user._id.toString()) {
      console.log('❌ [sendMessage] User trying to message themselves');
      return res.status(400).json({ message: 'You cannot message yourself.' });
    }

    // Only allow messaging if users are connected
    if (receiverId) {
      const myId = req.user._id.toString();
      console.log('🔍 [sendMessage] Checking connection - myId:', myId, 'receiverId:', receiverId);
      
      const connection = await Connection.findOne({
        $or: [
          { user1: myId, user2: receiverId },
          { user1: receiverId, user2: myId }
        ],
        status: "accepted"
      });
      
      console.log('🔍 [sendMessage] Connection query result:', connection);
      
      if (!connection) {
        // Let's also check what connections exist for debugging
        const allMyConnections = await Connection.find({
          $or: [
            { user1: myId },
            { user2: myId }
          ]
        });
        console.log('🔍 [sendMessage] All my connections:', allMyConnections.map(c => ({
          _id: c._id,
          user1: c.user1,
          user2: c.user2,
          status: c.status
        })));
        
        console.log('❌ [sendMessage] Users are not connected - sender:', req.user._id, 'receiver:', receiverId);
        return res.status(403).json({ message: "You can only message your connections." });
      }
      console.log('✅ [sendMessage] Users are connected:', connection._id);
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

    console.log('📝 [sendMessage] Creating message - sender:', req.user._id, 'receiver:', otherId, 'conversation:', conversation._id);
    console.log('📝 [sendMessage] Message data to create:', {
      sender: req.user._id,
      receiver: otherId,
      content: content,
      conversation: conversation._id
    });
    
    const message = await Message.create({
      sender: req.user._id,
      receiver: otherId,
      content,
      conversation: conversation._id
    });
    
    console.log('✅ [sendMessage] Message created successfully:', {
      _id: message._id,
      sender: message.sender,
      receiver: message.receiver,
      conversation: message.conversation,
      content: message.content
    });

    // Mark as read for sender, unread for receiver
    message.readBy = [{ user: req.user._id, readAt: new Date() }];
    await message.save();

    // Update conversation with last message and timestamp
    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();
    console.log('✅ [sendMessage] Conversation updated with last message');

    // Populate message fields before sending
    await message.populate('sender', 'name username avatarUrl email');
    await message.populate('receiver', 'name username avatarUrl email');
    
    console.log('🔍 [sendMessage] After population - receiver field:', message.receiver);
    console.log('🔍 [sendMessage] After population - sender field:', message.sender);
    
    // Ensure receiver is properly populated
    if (!message.receiver) {
      console.log('⚠️ [sendMessage] Receiver not populated, fetching manually');
      const receiverUser = await User.findById(otherId).select('name username avatarUrl email');
      if (receiverUser) {
        console.log('✅ [sendMessage] Found receiver user:', receiverUser.name);
        message.receiver = receiverUser;
      } else {
        console.log('❌ [sendMessage] Could not find receiver user with ID:', otherId);
      }
    }
    console.log('✅ [sendMessage] Message populated:', {
      _id: message._id,
      sender: message.sender?.name || message.sender,
      receiver: message.receiver?.name || message.receiver,
      content: message.content.substring(0, 50) + '...'
    });

    // Create notification for receiver
    try {
      NotificationController.createNotification(otherId, req.user._id, 'message', `${req.user.name || 'Someone'} sent you a message.`);
      console.log('✅ [sendMessage] Notification created for receiver');
    } catch (notifError) {
      console.error('⚠️ [sendMessage] Error creating notification:', notifError.message);
    }

    // Emit socket event to receiver with consistent data structure
    if (req.io) {
      console.log('📡 [sendMessage] Emitting socket events to receiver:', otherId.toString());
      
      // Create consistent message structure for Socket.IO
      const socketMessage = {
        _id: message._id,
        content: message.content,
        sender: message.sender, // Already populated
        receiver: message.receiver, // Already populated
        conversation: message.conversation,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        readBy: message.readBy || []
      };
      
      console.log('📡 [sendMessage] Socket message object:', {
        _id: socketMessage._id,
        content: socketMessage.content.substring(0, 50) + '...',
        sender: socketMessage.sender?.name || socketMessage.sender,
        receiver: socketMessage.receiver?.name || socketMessage.receiver,
        conversation: socketMessage.conversation
      });
      
      // Emit to receiver's room
      req.io.to(otherId.toString()).emit('newMessage', socketMessage);
      console.log('📡 [sendMessage] Socket event emitted successfully to receiver room:', otherId.toString());
      
      // Verify the receiver room exists (optional debug)
      const receiverSockets = req.io.sockets.adapter.rooms.get(otherId.toString());
      if (receiverSockets && receiverSockets.size > 0) {
        console.log('✅ [sendMessage] Receiver room has', receiverSockets.size, 'connected sockets');
      } else {
        console.log('⚠️ [sendMessage] Receiver room is empty or does not exist');
      }
    } else {
      console.log('⚠️ [sendMessage] No socket.io instance available');
    }

    console.log('✅ [sendMessage] Message sent successfully:', message._id);
    res.status(201).json(message);
  } catch (error) {
    console.error('❌ [sendMessage] Error occurred:', error);
    console.error('❌ [sendMessage] Error stack:', error.stack);
    console.error('❌ [sendMessage] Error name:', error.name);
    console.error('❌ [sendMessage] Error message:', error.message);
    
    // Check if it's a validation error
    if (error.name === 'ValidationError') {
      console.error('❌ [sendMessage] Validation error details:', error.errors);
      return res.status(400).json({ 
        message: 'Validation error', 
        details: Object.keys(error.errors).map(key => error.errors[key].message)
      });
    }
    
    // Check if it's a database connection error
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      console.error('❌ [sendMessage] Database error');
      return res.status(500).json({ message: 'Database error' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc Get messages in a conversation with pagination
// @route GET /api/conversations/:conversationId/messages
exports.getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "name username avatarUrl email")
      .populate("receiver", "name username avatarUrl email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user._id },
        "readBy.user": { $ne: req.user._id },
      },
      {
        $push: {
          readBy: {
            user: req.user._id,
            readAt: new Date(),
          },
        },
      },
    );

    res.json(messages.reverse());
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Send message in a specific conversation
// @route POST /api/conversations/:conversationId/messages
exports.sendConversationMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Find the receiver (other participant in the conversation)
    const receiverId = conversation.participants.find(
      participantId => participantId.toString() !== req.user._id.toString()
    );

    if (!receiverId) {
      return res.status(400).json({ message: "Receiver not found in conversation" });
    }

    const message = new Message({
      conversation: conversationId,
      sender: req.user._id,
      receiver: receiverId,
      content,
    });

    await message.save();
    await message.populate("sender", "name username avatarUrl email");
    await message.populate("receiver", "name username avatarUrl email");

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: new Date(),
    });

    // Emit socket event to receiver
    if (req.io) {
      const socketMessage = {
        _id: message._id,
        content: message.content,
        sender: message.sender,
        receiver: message.receiver,
        conversation: message.conversation,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        readBy: message.readBy || []
      };
      
      req.io.to(receiverId.toString()).emit('newMessage', socketMessage);
      console.log('📡 [sendConversationMessage] Socket event emitted to receiver:', receiverId.toString());
    }

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server error" });
  }
};