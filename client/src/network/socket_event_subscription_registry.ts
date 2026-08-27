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

/**
 * The three connection-lifecycle event names socket.io-client reserves for
 * itself. They are not part of the application protocol in
 * `shared/src/protocol/socket_event_names.ts` — every socket.io connection
 * has them, whatever it is used for — but the player still needs to see
 * whether they are connected, so this file listens for them alongside the
 * eight application events.
 */
const SOCKET_RESERVED_EVENT_NAMES = Object.freeze({
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
} as const);

/**
 * One handler per event this client can ever receive from the server: the
 * eight application events defined in
 * `shared/src/protocol/server_to_client_payloads.ts`, plus the three
 * connection-lifecycle events above.
 *
 * Every field is required on purpose. If a new server-to-client event is
 * ever added to the protocol, whoever builds this object next gets a
 * compile error here instead of an event that silently does nothing.
 */
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

/**
 * A function that removes every listener `registerSocketEventSubscriptions`
 * registered. Call it when whatever registered the handlers is torn down, so
 * a remount never leaves duplicate listeners behind — this matters in
 * particular under React StrictMode, which mounts effects twice in
 * development.
 */
export type UnsubscribeFromSocketEvents = () => void;

/**
 * Wires every event the server can send into the matching handler in
 * `handlers`.
 *
 * This is the only file that calls `socket.on(...)`: nothing outside
 * `client/src/network/` should listen to the socket directly. The caller —
 * in practice, `socket_redux_middleware.ts` —
 * decides what each event actually does, usually dispatching one Redux
 * action; this file only decides which socket event maps to which handler.
 *
 * @param socket - The socket to listen on.
 * @param handlers - One callback per event this socket can receive.
 * @returns A function that removes every listener registered here.
 */
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
