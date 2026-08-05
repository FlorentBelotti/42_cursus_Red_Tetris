import {Player} from "./player"
import {GameAlreadyRunningError, GameEndedError} from "../errors/management_errors"

export class Game {
  private players: Player[];
  status: 'waiting' | 'running' | 'finished';

  constructor(owner: Player) {
    owner.promoteToHost();
    this.players = [owner];
    this.status = 'waiting';
  }

  addPlayer(player: Player): void {
    if (this.status === "waiting") {
      if (!this.players.includes(player)) {
        this.players.push(player);
      }}
    else if (this.status === "running") {
      throw new GameAlreadyRunningError(
        'This game cannot welcome any more players for it has already started',
      );
    }
    else if (this.status === "finished") {
      throw new GameEndedError(
        'This game cannot welcome any more players for it is already finished',
      );
    }
  }

  removePlayer(player: Player): void {
    this.players = this.players.filter((p) => p !== player);
  }

  startRound() {
    this.status = 'running'
  }

  isEmpty(): boolean {
    return this.players.length === 0
  }
}