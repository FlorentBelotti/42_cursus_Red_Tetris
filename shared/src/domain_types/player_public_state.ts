/**
 * Everything the other players in a room are told about one player.
 *
 * Deliberately small: a player's board never leaves their own client (D1), and
 * their spectrum travels on its own event rather than in here, so that a
 * membership change does not re-broadcast every board shape in the room.
 */
export interface PlayerPublicState {
  /** Stable identity of the player, unchanged for as long as they are seated. */
  readonly playerId: string;

  /** The name the player joined under, as shown in the lobby. */
  readonly playerName: string;

  /** Whether this player controls starting and restarting the round (C12). */
  readonly isHost: boolean;

  /** Whether this player is still playing, as opposed to topped out (C14). */
  readonly isAlive: boolean;
}
