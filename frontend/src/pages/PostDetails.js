import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Avatar, 
  Chip, 
  IconButton, 
  Button, 
  TextField, 
  Divider,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Menu,
  MenuItem,
  Grid
} from '@mui/material';
import { 
  Bookmark, 
  BookmarkBorder, 
  Share, 
  ThumbUp, 
  ThumbUpOutlined, 
  Comment as CommentIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { PostContext } from '../context/PostContext';
import Comment from '../components/comments/Comment';

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  const { 
    addBookmark, 
    removeBookmark, 
    isBookmarked, 
    sharePost,
    deletePost,
    likePost,
    addComment,
    deleteComment
  } = useContext(PostContext);
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const menuOpen = Boolean(menuAnchorEl);
  
  // Get API base URL from environment or default to localhost
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  useEffect(() => {
    // Fetch post data
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/posts/${id}`);
        setPost(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.msg || 'Error fetching post');
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, API_BASE_URL]);
  
  // Handle post menu
  const handleMenuClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Handle bookmark toggle
  const handleBookmarkToggle = async () => {
    if (!isAuthenticated) {
      alert('Please log in to bookmark posts');
      return;
    }
    
    if (isBookmarked(post._id)) {
      await removeBookmark(post._id);
    } else {
      await addBookmark(post._id);
    }
  };
  
  // Handle share
  const handleShare = async () => {
    if (post) {
      const result = await sharePost(post);
      if (result === 'copied') {
        alert('Link copied to clipboard!');
      }
    }
  };
  
  // Handle like
  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('Please log in to like posts');
      return;
    }
    
    const updatedLikes = await likePost(post._id);
    if (updatedLikes) {
      setPost({ ...post, likes: updatedLikes });
    }
  };
  
  // Handle edit
  const handleEdit = () => {
    navigate(`/edit-post/${post._id}`);
    handleMenuClose();
  };
  
  // Handle delete dialog
  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };
  
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };
  
  // Handle delete post
  const handleDeletePost = async () => {
    const success = await deletePost(post._id);
    if (success) {
      navigate('/');
    } else {
      setError('Failed to delete post');
    }
    handleDeleteDialogClose();
  };
  
  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    const newComments = await addComment(post._id, commentText);
    if (newComments) {
      setPost({ ...post, comments: newComments });
      setCommentText('');
    }
  };
  
  // Handle comment deletion
  const handleCommentDelete = async (commentId) => {
    if (!commentId) return;
    
    const newComments = await deleteComment(post._id, commentId);
    if (newComments) {
      setPost({ ...post, comments: newComments });
    }
  };
  
  // Check if user has liked the post
  const hasLiked = () => {
    return post?.likes?.some(like => like.user === user?._id);
  };
  
  // Check if user is the author of the post
  const isAuthor = () => {
    return post?.author?._id === user?._id;
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="outlined" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </Container>
    );
  }
  
  if (!post) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>Post not found</Alert>
        <Button variant="outlined" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4 }}>
        {/* Post Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              src={post.author?.profilePicture ? `${API_BASE_URL}${post.author.profilePicture}` : null} 
              alt={post.author?.username || 'User'} 
              sx={{ mr: 2 }}
            />
            <Box>
              <Typography variant="subtitle1">
                {post.author?.username || 'Unknown User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {post.createdAt ? format(new Date(post.createdAt), 'MMM d, yyyy') : 'Unknown date'}
              </Typography>
            </Box>
          </Box>
          
          {isAuthor() && (
            <div>
              <IconButton
                aria-label="more"
                id="post-menu-button"
                aria-controls={menuOpen ? 'post-menu' : undefined}
                aria-expanded={menuOpen ? 'true' : undefined}
                aria-haspopup="true"
                onClick={handleMenuClick}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                id="post-menu"
                anchorEl={menuAnchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                MenuListProps={{
                  'aria-labelledby': 'post-menu-button',
                }}
              >
                <MenuItem onClick={handleEdit}>
                  <EditIcon fontSize="small" sx={{ mr: 1 }} />
                  Edit
                </MenuItem>
                <MenuItem onClick={handleDeleteDialogOpen}>
                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                  Delete
                </MenuItem>
              </Menu>
            </div>
          )}
        </Box>
        
        {/* Post Title */}
        <Typography variant="h4" component="h1" gutterBottom>
          {post.title}
        </Typography>
        
        {/* Categories */}
        <Box sx={{ mb: 3 }}>
          {post.categories && post.categories.map((category, index) => (
            <Chip
              key={index}
              label={category}
              variant="outlined"
              size="small"
              sx={{ mr: 1, mb: 1 }}
              onClick={() => navigate(`/category/${category}`)}
            />
          ))}
        </Box>
        
        {/* Post Image */}
        {post.image && (
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <img
              src={`${API_BASE_URL}${post.image}`}
              alt={post.title}
              style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: '8px' }}
            />
          </Box>
        )}
        
        {/* Post Content */}
        <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
          {post.content}
        </Typography>
        
        {/* Post Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <IconButton onClick={handleLike} color={hasLiked() ? 'primary' : 'default'}>
              {hasLiked() ? <ThumbUp /> : <ThumbUpOutlined />}
            </IconButton>
            <Typography variant="body2" component="span">
              {post.likes.length}
            </Typography>
            
            <IconButton sx={{ ml: 2 }}>
              <CommentIcon />
            </IconButton>
            <Typography variant="body2" component="span">
              {post.comments.length}
            </Typography>
          </Box>
          
          <Box>
            <IconButton onClick={handleShare} color="primary">
              <Share />
            </IconButton>
            
            <IconButton 
              onClick={handleBookmarkToggle} 
              color={isBookmarked(post._id) ? 'primary' : 'default'}
            >
              {isBookmarked(post._id) ? <Bookmark /> : <BookmarkBorder />}
            </IconButton>
          </Box>
        </Box>
      </Paper>
      
      {/* Comments Section */}
      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h6" gutterBottom>
          Comments ({post.comments.length})
        </Typography>
        
        {/* Comment Form */}
        {isAuthenticated ? (
          <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: 4 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button 
              type="submit" 
              variant="contained" 
              disabled={!commentText.trim()}
            >
              Post Comment
            </Button>
          </Box>
        ) : (
          <Alert severity="info" sx={{ mb: 3 }}>
            Please log in to comment on this post.
          </Alert>
        )}
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Comments List */}
        {post.comments.length > 0 ? (
          <Grid container spacing={2}>
            {post.comments.map((comment) => (
              <Grid key={comment._id} xs={12}>
                <Comment 
                  comment={comment} 
                  currentUser={user} 
                  onDelete={handleCommentDelete}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No comments yet. Be the first to comment!
          </Typography>
        )}
      </Paper>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this post? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeletePost} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PostDetails;