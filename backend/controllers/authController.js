const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, bio } = req.body;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ 
        msg: user.email === email ? 'Email already in use' : 'Username already taken' 
      });
    }

    // Create new user
    user = new User({
      username,
      email,
      password,
      bio: bio || ''
    });

    // Handle profile picture if uploaded
    if (req.file) {
      // Store the relative path for frontend access
      user.profilePicture = `/uploads/profiles/${req.file.filename}`;
    }

    await user.save();

    // Create JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        
        // Return token and user data (excluding password)
        const userData = user.toObject();
        delete userData.password;
        
        res.json({ token, user: userData });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create and return JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        
        // Return token and user data (excluding password)
        const userData = user.toObject();
        delete userData.password;
        
        res.json({ token, user: userData });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Admin login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists and is admin
    const user = await User.findOne({ email });
    if (!user || !user.isAdmin) {
      return res.status(401).json({ msg: 'Unauthorized: Admin access only' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    // Create and return JWT
    const payload = {
      user: {
        id: user.id,
        isAdmin: true
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        
        // Return token and user data (excluding password)
        const userData = user.toObject();
        delete userData.password;
        
        res.json({ token, user: userData });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Create admin user
exports.createAdmin = async (req, res) => {
  try {
    const { username, email, password, adminSecret } = req.body;
    
    // Verify admin secret key
    if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
      return res.status(401).json({ msg: 'Unauthorized: Invalid admin secret key' });
    }

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ 
        msg: user.email === email ? 'Email already in use' : 'Username already taken' 
      });
    }

    // Create new admin user
    user = new User({
      username,
      email,
      password,
      isAdmin: true
    });

    await user.save();

    res.status(201).json({ msg: 'Admin user created successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Google OAuth login
exports.googleAuth = (req, res, next) => {
  // Check if Google credentials are configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(501).json({ msg: 'Google authentication is not configured on the server' });
  }
  
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

// Google OAuth callback
exports.googleCallback = (req, res, next) => {
  // Check if Google credentials are configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(501).json({ msg: 'Google authentication is not configured on the server' });
  }
  
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent('Google authentication failed')}`);
    }
    
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent('No user found')}`);
    }

    // Create JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) {
          console.error('JWT Sign error:', err);
          return res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent('Authentication error')}`);
        }
        
        // Redirect to frontend with token and user data
        const userData = user.toObject();
        delete userData.password;
        
        // Use query params for simplicity, but in production consider more secure methods
        return res.redirect(
          `${process.env.FRONTEND_URL}/auth/google/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`
        );
      }
    );
  })(req, res, next);
};
