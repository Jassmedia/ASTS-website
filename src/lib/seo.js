import { SITE } from '../data/site';

const ORG_ID = SITE.origin + '/#organization';
const SITE_ID = SITE.origin + '/#website';

/**
 * Rebuilds the JSON-LD graph that Yoast SEO emits on the current site, from the
 * compact per-page descriptor stored in the data files (same node structure,
 * same @ids, same organization / website nodes).
 */
export function buildJsonLd(schema) {
  if (!schema) return null;
  const pageId = schema.url;
  const page = {
    '@type': schema.type || 'WebPage',
    '@id': pageId,
    url: schema.url,
    name: schema.name,
    isPartOf: { '@id': SITE_ID },
  };
  if (schema.about) page.about = { '@id': ORG_ID };
  if (schema.image) {
    page.primaryImageOfPage = { '@id': pageId + '#primaryimage' };
    page.image = { '@id': pageId + '#primaryimage' };
    page.thumbnailUrl = schema.image.url;
  }
  if (schema.datePublished) page.datePublished = schema.datePublished;
  if (schema.dateModified) page.dateModified = schema.dateModified;
  if (schema.description) page.description = schema.description;
  if (schema.breadcrumb) page.breadcrumb = { '@id': pageId + '#breadcrumb' };
  page.inLanguage = 'en-US';
  if (schema.type !== 'CollectionPage') page.potentialAction = [{ '@type': 'ReadAction', target: [schema.url] }];

  const graph = [page];
  if (schema.image) {
    graph.push({
      '@type': 'ImageObject',
      inLanguage: 'en-US',
      '@id': pageId + '#primaryimage',
      url: schema.image.url,
      contentUrl: schema.image.url,
      width: schema.image.width,
      height: schema.image.height,
    });
  }
  if (schema.breadcrumb) {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': pageId + '#breadcrumb',
      itemListElement: schema.breadcrumb.map((b, i) => {
        const li = { '@type': 'ListItem', position: i + 1, name: b.name };
        if (b.item) li.item = b.item;
        return li;
      }),
    });
  }
  graph.push({
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: SITE.origin + '/',
    name: SITE.name,
    description: '',
    publisher: { '@id': ORG_ID },
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: SITE.origin + '/?s={search_term_string}' },
        'query-input': { '@type': 'PropertyValueSpecification', valueRequired: true, valueName: 'search_term_string' },
      },
    ],
    inLanguage: 'en-US',
  });
  graph.push({
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    url: SITE.origin + '/',
    logo: {
      '@type': 'ImageObject',
      inLanguage: 'en-US',
      '@id': SITE.origin + '/#/schema/logo/image/',
      url: SITE.schemaLogo,
      contentUrl: SITE.schemaLogo,
      width: 1000,
      height: 250,
      caption: SITE.name,
    },
    image: { '@id': SITE.origin + '/#/schema/logo/image/' },
    sameAs: [
      'https://www.facebook.com/aststrainingonline/',
      'https://x.com/AstsTraining',
      'https://www.instagram.com/aststrainingonline/',
      'https://www.linkedin.com/company/aststraining',
      'https://in.pinterest.com/aststrainingonline/',
      'https://www.youtube.com/channel/UCUNAFNnfgjtCmPPfKr0b02g',
    ],
  });
  return { '@context': 'https://schema.org', '@graph': graph };
}

/** Absolute canonical URL for a path (the site keeps WordPress' trailing slashes). */
export function absUrl(path) {
  if (!path) return SITE.origin + '/';
  if (/^https?:/.test(path)) return path;
  return SITE.origin + path;
}
