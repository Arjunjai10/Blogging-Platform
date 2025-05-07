const User = require('../models/User');
const Post = require('../models/Post');
const bcrypt = require('bcryptjs');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { username, email, bio } = req.body;
    
    // Check if user is updating their own profile
    if (req.params.id !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to update this profile' });
    }
    
    // Build profile object
    const profileFields = {};
    if (username) profileFields.username = username;
    if (email) profileFields.email = email;
    if (bio) profileFields.bio = bio;
    if (req.file) profileFields.profilePicture = `/uploads/${req.file.filename}`;
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: profileFields },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Check if user is updating their own password
    if (req.params.id !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to update this password' });
    }
    
    // Get user
    const user = await User.findById(req.params.id);
    
    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get user's bookmarks
exports.getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('bookmarks')
      .populate({
        path: 'bookmarks.post',
        select: '_id title content image createdAt',
        populate: {
          path: 'author',
          select: 'username profilePicture'
        }
      });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user.bookmarks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Add a bookmark
exports.addBookmark = async (req, res) => {
  try {
    const { postId } = req.body;
    
    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    // Get user
    const user = await User.findById(req.user.id);
    
    // Check if post is already bookmarked
    if (user.bookmarks.some(bookmark => bookmark.post.toString() === postId)) {
      return res.status(400).json({ msg: 'Post already bookmarked' });
    }
    
    // Add bookmark
    user.bookmarks.unshift({ post: postId });
    await user.save();
    
    res.json(user.bookmarks);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server error');
  }
};

// Remove a bookmark
exports.removeBookmark = async (req, res) => {
  try {
    const postId = req.params.postId;
    
    // Get user
    const user = await User.findById(req.user.id);
    
    // Check if post is bookmarked
    const bookmarkIndex = user.bookmarks.findIndex(
      bookmark => bookmark.post.toString() === postId
    );
    
    if (bookmarkIndex === -1) {
      return res.status(400).json({ msg: 'Post not bookmarked' });
    }
    
    // Remove bookmark
    user.bookmarks.splice(bookmarkIndex, 1);
    await user.save();
    
    res.json(user.bookmarks);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server error');
  }
};
