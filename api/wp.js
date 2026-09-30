/**
 * Fallback for URLs that have no prerendered file (vercel.json rewrite
 * "/:path*" -> "/api/wp?__wp_path=/:path*", applied only after the static
 * files). WordPress answers them exactly as the live site does: attachment
 * pages, old URLs it redirects, and its own 404 page. If WordPress cannot be
 * reached, the static 404 page is returned with status 404.
 */
import { proxyToWordPress } from '../server/wp-proxy.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
  const url = new URL(request.url);
  const path = url.searchParams.get('__wp_path') || '/';
  url.searchParams.delete('__wp_path');
  const original = new URL(path + (url.search || ''), url.origin);
  const forwarded = new Request(original, request);
  const response = await proxyToWordPress(forwarded, process.env);
  if (response) return response;
  const notFound = await fetch(new URL('/404.html', url.origin));
  return new Response(notFound.body, { status: 404, headers: { 'content-type': 'text/html; charset=utf-8' } });
}
