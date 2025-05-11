import React, { useContext } from 'react';
import { Box, Container, Typography, Link, Grid, Divider, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { SettingsContext } from '../../context/SettingsContext';
import { ThemeContext } from '../../context/ThemeContext';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import FacebookIcon from '@mui/icons-material/Facebook';

const SocialIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? '#ffffff' : '#ffffff',
  margin: theme.spacing(0, 1),
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const Footer = () => {
  const settingsContext = useContext(SettingsContext);
  const { darkMode } = useContext(ThemeContext);
  const settings = settingsContext?.settings;
  const siteName = settings?.general?.siteName || 'MERN Blog';

  return (
    <Box
      component="footer"
      sx={{
        py: 5,
        px: 2,
        mt: 'auto',
        backgroundColor: darkMode ? '#1a1a1a' : '#000000',
        color: 'white',
        boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.3s ease'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              {siteName}
            </Typography>
            <Typography variant="body2" paragraph>
              {settings?.general?.siteDescription || 'A modern blog platform built with the MERN stack'}
            </Typography>
            <Typography variant="body2" gutterBottom>
              Contact us: {settings?.contact?.email || 'contact@mernblog.com'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Quick Links
            </Typography>
            <Link href="/" color="inherit" sx={{ display: 'block', mb: 1, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
              Home
            </Link>
            <Link href="/categories" color="inherit" sx={{ display: 'block', mb: 1, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
              Categories
            </Link>
            <Link href="/search" color="inherit" sx={{ display: 'block', mb: 1, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
              Search
            </Link>
            <Link href="/login" color="inherit" sx={{ display: 'block', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
              Login/Register
            </Link>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Connect With Us
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <Tooltip title="GitHub">
                <SocialIconButton aria-label="github">
                  <GitHubIcon />
                </SocialIconButton>
              </Tooltip>
              <Tooltip title="Twitter">
                <SocialIconButton aria-label="twitter">
                  <TwitterIcon />
                </SocialIconButton>
              </Tooltip>
              <Tooltip title="LinkedIn">
                <SocialIconButton aria-label="linkedin">
                  <LinkedInIcon />
                </SocialIconButton>
              </Tooltip>
              <Tooltip title="Facebook">
                <SocialIconButton aria-label="facebook">
                  <FacebookIcon />
                </SocialIconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3, backgroundColor: 'rgba(255,255,255,0.1)' }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
          <Typography variant="body2" color="white">
            © {new Date().getFullYear()} {siteName} - All rights reserved.
          </Typography>
          <Typography variant="body2" color="white" sx={{ mt: { xs: 1, sm: 0 } }}>
            Made with ❤️ using MERN Stack
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
