const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      // Password is required only if googleId is not present
      return !this.googleId;
    },
    minlength: 6
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  bookmarks: [
    {
      post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  isAdmin: {
    type: Boolean,
    default: false
  },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Skip password hashing if using Google auth or password not modified
  if (this.googleId || !this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  // If user is authenticated via Google, password comparison is not applicable
  if (this.googleId && !this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
