import React, { useState, useContext, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { handleApiError, ENDPOINTS } from '../config/api';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { Google } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isAuthenticated, error, setError } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Add environment variable check
  useEffect(() => {
    console.log('Environment Variables Check:');
    console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    console.log('PUBLIC_URL:', process.env.PUBLIC_URL);
    console.log('Current API Endpoint:', ENDPOINTS.AUTH.LOGIN);
  }, []);
  
  useEffect(() => {
    // If already authenticated, redirect to home
    if (isAuthenticated) {
      navigate('/');
    }
    
    // Clear any previous errors
    setError(null);
  }, [isAuthenticated, navigate, setError]);
  
  const validate = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validate()) {
      try {
        setIsSubmitting(true);
        console.log('Attempting login with:', { email: formData.email });
        console.log('API URL:', ENDPOINTS.AUTH.LOGIN);
        
        // Try direct axios call first to debug
        try {
          const response = await axios.post(ENDPOINTS.AUTH.LOGIN, formData);
          console.log('Login response:', response.data);
          
          if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            axios.defaults.headers.common['x-auth-token'] = response.data.token;
            navigate('/');
          } else {
            setError('Login successful but no token received');
          }
        } catch (axiosError) {
          console.error('Axios error:', axiosError.response?.data || axiosError.message);
          setError(axiosError.response?.data?.msg || 'Login failed. Please try again.');
        }
      } catch (err) {
        console.error('Login error:', err);
        const errorMessage = handleApiError(err);
        setError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Log In
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            error={!!formErrors.password}
            helperText={formErrors.password}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Log In'}
          </Button>
          
          <Box sx={{ my: 2 }}>
            <Divider sx={{ mb: 2 }}>OR</Divider>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Google />}
              onClick={() => window.location.href = ENDPOINTS.AUTH.GOOGLE_LOGIN}
              sx={{
                borderColor: '#4285F4',
                color: '#4285F4',
                '&:hover': {
                  borderColor: '#4285F4',
                  backgroundColor: 'rgba(66, 133, 244, 0.04)'
                }
              }}
            >
              Log in with Google
            </Button>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link component={RouterLink} to="/register" variant="body2">
                Sign Up 
              </Link>
            </Typography>
          </Box>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2">
              Or as Admin?{' '}
              <Link component={RouterLink} to="/admin/login" variant="body2">
                Admin Login
              </Link>
            </Typography>
          </Box>
      </Paper>
    </Container>
  );
};

export default Login;
