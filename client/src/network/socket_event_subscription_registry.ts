import { SOCKET_EVENT_NAMES } from 'shared';
import type {
  GameOpponentSpectrumUpdatedPayload,
  GamePenaltyLinesReceivedPayload,
  GamePlayerEliminatedPayload,
  GameRoundFinishedPayload,
  GameRoundStartedPayload,
  RoomJoinAcceptedPayload,
  RoomJoinRejectedPayload,
  RoomStateUpdatedPayload,
} from 'shared';
import type { Socket } from 'socket.io-client';

import type { TypedClientSocket } from './socket_client_factory';

const SOCKET_RESERVED_EVENT_NAMES = Object.freeze({
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
} as const);

export interface SocketEventHandlers {
  readonly onConnected: () => void;
  readonly onDisconnected: (reason: Socket.DisconnectReason) => void;
  readonly onConnectError: (connectionError: Error) => void;
  readonly onRoomJoinAccepted: (payload: RoomJoinAcceptedPayload) => void;
  readonly onRoomJoinRejected: (payload: RoomJoinRejectedPayload) => void;
  readonly onRoomStateUpdated: (payload: RoomStateUpdatedPayload) => void;
  readonly onGameRoundStarted: (payload: GameRoundStartedPayload) => void;
  readonly onGamePenaltyLinesReceived: (payload: GamePenaltyLinesReceivedPayload) => void;
  readonly onGameOpponentSpectrumUpdated: (payload: GameOpponentSpectrumUpdatedPayload) => void;
  readonly onGamePlayerEliminated: (payload: GamePlayerEliminatedPayload) => void;
  readonly onGameRoundFinished: (payload: GameRoundFinishedPayload) => void;
}

export type UnsubscribeFromSocketEvents = () => void;

export function registerSocketEventSubscriptions(
  socket: TypedClientSocket,
  handlers: SocketEventHandlers,
): UnsubscribeFromSocketEvents {
  socket.on(SOCKET_RESERVED_EVENT_NAMES.CONNECT, handlers.onConnected);
  socket.on(SOCKET_RESERVED_EVENT_NAMES.DISCONNECT, handlers.onDisconnected);
  socket.on(SOCKET_RESERVED_EVENT_NAMES.CONNECT_ERROR, handlers.onConnectError);

  socket.on(SOCKET_EVENT_NAMES.ROOM_JOIN_ACCEPTED, handlers.onRoomJoinAccepted);
  socket.on(SOCKET_EVENT_NAMES.ROOM_JOIN_REJECTED, handlers.onRoomJoinRejected);
  socket.on(SOCKET_EVENT_NAMES.ROOM_STATE_UPDATED, handlers.onRoomStateUpdated);
  socket.on(SOCKET_EVENT_NAMES.GAME_ROUND_STARTED, handlers.onGameRoundStarted);
  socket.on(SOCKET_EVENT_NAMES.GAME_PENALTY_LINES_RECEIVED, handlers.onGamePenaltyLinesReceived);
  socket.on(
    SOCKET_EVENT_NAMES.GAME_OPPONENT_SPECTRUM_UPDATED,
    handlers.onGameOpponentSpectrumUpdated,
  );
  socket.on(SOCKET_EVENT_NAMES.GAME_PLAYER_ELIMINATED, handlers.onGamePlayerEliminated);
  socket.on(SOCKET_EVENT_NAMES.GAME_ROUND_FINISHED, handlers.onGameRoundFinished);

  return function unsubscribeFromSocketEvents(): void {
    socket.off(SOCKET_RESERVED_EVENT_NAMES.CONNECT, handlers.onConnected);
    socket.off(SOCKET_RESERVED_EVENT_NAMES.DISCONNECT, handlers.onDisconnected);
    socket.off(SOCKET_RESERVED_EVENT_NAMES.CONNECT_ERROR, handlers.onConnectError);

    socket.off(SOCKET_EVENT_NAMES.ROOM_JOIN_ACCEPTED, handlers.onRoomJoinAccepted);
    socket.off(SOCKET_EVENT_NAMES.ROOM_JOIN_REJECTED, handlers.onRoomJoinRejected);
    socket.off(SOCKET_EVENT_NAMES.ROOM_STATE_UPDATED, handlers.onRoomStateUpdated);
    socket.off(SOCKET_EVENT_NAMES.GAME_ROUND_STARTED, handlers.onGameRoundStarted);
    socket.off(SOCKET_EVENT_NAMES.GAME_PENALTY_LINES_RECEIVED, handlers.onGamePenaltyLinesReceived);
    socket.off(
      SOCKET_EVENT_NAMES.GAME_OPPONENT_SPECTRUM_UPDATED,
      handlers.onGameOpponentSpectrumUpdated,
    );
    socket.off(SOCKET_EVENT_NAMES.GAME_PLAYER_ELIMINATED, handlers.onGamePlayerEliminated);
    socket.off(SOCKET_EVENT_NAMES.GAME_ROUND_FINISHED, handlers.onGameRoundFinished);
  };
}
