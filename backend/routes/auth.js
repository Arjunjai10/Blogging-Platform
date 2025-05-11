const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const passport = require('passport');

// Import passport configuration
require('../config/passport');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use absolute path for uploads directory
    cb(null, path.join(__dirname, '../uploads/profiles/'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', upload.single('profilePicture'), authController.register);

// @route   POST api/auth/login
// @desc    Login user & get token
// @access  Public
router.post('/login', authController.login);

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, authController.getCurrentUser);

// @route   POST api/auth/admin/login
// @desc    Admin login
// @access  Public
router.post('/admin/login', authController.adminLogin);

// @route   POST api/auth/admin/create
// @desc    Create admin user
// @access  Public (but protected by secret key)
router.post('/admin/create', authController.createAdmin);

// @route   GET api/auth/google
// @desc    Google OAuth login
// @access  Public
router.get('/google', authController.googleAuth);

// @route   GET api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback', authController.googleCallback);

module.exports = router;
