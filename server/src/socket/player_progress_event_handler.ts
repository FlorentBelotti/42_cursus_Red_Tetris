import { isValidSpectrumColumnHeights, SOCKET_EVENT_NAMES } from 'shared';
import type { PlayerLinesClearedPayload, PlayerSpectrumUpdatePayload } from 'shared';

import type { Game } from '../domain/game';
import type { GameRoomRegistry } from '../domain/game_room_registry';
import type { Player } from '../domain/player';
import type { SocketRoomSession } from './connection_lifecycle_handler';
import { announceRoundFinishedWhenOver } from './game_lifecycle_event_handler';
import { broadcastRoomStateToRoom, broadcastSpectrumToOpponents } from './room_state_broadcaster';
import type { TypedSocket, TypedSocketIoServer } from './typed_socket_aliases';

const HIGHEST_CLEARABLE_LINE_COUNT = 4;

interface RunningRoundContext {
  roomName: string;
  reportingPlayer: Player;
  game: Game;
}

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
