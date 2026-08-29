export class GameAlreadyRunningError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GameAlreadyRunningError';
  }
}

export class NameAlreadyInUse extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NameAlreadyInUse';
  }
}
