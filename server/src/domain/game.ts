import Player from "./player"

export class Game {
  private players: Player[];
  status: 'waiting' | 'running' | 'finished';

  constructor(owner: Player) {
    owner.promoteToHost();
    this.players = [owner];
    this.status = 'waiting';
  }

  addPlayer(player: Player): void {
    if (this.status == "waiting") {
      if (!this.players.includes(player)) {
        this.players.push(player);
      }}
    else {
      console.log("This game cannot welcome any more players for it has already started or is finished")
    }
  }

  removePlayer(player: Player): void {
    this.players = this.players.filter((p) => p !== player);
  }
}

