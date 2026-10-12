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
  ogImage = 'https://thelaundrygo.com/logo.png',
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
        ? 'LaundryGo — Servicio de Lavandería a Domicilio en Denver'
        : 'LaundryGo — Denver Laundry Pickup & Delivery';

    const defaultDescription =
      currentLang === 'es'
        ? 'Servicio de recolección y entrega de lavandería en Denver y Boulder, Colorado. Tarifas transparentes por libra ($2.25/lb), entrega en 24h y lavado ecológico.'
        : 'Premium laundry pickup and delivery service in Denver & Boulder, Colorado. Simple per-pound pricing ($2.25/lb), 24h turnaround, and eco-friendly care.';

    const pageTitle = title ? `${title} | LaundryGo` : defaultTitle;
    const pageDescription = description || defaultDescription;
    const pageCanonical = canonical || `https://thelaundrygo.com${location.pathname}`;

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
