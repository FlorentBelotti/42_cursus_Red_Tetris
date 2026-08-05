import type { Server as HttpServer } from 'node:http';
import { Server as SocketIoServer, type Socket } from 'socket.io';

import { GameRoomRegistry } from '../domain/game_room_registry';
import { registerConnectionLifecycleHandler } from './connection_lifecycle_handler';

export function bootstrapSocketServer(httpServer: HttpServer): SocketIoServer {
  const socketIoServer = new SocketIoServer(httpServer);
  const gameRoomRegistry = new GameRoomRegistry();

  socketIoServer.on('connection', (connectedSocket: Socket) => {
    registerConnectionLifecycleHandler(socketIoServer, connectedSocket, gameRoomRegistry);
  });

  return socketIoServer;
}
