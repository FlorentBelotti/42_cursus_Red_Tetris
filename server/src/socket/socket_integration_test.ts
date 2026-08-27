import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { BOARD_COLUMN_COUNT } from 'shared';

import {
  connectAndJoin,
  connectClient,
  staysSilent,
  startTestServer,
  stopTestServer,
  waitForEvent,
  waitForEventMatching,
  type RunningTestServer,
} from './socket_integration_test_harness';

const A_VALID_SPECTRUM = new Array<number>(BOARD_COLUMN_COUNT).fill(0);

let testServer: RunningTestServer;

beforeEach(async () => {
  testServer = await startTestServer();
});

afterEach(async () => {
  await stopTestServer(testServer);
});

describe('joining a room over a real socket', () => {
  it('accepts the first player and makes them the host (C12)', async () => {
    const { acceptance } = await connectAndJoin(testServer, 'nether', 'alice');

    expect(acceptance.isHost).toBe(true);
    expect(acceptance.playerId).toEqual(expect.any(String));
  });

  it('sends the whole room state with the acceptance', async () => {
    const alice = await connectClient(testServer);
    const acceptancePromise = waitForEvent<{
      roomState: { status: string; hostPlayerId: string; players: unknown[] };
    }>(alice, 'room:join_accepted');

    alice.emit('room:join_request', { roomName: 'nether', playerName: 'alice' });

    const acceptance = await acceptancePromise;

    expect(acceptance.roomState.status).toBe('waiting');
    expect(acceptance.roomState.players).toHaveLength(1);
  });

  it('tells the players already in the room about a new arrival', async () => {
    const { client: alice } = await connectAndJoin(testServer, 'nether', 'alice');
    const stateUpdatePromise = waitForEventMatching<{ roomState: { players: unknown[] } }>(
      alice,
      'room:state_updated',
      (stateUpdate) => stateUpdate.roomState.players.length === 2,
    );

    const bob = await connectClient(testServer);
    bob.emit('room:join_request', { roomName: 'nether', playerName: 'bob' });

    const stateUpdate = await stateUpdatePromise;

    expect(stateUpdate.roomState.players).toHaveLength(2);
  });

  it('does not make the second player the host', async () => {
    await connectAndJoin(testServer, 'nether', 'alice');

    const { acceptance } = await connectAndJoin(testServer, 'nether', 'bob');

    expect(acceptance.isHost).toBe(false);
  });

  it('keeps two rooms independent (C14)', async () => {
    const { acceptance: aliceAcceptance } = await connectAndJoin(testServer, 'nether', 'alice');
    const { acceptance: bobAcceptance } = await connectAndJoin(testServer, 'overworld', 'bob');

    expect(aliceAcceptance.isHost).toBe(true);
    expect(bobAcceptance.isHost).toBe(true);
  });

  it('lets the same name be used in two different rooms', async () => {
    await connectAndJoin(testServer, 'nether', 'alice');

    const { acceptance } = await connectAndJoin(testServer, 'overworld', 'alice');

    expect(acceptance.isHost).toBe(true);
  });
});

describe('rejecting a join over a real socket', () => {
  async function expectRejection(roomName: unknown, playerName: unknown): Promise<string> {
    const client = await connectClient(testServer);
    const rejectionPromise = waitForEvent<{ reasonCode: string }>(client, 'room:join_rejected');

    client.emit('room:join_request', { roomName, playerName });

    const rejection = await rejectionPromise;

    return rejection.reasonCode;
  }

  it('refuses a name already taken in that room', async () => {
    await connectAndJoin(testServer, 'nether', 'alice');

    expect(await expectRejection('nether', 'alice')).toBe('player_name_already_taken');
  });

  it('refuses a join once the round is running (C13)', async () => {
    const { client: alice } = await connectAndJoin(testServer, 'nether', 'alice');
    await connectAndJoin(testServer, 'nether', 'bob');
    const roundStarted = waitForEvent(alice, 'game:round_started');
    alice.emit('game:start_request');
    await roundStarted;

    expect(await expectRejection('nether', 'carol')).toBe('game_already_started');
  });

  it('blames the room name when the room name is empty', async () => {
    expect(await expectRejection('', 'alice')).toBe('invalid_room_name');
  });

  it('blames the player name when the player name is empty', async () => {
    expect(await expectRejection('nether', '')).toBe('invalid_player_name');
  });

  it('refuses a name holding characters that have no place in a URL', async () => {
    expect(await expectRejection('nether/../etc', 'alice')).toBe('invalid_room_name');
  });
});

describe('starting a round over a real socket', () => {
  it('gives every player in the room the very same seed (C10)', async () => {
    const { client: alice } = await connectAndJoin(testServer, 'nether', 'alice');
    const { client: bob } = await connectAndJoin(testServer, 'nether', 'bob');

    const aliceSeed = waitForEvent<{ pieceSequenceSeed: number }>(alice, 'game:round_started');
    const bobSeed = waitForEvent<{ pieceSequenceSeed: number }>(bob, 'game:round_started');
    alice.emit('game:start_request');

    const [aliceStart, bobStart] = await Promise.all([aliceSeed, bobSeed]);

    expect(aliceStart.pieceSequenceSeed).toBe(bobStart.pieceSequenceSeed);
    expect(aliceStart.pieceSequenceSeed).toBeGreaterThan(0);
  });

  it('moves the room to running', async () => {
    const { client: alice } = await connectAndJoin(testServer, 'nether', 'alice');
    const statePromise = waitForEventMatching<{ roomState: { status: string } }>(
      alice,
      'room:state_updated',
      (payload) => payload.roomState.status === 'running',
    );

    alice.emit('game:start_request');

    const stateUpdate = await statePromise;

    expect(stateUpdate.roomState.status).toBe('running');
  });

  it('ignores a start request from a player who is not the host', async () => {
    await connectAndJoin(testServer, 'nether', 'alice');
    const { client: bob } = await connectAndJoin(testServer, 'nether', 'bob');

    bob.emit('game:start_request');

    expect(await staysSilent(bob, 'game:round_started')).toBe(true);
  });

  it('starts a solo round (C14)', async () => {
    const { client: alice } = await connectAndJoin(testServer, 'nether', 'alice');
    const roundStarted = waitForEvent<{ pieceSequenceSeed: number }>(alice, 'game:round_started');

    alice.emit('game:start_request');

    expect((await roundStarted).pieceSequenceSeed).toBeGreaterThan(0);
  });
});

describe('penalty lines over a real socket (C11)', () => {
  async function startTwoPlayerRound() {
    const { client: alice } = await connectAndJoin(testServer, 'nether', 'alice');
    const { client: bob, acceptance: bobAcceptance } = await connectAndJoin(
      testServer,
      'nether',
      'bob',
    );
    const roundStarted = waitForEvent(bob, 'game:round_started');
    alice.emit('game:start_request');
    await roundStarted;

    return { alice, bob, bobPlayerId: bobAcceptance.playerId };
  }

  it('sends an opponent one fewer line than were cleared', async () => {
    const { alice, bob } = await startTwoPlayerRound();
    const penaltyPromise = waitForEvent<{ penaltyLineCount: number; sourcePlayerId: string }>(
      bob,
      'game:penalty_lines_received',
    );

    alice.emit('player:lines_cleared', { clearedLineCount: 4 });

    expect((await penaltyPromise).penaltyLineCount).toBe(3);
  });

  it('says which player the penalty came from', async () => {
    const { alice, bob } = await startTwoPlayerRound();
    const penaltyPromise = waitForEvent<{ sourcePlayerId: string }>(
      bob,
      'game:penalty_lines_received',
    );

    alice.emit('player:lines_cleared', { clearedLineCount: 2 });

    expect((await penaltyPromise).sourcePlayerId).toEqual(expect.any(String));
  });

  it('never penalises the player who cleared', async () => {
    const { alice } = await startTwoPlayerRound();

    alice.emit('player:lines_cleared', { clearedLineCount: 4 });

    expect(await staysSilent(alice, 'game:penalty_lines_received')).toBe(true);
  });

  it('sends nothing for a single cleared line', async () => {
    const { alice, bob } = await startTwoPlayerRound();

    alice.emit('player:lines_cleared', { clearedLineCount: 1 });

    expect(await staysSilent(bob, 'game:penalty_lines_received')).toBe(true);
  });

  it('drops a clear count no tetromino could produce', async () => {
    const { alice, bob } = await startTwoPlayerRound();

    alice.emit('player:lines_cleared', { clearedLineCount: 99 });

    expect(await staysSilent(bob, 'game:penalty_lines_received')).toBe(true);
  });
});

describe('spectrums over a real socket', () => {
  it('relays a spectrum to the opponent', async () => {
    const { client: alice } = await connectAndJoin(testServer, 'nether', 'alice');
    const { client: bob } = await connectAndJoin(testServer, 'nether', 'bob');
    const roundStarted = waitForEvent(bob, 'game:round_started');
    alice.emit('game:start_request');
    await roundStarted;

    const spectrumPromise = waitForEvent<{ playerId: string; spectrumColumnHeights: number[] }>(
      bob,
      'game:opponent_spectrum_updated',
    );
    alice.emit('player:spectrum_update', { spectrumColumnHeights: A_VALID_SPECTRUM });

    expect((await spectrumPromise).spectrumColumnHeights).toEqual(A_VALID_SPECTRUM);
  });

  it('does not echo a spectrum back to the player who reported it', async () => {
    const { client: alice } = await connectAndJoin(testServer, 'nether', 'alice');
    const { client: bob } = await connectAndJoin(testServer, 'nether', 'bob');
    const roundStarted = waitForEvent(bob, 'game:round_started');
    alice.emit('game:start_request');
    await roundStarted;

    alice.emit('player:spectrum_update', { spectrumColumnHeights: A_VALID_SPECTRUM });

    expect(await staysSilent(alice, 'game:opponent_spectrum_updated')).toBe(true);
  });

  it('drops a malformed spectrum', async () => {
    const { client: alice } = await connectAndJoin(testServer, 'nether', 'alice');
    const { client: bob } = await connectAndJoin(testServer, 'nether', 'bob');
    const roundStarted = waitForEvent(bob, 'game:round_started');
    alice.emit('game:start_request');
    await roundStarted;

    alice.emit('player:spectrum_update', { spectrumColumnHeights: [1, 2] });

    expect(await staysSilent(bob, 'game:opponent_spectrum_updated')).toBe(true);
  });
});

describe('ending a round over a real socket (C14)', () => {
  it('announces the elimination to the room', async () => {
    const { client: alice, acceptance: aliceAcceptance } = await connectAndJoin(
      testServer,
      'nether',
      'alice',
    );
    const { client: bob } = await connectAndJoin(testServer, 'nether', 'bob');
    await connectAndJoin(testServer, 'nether', 'carol');
    const roundStarted = waitForEvent(bob, 'game:round_started');
    alice.emit('game:start_request');
    await roundStarted;

    const eliminationPromise = waitForEvent<{ playerId: string }>(bob, 'game:player_eliminated');
    alice.emit('player:game_over_report');

    expect((await eliminationPromise).playerId).toBe(aliceAcceptance.playerId);
  });

  it('names the last player standing as the winner', async () => {
    const { client: alice } = await connectAndJoin(testServer, 'nether', 'alice');
    const { client: bob, acceptance: bobAcceptance } = await connectAndJoin(
      testServer,
      'nether',
      'bob',
    );
    const roundStarted = waitForEvent(bob, 'game:round_started');
    alice.emit('game:start_request');
    await roundStarted;

    const finishedPromise = waitForEvent<{ winnerPlayerId: string | null }>(
      bob,
      'game:round_finished',
    );
    alice.emit('player:game_over_report');

    expect((await finishedPromise).winnerPlayerId).toBe(bobAcceptance.playerId);
  });

  it('finishes a solo round with no winner', async () => {
    const { client: alice } = await connectAndJoin(testServer, 'nether', 'alice');
    const roundStarted = waitForEvent(alice, 'game:round_started');
    alice.emit('game:start_request');
    await roundStarted;

    const finishedPromise = waitForEvent<{ winnerPlayerId: string | null }>(
      alice,
      'game:round_finished',
    );
    alice.emit('player:game_over_report');

    expect((await finishedPromise).winnerPlayerId).toBeNull();
  });

  it('keeps the round going while two players are still standing', async () => {
    const { client: alice } = await connectAndJoin(testServer, 'nether', 'alice');
    const { client: bob } = await connectAndJoin(testServer, 'nether', 'bob');
    await connectAndJoin(testServer, 'nether', 'carol');
    const roundStarted = waitForEvent(bob, 'game:round_started');
    alice.emit('game:start_request');
    await roundStarted;

    alice.emit('player:game_over_report');

    expect(await staysSilent(bob, 'game:round_finished')).toBe(true);
  });

  it('lets the host restart the round afterwards (C12)', async () => {
    const { client: alice } = await connectAndJoin(testServer, 'nether', 'alice');
    const { client: bob } = await connectAndJoin(testServer, 'nether', 'bob');
    const firstStart = waitForEvent<{ pieceSequenceSeed: number }>(bob, 'game:round_started');
    alice.emit('game:start_request');
    const firstSeed = (await firstStart).pieceSequenceSeed;
    const finished = waitForEvent(bob, 'game:round_finished');
    alice.emit('player:game_over_report');
    await finished;

    const secondStart = waitForEvent<{ pieceSequenceSeed: number }>(bob, 'game:round_started');
    alice.emit('game:start_request');

    expect((await secondStart).pieceSequenceSeed).toEqual(expect.any(Number));
    expect((await secondStart).pieceSequenceSeed).not.toBe(firstSeed);
  });
});

describe('leaving and disconnecting over a real socket', () => {
  it('promotes a new host when the host disconnects (C12)', async () => {
    const { client: alice } = await connectAndJoin(testServer, 'nether', 'alice');
    const { client: bob, acceptance: bobAcceptance } = await connectAndJoin(
      testServer,
      'nether',
      'bob',
    );
    const stateUpdatePromise = waitForEventMatching<{ roomState: { hostPlayerId: string } }>(
      bob,
      'room:state_updated',
      (payload) => payload.roomState.hostPlayerId === bobAcceptance.playerId,
    );

    alice.disconnect();

    expect((await stateUpdatePromise).roomState.hostPlayerId).toBe(bobAcceptance.playerId);
  });

  it('tells the room when a player leaves on purpose', async () => {
    const { client: alice } = await connectAndJoin(testServer, 'nether', 'alice');
    const { client: bob } = await connectAndJoin(testServer, 'nether', 'bob');
    const stateUpdatePromise = waitForEventMatching<{ roomState: { players: unknown[] } }>(
      bob,
      'room:state_updated',
      (payload) => payload.roomState.players.length === 1,
    );

    alice.emit('room:leave_request');

    expect((await stateUpdatePromise).roomState.players).toHaveLength(1);
  });

  it('frees the room name once everybody has gone', async () => {
    const { client: alice } = await connectAndJoin(testServer, 'nether', 'alice');
    alice.emit('room:leave_request');
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 100);
    });

    const { acceptance } = await connectAndJoin(testServer, 'nether', 'bob');

    expect(acceptance.isHost).toBe(true);
  });
});
