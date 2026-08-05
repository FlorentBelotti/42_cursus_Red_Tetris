import {Game} from './game'
import {Player} from "./player"

export class GameRoomRegistry {
  private games: Map<string, Game>;

  constructor() {
    this.games = new Map<string, Game>();
  }

  getRoomByName(name: string): Game | undefined {
    return this.games.get(name)
  }

  roomExists(name: string): boolean {
    return this.games.has(name)
  }

  addPlayerToRoom(name: string, player: Player) {
    let game = this.getRoomByName(name)

    if (game === undefined) {
      game = new Game(player)
      this.games.set(name, game)
      return game
    }
    else {
      game.addPlayer(player)
      return game
    }
  }

  removePlayerFromRoom(name: string, player: Player) {
    const game = this.getRoomByName(name)

    if (game == undefined)
      return;
    else {
      game.removePlayer(player);
      this.destroyIfEmptyRoom(name, game)
    }
  }

  destroyIfEmptyRoom(name: string, game: Game) {
    if (game.isEmpty()) {
      this.games.delete(name);
    }
    else
      return;
  }

}