import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Snackbar,
  Tabs,
  Tab,
  TextField,
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  Card,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

// TabPanel component for settings tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminSettings = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState({
    general: {
      siteName: 'MERN Blog',
      siteDescription: 'A modern blog platform built with the MERN stack',
      postsPerPage: 10,
      allowRegistration: true,
      requireEmailVerification: false,
      maintenanceMode: false
    },
    content: {
      allowComments: true,
      moderateComments: false,
      allowUserPosts: true,
      defaultCategory: 'Uncategorized',
      categories: ['Technology', 'Lifestyle', 'Travel', 'Food', 'Uncategorized']
    },
    email: {
      enableEmailNotifications: false,
      adminEmail: 'admin@example.com',
      emailService: 'smtp',
      smtpHost: '',
      smtpPort: '',
      smtpUser: '',
      smtpPassword: ''
    },
    advanced: {
      enableCache: true,
      cacheLifetime: 3600,
      debugMode: false,
      apiRateLimit: 100
    }
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle settings change
  const handleSettingChange = (section, setting, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [setting]: value
      }
    });
  };

  // Fetch settings
  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Initialize settings if they don't exist yet
      await axios.post('http://localhost:5000/api/settings/initialize', {}, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      // Fetch all settings
      const res = await axios.get('http://localhost:5000/api/settings');
      
      setSettings(res.data);
      setLoading(false);
      
      setSnackbar({
        open: true,
        message: 'Settings loaded successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err.response?.data?.msg || 'Error loading settings');
      setLoading(false);
      
      setSnackbar({
        open: true,
        message: 'Error loading settings',
        severity: 'error'
      });
    }
  };

  // Save settings
  const saveSettings = async () => {
    setSaving(true);
    setError(null);
    
    try {
      // Send settings to the API
      const res = await axios.post('http://localhost:5000/api/settings', settings, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        }
      });
      
      // Update local state with response
      setSettings(res.data);
      
      setSnackbar({
        open: true,
        message: 'Settings saved successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err.response?.data?.msg || 'Failed to save settings. Please try again.');
      setSnackbar({
        open: true,
        message: 'Error saving settings',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    // Redirect if not authenticated or not an admin
    if (!isAuthenticated || !user) {
      navigate('/admin/login');
      return;
    }
    
    if (!user.isAdmin) {
      navigate('/');
      return;
    }

    fetchSettings();
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || !user || !user.isAdmin) {
    return null; // Don't render anything while redirecting
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/admin/dashboard')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Site Settings
        </Typography>
        <Box flexGrow={1} />
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<RefreshIcon />}
          onClick={fetchSettings}
          disabled={loading || saving}
          sx={{ mr: 2 }}
        >
          Refresh
        </Button>
        <Button 
          variant="contained" 
          color="success" 
          startIcon={<SaveIcon />}
          onClick={saveSettings}
          disabled={loading || saving}
        >
          Save Changes
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="settings tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="General" />
              <Tab label="Content" />
              <Tab label="Email" />
              <Tab label="Advanced" />
            </Tabs>
          </Box>

          {/* General Settings */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Site Name"
                  value={settings.general.siteName}
                  onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Posts Per Page"
                  type="number"
                  value={settings.general.postsPerPage}
                  onChange={(e) => handleSettingChange('general', 'postsPerPage', parseInt(e.target.value))}
                  margin="normal"
                  InputProps={{ inputProps: { min: 1, max: 50 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Site Description"
                  value={settings.general.siteDescription}
                  onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>User Registration</Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.general.allowRegistration}
                        onChange={(e) => handleSettingChange('general', 'allowRegistration', e.target.checked)}
                      />
                    }
                    label="Allow New User Registration"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.general.requireEmailVerification}
                        onChange={(e) => handleSettingChange('general', 'requireEmailVerification', e.target.checked)}
                      />
                    }
                    label="Require Email Verification"
                  />
                </FormGroup>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Maintenance</Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.general.maintenanceMode}
                        onChange={(e) => handleSettingChange('general', 'maintenanceMode', e.target.checked)}
                      />
                    }
                    label="Enable Maintenance Mode"
                  />
                </FormGroup>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Content Settings */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Comments</Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.content.allowComments}
                        onChange={(e) => handleSettingChange('content', 'allowComments', e.target.checked)}
                      />
                    }
                    label="Allow Comments on Posts"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.content.moderateComments}
                        onChange={(e) => handleSettingChange('content', 'moderateComments', e.target.checked)}
                      />
                    }
                    label="Moderate Comments Before Publishing"
                  />
                </FormGroup>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>User Content</Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.content.allowUserPosts}
                        onChange={(e) => handleSettingChange('content', 'allowUserPosts', e.target.checked)}
                      />
                    }
                    label="Allow Users to Create Posts"
                  />
                </FormGroup>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="default-category-label">Default Category</InputLabel>
                  <Select
                    labelId="default-category-label"
                    value={settings.content.defaultCategory}
                    label="Default Category"
                    onChange={(e) => handleSettingChange('content', 'defaultCategory', e.target.value)}
                  >
                    {settings.content.categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Categories (comma-separated)"
                  value={settings.content.categories.join(', ')}
                  onChange={(e) => handleSettingChange('content', 'categories', e.target.value.split(',').map(cat => cat.trim()))}
                  margin="normal"
                  helperText="Enter categories separated by commas"
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Email Settings */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Email Notifications</Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.email.enableEmailNotifications}
                        onChange={(e) => handleSettingChange('email', 'enableEmailNotifications', e.target.checked)}
                      />
                    }
                    label="Enable Email Notifications"
                  />
                </FormGroup>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Admin Email"
                  value={settings.email.adminEmail}
                  onChange={(e) => handleSettingChange('email', 'adminEmail', e.target.value)}
                  margin="normal"
                  type="email"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="email-service-label">Email Service</InputLabel>
                  <Select
                    labelId="email-service-label"
                    value={settings.email.emailService}
                    label="Email Service"
                    onChange={(e) => handleSettingChange('email', 'emailService', e.target.value)}
                  >
                    <MenuItem value="smtp">SMTP</MenuItem>
                    <MenuItem value="sendgrid">SendGrid</MenuItem>
                    <MenuItem value="mailgun">Mailgun</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {settings.email.emailService === 'smtp' && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="SMTP Host"
                      value={settings.email.smtpHost}
                      onChange={(e) => handleSettingChange('email', 'smtpHost', e.target.value)}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="SMTP Port"
                      value={settings.email.smtpPort}
                      onChange={(e) => handleSettingChange('email', 'smtpPort', e.target.value)}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="SMTP Username"
                      value={settings.email.smtpUser}
                      onChange={(e) => handleSettingChange('email', 'smtpUser', e.target.value)}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="SMTP Password"
                      value={settings.email.smtpPassword}
                      onChange={(e) => handleSettingChange('email', 'smtpPassword', e.target.value)}
                      margin="normal"
                      type="password"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </TabPanel>

          {/* Advanced Settings */}
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Performance</Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.advanced.enableCache}
                        onChange={(e) => handleSettingChange('advanced', 'enableCache', e.target.checked)}
                      />
                    }
                    label="Enable Caching"
                  />
                </FormGroup>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cache Lifetime (seconds)"
                  type="number"
                  value={settings.advanced.cacheLifetime}
                  onChange={(e) => handleSettingChange('advanced', 'cacheLifetime', parseInt(e.target.value))}
                  margin="normal"
                  disabled={!settings.advanced.enableCache}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="API Rate Limit (requests per minute)"
                  type="number"
                  value={settings.advanced.apiRateLimit}
                  onChange={(e) => handleSettingChange('advanced', 'apiRateLimit', parseInt(e.target.value))}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Debugging</Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.advanced.debugMode}
                        onChange={(e) => handleSettingChange('advanced', 'debugMode', e.target.checked)}
                      />
                    }
                    label="Enable Debug Mode"
                  />
                </FormGroup>
              </Grid>
            </Grid>
          </TabPanel>
        </Card>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Loading overlay for save operation */}
      {saving && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}
        >
          <Card sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
            <CircularProgress sx={{ mr: 2 }} />
            <Typography>Saving settings...</Typography>
          </Card>
        </Box>
      )}
    </Container>
  );
};

export default AdminSettings;
