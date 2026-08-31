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

/**
 * Wires up all the event handlers for one connected socket (room membership,
 * game lifecycle, player progress) and cleans up its room seat on disconnect.
 *
 * @param socketIoServer - The Socket.IO server instance.
 * @param socket - The newly connected socket.
 * @param gameRoomRegistry - Registry used to look up and mutate rooms.
 */
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

/**
 * Creates a fresh, empty room session for a socket that hasn't joined a room yet.
 *
 * @returns A session with no room and no seated player.
 */
export function createEmptySocketRoomSession(): SocketRoomSession {
  return { roomName: null, seatedPlayer: null };
}

/**
 * Removes the socket's player from its current room, if any, clears the
 * session, and notifies the rest of the room of the updated state.
 *
 * @param socketIoServer - The Socket.IO server instance.
 * @param socket - The socket leaving its room.
 * @param gameRoomRegistry - Registry used to look up and mutate rooms.
 * @param session - The socket's current room session, mutated in place.
 */
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
