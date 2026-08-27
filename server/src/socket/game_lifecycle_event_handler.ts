import { SOCKET_EVENT_NAMES } from 'shared';

import type { Game } from '../domain/game';
import type { GameRoomRegistry } from '../domain/game_room_registry';
import { GameAlreadyRunningError } from '../errors/management_errors';
import type { SocketRoomSession } from './connection_lifecycle_handler';
import { broadcastRoomStateToRoom } from './room_state_broadcaster';
import type { TypedSocket, TypedSocketIoServer } from './typed_socket_aliases';

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

function announceRoundStarted(
  socketIoServer: TypedSocketIoServer,
  game: Game,
  roomName: string,
): void {
  socketIoServer.to(roomName).emit(SOCKET_EVENT_NAMES.GAME_ROUND_STARTED, {
    pieceSequenceSeed: game.getRoundSeed(),
  });
}

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

function findWinnerPlayerId(game: Game): string | null {
  const winningPlayer = game.resolveWinner();

  if (winningPlayer === null) {
    return null;
  }

  return winningPlayer.getPlayerId();
}
