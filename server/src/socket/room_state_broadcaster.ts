import { SOCKET_EVENT_NAMES } from 'shared';
import type { SpectrumColumnHeights } from 'shared';

import type { GameRoomRegistry } from '../domain/game_room_registry';
import type { TypedSocket, TypedSocketIoServer } from './typed_socket_aliases';

export function broadcastRoomStateToRoom(
  socketIoServer: TypedSocketIoServer,
  gameRoomRegistry: GameRoomRegistry,
  roomName: string,
): void {
  const game = gameRoomRegistry.getRoomByName(roomName);

  if (game === undefined) {
    return;
  }

  socketIoServer.to(roomName).emit(SOCKET_EVENT_NAMES.ROOM_STATE_UPDATED, {
    roomState: game.getRoomPublicState(),
  });
}

export function broadcastSpectrumToOpponents(
  reportingSocket: TypedSocket,
  roomName: string,
  playerId: string,
  spectrumColumnHeights: SpectrumColumnHeights,
): void {
  reportingSocket.to(roomName).emit(SOCKET_EVENT_NAMES.GAME_OPPONENT_SPECTRUM_UPDATED, {
    playerId: playerId,
    spectrumColumnHeights: spectrumColumnHeights,
  });
}
