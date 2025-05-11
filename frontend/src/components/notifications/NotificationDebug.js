import React, { useContext, useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Divider, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';

const NotificationDebug = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const { notifications, unreadCount, loading, error, fetchNotifications } = useContext(NotificationContext);
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState(null);
  
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  const testNotificationAPI = async () => {
    try {
      setTestLoading(true);
      setTestError(null);
      
      const response = await axios.get(`${API_BASE_URL}/api/notifications/test`);
      setTestResult(response.data);
    } catch (err) {
      console.error('Test API error:', err);
      setTestError(err.message || 'Failed to test notification API');
    } finally {
      setTestLoading(false);
    }
  };
  
  useEffect(() => {
    // This will run once when the component mounts
    testNotificationAPI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  if (!isAuthenticated) {
    return (
      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="warning">You must be logged in to debug notifications</Alert>
      </Paper>
    );
  }
  
  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Notification System Debug
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          API Test
        </Typography>
        
        {testLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography>Testing API...</Typography>
          </Box>
        ) : testError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {testError}
          </Alert>
        ) : testResult ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            API Test Result: {JSON.stringify(testResult)}
          </Alert>
        ) : null}
        
        <Button 
          variant="outlined" 
          onClick={testNotificationAPI}
          disabled={testLoading}
        >
          Test API Connection
        </Button>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current User
        </Typography>
        
        <Typography variant="body1">
          User ID: {user?._id || 'Not available'}
        </Typography>
        <Typography variant="body1">
          Username: {user?.username || 'Not available'}
        </Typography>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Notification Status
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography>Loading notifications...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <>
            <Typography variant="body1">
              Total Notifications: {notifications.length}
            </Typography>
            <Typography variant="body1">
              Unread Notifications: {unreadCount}
            </Typography>
          </>
        )}
        
        <Button 
          variant="contained" 
          onClick={fetchNotifications}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          Refresh Notifications
        </Button>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box>
        <Typography variant="h6" gutterBottom>
          Notification Data
        </Typography>
        
        {notifications.length > 0 ? (
          <Box 
            component="pre" 
            sx={{ 
              p: 2, 
              bgcolor: 'grey.100', 
              borderRadius: 1,
              overflow: 'auto',
              maxHeight: 300
            }}
          >
            {JSON.stringify(notifications, null, 2)}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No notifications available
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default NotificationDebug;
