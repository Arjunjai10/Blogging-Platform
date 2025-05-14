import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
// eslint-disable-next-line no-unused-vars
import { ENDPOINTS } from '../config/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Handle Google OAuth callback
  const handleGoogleCallback = () => {
    // This function will be called when the user is redirected back from Google
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userParam = params.get('user');
    const error = params.get('error');
    
    if (error) {
      setError(decodeURIComponent(error));
      return false;
    }
    
    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setToken(token);
        setUser(user);
        setIsAuthenticated(true);
        setError(null);
        return true;
      } catch (err) {
        console.error('Error parsing user data from Google callback:', err);
        setError('Authentication error. Please try again.');
        return false;
      }
    }
    
    return false;
  };
  // Initialize user state safely
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      // If there's an error parsing, remove the corrupted data
      localStorage.removeItem('user');
      return null;
    }
  });
  
  // Initialize token state
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // API configuration is imported from config/api.js

  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          // Set auth token header
          setAuthToken(token);
          
          // Get user data
          const res = await axios.get(ENDPOINTS.AUTH.CURRENT_USER);
          
          setUser(res.data);
          setIsAuthenticated(true);
          setLoading(false);
        } catch (err) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          setError(err.response?.data?.msg || 'Authentication error');
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Register user
  const register = async (formData) => {
    try {
      // Set appropriate headers for form data
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      
      const res = await axios.post(ENDPOINTS.AUTH.REGISTER, formData, config);
      
      // Check if we have both token and user data
      if (res.data.token && res.data.user) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
        setError(null);
        
        return true;
      } else {
        // If response format is unexpected
        setError('Registration successful but login failed. Please try logging in.');
        return false;
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
      return false;
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      const res = await axios.post(ENDPOINTS.AUTH.LOGIN, formData);
      
      // Check if we have both token and user data
      if (res.data.token && res.data.user) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
        setError(null);
        
        return true;
      } else {
        // If response format is unexpected
        setError('Login successful but user data is missing. Please try again.');
        return false;
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
      return false;
    }
  };
  
  // Admin login
  const adminLogin = async (formData) => {
    try {
      const res = await axios.post(ENDPOINTS.AUTH.ADMIN_LOGIN, formData);
      
      // Check if we have both token and user data
      if (res.data.token && res.data.user) {
        // Verify the user is an admin
        if (!res.data.user.isAdmin) {
          setError('This account does not have admin privileges');
          return false;
        }
        
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
        setError(null);
        
        return true;
      } else {
        setError('Login successful but user data is missing. Please try again.');
        return false;
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Admin login failed');
      return false;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };
  
  // Update user data
  const updateUser = (updatedUserData) => {
    // Ensure the profile picture URL is properly formatted
    if (updatedUserData.profilePicture) {
      // If the URL is relative, prepend the API base URL
      if (!updatedUserData.profilePicture.startsWith('http')) {
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        updatedUserData.profilePicture = `${API_BASE_URL}${updatedUserData.profilePicture}`;
      }
    }
    
    // Update both state and localStorage
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };
  
  // Follow a user
  const followUser = async (userId) => {
    try {
      const res = await axios.post(ENDPOINTS.USERS.FOLLOW(userId));
      
      // Update user data with new following list
      if (user && res.data) {
        const updatedUser = {
          ...user,
          following: res.data.following
        };
        updateUser(updatedUser);
      }
      
      return { success: true, data: res.data };
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to follow user');
      return { success: false, error: err.response?.data?.msg || 'Failed to follow user' };
    }
  };
  
  // Unfollow a user
  const unfollowUser = async (userId) => {
    try {
      const res = await axios.delete(ENDPOINTS.USERS.FOLLOW(userId));
      
      // Update user data with new following list
      if (user && res.data) {
        const updatedUser = {
          ...user,
          following: res.data.following
        };
        updateUser(updatedUser);
      }
      
      return { success: true, data: res.data };
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to unfollow user');
      return { success: false, error: err.response?.data?.msg || 'Failed to unfollow user' };
    }
  };
  
  // Check if following a user
  const isFollowing = (userId) => {
    return user && user.following && user.following.includes(userId);
  };

  // Set auth token
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }
  };

  // Check if token is expired
  const isTokenExpired = () => {
    if (!token) return true;
    
    try {
      const decoded = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch (err) {
      return true;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        adminLogin,
        logout,
        updateUser,
        followUser,
        unfollowUser,
        isFollowing,
        isTokenExpired,
        setError,
        handleGoogleCallback
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
