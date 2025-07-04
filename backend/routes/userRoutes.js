const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const userController = require("../controllers/userController");
const upload = require('../utils/multer');

// STATIC routes first
router.get("/search", auth, userController.searchUsers);
router.get("/connections/status/:userId", auth, userController.getConnectionStatus);
router.get("/discover", auth, userController.discoverUsers);
router.get("/suggested", auth, userController.getSuggestedUsers);
router.post("/follow", auth, userController.followUser);
router.put('/profile/:id', upload.single('profilePic'), userController.updateUser);

// Add this before dynamic routes:
router.get('/me', auth, async (req, res) => {
  try {
    const user = await require('../models/user').findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DYNAMIC routes last
router.get("/:userId", auth, userController.getUserProfile);
router.get("/:userId/posts", auth, userController.getUserPosts);

// Update profile details
router.put('/:id/profile', userController.updateProfile);
// Upload/change profile picture
router.post('/:id/profile-picture', upload.single('profilePicture'), userController.uploadProfilePicture);
// Get user connections
router.get('/:id/connections', userController.getConnections);
// Remove a connection
router.delete('/:id/connections/:connectionId', userController.removeConnection);

module.exports = router;
