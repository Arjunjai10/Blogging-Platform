const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images only!');
    }
  }
});

// @route   GET api/users/bookmarks
// @desc    Get user's bookmarked posts
// @access  Private
router.get('/bookmarks', auth, userController.getBookmarks);

// @route   POST api/users/bookmarks
// @desc    Add a bookmark
// @access  Private
router.post('/bookmarks', auth, userController.addBookmark);

// @route   DELETE api/users/bookmarks/:postId
// @desc    Remove a bookmark
// @access  Private
router.delete('/bookmarks/:postId', auth, userController.removeBookmark);

// @route   GET api/users/:id
// @desc    Get user profile
// @access  Public
router.get('/:id', userController.getUserProfile);

// @route   PUT api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', auth, upload.single('profilePicture'), userController.updateProfile);

// @route   PUT api/users/password/:id
// @desc    Update user password
// @access  Private
router.put('/password/:id', auth, userController.updatePassword);

// @route   POST api/users/follow/:id
// @desc    Follow a user
// @access  Private
router.post('/follow/:id', auth, userController.followUser);

// @route   DELETE api/users/follow/:id
// @desc    Unfollow a user
// @access  Private
router.delete('/follow/:id', auth, userController.unfollowUser);

// @route   GET api/users/:id/followers
// @desc    Get user's followers
// @access  Public
router.get('/:id/followers', userController.getFollowers);

// @route   GET api/users/:id/following
// @desc    Get users that a user is following
// @access  Public
router.get('/:id/following', userController.getFollowing);

module.exports = router;
