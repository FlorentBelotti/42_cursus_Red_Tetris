import { SOCKET_EVENT_NAMES } from 'shared';

import type { Game } from '../domain/game';
import type { GameRoomRegistry } from '../domain/game_room_registry';
import { GameAlreadyRunningError } from '../errors/management_errors';
import type { SocketRoomSession } from './connection_lifecycle_handler';
import { broadcastRoomStateToRoom } from './room_state_broadcaster';
import type { TypedSocket, TypedSocketIoServer } from './typed_socket_aliases';

/**
 * Registers the game lifecycle events for a single connected socket.
 *
 * @param socketIoServer - The socket.io server, for room broadcasts.
 * @param socket - The connected client socket.
 * @param gameRoomRegistry - The registry owning every live room.
 * @param session - What this socket is currently seated as.
 */
export function registerGameLifecycleEventHandler(
  socketIoServer: TypedSocketIoServer,
  socket: TypedSocket,
  gameRoomRegistry: GameRoomRegistry,
  session: SocketRoomSession,
): void {
  socket.on(SOCKET_EVENT_NAMES.GAME_START_REQUEST, () => {
    handleGameStartRequest(socketIoServer, gameRoomRegistry, session);
  });
}

/**
 * Starts the round of the room this socket sits in, when the socket is
 * entitled to ask (C12: the host controls start and restart).
 *
 * A request that is not entitled is ignored rather than answered: the protocol
 * has no start rejection event, because the client only shows the start control
 * to the host in the first place. A request arriving anyway is either a stale
 * click from someone who has just lost the role, or a hand-crafted message —
 * neither deserves a reply, and neither may change the room.
 *
 * @param socketIoServer - The socket.io server, for room broadcasts.
 * @param gameRoomRegistry - The registry owning every live room.
 * @param session - What the requesting socket is seated as.
 */
function handleGameStartRequest(
  socketIoServer: TypedSocketIoServer,
  gameRoomRegistry: GameRoomRegistry,
  session: SocketRoomSession,
): void {
  const roomName = session.roomName;
  const requestingPlayer = session.seatedPlayer;

  if (roomName === null || requestingPlayer === null) {
    return;
  }

  if (requestingPlayer.isHost() === false) {
    return;
  }

  const game = gameRoomRegistry.getRoomByName(roomName);

  if (game === undefined) {
    return;
  }

  if (startRoundOrIgnore(game) === false) {
    return;
  }

  broadcastRoomStateToRoom(socketIoServer, gameRoomRegistry, roomName);
  announceRoundStarted(socketIoServer, game, roomName);
}

/**
 * Starts a round, treating "already running" as nothing to do rather than as a
 * failure. Two hosts cannot exist at once, but one host double-clicking can,
 * and the second click must not draw a new seed mid-round.
 *
 * @param game - The room's game.
 * @returns True when this call actually started a round, false otherwise.
 */
function startRoundOrIgnore(game: Game): boolean {
  try {
    game.startRound();
    return true;
  } catch (startFailure) {
    if (startFailure instanceof GameAlreadyRunningError) {
      return false;
    }

    throw startFailure;
  }
}

/**
 * Tells a room its round has begun, and on which seed.
 *
 * The seed is the whole payload: every client derives the identical piece
 * sequence from it (C10, D2), so no piece ever travels over the wire.
 *
 * @param socketIoServer - The socket.io server, for the room broadcast.
 * @param game - The room's game, holding the freshly drawn seed.
 * @param roomName - The room to announce into.
 */
function announceRoundStarted(
  socketIoServer: TypedSocketIoServer,
  game: Game,
  roomName: string,
): void {
  socketIoServer.to(roomName).emit(SOCKET_EVENT_NAMES.GAME_ROUND_STARTED, {
    pieceSequenceSeed: game.getRoundSeed(),
  });
}

/**
 * Tells a room its round is over and who won, but only once the round has
 * actually closed. Safe to call after every elimination, which is how
 * player_progress_event_handler uses it.
 *
 * @param socketIoServer - The socket.io server, for the room broadcast.
 * @param game - The room's game.
 * @param roomName - The room to announce into.
 */
export function announceRoundFinishedWhenOver(
  socketIoServer: TypedSocketIoServer,
  game: Game,
  roomName: string,
): void {
  if (game.status !== 'finished') {
    return;
  }

  socketIoServer.to(roomName).emit(SOCKET_EVENT_NAMES.GAME_ROUND_FINISHED, {
    winnerPlayerId: findWinnerPlayerId(game),
  });
}

/**
 * The identity of the round's winner, in the form the protocol carries.
 *
 * @param game - The room's finished game.
 * @returns The winner's stable player id, or null when the round had none —
 *          a solo round, or a room whose last players went out together (C14).
 */
function findWinnerPlayerId(game: Game): string | null {
  const winningPlayer = game.resolveWinner();

  if (winningPlayer === null) {
    return null;
  }

  return winningPlayer.getPlayerId();
}
