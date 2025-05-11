import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ENDPOINTS } from '../config/api';
import {
  Container,
  Typography,
  Box,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Tabs,
  Tab,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import PostCard from '../components/posts/PostCard';
import { AuthContext } from '../context/AuthContext';
import { PostContext } from '../context/PostContext';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Profile = () => {
  const { id } = useParams();
  const { user, followUser, unfollowUser, isFollowing } = useContext(AuthContext);
  const { addBookmark, removeBookmark, isBookmarked, sharePost } = useContext(PostContext);
  
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  
  // Get API base URL from environment or default to localhost
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/users/${id}`);
        setProfile(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.msg || 'Error fetching profile');
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [id, API_BASE_URL]);
  
  // Fetch followers and following counts
  useEffect(() => {
    const fetchFollowData = async () => {
      if (!id) return;
      
      try {
        // Get followers
        const followersRes = await axios.get(ENDPOINTS.USERS.FOLLOWERS(id));
        setFollowersCount(followersRes.data.length);
        setFollowers(followersRes.data);
        
        // Get following
        const followingRes = await axios.get(ENDPOINTS.USERS.FOLLOWING(id));
        setFollowingCount(followingRes.data.length);
        setFollowing(followingRes.data);
      } catch (err) {
        console.error('Error fetching follow data:', err);
      }
    };
    
    fetchFollowData();
  }, [id, API_BASE_URL]);
  
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!id) return;
      
      try {
        const res = await axios.get(`${API_BASE_URL}/api/posts/user/${id}`);
        setPosts(res.data);
      } catch (err) {
        console.error('Error fetching user posts:', err);
        // Don't set error state here to avoid overriding profile errors
      }
    };
    
    fetchUserPosts();
  }, [id, API_BASE_URL]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleBookmark = async (postId) => {
    if (isBookmarked(postId)) {
      await removeBookmark(postId);
    } else {
      await addBookmark(postId);
    }
  };
  
  const handleShare = async (post) => {
    const result = await sharePost(post);
    if (result === 'copied') {
      alert('Link copied to clipboard!');
    }
  };
  
  const handleFollow = async () => {
    if (!user) return;
    
    setFollowLoading(true);
    try {
      if (isFollowing(id)) {
        await unfollowUser(id);
        setFollowersCount(prev => prev - 1);
      } else {
        await followUser(id);
        setFollowersCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Follow action failed:', err);
    } finally {
      setFollowLoading(false);
    }
  };
  
  const openFollowersDialog = () => {
    setFollowersDialogOpen(true);
  };
  
  const openFollowingDialog = () => {
    setFollowingDialogOpen(true);
  };
  
  const closeFollowersDialog = () => {
    setFollowersDialogOpen(false);
  };
  
  const closeFollowingDialog = () => {
    setFollowingDialogOpen(false);
  };
  
  const isOwnProfile = user && profile && user._id === profile._id;
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  
  if (!profile) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">Profile not found</Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', mb: 3 }}>
          <Avatar
            src={profile.profilePicture ? 
              (profile.profilePicture.startsWith('http') ? 
                profile.profilePicture : 
                `${API_BASE_URL}${profile.profilePicture}`
              ) : 
              ''
            }
            alt={profile.username}
            sx={{ 
              width: { xs: 100, sm: 150 }, 
              height: { xs: 100, sm: 150 },
              mr: { xs: 0, sm: 4 },
              mb: { xs: 2, sm: 0 }
            }}
          />
          
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {profile.username}
              </Typography>
              
              {!isOwnProfile && user && (
                <Button 
                  variant={isFollowing(id) ? "outlined" : "contained"}
                  color="primary"
                  onClick={handleFollow}
                  disabled={followLoading}
                >
                  {isFollowing(id) ? "Unfollow" : "Follow"}
                </Button>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', mb: 2 }}>
              <Chip 
                label={`${followersCount} Followers`} 
                variant="outlined" 
                onClick={openFollowersDialog}
                sx={{ mr: 1, cursor: 'pointer' }}
              />
              <Chip 
                label={`${followingCount} Following`} 
                variant="outlined" 
                onClick={openFollowingDialog}
                sx={{ cursor: 'pointer' }}
              />
            </Box>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              {profile.email}
            </Typography>
            
            <Typography variant="body1" paragraph>
              {profile.bio || 'No bio available'}
            </Typography>
            
            <Typography variant="caption" color="text.secondary">
              Member since {new Date(profile.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
          <Tab label="Posts" id="profile-tab-0" aria-controls="profile-tabpanel-0" />
          <Tab label="About" id="profile-tab-1" aria-controls="profile-tabpanel-1" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        {posts.length > 0 ? (
          <Grid container spacing={3}>
            {posts.map(post => (
              <Grid key={post._id} xs={12} sm={6} md={4}>
                <PostCard 
                  post={{
                    ...post,
                    bookmarked: isBookmarked(post._id)
                  }}
                  onBookmark={handleBookmark}
                  onShare={handleShare}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {isOwnProfile ? 'You haven\'t published any posts yet.' : 'This user hasn\'t published any posts yet.'}
            </Typography>
          </Box>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>About {profile.username}</Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Typography variant="body1" paragraph>
            {profile.bio || 'No bio available'}
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom>Contact</Typography>
          <Typography variant="body2" color="text.secondary">
            {profile.email}
          </Typography>
        </Paper>
      </TabPanel>
      
      {/* Followers Dialog */}
      <Dialog open={followersDialogOpen} onClose={closeFollowersDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Followers</DialogTitle>
        <DialogContent>
          {followers.length > 0 ? (
            <List>
              {followers.map(follower => (
                <ListItem key={follower._id} component={Link} to={`/profile/${follower._id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                  <ListItemAvatar>
                    <Avatar 
                      src={follower.profilePicture ? 
                        (follower.profilePicture.startsWith('http') ? 
                          follower.profilePicture : 
                          `${API_BASE_URL}${follower.profilePicture}`
                        ) : 
                        ''
                      }
                      alt={follower.username}
                    />
                  </ListItemAvatar>
                  <ListItemText 
                    primary={follower.username}
                    secondary={follower.bio ? (follower.bio.length > 50 ? `${follower.bio.substring(0, 50)}...` : follower.bio) : 'No bio available'}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1" align="center" sx={{ py: 3 }}>
              No followers yet
            </Typography>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Following Dialog */}
      <Dialog open={followingDialogOpen} onClose={closeFollowingDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Following</DialogTitle>
        <DialogContent>
          {following.length > 0 ? (
            <List>
              {following.map(followedUser => (
                <ListItem key={followedUser._id} component={Link} to={`/profile/${followedUser._id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                  <ListItemAvatar>
                    <Avatar 
                      src={followedUser.profilePicture ? 
                        (followedUser.profilePicture.startsWith('http') ? 
                          followedUser.profilePicture : 
                          `${API_BASE_URL}${followedUser.profilePicture}`
                        ) : 
                        ''
                      }
                      alt={followedUser.username}
                    />
                  </ListItemAvatar>
                  <ListItemText 
                    primary={followedUser.username}
                    secondary={followedUser.bio ? (followedUser.bio.length > 50 ? `${followedUser.bio.substring(0, 50)}...` : followedUser.bio) : 'No bio available'}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1" align="center" sx={{ py: 3 }}>
              Not following anyone yet
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Profile;
