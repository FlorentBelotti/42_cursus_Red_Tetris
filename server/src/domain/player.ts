import {
  createEmptySpectrumColumnHeights,
  type SpectrumColumnHeights,
} from 'shared/src/domain_types/spectrum_column_heights';

export class Player {
  private host: boolean
  private alive: boolean
  private name: string
  private socketId: string
  private latestSpectrum: SpectrumColumnHeights

  constructor(socketId: string, name: string) {
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

  getSocketId() {return this.socketId}
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
