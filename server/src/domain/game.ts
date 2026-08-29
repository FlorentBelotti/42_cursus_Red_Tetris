import {Player} from "./player"
import {GameAlreadyRunningError, GameEndedError, NameAlreadyInUse} from "../errors/management_errors"
import {HostSuccessionResolver} from "./host_succession_resolver"
import {PlayerPublicState, RoomPublicState, RoomStatus} from "shared"

const ROUND_SEED_VALUE_COUNT = 1000000

const LOWEST_ROUND_SEED_VALUE = 1

const NO_ROUND_SEED_YET = 0

const LINES_KEPT_BY_THE_CLEARING_PLAYER = 1

const NO_PENALTY_LINES = 0

const LAST_PLAYER_STANDING_COUNT = 1

const SOLO_ROOM_PLAYER_COUNT = 1

export class Game {
  private players: Player[];
  private readonly hostSuccessionResolver: HostSuccessionResolver;
  private roundSeed: number;
  status: RoomStatus;

  constructor(owner: Player) {
    this.players = [owner];
    this.status = 'waiting';
    this.roundSeed = NO_ROUND_SEED_YET;
    this.hostSuccessionResolver = new HostSuccessionResolver();
    this.hostSuccessionResolver.ensureRoomHasExactlyOneHost(this.players);
  }

  addPlayer(player: Player): void {
    if (this.status === "running") {
      throw new GameAlreadyRunningError(
        'This game cannot welcome any more players for it has already started',
      );
    }

    if (this.status === "finished") {
      throw new GameEndedError(
        'This game cannot welcome any more players for it is already finished',
      );
    }

    if (this.isNameAlreadyTaken(player.getName())) {
      throw new NameAlreadyInUse(
        `Another player in this room is already called ${player.getName()}`,
      );
    }

    this.players.push(player);
    this.hostSuccessionResolver.ensureRoomHasExactlyOneHost(this.players);
  }

  private isNameAlreadyTaken(candidateName: string): boolean {
    for (const player of this.players) {
      if (player.getName() === candidateName) {
        return true;
      }
    }

    return false;
  }

  removePlayer(player: Player): void {
    this.players = this.players.filter((remainingPlayer) => remainingPlayer !== player);
    player.demoteFromHost();
    this.hostSuccessionResolver.ensureRoomHasExactlyOneHost(this.players);
  }

  startRound(): void {
    if (this.status === 'running') {
      throw new GameAlreadyRunningError('This game has already started a round');
    }

    this.roundSeed = this.drawRoundSeed();
    this.resetEveryPlayerForNewRound();
    this.status = 'running';
  }

  private drawRoundSeed(): number {
    return Math.floor(Math.random() * ROUND_SEED_VALUE_COUNT) + LOWEST_ROUND_SEED_VALUE;
  }

  private resetEveryPlayerForNewRound(): void {
    for (const player of this.players) {
      player.resetForNewRound();
    }
  }

  getRoundSeed(): number {
    return this.roundSeed;
  }

  computePenaltyLineCount(clearedLineCount: number): number {
    const penaltyLineCount = clearedLineCount - LINES_KEPT_BY_THE_CLEARING_PLAYER;

    if (penaltyLineCount < NO_PENALTY_LINES) {
      return NO_PENALTY_LINES;
    }

    return penaltyLineCount;
  }

  listOpponentsToPenalise(clearingPlayer: Player): Player[] {
    const opponentsToPenalise: Player[] = [];

    for (const player of this.players) {
      if (player !== clearingPlayer && player.isAlive()) {
        opponentsToPenalise.push(player);
      }
    }

    return opponentsToPenalise;
  }

  markPlayerAsEliminated(player: Player): void {
    player.setAliveToFalse();

    if (this.isRoundOver()) {
      this.status = 'finished';
    }
  }

  countPlayersStillAlive(): number {
    let stillAliveCount = 0;

    for (const player of this.players) {
      if (player.isAlive()) {
        stillAliveCount = stillAliveCount + 1;
      }
    }

    return stillAliveCount;
  }

  isRoundOver(): boolean {
    if (this.status !== 'running') {
      return false;
    }

    const stillAliveCount = this.countPlayersStillAlive();

    if (this.players.length === SOLO_ROOM_PLAYER_COUNT) {
      return stillAliveCount === 0;
    }

    return stillAliveCount <= LAST_PLAYER_STANDING_COUNT;
  }

  resolveWinner(): Player | null {
    if (this.players.length === SOLO_ROOM_PLAYER_COUNT) {
      return null;
    }

    if (this.countPlayersStillAlive() !== LAST_PLAYER_STANDING_COUNT) {
      return null;
    }

    for (const player of this.players) {
      if (player.isAlive()) {
        return player;
      }
    }

    return null;
  }

  isEmpty(): boolean {
    return this.players.length === 0
  }

  getRoomPublicState(): RoomPublicState {
    return {
      status: this.status,
      hostPlayerId: this.findHostPlayerId(),
      players: this.buildPlayerPublicStates(),
    };
  }

  private findHostPlayerId(): string | null {
    for (const player of this.players) {
      if (player.isHost()) {
        return player.getPlayerId();
      }
    }

    return null;
  }

  private buildPlayerPublicStates(): PlayerPublicState[] {
    const playerPublicStates: PlayerPublicState[] = [];

    for (const player of this.players) {
      playerPublicStates.push({
        playerId: player.getPlayerId(),
        playerName: player.getName(),
        isHost: player.isHost(),
        isAlive: player.isAlive(),
      });
    }

    return playerPublicStates;
  }
}