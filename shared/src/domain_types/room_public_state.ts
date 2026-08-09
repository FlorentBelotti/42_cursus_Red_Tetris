/**
 * Everything a client is told about the room it sits in.
 *
 * Sent in full on every update rather than as a delta: a room holds a handful
 * of players, so the payload is small, and a client that receives the whole
 * state cannot drift out of sync with the server no matter which broadcast it
 * missed.
 */
import { PlayerPublicState } from './player_public_state';

/** Where a room is in its round cycle. */
export type RoomStatus = 'waiting' | 'running' | 'finished';

export interface RoomPublicState {
  /** Whether the room is waiting for a start, playing, or finished. */
  readonly status: RoomStatus;

  /**
   * The player who controls start and restart, or null when the room holds no
   * player at all. Always matches the one player whose `isHost` is true.
   */
  readonly hostPlayerId: string | null;

  /** Every player in the room, in the order they joined. */
  readonly players: readonly PlayerPublicState[];
}
