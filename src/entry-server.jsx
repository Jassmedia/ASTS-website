import React from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { Writable } from 'node:stream';
import { routes } from './routes';

/**
 * Renders one URL to a complete HTML string (used by scripts/prerender.mjs).
 * Uses the streaming renderer with onAllReady so lazily loaded route chunks
 * are fully rendered before the HTML is captured.
 */
export async function render(url) {
  const handler = createStaticHandler(routes);
  const context = await handler.query(new Request('https://aststraining.com' + url));
  if (context instanceof Response) {
    throw new Error('Unexpected redirect response while rendering ' + url);
  }
  const router = createStaticRouter(handler.dataRoutes, context);
  const helmetContext = {};

  const html = await new Promise((resolve, reject) => {
    let out = '';
    const sink = new Writable({
      write(chunk, _enc, cb) {
        out += chunk.toString();
        cb();
      },
      final(cb) {
        cb();
        resolve(out);
      },
    });
    const { pipe } = renderToPipeableStream(
      <HelmetProvider context={helmetContext}>
        <StaticRouterProvider router={router} context={context} hydrate={false} />
      </HelmetProvider>,
      {
        onAllReady() {
          pipe(sink);
        },
        onError(err) {
          reject(err);
        },
      },
    );
  });

  return { html, helmet: helmetContext.helmet, status: context.statusCode };
}
