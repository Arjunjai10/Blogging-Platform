import React, { useContext } from 'react';
import {
  List,
  Typography,
  Box,
  Button,
  Divider,
  CircularProgress,
  Paper,
  Alert
} from '@mui/material';
import NotificationItem from './NotificationItem';
import { NotificationContext } from '../../context/NotificationContext';

const NotificationList = ({ onClose }) => {
  const {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useContext(NotificationContext);

  const handleMarkAsRead = (id) => {
    markAsRead(id);
    if (onClose) {
      onClose();
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDelete = (id) => {
    deleteNotification(id);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Paper sx={{ width: '100%', maxWidth: 360, maxHeight: 400, overflow: 'auto' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Notifications</Typography>
        {notifications.length > 0 && (
          <Button size="small" onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </Box>
      
      <Divider />
      
      {notifications.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No notifications yet
          </Typography>
        </Box>
      ) : (
        <List sx={{ p: 2 }}>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))}
        </List>
      )}
    </Paper>
  );
};

export default NotificationList;
