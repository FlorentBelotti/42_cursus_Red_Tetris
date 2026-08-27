export interface PlayerPublicState {
  readonly playerId: string;

  readonly playerName: string;

  readonly isHost: boolean;

  readonly isAlive: boolean;
}
