import { SpectrumColumnHeights } from '../domain_types/spectrum_column_heights.js';

export interface RoomJoinRequestPayload {
  readonly roomName: string;
  readonly playerName: string;
}

export interface PlayerSpectrumUpdatePayload {
  readonly spectrumColumnHeights: SpectrumColumnHeights;
}

export interface PlayerLinesClearedPayload {
  readonly clearedLineCount: number;
}
