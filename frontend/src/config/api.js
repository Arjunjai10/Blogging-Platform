/**
 * Centralized API configuration
 * This file contains all API-related configuration and utilities
 */

import axios from 'axios';

// Set the base URL for all API requests
const API_BASE_URL = 'https://blogging-platform-msqm.onrender.com';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true;

// Define all API endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    CURRENT_USER: '/api/auth/me',
    GOOGLE_LOGIN: '/api/auth/google',
    ADMIN_LOGIN: '/api/auth/admin/login'
  },
  POSTS: {
    GET_ALL: '/api/posts',
    GET_BY_ID: (id) => `/api/posts/${id}`,
    CREATE: '/api/posts',
    UPDATE: (id) => `/api/posts/${id}`,
    DELETE: (id) => `/api/posts/${id}`,
    LIKE: (id) => `/api/posts/${id}/like`,
    UNLIKE: (id) => `/api/posts/${id}/unlike`,
    COMMENT: (id) => `/api/posts/${id}/comments`,
    DELETE_COMMENT: (postId, commentId) => `/api/posts/${postId}/comments/${commentId}`,
    SEARCH: '/api/posts/search',
    GET_BY_CATEGORY: (category) => `/api/posts/category/${category}`,
    GET_BY_TAG: (tag) => `/api/posts/tag/${tag}`,
    GET_BY_USER: (userId) => `/api/posts/user/${userId}`
  },
  USERS: {
    GET_ALL: '/api/users',
    GET_BY_ID: (id) => `/api/users/${id}`,
    UPDATE_PROFILE: '/api/users/profile',
    UPDATE_PASSWORD: '/api/users/password',
    FOLLOW: (id) => `/api/users/${id}/follow`,
    UNFOLLOW: (id) => `/api/users/${id}/unfollow`,
    GET_FOLLOWERS: (id) => `/api/users/${id}/followers`,
    GET_FOLLOWING: (id) => `/api/users/${id}/following`,
    UPLOAD_AVATAR: '/api/users/avatar'
  },
  SETTINGS: {
    GET: '/api/settings',
    UPDATE: '/api/settings',
    INITIALIZE: '/api/settings/initialize'
  },
  NOTIFICATIONS: {
    GET: '/api/notifications',
    MARK_AS_READ: (id) => `/api/notifications/${id}/read`,
    MARK_ALL_AS_READ: '/api/notifications/read-all',
    DELETE: (id) => `/api/notifications/${id}`,
    CLEAR_ALL: '/api/notifications/clear-all'
  },
  CATEGORIES: {
    GET_ALL: '/api/categories',
    GET_BY_ID: (id) => `/api/categories/${id}`,
    CREATE: '/api/categories',
    UPDATE: (id) => `/api/categories/${id}`,
    DELETE: (id) => `/api/categories/${id}`
  },
  TAGS: {
    GET_ALL: '/api/tags',
    GET_BY_ID: (id) => `/api/tags/${id}`,
    CREATE: '/api/tags',
    UPDATE: (id) => `/api/tags/${id}`,
    DELETE: (id) => `/api/tags/${id}`
  },
  COMMENTS: {
    GET_ALL: '/api/comments',
    GET_BY_ID: (id) => `/api/comments/${id}`,
    CREATE: '/api/comments',
    UPDATE: (id) => `/api/comments/${id}`,
    DELETE: (id) => `/api/comments/${id}`,
    LIKE: (id) => `/api/comments/${id}/like`,
    UNLIKE: (id) => `/api/comments/${id}/unlike`
  }
};

// Error handling utility
export const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return error.response.data?.msg || 'Server error occurred';
  } else if (error.request) {
    // The request was made but no response was received
    return 'No response from server. Please check your connection.';
  } else {
    // Something happened in setting up the request that triggered an Error
    return error.message || 'An unexpected error occurred';
  }
};

// Request interceptor for adding auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;
