const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../utils/multer'); // Use Cloudinary-enabled multer
const {
  getAllPosts,
  createPost,
  likePost,
  bookmarkPost,
  deletePost,
  editPost,
  getTrendingPosts,
  getBookmarkedPosts,
  addComment,
  getComments,
  deleteComment,
  likeComment,
  dislikeComment,
  replyToComment,
  likeReply,
  deleteReply
} = require('../controllers/postController');

// @route GET /api/posts/trending (must be before dynamic routes)
router.get('/trending', getTrendingPosts);

// @route GET /api/posts/bookmarks
router.get('/bookmarks', auth, getBookmarkedPosts);

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

// Comment routes
// @route POST /api/posts/:id/comments
router.post('/:id/comments', auth, addComment);

// @route GET /api/posts/:id/comments
router.get('/:id/comments', getComments);

// @route DELETE /api/posts/:id/comments/:commentId
router.delete('/:id/comments/:commentId', auth, deleteComment);

// @route POST /api/posts/:id/comments/:commentId/like
router.post('/:id/comments/:commentId/like', auth, likeComment);

// @route POST /api/posts/:id/comments/:commentId/dislike
router.post('/:id/comments/:commentId/dislike', auth, dislikeComment);

// @route POST /api/posts/:id/comments/:commentId/reply
router.post('/:id/comments/:commentId/reply', auth, replyToComment);

// Reply routes
// @route POST /api/posts/:id/comments/:commentId/replies/:replyId/like
router.post('/:id/comments/:commentId/replies/:replyId/like', auth, likeReply);

// @route DELETE /api/posts/:id/comments/:commentId/replies/:replyId
router.delete('/:id/comments/:commentId/replies/:replyId', auth, deleteReply);

module.exports = router;