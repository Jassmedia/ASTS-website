import React from 'react';
import { Helmet } from 'react-helmet-async';
import { buildJsonLd } from '../lib/seo';

/**
 * Head tags for one page, reproducing what Yoast SEO prints on the current site:
 * title, meta description, robots, canonical, Open Graph, Twitter and JSON-LD.
 * `seo` is the per-page object from the data files; props can override fields.
 */
export default function Seo({ seo, title, description, canonical, robots, noindex }) {
  const s = seo || {};
  const t = title || s.title || 'ASTSTraining';
  const desc = description !== undefined ? description : s.description;
  const canon = canonical !== undefined ? canonical : s.canonical;
  const rob = noindex ? 'noindex, follow' : robots || s.robots || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  const jsonLd = s.schema ? buildJsonLd(s.schema) : null;

  return (
    <Helmet>
      <title>{t}</title>
      <meta name="robots" content={rob} />
      {desc ? <meta name="description" content={desc} /> : null}
      {canon ? <link rel="canonical" href={canon} /> : null}
      <meta property="og:locale" content="en_US" />
      {s.ogType ? <meta property="og:type" content={s.ogType} /> : null}
      <meta property="og:title" content={s.ogTitle || t} />
      {s.ogDescription || desc ? <meta property="og:description" content={s.ogDescription || desc} /> : null}
      {canon ? <meta property="og:url" content={canon} /> : null}
      <meta property="og:site_name" content="ASTSTraining" />
      {s.articlePublisher ? <meta property="article:publisher" content={s.articlePublisher} /> : null}
      {s.articlePublished ? <meta property="article:published_time" content={s.articlePublished} /> : null}
      {s.articleModified ? <meta property="article:modified_time" content={s.articleModified} /> : null}
      {s.ogImage ? <meta property="og:image" content={s.ogImage} /> : null}
      {s.ogImageWidth ? <meta property="og:image:width" content={s.ogImageWidth} /> : null}
      {s.ogImageHeight ? <meta property="og:image:height" content={s.ogImageHeight} /> : null}
      {s.ogImageType ? <meta property="og:image:type" content={s.ogImageType} /> : null}
      <meta name="twitter:card" content={s.twitterCard || 'summary_large_image'} />
      <meta name="twitter:site" content={s.twitterSite || '@AstsTraining'} />
      {s.twitterLabel1 ? <meta name="twitter:label1" content={s.twitterLabel1} /> : null}
      {s.twitterData1 ? <meta name="twitter:data1" content={s.twitterData1} /> : null}
      {jsonLd ? (
        <script type="application/ld+json" className="yoast-schema-graph">
          {JSON.stringify(jsonLd)}
        </script>
      ) : null}
    </Helmet>
  );
}
