const Connection = require('../models/connection');
const User = require('../models/user');
const { createNotification } = require('./notificationController');

// @desc Get user's connections
// @route GET /api/connections
exports.getConnections = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const connections = await Connection.find({
      $or: [
        { user1: req.user._id },
        { user2: req.user._id }
      ],
      status: 'accepted'
    })
    .populate('user1', 'name username email avatarUrl')
    .populate('user2', 'name username email avatarUrl')
    .sort({ createdAt: -1 });

    // Format connections to show the other user
    const formattedConnections = connections.map(conn => {
      const otherUser = conn.user1._id.equals(req.user._id)
        ? conn.user2
        : conn.user1;
      return {
        _id: conn._id,
        user: otherUser,
        connectedAt: conn.createdAt
      };
    });

    res.json(formattedConnections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Get connection requests
// @route GET /api/connections/requests
exports.getConnectionRequests = async (req, res) => {
  try {
    const requests = await Connection.find({
      user2: req.user._id, // <-- Only requests sent TO the current user
      status: "pending"
    })
      .populate("user1", "name username email avatarUrl") // populate sender info
      .sort({ createdAt: -1 });

    // Format for frontend
    const formatted = requests.map(req => ({
      _id: req._id,
      requester: req.user1, // sender info
      createdAt: req.createdAt
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Send connection request
// @route POST /api/connections/request
exports.sendConnectionRequest = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log("[sendConnectionRequest] BODY:", req.body, "USER:", req.user._id);

    const { userId } = req.body;

    if (!userId) {
      console.log("[sendConnectionRequest] No userId provided");
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (userId === req.user._id.toString()) {
      console.log("[sendConnectionRequest] Attempt to connect to self");
      return res.status(400).json({ message: 'Cannot connect to yourself' });
    }

    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { user1: req.user._id, user2: userId },
        { user1: userId, user2: req.user._id }
      ]
    });

    if (existingConnection) {
      console.log("[sendConnectionRequest] Connection already exists:", existingConnection);
      return res.status(400).json({ message: 'Connection already exists' });
    }

    const connection = await Connection.create({
      user1: req.user._id,
      user2: userId,
      status: 'pending'
    });

    console.log("[sendConnectionRequest] Created connection:", connection);

    if (typeof createNotification === "function") {
      await createNotification(
        userId,
        req.user._id,
        'follow',
        `${req.user.name} sent you a connection request`
      );
    }

    res.status(201).json(connection);
  } catch (error) {
    console.error("[sendConnectionRequest] Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Accept/Decline connection request
// @route PUT /api/connections/:id
// @desc Accept/Decline connection request
// @route PUT /api/connections/:id
exports.updateConnectionRequest = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { status } = req.body;
    console.log("[updateConnectionRequest] req.params.id:", req.params.id, "status:", status, "user:", req.user._id);

    if (!['accepted', 'declined'].includes(status)) {
      console.log("[updateConnectionRequest] Invalid status:", status);
      return res.status(400).json({ message: 'Invalid status' });
    }

    const connection = await Connection.findOneAndUpdate(
      {
        _id: req.params.id,
        user2: req.user._id, // <-- FIXED: match `user2` (the recipient)
        status: 'pending'
      },
      { status },
      { new: true }
    ).populate('user1', 'name username email avatarUrl');

    if (!connection) {
      console.log("[updateConnectionRequest] Connection request not found for id:", req.params.id);
      return res.status(404).json({ message: 'Connection request not found' });
    }

    if (status === 'accepted') {
      await createNotification(
        connection.user1._id,
        req.user._id,
        'follow',
        `${req.user.name} accepted your connection request`
      );
    }

    console.log("[updateConnectionRequest] Updated connection:", connection);
    res.json(connection);
  } catch (error) {
    console.error("[updateConnectionRequest] Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc Get suggested connections
// @route GET /api/connections/suggestions
exports.getSuggestions = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get users who are not already connected
    const existingConnections = await Connection.find({
      $or: [
        { user1: req.user._id },
        { user2: req.user._id }
      ]
    });

    const connectedUserIds = existingConnections.map(conn =>
      conn.user1.equals(req.user._id) ? conn.user2 : conn.user1
    );

    // Add current user to exclude list
    connectedUserIds.push(req.user._id);

    const suggestions = await User.find({
      _id: { $nin: connectedUserIds }
    })
    .select('name username email avatarUrl')
    .limit(10);

    res.json(suggestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Get connection status
// @route GET /api/connections/status/:userId
// @desc Get connection status
// @route GET /api/connections/status/:userId
exports.getConnectionStatus = async (req, res) => {
  try {
    const myId = req.user._id;
    const targetId = req.params.userId;

    const connection = await Connection.findOne({
      $or: [
        { user1: myId, user2: targetId, status: 'accepted' },
        { user1: targetId, user2: myId, status: 'accepted' }
      ]
    });

    if (connection) return res.json({ status: "connected" });

    const pending = await Connection.findOne({
      $or: [
        { user1: myId, user2: targetId, status: 'pending' },
        { user1: targetId, user2: myId, status: 'pending' }
      ]
    });

    if (pending) {
      // Optional: show direction of request
      const direction = pending.user1.toString() === myId.toString() ? "sent" : "received";
      return res.json({ status: "pending", direction });
    }

    res.json({ status: "none" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
