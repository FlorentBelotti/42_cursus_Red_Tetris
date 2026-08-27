import type { GameRoomRegistry } from '../domain/game_room_registry';
import type { Player } from '../domain/player';
import { registerGameLifecycleEventHandler } from './game_lifecycle_event_handler';
import { registerPlayerProgressEventHandler } from './player_progress_event_handler';
import { registerRoomMembershipEventHandler } from './room_membership_event_handler';
import { broadcastRoomStateToRoom } from './room_state_broadcaster';
import type { TypedSocket, TypedSocketIoServer } from './typed_socket_aliases';

export interface SocketRoomSession {
  roomName: string | null;
  seatedPlayer: Player | null;
}

export function registerConnectionLifecycleHandler(
  socketIoServer: TypedSocketIoServer,
  socket: TypedSocket,
  gameRoomRegistry: GameRoomRegistry,
): void {
  const session = createEmptySocketRoomSession();

  registerRoomMembershipEventHandler(socketIoServer, socket, gameRoomRegistry, session);
  registerGameLifecycleEventHandler(socketIoServer, socket, gameRoomRegistry, session);
  registerPlayerProgressEventHandler(socketIoServer, socket, gameRoomRegistry, session);

  socket.on('disconnect', () => {
    releaseSocketFromItsRoom(socketIoServer, socket, gameRoomRegistry, session);
  });
}

export function createEmptySocketRoomSession(): SocketRoomSession {
  return { roomName: null, seatedPlayer: null };
}

export function releaseSocketFromItsRoom(
  socketIoServer: TypedSocketIoServer,
  socket: TypedSocket,
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

  broadcastRoomStateToRoom(socketIoServer, gameRoomRegistry, leftRoomName);
}
