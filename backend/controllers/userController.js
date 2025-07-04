const User = require("../models/user");
const Post = require("../models/post");
const Connection = require("../models/connection");
const ConnectionRequest = require("../models/connectionRequest");
const cloudinary = require('../utils/cloudinary');

// @desc Get user profile
// @route GET /api/users/:id
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-__v");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Update user profile
// @route PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const updates = (({ name, bio, avatarUrl }) => ({ name, bio, avatarUrl }))(req.body);
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get user profile by ID
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get user's posts
exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate("author", "name username avatarUrl")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Check connection status with a user
exports.getConnectionStatus = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const myId = req.user._id.toString();
    const connection = await Connection.findOne({
      $or: [
        { user1: myId, user2: targetUserId },
        { user1: targetUserId, user2: myId },
      ],
      status: "accepted",
    });
    if (connection) return res.json({ status: "connected" });

    const pendingRequest = await ConnectionRequest.findOne({
      $or: [
        { requester: myId, recipient: targetUserId },
        { requester: targetUserId, recipient: myId },
      ],
      status: "pending",
    });
    if (pendingRequest) return res.json({ status: "pending" });

    res.json({ status: "none" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Discover users (not connected)
exports.discoverUsers = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const myId = req.user._id.toString();

    // Find all connections and pending requests involving the current user
    const connections = await Connection.find({
      $or: [{ user1: myId }, { user2: myId }],
    });

    // Get all connected user IDs (accepted)
    const connectedUserIds = connections
      .filter((conn) => conn.status === "accepted")
      .map((conn) => (conn.user1.toString() === myId ? conn.user2.toString() : conn.user1.toString()));

    // Get all pending user IDs (pending requests)
    const pendingUserIds = connections
      .filter((conn) => conn.status === "pending")
      .map((conn) => (conn.user1.toString() === myId ? conn.user2.toString() : conn.user1.toString()));

    // Exclude current user, already connected users, and users with pending requests
    const excludeIds = [...connectedUserIds, ...pendingUserIds, myId];

    // Find users not in excludeIds
    const users = await User.find({
      _id: { $nin: excludeIds },
    })
      .select("name username email avatarUrl")
      .limit(limit)
      .skip(skip);

    // Mark if a request has been sent to each user
    const usersWithRequestStatus = users.map((user) => ({
      ...user.toObject(),
      requestSent: pendingUserIds.includes(user._id.toString()),
    }));

    res.json(usersWithRequestStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get suggested users (mutual connections, etc.)
exports.getSuggestedUsers = async (req, res) => {
  try {
    const myId = req.user._id.toString();
    const connections = await Connection.find({
      $or: [{ user1: myId }, { user2: myId }],
    });
    const connectedUserIds = connections.map((conn) =>
      conn.user1.toString() === myId ? conn.user2.toString() : conn.user1.toString()
    );

    const mutualConnections = await Connection.find({
      $or: [{ user1: { $in: connectedUserIds } }, { user2: { $in: connectedUserIds } }],
    });

    const suggestedUserIds = new Set();
    mutualConnections.forEach((conn) => {
      const userId1 = conn.user1.toString();
      const userId2 = conn.user2.toString();
      if (!connectedUserIds.includes(userId1) && userId1 !== myId) {
        suggestedUserIds.add(userId1);
      }
      if (!connectedUserIds.includes(userId2) && userId2 !== myId) {
        suggestedUserIds.add(userId2);
      }
    });

    const suggestedUsers = await User.find({
      _id: { $in: Array.from(suggestedUserIds) },
    })
      .select("name username email avatarUrl")
      .limit(10);

    const usersWithMutualCount = await Promise.all(
      suggestedUsers.map(async (user) => {
        const mutualCount = await Connection.countDocuments({
          $or: [
            { user1: { $in: connectedUserIds }, user2: user._id },
            { user1: user._id, user2: { $in: connectedUserIds } },
          ],
        });
        return {
          ...user.toObject(),
          mutualConnections: mutualCount,
        };
      })
    );

    res.json(usersWithMutualCount);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Follow user
exports.followUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const myId = req.user._id.toString();
    if (userId === myId) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }
    const user = await User.findById(myId);
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.following.includes(userId)) {
      return res.status(400).json({ message: "Already following this user" });
    }
    user.following.push(userId);
    targetUser.followers.push(user._id);
    await user.save();
    await targetUser.save();
    res.json({ message: "User followed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Search users
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Search query required" });
    }
    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { username: { $regex: q, $options: "i" } },
      ],
      _id: { $ne: req.user._id },
    })
      .select("name username email avatarUrl") // <-- fix here
      .limit(20);
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user profile details
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { name, bio, profilePicture } = req.body;
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Upload/change profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'profile_pictures',
      public_id: `user_${user._id}`,
      overwrite: true,
    });
    user.profilePicture = result.secure_url;
    await user.save();
    res.json({ message: 'Profile picture updated', url: result.secure_url });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get user connections
exports.getConnections = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('connections', 'name username email profilePicture');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.connections);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Remove a connection
exports.removeConnection = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.connections = user.connections.filter(
      connId => connId.toString() !== req.params.connectionId
    );
    await user.save();
    res.json({ message: 'Connection removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


