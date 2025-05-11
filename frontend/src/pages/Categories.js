import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  CircularProgress, 
  Alert, 
  Chip,
  Paper,
  Grid
} from '@mui/material';
import PostCard from '../components/posts/PostCard';
import { PostContext } from '../context/PostContext';
import axios from 'axios';

const Categories = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const { addBookmark, removeBookmark, isBookmarked, sharePost } = useContext(PostContext);
  
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get API base URL from environment or default to localhost
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  // Fetch all categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/posts/categories`);
        setCategories(res.data);
      } catch (err) {
        setError('Failed to fetch categories');
        console.error(err);
      }
    };
    
    fetchCategories();
  }, [API_BASE_URL]);
  
  // Fetch posts by category or all posts if no category is selected
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        let res;
        
        if (category) {
          res = await axios.get(`${API_BASE_URL}/api/posts/category/${category}`);
        } else {
          res = await axios.get(`${API_BASE_URL}/api/posts`);
        }
        
        setPosts(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.msg || 'Error fetching posts');
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [category, API_BASE_URL]);
  
  const handleCategoryClick = (categoryName) => {
    navigate(`/category/${categoryName}`);
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
        {category ? `Posts in ${category}` : 'Categories'}
      </Typography>
      
      <Paper sx={{ p: 2, mb: 4, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {categories.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            onClick={() => handleCategoryClick(cat)}
            color={category === cat ? 'primary' : 'default'}
            clickable
            variant={category === cat ? 'filled' : 'outlined'}
          />
        ))}
      </Paper>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : posts.length > 0 ? (
        <Grid container spacing={3}>
          {posts.map(post => (
            <Grid key={post._id} xs={12} sm={6} md={4} item>
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
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {category ? `No posts found in ${category}` : 'No posts found'}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Categories;
