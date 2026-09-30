import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { routes } from './routes';
// Stylesheets are attached per route by MainLayout (regular vs LearnPress bundle),
// reproducing the current site's per-page stylesheet order.

const router = createBrowserRouter(routes);
const rootEl = document.getElementById('root');
const app = (
  <HelmetProvider>
    <RouterProvider router={router} />
  </HelmetProvider>
);

if (rootEl.hasChildNodes()) {
  // Pre-rendered HTML is present: hydrate it.
  ReactDOM.hydrateRoot(rootEl, app);
} else {
  // Dev server: plain client render.
  ReactDOM.createRoot(rootEl).render(app);
}
