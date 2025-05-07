const Notification = require('../models/Notification');
const User = require('../models/User');
const Post = require('../models/Post');

// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const { recipient, sender, post, comment, type } = req.body;
    
    // Don't create notification if sender is the same as recipient
    if (sender.toString() === recipient.toString()) {
      return res.status(200).json({ msg: 'Self notification skipped' });
    }
    
    const newNotification = new Notification({
      recipient,
      sender,
      post,
      comment,
      type
    });
    
    const notification = await newNotification.save();
    
    // Populate sender info before sending response
    const populatedNotification = await Notification.findById(notification._id)
      .populate('sender', 'username profilePicture')
      .populate('post', 'title')
      .populate('comment', 'text');
    
    res.json(populatedNotification);
  } catch (err) {
    console.error('Create notification error:', err.message);
    res.status(500).send('Server error');
  }
};

// Get all notifications for a user
exports.getUserNotifications = async (req, res) => {
  try {
    console.log('Fetching notifications for user:', req.params.userId);
    
    // Validate that userId is a valid ObjectId
    if (!req.params.userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ msg: 'Invalid user ID format' });
    }
    
    const notifications = await Notification.find({ recipient: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('sender', 'username profilePicture')
      .populate('post', 'title')
      .populate('comment', 'text');
    
    console.log('Found notifications:', notifications.length);
    res.json(notifications);
  } catch (err) {
    console.error('Get user notifications error:', err);
    res.status(500).send('Server error');
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }
    
    // Check if user is authorized to mark this notification as read
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    notification.read = true;
    await notification.save();
    
    res.json(notification);
  } catch (err) {
    console.error('Mark notification as read error:', err.message);
    res.status(500).send('Failed to mark notification as read');
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { $set: { read: true } }
    );
    
    res.json({ msg: 'All notifications marked as read' });
  } catch (err) {
    console.error('Mark all notifications as read error:', err.message);
    res.status(500).send('Failed to mark all notifications as read');
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }
    
    // Check if user is authorized to delete this notification
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    await Notification.deleteOne({ _id: req.params.id });
    
    res.json({ msg: 'Notification removed' });
  } catch (err) {
    console.error('Delete notification error:', err.message);
    res.status(500).send('Failed to delete notification');
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      recipient: req.user.id,
      read: false
    });
    
    res.json({ count });
  } catch (err) {
    console.error('Get unread count error:', err.message);
    res.status(500).send('Failed to retrieve unread notification count');
  }
};
