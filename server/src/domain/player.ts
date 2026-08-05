export class Player {
  private host: boolean
  private alive: boolean
  private name: string
  private socketId: string

  constructor(socketId: string, name: string = "Anna") {
    this.socketId = socketId;
    this.name = name
    this.host = false
    this.alive = true
  }

  promoteToHost() {
    this.host = true
  }

  getSocketId() {return this.socketId}
  getName(){return this.name}
  getState() {return this.alive}

}
