const express = require('express');
const router = express.Router();
const { getTrendingHashtags } = require('../controllers/postController');

// @route GET /api/hashtags/trending
// Public: Trending hashtags for Explore page
router.get('/trending', getTrendingHashtags);

module.exports = router; 