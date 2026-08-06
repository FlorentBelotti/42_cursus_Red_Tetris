
import { Player } from './player';

export class HostSuccessionResolver {

  ensureRoomHasExactlyOneHost(players: Player[]): void {
    if (players.length === 0) {
      return;
    }

    const hostCount = this.countHosts(players);

    if (hostCount === 1) {
      return;
    }

    if (hostCount === 0) {
      this.promoteFirstPlayer(players);
    } else {
      this.keepOnlyTheFirstHost(players);
    }
  }

  private countHosts(players: Player[]): number {
    let hostCount = 0;

    for (const player of players) {
      if (player.isHost()) {
        hostCount = hostCount + 1;
      }
    }

    return hostCount;
  }

  private promoteFirstPlayer(players: Player[]): void {
    const firstPlayer = players[0];

    if (firstPlayer === undefined) {
      return;
    }

    firstPlayer.promoteToHost();
  }

  private keepOnlyTheFirstHost(players: Player[]): void {
    let firstHostWasKept = false;

    for (const player of players) {
      if (player.isHost()) {
        if (firstHostWasKept) {
          player.demoteFromHost();
        } else {
          firstHostWasKept = true;
        }
      }
    }
  }
}
