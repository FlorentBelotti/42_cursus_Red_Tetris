import { SOCKET_EVENT_NAMES } from 'shared';
import type { SpectrumColumnHeights } from 'shared';

import type { GameRoomRegistry } from '../domain/game_room_registry';
import type { TypedSocket, TypedSocketIoServer } from './typed_socket_aliases';

/**
 * Sends the room's full current state (players, host, status) to everyone in it.
 *
 * @param socketIoServer - The Socket.IO server instance.
 * @param gameRoomRegistry - Registry used to look up the room.
 * @param roomName - The room to broadcast to.
 */
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

/**
 * Sends a player's updated spectrum (column heights) to the rest of the room.
 *
 * @param reportingSocket - The socket of the player whose spectrum changed.
 * @param roomName - The room to broadcast to.
 * @param playerId - Id of the player whose spectrum changed.
 * @param spectrumColumnHeights - The updated column heights.
 */
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
