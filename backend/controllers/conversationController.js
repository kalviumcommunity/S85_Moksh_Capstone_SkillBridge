const Conversation = require("../models/conversation")
const Message = require("../models/message")
const User = require("../models/user")

exports.getAllConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.userId,
    })
      .populate("participants", "name username avatarUrl isOnline lastSeen email")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "name username email avatarUrl",
        },
      })
      .sort({ updatedAt: -1 })

    // Return a flat structure with otherParticipant for frontend
    const formatted = await Promise.all(conversations.map(async conv => {
      let otherParticipant = (conv.participants || []).find(
        p => p && p._id.toString() !== req.userId.toString()
      );
      // If otherParticipant is missing, try to fetch from DB
      if (!otherParticipant) {
        const otherId = (conv.participants || []).find(
          p => p && p.toString() !== req.userId.toString()
        );
        if (otherId) {
          otherParticipant = await User.findById(otherId).select('name username avatarUrl isOnline lastSeen email');
        }
      }
      // If still missing, mark as Deleted User
      if (!otherParticipant) {
        otherParticipant = { name: 'Deleted User', username: '', email: '', avatarUrl: '', isOnline: false, lastSeen: null };
      }
      // Count unread messages
      const unreadCount = await Message.countDocuments({
        conversation: conv._id,
        sender: { $ne: req.userId },
        "readBy.user": { $ne: req.userId },
      });
      return {
        _id: conv._id,
        otherParticipant,
        lastMessage: conv.lastMessage,
        updatedAt: conv.updatedAt,
        unreadCount,
      };
    }));

    res.json(formatted)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.createConversation = async (req, res) => {
  try {
    const { participantId } = req.body

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.userId, participantId] },
      isGroup: false,
    })

    if (conversation) {
      await conversation.populate("participants", "name username avatarUrl isOnline lastSeen email")
      return res.json(conversation)
    }

    // Create new conversation
    conversation = new Conversation({
      participants: [req.userId, participantId],
    })

    await conversation.save()
    await conversation.populate("participants", "name username avatarUrl isOnline lastSeen email")

    res.status(201).json(conversation)
  } catch (error) {
    console.error("Error creating conversation:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 50
    const skip = (page - 1) * limit

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.userId,
    })

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" })
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "name username avatarUrl email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.userId },
        "readBy.user": { $ne: req.userId },
      },
      {
        $push: {
          readBy: {
            user: req.userId,
            readAt: new Date(),
          },
        },
      },
    )

    res.json(messages.reverse())
  } catch (error) {
    console.error("Error fetching messages:", error)
    res.status(500).json({ message: "Server error" })
  }
}

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params
    const { content } = req.body

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.userId,
    })

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" })
    }

    const message = new Message({
      conversation: conversationId,
      sender: req.userId,
      content,
    })

    await message.save()
    await message.populate("sender", "name username avatarUrl email")

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: new Date(),
    })

    res.status(201).json(message)
  } catch (error) {
    console.error("Error sending message:", error)
    res.status(500).json({ message: "Server error" })
  }
}