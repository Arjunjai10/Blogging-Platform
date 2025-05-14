import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    general: {
      siteName: 'EchoRidge',
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
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get API base URL from environment or default to localhost
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Fetch settings from the API
  const fetchSettings = async () => {
    setLoading(true);
    try {
      // First try to initialize settings if they don't exist yet
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await axios.post(`${API_BASE_URL}/api/settings/initialize`, {}, {
            headers: {
              'x-auth-token': token
            }
          });
        }
      } catch (initErr) {
        // Ignore initialization errors, as settings might already exist
        console.log('Settings initialization skipped:', initErr.message);
      }
      
      // Then fetch all settings
      const res = await axios.get(`${API_BASE_URL}/api/settings`);
      if (res.data && Object.keys(res.data).length > 0) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err.response?.data?.msg || 'Failed to load site settings');
    } finally {
      setLoading(false);
    }
  };

  // Update a specific setting
  const updateSetting = async (section, key, value) => {
    try {
      // Update locally first for immediate UI feedback
      setSettings(prevSettings => ({
        ...prevSettings,
        [section]: {
          ...prevSettings[section],
          [key]: value
        }
      }));

      // Then update on the server if user is authenticated
      const token = localStorage.getItem('token');
      if (token) {
        await axios.put(
          `${API_BASE_URL}/api/settings/${section}/${key}`,
          { value },
          {
            headers: {
              'x-auth-token': token,
              'Content-Type': 'application/json'
            }
          }
        );
      }
      return true;
    } catch (err) {
      console.error('Error updating setting:', err);
      // Revert the local change on error
      fetchSettings();
      return false;
    }
  };

  // Save all settings at once
  const saveAllSettings = async (newSettings) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const res = await axios.post(
        `${API_BASE_URL}/api/settings`,
        newSettings,
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        }
      );

      setSettings(res.data);
      return true;
    } catch (err) {
      console.error('Error saving settings:', err);
      return false;
    }
  };

  // Initialize settings on component mount
  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        fetchSettings,
        updateSetting,
        saveAllSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;
