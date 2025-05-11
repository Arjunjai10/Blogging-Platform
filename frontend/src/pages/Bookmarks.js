import React, { useContext, useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Grid } from '@mui/material';
import PostCard from '../components/posts/PostCard';
import { PostContext } from '../context/PostContext';

const Bookmarks = () => {
  const { bookmarkedPosts, fetchBookmarkedPosts, loading, addBookmark, removeBookmark, isBookmarked, sharePost } = useContext(PostContext);
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    fetchBookmarkedPosts();
  }, [fetchBookmarkedPosts]);
  
  useEffect(() => {
    if (bookmarkedPosts && bookmarkedPosts.length > 0) {
      // Transform bookmarked posts with a bookmarked flag
      const formattedPosts = bookmarkedPosts.map(post => ({
        ...post,
        bookmarked: true
      }));
      setPosts(formattedPosts);
    } else {
      setPosts([]);
    }
  }, [bookmarkedPosts]);
  
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
      // You could show a snackbar here
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
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Your Bookmarks
      </Typography>
      
      {posts.length === 0 ? (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            You haven't bookmarked any posts yet.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {posts.map(post => (
            <Grid item key={post._id} xs={12} sm={6} md={4}>
              <PostCard 
                post={post} 
                onBookmark={handleBookmark} 
                onShare={handleShare}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Bookmarks;
