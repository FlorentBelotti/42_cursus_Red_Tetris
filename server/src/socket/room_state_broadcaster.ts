import { SOCKET_EVENT_NAMES } from 'shared';
import type { SpectrumColumnHeights } from 'shared';

import type { GameRoomRegistry } from '../domain/game_room_registry';
import type { TypedSocket, TypedSocketIoServer } from './typed_socket_aliases';

/**
 * Sends every member of a room the room's current state.
 *
 * The state is sent in full, never as a delta (§7, decision 3), so a client
 * that missed an earlier broadcast is corrected by the next one instead of
 * drifting.
 *
 * Broadcasting to a room that no longer exists does nothing: the registry
 * destroys a room when its last player leaves, and that departure is exactly
 * when a handler would ask for one more broadcast.
 *
 * @param socketIoServer - The socket.io server, typed against the protocol.
 * @param gameRoomRegistry - The registry owning every live room.
 * @param roomName - The room whose members should be updated.
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
 * Relays one player's freshly reported spectrum to the rest of their room.
 *
 * The broadcast goes out through the reporting player's own socket, which
 * excludes them from it: a player already knows the shape of their own board,
 * and sending it back would have every client filter out its own id on every
 * piece lock.
 *
 * @param reportingSocket - The socket of the player whose spectrum changed.
 * @param roomName - The room to relay into.
 * @param playerId - Stable identity of the player the spectrum belongs to.
 * @param spectrumColumnHeights - The freshly reported column heights.
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
