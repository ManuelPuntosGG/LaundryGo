import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export function SEO({
  title,
  description,
  canonical,
  ogImage = 'https://gopropertycare.com/logo.png',
  noIndex = false,
}: SEOProps) {
  const location = useLocation();
  const { i18n } = useTranslation();

  const currentLang = i18n.language?.startsWith('es') ? 'es' : 'en';

  useEffect(() => {
    // 1. Sync Document Language
    if (typeof document !== 'undefined') {
      document.documentElement.lang = currentLang;
    }

    // 2. Default Title & Description
    const defaultTitle =
      currentLang === 'es'
        ? 'Servicio de Limpieza de Casas en Denver, CO | GoPropertyCare'
        : 'House Cleaning Service in Denver, CO | GoPropertyCare';

    const defaultDescription =
      currentLang === 'es'
        ? 'Servicio profesional de limpieza de casas en Denver. Limpieza estándar, profunda y para mudanzas por un equipo local de confianza. ¡Obtén tu cotización gratis hoy!'
        : 'Professional house cleaning in Denver. Standard, deep, and move-in/move-out cleaning by a trusted local team. Get your free quote today!';

    const pageTitle = title ? (title.includes('GoPropertyCare') ? title : `${title} | GoPropertyCare`) : defaultTitle;
    const pageDescription = description || defaultDescription;
    const pageCanonical = canonical || `https://gopropertycare.com${location.pathname}`;

    document.title = pageTitle;

    // Helper to set or update meta tag
    const setMetaTag = (attr: 'name' | 'property', key: string, content: string) => {
      let element = document.querySelector(`meta[${attr}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Update robots tag
    if (noIndex) {
      setMetaTag('name', 'robots', 'noindex, nofollow');
    } else {
      setMetaTag('name', 'robots', 'index, follow');
    }

    // Update standard description
    setMetaTag('name', 'description', pageDescription);

    // Update Open Graph
    setMetaTag('property', 'og:title', pageTitle);
    setMetaTag('property', 'og:description', pageDescription);
    setMetaTag('property', 'og:url', pageCanonical);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:locale', currentLang === 'es' ? 'es_US' : 'en_US');

    // Update Twitter Card
    setMetaTag('name', 'twitter:title', pageTitle);
    setMetaTag('name', 'twitter:description', pageDescription);
    setMetaTag('name', 'twitter:image', ogImage);

    // Update Canonical
    let canonicalElement = document.querySelector('link[rel="canonical"]');
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.setAttribute('href', pageCanonical);
  }, [title, description, canonical, ogImage, noIndex, location.pathname, currentLang]);

  return null;
}
