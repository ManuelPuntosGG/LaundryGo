import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
}

export function SEO({
  title,
  description,
  canonical,
  ogImage = 'https://gopropertycare.com/logo.png',
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
        ? 'GoPropertyCare — Limpieza Residencial y Cuidado de Propiedades en Denver'
        : 'GoPropertyCare — Residential Cleaning & Property Care in Denver';

    const defaultDescription =
      currentLang === 'es'
        ? 'Servicio profesional de limpieza residencial, rotación de Airbnb y entrega de propiedades en Denver, CO. Tarifas por pie cuadrado desde $0.125/sqft, 100% asegurado.'
        : 'Professional residential cleaning, turnover care, and move-in/move-out services across Denver, CO. Transparent sq ft pricing from $0.125/sqft, 100% insured.';

    const pageTitle = title ? `${title} | GoPropertyCare` : defaultTitle;
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
  }, [title, description, canonical, ogImage, location.pathname, currentLang]);

  return null;
}
