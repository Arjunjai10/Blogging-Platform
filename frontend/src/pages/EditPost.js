import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  InputLabel
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categories: [],
    tags: [],
    status: 'published'
  });
  const [categoryInput, setCategoryInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  
  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setFetchLoading(true);
        const res = await axios.get(`http://localhost:5000/api/posts/${id}`);
        
        // Check if user is the author
        if (user && res.data.author._id !== user._id) {
          setError('You are not authorized to edit this post');
          setFetchLoading(false);
          return;
        }
        
        setFormData({
          title: res.data.title,
          content: res.data.content,
          categories: res.data.categories,
          tags: res.data.tags || [],
          status: res.data.status
        });
        
        if (res.data.image) {
          setCurrentImage(res.data.image);
          setImagePreview(`http://localhost:5000${res.data.image}`);
        }
        
        setFetchLoading(false);
      } catch (err) {
        setError(err.response?.data?.msg || 'Error fetching post');
        setFetchLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchPost();
    }
  }, [id, isAuthenticated, user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const handleAddCategory = () => {
    if (categoryInput.trim() && !formData.categories.includes(categoryInput.trim())) {
      setFormData({
        ...formData,
        categories: [...formData.categories, categoryInput.trim()]
      });
      setCategoryInput('');
    }
  };
  
  const handleRemoveCategory = (category) => {
    setFormData({
      ...formData,
      categories: formData.categories.filter(c => c !== category)
    });
  };
  
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };
  
  const validate = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      setLoading(true);
      
      const postData = new FormData();
      postData.append('title', formData.title);
      postData.append('content', formData.content);
      postData.append('status', formData.status);
      
      if (formData.categories.length > 0) {
        postData.append('categories', JSON.stringify(formData.categories));
      }
      
      if (formData.tags.length > 0) {
        postData.append('tags', JSON.stringify(formData.tags));
      }
      
      if (image) {
        postData.append('image', image);
      }
      
      await axios.put(`http://localhost:5000/api/posts/${id}`, postData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setLoading(false);
      navigate(`/posts/${id}`);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error updating post');
      setLoading(false);
    }
  };
  
  if (!isAuthenticated) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          You must be logged in to edit a post.
        </Alert>
      </Container>
    );
  }
  
  if (fetchLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Post
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            error={!!formErrors.title}
            helperText={formErrors.title}
            required
          />
          
          <Box sx={{ mt: 3, mb: 3 }}>
            <InputLabel htmlFor="image-upload" sx={{ mb: 1 }}>
              Featured Image (Optional)
            </InputLabel>
            <input
              accept="image/*"
              id="image-upload"
              type="file"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="image-upload">
              <Button variant="outlined" component="span">
                {currentImage ? 'Change Image' : 'Upload Image'}
              </Button>
            </label>
            
            {imagePreview && (
              <Box sx={{ mt: 2 }}>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '300px',
                    borderRadius: '4px'
                  }} 
                />
              </Box>
            )}
          </Box>
          
          <Box sx={{ mt: 3, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Categories
            </Typography>
            <Box sx={{ display: 'flex', mb: 1 }}>
              <TextField
                label="Add category"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                size="small"
                sx={{ mr: 1 }}
              />
              <Button 
                variant="outlined" 
                onClick={handleAddCategory}
                disabled={!categoryInput.trim()}
              >
                Add
              </Button>
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
              {formData.categories.map((category, index) => (
                <Chip 
                  key={index} 
                  label={category} 
                  onDelete={() => handleRemoveCategory(category)} 
                />
              ))}
              {formData.categories.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No categories added (will use "Uncategorized")
                </Typography>
              )}
            </Stack>
          </Box>
          
          <Box sx={{ mt: 3, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Tags (Optional)
            </Typography>
            <Box sx={{ display: 'flex', mb: 1 }}>
              <TextField
                label="Add tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                size="small"
                sx={{ mr: 1 }}
              />
              <Button 
                variant="outlined" 
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                Add
              </Button>
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
              {formData.tags.map((tag, index) => (
                <Chip 
                  key={index} 
                  label={tag} 
                  onDelete={() => handleRemoveTag(tag)} 
                />
              ))}
              {formData.tags.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No tags added
                </Typography>
              )}
            </Stack>
          </Box>
          
          <TextField
            fullWidth
            label="Content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={10}
            error={!!formErrors.content}
            helperText={formErrors.content}
            required
          />
          
          <Box sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ mr: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Update Post'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(`/posts/${id}`)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditPost;
