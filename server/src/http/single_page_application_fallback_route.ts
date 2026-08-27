import path from 'node:path';
import type { Express } from 'express';

const SINGLE_PAGE_APPLICATION_ENTRY_FILE_NAME = 'index.html';

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
