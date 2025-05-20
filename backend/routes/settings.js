const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Setting = require('../models/Setting');

// @route   GET api/settings
// @desc    Get all settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Group settings by section
    const settings = await Setting.find().sort({ section: 1, key: 1 });
    
    // Transform to a more usable format
    const formattedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.section]) {
        acc[setting.section] = {};
      }
      acc[setting.section][setting.key] = setting.value;
      return acc;
    }, {});
    
    res.json(formattedSettings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/settings/section/:sectionName
// @desc    Get settings by section
// @access  Public
router.get('/section/:sectionName', async (req, res) => {
  try {
    const settings = await Setting.find({ section: req.params.sectionName });
    
    // Transform to a more usable format
    const formattedSettings = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    
    res.json(formattedSettings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/settings
// @desc    Update multiple settings
// @access  Private (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: 'Not authorized to update settings' });
    }
    
    const settingsData = req.body;
    
    if (!settingsData || Object.keys(settingsData).length === 0) {
      return res.status(400).json({ msg: 'No settings provided' });
    }
    
    // Process each section
    for (const [section, sectionSettings] of Object.entries(settingsData)) {
      // Process each setting in the section
      for (const [key, value] of Object.entries(sectionSettings)) {
        // Update or create the setting
        await Setting.findOneAndUpdate(
          { key, section },
          { key, value, section },
          { upsert: true, new: true }
        );
      }
    }
    
    // Return the updated settings
    const updatedSettings = await Setting.find().sort({ section: 1, key: 1 });
    
    // Transform to a more usable format
    const formattedSettings = updatedSettings.reduce((acc, setting) => {
      if (!acc[setting.section]) {
        acc[setting.section] = {};
      }
      acc[setting.section][setting.key] = setting.value;
      return acc;
    }, {});
    
    res.json(formattedSettings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/settings/update/:sectionName/:keyName
// @desc    Update a single setting
// @access  Private (Admin only)
router.put('/update/:sectionName/:keyName', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: 'Not authorized to update settings' });
    }
    
    const { sectionName, keyName } = req.params;
    const { value } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({ msg: 'Setting value is required' });
    }
    
    // Update or create the setting
    const setting = await Setting.findOneAndUpdate(
      { key: keyName, section: sectionName },
      { key: keyName, value, section: sectionName },
      { upsert: true, new: true }
    );
    
    res.json(setting);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/settings/initialize
// @desc    Initialize default settings if they don't exist
// @access  Private (Admin only)
router.post('/initialize', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: 'Not authorized to initialize settings' });
    }
    
    // Define default settings
    const defaultSettings = {
      general: {
        siteName: 'MERN Blog',
        siteDescription: 'Good',
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
    };
    
    // Initialize each setting if it doesn't exist
    for (const [section, sectionSettings] of Object.entries(defaultSettings)) {
      for (const [key, value] of Object.entries(sectionSettings)) {
        // Check if setting exists
        const existingSetting = await Setting.findOne({ section, key });
        
        // If it doesn't exist, create it
        if (!existingSetting) {
          await Setting.create({ section, key, value });
        }
      }
    }
    
    // Return all settings
    const settings = await Setting.find().sort({ section: 1, key: 1 });
    
    // Transform to a more usable format
    const formattedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.section]) {
        acc[setting.section] = {};
      }
      acc[setting.section][setting.key] = setting.value;
      return acc;
    }, {});
    
    res.json(formattedSettings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
