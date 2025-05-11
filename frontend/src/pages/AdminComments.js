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
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

const AdminComments = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Fetch comments from the backend
  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/comments', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      // Process comment data to add additional info for UI
      const processedComments = response.data.map(comment => ({
        ...comment,
        reported: comment.reported || false,
        status: comment.reported ? 'Reported' : 'Active',
        authorName: comment.user?.username || 'Anonymous',
        postTitle: comment.post?.title || 'Unknown Post'
      }));
      
      setComments(processedComments);
      setSnackbar({
        open: true,
        message: 'Comments loaded successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError(`Failed to load comments: ${err.response?.data?.msg || 'Server error'}`);
      setSnackbar({
        open: true,
        message: `Error: ${err.response?.data?.msg || 'Failed to load comments'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete a comment
  const deleteComment = async (commentId) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/comments/${commentId}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      // Remove the deleted comment from the state
      setComments(comments.filter(comment => comment._id !== commentId));
      
      setSnackbar({
        open: true,
        message: 'Comment deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting comment:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.response?.data?.msg || 'Failed to delete comment'}`,
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    }
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (comment) => {
    setCommentToDelete(comment);
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

  // Truncate text for display
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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

    fetchComments();
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
          Comment Management
        </Typography>
        <Box flexGrow={1} />
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<RefreshIcon />}
          onClick={fetchComments}
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
                <TableCell>Comment</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Post</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comments.map((comment) => (
                <TableRow 
                  key={comment._id}
                  sx={comment.reported ? { backgroundColor: 'rgba(255, 0, 0, 0.05)' } : {}}
                >
                  <TableCell>{truncateText(comment.text)}</TableCell>
                  <TableCell>{comment.authorName}</TableCell>
                  <TableCell>{truncateText(comment.postTitle)}</TableCell>
                  <TableCell>{formatDate(comment.date)}</TableCell>
                  <TableCell>
                    {comment.reported ? (
                      <Chip 
                        icon={<FlagIcon />} 
                        label="Reported" 
                        color="error" 
                        size="small" 
                      />
                    ) : (
                      <Chip 
                        label="Active" 
                        color="success" 
                        size="small" 
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      color="info" 
                      onClick={() => navigate(`/post/${comment.post?._id}`)}
                      disabled={!comment.post?._id}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteClick(comment)}
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
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this comment? 
            This action cannot be undone.
          </DialogContentText>
          <Box mt={2} p={2} bgcolor="rgba(0, 0, 0, 0.05)" borderRadius={1}>
            <Typography variant="body2">
              "{truncateText(commentToDelete?.text, 150)}"
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => deleteComment(commentToDelete?._id)} 
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

export default AdminComments;
