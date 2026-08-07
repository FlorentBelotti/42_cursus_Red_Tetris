import type { Server as SocketIoServer, Socket } from 'socket.io';

import type { GameRoomRegistry } from '../domain/game_room_registry';
import type { Player } from '../domain/player';

export interface SocketRoomSession {
  roomName: string | null;
  seatedPlayer: Player | null;
}

export function registerConnectionLifecycleHandler(
  socketIoServer: SocketIoServer,
  socket: Socket,
  gameRoomRegistry: GameRoomRegistry,
): void {
  const session = createEmptySocketRoomSession();

  socket.on('disconnect', () => {
    releaseSocketFromItsRoom(socket, gameRoomRegistry, session);
  });
}

export function createEmptySocketRoomSession(): SocketRoomSession {
  return { roomName: null, seatedPlayer: null };
}

export function releaseSocketFromItsRoom(
  socket: Socket,
  gameRoomRegistry: GameRoomRegistry,
  session: SocketRoomSession,
): void {
  const leftRoomName = session.roomName;
  const leavingPlayer = session.seatedPlayer;

  if (leftRoomName === null || leavingPlayer === null) {
    return;
  }

  gameRoomRegistry.removePlayerFromRoom(leftRoomName, leavingPlayer);

  session.roomName = null;
  session.seatedPlayer = null;

  socket.leave(leftRoomName);
}
