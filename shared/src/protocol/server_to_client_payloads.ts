import { SpectrumColumnHeights } from '../domain_types/spectrum_column_heights';
import { RoomPublicState } from '../domain_types/room_public_state';

/**
 * Why a join request was turned down. The room name and the player name have
 * their own code: they come from two different parts of the join URL, and a
 * client that is told which one to fix can say so instead of asking the player
 * to guess.
 */
export type JoinRejectionReasonCode =
  | 'game_already_started'
  | 'player_name_already_taken'
  | 'invalid_room_name'
  | 'invalid_player_name';

/**
 * The server's answer to an accepted `room:join_request`. Carries the whole
 * room state so the client can render its lobby from this one event, with no
 * follow-up round trip.
 */
export interface RoomJoinAcceptedPayload {
  readonly playerId: string;
  readonly isHost: boolean;
  readonly roomState: RoomPublicState;
}

/** The server's answer to a refused `room:join_request`. */
export interface RoomJoinRejectedPayload {
  readonly reasonCode: JoinRejectionReasonCode;
}

/**
 * Broadcast to a room on any membership change: someone joined, left, was
 * eliminated, or became host. Always the full state, never a delta — see §7 of
 * CLAUDE.md, decision 3.
 */
export interface RoomStateUpdatedPayload {
  readonly roomState: RoomPublicState;
}

/**
 * Opens a round. The seed is the only thing sent: every client derives the very
 * same piece sequence from it with the shared generator (C10, D2), so no piece
 * ever travels over the wire.
 */
export interface GameRoundStartedPayload {
  readonly pieceSequenceSeed: number;
}

/**
 * Tells a player how many indestructible rows to push onto their board because
 * an opponent cleared lines (C11). The receiving client applies them itself and
 * reports its own top-out if that pushes it over the ceiling (D5).
 */
export interface GamePenaltyLinesReceivedPayload {
  readonly penaltyLineCount: number;
  readonly sourcePlayerId: string;
}

/** Relays one opponent's freshly reported spectrum to the rest of the room. */
export interface GameOpponentSpectrumUpdatedPayload {
  readonly playerId: string;
  readonly spectrumColumnHeights: SpectrumColumnHeights;
}

/** Announces that a player has topped out and is out of the round (C14). */
export interface GamePlayerEliminatedPayload {
  readonly playerId: string;
}

/**
 * Closes a round. `winnerPlayerId` is null when the round had no winner, which
 * covers a solo round and a room whose last players went out together (C14).
 */
export interface GameRoundFinishedPayload {
  readonly winnerPlayerId: string | null;
}
