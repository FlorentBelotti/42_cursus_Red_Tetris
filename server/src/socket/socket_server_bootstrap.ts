import type { Server as HttpServer } from 'node:http';
import { Server as SocketIoServer } from 'socket.io';

import { GameRoomRegistry } from '../domain/game_room_registry';
import { registerConnectionLifecycleHandler } from './connection_lifecycle_handler';
import type { TypedSocket, TypedSocketIoServer } from './typed_socket_aliases';

export function bootstrapSocketServer(httpServer: HttpServer): TypedSocketIoServer {
  const socketIoServer: TypedSocketIoServer = new SocketIoServer(httpServer);
  const gameRoomRegistry = new GameRoomRegistry();

  socketIoServer.on('connection', (connectedSocket: TypedSocket) => {
    registerConnectionLifecycleHandler(socketIoServer, connectedSocket, gameRoomRegistry);
  });

  return socketIoServer;
}
