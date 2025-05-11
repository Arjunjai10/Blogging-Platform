const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  section: {
    type: String,
    required: true,
    enum: ['general', 'content', 'email', 'advanced'],
    default: 'general'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
SettingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Setting', SettingSchema);
