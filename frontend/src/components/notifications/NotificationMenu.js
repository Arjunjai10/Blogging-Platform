import React, { useState, useContext } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  Box,
  CircularProgress
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationList from './NotificationList';
import { NotificationContext } from '../../context/NotificationContext';
import { AuthContext } from '../../context/AuthContext';

const NotificationMenu = () => {
  const { unreadCount, loading } = useContext(NotificationContext);
  const { isAuthenticated } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <>
      <IconButton
        color="inherit"
        aria-label="notifications"
        onClick={handleClick}
        aria-controls={open ? 'notification-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Badge badgeContent={loading ? undefined : unreadCount} color="error">
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <NotificationsIcon />
          )}
        </Badge>
      </IconButton>
      
      <Menu
        id="notification-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'notification-button',
        }}
        PaperProps={{
          elevation: 3,
          sx: { width: 360, maxHeight: 500 }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 0 }}>
          <NotificationList onClose={handleClose} />
        </Box>
      </Menu>
    </>
  );
};

export default NotificationMenu;
