import type { Server as HttpServer } from 'node:http';
import { Server as SocketIoServer } from 'socket.io';

import { GameRoomRegistry } from '../domain/game_room_registry';
import { registerConnectionLifecycleHandler } from './connection_lifecycle_handler';
import type { TypedSocket, TypedSocketIoServer } from './typed_socket_aliases';

/**
 * Attaches a Socket.IO server to the given HTTP server and wires new
 * connections to the game room registry.
 *
 * @param httpServer - The HTTP server to attach Socket.IO to.
 * @returns The created Socket.IO server.
 */
export function bootstrapSocketServer(httpServer: HttpServer): TypedSocketIoServer {
  const socketIoServer: TypedSocketIoServer = new SocketIoServer(httpServer);
  const gameRoomRegistry = new GameRoomRegistry();

  socketIoServer.on('connection', (connectedSocket: TypedSocket) => {
    registerConnectionLifecycleHandler(socketIoServer, connectedSocket, gameRoomRegistry);
  });

  return socketIoServer;
}
