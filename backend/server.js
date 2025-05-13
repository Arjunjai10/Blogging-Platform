const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const passport = require('passport');
const session = require('express-session');

// Import models to ensure they are registered
require('./models/User');
require('./models/Post');
require('./models/Comment');
require('./models/Notification');
require('./models/Setting');

// Import routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const settingsRoutes = require('./routes/settings');

// Config
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Session middleware (required for Passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize Passport
app.use(passport.initialize());

// CORS configuration for production and development
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://blog-platform-arjunjai10.vercel.app',
      'https://blog-platform-git-main-arjunjai10.vercel.app',
      'http://localhost:3000',
      'http://192.168.45.44:3000'
    ];
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true
};

app.use(cors(corsOptions));

// Debug middleware for request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Handle errors from multer
app.use((err, req, res, next) => {
  if (err.name === 'MulterError') {
    return res.status(400).json({ msg: `Upload error: ${err.message}` });
  }
  next(err);
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Blog API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
