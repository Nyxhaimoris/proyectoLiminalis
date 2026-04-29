import i18n from 'i18next'; // Import core i18n library
import { initReactI18next } from 'react-i18next'; // Plugin to connect i18n with React
import LanguageDetector from 'i18next-browser-languagedetector'; // Detects user language from browser settings, localStorage, etc.

import translationEN from './locales/en/translation.json';
import translationES from './locales/es/translation.json';
import translationIT from './locales/it/translation.json';
const resources = { // Define translation resources grouped by language
  en: { translation: translationEN },
  es: { translation: translationES },
  it : {translation: translationIT}
};

i18n
  .use(LanguageDetector)   // Enable automatic language detection
  .use(initReactI18next)   // Pass i18n instance to React
  .init({
    resources,
    fallbackLng: 'en', 
    // Fallback language if detected language is not available
    
    detection: {    // Language detection options
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; // Export configured i18n instance for use