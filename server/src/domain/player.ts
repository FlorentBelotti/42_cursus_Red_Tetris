import { createEmptySpectrumColumnHeights, type SpectrumColumnHeights } from 'shared';


export class Player {
  private host: boolean
  private alive: boolean
  private name: string
  private playerId: string
  private socketId: string
  private latestSpectrum: SpectrumColumnHeights

  constructor(socketId: string, name: string) {
    this.playerId = socketId;
    this.socketId = socketId;
    this.name = name
    this.host = false
    this.alive = true
    this.latestSpectrum = createEmptySpectrumColumnHeights()
  }

  promoteToHost() {
    this.host = true
  }

  demoteFromHost() {
    this.host = false
  }

  setAliveToFalse() {
    this.alive = false
  }

  /**
   * The identity opponents know this player by. Stable for the whole time the
   * player is seated, and the only id that belongs in a protocol payload.
   *
   * @returns The player's stable identifier.
   */
  getPlayerId() {return this.playerId}

  /**
   * The connection this player is currently reachable on. Changes whenever the
   * player reconnects, so it must not be used as an identity.
   *
   * @returns The player's current socket id.
   */
  getSocketId() {return this.socketId}

  /**
   * Points this player at a new connection, keeping their identity intact.
   *
   * Unused while a disconnection frees the seat immediately; it exists so that
   * reconnection can later be supported without `playerId` ever changing.
   *
   * @param newSocketId - The socket the player is now connected on.
   */
  attachToSocket(newSocketId: string): void {
    this.socketId = newSocketId
  }

  getName(){return this.name}
  isAlive() {return this.alive}
  isHost() { return this.host}

  updateLatestSpectrum(spectrumColumnHeights: SpectrumColumnHeights): void {
    this.latestSpectrum = [...spectrumColumnHeights]
  }

  getLatestSpectrum(): SpectrumColumnHeights {
    return [...this.latestSpectrum]
  }

  resetForNewRound() {
    this.alive = true
    this.latestSpectrum = createEmptySpectrumColumnHeights()
  }
}
