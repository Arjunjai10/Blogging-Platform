import React, { useContext } from 'react';
import { Box, Container, Typography, Link, Grid, Divider, IconButton, Tooltip } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { SettingsContext } from '../../context/SettingsContext';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import FacebookIcon from '@mui/icons-material/Facebook';

const StyledFooter = styled(Box)(({ theme }) => ({
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(180deg, #1a237e 0%, #000000 100%)'
    : 'linear-gradient(180deg, #000000 0%, #1a237e 100%)',
  color: 'white',
  padding: theme.spacing(6, 0),
  marginTop: 'auto',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
  }
}));

const SocialIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.common.white,
  margin: theme.spacing(0, 1),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    backgroundColor: alpha(theme.palette.common.white, 0.1),
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
}));

const FooterLink = styled(Link)(({ theme }) => ({
  color: theme.palette.common.white,
  textDecoration: 'none',
  transition: 'all 0.3s ease',
  display: 'block',
  marginBottom: theme.spacing(1),
  '&:hover': {
    color: theme.palette.primary.main,
    transform: 'translateX(5px)',
  },
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  '& .echo': {
    color: theme.palette.primary.main,
  },
  '& .ridge': {
    color: theme.palette.common.white,
  },
}));

const Footer = () => {
  const settingsContext = useContext(SettingsContext);
  const settings = settingsContext?.settings;
  const siteName = settings?.general?.siteName || 'MERN Blog';

  return (
    <StyledFooter component="footer">
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid sx={{ width: { xs: '100%', md: '33.33%' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box 
                component="img"
                src="/DB.gif"
                alt="EchoRidge Logo"
                sx={{ 
                  height: 40, 
                  width: 40, 
                  marginRight: 1.5,
                  borderRadius: '50%',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1) rotate(5deg)',
                  }
                }}
              />
              <LogoText variant="h6">
                <span className="echo">Echo</span>
                <span className="ridge">Ridge</span>
              </LogoText>
            </Box>
            <Typography 
              variant="body2" 
              paragraph
              sx={{ 
                opacity: 0.8,
                lineHeight: 1.6,
                '&:hover': {
                  opacity: 1,
                }
              }}
            >
              {settings?.general?.siteDescription || 'Your go-to blog for all things tech.'}
            </Typography>
            <Typography 
              variant="body2" 
              gutterBottom
              sx={{ 
                opacity: 0.8,
                '&:hover': {
                  opacity: 1,
                }
              }}
            >
              Contact us: {settings?.contact?.email || 'contact@mernblog.com'}
            </Typography>
          </Grid>
          
          <Grid sx={{ width: { xs: '100%', md: '33.33%' } }}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: 0,
                  width: 40,
                  height: 2,
                  background: 'linear-gradient(90deg, #1a237e, transparent)',
                }
              }}
            >
              Quick Links
            </Typography>
            <FooterLink href="/" color="inherit">
              Home
            </FooterLink>
            <FooterLink href="/categories" color="inherit">
              Categories
            </FooterLink>
            <FooterLink href="/search" color="inherit">
              Search
            </FooterLink>
            <FooterLink href="/login" color="inherit">
              Login/Register
            </FooterLink>
          </Grid>
          
          <Grid sx={{ width: { xs: '100%', md: '33.33%' } }}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: 0,
                  width: 40,
                  height: 2,
                  background: 'linear-gradient(90deg, #1a237e, transparent)',
                }
              }}
            >
              Connect With Us
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <Tooltip title="GitHub">
                <SocialIconButton 
                  aria-label="github"
                  component="a"
                  href="https://github.com/EchoRidge"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GitHubIcon />
                </SocialIconButton>
              </Tooltip>
              <Tooltip title="Twitter">
                <SocialIconButton 
                  aria-label="twitter"
                  component="a"
                  href="https://twitter.com/EchoRidge"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <TwitterIcon />
                </SocialIconButton>
              </Tooltip>
              <Tooltip title="LinkedIn">
                <SocialIconButton 
                  aria-label="linkedin"
                  component="a"
                  href="https://linkedin.com/company/echoridge"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LinkedInIcon />
                </SocialIconButton>
              </Tooltip>
              <Tooltip title="Facebook">
                <SocialIconButton 
                  aria-label="facebook"
                  component="a"
                  href="https://facebook.com/EchoRidge"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FacebookIcon />
                </SocialIconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
        
        <Divider 
          sx={{ 
            my: 4, 
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            height: '1px',
          }} 
        />
        
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexDirection: { xs: 'column', sm: 'row' },
            opacity: 0.8,
            '&:hover': {
              opacity: 1,
            }
          }}
        >
          <Typography variant="body2" color="white">
            © {new Date().getFullYear()} {siteName} - All rights reserved.
          </Typography>
          <Typography 
            variant="body2" 
            color="white" 
            sx={{ 
              mt: { xs: 1, sm: 0 },
              display: 'flex',
              alignItems: 'center',
              '&::before': {
                content: '"❤️"',
                marginRight: 0.5,
                animation: 'pulse 1.5s infinite',
              },
              '@keyframes pulse': {
                '0%': {
                  transform: 'scale(1)',
                },
                '50%': {
                  transform: 'scale(1.2)',
                },
                '100%': {
                  transform: 'scale(1)',
                },
              },
            }}
          >
            Welcome to EchoRidge
          </Typography>
        </Box>
      </Container>
    </StyledFooter>
  );
};

export default Footer;
