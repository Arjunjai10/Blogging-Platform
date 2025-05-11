import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Avatar, 
  IconButton, 
  Menu, 
  MenuItem, 
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button
} from '@mui/material';
import { MoreVert as MoreVertIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';

const Comment = ({ comment, currentUser, onDelete }) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const menuOpen = Boolean(menuAnchorEl);
  
  // Check if current user is the author of the comment
  const isAuthor = currentUser && comment.user && currentUser._id === comment.user._id;
  
  const handleMenuClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };
  
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };
  
  const handleDeleteConfirm = () => {
    onDelete(comment._id);
    setDeleteDialogOpen(false);
  };
  
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src={comment.user?.profilePicture} 
            alt={comment.user?.username}
            sx={{ width: 40, height: 40, mr: 2 }}
          />
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              {comment.user?.username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {format(new Date(comment.date), 'MMM d, yyyy • h:mm a')}
            </Typography>
          </Box>
        </Box>
        
        {isAuthor && (
          <Box>
            <IconButton size="small" onClick={handleMenuClick}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu
              anchorEl={menuAnchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                Delete
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Box>
      
      <Typography variant="body2" sx={{ pl: 7, pt: 1 }}>
        {comment.text}
      </Typography>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Delete Comment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this comment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default Comment;
