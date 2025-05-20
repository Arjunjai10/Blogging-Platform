import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../config/api';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    siteName: 'Blog Platform',
    siteDescription: 'A modern blogging platform',
    theme: 'light',
    language: 'en',
    postsPerPage: 10,
    allowComments: true,
    allowRegistration: true,
    maintenanceMode: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(ENDPOINTS.SETTINGS.GET);
      if (response.data) {
        setSettings(response.data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err.response?.data?.msg || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const response = await axios.put(ENDPOINTS.SETTINGS.UPDATE, newSettings);
      if (response.data) {
        setSettings(response.data);
        return true;
      }
      return false;
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update settings');
      return false;
    }
  };

  const value = {
    settings,
    loading,
    error,
    updateSettings,
    setError
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;
