import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

const getInitialLanguage = (): string => {
  if (typeof window === 'undefined') return 'en';
  try {
    const urlParam = new URLSearchParams(window.location.search).get('lng');
    if (urlParam === 'es' || urlParam === 'en') {
      localStorage.setItem('i18nextLng', urlParam);
      return urlParam;
    }
  } catch {
    // Fallback if URLSearchParams fails
  }
  const saved = typeof window !== 'undefined' ? localStorage.getItem('i18nextLng') : null;
  return saved === 'es' || saved === 'en' ? saved : 'en';
};

const initialLanguage = getInitialLanguage();

if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLanguage;
}

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: initialLanguage,
    fallbackLng: 'en',
    supportedLngs: ['en', 'es'],
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    ns: ['common'],
    defaultNS: 'common',
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      lookupQuerystring: 'lng',
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    react: {
      useSuspense: false,
    },
  });

i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
  }
});

export default i18n;
