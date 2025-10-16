const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db'); // ✅ NEW
require('dotenv').config();
const Conversation = require('./models/conversation');
const User = require('./models/user'); // <-- Add this import

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "https://skillbridgeweb.netlify.app",
      "http://localhost:5173"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://skillbridgeweb.netlify.app'
  ],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Attach io to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('🔌 [Socket] User connected:', socket.id);

  socket.on('join', async (userId) => {
    try {
      console.log('🏠 [Socket] User joining room:', userId, 'socket:', socket.id);
      
      // Validate userId format
      if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
        console.log('❌ [Socket] Invalid userId format:', userId);
        socket.emit('error', { message: 'Invalid user ID format' });
        return;
      }
      
      // Verify user exists in database
      const user = await User.findById(userId);
      if (!user) {
        console.log('❌ [Socket] User not found:', userId);
        socket.emit('error', { message: 'User not found' });
        return;
      }
      
      socket.userId = userId;
      socket.join(userId);
      console.log(`✅ [Socket] User ${userId} (${user.name}) joined their room`);
      
      // Set user online
      await User.findByIdAndUpdate(userId, { 
        isOnline: true,
        lastSeen: new Date()
      });
      
      // Notify all connections about online status
      io.emit('status', { userId, isOnline: true });
      console.log('📡 [Socket] Emitted online status for user:', userId);
      
      // Send connection confirmation to client
      socket.emit('joined', { userId, status: 'connected' });
      
    } catch (error) {
      console.error('❌ [Socket] Error in join handler:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  socket.on('sendMessage', (messageData) => {
    try {
      console.log('📨 [Socket] Relaying message from socket:', socket.id, 'to receiver:', messageData.receiverId);
      console.log('📨 [Socket] Message data:', {
        _id: messageData._id,
        content: messageData.content?.substring(0, 50) + '...',
        sender: messageData.sender?._id || messageData.sender,
        receiver: messageData.receiver?._id || messageData.receiver,
        conversation: messageData.conversation
      });
      
      // Validate message data
      if (!messageData._id || !messageData.content || !messageData.receiverId) {
        console.log('❌ [Socket] Invalid message data:', messageData);
        socket.emit('error', { message: 'Invalid message data' });
        return;
      }
      
      // Verify sender is authenticated
      if (!socket.userId) {
        console.log('❌ [Socket] Unauthenticated socket trying to send message');
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }
      
      if (messageData.receiverId) {
        console.log('📡 [Socket] Emitting to receiver room:', messageData.receiverId);
        
        // Ensure the message has all required fields with proper structure
        const relayMessage = {
          _id: messageData._id,
          content: messageData.content,
          sender: messageData.sender,
          receiver: messageData.receiver,
          conversation: messageData.conversation,
          createdAt: messageData.createdAt,
          updatedAt: messageData.updatedAt,
          readBy: messageData.readBy || []
        };
        
        // Emit to specific user room
        io.to(messageData.receiverId).emit('newMessage', relayMessage);
        console.log('✅ [Socket] Message relayed successfully to receiver:', messageData.receiverId);
        
        // Also emit to sender for confirmation (optional)
        socket.emit('messageDelivered', { messageId: messageData._id, status: 'sent' });
        
      } else {
        console.log('⚠️ [Socket] No receiverId provided, cannot relay message');
        socket.emit('error', { message: 'Receiver ID required' });
      }
    } catch (error) {
      console.error('❌ [Socket] Error in sendMessage handler:', error);
      socket.emit('error', { message: 'Failed to relay message' });
    }
  });

  // Relay typing event
  socket.on('typing', async (data) => {
    try {
      console.log('⌨️ [Socket] Typing event received:', data);
      
      // Validate typing data
      if (!data || !data.conversationId || !data.userId) {
        console.log('⚠️ [Socket] Invalid typing data received:', data);
        socket.emit('error', { message: 'Invalid typing data' });
        return;
      }
      
      // Verify sender is authenticated and matches userId
      if (!socket.userId || socket.userId !== data.userId) {
        console.log('❌ [Socket] Unauthorized typing event from:', socket.userId, 'claiming to be:', data.userId);
        socket.emit('error', { message: 'Unauthorized typing event' });
        return;
      }
      
      const conv = await Conversation.findById(data.conversationId);
      if (conv && conv.participants) {
        console.log('📡 [Socket] Broadcasting typing to participants:', conv.participants.length);
        
        // Only broadcast to other participants
        conv.participants.forEach(participantId => {
          if (participantId.toString() !== data.userId) {
            console.log('⌨️ [Socket] Emitting typing to:', participantId.toString());
            io.to(participantId.toString()).emit('typing', {
              conversationId: data.conversationId,
              userId: data.userId,
              isTyping: data.isTyping !== false // default to true
            });
          }
        });
      } else {
        console.log('⚠️ [Socket] Conversation not found or no participants:', data.conversationId);
        socket.emit('error', { message: 'Conversation not found' });
      }
    } catch (err) {
      console.error('❌ [Socket] Error in typing handler:', err);
      socket.emit('error', { message: 'Failed to process typing event' });
    }
  });

  socket.on('disconnect', async (reason) => {
    try {
      console.log('🔌 [Socket] User disconnecting:', socket.id, 'userId:', socket.userId, 'reason:', reason);
      
      if (socket.userId) {
        const lastSeen = new Date();
        await User.findByIdAndUpdate(socket.userId, { 
          isOnline: false, 
          lastSeen: lastSeen 
        });
        
        // Emit offline status to all users
        io.emit('status', { 
          userId: socket.userId, 
          isOnline: false, 
          lastSeen: lastSeen 
        });
        
        console.log('📡 [Socket] Emitted offline status for user:', socket.userId);
      }
      
      console.log('❌ [Socket] User disconnected:', socket.id);
    } catch (error) {
      console.error('❌ [Socket] Error in disconnect handler:', error);
    }
  });
  
  // Handle connection errors
  socket.on('error', (error) => {
    console.error('❌ [Socket] Socket error for user:', socket.userId, 'error:', error);
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/connections', require('./routes/connectionRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/hashtags', require('./routes/hashtagRoutes'));

// Start server after DB connects
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});
