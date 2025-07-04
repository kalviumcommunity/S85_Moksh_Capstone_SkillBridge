const Notification = require('../models/notification');

// @desc Get notifications for a user
// @route GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name avatarUrl')
      .populate('postId', 'imageUrl caption')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Mark notification as read
// @route PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Mark all notifications as read
// @route PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Create notification (helper function)
exports.createNotification = async (recipientId, senderId, type, message, postId = null) => {
  try {
    // Don't create notification for self
    if (recipientId.toString() === senderId.toString()) {
      return;
    }

    // Set a default title based on type
    let title = "Notification";
    if (type === "like") title = "New Like";
    else if (type === "comment") title = "New Comment";
    else if (type === "connection") title = "New Connection";
    else if (type === "message") title = "New Message";
    // Add more types as needed

    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      title,      // <-- Add this line
      message,
      postId
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};