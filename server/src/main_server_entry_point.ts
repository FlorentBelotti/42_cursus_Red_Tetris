import { createServer } from 'node:http';
import type { Server as HttpServer } from 'node:http';

import { loadServerConfiguration } from './config/server_configuration_loader';
import {
  createStaticAssetHttpApplication,
  resolveClientBuildDirectoryPath,
} from './http/static_asset_http_server';
import { bootstrapSocketServer } from './socket/socket_server_bootstrap';

/**
 * Builds the HTTP server that serves the client SPA, with a socket.io server
 * attached to it and every event handler wired up.
 *
 * Exported so the integration suite can start the real composition root on an
 * ephemeral port, rather than assembling its own approximation of it and
 * testing something the production entry point never runs.
 *
 * @returns An HTTP server that is not listening yet.
 */
export function createRedTetrisHttpServer(): HttpServer {
  const application = createStaticAssetHttpApplication(resolveClientBuildDirectoryPath());
  const httpServer = createServer(application);

  bootstrapSocketServer(httpServer);

  return httpServer;
}

/**
 * Starts the Red Tetris server on the port given by the environment.
 */
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
