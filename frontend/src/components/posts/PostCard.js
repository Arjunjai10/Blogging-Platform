import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActions,
  Button,
  Box,
  Avatar,
  Chip,
  Stack,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareIcon from '@mui/icons-material/Share';
import { format } from 'date-fns';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  padding: '0rem',
  margin: '0rem',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8]
  }
}));

// Truncate content for preview
const truncateContent = (text, maxLength = 150) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// Format date safely
const formatDate = (dateString) => {
  try {
    if (!dateString) return 'Unknown date';
    return format(new Date(dateString), 'MMM d, yyyy');
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Unknown date';
  }
};

const PostCard = ({ post, onBookmark, onShare }) => {
  if (!post) {
    return null;
  }
  
  const {
    _id,
    title,
    content,
    image,
    author,
    categories,
    likes,
    comments,
    createdAt,
    bookmarked
  } = post;

  const handleShare = () => {
    if (onShare) {
      onShare(post);
    } else {
      // Fallback if no handler provided
      if (navigator.share) {
        navigator.share({
          title: title || 'Blog post',
          text: truncateContent(content || '', 100),
          url: window.location.origin + `/posts/${_id}`
        }).catch(err => console.error('Error sharing:', err));
      } else {
        // Copy link to clipboard
        navigator.clipboard.writeText(window.location.origin + `/posts/${_id}`)
          .then(() => alert('Link copied to clipboard!'))
          .catch(err => console.error('Error copying to clipboard:', err));
      }
    }
  };

  // Get API base URL from environment or default to localhost
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  return (
    <StyledCard>
      {image && (
        <CardMedia
          component="img"
          height="200"
          image={image.startsWith('http') ? image : `${API_BASE_URL}${image}`}
          alt={title || 'Blog post'}
        />
      )}
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={author?.profilePicture ? 
              (author.profilePicture.startsWith('http') ? 
                author.profilePicture : 
                `${API_BASE_URL}${author.profilePicture}`
              ) : 
              ''
            }
            alt={author?.username || 'User'}
            sx={{ width: 32, height: 32, mr: 1 }}
          />
          <Typography 
            variant="subtitle2" 
            component={RouterLink} 
            to={`/profile/${author?._id}`} 
            sx={{ textDecoration: 'none', color: 'inherit' }}
          >
            {author?.username || 'Anonymous'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
            {formatDate(createdAt)}
          </Typography>
        </Box>
        
        <Typography gutterBottom variant="h5" component="div">
          {title || 'Untitled Post'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {truncateContent(content || 'No content available')}
        </Typography>
        
        <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
          {categories && categories.map((category, index) => (
            <Chip 
              key={index} 
              label={category} 
              size="small" 
              component={RouterLink} 
              to={`/category/${category}`} 
              clickable 
            />
          ))}
        </Stack>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <FavoriteIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
            <Typography variant="body2">{likes ? likes.length : 0}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CommentIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
            <Typography variant="body2">{comments ? comments.length : 0}</Typography>
          </Box>
        </Box>
        <Box>
          <IconButton size="small" onClick={handleShare} aria-label="share">
            <ShareIcon fontSize="small" />
          </IconButton>
          {onBookmark && (
            <IconButton 
              size="small" 
              onClick={() => onBookmark(_id)}
              color={bookmarked ? "primary" : "default"}
              aria-label={bookmarked ? "remove bookmark" : "bookmark"}
            >
              {bookmarked ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
            </IconButton>
          )}
          <Button 
            size="small" 
            color="primary" 
            component={RouterLink} 
            to={`/posts/${_id}`}
            sx={{ ml: 1 }}
          >
            Read More
          </Button>
        </Box>
      </CardActions>
    </StyledCard>
  );
};

export default PostCard;
