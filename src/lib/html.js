/**
 * Mirrors what the theme's main.js does at runtime: it removes <p> elements
 * that contain nothing but whitespace / &nbsp;.
 */
export function cleanHtml(html) {
  if (!html) return '';
  return html.replace(/<p[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '');
}

/** Turns "https://aststraining.com/x/" (or an already relative path) into "/x/". */
export function relUrl(u) {
  if (!u) return u;
  return u.replace(/^https?:\/\/(www\.)?aststraining\.com/, '') || '/';
}

/** Splits a text node that contains "&" style entities from the audit into plain text. */
export function decodeEntities(s) {
  return (s || '')
    .replace(/&amp;/g, '&')
    .replace(/&#038;/g, '&')
    .replace(/&#8217;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8211;/g, '–')
    .replace(/&#8230;/g, '…')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}
