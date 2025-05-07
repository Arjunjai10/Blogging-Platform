const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
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

// @route   GET api/posts
// @desc    Get all posts
// @access  Public
router.get('/', postController.getAllPosts);

// @route   GET api/posts/search
// @desc    Search posts
// @access  Public
router.get('/search', postController.searchPosts);

// @route   GET api/posts/categories
// @desc    Get all categories
// @access  Public
router.get('/categories', postController.getCategories);

// @route   GET api/posts/category/:category
// @desc    Get posts by category
// @access  Public
router.get('/category/:category', postController.getPostsByCategory);

// @route   GET api/posts/user/:userId
// @desc    Get posts by user ID
// @access  Public
router.get('/user/:userId', postController.getPostsByUser);

// @route   GET api/posts/:id
// @desc    Get post by ID
// @access  Public
router.get('/:id', postController.getPostById);

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post('/', auth, upload.single('image'), postController.createPost);

// @route   PUT api/posts/:id
// @desc    Update a post
// @access  Private
router.put('/:id', auth, upload.single('image'), postController.updatePost);

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, postController.deletePost);

// @route   PUT api/posts/like/:id
// @desc    Like or unlike a post
// @access  Private
router.put('/like/:id', auth, postController.likePost);

// @route   POST api/posts/comment/:id
// @desc    Comment on a post
// @access  Private
router.post('/comment/:id', auth, postController.addComment);

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Delete a comment
// @access  Private
router.delete('/comment/:id/:comment_id', auth, postController.deleteComment);

module.exports = router;
