import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: '#000000',
        color: 'white',
        boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="white" align="center">
          {'© '}
          {new Date().getFullYear()}
          {' '}
          <Link color="inherit" href="/">
            MERN Blog
          </Link>
          {' - All rights reserved.'}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
