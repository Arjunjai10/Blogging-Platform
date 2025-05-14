import React, { useState, useEffect, useContext, useMemo, useCallback, Suspense, lazy } from 'react';
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
  IconButton,
  Skeleton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PostContext } from '../context/PostContext';
import { SettingsContext } from '../context/SettingsContext';
import { format } from 'date-fns';
import { alpha } from '@mui/material/styles';

// Lazy load PostCard component
const PostCard = lazy(() => import('../components/posts/PostCard'));

// Loading fallback component
const PostCardSkeleton = () => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Skeleton variant="rectangular" height={200} />
    <CardContent>
      <Skeleton variant="text" height={40} />
      <Skeleton variant="text" height={20} />
      <Skeleton variant="text" height={20} />
    </CardContent>
  </Card>
);

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const { addBookmark, removeBookmark, isBookmarked, sharePost } = useContext(PostContext);
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
  const [sortOption, setSortOption] = useState('newest');
  const [imageErrors, setImageErrors] = useState({});
  
  const postsPerPage = 6;
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  // Memoize formatDate function
  const formatDate = useCallback((dateString) => {
    try {
      if (!dateString) return 'Unknown date';
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Unknown date';
    }
  }, []);
  
  // Memoize truncateText function
  const truncateText = useCallback((text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }, []);

  // Memoize filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      if (!post || !post.title || !post.content) return false;
      
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           post.content.toLowerCase().includes(searchTerm.toLowerCase());
      const selectedCategory = categories[activeTab];
      const matchesCategory = selectedCategory === 'all' || 
                             (post.categories && post.categories.includes(selectedCategory));
      
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
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
  }, [posts, searchTerm, categories, activeTab, sortOption]);

  // Memoize current posts
  const currentPosts = useMemo(() => {
    const indexOfLastPost = page * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    return filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  }, [filteredPosts, page, postsPerPage]);

  // Memoize handlers
  const handlePageChange = useCallback((event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Debounce search with proper cleanup
  const debouncedSearch = useCallback((value) => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(value);
      setPage(1);
    }, 300);
    return timeoutId;
  }, []);

  // Handle search input change with cleanup
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    const timeoutId = debouncedSearch(value);
    return () => clearTimeout(timeoutId);
  }, [debouncedSearch]);

  const handleSortChange = useCallback((e) => {
    setSortOption(e.target.value);
    setPage(1);
  }, []);

  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
    setPage(1);
  }, []);

  const handleBookmark = useCallback(async (postId) => {
    if (!postId) return;
    
    if (isBookmarked(postId)) {
      await removeBookmark(postId);
    } else {
      await addBookmark(postId);
    }
  }, [isBookmarked, addBookmark, removeBookmark]);

  const handleShare = useCallback(async (post) => {
    if (!post) return;
    
    const result = await sharePost(post);
    if (result === 'copied') {
      alert('Link copied to clipboard!');
    }
  }, [sharePost]);

  const handleNextCarousel = useCallback(() => {
    setCarouselIndex((prevIndex) => 
      prevIndex === featuredPosts.length - 1 ? 0 : prevIndex + 1
    );
  }, [featuredPosts.length]);

  const handlePrevCarousel = useCallback(() => {
    setCarouselIndex((prevIndex) => 
      prevIndex === 0 ? featuredPosts.length - 1 : prevIndex - 1
    );
  }, [featuredPosts.length]);

  // Optimize image loading
  const [loadedImages, setLoadedImages] = useState({});
  const handleImageLoad = useCallback((imageUrl) => {
    setLoadedImages(prev => ({ ...prev, [imageUrl]: true }));
  }, []);

  // Optimize carousel transitions
  const carouselStyle = useMemo(() => ({
    display: 'flex',
    transition: 'transform 0.5s ease',
    transform: `translateX(-${carouselIndex * (100 / (isMobile ? 1 : isTablet ? 2 : 3))}%)`,
    willChange: 'transform'
  }), [carouselIndex, isMobile, isTablet]);

  // Optimize grid layout
  const gridContainerStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, 1fr)',
      md: 'repeat(3, 1fr)'
    },
    gap: theme.spacing(4)
  }), [theme]);

  // Optimize featured post background
  const featuredPostStyle = useMemo(() => ({
    position: 'relative',
    mb: 4,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundImage: featuredPosts[0]?.image ? `url(${featuredPosts[0].image})` : 'none',
    borderRadius: 2,
    overflow: 'hidden',
    willChange: 'transform'
  }), [featuredPosts]);

  // Add this handler function with other handlers
  const handleImageError = useCallback((imageUrl) => {
    setImageErrors(prev => ({ ...prev, [imageUrl]: true }));
  }, []);

  // Add this helper function near the top of the component
  const getImageUrl = useCallback((imagePath) => {
    if (!imagePath) return null;
    // If the image path is already a full URL, return it
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // Otherwise, prepend the API base URL
    return `${API_BASE_URL}/${imagePath.replace(/^\//, '')}`;
  }, [API_BASE_URL]);

  // Fetch posts with error handling
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

  // Update total pages when filtered posts change
  useEffect(() => {
    const totalFilteredPages = Math.ceil(filteredPosts.length / postsPerPage);
    setTotalPages(totalFilteredPages || 1);
    if (page > totalFilteredPages) {
      setPage(1);
    }
  }, [filteredPosts.length, page, postsPerPage]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      // Cleanup any pending timeouts when component unmounts
      const timeouts = window.timeouts || [];
      timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section with Featured Post */}
      {featuredPosts.length > 0 && (
        <Paper sx={featuredPostStyle}>
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
            <Box sx={carouselStyle}>
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
                      loading="lazy"
                      onLoad={() => handleImageLoad(post.image)}
                      onError={() => handleImageError(post.image)}
                      sx={{
                        opacity: loadedImages[post.image] ? 1 : 0,
                        transition: 'opacity 0.3s ease'
                      }}
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
              value={sortOption}
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
            {trendingPosts.map(post => {
              const imageUrl = getImageUrl(post.image);
              return (
              <Grid key={post._id} sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {imageUrl && !imageErrors[imageUrl] ? (
                    <CardMedia
                      component="img"
                        height="140"
                        image={imageUrl}
                      alt={post.title}
                        loading="lazy"
                        onLoad={() => handleImageLoad(imageUrl)}
                        onError={() => handleImageError(imageUrl)}
                        sx={{
                          opacity: loadedImages[imageUrl] ? 1 : 0,
                          transition: 'opacity 0.3s ease',
                          objectFit: 'cover',
                          height: 140,
                          width: '100%'
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 140,
                          bgcolor: 'grey.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%'
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {imageErrors[imageUrl] ? 'Image failed to load' : 'No Image'}
                        </Typography>
                      </Box>
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="h3" noWrap>
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
                      <Button 
                        size="small" 
                        component={RouterLink} 
                        to={`/posts/${post._id}`}
                        fullWidth
                      >
                      Read More
                    </Button>
                  </Box>
                </Card>
              </Grid>
              );
            })}
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
          
          <Box sx={gridContainerStyle}>
            {currentPosts.map(post => (
              <Box key={post._id}>
                <Suspense fallback={<PostCardSkeleton />}>
                <PostCard 
                  post={{
                    ...post,
                    bookmarked: isBookmarked(post._id)
                  }}
                  onBookmark={handleBookmark}
                  onShare={handleShare}
                />
                </Suspense>
              </Box>
            ))}
          </Box>

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
      {/* Advertisement Container */}
      <Paper
        sx={{
          mt: 6,
          p: { xs: 3, md: 4 },
          backgroundColor: theme => alpha(theme.palette.secondary.main, 0.05),
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <Box 
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: 'rgba(0,0,0,0.1)',
            px: 1,
            borderRadius: 1,
            fontSize: '0.75rem'
          }}
        >
          <Typography variant="caption" color="text.secondary">Ad</Typography>
        </Box>
        <Grid container spacing={3} alignItems="center">
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Premium <span className="echo">Skill</span><span className="ridge">Elivatave</span> Membership
            </Typography>
            <Typography variant="body1" paragraph>
              Unlock exclusive content, premium features, and join our community of passionate readers and writers.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button 
                variant="contained" 
                color="primary"
                size="large"
                sx={{ fontWeight: 'bold', px: 3 }}
              >
                Join Now
              </Button>
              <Button 
                variant="outlined" 
                color="primary"
                size="large"
              >
                Learn More
              </Button>
            </Box>
          </Grid>
          <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' }, display: 'flex', justifyContent: 'center' }}>
            <Box 
              component="img"
              src="/DB.gif"
              alt="Premium Membership"
              sx={{
                maxWidth: '100%',
                height: 'auto',
                maxHeight: 250,
                objectFit: 'contain',
                borderRadius: 2,
                boxShadow: 3
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Site Info from Settings */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          {settings && settings.general ? settings.general.siteName : 'EchoRidge'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          {settings && settings.general ? settings.general.siteDescription : 'We were Happy To Have You All Here!'}
        </Typography>
      </Box>
    </Container>
  );
};

export default React.memo(Home);