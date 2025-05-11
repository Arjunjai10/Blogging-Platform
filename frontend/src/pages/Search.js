import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  CircularProgress, 
  Alert, 
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import PostCard from '../components/posts/PostCard';
import { PostContext } from '../context/PostContext';
import axios from 'axios';

const Search = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';
  
  const { addBookmark, removeBookmark, isBookmarked, sharePost } = useContext(PostContext);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get API base URL from environment or default to localhost
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  const searchPosts = useCallback(async (query) => {
    if (!query.trim()) return;
    
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/posts/search?q=${encodeURIComponent(query)}`);
      setPosts(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error searching posts');
      setLoading(false);
    }
  }, [API_BASE_URL]);
  
  useEffect(() => {
    if (initialQuery) {
      searchPosts(initialQuery);
    }
  }, [initialQuery, searchPosts]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Update URL with search query
      const newUrl = `/search?q=${encodeURIComponent(searchQuery)}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
      searchPosts(searchQuery);
    }
  };
  
  const handleClear = () => {
    setSearchQuery('');
    setPosts([]);
    window.history.pushState({ path: '/search' }, '', '/search');
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
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Search Posts
      </Typography>
      
      <Paper component="form" onSubmit={handleSearch} sx={{ p: 2, mb: 4, display: 'flex', alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton onClick={handleClear} edge="end">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Paper>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : posts.length > 0 ? (
        <>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Found {posts.length} {posts.length === 1 ? 'result' : 'results'} for "{initialQuery}"
          </Typography>
          <Grid container spacing={3}>
            {posts.map(post => (
              <Grid key={post._id} xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
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
        </>
      ) : initialQuery ? (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No posts found for "{initialQuery}"
          </Typography>
        </Box>
      ) : null}
    </Container>
  );
};

export default Search;
