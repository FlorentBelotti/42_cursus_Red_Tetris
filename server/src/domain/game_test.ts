import { describe, expect, it } from 'vitest';

import { GameAlreadyRunningError, NameAlreadyInUse } from '../errors/management_errors';
import { Game } from './game';
import { Player } from './player';

function createPlayerNamed(playerName: string): Player {
  return new Player(`socket-${playerName}`, playerName);
}

describe('Game host succession (C12)', () => {
  it('makes the player who created the room the host', () => {
    const alice = createPlayerNamed('alice');

    new Game(alice);

    expect(alice.isHost()).toBe(true);
  });

  it('does not give the host role to a player who joins later', () => {
    const alice = createPlayerNamed('alice');
    const bob = createPlayerNamed('bob');
    const game = new Game(alice);

    game.addPlayer(bob);

    expect(alice.isHost()).toBe(true);
    expect(bob.isHost()).toBe(false);
  });

  it('gives the host role to the next player when the host leaves', () => {
    const alice = createPlayerNamed('alice');
    const bob = createPlayerNamed('bob');
    const carol = createPlayerNamed('carol');
    const game = new Game(alice);
    game.addPlayer(bob);
    game.addPlayer(carol);

    game.removePlayer(alice);

    expect(bob.isHost()).toBe(true);
    expect(carol.isHost()).toBe(false);
  });

  it('takes the host role away from the player who leaves', () => {
    const alice = createPlayerNamed('alice');
    const bob = createPlayerNamed('bob');
    const game = new Game(alice);
    game.addPlayer(bob);

    game.removePlayer(alice);

    expect(alice.isHost()).toBe(false);
  });

  it('keeps the same host when a player who is not the host leaves', () => {
    const alice = createPlayerNamed('alice');
    const bob = createPlayerNamed('bob');
    const game = new Game(alice);
    game.addPlayer(bob);

    game.removePlayer(bob);

    expect(alice.isHost()).toBe(true);
  });

  it('still has one host after two hosts have left one after the other', () => {
    const alice = createPlayerNamed('alice');
    const bob = createPlayerNamed('bob');
    const carol = createPlayerNamed('carol');
    const game = new Game(alice);
    game.addPlayer(bob);
    game.addPlayer(carol);

    game.removePlayer(alice);
    game.removePlayer(bob);

    expect(carol.isHost()).toBe(true);
    expect(game.isEmpty()).toBe(false);
  });

  it('becomes empty without failing when the last player leaves', () => {
    const alice = createPlayerNamed('alice');
    const game = new Game(alice);

    game.removePlayer(alice);

    expect(game.isEmpty()).toBe(true);
    expect(alice.isHost()).toBe(false);
  });

  it('does nothing when removing a player who was never in the room', () => {
    const alice = createPlayerNamed('alice');
    const mallory = createPlayerNamed('mallory');
    const game = new Game(alice);

    game.removePlayer(mallory);

    expect(alice.isHost()).toBe(true);
    expect(game.isEmpty()).toBe(false);
  });
});

describe('Game room public state', () => {
  it('reports a new room as waiting', () => {
    const game = new Game(createPlayerNamed('alice'));

    expect(game.getRoomPublicState().status).toBe('waiting');
  });

  it('reports the room as running once the round has started', () => {
    const game = new Game(createPlayerNamed('alice'));

    game.startRound();

    expect(game.getRoomPublicState().status).toBe('running');
  });

  it('names the host', () => {
    const alice = createPlayerNamed('alice');
    const game = new Game(alice);

    expect(game.getRoomPublicState().hostPlayerId).toBe(alice.getPlayerId());
  });

  it('has no host to name once the room is empty', () => {
    const alice = createPlayerNamed('alice');
    const game = new Game(alice);

    game.removePlayer(alice);

    expect(game.getRoomPublicState().hostPlayerId).toBeNull();
  });

  it('lists every player in the order they joined', () => {
    const alice = createPlayerNamed('alice');
    const bob = createPlayerNamed('bob');
    const carol = createPlayerNamed('carol');
    const game = new Game(alice);
    game.addPlayer(bob);
    game.addPlayer(carol);

    const listedNames = game.getRoomPublicState().players.map((player) => player.playerName);

    expect(listedNames).toEqual(['alice', 'bob', 'carol']);
  });

  it('describes each player with their identity, name, role and alive state', () => {
    const alice = createPlayerNamed('alice');
    const game = new Game(alice);

    const [firstPlayerState] = game.getRoomPublicState().players;

    expect(firstPlayerState).toEqual({
      playerId: alice.getPlayerId(),
      playerName: 'alice',
      isHost: true,
      isAlive: true,
    });
  });

  it('marks exactly one player as host', () => {
    const game = new Game(createPlayerNamed('alice'));
    game.addPlayer(createPlayerNamed('bob'));
    game.addPlayer(createPlayerNamed('carol'));

    const hostStates = game.getRoomPublicState().players.filter((player) => player.isHost);

    expect(hostStates).toHaveLength(1);
  });

  it('agrees with itself about who the host is', () => {
    const game = new Game(createPlayerNamed('alice'));
    game.addPlayer(createPlayerNamed('bob'));

    const roomState = game.getRoomPublicState();
    const flaggedHost = roomState.players.find((player) => player.isHost);

    expect(flaggedHost?.playerId).toBe(roomState.hostPlayerId);
  });

  it('shows a player as no longer alive once they are eliminated', () => {
    const alice = createPlayerNamed('alice');
    const game = new Game(alice);

    alice.setAliveToFalse();

    expect(game.getRoomPublicState().players[0]?.isAlive).toBe(false);
  });

  it('follows host succession after the host leaves', () => {
    const alice = createPlayerNamed('alice');
    const bob = createPlayerNamed('bob');
    const game = new Game(alice);
    game.addPlayer(bob);

    game.removePlayer(alice);

    const roomState = game.getRoomPublicState();

    expect(roomState.hostPlayerId).toBe(bob.getPlayerId());
    expect(roomState.players).toHaveLength(1);
  });

  it('is rebuilt on each call rather than handed back from a cache', () => {
    const alice = createPlayerNamed('alice');
    const game = new Game(alice);

    const stateBeforeJoin = game.getRoomPublicState();
    game.addPlayer(createPlayerNamed('bob'));
    const stateAfterJoin = game.getRoomPublicState();

    expect(stateBeforeJoin.players).toHaveLength(1);
    expect(stateAfterJoin.players).toHaveLength(2);
  });
});

describe('Game duplicate player names', () => {
  it('refuses a player whose name is already used in the room', () => {
    const game = new Game(createPlayerNamed('alice'));

    expect(() => game.addPlayer(createPlayerNamed('alice'))).toThrow(NameAlreadyInUse);
  });

  it('accepts a player whose name nobody else uses', () => {
    const game = new Game(createPlayerNamed('alice'));

    game.addPlayer(createPlayerNamed('bob'));

    expect(game.getRoomPublicState().players).toHaveLength(2);
  });

  it('treats names that differ only by case as different names', () => {
    const game = new Game(createPlayerNamed('alice'));

    game.addPlayer(createPlayerNamed('Alice'));

    expect(game.getRoomPublicState().players).toHaveLength(2);
  });

  it('frees a name again once its owner has left', () => {
    const alice = createPlayerNamed('alice');
    const game = new Game(alice);
    game.addPlayer(createPlayerNamed('bob'));

    game.removePlayer(alice);

    expect(() => game.addPlayer(createPlayerNamed('alice'))).not.toThrow();
  });
});

describe('Game round start and seed (C10, C12)', () => {
  it('has no seed before the first round', () => {
    const game = new Game(createPlayerNamed('alice'));

    expect(game.getRoundSeed()).toBe(0);
  });

  it('draws a seed when the round starts', () => {
    const game = new Game(createPlayerNamed('alice'));

    game.startRound();

    expect(game.getRoundSeed()).toBeGreaterThan(0);
  });

  it('refuses to start a round that is already running', () => {
    const game = new Game(createPlayerNamed('alice'));
    game.startRound();

    expect(() => game.startRound()).toThrow(GameAlreadyRunningError);
  });

  it('brings eliminated players back to life on a restart', () => {
    const alice = createPlayerNamed('alice');
    const bob = createPlayerNamed('bob');
    const game = new Game(alice);
    game.addPlayer(bob);
    game.startRound();
    game.markPlayerAsEliminated(alice);

    game.startRound();

    expect(alice.isAlive()).toBe(true);
    expect(bob.isAlive()).toBe(true);
  });

  it('draws a different seed on a restart', () => {
    const alice = createPlayerNamed('alice');
    const game = new Game(alice);
    game.addPlayer(createPlayerNamed('bob'));
    game.startRound();
    const firstRoundSeed = game.getRoundSeed();
    game.markPlayerAsEliminated(alice);

    game.startRound();

    expect(game.getRoundSeed()).not.toBe(firstRoundSeed);
  });

  it('leaves the host in place across a restart, so they can start again', () => {
    const alice = createPlayerNamed('alice');
    const game = new Game(alice);

    game.startRound();

    expect(alice.isHost()).toBe(true);
  });
});

describe('Game penalty lines (C11)', () => {
  it('sends nothing for a single cleared line', () => {
    const game = new Game(createPlayerNamed('alice'));

    expect(game.computePenaltyLineCount(1)).toBe(0);
  });

  it('sends one line for two cleared lines', () => {
    const game = new Game(createPlayerNamed('alice'));

    expect(game.computePenaltyLineCount(2)).toBe(1);
  });

  it('sends three lines for a four-line clear', () => {
    const game = new Game(createPlayerNamed('alice'));

    expect(game.computePenaltyLineCount(4)).toBe(3);
  });

  it('never sends a negative number of lines when nothing was cleared', () => {
    const game = new Game(createPlayerNamed('alice'));

    expect(game.computePenaltyLineCount(0)).toBe(0);
  });

  it('penalises every opponent but not the player who cleared', () => {
    const alice = createPlayerNamed('alice');
    const bob = createPlayerNamed('bob');
    const carol = createPlayerNamed('carol');
    const game = new Game(alice);
    game.addPlayer(bob);
    game.addPlayer(carol);

    const penalisedPlayers = game.listOpponentsToPenalise(alice);

    expect(penalisedPlayers).toEqual([bob, carol]);
  });

  it('does not penalise an opponent who is already out', () => {
    const alice = createPlayerNamed('alice');
    const bob = createPlayerNamed('bob');
    const carol = createPlayerNamed('carol');
    const game = new Game(alice);
    game.addPlayer(bob);
    game.addPlayer(carol);
    game.startRound();

    game.markPlayerAsEliminated(bob);

    expect(game.listOpponentsToPenalise(alice)).toEqual([carol]);
  });

  it('has nobody to penalise in a solo room', () => {
    const alice = createPlayerNamed('alice');
    const game = new Game(alice);

    expect(game.listOpponentsToPenalise(alice)).toEqual([]);
  });
});

describe('Game elimination and winner (C14)', () => {
  it('marks an eliminated player as no longer alive', () => {
    const alice = createPlayerNamed('alice');
    const game = new Game(alice);
    game.addPlayer(createPlayerNamed('bob'));
    game.startRound();

    game.markPlayerAsEliminated(alice);

    expect(alice.isAlive()).toBe(false);
  });

  it('keeps the round running while two players are still standing', () => {
    const game = new Game(createPlayerNamed('alice'));
    game.addPlayer(createPlayerNamed('bob'));
    game.addPlayer(createPlayerNamed('carol'));
    game.startRound();

    game.markPlayerAsEliminated(createPlayerNamed('nobody'));

    expect(game.status).toBe('running');
  });

  it('finishes the round when only one player is left standing', () => {
    const alice = createPlayerNamed('alice');
    const bob = createPlayerNamed('bob');
    const game = new Game(alice);
    game.addPlayer(bob);
    game.startRound();

    game.markPlayerAsEliminated(alice);

    expect(game.status).toBe('finished');
  });

  it('names the last player standing as the winner', () => {
    const alice = createPlayerNamed('alice');
    const bob = createPlayerNamed('bob');
    const game = new Game(alice);
    game.addPlayer(bob);
    game.startRound();

    game.markPlayerAsEliminated(alice);

    expect(game.resolveWinner()).toBe(bob);
  });

  it('has no winner while the round is still being played', () => {
    const game = new Game(createPlayerNamed('alice'));
    game.addPlayer(createPlayerNamed('bob'));
    game.startRound();

    expect(game.resolveWinner()).toBeNull();
  });

  it('finishes a solo round when its only player tops out', () => {
    const alice = createPlayerNamed('alice');
    const game = new Game(alice);
    game.startRound();

    game.markPlayerAsEliminated(alice);

    expect(game.status).toBe('finished');
  });

  it('has no winner in a solo round, as the protocol expects', () => {
    const alice = createPlayerNamed('alice');
    const game = new Game(alice);
    game.startRound();

    game.markPlayerAsEliminated(alice);

    expect(game.resolveWinner()).toBeNull();
  });

  it('does not consider a round over before it has started', () => {
    const game = new Game(createPlayerNamed('alice'));

    expect(game.isRoundOver()).toBe(false);
  });

  it('counts the players still standing', () => {
    const alice = createPlayerNamed('alice');
    const game = new Game(alice);
    game.addPlayer(createPlayerNamed('bob'));
    game.addPlayer(createPlayerNamed('carol'));
    game.startRound();

    game.markPlayerAsEliminated(alice);

    expect(game.countPlayersStillAlive()).toBe(2);
  });

  it('accepts new players once the round has finished, before it is relaunched', () => {
    const alice = createPlayerNamed('alice');
    const game = new Game(alice);
    game.startRound();
    game.markPlayerAsEliminated(alice);

    const bob = createPlayerNamed('bob');

    expect(() => game.addPlayer(bob)).not.toThrow();
    expect(game.getRoomPublicState().players.map((player) => player.playerName)).toContain(
      'bob',
    );
  });

  it('refuses new players while the round is running (C13)', () => {
    const game = new Game(createPlayerNamed('alice'));
    game.addPlayer(createPlayerNamed('bob'));
    game.startRound();

    expect(() => game.addPlayer(createPlayerNamed('carol'))).toThrow(GameAlreadyRunningError);
  });
});
