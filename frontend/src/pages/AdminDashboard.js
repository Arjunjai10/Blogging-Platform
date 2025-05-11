import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  IconButton,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  People as PeopleIcon, 
  Article as ArticleIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    comments: 0,
    notifications: 0
  });
  const [recentActivity, setRecentActivity] = useState({
    users: [],
    posts: [],
    comments: []
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch real data from the backend API
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/dashboard`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      // Update state with real data from the API
      setStats(response.data.stats);
      setRecentActivity(response.data.recentActivity || { users: [], posts: [], comments: [] });
      setSnackbar({
        open: true,
        message: 'Dashboard data refreshed successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      
      // Try fallback to basic stats endpoint if dashboard endpoint fails
      try {
        const fallbackResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/stats`);
        setStats(fallbackResponse.data);
        setSnackbar({
          open: true,
          message: 'Basic stats loaded (some features unavailable)',
          severity: 'warning'
        });
      } catch (fallbackErr) {
        console.error('Fallback stats also failed:', fallbackErr);
        setError('Failed to load dashboard data. Please try again.');
        setSnackbar({
          open: true,
          message: `Error: ${err.response?.data?.msg || 'Failed to connect to the server'}`,
          severity: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Redirect if not authenticated or not an admin
    if (!isAuthenticated || (user && !user.isAdmin)) {
      navigate('/admin/login');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (isAuthenticated && user && user.isAdmin) {
      fetchStats();
    }
  }, [isAuthenticated, user]);

  // If not authenticated or not admin, show nothing while redirecting
  if (!isAuthenticated || !user || !user.isAdmin) {
    return null;
  }

  const handleRefresh = () => {
    setLoading(true);
    fetchStats();
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="h4" component="h1" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Welcome back, {user.username}
          </Typography>
        </div>
        <Tooltip title="Refresh Dashboard Data">
          <IconButton 
            onClick={handleRefresh} 
            disabled={loading}
            color="primary"
            size="large"
          >
            {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
          {error}
        </Paper>
      ) : (
        <>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PeopleIcon color="primary" sx={{ mr: 1 }} />
                    <Typography color="text.secondary" gutterBottom>
                      Total Users
                    </Typography>
                  </Box>
                  <Typography variant="h4" component="div">
                    {stats.users}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Registered accounts in the system
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => navigate('/admin/users')}
                  >
                    View All Users
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ArticleIcon color="primary" sx={{ mr: 1 }} />
                    <Typography color="text.secondary" gutterBottom>
                      Total Posts
                    </Typography>
                  </Box>
                  <Typography variant="h4" component="div">
                    {stats.posts}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Published articles on the platform
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => navigate('/admin/posts')}
                  >
                    View All Posts
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ArticleIcon color="primary" sx={{ mr: 1 }} />
                    <Typography color="text.secondary" gutterBottom>
                      Total Comments
                    </Typography>
                  </Box>
                  <Typography variant="h4" component="div">
                    {stats.comments}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    User interactions across all posts
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => navigate('/admin/comments')}
                  >
                    View All Comments
                  </Button>
                </CardActions>
              </Card>
            </Grid>


            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <NotificationsIcon color="primary" sx={{ mr: 1 }} />
                    <Typography color="text.secondary" gutterBottom>
                      Pending Notifications
                    </Typography>
                  </Box>
                  <Typography variant="h4" component="div">
                    {stats.notifications}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Unread notifications in the system
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => navigate('/admin/notifications')}
                  >
                    View Notifications
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>

          {/* Admin Actions */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List>
                  <ListItem 
                    button 
                    onClick={() => navigate('/admin/users')}
                  >
                    <ListItemIcon>
                      <PeopleIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Manage Users" 
                      secondary="View, edit and manage user accounts"
                    />
                  </ListItem>
                  <ListItem 
                    button 
                    onClick={() => navigate('/admin/posts')}
                  >
                    <ListItemIcon>
                      <ArticleIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Manage Posts" 
                      secondary="Edit, delete or create new posts"
                    />
                  </ListItem>
                  <ListItem 
                    button 
                    onClick={() => navigate('/admin/notifications')}
                  >
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Send Notifications" 
                      secondary="Create system-wide announcements"
                    />
                  </ListItem>
                  <ListItem 
                    button 
                    onClick={() => navigate('/admin/settings')}
                  >
                    <ListItemIcon>
                      <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Site Settings" 
                      secondary="Configure platform settings"
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List>
                  {Array.isArray(recentActivity.users) ? recentActivity.users.map((activity, index) => (
                    <ListItem key={`user-${index}`}>
                      <ListItemText 
                        primary={`New user: ${activity.username}`} 
                        secondary={new Date(activity.createdAt).toLocaleDateString()} 
                      />
                    </ListItem>
                  )) : null}
                  
                  {Array.isArray(recentActivity.posts) ? recentActivity.posts.map((activity, index) => (
                    <ListItem key={`post-${index}`}>
                      <ListItemText 
                        primary={`New post: ${activity.title}`} 
                        secondary={`By ${activity.author?.username} on ${new Date(activity.createdAt).toLocaleDateString()}`} 
                      />
                    </ListItem>
                  )) : null}
                  
                  {Array.isArray(recentActivity.comments) ? recentActivity.comments.map((activity, index) => (
                    <ListItem key={`comment-${index}`}>
                      <ListItemText 
                        primary={`New comment on "${activity.post?.title}"`} 
                        secondary={`By ${activity.user?.username} on ${new Date(activity.date).toLocaleDateString()}`} 
                      />
                    </ListItem>
                  )) : null}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default AdminDashboard;
