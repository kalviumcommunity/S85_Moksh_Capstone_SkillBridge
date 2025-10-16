const Post = require('../models/post');
const { createNotification } = require('./notificationController');
const Hashtag = require('../models/hashtag');

// @desc Fetch feed
// @route GET /api/posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: 'author', select: 'name avatarUrl', strictPopulate: false })
      .populate({ path: 'comments.author', select: 'name avatarUrl', strictPopulate: false })
      .populate({ path: 'comments.replies.author', select: 'name avatarUrl', strictPopulate: false });

    res.json(posts.map(p => ({
      _id: p._id,
      imageUrl: p.imageUrl,
      caption: p.caption,
      author: p.author || null,
      anonymous: p.anonymous || false,
      likes: p.likes || 0,
      likedBy: p.likedBy || [],
      comments: p.comments || [],
      createdAt: p.createdAt
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Create a new post
// @route POST /api/posts
exports.createPost = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log('DEBUG file:', req.file);
    console.log('DEBUG body:', req.body);

    const imageUrl = req.file ? req.file.path : null; // ✅ Cloudinary URL or null

    const post = await Post.create({
      author: req.user._id,
      imageUrl,
      caption: req.body.caption,
      anonymous: req.body.anonymous === 'true'
    });

    await post.populate('author', 'name avatarUrl');
    res.status(201).json(post);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ message: 'Failed to create post', error: err.message });
  }
};


// @desc Like/Unlike a post
// @route POST /api/posts/:id/like
exports.likePost = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likedBy = post.likedBy || [];
    const userIndex = likedBy.findIndex(id => id.toString() === req.user._id.toString());

    if (userIndex > -1) {
      // Unlike
      likedBy.splice(userIndex, 1);
    } else {
      // Like
      likedBy.push(req.user._id);
      
      // Create notification if not own post
      if (!post.author.equals(req.user._id)) {
        await createNotification(
          post.author,
          req.user._id,
          'like',
          `${req.user.name} liked your post`,
          post._id
        );
      }
    }

    post.likedBy = likedBy;
    post.likes = likedBy.length;
    await post.save();

    res.json({ likes: post.likes, likedBy: post.likedBy });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Bookmark a post
// @route POST /api/posts/:id/bookmark
exports.bookmarkPost = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // You can implement a bookmarks collection here
    // For now, just return success
    res.json({ message: 'Post bookmarked successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Delete a post
// @route DELETE /api/posts/:id
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (req.user && post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Edit a post's caption
// @route PUT /api/posts/:id
exports.editPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Only the author can edit
    if (!req.user || post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    // Only update caption if provided
    if (typeof req.body.caption === "string") {
      post.caption = req.body.caption;
    }

    await post.save();
    res.json({ message: 'Post updated', post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBookmarkedPosts = async (req, res) => {
  // Placeholder: return empty array
  res.json([]);
};

/**
 * Get Trending Posts
 * This function returns the top 10 posts for the Explore page.
 * Trending is determined by sorting posts by number of likes, then views, then most recent.
 * The author information is included for each post.
 * This endpoint is public and does not require authentication.
 */
exports.getTrendingPosts = async (req, res) => {
  try {
    console.log('DEBUG: getTrendingPosts called');
    // Find all posts, sort by likes (descending), then views (descending), then most recent
    const posts = await Post.find()
      .sort({ likes: -1, views: -1, createdAt: -1 })
      .limit(10)
      .populate('author', 'name username avatarUrl');
    console.log('DEBUG: getTrendingPosts result count:', posts.length);
    res.json(posts);
  } catch (err) {
    console.error('ERROR in getTrendingPosts:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * Get Trending Hashtags
 * This function returns the top 10 hashtags for the Explore page.
 * Trending hashtags are determined by their usage count (most used first).
 * This endpoint is public and does not require authentication.
 */
exports.getTrendingHashtags = async (req, res) => {
  try {
    console.log('DEBUG: getTrendingHashtags called');
    // Find all hashtags, sort by count (descending)
    const hashtags = await Hashtag.find()
      .sort({ count: -1 })
      .limit(10);
    console.log('DEBUG: getTrendingHashtags result count:', hashtags.length);
    res.json(hashtags);
  } catch (err) {
    console.error('ERROR in getTrendingHashtags:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc Add comment to a post
// @route POST /api/posts/:id/comments
exports.addComment = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      author: req.user._id,
      text: text.trim(),
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    // Populate the new comment with author details
    await post.populate('comments.author', 'name avatarUrl');
    
    // Create notification if not own post
    if (!post.author.equals(req.user._id)) {
      await createNotification(
        post.author,
        req.user._id,
        'comment',
        `${req.user.name} commented on your post`,
        post._id
      );
    }

    // Return the newly added comment with populated author
    const addedComment = post.comments[post.comments.length - 1];
    res.status(201).json({
      _id: addedComment._id,
      text: addedComment.text,
      author: {
        _id: addedComment.author._id,
        name: addedComment.author.name,
        avatarUrl: addedComment.author.avatarUrl
      },
      likes: addedComment.likes || 0,
      dislikes: addedComment.dislikes || 0,
      likedBy: addedComment.likedBy || [],
      dislikedBy: addedComment.dislikedBy || [],
      replies: addedComment.replies || [],
      createdAt: addedComment.createdAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Get comments for a post
// @route GET /api/posts/:id/comments
exports.getComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('comments.author', 'name avatarUrl');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post.comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Delete a comment
// @route DELETE /api/posts/:id/comments/:commentId
exports.deleteComment = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Only comment author or post author can delete
    if (comment.author.toString() !== req.user._id.toString() && 
        post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    post.comments.pull(req.params.commentId);
    await post.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Like/Unlike a comment
// @route POST /api/posts/:id/comments/:commentId/like
exports.likeComment = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const likedBy = comment.likedBy || [];
    const dislikedBy = comment.dislikedBy || [];
    const userIndex = likedBy.findIndex(id => id.toString() === req.user._id.toString());
    const dislikeIndex = dislikedBy.findIndex(id => id.toString() === req.user._id.toString());

    // Remove from dislikes if present
    if (dislikeIndex > -1) {
      dislikedBy.splice(dislikeIndex, 1);
      comment.dislikes = Math.max(0, comment.dislikes - 1);
    }

    if (userIndex > -1) {
      // Unlike
      likedBy.splice(userIndex, 1);
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      // Like
      likedBy.push(req.user._id);
      comment.likes = (comment.likes || 0) + 1;
    }

    comment.likedBy = likedBy;
    comment.dislikedBy = dislikedBy;
    await post.save();

    res.json({ 
      likes: comment.likes, 
      dislikes: comment.dislikes,
      likedBy: comment.likedBy,
      dislikedBy: comment.dislikedBy
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Dislike/Remove dislike from a comment
// @route POST /api/posts/:id/comments/:commentId/dislike
exports.dislikeComment = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const likedBy = comment.likedBy || [];
    const dislikedBy = comment.dislikedBy || [];
    const userIndex = dislikedBy.findIndex(id => id.toString() === req.user._id.toString());
    const likeIndex = likedBy.findIndex(id => id.toString() === req.user._id.toString());

    // Remove from likes if present
    if (likeIndex > -1) {
      likedBy.splice(likeIndex, 1);
      comment.likes = Math.max(0, comment.likes - 1);
    }

    if (userIndex > -1) {
      // Remove dislike
      dislikedBy.splice(userIndex, 1);
      comment.dislikes = Math.max(0, comment.dislikes - 1);
    } else {
      // Dislike
      dislikedBy.push(req.user._id);
      comment.dislikes = (comment.dislikes || 0) + 1;
    }

    comment.likedBy = likedBy;
    comment.dislikedBy = dislikedBy;
    await post.save();

    res.json({ 
      likes: comment.likes, 
      dislikes: comment.dislikes,
      likedBy: comment.likedBy,
      dislikedBy: comment.dislikedBy
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Add reply to a comment
// @route POST /api/posts/:id/comments/:commentId/reply
exports.replyToComment = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Reply text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const newReply = {
      author: req.user._id,
      text: text.trim(),
      createdAt: new Date(),
      likes: 0,
      likedBy: []
    };

    comment.replies.push(newReply);
    await post.save();

    // Populate the reply with author details
    await post.populate('comments.replies.author', 'name avatarUrl');
    
    // Get the newly added reply
    const addedReply = comment.replies[comment.replies.length - 1];
    
    res.status(201).json({
      _id: addedReply._id,
      text: addedReply.text,
      author: {
        _id: addedReply.author._id,
        name: addedReply.author.name,
        avatarUrl: addedReply.author.avatarUrl
      },
      createdAt: addedReply.createdAt,
      likes: addedReply.likes,
      likedBy: addedReply.likedBy
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Like/Unlike a reply
// @route POST /api/posts/:id/comments/:commentId/replies/:replyId/like
exports.likeReply = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const reply = comment.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    const likedBy = reply.likedBy || [];
    const userIndex = likedBy.findIndex(id => id.toString() === req.user._id.toString());

    if (userIndex > -1) {
      // Unlike
      likedBy.splice(userIndex, 1);
      reply.likes = Math.max(0, reply.likes - 1);
    } else {
      // Like
      likedBy.push(req.user._id);
      reply.likes = (reply.likes || 0) + 1;
    }

    reply.likedBy = likedBy;
    await post.save();

    res.json({ 
      likes: reply.likes, 
      likedBy: reply.likedBy
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Delete a reply
// @route DELETE /api/posts/:id/comments/:commentId/replies/:replyId
exports.deleteReply = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const reply = comment.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    // Only reply author, comment author, or post author can delete
    if (reply.author.toString() !== req.user._id.toString() && 
        comment.author.toString() !== req.user._id.toString() &&
        post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this reply' });
    }

    comment.replies.pull(req.params.replyId);
    await post.save();

    res.json({ message: 'Reply deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};