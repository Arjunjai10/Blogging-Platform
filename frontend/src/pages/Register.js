import React, { useState, useContext, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'; // Import axios for direct API calls
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
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  Divider
} from '@mui/material';
import { Visibility, VisibilityOff, AccountCircle, Email, Lock, PhotoCamera, Google } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import { ENDPOINTS } from '../config/api';

const Register = () => {
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
    profilePicture: null
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  
  const { isAuthenticated, error, setError } = useContext(AuthContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    // If already authenticated, redirect to home or the page they were trying to access
    if (isAuthenticated) {
      const { from } = location.state || { from: '/' };
      navigate(from);
    }
    
    // Clear any previous errors
    setError(null);
  }, [isAuthenticated, navigate, setError, location]);
  
  const steps = ['Account Information', 'Profile Details'];
  
  const validate = (step) => {
    const errors = {};
    
    if (step === 0) {
      if (!formData.username) {
        errors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        errors.username = 'Username must be at least 3 characters';
      }
      
      if (!formData.email) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Email is invalid';
      }
      
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
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
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        profilePicture: file
      });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleNext = (e) => {
    // Prevent form submission and page refresh
    if (e) e.preventDefault();
    
    if (validate(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validate(activeStep)) {
      setIsSubmitting(true);
      setError(null);
      
      try {
        // Create FormData for file upload
        const submitData = new FormData();
        submitData.append('username', formData.username);
        submitData.append('email', formData.email);
        submitData.append('password', formData.password);
        submitData.append('bio', formData.bio || '');
        
        if (formData.profilePicture) {
          submitData.append('profilePicture', formData.profilePicture);
        }
        
        console.log('Submitting registration data:', {
          username: formData.username,
          email: formData.email,
          hasProfilePic: !!formData.profilePicture
        });
        
        // Make direct API call instead of using context
        const API_BASE_URL = 'http://localhost:5000';
        const config = {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        };
        
        try {
          // Make the API call directly
          const response = await axios.post(`${API_BASE_URL}/api/auth/register`, submitData, config);
          console.log('Registration successful:', response.data);
          
          if (response.data && response.data.token) {
            // Store token and user data in localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            // Set axios default headers for future requests
            axios.defaults.headers.common['x-auth-token'] = response.data.token;
            
            // Show success message and redirect
            alert('Registration successful! Redirecting to home page...');
            window.location.href = '/';
          } else {
            setError('Registration successful but login failed. Please try logging in.');
          }
        } catch (apiError) {
          console.error('API error:', apiError.response?.data || apiError.message);
          setError(apiError.response?.data?.msg || 'Registration failed. Please try again.');
        }
      } catch (error) {
        console.error('Registration error:', error.message);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              error={!!formErrors.username}
              helperText={formErrors.username}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={toggleConfirmPasswordVisibility}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </>
        );
      case 1:
        return (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar 
                src={previewImage} 
                sx={{ width: 100, height: 100, mb: 2 }}
              />
              <Button
                variant="contained"
                component="label"
                startIcon={<PhotoCamera />}
              >
                Upload Profile Picture
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
            </Box>
            
            <TextField
              margin="normal"
              fullWidth
              name="bio"
              label="Bio (Optional)"
              multiline
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us a little about yourself..."
            />
          </>
        );
      default:
        return null;
    }
  };
  
  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Create Account
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box component="form" onSubmit={(e) => activeStep === steps.length - 1 ? handleSubmit(e) : handleNext(e)} noValidate>
          {renderStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              type="button" // Explicitly set to button type to prevent form submission
            >
              Back
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <CircularProgress size={24} />
              ) : activeStep === steps.length - 1 ? (
                'Sign Up'
              ) : (
                'Next'
              )}
            </Button>
          </Box>
          
          <Box sx={{ mt: 3, mb: 2 }}>
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
              Sign up with Google
            </Button>
          </Box>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" variant="body2">
                Log In
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
