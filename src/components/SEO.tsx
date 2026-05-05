import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Justice Ansah';
const DEFAULT_DESCRIPTION =
  'Robotics, IoT and educational technology that makes STEM learning hands-on across Africa.';
const DEFAULT_IMAGE = '/og-image.png';

const PRODUCTION_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined) || 'https://justiceansah.com';

const isPreviewHost = (host: string) =>
  host.includes('id-preview--') ||
  host.includes('lovableproject.com') ||
  host.includes('lovable.app') ||
  host === 'localhost' ||
  host === '127.0.0.1';

const BASE_URL = (() => {
  if (typeof window === 'undefined') return PRODUCTION_URL;
  const host = window.location.hostname;
  // Never leak preview URLs into canonical/OG tags.
  if (isPreviewHost(host)) return PRODUCTION_URL;
  return window.location.origin;
})();

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  article?: {
    publishedTime?: string;
    tags?: string[];
    category?: string;
  };
}

const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  article,
}: SEOProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;
  const fullImage = image.startsWith('http') ? image : `${BASE_URL}${image}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Article-specific */}
      {article?.publishedTime && (
        <meta property="article:published_time" content={article.publishedTime} />
      )}
      {article?.tags?.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
      {article?.category && (
        <meta property="article:section" content={article.category} />
      )}
    </Helmet>
  );
};

export default SEO;
