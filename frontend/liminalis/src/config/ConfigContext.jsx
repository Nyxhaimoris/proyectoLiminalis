import React, { createContext, useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import AxiosConfig from '../config/AxiosConfig';

const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const [settings, setSettings] = useState({ theme: 'light', language: 'es' });
  const { i18n } = useTranslation();

  const fetchSettings = async () => {
    try {
      const { data } = await AxiosConfig.get('/settings');
      const userSettings = data.data || data;

      if (userSettings) {
        setSettings(userSettings);

        // Apply Theme from DB
        if (userSettings.theme) {
          document.documentElement.setAttribute('data-theme', userSettings.theme);
        }
        // Apply Font Size from DB
        if (userSettings.fontSize) {
          document.documentElement.style.fontSize = userSettings.fontSize;
        }
        // Apply Language from DB (overrides the browser detector)
        if (userSettings.language) {
          i18n.changeLanguage(userSettings.language);
        }
      }
    } catch (err) {
      console.error("Error cargando settings globales", err);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      fetchSettings();
    }
  }, []);

  return (
    <ConfigContext.Provider value={{ settings, setSettings, fetchSettings }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);