const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// @route   POST api/notifications
// @desc    Create a new notification
// @access  Private
router.post('/', auth, notificationController.createNotification);

// @route   GET api/notifications/user/:userId
// @desc    Get all notifications for a user
// @access  Private
router.get('/user/:userId', auth, notificationController.getUserNotifications);

// @route   PUT api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.put('/:id/read', auth, notificationController.markAsRead);

// @route   PUT api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', auth, notificationController.markAllAsRead);

// @route   DELETE api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', auth, notificationController.deleteNotification);

// @route   GET api/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
router.get('/unread-count', auth, notificationController.getUnreadCount);

// @route   GET api/notifications/test
// @desc    Test route
// @access  Public
router.get('/test', (req, res) => {
  res.json({ msg: 'Notifications API is working' });
});

module.exports = router;
