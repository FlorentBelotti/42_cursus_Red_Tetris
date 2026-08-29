import { SOCKET_EVENT_NAMES } from 'shared';
import type {
  PlayerLinesClearedPayload,
  PlayerSpectrumUpdatePayload,
  RoomJoinRequestPayload,
} from 'shared';

import type { TypedClientSocket } from './socket_client_factory';

export function emitRoomJoinRequest(
  socket: TypedClientSocket,
  payload: RoomJoinRequestPayload,
): void {
  socket.emit(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, payload);
}

export function emitRoomLeaveRequest(socket: TypedClientSocket): void {
  socket.emit(SOCKET_EVENT_NAMES.ROOM_LEAVE_REQUEST);
}

export function emitGameStartRequest(socket: TypedClientSocket): void {
  socket.emit(SOCKET_EVENT_NAMES.GAME_START_REQUEST);
}

export function emitPlayerSpectrumUpdate(
  socket: TypedClientSocket,
  payload: PlayerSpectrumUpdatePayload,
): void {
  socket.emit(SOCKET_EVENT_NAMES.PLAYER_SPECTRUM_UPDATE, payload);
}

export function emitPlayerLinesCleared(
  socket: TypedClientSocket,
  payload: PlayerLinesClearedPayload,
): void {
  socket.emit(SOCKET_EVENT_NAMES.PLAYER_LINES_CLEARED, payload);
}

export function emitPlayerGameOverReport(socket: TypedClientSocket): void {
  socket.emit(SOCKET_EVENT_NAMES.PLAYER_GAME_OVER_REPORT);
}
