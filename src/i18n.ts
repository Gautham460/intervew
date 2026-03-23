import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "dashboard_title": "Dashboard",
      "create_interview": "Create Interview",
      "no_data": "No Data Found",
      "add_new": "Add New",
      "streak_msg": "You're on fire!",
    }
  },
  hi: {
    translation: {
      "dashboard_title": "डैशबोर्ड",
      "create_interview": "इंटरव्यू बनाएं",
      "no_data": "कोई डेटा नहीं मिला",
      "add_new": "नया जोड़ें",
      "streak_msg": "आप शानदार कर रहे हैं!",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;
