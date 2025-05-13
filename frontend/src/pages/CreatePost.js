import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
  IconButton,
  Divider,
  FormHelperText
} from '@mui/material';
// Simple textarea-based editor instead of rich text editor
import { AuthContext } from '../context/AuthContext';

const CreatePost = () => {
  // No need for editor state with simple textarea
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categories: [],
    tags: [],
    status: 'published',
    metaDescription: '',
    metaKeywords: '',
    excerpt: '',
    layout: 'standard',
    allowComments: true,
    featured: false,
    scheduledPublish: false,
    publishDate: new Date()
  });
  const [categoryInput, setCategoryInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  // Editor modules removed as we're using simple textarea
  /*const [editorModules] = useState({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image'],
      [{ 'align': [] }],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  });*/
  
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Simplified editor change handler for textarea
  const handleEditorChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      content: value
    });
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleDateChange = (newDate) => {
    setFormData({
      ...formData,
      publishDate: newDate
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
    
    // Check if content is empty
    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    }
    
    if (formData.metaDescription && formData.metaDescription.length > 160) {
      errors.metaDescription = 'Meta description should be 160 characters or less';
    }
    
    if (formData.scheduledPublish && !formData.publishDate) {
      errors.publishDate = 'Publish date is required when scheduling';
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
      
      // Determine status based on scheduled publishing
      const status = formData.scheduledPublish ? 'scheduled' : formData.status;
      postData.append('status', status);
      
      // Add all the new fields
      postData.append('metaDescription', formData.metaDescription);
      postData.append('metaKeywords', formData.metaKeywords);
      postData.append('excerpt', formData.excerpt);
      postData.append('layout', formData.layout);
      postData.append('allowComments', formData.allowComments);
      postData.append('featured', formData.featured);
      
      if (formData.scheduledPublish) {
        postData.append('publishDate', formData.publishDate.toISOString());
      }
      
      if (formData.categories.length > 0) {
        postData.append('categories', JSON.stringify(formData.categories));
      }
      
      if (formData.tags.length > 0) {
        postData.append('tags', JSON.stringify(formData.tags));
      }
      
      if (image) {
        postData.append('image', image);
      }
      
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${API_BASE_URL}/api/posts`, postData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setLoading(false);
      navigate(`/posts/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error creating post');
      setLoading(false);
    }
  };
  
  if (!isAuthenticated) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          You must be logged in to create a post.
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Post
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="post editor tabs">
            <Tab label="Content" />
            <Tab label="SEO & Meta" />
            <Tab label="Settings" />
            <Tab label="Media" />
          </Tabs>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          {/* Content Tab */}
          {activeTab === 0 && (
            <>
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
                <Typography variant="subtitle1" gutterBottom>
                  Content
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={12}
                  name="content"
                  value={formData.content}
                  onChange={handleEditorChange}
                  error={!!formErrors.content}
                  placeholder="Write your post content here..."
                  sx={{
                    mb: 1,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: formErrors.content ? '#d32f2f' : '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: formErrors.content ? '#d32f2f' : '#bdbdbd',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: formErrors.content ? '#d32f2f' : '#1976d2',
                      },
                    },
                    '& .MuiInputBase-input': {
                      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                      fontSize: '1rem',
                      lineHeight: 1.5,
                      letterSpacing: '0.00938em',
                    },
                  }}
                  InputProps={{
                    sx: {
                      padding: '12px',
                      backgroundColor: '#fafafa',
                    }
                  }}
                />
                {formErrors.content && (
                  <FormHelperText error>{formErrors.content}</FormHelperText>
                )}
              </Box>

              <TextField
                fullWidth
                label="Excerpt (Optional)"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={3}
                helperText="A short summary of your post. If left empty, an excerpt will be generated from your content."
              />

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
            </>
          )}

          {/* SEO & Meta Tab */}
          {activeTab === 1 && (
            <>
              <TextField
                fullWidth
                label="Meta Description"
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={3}
                error={!!formErrors.metaDescription}
                helperText={formErrors.metaDescription || "A brief description of your post for search engines. Recommended length: 150-160 characters."}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" color={formData.metaDescription.length > 160 ? 'error' : 'text.secondary'}>
                  {formData.metaDescription.length}/160 characters
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Meta Keywords"
                name="metaKeywords"
                value={formData.metaKeywords}
                onChange={handleChange}
                margin="normal"
                helperText="Comma-separated keywords for search engines (e.g., blogging, technology, coding)"
              />

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  SEO Preview
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="subtitle1" color="primary" gutterBottom noWrap>
                    {formData.title || "Your Post Title"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {formData.metaDescription || "Your meta description will appear here. It should be concise and descriptive to improve SEO."}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    yourblog.com/posts/{formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')}
                  </Typography>
                </Paper>
              </Box>
            </>
          )}

          {/* Settings Tab */}
          {activeTab === 2 && (
            <>
              <FormControl fullWidth margin="normal">
                <InputLabel>Post Layout</InputLabel>
                <Select
                  name="layout"
                  value={formData.layout}
                  onChange={handleChange}
                  label="Post Layout"
                >
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="wide">Wide</MenuItem>
                  <MenuItem value="full-width">Full Width</MenuItem>
                  <MenuItem value="sidebar-right">With Right Sidebar</MenuItem>
                  <MenuItem value="sidebar-left">With Left Sidebar</MenuItem>
                </Select>
                <FormHelperText>Select the layout style for this post</FormHelperText>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                  disabled={formData.scheduledPublish}
                >
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="private">Private</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ mt: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.scheduledPublish}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          scheduledPublish: e.target.checked
                        });
                      }}
                      name="scheduledPublish"
                    />
                  }
                  label="Schedule for later"
                />

                {formData.scheduledPublish && (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      label="Publish Date"
                      type="datetime-local"
                      value={formData.publishDate instanceof Date ? formData.publishDate.toISOString().slice(0, 16) : ''}
                      onChange={(e) => handleDateChange(new Date(e.target.value))}
                      fullWidth
                      error={!!formErrors.publishDate}
                      helperText={formErrors.publishDate}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: new Date().toISOString().slice(0, 16) }}
                    />
                  </Box>
                )}
              </Box>

              <Box sx={{ mt: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.allowComments}
                      onChange={handleChange}
                      name="allowComments"
                    />
                  }
                  label="Allow comments"
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.featured}
                      onChange={handleChange}
                      name="featured"
                    />
                  }
                  label="Mark as featured post"
                />
              </Box>
            </>
          )}

          {/* Media Tab */}
          {activeTab === 3 && (
            <>
              <Box sx={{ mt: 2, mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Cover Image
                </Typography>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="image-upload">
                  <Button variant="contained" component="span" sx={{ mb: 2 }}>
                    {image ? 'Change Cover Image' : 'Upload Cover Image'}
                  </Button>
                </label>

                {imagePreview ? (
                  <Box sx={{ mt: 2, position: 'relative' }}>
                    <img
                      src={imagePreview}
                      alt="Cover Preview"
                      style={{
                        width: '100%',
                        maxHeight: '400px',
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                      }}
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                      }}
                    >
                      ✕
                    </IconButton>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: '200px',
                      border: '2px dashed #ccc',
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      bgcolor: '#f8f8f8'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No cover image selected
                    </Typography>
                  </Box>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Recommended size: 1200 x 630 pixels (16:9 ratio)
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" gutterBottom>
                Image Settings
              </Typography>

              <FormControl fullWidth margin="normal">
                <InputLabel>Featured Image Position</InputLabel>
                <Select
                  name="imagePosition"
                  value={formData.imagePosition || 'top'}
                  onChange={handleChange}
                  label="Featured Image Position"
                  disabled={!image}
                >
                  <MenuItem value="top">Top of post</MenuItem>
                  <MenuItem value="banner">Full-width banner</MenuItem>
                  <MenuItem value="background">Background with text overlay</MenuItem>
                  <MenuItem value="side">Side of content</MenuItem>
                  <MenuItem value="hidden">Hidden (don't display)</MenuItem>
                </Select>
                <FormHelperText>How the cover image should be displayed</FormHelperText>
              </FormControl>
            </>
          )}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
            
            <Box>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{ ml: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : formData.scheduledPublish ? 'Schedule Post' : formData.status === 'draft' ? 'Save Draft' : 'Publish Post'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreatePost;
