const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

// Get admin dashboard statistics and recent activity
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts from each collection
    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();
    const commentCount = await Comment.countDocuments();
    const notificationCount = await Notification.countDocuments({ read: false });
    
    // Get recent activity (newest users, posts, and comments)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username createdAt');
      
    const recentPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title createdAt')
      .populate('author', 'username');
      
    const recentComments = await Comment.find()
      .sort({ date: -1 })
      .limit(5)
      .select('text date')
      .populate('user', 'username')
      .populate('post', 'title');
    
    res.json({
      stats: {
        users: userCount,
        posts: postCount,
        comments: commentCount,
        notifications: notificationCount
      },
      recentActivity: {
        users: recentUsers,
        posts: recentPosts,
        comments: recentComments
      }
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err.message);
    res.status(500).send('Server error');
  }
};

// Get basic stats (no authentication required)
exports.getStats = async (req, res) => {
  try {
    // Get counts from each collection
    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();
    const commentCount = await Comment.countDocuments();
    const notificationCount = await Notification.countDocuments({ read: false });
    
    res.json({
      users: userCount,
      posts: postCount,
      comments: commentCount,
      notifications: notificationCount
    });
  } catch (err) {
    console.error('Error fetching stats:', err.message);
    res.status(500).send('Server error');
  }
};

// Get all users for admin management
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).send('Server error');
  }
};

// Get all posts for admin management
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('Error fetching posts:', err.message);
    res.status(500).send('Server error');
  }
};

// Get all comments for admin management
exports.getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('user', 'username')
      .populate('post', 'title')
      .sort({ date: -1 });
    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err.message);
    res.status(500).send('Server error');
  }
};

// Get all notifications for admin management
exports.getAllNotifications = async (req, res) => {
  try {
    // Modify the query to handle 'all' recipients
    const notifications = await Notification.find({
      $or: [
        { recipient: { $ne: null } },
        { recipientId: 'all' },
        { recipientId: 'admins' }
      ]
    })
      .populate('sender', 'username')
      .populate('recipient', 'username')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err.message);
    res.status(500).send('Server error');
  }
};

// Delete a user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    // Check if the user making the request is an admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: 'Not authorized to delete users' });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Don't allow deleting admin users
    if (user.isAdmin) {
      return res.status(400).json({ msg: 'Cannot delete admin users' });
    }
    
    // Delete user's posts and associated data
    try {
      // Find all posts by this user
      const userPosts = await Post.find({ author: req.params.id });
      
      // For each post, delete associated comments
      for (const post of userPosts) {
        await Comment.deleteMany({ post: post._id });
      }
      
      // Delete the posts
      await Post.deleteMany({ author: req.params.id });
      
      // Delete user's comments on other posts
      await Comment.deleteMany({ user: req.params.id });
      
      // Delete notifications related to the user
      await Notification.deleteMany({ 
        $or: [
          { recipient: req.params.id },
          { sender: req.params.id }
        ]
      });
      
      // Finally delete the user
      await User.findByIdAndDelete(req.params.id);
      
      res.json({ msg: 'User and all associated content removed successfully' });
    } catch (deleteErr) {
      console.error('Error during cascade delete:', deleteErr);
      return res.status(500).json({ msg: 'Error removing associated content' });
    }
  } catch (err) {
    console.error('Error deleting user:', err.message);
    res.status(500).json({ msg: 'Server error during user deletion' });
  }
};

// Delete a post (admin only)
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    await post.deleteOne();
    
    // Also delete all comments associated with this post
    await Comment.deleteMany({ post: req.params.id });
    
    res.json({ msg: 'Post and associated comments removed' });
  } catch (err) {
    console.error('Error deleting post:', err.message);
    res.status(500).send('Server error');
  }
};

// Delete a comment (admin only)
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    
    await comment.deleteOne();
    res.json({ msg: 'Comment removed' });
  } catch (err) {
    console.error('Error deleting comment:', err.message);
    res.status(500).send('Server error');
  }
};

// Create a notification (admin only)
exports.createNotification = async (req, res) => {
  try {
    console.log('Create notification request body:', req.body);
    console.log('User making request:', req.user);
    
    const { type, message, recipientId } = req.body;
    
    if (!type || !message) {
      return res.status(400).json({ msg: 'Type and message are required' });
    }
    
    // Create notification object based on recipient type
    let notificationData = {
      type,
      message,
      sender: req.user.id,
      read: false
    };
    
    // Handle different recipient types
    if (recipientId === 'all' || recipientId === 'admins') {
      notificationData.recipientId = recipientId;
    } else if (recipientId) {
      // For specific user
      notificationData.recipient = recipientId;
    } else {
      return res.status(400).json({ msg: 'Valid recipientId is required' });
    }
    
    console.log('Creating notification with data:', notificationData);
    
    // Create and save the notification
    const notification = new Notification(notificationData);
    
    try {
      const savedNotification = await notification.save();
      console.log('Notification saved successfully:', savedNotification);
      
      // Populate sender info for the response
      const populatedNotification = await Notification.findById(notification._id)
        .populate('sender', 'username')
        .populate('recipient', 'username');
      
      console.log('Populated notification:', populatedNotification);
      
      res.json(populatedNotification);
    } catch (saveErr) {
      console.error('Error saving notification:', saveErr);
      return res.status(500).json({ 
        msg: 'Error saving notification', 
        error: saveErr.message,
        validationErrors: saveErr.errors
      });
    }
  } catch (err) {
    console.error('Error creating notification:', err.message);
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
};

// Delete a notification (admin only)
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }
    
    await notification.deleteOne();
    res.json({ msg: 'Notification removed' });
  } catch (err) {
    console.error('Error deleting notification:', err.message);
    res.status(500).send('Server error');
  }
};

// Mark a notification as read (admin only)
exports.markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }
    
    notification.read = true;
    await notification.save();
    
    res.json({ msg: 'Notification marked as read', notification });
  } catch (err) {
    console.error('Error marking notification as read:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Mark all notifications as read (admin only)
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const { recipientType } = req.body;
    
    let updateQuery = {};
    
    // Handle different recipient types
    if (recipientType === 'all') {
      // Update all notifications
      updateQuery = { read: false };
    } else if (recipientType === 'admins') {
      // Update only admin notifications
      updateQuery = { recipientId: 'admins', read: false };
    } else if (recipientType === 'specific' && req.body.userId) {
      // Update notifications for a specific user
      updateQuery = { recipient: req.body.userId, read: false };
    } else {
      return res.status(400).json({ msg: 'Invalid recipient type' });
    }
    
    const result = await Notification.updateMany(updateQuery, { read: true });
    
    res.json({ 
      msg: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error('Error marking all notifications as read:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get notification statistics (admin only)
exports.getNotificationStats = async (req, res) => {
  try {
    const stats = {
      total: await Notification.countDocuments(),
      unread: await Notification.countDocuments({ read: false }),
      byType: {
        announcement: await Notification.countDocuments({ type: 'announcement' }),
        alert: await Notification.countDocuments({ type: 'alert' }),
        update: await Notification.countDocuments({ type: 'update' }),
        message: await Notification.countDocuments({ type: 'message' }),
        like: await Notification.countDocuments({ type: 'like' }),
        comment: await Notification.countDocuments({ type: 'comment' }),
        follow: await Notification.countDocuments({ type: 'follow' })
      },
      byRecipient: {
        all: await Notification.countDocuments({ recipientId: 'all' }),
        admins: await Notification.countDocuments({ recipientId: 'admins' }),
        specific: await Notification.countDocuments({ recipient: { $exists: true } })
      }
    };
    
    res.json(stats);
  } catch (err) {
    console.error('Error getting notification stats:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
