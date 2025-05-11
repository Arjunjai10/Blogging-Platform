import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';

const GoogleCallback = () => {
  const { handleGoogleCallback, error } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Process the Google callback
    const success = handleGoogleCallback();
    
    // Redirect to home page after a short delay
    const redirectTimer = setTimeout(() => {
      navigate(success ? '/' : '/login');
    }, 2000);
    
    return () => clearTimeout(redirectTimer);
  }, [handleGoogleCallback, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 3
      }}
    >
      {error ? (
        <Alert severity="error" sx={{ mb: 2, width: '100%', maxWidth: 500 }}>
          {error}
        </Alert>
      ) : (
        <>
          <CircularProgress size={60} sx={{ mb: 4 }} />
          <Typography variant="h5" gutterBottom>
            Completing Authentication
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center">
            Please wait while we complete your authentication...
          </Typography>
        </>
      )}
    </Box>
  );
};

export default GoogleCallback;
