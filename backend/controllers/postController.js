const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .populate('author', 'username profilePicture');
    
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username profilePicture')
      .populate('comments.user', 'username profilePicture');
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server error');
  }
};

// Search posts
exports.searchPosts = async (req, res) => {
  try {
    const searchQuery = req.query.q;
    
    if (!searchQuery) {
      return res.status(400).json({ msg: 'Search query is required' });
    }
    
    // Create a regex for case-insensitive search
    const regex = new RegExp(searchQuery, 'i');
    
    const posts = await Post.find({
      $and: [
        { status: 'published' },
        {
          $or: [
            { title: regex },
            { content: regex },
            { categories: regex },
            { tags: regex }
          ]
        }
      ]
    })
      .sort({ createdAt: -1 })
      .populate('author', 'username profilePicture');
    
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    // Aggregate to get unique categories across all posts
    const categories = await Post.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$categories' },
      { $group: { _id: '$categories' } },
      { $sort: { _id: 1 } }
    ]);
    
    // Extract category names from the aggregation result
    const categoryNames = categories.map(category => category._id);
    
    res.json(categoryNames);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get posts by category
exports.getPostsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    
    const posts = await Post.find({
      categories: category,
      status: 'published'
    })
      .sort({ createdAt: -1 })
      .populate('author', 'username profilePicture');
    
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get posts by user ID
exports.getPostsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const posts = await Post.find({
      author: userId,
      status: 'published'
    })
      .sort({ createdAt: -1 })
      .populate('author', 'username profilePicture');
    
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
};

// Create a post
exports.createPost = async (req, res) => {
  try {
    const { title, content, categories, tags, status } = req.body;
    
    const newPost = new Post({
      title,
      content,
      author: req.user.id,
      categories: categories || ['Uncategorized'],
      tags: tags || [],
      status: status || 'published',
      image: req.file ? `/uploads/${req.file.filename}` : ''
    });

    const post = await newPost.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    const { title, content, categories, tags, status } = req.body;
    
    // Find post
    let post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    // Check user authorization
    if (post.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Update fields
    if (title) post.title = title;
    if (content) post.content = content;
    if (categories) post.categories = categories;
    if (tags) post.tags = tags;
    if (status) post.status = status;
    if (req.file) post.image = `/uploads/${req.file.filename}`;
    
    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server error');
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    // Check user authorization
    if (post.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    await Post.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server error');
  }
};

// Like a post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    // Check if post has already been liked by this user
    if (post.likes.some(like => like.toString() === req.user.id)) {
      // Unlike the post
      post.likes = post.likes.filter(like => like.toString() !== req.user.id);
    } else {
      // Like the post
      post.likes.unshift(req.user.id);
      
      // Create notification for post author (if not liking own post)
      if (post.author.toString() !== req.user.id) {
        const newNotification = new Notification({
          recipient: post.author,
          sender: req.user.id,
          post: post._id,
          type: 'like'
        });
        
        await newNotification.save();
      }
    }
    
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server error');
  }
};

// Add comment to a post
exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const user = await User.findById(req.user.id).select('-password');
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    const newComment = {
      user: req.user.id,
      text: req.body.text
    };
    
    post.comments.unshift(newComment);
    await post.save();
    
    // Create notification for post author (if not commenting on own post)
    if (post.author.toString() !== req.user.id) {
      const newNotification = new Notification({
        recipient: post.author,
        sender: req.user.id,
        post: post._id,
        comment: post.comments[0]._id, // First comment is the one we just added
        type: 'comment'
      });
      
      await newNotification.save();
    }
    
    // Populate user info for the new comment
    const populatedPost = await Post.findById(req.params.id)
      .populate('comments.user', 'username profilePicture');
    
    res.json(populatedPost.comments);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server error');
  }
};

// Delete comment from a post
exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    // Find the comment
    const comment = post.comments.find(comment => comment.id === req.params.comment_id);
    
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    
    // Check user authorization
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Remove comment
    post.comments = post.comments.filter(comment => comment.id !== req.params.comment_id);
    
    await post.save();
    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Resource not found' });
    }
    res.status(500).send('Server error');
  }
};
