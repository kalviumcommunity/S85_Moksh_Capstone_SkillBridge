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
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
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
  console.log('User connected:', socket.id);

  socket.on('join', async (userId) => {
    socket.userId = userId;
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
    // Set user online
    await User.findByIdAndUpdate(userId, { isOnline: true });
    // Notify all connections (optional: you can emit to all users or just connections)
    io.emit('status', { userId, isOnline: true });
  });

  socket.on('sendMessage', (messageData) => {
    socket.to(messageData.receiverId).emit('newMessage', messageData);
  });

  // Relay typing event
  socket.on('typing', (data) => {
    // data: { conversationId, userId }
    if (data && data.conversationId && data.userId) {
      Conversation.findById(data.conversationId).then(conv => {
        if (conv && conv.participants) {
          conv.participants.forEach(participantId => {
            if (participantId.toString() !== data.userId) {
              io.to(participantId.toString()).emit('typing', data);
            }
          });
        }
      });
    }
  });

  socket.on('disconnect', async () => {
    if (socket.userId) {
      await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastSeen: new Date() });
      io.emit('status', { userId: socket.userId, isOnline: false, lastSeen: new Date() });
    }
    console.log('User disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/connections', require('./routes/connectionRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/conversations', require('./routes/conversationRoutes'));
app.use('/api/hashtags', require('./routes/hashtagRoutes'));

// Start server after DB connects
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});
