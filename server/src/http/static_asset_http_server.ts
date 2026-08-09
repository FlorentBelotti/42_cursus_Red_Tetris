/**
 * Builds the Express application that serves the built client: its static
 * assets first, then the Single Page Application fallback for everything else.
 * Express is used for static serving only (see CLAUDE.md §2) — all gameplay
 * traffic travels over socket.io.
 */
import path from 'node:path';
import express from 'express';
import type { Express } from 'express';

import { registerSinglePageApplicationFallbackRoute } from './single_page_application_fallback_route';

/**
 * Path from this module's own directory to the client's build output.
 *
 * Three levels up resolves to the repository root both in development
 * (`server/src/http`) and in production (`server/dist/http`), because the
 * compiled tree mirrors the source tree one level below `server/`. Moving this
 * module to another depth requires updating this constant.
 */
const RELATIVE_PATH_FROM_THIS_MODULE_TO_CLIENT_BUILD_DIRECTORY = '../../../client/dist';

/**
 * Resolves the absolute path to the client's built assets, as produced by
 * `npm run build -w client`.
 *
 * @returns Absolute path to the client build directory.
 */
export function resolveClientBuildDirectoryPath(): string {
  return path.join(__dirname, RELATIVE_PATH_FROM_THIS_MODULE_TO_CLIENT_BUILD_DIRECTORY);
}

/**
 * Creates the Express application serving the client Single Page Application.
 * Registration order matters: static assets are matched first, and the
 * catch-all fallback only answers what is left.
 *
 * @param clientBuildDirectoryPath - Absolute path to the client's built assets.
 * @returns A configured Express application, ready to be attached to an HTTP server.
 */
export function createStaticAssetHttpApplication(clientBuildDirectoryPath: string): Express {
  const application = express();

  application.use(express.static(clientBuildDirectoryPath));
  registerSinglePageApplicationFallbackRoute(application, clientBuildDirectoryPath);

  return application;
}
