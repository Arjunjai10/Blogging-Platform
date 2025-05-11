/* eslint-disable no-undef */
import React, { useContext, useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Container,
  useMediaQuery,
  InputBase,
  Divider,
  ListItemIcon,
  Tooltip,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton
} from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import CreateIcon from '@mui/icons-material/Create';
import HomeIcon from '@mui/icons-material/Home';
import CloseIcon from '@mui/icons-material/Close';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import NotificationMenu from '../notifications/NotificationMenu';

// Styled search component
// eslint-disable-next-line no-undef
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15), // eslint-disable-line no-undef
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25), // eslint-disable-line no-undef
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
    [theme.breakpoints.up('md')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  background: theme.palette.mode === 'dark' 
    ? theme.palette.background.paper 
    : '#000000', // Changed to black
  transition: 'all 0.3s ease',
}));

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Get API base URL from environment or default to localhost
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  useEffect(() => {
    // Fetch notifications if user is authenticated
    if (isAuthenticated && user) {
      // This would be an API call in a real app
      // setNotifications([
      //   { id: 1, text: 'New comment on your post', read: false },
      //   { id: 2, text: 'Someone liked your post', read: true }
      // ]);
    }
  }, [isAuthenticated, user]);
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleLogout = () => {
    logout();
    handleMenuClose();
    setDrawerOpen(false);
  };
  
  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };
  
  // Dark mode toggle is now handled by ThemeContext
  
  // const unreadNotifications = notifications.filter(n => !n.read).length;
  
  const authLinks = (
    <>
      {/* Admin Dashboard Button - Only visible for admin users */}
      {user?.isAdmin && (
        <Tooltip title="Admin Dashboard">
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/admin/dashboard"
            startIcon={<DashboardIcon />}
            sx={{ 
              fontWeight: 'bold',
              borderRadius: '20px',
              px: 2,
              mr: 1,
              backgroundColor: alpha(theme.palette.error.main, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.2)
              }
            }}
          >
            Dashboard
          </Button>
        </Tooltip>
      )}
      
      <Tooltip title="Write a new post">
        <Button 
          color="inherit" 
          component={RouterLink} 
          to="/create-post"
          startIcon={<CreateIcon />}
          sx={{ 
            fontWeight: 'bold',
            borderRadius: '20px',
            px: 2,
            '&:hover': {
              backgroundColor: alpha(theme.palette.common.white, 0.2)
            }
          }}
        >
          Write
        </Button>
      </Tooltip>
      
      <Tooltip title="Notifications">
        <NotificationMenu />
      </Tooltip>
      
      <Tooltip title="Bookmarks">
        <IconButton 
          color="inherit" 
          component={RouterLink} 
          to="/bookmarks"
          size="large" 
          sx={{ ml: 1 }}
        >
          <BookmarkIcon />
        </IconButton>
      </Tooltip>
      
      <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
        <IconButton 
          color="inherit" 
          onClick={toggleDarkMode}
          size="large" 
          sx={{ ml: 1 }}
        >
          {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Tooltip>
      
      <Box sx={{ ml: 1 }}>
        <Tooltip title="Account">
          <IconButton 
            onClick={handleMenuOpen} 
            sx={{ 
              p: 0,
              border: '2px solid white',
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.1)
              }
            }}
          >
            <Avatar 
              alt={user?.username} 
              src={user?.profilePicture ? `${API_BASE_URL}${user.profilePicture}` : ''}
              sx={{ width: 32, height: 32 }}
            />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 3,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
              mt: 1.5,
              width: 220,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle1" noWrap>
              {user?.username}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {user?.email}
            </Typography>
          </Box>
          
          <Divider />
          
          <MenuItem 
            component={RouterLink} 
            to={`/profile/${user?._id}`} 
            onClick={handleMenuClose}
          >
            <ListItemIcon>
              <AccountCircleIcon fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
          
          <MenuItem 
            component={RouterLink} 
            to="/bookmarks" 
            onClick={handleMenuClose}
          >
            <ListItemIcon>
              <BookmarkIcon fontSize="small" />
            </ListItemIcon>
            Bookmarks
          </MenuItem>
          
          <MenuItem 
            component={RouterLink} 
            to="/edit-profile" 
            onClick={handleMenuClose}
          >
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          
          <Divider />
          
          <MenuItem onClick={toggleDarkMode}>
            <ListItemIcon>
              {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </ListItemIcon>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </MenuItem>
          
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </>
  );
  
  const guestLinks = (
    <>
      <Button 
        color="inherit" 
        component={RouterLink} 
        to="/login"
        sx={{ 
          fontWeight: 'bold',
          mx: 1,
          '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.1)
          }
        }}
      >
        Login
      </Button>
      <Button 
        variant="contained" 
        component={RouterLink} 
        to="/register"
        sx={{ 
          fontWeight: 'bold',
          backgroundColor: 'white',
          color: theme.palette.primary.main,
          '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.9)
          }
        }}
      >
        Register
      </Button>
    </>
  );
  
  // Drawer for mobile view
  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="h6" component="div">
          MERN Blog
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <Box sx={{ p: 2 }}>
        <Paper component="form" sx={{ 
          p: '2px 4px', 
          display: 'flex', 
          alignItems: 'center',
          mb: 2,
          borderRadius: '20px'
        }}>
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearch}
          />
          <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
            <SearchIcon />
          </IconButton>
        </Paper>
      </Box>
      
      <List sx={{ pt: 0 }}>
        <ListItem disablePadding>
          <ListItemButton onClick={toggleDarkMode} sx={{ py: 1.5 }}>
            <ListItemIcon>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </ListItemIcon>
            <ListItemText primary={darkMode ? "Light Mode" : "Dark Mode"} />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/" onClick={handleDrawerToggle}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        {isAuthenticated ? (
          <>
            {/* Admin Dashboard - Only visible for admin users */}
            {user?.isAdmin && (
              <ListItem disablePadding>
                <ListItemButton 
                  component={RouterLink} 
                  to="/admin/dashboard" 
                  onClick={handleDrawerToggle}
                  sx={{
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.main, 0.2)
                    }
                  }}
                >
                  <ListItemIcon>
                    <DashboardIcon />
                  </ListItemIcon>
                  <ListItemText primary="Admin Dashboard" />
                </ListItemButton>
              </ListItem>
            )}
            
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/create-post" onClick={handleDrawerToggle}>
                <ListItemIcon>
                  <CreateIcon />
                </ListItemIcon>
                <ListItemText primary="Write Post" />
              </ListItemButton>
            </ListItem>
            
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/bookmarks" onClick={handleDrawerToggle}>
                <ListItemIcon>
                  <BookmarkIcon />
                </ListItemIcon>
                <ListItemText primary="Bookmarks" />
              </ListItemButton>
            </ListItem>
            
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to={`/profile/${user?._id}`} onClick={handleDrawerToggle}>
                <ListItemIcon>
                  <AccountCircleIcon />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItemButton>
            </ListItem>
            
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/edit-profile" onClick={handleDrawerToggle}>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItemButton>
            </ListItem>
            
            <Divider />
            
            <ListItem disablePadding>
              <ListItemButton onClick={toggleDarkMode}>
                <ListItemIcon>
                  {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </ListItemIcon>
                <ListItemText primary={darkMode ? "Light Mode" : "Dark Mode"} />
              </ListItemButton>
            </ListItem>
            
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
            
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <NotificationsIcon />
                </ListItemIcon>
                <ListItemText primary="Notifications" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/login" onClick={handleDrawerToggle}>
                <ListItemIcon>
                  <AccountCircleIcon />
                </ListItemIcon>
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>
            
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/register" onClick={handleDrawerToggle}>
                <ListItemIcon>
                  <AccountCircleIcon />
                </ListItemIcon>
                <ListItemText primary="Register" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );
  
  return (
    <>
      <StyledAppBar position="sticky" elevation={0}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            {isMobile ? (
              <>
                <IconButton
                  size="large"
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
                
                <Box
                  component={RouterLink}
                  to="/"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexGrow: 1,
                    textDecoration: 'none'
                  }}
                >
                  <img 
                    src="/DB.gif" 
                    alt="Blog Logo" 
                    style={{ 
                      height: '32px',
                      marginRight: '10px',
                      borderRadius: '4px'
                    }} 
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'white',
                      textDecoration: 'none',
                      display: 'flex'
                    }}
                    className="navbar-brand"
                  >
                    <span className="echo">Echo</span>
                    <span className="ridge">Ridge</span>
                  </Typography>
                </Box>
                
                {isAuthenticated && (
                  <NotificationMenu />
                )}
              </>
            ) : (
              <>
                <Box
                  component={RouterLink}
                  to="/"
                  sx={{
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                  }}
                >
                  <img 
                    src="/DB.gif" 
                    alt="Blog Logo" 
                    style={{ 
                      height: '36px',
                      marginRight: '10px',
                      borderRadius: '4px'
                    }} 
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'white',
                      textDecoration: 'none',
                      display: 'flex'
                    }}
                    className="navbar-brand"
                  >
                    <span className="echo">Echo</span>
                    <span className="ridge">Ridge</span>
                  </Typography>
                </Box>
                
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/"
                  sx={{ 
                    mr: 2,
                    textDecoration: 'none',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.common.white, 0.1),
                      textDecoration: 'none'
                    }
                  }}
                >
                  Home
                </Button>
                
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/categories"
                  sx={{ 
                    mr: 2,
                    textDecoration: 'none',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.common.white, 0.1),
                      textDecoration: 'none'
                    }
                  }}
                >
                  Categories
                </Button>
                
                <Search>
                  <SearchIconWrapper>
                    <SearchIcon />
                  </SearchIconWrapper>
                  <StyledInputBase
                    placeholder="Search…"
                    inputProps={{ 'aria-label': 'search' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearch}
                  />
                </Search>
                
                <Box sx={{ flexGrow: 1 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {isAuthenticated ? authLinks : guestLinks}
                </Box>
              </>
            )}
          </Toolbar>
        </Container>
      </StyledAppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
