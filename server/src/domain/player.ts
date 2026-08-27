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

  getPlayerId() {return this.playerId}

  getSocketId() {return this.socketId}

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
