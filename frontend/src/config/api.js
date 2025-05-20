/**
 * Centralized API configuration
 * This file contains all API-related configuration and utilities
 */

// Base URL for all API requests
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://blogging-platform-msqm.onrender.com';

// Configure axios defaults
import axios from 'axios';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true; // Enable CORS credentials

// API endpoints
export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    ADMIN_LOGIN: `${API_BASE_URL}/api/auth/admin/login`,
    CURRENT_USER: `${API_BASE_URL}/api/auth/me`,
    GOOGLE_LOGIN: `${API_BASE_URL}/api/auth/google`,
    GOOGLE_CALLBACK: `${API_BASE_URL}/api/auth/google/callback`,
  },
  // Posts endpoints
  POSTS: {
    BASE: `${API_BASE_URL}/api/posts`,
    BY_ID: (id) => `${API_BASE_URL}/api/posts/${id}`,
    COMMENTS: (id) => `${API_BASE_URL}/api/posts/${id}/comments`,
  },
  // Users endpoints
  USERS: {
    BASE: `${API_BASE_URL}/api/users/`,
    BY_ID: (id) => `${API_BASE_URL}/api/users/${id}`,
    PROFILE: (id) => `${API_BASE_URL}/api/users/${id}/profile`,
    FOLLOW: (id) => `${API_BASE_URL}/api/users/follow/${id}`,
    FOLLOWERS: (id) => `${API_BASE_URL}/api/users/${id}/followers`,
    FOLLOWING: (id) => `${API_BASE_URL}/api/users/${id}/following`,
  },
  // Settings endpoints
  SETTINGS: {
    BASE: `${API_BASE_URL}/api/settings`,
    BY_SECTION: (section) => `${API_BASE_URL}/api/settings/${section}`,
    INITIALIZE: `${API_BASE_URL}/api/settings/initialize`,
  },
  // Admin endpoints
  ADMIN: {
    USERS: `${API_BASE_URL}/api/admin/users`,
    POSTS: `${API_BASE_URL}/api/admin/posts`,
    NOTIFICATIONS: `${API_BASE_URL}/api/admin/notifications`,
  },
  // Notifications endpoints
  NOTIFICATIONS: {
    BASE: `${API_BASE_URL}/api/notifications`,
    BY_ID: (id) => `${API_BASE_URL}/api/notifications/${id}`,
    USER_NOTIFICATIONS: (userId) => `${API_BASE_URL}/api/notifications/user/${userId}`,
    READ_ALL: `${API_BASE_URL}/api/notifications/read-all`,
    UNREAD_COUNT: `${API_BASE_URL}/api/notifications/unread-count`,
  },
};

// Common headers
export const getAuthHeader = (token) => ({
  'Content-Type': 'application/json',
  'x-auth-token': token
});

// Helper to handle API errors
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return error.response.data.msg || 'Server error';
  } else if (error.request) {
    // The request was made but no response was received
    return 'No response from server. Please check your internet connection.';
  } else {
    // Something happened in setting up the request that triggered an Error
    return error.message || 'An unexpected error occurred';
  }
};
