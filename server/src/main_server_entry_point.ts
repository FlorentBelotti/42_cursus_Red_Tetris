/**
 * Bootstraps the HTTP + socket.io server: serves the built client SPA with a
 * catch-all fallback route, and starts listening. No game/domain logic lives
 * here — see server/src/domain and server/src/socket for that once it exists.
 */
import path from 'node:path';
import { createServer } from 'node:http';
import dotenv from 'dotenv';
import express from 'express';
import { Server as SocketIoServer } from 'socket.io';

dotenv.config();

const DEFAULT_SERVER_PORT = 3001;

/**
 * Reads the HTTP port from the environment, falling back to a default.
 *
 * @returns The port number the server should listen on.
 */
function readServerPortFromEnvironment(): number {
  const rawPortValue = process.env.PORT;

  if (rawPortValue === undefined) {
    return DEFAULT_SERVER_PORT;
  }

  return Number.parseInt(rawPortValue, 10);
}

/**
 * Builds the Express application: serves the client's built static assets
 * and falls back to index.html for any unmatched route, so client-side
 * routing (BrowserRouter) can resolve deep links such as /<room>/<player>.
 *
 * @param clientBuildDirectory - Absolute path to the client's built assets.
 * @returns A configured Express application.
 */
function createExpressApplication(clientBuildDirectory: string): express.Express {
  const application = express();

  application.use(express.static(clientBuildDirectory));

  application.get('*', (_request, response) => {
    response.sendFile(path.join(clientBuildDirectory, 'index.html'));
  });

  return application;
}

/**
 * Starts the HTTP server and attaches a socket.io server to it. No event
 * handlers are registered yet — that is the responsibility of
 * server/src/socket once the protocol is implemented.
 */
function startServer(): void {
  const clientBuildDirectory = path.join(__dirname, '../../client/dist');
  const application = createExpressApplication(clientBuildDirectory);
  const httpServer = createServer(application);

  new SocketIoServer(httpServer);

  const port = readServerPortFromEnvironment();

  httpServer.listen(port, () => {
    console.log(`Red Tetris server listening on port ${port}`);
  });
}

startServer();
