import {Player} from "./player"
import {GameAlreadyRunningError, GameEndedError} from "../errors/management_errors"
import {HostSuccessionResolver} from "./host_succession_resolver"

export class Game {
  private players: Player[];
  private readonly hostSuccessionResolver: HostSuccessionResolver;
  status: 'waiting' | 'running' | 'finished';

  constructor(owner: Player) {
    this.players = [owner];
    this.status = 'waiting';
    this.hostSuccessionResolver = new HostSuccessionResolver();
    this.hostSuccessionResolver.ensureRoomHasExactlyOneHost(this.players);
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
    this.players = this.players.filter((remainingPlayer) => remainingPlayer !== player);
    player.demoteFromHost();
    this.hostSuccessionResolver.ensureRoomHasExactlyOneHost(this.players);
  }

  startRound() {
    this.status = 'running'
  }

  isEmpty(): boolean {
    return this.players.length === 0
  }

  getRoomPublicState() {return this.status}
}