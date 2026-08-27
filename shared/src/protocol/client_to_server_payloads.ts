import { SpectrumColumnHeights } from '../domain_types/spectrum_column_heights';

/**
 * Sent on mount, built from the two parts of the join URL
 * `http://<host>:<port>/<room>/<player_name>` (C6). May be rejected.
 */
export interface RoomJoinRequestPayload {
  readonly roomName: string;
  readonly playerName: string;
}

/**
 * Sent after every piece lock, so opponents can redraw this player's spectrum.
 */
export interface PlayerSpectrumUpdatePayload {
  readonly spectrumColumnHeights: SpectrumColumnHeights;
}

/**
 * Sent when the player completes one or more lines. The server derives the
 * penalty from this count (C11); the client never computes it itself.
 */
export interface PlayerLinesClearedPayload {
  readonly clearedLineCount: number;
}
