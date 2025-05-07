const User = require('../models/User');

// Middleware to verify admin privileges
module.exports = async (req, res, next) => {
  try {
    // Check if the user exists and is an admin
    const user = await User.findById(req.user.id);
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ msg: 'Access denied: Admin privileges required' });
    }
    
    next();
  } catch (err) {
    console.error('Admin auth middleware error:', err.message);
    res.status(500).send('Server error');
  }
};
