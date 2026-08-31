import path from 'node:path';
import type { Express } from 'express';

const SINGLE_PAGE_APPLICATION_ENTRY_FILE_NAME = 'index.html';

/**
 * Serves index.html for any URL that doesn't match a static file, so that
 * routes handled by the browser (like /room/player) still load the app
 * instead of returning a 404.
 *
 * @param application - The Express app to add the route to.
 * @param clientBuildDirectoryPath - Folder containing the built client files.
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
