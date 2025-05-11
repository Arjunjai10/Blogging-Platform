import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Pagination,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Chip,
  Avatar,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import PostCard from '../components/posts/PostCard';
import { PostContext } from '../context/PostContext';
import { SettingsContext } from '../context/SettingsContext';
import { format } from 'date-fns';
import { alpha } from '@mui/material/styles';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const { addBookmark, removeBookmark, isBookmarked, sharePost } = useContext(PostContext);
  // Use optional chaining to safely access settings context
  const settingsContext = useContext(SettingsContext);
  const settings = settingsContext?.settings;
  
  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [categories, setCategories] = useState(['all']);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [email, setEmail] = useState('');
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [subscribeError, setSubscribeError] = useState(null);
  const [sortOption, setSortOption] = useState('newest');
  
  const postsPerPage = 6;
  
  // Get API base URL from environment or default to localhost
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  // Format date for hero section
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Unknown date';
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Unknown date';
    }
  };
  
  // Truncate text helper function
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/posts`);
        const allPosts = res.data;
        setPosts(allPosts);
        
        // Extract unique categories
        const allCategories = ['all'];
        allPosts.forEach(post => {
          if (post && post.categories) {
            post.categories.forEach(cat => {
              if (!allCategories.includes(cat)) {
                allCategories.push(cat);
              }
            });
          }
        });
        setCategories(allCategories);
        
        // Set featured posts (most recent posts with images)
        const postsWithImages = allPosts.filter(post => post.image);
        const sortedByDate = [...postsWithImages].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setFeaturedPosts(sortedByDate.slice(0, 5));
        
        // Set trending posts (posts with most likes and comments)
        const sortedByEngagement = [...allPosts].sort((a, b) => {
          const aEngagement = (a.likes?.length || 0) + (a.comments?.length || 0);
          const bEngagement = (b.likes?.length || 0) + (b.comments?.length || 0);
          return bEngagement - aEngagement;
        });
        setTrendingPosts(sortedByEngagement.slice(0, 4));
        
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.msg || 'Error fetching posts');
        setLoading(false);
      }
    };

    fetchPosts();
  }, [API_BASE_URL]);

  // Filter posts based on search term and category
  const filteredPosts = posts.filter(post => {
    if (!post || !post.title || !post.content) return false;
    
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const selectedCategory = categories[activeTab];
    const matchesCategory = selectedCategory === 'all' || 
                           (post.categories && post.categories.includes(selectedCategory));
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    // Apply sorting based on selected option
    switch (sortOption) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'mostLiked':
        return (b.likes?.length || 0) - (a.likes?.length || 0);
      case 'mostCommented':
        return (b.comments?.length || 0) - (a.comments?.length || 0);
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // Pagination
  const indexOfLastPost = page * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalFilteredPages = Math.ceil(filteredPosts.length / postsPerPage);

  useEffect(() => {
    setTotalPages(totalFilteredPages || 1);
    // Reset to page 1 when filters change
    if (page > totalFilteredPages) {
      setPage(1);
    }
  }, [filteredPosts.length, totalFilteredPages, page]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  // Handle sort option change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setPage(1);
  };

  // Handle tab change for categories
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(1);
  };

  const handleBookmark = async (postId) => {
    if (!postId) return;
    
    if (isBookmarked(postId)) {
      await removeBookmark(postId);
    } else {
      await addBookmark(postId);
    }
  };

  const handleShare = async (post) => {
    if (!post) return;
    
    const result = await sharePost(post);
    if (result === 'copied') {
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Handle carousel navigation
  const handleNextCarousel = () => {
    setCarouselIndex((prevIndex) => 
      prevIndex === featuredPosts.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevCarousel = () => {
    setCarouselIndex((prevIndex) => 
      prevIndex === 0 ? featuredPosts.length - 1 : prevIndex - 1
    );
  };

  // Handle newsletter subscription
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setSubscribeError('Please enter a valid email address');
      return;
    }

    setSubscribeLoading(true);
    setSubscribeError(null);

    try {
      // This would typically call your newsletter subscription API
      // For now, we'll just simulate a successful subscription
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubscribeSuccess(true);
      setEmail('');
    } catch (err) {
      setSubscribeError('Failed to subscribe. Please try again.');
    } finally {
      setSubscribeLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section with Featured Post */}
      {featuredPosts.length > 0 && (
        <Paper
          sx={{
            position: 'relative',
            mb: 4,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundImage: `url(${featuredPosts[0].image})`,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              left: 0,
              backgroundColor: alpha('#000', 0.7),
            }}
          />
          <Grid container>
            <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
              <Box
                sx={{
                  position: 'relative',
                  p: { xs: 3, md: 6 },
                  pr: { md: 0 },
                }}
              >
                <Typography component="h1" variant="h3" color="white" gutterBottom>
                  {featuredPosts[0].title}
                </Typography>
                <Typography variant="h5" color="white" paragraph>
                  {truncateText(featuredPosts[0].content, 150)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    src={featuredPosts[0].author?.profilePicture}
                    alt={featuredPosts[0].author?.username || 'User'}
                    sx={{ width: 32, height: 32, mr: 1 }}
                  />
                  <Typography variant="subtitle1" color="white">
                    {featuredPosts[0].author?.username || 'Anonymous'} • {formatDate(featuredPosts[0].createdAt)}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to={`/posts/${featuredPosts[0]._id}`}
                  sx={{ mt: 2 }}
                >
                  Read More
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Featured Posts Carousel */}
      {featuredPosts.length > 1 && (
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h2">
              Featured Posts
            </Typography>
            <Box>
              <IconButton onClick={handlePrevCarousel} aria-label="previous">
                <ArrowBackIcon />
              </IconButton>
              <IconButton onClick={handleNextCarousel} aria-label="next">
                <ArrowForwardIcon />
              </IconButton>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ position: 'relative', overflow: 'hidden' }}>
            <Box
              sx={{
                display: 'flex',
                transition: 'transform 0.5s ease',
                transform: `translateX(-${carouselIndex * (100 / (isMobile ? 1 : isTablet ? 2 : 3))}%)`,
              }}
            >
              {featuredPosts.slice(1).map((post) => (
                <Box
                  key={post._id}
                  sx={{
                    flexShrink: 0,
                    width: { xs: '100%', sm: '50%', md: '33.333%' },
                    px: 1,
                  }}
                >
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={post.image}
                      alt={post.title}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h5" component="h2">
                        {post.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {truncateText(post.content, 100)}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(post.createdAt)}
                        </Typography>
                        <Chip
                          size="small"
                          label={post.categories && post.categories[0] ? post.categories[0] : 'Uncategorized'}
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between' }}>
                      <Button size="small" component={RouterLink} to={`/posts/${post._id}`}>
                        Read More
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => handleBookmark(post._id)}
                        color={isBookmarked(post._id) ? "primary" : "default"}
                      >
                        <BookmarkAddIcon />
                      </IconButton>
                    </Box>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* Search, Sort and Category Tabs */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Search posts"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
            <InputLabel id="sort-select-label">Sort By</InputLabel>
            <Select
              labelId="sort-select-label"
              value={sortOption || 'newest'}
              label="Sort By"
              onChange={handleSortChange}
            >
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="oldest">Oldest First</MenuItem>
              <MenuItem value="mostLiked">Most Liked</MenuItem>
              <MenuItem value="mostCommented">Most Commented</MenuItem>
              <MenuItem value="alphabetical">Alphabetical</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="category tabs"
        >
          {categories.map((cat, index) => (
            <Tab 
              key={index} 
              label={cat.charAt(0).toUpperCase() + cat.slice(1)} 
              id={`category-tab-${index}`}
              aria-controls={`category-tabpanel-${index}`}
            />
          ))}
        </Tabs>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

      {/* Trending Posts Section */}
      {trendingPosts.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <WhatshotIcon color="error" sx={{ mr: 1 }} />
            <Typography variant="h4" component="h2">
              Trending Now
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            {trendingPosts.map(post => (
              <Grid key={post._id} sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {post.image && (
                    <CardMedia
                      component="img"
                      height="100"
                      image={post.image}
                      alt={post.title}
                      sx={{ objectFit: 'cover' }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h3">
                      {post.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <TrendingUpIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                      <Typography variant="caption" color="text.secondary">
                        {(post.likes?.length || 0) + (post.comments?.length || 0)} engagements
                      </Typography>
                    </Box>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button size="small" component={RouterLink} to={`/posts/${post._id}`}>
                      Read More
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Main Posts Grid */}
      {filteredPosts.length === 0 ? (
        <Alert severity="info">No posts found matching your criteria.</Alert>
      ) : (
        <>
          <Typography variant="h4" component="h2" sx={{ mb: 3 }}>
            {categories[activeTab].charAt(0).toUpperCase() + categories[activeTab].slice(1)} Posts
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={4}>
            {currentPosts.map(post => (
              <Grid key={post._id} sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }}>
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

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
                size="large"
                showFirstButton 
                showLastButton
              />
            </Box>
          )}
        </>
      )}
      {/* Newsletter Subscription */}
      <Paper
        sx={{
          mt: 6,
          p: { xs: 3, md: 6 },
          backgroundColor: theme => alpha(theme.palette.primary.main, 0.05),
          borderRadius: 2,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 7' } }}>
            <Typography variant="h4" gutterBottom>
              Subscribe to our Newsletter
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Get the latest posts and updates delivered straight to your inbox. No spam, we promise!
            </Typography>
          </Grid>
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 5' } }}>
            <Box component="form" onSubmit={handleSubscribe} noValidate>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  variant="outlined"
                  value={email}
                  onChange={handleEmailChange}
                  error={!!subscribeError}
                  helperText={subscribeError}
                  disabled={subscribeLoading || subscribeSuccess}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={subscribeLoading || subscribeSuccess}
                  sx={{ height: { sm: 56 }, minWidth: { sm: 150 } }}
                >
                  {subscribeLoading ? <CircularProgress size={24} /> : subscribeSuccess ? 'Subscribed!' : 'Subscribe'}
                </Button>
              </Box>
              {subscribeSuccess && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Thank you for subscribing! You'll receive our next newsletter soon.
                </Alert>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Site Info from Settings */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          {settings && settings.general ? settings.general.siteName : 'MERN Blog'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          {settings && settings.general ? settings.general.siteDescription : 'A modern blog platform built with the MERN stack'}
        </Typography>
      </Box>
    </Container>
  );
};

export default Home;
