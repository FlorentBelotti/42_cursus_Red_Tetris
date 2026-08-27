import { SpectrumColumnHeights } from '../domain_types/spectrum_column_heights.js';
import { RoomPublicState } from '../domain_types/room_public_state.js';

export type JoinRejectionReasonCode =
  | 'game_already_started'
  | 'player_name_already_taken'
  | 'invalid_room_name'
  | 'invalid_player_name';

export interface RoomJoinAcceptedPayload {
  readonly playerId: string;
  readonly isHost: boolean;
  readonly roomState: RoomPublicState;
}

export interface RoomJoinRejectedPayload {
  readonly reasonCode: JoinRejectionReasonCode;
}

export interface RoomStateUpdatedPayload {
  readonly roomState: RoomPublicState;
}

export interface GameRoundStartedPayload {
  readonly pieceSequenceSeed: number;
}

export interface GamePenaltyLinesReceivedPayload {
  readonly penaltyLineCount: number;
  readonly sourcePlayerId: string;
}

export interface GameOpponentSpectrumUpdatedPayload {
  readonly playerId: string;
  readonly spectrumColumnHeights: SpectrumColumnHeights;
}

export interface GamePlayerEliminatedPayload {
  readonly playerId: string;
}

export interface GameRoundFinishedPayload {
  readonly winnerPlayerId: string | null;
}
