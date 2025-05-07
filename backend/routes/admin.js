const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// @route   GET /api/admin/test
// @desc    Test route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Admin API Working' }));

// @route   GET /api/admin/stats
// @desc    Get basic stats (no auth required)
// @access  Public
router.get('/stats', adminController.getStats);

// @route   GET /api/admin/dashboard
// @desc    Get dashboard stats and recent activity
// @access  Private/Admin
router.get('/dashboard', auth, adminAuth, adminController.getDashboardStats);

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', auth, adminAuth, adminController.getAllUsers);

// @route   GET /api/admin/posts
// @desc    Get all posts
// @access  Private/Admin
router.get('/posts', auth, adminAuth, adminController.getAllPosts);

// @route   GET /api/admin/comments
// @desc    Get all comments
// @access  Private/Admin
router.get('/comments', auth, adminAuth, adminController.getAllComments);

// @route   GET /api/admin/notifications
// @desc    Get all notifications
// @access  Private/Admin
router.get('/notifications', auth, adminAuth, adminController.getAllNotifications);

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete('/users/:id', auth, adminAuth, adminController.deleteUser);

// @route   DELETE /api/admin/posts/:id
// @desc    Delete a post
// @access  Private/Admin
router.delete('/posts/:id', auth, adminAuth, adminController.deletePost);

// @route   DELETE /api/admin/comments/:id
// @desc    Delete a comment
// @access  Private/Admin
router.delete('/comments/:id', auth, adminAuth, adminController.deleteComment);

// @route   DELETE /api/admin/notifications/:id
// @desc    Delete a notification
// @access  Private/Admin
router.delete('/notifications/:id', auth, adminAuth, adminController.deleteNotification);

// @route   POST /api/admin/notifications
// @desc    Create a notification
// @access  Private/Admin
router.post('/notifications', auth, adminAuth, adminController.createNotification);

// @route   PUT /api/admin/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private/Admin
router.put('/notifications/:id/read', auth, adminAuth, adminController.markNotificationAsRead);

// @route   PUT /api/admin/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private/Admin
router.put('/notifications/read-all', auth, adminAuth, adminController.markAllNotificationsAsRead);

// @route   GET /api/admin/notifications/stats
// @desc    Get notification statistics
// @access  Private/Admin
router.get('/notifications/stats', auth, adminAuth, adminController.getNotificationStats);

module.exports = router;
