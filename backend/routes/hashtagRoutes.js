const express = require('express');
const router = express.Router();
const { getTrendingHashtags } = require('../controllers/postController');
const auth = require('../middleware/auth');

// @route GET /api/hashtags/trending
// Public: Trending hashtags for Explore page
router.get('/trending', getTrendingHashtags);

// @route POST /api/hashtags/follow
// Private: Follow a hashtag
router.post('/follow', auth, async (req, res) => {
  try {
    // Placeholder implementation
    res.json({ message: 'Hashtag followed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;