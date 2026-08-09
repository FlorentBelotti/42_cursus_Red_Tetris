import { describe, expect, it } from 'vitest';

import { GameAlreadyRunningError, NameAlreadyInUse } from '../errors/management_errors';
import { GameRoomRegistry } from './game_room_registry';
import { Player } from './player';

function createPlayerNamed(playerName: string): Player {
  return new Player(`socket-${playerName}`, playerName);
}

describe('GameRoomRegistry room creation', () => {
  it('has no room before anyone joins', () => {
    const registry = new GameRoomRegistry();

    expect(registry.roomExists('nether')).toBe(false);
  });

  it('finds nothing when asked for a room that does not exist', () => {
    const registry = new GameRoomRegistry();

    expect(registry.getRoomByName('nether')).toBeUndefined();
  });

  it('creates the room when its first player joins', () => {
    const registry = new GameRoomRegistry();

    registry.addPlayerToRoom('nether', createPlayerNamed('alice'));

    expect(registry.roomExists('nether')).toBe(true);
  });

  it('hands back the game it just created', () => {
    const registry = new GameRoomRegistry();

    const createdGame = registry.addPlayerToRoom('nether', createPlayerNamed('alice'));

    expect(registry.getRoomByName('nether')).toBe(createdGame);
  });

  it('makes the first player of a new room its host', () => {
    const registry = new GameRoomRegistry();
    const alice = createPlayerNamed('alice');

    registry.addPlayerToRoom('nether', alice);

    expect(alice.isHost()).toBe(true);
  });
});

describe('GameRoomRegistry joining an existing room', () => {
  it('puts a second player in the room that already exists', () => {
    const registry = new GameRoomRegistry();
    const firstGame = registry.addPlayerToRoom('nether', createPlayerNamed('alice'));

    const secondGame = registry.addPlayerToRoom('nether', createPlayerNamed('bob'));

    expect(secondGame).toBe(firstGame);
  });

  it('lists both players in the room', () => {
    const registry = new GameRoomRegistry();
    registry.addPlayerToRoom('nether', createPlayerNamed('alice'));

    const game = registry.addPlayerToRoom('nether', createPlayerNamed('bob'));

    expect(game.getRoomPublicState().players).toHaveLength(2);
  });

  it('does not make a later player the host', () => {
    const registry = new GameRoomRegistry();
    const bob = createPlayerNamed('bob');
    registry.addPlayerToRoom('nether', createPlayerNamed('alice'));

    registry.addPlayerToRoom('nether', bob);

    expect(bob.isHost()).toBe(false);
  });

  it('lets the room refuse a name that is already taken there', () => {
    const registry = new GameRoomRegistry();
    registry.addPlayerToRoom('nether', createPlayerNamed('alice'));

    expect(() => registry.addPlayerToRoom('nether', createPlayerNamed('alice'))).toThrow(
      NameAlreadyInUse,
    );
  });

  it('lets the room refuse a player once its round is running (C13)', () => {
    const registry = new GameRoomRegistry();
    const game = registry.addPlayerToRoom('nether', createPlayerNamed('alice'));
    game.startRound();

    expect(() => registry.addPlayerToRoom('nether', createPlayerNamed('bob'))).toThrow(
      GameAlreadyRunningError,
    );
  });
});

describe('GameRoomRegistry several rooms at once (C14)', () => {
  it('keeps two rooms apart', () => {
    const registry = new GameRoomRegistry();

    registry.addPlayerToRoom('nether', createPlayerNamed('alice'));
    registry.addPlayerToRoom('overworld', createPlayerNamed('bob'));

    expect(registry.getRoomByName('nether')).not.toBe(registry.getRoomByName('overworld'));
  });

  it('lets the same name be used in two different rooms', () => {
    const registry = new GameRoomRegistry();
    registry.addPlayerToRoom('nether', createPlayerNamed('alice'));

    expect(() =>
      registry.addPlayerToRoom('overworld', createPlayerNamed('alice')),
    ).not.toThrow();
  });

  it('makes the first player of each room its own host', () => {
    const registry = new GameRoomRegistry();
    const alice = createPlayerNamed('alice');
    const bob = createPlayerNamed('bob');

    registry.addPlayerToRoom('nether', alice);
    registry.addPlayerToRoom('overworld', bob);

    expect(alice.isHost()).toBe(true);
    expect(bob.isHost()).toBe(true);
  });

  it('does not touch one room when a player leaves the other', () => {
    const registry = new GameRoomRegistry();
    const alice = createPlayerNamed('alice');
    registry.addPlayerToRoom('nether', alice);
    registry.addPlayerToRoom('overworld', createPlayerNamed('bob'));

    registry.removePlayerFromRoom('nether', alice);

    expect(registry.roomExists('overworld')).toBe(true);
  });
});

describe('GameRoomRegistry leaving and room destruction', () => {
  it('removes the player from the room', () => {
    const registry = new GameRoomRegistry();
    const alice = createPlayerNamed('alice');
    const game = registry.addPlayerToRoom('nether', alice);
    registry.addPlayerToRoom('nether', createPlayerNamed('bob'));

    registry.removePlayerFromRoom('nether', alice);

    expect(game.getRoomPublicState().players).toHaveLength(1);
  });

  it('keeps the room alive while a player is still in it', () => {
    const registry = new GameRoomRegistry();
    const alice = createPlayerNamed('alice');
    registry.addPlayerToRoom('nether', alice);
    registry.addPlayerToRoom('nether', createPlayerNamed('bob'));

    registry.removePlayerFromRoom('nether', alice);

    expect(registry.roomExists('nether')).toBe(true);
  });

  it('destroys the room once its last player leaves', () => {
    const registry = new GameRoomRegistry();
    const alice = createPlayerNamed('alice');
    registry.addPlayerToRoom('nether', alice);

    registry.removePlayerFromRoom('nether', alice);

    expect(registry.roomExists('nether')).toBe(false);
  });

  it('promotes a new host when the host leaves (C12)', () => {
    const registry = new GameRoomRegistry();
    const alice = createPlayerNamed('alice');
    const bob = createPlayerNamed('bob');
    registry.addPlayerToRoom('nether', alice);
    registry.addPlayerToRoom('nether', bob);

    registry.removePlayerFromRoom('nether', alice);

    expect(bob.isHost()).toBe(true);
  });

  it('frees the room name for reuse after the room is destroyed', () => {
    const registry = new GameRoomRegistry();
    const alice = createPlayerNamed('alice');
    const firstGame = registry.addPlayerToRoom('nether', alice);
    registry.removePlayerFromRoom('nether', alice);

    const secondGame = registry.addPlayerToRoom('nether', createPlayerNamed('bob'));

    expect(secondGame).not.toBe(firstGame);
  });

  it('does nothing when removing a player from a room that does not exist', () => {
    const registry = new GameRoomRegistry();

    expect(() =>
      registry.removePlayerFromRoom('nether', createPlayerNamed('alice')),
    ).not.toThrow();
  });

  it('does nothing when removing a player who was never in that room', () => {
    const registry = new GameRoomRegistry();
    registry.addPlayerToRoom('nether', createPlayerNamed('alice'));

    registry.removePlayerFromRoom('nether', createPlayerNamed('mallory'));

    expect(registry.roomExists('nether')).toBe(true);
  });

  it('survives the same player being removed twice', () => {
    const registry = new GameRoomRegistry();
    const alice = createPlayerNamed('alice');
    registry.addPlayerToRoom('nether', alice);
    registry.addPlayerToRoom('nether', createPlayerNamed('bob'));

    registry.removePlayerFromRoom('nether', alice);

    expect(() => registry.removePlayerFromRoom('nether', alice)).not.toThrow();
  });
});
