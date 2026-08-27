import { isValidSpectrumColumnHeights, SOCKET_EVENT_NAMES } from 'shared';
import type { PlayerLinesClearedPayload, PlayerSpectrumUpdatePayload } from 'shared';

import type { Game } from '../domain/game';
import type { GameRoomRegistry } from '../domain/game_room_registry';
import type { Player } from '../domain/player';
import type { SocketRoomSession } from './connection_lifecycle_handler';
import { announceRoundFinishedWhenOver } from './game_lifecycle_event_handler';
import { broadcastRoomStateToRoom, broadcastSpectrumToOpponents } from './room_state_broadcaster';
import type { TypedSocket, TypedSocketIoServer } from './typed_socket_aliases';

/**
 * Most lines a single piece can complete at once. A tetromino spans four rows,
 * so anything above this did not come from a game of Tetris.
 */
const HIGHEST_CLEARABLE_LINE_COUNT = 4;

/** What a progress report needs to have around it to mean anything. */
interface RunningRoundContext {
  roomName: string;
  reportingPlayer: Player;
  game: Game;
}

/**
 * Registers the player progress events for a single connected socket.
 *
 * @param socketIoServer - The socket.io server, for room broadcasts.
 * @param socket - The connected client socket.
 * @param gameRoomRegistry - The registry owning every live room.
 * @param session - What this socket is currently seated as.
 */
export function registerPlayerProgressEventHandler(
  socketIoServer: TypedSocketIoServer,
  socket: TypedSocket,
  gameRoomRegistry: GameRoomRegistry,
  session: SocketRoomSession,
): void {
  socket.on(
    SOCKET_EVENT_NAMES.PLAYER_SPECTRUM_UPDATE,
    (payload: PlayerSpectrumUpdatePayload) => {
      handleSpectrumUpdate(socket, gameRoomRegistry, session, payload);
    },
  );

  socket.on(SOCKET_EVENT_NAMES.PLAYER_LINES_CLEARED, (payload: PlayerLinesClearedPayload) => {
    handleLinesCleared(socketIoServer, gameRoomRegistry, session, payload);
  });

  socket.on(SOCKET_EVENT_NAMES.PLAYER_GAME_OVER_REPORT, () => {
    handleGameOverReport(socketIoServer, gameRoomRegistry, session);
  });
}

/**
 * Records a player's freshly computed spectrum and relays it to their
 * opponents.
 *
 * The spectrum arrives from a client and is checked before it reaches the
 * domain: it is the one piece of board information the server stores, and a
 * malformed one would be handed straight back out to every opponent.
 *
 * @param socket - The reporting socket, used to relay without echoing back.
 * @param gameRoomRegistry - The registry owning every live room.
 * @param session - What the reporting socket is seated as.
 * @param payload - The reported column heights.
 */
function handleSpectrumUpdate(
  socket: TypedSocket,
  gameRoomRegistry: GameRoomRegistry,
  session: SocketRoomSession,
  payload: PlayerSpectrumUpdatePayload,
): void {
  const context = findRunningRoundContext(gameRoomRegistry, session);

  if (context === null) {
    return;
  }

  if (isValidSpectrumColumnHeights(payload?.spectrumColumnHeights) === false) {
    return;
  }

  context.reportingPlayer.updateLatestSpectrum(payload.spectrumColumnHeights);

  broadcastSpectrumToOpponents(
    socket,
    context.roomName,
    context.reportingPlayer.getPlayerId(),
    context.reportingPlayer.getLatestSpectrum(),
  );
}

/**
 * Sends every surviving opponent the penalty lines a clear earned them (C11).
 *
 * The count is derived by the domain, never taken from the client: the client
 * says how many lines it cleared, the server decides what that costs everyone
 * else.
 *
 * @param socketIoServer - The socket.io server, for per-player delivery.
 * @param gameRoomRegistry - The registry owning every live room.
 * @param session - What the reporting socket is seated as.
 * @param payload - How many lines the player cleared.
 */
function handleLinesCleared(
  socketIoServer: TypedSocketIoServer,
  gameRoomRegistry: GameRoomRegistry,
  session: SocketRoomSession,
  payload: PlayerLinesClearedPayload,
): void {
  const context = findRunningRoundContext(gameRoomRegistry, session);

  if (context === null) {
    return;
  }

  if (isUsableClearedLineCount(payload?.clearedLineCount) === false) {
    return;
  }

  const penaltyLineCount = context.game.computePenaltyLineCount(payload.clearedLineCount);

  if (penaltyLineCount === 0) {
    return;
  }

  sendPenaltyLinesToOpponents(socketIoServer, context, penaltyLineCount);
}

/**
 * Delivers penalty lines to each opponent individually.
 *
 * Delivery is per player rather than to the room, because the player who
 * cleared must not receive their own penalty, and because an opponent already
 * eliminated has no board left to push rows onto.
 *
 * @param socketIoServer - The socket.io server.
 * @param context - The room, the reporting player and their game.
 * @param penaltyLineCount - How many rows each opponent receives.
 */
function sendPenaltyLinesToOpponents(
  socketIoServer: TypedSocketIoServer,
  context: RunningRoundContext,
  penaltyLineCount: number,
): void {
  const opponentsToPenalise = context.game.listOpponentsToPenalise(context.reportingPlayer);

  for (const opponent of opponentsToPenalise) {
    socketIoServer.to(opponent.getSocketId()).emit(SOCKET_EVENT_NAMES.GAME_PENALTY_LINES_RECEIVED, {
      penaltyLineCount: penaltyLineCount,
      sourcePlayerId: context.reportingPlayer.getPlayerId(),
    });
  }
}

/**
 * Records a player's self-reported top-out (D5), tells the room, and closes the
 * round when nobody is left to play against (C14).
 *
 * @param socketIoServer - The socket.io server, for room broadcasts.
 * @param gameRoomRegistry - The registry owning every live room.
 * @param session - What the reporting socket is seated as.
 */
function handleGameOverReport(
  socketIoServer: TypedSocketIoServer,
  gameRoomRegistry: GameRoomRegistry,
  session: SocketRoomSession,
): void {
  const context = findRunningRoundContext(gameRoomRegistry, session);

  if (context === null) {
    return;
  }

  if (context.reportingPlayer.isAlive() === false) {
    return;
  }

  context.game.markPlayerAsEliminated(context.reportingPlayer);

  socketIoServer.to(context.roomName).emit(SOCKET_EVENT_NAMES.GAME_PLAYER_ELIMINATED, {
    playerId: context.reportingPlayer.getPlayerId(),
  });

  broadcastRoomStateToRoom(socketIoServer, gameRoomRegistry, context.roomName);
  announceRoundFinishedWhenOver(socketIoServer, context.game, context.roomName);
}

/**
 * Gathers what a progress report needs to mean anything: a seated player, a
 * live room, and a round actually being played.
 *
 * Reports arriving outside a running round are stale — a message sent just
 * before the round closed, or just after the reporter left — and acting on one
 * would resurrect state the room has moved past.
 *
 * @param gameRoomRegistry - The registry owning every live room.
 * @param session - What the reporting socket is seated as.
 * @returns The context of the running round, or null when there is none.
 */
function findRunningRoundContext(
  gameRoomRegistry: GameRoomRegistry,
  session: SocketRoomSession,
): RunningRoundContext | null {
  const roomName = session.roomName;
  const reportingPlayer = session.seatedPlayer;

  if (roomName === null || reportingPlayer === null) {
    return null;
  }

  const game = gameRoomRegistry.getRoomByName(roomName);

  if (game === undefined) {
    return null;
  }

  if (game.status !== 'running') {
    return null;
  }

  return { roomName: roomName, reportingPlayer: reportingPlayer, game: game };
}

/**
 * Tells whether a reported clear count could have come from a real game.
 *
 * @param candidateLineCount - The value received over the network.
 * @returns True when it is a whole number of lines a piece could clear.
 */
function isUsableClearedLineCount(candidateLineCount: unknown): boolean {
  if (typeof candidateLineCount !== 'number') {
    return false;
  }

  if (Number.isInteger(candidateLineCount) === false) {
    return false;
  }

  if (candidateLineCount < 0) {
    return false;
  }

  return candidateLineCount <= HIGHEST_CLEARABLE_LINE_COUNT;
}
