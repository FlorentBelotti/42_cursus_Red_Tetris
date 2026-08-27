import {Player} from "./player"
import {GameAlreadyRunningError, GameEndedError, NameAlreadyInUse} from "../errors/management_errors"
import {HostSuccessionResolver} from "./host_succession_resolver"
import {PlayerPublicState, RoomPublicState, RoomStatus} from "shared"

/** How many distinct values a round seed can take. */
const ROUND_SEED_VALUE_COUNT = 1000000

/**
 * Lowest value a real round seed can take. Seeds start at 1 so that 0 stays
 * reserved for "no round has started yet" and can never be a real seed.
 */
const LOWEST_ROUND_SEED_VALUE = 1

/** Seed value of a room whose first round has not started yet. */
const NO_ROUND_SEED_YET = 0

/** How many cleared lines stay with the player who cleared them (C11). */
const LINES_KEPT_BY_THE_CLEARING_PLAYER = 1

/** Number of penalty lines sent when a clear is too small to send any. */
const NO_PENALTY_LINES = 0

/** How many players are left alive when one player has won (C14). */
const LAST_PLAYER_STANDING_COUNT = 1

/** How many players a solo room holds (C14). */
const SOLO_ROOM_PLAYER_COUNT = 1

export class Game {
  private players: Player[];
  private readonly hostSuccessionResolver: HostSuccessionResolver;
  private roundSeed: number;
  status: RoomStatus;

  constructor(owner: Player) {
    this.players = [owner];
    this.status = 'waiting';
    this.roundSeed = NO_ROUND_SEED_YET;
    this.hostSuccessionResolver = new HostSuccessionResolver();
    this.hostSuccessionResolver.ensureRoomHasExactlyOneHost(this.players);
  }

  /**
   * Seats a new player in the room.
   *
   * @param player - The player asking to join.
   * @throws GameAlreadyRunningError when the round is already running (C13).
   * @throws GameEndedError when the round is over and not restarted yet.
   * @throws NameAlreadyInUse when another player in this room uses that name.
   */
  addPlayer(player: Player): void {
    if (this.status === "running") {
      throw new GameAlreadyRunningError(
        'This game cannot welcome any more players for it has already started',
      );
    }

    if (this.status === "finished") {
      throw new GameEndedError(
        'This game cannot welcome any more players for it is already finished',
      );
    }

    if (this.isNameAlreadyTaken(player.getName())) {
      throw new NameAlreadyInUse(
        `Another player in this room is already called ${player.getName()}`,
      );
    }

    this.players.push(player);
    this.hostSuccessionResolver.ensureRoomHasExactlyOneHost(this.players);
  }

  /**
   * Tells whether a name is already used by someone in this room. The
   * comparison is exact, so "Alice" and "alice" are two different names.
   *
   * @param candidateName - The name a joining player wants to use.
   * @returns True when the name is taken, false otherwise.
   */
  private isNameAlreadyTaken(candidateName: string): boolean {
    for (const player of this.players) {
      if (player.getName() === candidateName) {
        return true;
      }
    }

    return false;
  }

  removePlayer(player: Player): void {
    this.players = this.players.filter((remainingPlayer) => remainingPlayer !== player);
    player.demoteFromHost();
    this.hostSuccessionResolver.ensureRoomHasExactlyOneHost(this.players);
  }

  /**
   * Starts a round, or restarts one that has finished (C12: the host controls
   * both). Draws a fresh seed and puts every player back to a clean slate, so
   * a restart never carries the previous round's eliminations or spectrums.
   *
   * @throws GameAlreadyRunningError when a round is already running.
   */
  startRound(): void {
    if (this.status === 'running') {
      throw new GameAlreadyRunningError('This game has already started a round');
    }

    this.roundSeed = this.drawRoundSeed();
    this.resetEveryPlayerForNewRound();
    this.status = 'running';
  }

  /**
   * Draws the seed every client of this room derives its piece sequence from
   * (C10, D2). One draw per round, broadcast once; the sequence itself is
   * never generated here.
   *
   * @returns A fresh seed for the round about to start.
   */
  private drawRoundSeed(): number {
    return Math.floor(Math.random() * ROUND_SEED_VALUE_COUNT) + LOWEST_ROUND_SEED_VALUE;
  }

  /**
   * Puts every seated player back to alive with an empty spectrum.
   */
  private resetEveryPlayerForNewRound(): void {
    for (const player of this.players) {
      player.resetForNewRound();
    }
  }

  /**
   * The seed of the current round, which every client of this room uses to
   * derive the very same piece sequence (C10).
   *
   * @returns The current round's seed, or 0 before the first round starts.
   */
  getRoundSeed(): number {
    return this.roundSeed;
  }

  /**
   * How many penalty lines a clear sends to each opponent: one fewer than the
   * number of lines cleared (C11). A single cleared line sends nothing.
   *
   * @param clearedLineCount - How many lines the player just cleared.
   * @returns The number of penalty lines each opponent receives.
   */
  computePenaltyLineCount(clearedLineCount: number): number {
    const penaltyLineCount = clearedLineCount - LINES_KEPT_BY_THE_CLEARING_PLAYER;

    if (penaltyLineCount < NO_PENALTY_LINES) {
      return NO_PENALTY_LINES;
    }

    return penaltyLineCount;
  }

  /**
   * The players a clear should penalise: everyone in the room except the
   * player who cleared, and only those still in the round.
   *
   * @param clearingPlayer - The player who just cleared lines.
   * @returns The opponents that should receive penalty lines.
   */
  listOpponentsToPenalise(clearingPlayer: Player): Player[] {
    const opponentsToPenalise: Player[] = [];

    for (const player of this.players) {
      if (player !== clearingPlayer && player.isAlive()) {
        opponentsToPenalise.push(player);
      }
    }

    return opponentsToPenalise;
  }

  /**
   * Records that a player has topped out, and closes the round when that
   * leaves nobody left to play against (C14).
   *
   * @param player - The player who reported their own top-out (D5).
   */
  markPlayerAsEliminated(player: Player): void {
    player.setAliveToFalse();

    if (this.isRoundOver()) {
      this.status = 'finished';
    }
  }

  /**
   * Counts the players still in the round.
   *
   * @returns How many seated players are still alive.
   */
  countPlayersStillAlive(): number {
    let stillAliveCount = 0;

    for (const player of this.players) {
      if (player.isAlive()) {
        stillAliveCount = stillAliveCount + 1;
      }
    }

    return stillAliveCount;
  }

  /**
   * Tells whether the round has run its course.
   *
   * A solo round ends when its single player tops out; any other room ends as
   * soon as one player is left standing (C14).
   *
   * @returns True when the round should be closed, false otherwise.
   */
  isRoundOver(): boolean {
    if (this.status !== 'running') {
      return false;
    }

    const stillAliveCount = this.countPlayersStillAlive();

    if (this.players.length === SOLO_ROOM_PLAYER_COUNT) {
      return stillAliveCount === 0;
    }

    return stillAliveCount <= LAST_PLAYER_STANDING_COUNT;
  }

  /**
   * The winner of the round: the last player standing (C14).
   *
   * A solo round has no winner by design, and neither has a room where the
   * last players were eliminated together, so both return null — which is what
   * `game:round_finished` carries as `winnerPlayerId: null`.
   *
   * @returns The winning player, or null when the round has no winner.
   */
  resolveWinner(): Player | null {
    if (this.players.length === SOLO_ROOM_PLAYER_COUNT) {
      return null;
    }

    if (this.countPlayersStillAlive() !== LAST_PLAYER_STANDING_COUNT) {
      return null;
    }

    for (const player of this.players) {
      if (player.isAlive()) {
        return player;
      }
    }

    return null;
  }

  isEmpty(): boolean {
    return this.players.length === 0
  }

  /**
   * Builds everything the clients of this room are told about it: its status,
   * who holds the host role, and the full player list in join order.
   *
   * The whole state is rebuilt on every call rather than kept as a cached
   * object, so it can never fall behind the players it describes.
   *
   * @returns The room state, ready to be sent as-is over the protocol.
   */
  getRoomPublicState(): RoomPublicState {
    return {
      status: this.status,
      hostPlayerId: this.findHostPlayerId(),
      players: this.buildPlayerPublicStates(),
    };
  }

  /**
   * Finds the identity of the player currently holding the host role.
   *
   * HostSuccessionResolver guarantees a non-empty room has exactly one host,
   * so the first one found is the only one.
   *
   * @returns The host's stable player id, or null when the room is empty.
   */
  private findHostPlayerId(): string | null {
    for (const player of this.players) {
      if (player.isHost()) {
        return player.getPlayerId();
      }
    }

    return null;
  }

  /**
   * Turns every seated player into the public view opponents are allowed to
   * see. Boards stay private (D1) and spectrums travel on their own event.
   *
   * @returns One public state per player, in join order.
   */
  private buildPlayerPublicStates(): PlayerPublicState[] {
    const playerPublicStates: PlayerPublicState[] = [];

    for (const player of this.players) {
      playerPublicStates.push({
        playerId: player.getPlayerId(),
        playerName: player.getName(),
        isHost: player.isHost(),
        isAlive: player.isAlive(),
      });
    }

    return playerPublicStates;
  }
}