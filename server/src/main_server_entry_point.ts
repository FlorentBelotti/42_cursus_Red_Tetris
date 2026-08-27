import { createServer } from 'node:http';
import type { Server as HttpServer } from 'node:http';

import { loadServerConfiguration } from './config/server_configuration_loader';
import {
  createStaticAssetHttpApplication,
  resolveClientBuildDirectoryPath,
} from './http/static_asset_http_server';
import { bootstrapSocketServer } from './socket/socket_server_bootstrap';

export function createRedTetrisHttpServer(): HttpServer {
  const application = createStaticAssetHttpApplication(resolveClientBuildDirectoryPath());
  const httpServer = createServer(application);

  bootstrapSocketServer(httpServer);

  return httpServer;
}

export function startRedTetrisServer(): void {
  const configuration = loadServerConfiguration();
  const httpServer = createRedTetrisHttpServer();

  httpServer.listen(configuration.httpServerPort, () => {
    console.log(`Red Tetris server listening on port ${configuration.httpServerPort}`);
  });
}

if (require.main === module) {
  startRedTetrisServer();
}
