/**
 * The catch-all route that makes the client a true Single Page Application
 * (C5): any request that did not match a static asset is answered with
 * `index.html`, so that deep links such as `/<room>/<player_name>` (C6) are
 * resolved by the client-side router instead of returning a 404.
 */
import path from 'node:path';
import type { Express } from 'express';

const SINGLE_PAGE_APPLICATION_ENTRY_FILE_NAME = 'index.html';

/**
 * Registers the Single Page Application fallback route on an Express
 * application. It must be registered *after* the static asset middleware,
 * otherwise it would shadow every real asset request.
 *
 * @param application - The Express application to register the route on.
 * @param clientBuildDirectoryPath - Absolute path to the client's built assets.
 */
export function registerSinglePageApplicationFallbackRoute(
  application: Express,
  clientBuildDirectoryPath: string,
): void {
  const singlePageApplicationEntryFilePath = path.join(
    clientBuildDirectoryPath,
    SINGLE_PAGE_APPLICATION_ENTRY_FILE_NAME,
  );

  application.get('*', (_request, response) => {
    response.sendFile(singlePageApplicationEntryFilePath);
  });
}
