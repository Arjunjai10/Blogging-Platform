import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ENDPOINTS, getAuthHeader } from '../config/api';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  TablePagination
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
  NotificationsActive as NotificationsActiveIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

const AdminNotifications = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [newNotification, setNewNotification] = useState({
    type: 'announcement',
    message: '',
    recipientId: 'all'
  });
  const [users, setUsers] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // State for filtering and pagination
  const [filters, setFilters] = useState({
    type: 'all',
    recipient: 'all'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch notifications from the backend
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await axios.get(ENDPOINTS.ADMIN.NOTIFICATIONS, {
        headers: getAuthHeader(token)
      });
      
      // Process notifications to handle different recipient types
      const processedNotifications = response.data.map(notification => {
        // Add a displayRecipient property for UI display
        let displayRecipient = 'Unknown';
        
        if (notification.recipientId === 'all') {
          displayRecipient = 'All Users';
        } else if (notification.recipientId === 'admins') {
          displayRecipient = 'Admins Only';
        } else if (notification.recipient && notification.recipient.username) {
          displayRecipient = notification.recipient.username;
        }
        
        return {
          ...notification,
          displayRecipient
        };
      });
      
      setNotifications(processedNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(`Failed to load notifications: ${err.response?.data?.msg || 'Server error'}`);
      setSnackbar({
        open: true,
        message: `Error: ${err.response?.data?.msg || 'Failed to load notifications'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      await axios.delete(`${ENDPOINTS.ADMIN.NOTIFICATIONS}/${notificationId}`, {
        headers: getAuthHeader(token)
      });
      
      // Remove the deleted notification from the state
      setNotifications(notifications.filter(notification => notification._id !== notificationId));
      
      setSnackbar({
        open: true,
        message: 'Notification deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting notification:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.response?.data?.msg || 'Failed to delete notification'}`,
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setNotificationToDelete(null);
    }
  };

  // Handle opening the create notification dialog
  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true);
  };

  // Handle closing the create notification dialog
  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  // Handle form submission from dialog
  const handleSubmitNotification = async () => {
    if (!newNotification.message.trim()) {
      setSnackbar({
        open: true,
        message: 'Notification message cannot be empty',
        severity: 'error'
      });
      return;
    }
    
    try {
      // Set loading state
      setLoading(true);
      
      // Create a copy of the notification data to send
      const notificationToSend = { ...newNotification };
      
      console.log('Sending notification data:', notificationToSend);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await axios.post(
        ENDPOINTS.ADMIN.NOTIFICATIONS, 
        notificationToSend,
        {
          headers: getAuthHeader(token)
        }
      );
      
      console.log('Notification created successfully:', response.data);
      
      // Process the new notification for display
      const processedNotification = {
        ...response.data,
        displayRecipient: response.data.recipientId === 'all' 
          ? 'All Users' 
          : response.data.recipientId === 'admins' 
            ? 'Admins Only' 
            : response.data.recipient?.username || 'Unknown'
      };
      
      // Add the new notification to the state
      setNotifications([processedNotification, ...notifications]);
      
      // Reset the form
      setNewNotification({
        type: 'announcement',
        message: '',
        recipientId: 'all'
      });
      
      setSnackbar({
        open: true,
        message: 'Notification created successfully',
        severity: 'success'
      });
      
      // Close the dialog
      setCreateDialogOpen(false);
    } catch (err) {
      console.error('Error creating notification:', err);
      console.error('Error details:', err.response?.data);
      
      let errorMessage = 'Failed to create notification';
      
      if (err.response?.data?.validationErrors) {
        // Format validation errors
        const validationErrors = Object.values(err.response.data.validationErrors)
          .map(error => error.message || error)
          .join(', ');
        errorMessage = `Validation error: ${validationErrors}`;
      } else if (err.response?.data?.error) {
        errorMessage = `Error: ${err.response.data.error}`;
      } else if (err.response?.data?.msg) {
        errorMessage = `Error: ${err.response.data.msg}`;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (notification) => {
    setNotificationToDelete(notification);
    setDeleteDialogOpen(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for recipientId to ensure proper format
    if (name === 'recipientId') {
      console.log('Setting recipientId to:', value);
    }
    
    setNewNotification({
      ...newNotification,
      [name]: value
    });
  };

  // Fetch users for recipient dropdown
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load users for recipient selection',
        severity: 'warning'
      });
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
    setPage(0); // Reset to first page when filter changes
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter notifications based on current filters
  const filteredNotifications = notifications.filter(notification => {
    // Filter by type
    if (filters.type !== 'all' && notification.type !== filters.type) {
      return false;
    }
    
    // Filter by recipient
    if (filters.recipient === 'all') {
      return true;
    } else if (filters.recipient === 'specific' && notification.recipient) {
      return true;
    } else if (filters.recipient === 'global' && 
              (notification.recipientId === 'all' || notification.recipientId === 'admins')) {
      return true;
    }
    
    return false;
  });

  // Get notifications for current page
  const paginatedNotifications = filteredNotifications.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  useEffect(() => {
    // Check if user is authenticated and is admin
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }
    
    fetchNotifications();
    fetchUsers(); // Fetch users for recipient selection
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || !user || !user.isAdmin) {
    return null; // Don't render anything while redirecting
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/admin/dashboard')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Notification Management
        </Typography>
        <Box flexGrow={1} />
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<RefreshIcon />}
          onClick={fetchNotifications}
          disabled={loading}
        >
          Refresh
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<SendIcon />}
          onClick={handleOpenCreateDialog}
          sx={{ ml: 2 }}
        >
          Create Notification
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Create New Notification Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
      >
        <DialogTitle>Create New Notification</DialogTitle>
        <DialogContent>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSubmitNotification();
          }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="notification-type-label">Notification Type</InputLabel>
                  <Select
                    labelId="notification-type-label"
                    id="type"
                    name="type"
                    value={newNotification.type}
                    onChange={handleInputChange}
                    label="Notification Type"
                    required
                  >
                    <MenuItem value="announcement">Announcement</MenuItem>
                    <MenuItem value="alert">Alert</MenuItem>
                    <MenuItem value="update">System Update</MenuItem>
                    <MenuItem value="message">Direct Message</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="recipient-label">Recipient</InputLabel>
                  <Select
                    labelId="recipient-label"
                    id="recipientId"
                    name="recipientId"
                    value={newNotification.recipientId}
                    onChange={handleInputChange}
                    label="Recipient"
                    required
                  >
                    <MenuItem value="all">All Users</MenuItem>
                    <MenuItem value="admins">Admins Only</MenuItem>
                    {users.map(user => (
                      <MenuItem key={user._id} value={user._id}>{user.username}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="message"
                  name="message"
                  label="Notification Message"
                  value={newNotification.message}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SendIcon />}
                  sx={{ mt: 2 }}
                >
                  Send Notification
                </Button>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <FormControl sx={{ mr: 2 }}>
              <InputLabel id="filter-type-label">Filter by Type</InputLabel>
              <Select
                labelId="filter-type-label"
                id="type"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                label="Filter by Type"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="announcement">Announcement</MenuItem>
                <MenuItem value="alert">Alert</MenuItem>
                <MenuItem value="update">System Update</MenuItem>
                <MenuItem value="message">Direct Message</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ mr: 2 }}>
              <InputLabel id="filter-recipient-label">Filter by Recipient</InputLabel>
              <Select
                labelId="filter-recipient-label"
                id="recipient"
                name="recipient"
                value={filters.recipient}
                onChange={handleFilterChange}
                label="Filter by Recipient"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="specific">Specific User</MenuItem>
                <MenuItem value="global">Global (All Users or Admins)</MenuItem>
              </Select>
            </FormControl>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filteredNotifications.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Message</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Recipient</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedNotifications.map((notification) => (
                  <TableRow key={notification._id}>
                    <TableCell>{notification.message}</TableCell>
                    <TableCell>
                      <Chip 
                        label={notification.type.charAt(0).toUpperCase() + notification.type.slice(1)} 
                        color={
                          notification.type === 'alert' ? 'error' :
                          notification.type === 'announcement' ? 'primary' :
                          notification.type === 'update' ? 'info' : 'default'
                        } 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      {notification.displayRecipient}
                    </TableCell>
                    <TableCell>{formatDate(notification.createdAt)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={notification.read ? 'Read' : 'Unread'} 
                        color={notification.read ? 'default' : 'success'} 
                        size="small" 
                        icon={notification.read ? null : <NotificationsActiveIcon />}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteClick(notification)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this notification? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => deleteNotification(notificationToDelete?._id)} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminNotifications;
