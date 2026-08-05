import {Player } from "../domain/player"

class GameAlreadyRunningError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GameAlreadyRunningError';
  }
}

class NameAlreadyInUse extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NameAlreadyInUse';
  }
}

class GameEndedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GameEndedError';
  }
}