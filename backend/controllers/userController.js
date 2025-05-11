const User = require('../models/User');
const Post = require('../models/Post');
const bcrypt = require('bcryptjs');
const upload = require('../config/multer');

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
// Update user profile with profile picture
exports.updateProfile = async (req, res) => {
  try {
    console.log('Update profile request received:', { 
      userId: req.params.id,
      authUserId: req.user?.id,
      hasFile: !!req.file,
      bodyFields: Object.keys(req.body)
    });
    
    // File is already handled by multer middleware in the route
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
    
    // Handle profile picture if provided
    if (req.file) {
      try {
        // Use a full URL path that will be accessible from the frontend
        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
        profileFields.profilePicture = `${baseUrl}/uploads/${req.file.filename}`;
        console.log('Profile picture path set to:', profileFields.profilePicture);
      } catch (fileErr) {
        console.error('Error processing profile picture:', fileErr);
        // Continue without updating profile picture
      }
    }
    
    console.log('Updating user with fields:', profileFields);
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: profileFields },
      { new: true }
    ).select('-password');
    
    if (!user) {
      console.error('User not found with ID:', req.params.id);
      return res.status(404).json({ msg: 'User not found' });
    }
    
    console.log('User updated successfully');
    res.json(user);
  } catch (err) {
    console.error('Error in updateProfile:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: 'Invalid input data', details: err.message });
    }
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Username or email already exists' });
    }
    if (err.status) {
      return res.status(err.status).json({ msg: err.message });
    }
    res.status(500).json({ msg: 'Server error', details: err.message });
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
    console.error(err);
    if (err.status) {
      return res.status(err.status).json({ msg: err.message });
    }
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
    console.error(err);
    if (err.status) {
      return res.status(err.status).json({ msg: err.message });
    }
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

// Follow a user
exports.followUser = async (req, res) => {
  try {
    // Check if trying to follow self
    if (req.params.id === req.user.id) {
      return res.status(400).json({ msg: 'You cannot follow yourself' });
    }
    
    // Get target user to follow
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Get current user
    const currentUser = await User.findById(req.user.id);
    
    // Check if already following
    if (currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ msg: 'You are already following this user' });
    }
    
    // Add to following list of current user
    currentUser.following.push(req.params.id);
    await currentUser.save();
    
    // Add to followers list of target user
    userToFollow.followers.push(req.user.id);
    await userToFollow.save();
    
    res.json({ 
      msg: `You are now following ${userToFollow.username}`,
      following: currentUser.following,
      followers: userToFollow.followers
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    // Check if trying to unfollow self
    if (req.params.id === req.user.id) {
      return res.status(400).json({ msg: 'You cannot unfollow yourself' });
    }
    
    // Get target user to unfollow
    const userToUnfollow = await User.findById(req.params.id);
    if (!userToUnfollow) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Get current user
    const currentUser = await User.findById(req.user.id);
    
    // Check if actually following
    if (!currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ msg: 'You are not following this user' });
    }
    
    // Remove from following list of current user
    currentUser.following = currentUser.following.filter(
      followingId => followingId.toString() !== req.params.id
    );
    await currentUser.save();
    
    // Remove from followers list of target user
    userToUnfollow.followers = userToUnfollow.followers.filter(
      followerId => followerId.toString() !== req.user.id
    );
    await userToUnfollow.save();
    
    res.json({ 
      msg: `You have unfollowed ${userToUnfollow.username}`,
      following: currentUser.following,
      followers: userToUnfollow.followers
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
};

// Get followers
exports.getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('followers')
      .populate('followers', 'username profilePicture bio');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user.followers);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
};

// Get following
exports.getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('following')
      .populate('following', 'username profilePicture bio');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user.following);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
};
