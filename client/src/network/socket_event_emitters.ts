import { SOCKET_EVENT_NAMES } from 'shared';
import type {
  PlayerLinesClearedPayload,
  PlayerSpectrumUpdatePayload,
  RoomJoinRequestPayload,
} from 'shared';

import type { TypedClientSocket } from './socket_client_factory';

/**
 * Sends `room:join_request`. Sent once, on mount, built from the two parts
 * of the join URL `http://<host>:<port>/<room>/<player_name>` (C6). The
 * server answers with either `room:join_accepted` or `room:join_rejected` —
 * both are handled in `socket_event_subscription_registry.ts`, never here.
 *
 * @param socket - The socket to send the request on.
 * @param payload - The room name and player name to join with.
 */
export function emitRoomJoinRequest(
  socket: TypedClientSocket,
  payload: RoomJoinRequestPayload,
): void {
  socket.emit(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, payload);
}

/**
 * Sends `room:leave_request`: an explicit leave, which the server treats
 * differently from a plain disconnect.
 *
 * @param socket - The socket to send the request on.
 */
export function emitRoomLeaveRequest(socket: TypedClientSocket): void {
  socket.emit(SOCKET_EVENT_NAMES.ROOM_LEAVE_REQUEST);
}

/**
 * Sends `game:start_request`. Only meaningful when the local player is the
 * room's host (C12): the server silently ignores the request otherwise, so
 * the UI must not offer the start control to a non-host in the first place,
 * rather than relying on the server to reject it.
 *
 * @param socket - The socket to send the request on.
 */
export function emitGameStartRequest(socket: TypedClientSocket): void {
  socket.emit(SOCKET_EVENT_NAMES.GAME_START_REQUEST);
}

/**
 * Sends `player:spectrum_update`. Meant to be sent after every piece lock,
 * so opponents can redraw this player's spectrum in real time.
 *
 * @param socket - The socket to send the update on.
 * @param payload - The ten column heights making up this player's spectrum.
 */
export function emitPlayerSpectrumUpdate(
  socket: TypedClientSocket,
  payload: PlayerSpectrumUpdatePayload,
): void {
  socket.emit(SOCKET_EVENT_NAMES.PLAYER_SPECTRUM_UPDATE, payload);
}

/**
 * Sends `player:lines_cleared`. The client reports only how many lines it
 * cleared; the server derives the penalty owed to every opponent from that
 * count (C11) — this function never sends a penalty count itself.
 *
 * @param socket - The socket to send the report on.
 * @param payload - How many lines the piece that just locked cleared.
 */
export function emitPlayerLinesCleared(
  socket: TypedClientSocket,
  payload: PlayerLinesClearedPayload,
): void {
  socket.emit(SOCKET_EVENT_NAMES.PLAYER_LINES_CLEARED, payload);
}

/**
 * Sends `player:game_over_report`: this player's own self-reported top-out
 * (D5). The server records the elimination and evaluates the round's win
 * condition (C14). Always reports this player's own elimination, never an
 * opponent's.
 *
 * @param socket - The socket to send the report on.
 */
export function emitPlayerGameOverReport(socket: TypedClientSocket): void {
  socket.emit(SOCKET_EVENT_NAMES.PLAYER_GAME_OVER_REPORT);
}
