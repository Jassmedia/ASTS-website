import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Adds a page-specific stylesheet (e.g. the Elementor-generated CSS of one page),
 * mirroring the current site where such files are only loaded on their own page.
 */
export default function PageCss({ href }) {
  if (!href) return null;
  return (
    <Helmet>
      <link rel="stylesheet" href={href} />
    </Helmet>
  );
}
