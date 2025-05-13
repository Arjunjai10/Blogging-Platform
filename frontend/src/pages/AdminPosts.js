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
  Add as AddIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

const AdminPosts = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Fetch posts from the backend
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_BASE_URL}/api/admin/posts`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      // Process post data to add additional info for UI
      const processedPosts = response.data.map(post => ({
        ...post,
        published: post.published !== false, // Default to true if not specified
        categories: post.categories || [],
        likesCount: post.likes?.length || 0,
        commentsCount: post.comments?.length || 0,
        displayStatus: post.published !== false ? 'Published' : 'Draft'
      }));
      
      setPosts(processedPosts);
      setSnackbar({
        open: true,
        message: 'Posts loaded successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(`Failed to load posts: ${err.response?.data?.msg || 'Server error'}`);
      setSnackbar({
        open: true,
        message: `Error: ${err.response?.data?.msg || 'Failed to load posts'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete a post
  const deletePost = async (postId) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/posts/${postId}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      // Remove the deleted post from the state
      setPosts(posts.filter(post => post._id !== postId));
      
      setSnackbar({
        open: true,
        message: 'Post deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting post:', err);
      setSnackbar({
        open: true,
        message: `Error: ${err.response?.data?.msg || 'Failed to delete post'}`,
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (post) => {
    setPostToDelete(post);
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
  const truncateText = (text, maxLength = 50) => {
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

    fetchPosts();
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
          Post Management
        </Typography>
        <Box flexGrow={1} />
        <Button 
          variant="contained" 
          color="success" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/create-post')}
          sx={{ mr: 2 }}
        >
          Create Post
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<RefreshIcon />}
          onClick={fetchPosts}
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
                <TableCell>Title</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Categories</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post._id}>
                  <TableCell>{truncateText(post.title)}</TableCell>
                  <TableCell>{post.author?.username || 'Unknown'}</TableCell>
                  <TableCell>
                    {post.categories?.map((category, index) => (
                      <Chip 
                        key={index} 
                        label={category} 
                        size="small" 
                        sx={{ mr: 0.5, mb: 0.5 }} 
                      />
                    ))}
                  </TableCell>
                  <TableCell>{formatDate(post.createdAt)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={post.displayStatus} 
                      color={post.published ? 'success' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      color="info" 
                      onClick={() => navigate(`/post/${post._id}`)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton 
                      color="primary" 
                      onClick={() => navigate(`/edit-post/${post._id}`)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteClick(post)}
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
            Are you sure you want to delete the post "{postToDelete?.title}"? 
            This action cannot be undone and will also delete all comments associated with this post.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => deletePost(postToDelete?._id)} 
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

export default AdminPosts;
