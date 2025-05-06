import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation files
import translationEN from "./locales/en/translation.json";
import translationHI from "./locales/hi/translation.json";

// Setup resources for languages
const resources = {
  en: { translation: translationEN },
  hi: { translation: translationHI },
};

i18n
  .use(LanguageDetector)    // Auto-detect user language
  .use(initReactI18next)    // Initialize react-i18next
  .init({
    resources,              // Define language resources
    fallbackLng: "en",      // Fallback language if no match found
    interpolation: {
      escapeValue: false,   // Not necessary for React (avoids XSS issues)
    },
  });

export default i18n;
