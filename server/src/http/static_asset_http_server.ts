import path from 'node:path';
import express from 'express';
import type { Express } from 'express';

import { registerSinglePageApplicationFallbackRoute } from './single_page_application_fallback_route';

const RELATIVE_PATH_FROM_THIS_MODULE_TO_CLIENT_BUILD_DIRECTORY = '../../../client/dist';

/**
 * Computes the absolute path to the built client files on disk, relative to this module.
 *
 * @returns The absolute path to the client's build directory.
 */
export function resolveClientBuildDirectoryPath(): string {
  return path.join(__dirname, RELATIVE_PATH_FROM_THIS_MODULE_TO_CLIENT_BUILD_DIRECTORY);
}

/**
 * Creates the Express app that serves the client's static files, falling back
 * to index.html for any unmatched route.
 *
 * @param clientBuildDirectoryPath - Folder containing the built client files.
 * @returns The configured Express application.
 */
export function createStaticAssetHttpApplication(clientBuildDirectoryPath: string): Express {
  const application = express();

  application.use(express.static(clientBuildDirectoryPath));
  registerSinglePageApplicationFallbackRoute(application, clientBuildDirectoryPath);

  return application;
}
