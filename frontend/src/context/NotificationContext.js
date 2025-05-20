import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../config/api';
import { useAuth } from './AuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(ENDPOINTS.NOTIFICATIONS.GET);
      if (response.data) {
        setNotifications(response.data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.response?.data?.msg || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await axios.put(ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(notificationId));
      if (response.data) {
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification._id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
        return true;
      }
      return false;
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to mark notification as read');
      return false;
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await axios.put(ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ);
      if (response.data) {
        setNotifications(prevNotifications =>
          prevNotifications.map(notification => ({ ...notification, read: true }))
        );
        return true;
      }
      return false;
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to mark all notifications as read');
      return false;
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await axios.delete(ENDPOINTS.NOTIFICATIONS.DELETE(notificationId));
      if (response.data) {
        setNotifications(prevNotifications =>
          prevNotifications.filter(notification => notification._id !== notificationId)
        );
        return true;
      }
      return false;
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to delete notification');
      return false;
    }
  };

  const clearAllNotifications = async () => {
    try {
      const response = await axios.delete(ENDPOINTS.NOTIFICATIONS.CLEAR_ALL);
      if (response.data) {
        setNotifications([]);
        return true;
      }
      return false;
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to clear all notifications');
      return false;
    }
  };

  const value = {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    setError
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
