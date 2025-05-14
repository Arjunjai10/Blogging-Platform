import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  Chip
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

const AdminUsers = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Fetch users from the backend
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      // Process user data to add additional info for UI
      const processedUsers = response.data.map(user => ({
        ...user,
        active: user.active !== false, // Default to true if not specified
        lastLogin: user.lastLogin || 'Never',
        role: user.isAdmin ? 'Admin' : 'User'
      }));
      
      setUsers(processedUsers);
      setSnackbar({
        open: true,
        message: 'Users loaded successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(`Failed to load users: ${err.response?.data?.msg || 'Server error'}`);
      setSnackbar({
        open: true,
        message: `Error: ${err.response?.data?.msg || 'Failed to load users'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete a user
  const deleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbar({
          open: true,
          message: 'Authentication required. Please log in again.',
          severity: 'error'
        });
        return;
      }

      const response = await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });
      
      // Remove the deleted user from the state
      setUsers(users.filter(user => user._id !== userId));
      
      setSnackbar({
        open: true,
        message: response.data.msg || 'User deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting user:', err);
      
      // Handle specific error cases
      if (err.response?.status === 403) {
        setSnackbar({
          open: true,
          message: 'You do not have permission to delete users. Please ensure you are logged in as an admin.',
          severity: 'error'
        });
        // Redirect to login if unauthorized
        navigate('/admin/login');
      } else if (err.response?.status === 400 && err.response?.data?.msg === 'Cannot delete admin users') {
        setSnackbar({
          open: true,
          message: 'Admin users cannot be deleted',
          severity: 'error'
        });
      } else {
        setSnackbar({
          open: true,
          message: `Error: ${err.response?.data?.msg || 'Failed to delete user'}`,
          severity: 'error'
        });
      }
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    // Redirect if not authenticated or not an admin
    if (!isAuthenticated || !user) {
      navigate('/admin/login');
      return;
    }
    
    if (!user.isAdmin) {
      navigate('/');
      return;
    }

    fetchUsers();
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
          User Management
        </Typography>
        <Box flexGrow={1} />
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<RefreshIcon />}
          onClick={fetchUsers}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.role}
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell>
                    {user.active ? (
                      <Chip 
                        icon={<CheckCircleIcon />} 
                        label="Active" 
                        color="success" 
                        size="small" 
                      />
                    ) : (
                      <Chip 
                        icon={<CancelIcon />} 
                        label="Inactive" 
                        color="error" 
                        size="small" 
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      onClick={() => navigate(`/admin/users/edit/${user._id}`)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteClick(user)}
                      disabled={user.isAdmin} // Prevent deleting admin users
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the user "{userToDelete?.username}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => deleteUser(userToDelete?._id)}
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

export default AdminUsers;
