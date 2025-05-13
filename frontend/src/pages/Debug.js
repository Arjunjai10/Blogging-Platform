import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';

const Debug = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Debug Page
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1">
            This is a debug page for development purposes.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Debug;
