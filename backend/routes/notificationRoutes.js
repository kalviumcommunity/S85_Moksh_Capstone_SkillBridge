const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');

// All routes require authentication
router.use(auth);

// @route GET /api/notifications
router.get('/', getNotifications);

// @route PUT /api/notifications/:id/read
router.put('/:id/read', markAsRead);

// @route PUT /api/notifications/read-all
router.put('/read-all', markAllAsRead);

// @route DELETE /api/notifications/:id
router.delete('/:id', deleteNotification);

module.exports = router;