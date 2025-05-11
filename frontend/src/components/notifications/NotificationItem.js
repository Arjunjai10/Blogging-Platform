import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  IconButton,
  Box
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import CommentIcon from '@mui/icons-material/Comment';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const NotificationListItem = styled(ListItem)(({ theme, read }) => ({
  backgroundColor: read ? 'transparent' : theme.palette.action.hover,
  '&:hover': {
    backgroundColor: theme.palette.action.selected
  },
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1)
}));

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  if (!notification) return null;
  
  const {
    _id,
    type,
    sender,
    post,
    read,
    createdAt
  } = notification;
  
  // Get API base URL from environment or default to localhost
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  const handleClick = () => {
    if (!read) {
      onMarkAsRead(_id);
    }
  };
  
  const getNotificationIcon = () => {
    switch (type) {
      case 'like':
        return <FavoriteIcon color="error" />;
      case 'comment':
        return <CommentIcon color="primary" />;
      case 'follow':
        return <PersonAddIcon color="success" />;
      default:
        return null;
    }
  };
  
  const getNotificationText = () => {
    switch (type) {
      case 'like':
        return (
          <>
            <Typography component="span" fontWeight="bold">
              {sender?.username || 'Someone'}
            </Typography>{' '}
            liked your post{' '}
            <Typography component="span" fontWeight="bold">
              {post?.title || 'a post'}
            </Typography>
          </>
        );
      case 'comment':
        return (
          <>
            <Typography component="span" fontWeight="bold">
              {sender?.username || 'Someone'}
            </Typography>{' '}
            commented on your post{' '}
            <Typography component="span" fontWeight="bold">
              {post?.title || 'a post'}
            </Typography>
          </>
        );
      case 'follow':
        return (
          <>
            <Typography component="span" fontWeight="bold">
              {sender?.username || 'Someone'}
            </Typography>{' '}
            started following you
          </>
        );
      default:
        return 'New notification';
    }
  };
  
  const getNotificationLink = () => {
    switch (type) {
      case 'like':
      case 'comment':
        return post ? `/posts/${post._id}` : '#';
      case 'follow':
        return sender ? `/profile/${sender._id}` : '#';
      default:
        return '#';
    }
  };
  
  const formatDate = (date) => {
    try {
      return format(new Date(date), 'MMM d, yyyy h:mm a');
    } catch (err) {
      return 'Unknown date';
    }
  };
  
  return (
    <NotificationListItem
      read={read ? 1 : 0}
      secondaryAction={
        <IconButton edge="end" aria-label="delete" onClick={() => onDelete(_id)}>
          <DeleteIcon />
        </IconButton>
      }
      component={RouterLink}
      to={getNotificationLink()}
      onClick={handleClick}
      sx={{ textDecoration: 'none', color: 'inherit' }}
    >
      <ListItemAvatar>
        {sender?.profilePicture ? (
          <Avatar 
            src={
              sender.profilePicture.startsWith('http') 
                ? sender.profilePicture 
                : `${API_BASE_URL}${sender.profilePicture}`
            } 
            alt={sender.username}
          />
        ) : (
          <Avatar>{getNotificationIcon()}</Avatar>
        )}
      </ListItemAvatar>
      <ListItemText
        primary={getNotificationText()}
        secondary={
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {formatDate(createdAt)}
            </Typography>
          </Box>
        }
      />
    </NotificationListItem>
  );
};

export default NotificationItem;
