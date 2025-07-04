const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const {
  getAllPosts,
  createPost,
  likePost,
  bookmarkPost,
  deletePost,
  editPost // <-- Import the editPost controller
} = require('../controllers/postController');

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// @route GET /api/posts
router.get('/', getAllPosts);

// @route POST /api/posts
router.post('/', auth, upload.single('image'), createPost);

// @route POST /api/posts/:id/like
router.post('/:id/like', auth, likePost);

// @route POST /api/posts/:id/bookmark
router.post('/:id/bookmark', auth, bookmarkPost);

// @route PUT /api/posts/:id
router.put('/:id', auth, editPost); // <-- Add this line

// @route DELETE /api/posts/:id
router.delete('/:id', auth, deletePost);

module.exports = router;