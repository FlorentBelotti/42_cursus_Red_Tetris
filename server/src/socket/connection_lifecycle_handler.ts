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
 * Registers every event handler for a single newly connected socket, and owns
 * the seat that socket holds for as long as it stays connected.
 *
 * @param socketIoServer - The socket.io server, for room broadcasts.
 * @param socket - The newly connected client socket.
 * @param gameRoomRegistry - The registry owning every live room.
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
 * Builds the empty seat a socket starts its life with.
 *
 * @returns A session seated in no room and holding no player.
 */
export function createEmptySocketRoomSession(): SocketRoomSession {
  return { roomName: null, seatedPlayer: null };
}

/**
 * Takes a socket out of whatever room it is seated in and tells the players
 * left behind. Does nothing when the socket was never seated, which is what
 * makes it safe to call from a disconnection, an explicit leave, and a re-join
 * alike.
 *
 * A disconnection frees the seat at once (§7, decision 2), so this is also the
 * whole of the reconnect story: a client that comes back is a new player.
 *
 * Host succession is not decided here — `Game.removePlayer` promotes a new host
 * when the leaving player held the role (C12), and the broadcast below carries
 * the outcome.
 *
 * @param socketIoServer - The socket.io server, for the room broadcast.
 * @param socket - The socket leaving its room.
 * @param gameRoomRegistry - The registry owning every live room.
 * @param session - The seat to release, emptied in place.
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
