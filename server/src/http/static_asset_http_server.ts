import path from 'node:path';
import express from 'express';
import type { Express } from 'express';

import { registerSinglePageApplicationFallbackRoute } from './single_page_application_fallback_route';

const RELATIVE_PATH_FROM_THIS_MODULE_TO_CLIENT_BUILD_DIRECTORY = '../../../client/dist';

export function resolveClientBuildDirectoryPath(): string {
  return path.join(__dirname, RELATIVE_PATH_FROM_THIS_MODULE_TO_CLIENT_BUILD_DIRECTORY);
}

export function createStaticAssetHttpApplication(clientBuildDirectoryPath: string): Express {
  const application = express();

  application.use(express.static(clientBuildDirectoryPath));
  registerSinglePageApplicationFallbackRoute(application, clientBuildDirectoryPath);

  return application;
}
