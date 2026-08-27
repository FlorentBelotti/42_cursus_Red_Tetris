import { describe, expect, it } from 'vitest';

import { HostSuccessionResolver } from './host_succession_resolver';
import { Player } from './player';

function createPlayerNamed(playerName: string): Player {
  return new Player(`socket-${playerName}`, playerName);
}

describe('HostSuccessionResolver', () => {
  it('gives the host role to the only player of a new room', () => {
    const resolver = new HostSuccessionResolver();
    const alice = createPlayerNamed('alice');

    resolver.ensureRoomHasExactlyOneHost([alice]);

    expect(alice.isHost()).toBe(true);
  });

  it('gives the host role to the player who arrived first', () => {
    const resolver = new HostSuccessionResolver();
    const alice = createPlayerNamed('alice');
    const bob = createPlayerNamed('bob');

    resolver.ensureRoomHasExactlyOneHost([alice, bob]);

    expect(alice.isHost()).toBe(true);
    expect(bob.isHost()).toBe(false);
  });

  it('does nothing with an empty room', () => {
    const resolver = new HostSuccessionResolver();

    expect(() => resolver.ensureRoomHasExactlyOneHost([])).not.toThrow();
  });

  it('keeps the host already in place', () => {
    const resolver = new HostSuccessionResolver();
    const alice = createPlayerNamed('alice');
    const bob = createPlayerNamed('bob');
    alice.promoteToHost();

    resolver.ensureRoomHasExactlyOneHost([alice, bob]);

    expect(alice.isHost()).toBe(true);
    expect(bob.isHost()).toBe(false);
  });

  it('keeps a host even when they are not the first player', () => {
    const resolver = new HostSuccessionResolver();
    const alice = createPlayerNamed('alice');
    const bob = createPlayerNamed('bob');
    bob.promoteToHost();

    resolver.ensureRoomHasExactlyOneHost([alice, bob]);

    expect(bob.isHost()).toBe(true);
    expect(alice.isHost()).toBe(false);
  });

  it('keeps only the first host when the room has several', () => {
    const resolver = new HostSuccessionResolver();
    const alice = createPlayerNamed('alice');
    const bob = createPlayerNamed('bob');
    const carol = createPlayerNamed('carol');
    alice.promoteToHost();
    bob.promoteToHost();
    carol.promoteToHost();

    resolver.ensureRoomHasExactlyOneHost([alice, bob, carol]);

    expect(alice.isHost()).toBe(true);
    expect(bob.isHost()).toBe(false);
    expect(carol.isHost()).toBe(false);
  });

  it('changes nothing when called several times in a row', () => {
    const resolver = new HostSuccessionResolver();
    const alice = createPlayerNamed('alice');
    const bob = createPlayerNamed('bob');

    resolver.ensureRoomHasExactlyOneHost([alice, bob]);
    resolver.ensureRoomHasExactlyOneHost([alice, bob]);
    resolver.ensureRoomHasExactlyOneHost([alice, bob]);

    expect(alice.isHost()).toBe(true);
    expect(bob.isHost()).toBe(false);
  });
});
