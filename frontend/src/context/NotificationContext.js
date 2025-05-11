import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  loading: false,
  fetchNotifications: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  deleteNotification: () => {}
});

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get API base URL from environment or default to localhost
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  // API configuration is handled in config/api.js
  
  // Fetch user notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage');
        setLoading(false);
        setNotifications([]);
        setUnreadCount(0);
        setError('Authentication error - please log in again');
        return;
      }
      
      console.log('Fetching notifications for user:', user._id);
      
      const config = {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      };
      
      const url = `${API_BASE_URL}/api/notifications/user/${user._id}`;
      console.log('Request URL:', url);
      
      const res = await axios.get(url, config);
      
      console.log('Notifications response:', res.data);
      setNotifications(res.data);
      setUnreadCount(res.data.filter(notification => !notification.read).length);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err.response?.data || err.message);
      setNotifications([]);
      setUnreadCount(0);
      
      // Set more specific error messages based on the error
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 401) {
          setError('Authentication error - please log in again');
        } else if (err.response.status === 404) {
          setError('Notification service not found');
        } else {
          setError(`Failed to load notifications: ${err.response.data?.msg || 'Server error'}`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError('Network error - please check your connection');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('Failed to load notifications');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, API_BASE_URL]);
  
  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!isAuthenticated || !notificationId) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const config = {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      };
      
      await axios.put(
        `${API_BASE_URL}/api/notifications/${notificationId}/read`,
        {},
        config
      );
      
      // Update local state
      setNotifications(
        notifications.map(notification =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err.response?.data || err.message);
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!isAuthenticated) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const config = {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      };
      
      await axios.put(
        `${API_BASE_URL}/api/notifications/read-all`,
        {},
        config
      );
      
      // Update local state
      setNotifications(
        notifications.map(notification => ({
          ...notification,
          read: true
        }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err.response?.data || err.message);
    }
  };
  
  // Delete notification
  const deleteNotification = async (notificationId) => {
    if (!isAuthenticated || !notificationId) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const config = {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      };
      
      await axios.delete(
        `${API_BASE_URL}/api/notifications/${notificationId}`,
        config
      );
      
      // Update local state
      const updatedNotifications = notifications.filter(
        notification => notification._id !== notificationId
      );
      
      setNotifications(updatedNotifications);
      
      // Update unread count if needed
      const deletedNotification = notifications.find(
        notification => notification._id === notificationId
      );
      
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err.response?.data || err.message);
    }
  };
  
  // Fetch notifications when user changes or when auth state changes
  useEffect(() => {
    let isMounted = true;
    
    if (isAuthenticated && user) {
      // Initial fetch
      fetchNotifications();
      
      // Set up interval to refresh notifications every minute
      // Use a more efficient approach by checking if the component is still mounted
      // and if the user is active before fetching
      const intervalId = setInterval(() => {
        // Only fetch if the component is still mounted and the user has been active recently
        // This helps reduce unnecessary API calls when the user is inactive
        if (isMounted && document.visibilityState === 'visible') {
          fetchNotifications();
        }
      }, 60000); // 60 seconds
      
      // Clean up interval on unmount
      return () => {
        isMounted = false;
        clearInterval(intervalId);
      };
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
    
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user, fetchNotifications]);
  
  const contextValue = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
  
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
