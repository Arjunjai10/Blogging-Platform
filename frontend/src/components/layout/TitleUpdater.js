import { useContext, useEffect } from 'react';
import { SettingsContext } from '../../context/SettingsContext';

/**
 * Component that updates the document title based on site settings
 * This component doesn't render anything, it just updates the document title
 */
const TitleUpdater = () => {
  const { settings, loading } = useContext(SettingsContext);

  useEffect(() => {
    // Only update title when settings are loaded
    if (!loading && settings?.general?.siteName) {
      document.title = settings.general.siteName;
    }
  }, [settings, loading]);

  // This component doesn't render anything
  return null;
};

export default TitleUpdater;
