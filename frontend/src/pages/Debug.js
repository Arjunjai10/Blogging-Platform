import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Container } from '@mui/material';

const Debug = () => {
  const [envVars, setEnvVars] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    // Collect environment variables
    try {
      const vars = {
        NODE_ENV: process.env.NODE_ENV,
        REACT_APP_API_URL: process.env.REACT_APP_API_URL,
        // Add other environment variables you're using
      };
      setEnvVars(vars);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Debug Information
        </Typography>
        
        <Typography variant="h6" gutterBottom>
          Environment Variables:
        </Typography>
        <Box component="pre" sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, overflow: 'auto' }}>
          {JSON.stringify(envVars, null, 2)}
        </Box>
        
        {error && (
          <>
            <Typography variant="h6" color="error" gutterBottom>
              Error:
            </Typography>
            <Box component="pre" sx={{ p: 2, bgcolor: '#fff0f0', borderRadius: 1, overflow: 'auto' }}>
              {error}
            </Box>
          </>
        )}

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Window Location:
        </Typography>
        <Box component="pre" sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, overflow: 'auto' }}>
          {JSON.stringify({
            href: window.location.href,
            hostname: window.location.hostname,
            pathname: window.location.pathname,
            protocol: window.location.protocol,
          }, null, 2)}
        </Box>
      </Paper>
    </Container>
  );
};

export default Debug;
