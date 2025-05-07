const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return !this.recipientId; // Only required if recipientId is not set
    }
  },
  recipientId: {
    type: String,
    enum: ['all', 'admins'],
    required: function() {
      return !this.recipient; // Only required if recipient is not set
    }
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  },
  comment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  },
  type: {
    type: String,
    enum: ['like', 'comment', 'follow', 'announcement', 'alert', 'update', 'message'],
    required: true
  },
  message: {
    type: String,
    required: function() {
      return ['announcement', 'alert', 'update', 'message'].includes(this.type);
    }
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
