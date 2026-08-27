import { PlayerPublicState } from './player_public_state.js';

export type RoomStatus = 'waiting' | 'running' | 'finished';

export interface RoomPublicState {
  readonly status: RoomStatus;

  readonly hostPlayerId: string | null;

  readonly players: readonly PlayerPublicState[];
}
