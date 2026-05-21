/**
 * SEO Component
 * 
 * Handles all meta tags, social media previews (Open Graph/Twitter), 
 * and JSON-LD structured data for search engine optimization.
 */
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
}

export function SEO({ 
  title = "La Gravata de Papel | Animação de Casamentos e Eventos", 
  description = "A hora da gravata nunca mais será a mesma. Transformamos seu evento com animação teatral, Tropa da Gravata e muita diversão em SP.",
  keywords = "animação de casamentos, tropa da gravata, hora da gravata, eventos sp, entretenimento casamentos",
  ogImage = "/og-image.jpg",
  ogUrl = "https://lagravatadepapel.com.br"
}: SEOProps) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={ogUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
      
      {/* Canonical */}
      <link rel="canonical" href={ogUrl} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "La Gravata de Papel",
          "image": ogImage,
          "@id": ogUrl,
          "url": ogUrl,
          "telephone": "+5511985111012",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Rua Mesquita, 384",
            "addressLocality": "São Paulo",
            "addressRegion": "SP",
            "postalCode": "01544-001",
            "addressCountry": "BR"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": -23.5701,
            "longitude": -46.6231
          },
          "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday"
            ],
            "opens": "00:00",
            "closes": "23:59"
          },
          "sameAs": [
            "https://www.instagram.com/lagravatadepapel/",
            "https://www.facebook.com/lagravatadepapel",
            "https://www.tiktok.com/@lagravatadepapel"
          ]
        })}
      </script>
    </Helmet>
  );
}
