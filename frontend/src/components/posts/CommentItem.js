import React, { useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatDistanceToNow } from 'date-fns';
import { AuthContext } from '../../context/AuthContext';

const CommentItem = ({ comment, postId, onDeleteComment }) => {
  const { user } = useContext(AuthContext);
  
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Avatar
          src={comment.user.profilePicture ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${comment.user.profilePicture}` : ''}
          alt={comment.user.username}
          sx={{ mr: 2 }}
        />
        
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography 
                variant="subtitle2" 
                component={RouterLink} 
                to={`/profile/${comment.user._id}`}
                sx={{ textDecoration: 'none', color: 'inherit' }}
              >
                {comment.user.username}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                {formatDistanceToNow(new Date(comment.date), { addSuffix: true })}
              </Typography>
            </Box>
            
            {user && user._id === comment.user._id && (
              <IconButton 
                size="small" 
                color="error"
                onClick={() => onDeleteComment(postId, comment._id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          
          <Typography variant="body2" sx={{ mt: 1 }}>
            {comment.text}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default CommentItem;
