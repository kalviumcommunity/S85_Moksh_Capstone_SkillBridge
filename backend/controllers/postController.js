const Post = require('../models/post');
const { createNotification } = require('./notificationController');

// @desc Fetch feed
// @route GET /api/posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: 'author', select: 'name avatarUrl', strictPopulate: false });

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

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const post = await Post.create({
      author: req.user._id,
      imageUrl,
      caption: req.body.caption,
      anonymous: req.body.anonymous === 'true'
    });

    await post.populate('author', 'name avatarUrl');
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create post' });
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