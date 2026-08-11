import { describe, expect, it } from 'vitest';

import { BOARD_COLUMN_COUNT } from 'shared';

import { Player } from './player';

describe('Player identity', () => {
  it('starts with a player id equal to the socket it connected on', () => {
    const alice = new Player('socket-1', 'alice');

    expect(alice.getPlayerId()).toBe('socket-1');
    expect(alice.getSocketId()).toBe('socket-1');
  });

  it('keeps the same player id after moving to another socket', () => {
    const alice = new Player('socket-1', 'alice');

    alice.attachToSocket('socket-2');

    expect(alice.getPlayerId()).toBe('socket-1');
  });

  it('reports the new socket after moving to another socket', () => {
    const alice = new Player('socket-1', 'alice');

    alice.attachToSocket('socket-2');

    expect(alice.getSocketId()).toBe('socket-2');
  });

  it('remembers the name it was created with', () => {
    const alice = new Player('socket-1', 'alice');

    expect(alice.getName()).toBe('alice');
  });
});

describe('Player host role', () => {
  it('is not host when created', () => {
    const alice = new Player('socket-1', 'alice');

    expect(alice.isHost()).toBe(false);
  });

  it('becomes host once promoted', () => {
    const alice = new Player('socket-1', 'alice');

    alice.promoteToHost();

    expect(alice.isHost()).toBe(true);
  });

  it('stops being host once demoted', () => {
    const alice = new Player('socket-1', 'alice');
    alice.promoteToHost();

    alice.demoteFromHost();

    expect(alice.isHost()).toBe(false);
  });
});

describe('Player alive state', () => {
  it('is alive when created', () => {
    const alice = new Player('socket-1', 'alice');

    expect(alice.isAlive()).toBe(true);
  });

  it('is no longer alive once eliminated', () => {
    const alice = new Player('socket-1', 'alice');

    alice.setAliveToFalse();

    expect(alice.isAlive()).toBe(false);
  });

  it('is alive again after a round reset', () => {
    const alice = new Player('socket-1', 'alice');
    alice.setAliveToFalse();

    alice.resetForNewRound();

    expect(alice.isAlive()).toBe(true);
  });

  it('keeps the host role through a round reset, so the host can restart', () => {
    const alice = new Player('socket-1', 'alice');
    alice.promoteToHost();

    alice.resetForNewRound();

    expect(alice.isHost()).toBe(true);
  });
});

describe('Player spectrum', () => {
  it('starts with an empty-board spectrum, one zero per column', () => {
    const alice = new Player('socket-1', 'alice');

    const startingSpectrum = alice.getLatestSpectrum();

    expect(startingSpectrum).toHaveLength(BOARD_COLUMN_COUNT);
    expect(startingSpectrum.every((columnHeight) => columnHeight === 0)).toBe(true);
  });

  it('remembers the spectrum it was last given', () => {
    const alice = new Player('socket-1', 'alice');
    const reportedSpectrum = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    alice.updateLatestSpectrum(reportedSpectrum);

    expect(alice.getLatestSpectrum()).toEqual(reportedSpectrum);
  });

  it('does not change when the array it was given is modified afterwards', () => {
    const alice = new Player('socket-1', 'alice');
    const reportedSpectrum = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    alice.updateLatestSpectrum(reportedSpectrum);

    reportedSpectrum[0] = 99;

    expect(alice.getLatestSpectrum()[0]).toBe(1);
  });

  it('cannot be rewritten through the array it hands back', () => {
    const alice = new Player('socket-1', 'alice');
    alice.updateLatestSpectrum([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    const handedBackSpectrum = alice.getLatestSpectrum() as number[];
    handedBackSpectrum[0] = 99;

    expect(alice.getLatestSpectrum()[0]).toBe(1);
  });

  it('goes back to an empty-board spectrum after a round reset', () => {
    const alice = new Player('socket-1', 'alice');
    alice.updateLatestSpectrum([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    alice.resetForNewRound();

    expect(alice.getLatestSpectrum().every((columnHeight) => columnHeight === 0)).toBe(true);
  });
});
