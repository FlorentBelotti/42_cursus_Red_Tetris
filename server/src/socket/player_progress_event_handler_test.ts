import { describe, expect, it } from 'vitest';

import { BOARD_COLUMN_COUNT, SOCKET_EVENT_NAMES } from 'shared';

import { GameRoomRegistry } from '../domain/game_room_registry';
import { Player } from '../domain/player';
import {
  createEmptySocketRoomSession,
  type SocketRoomSession,
} from './connection_lifecycle_handler';
import { registerPlayerProgressEventHandler } from './player_progress_event_handler';
import {
  createFakeServer,
  createFakeSocket,
  findLastMessage,
  findMessagesNamed,
} from './socket_test_doubles';

const A_VALID_SPECTRUM = [0, 1, 2, 3, 4, 5, 4, 3, 2, 1];

/**
 * Sets up a room where alice reports her progress, alongside the opponents
 * named, with the round already running unless asked otherwise.
 */
function setUpRunningRound(opponentNames: string[] = ['bob'], startTheRound = true) {
  const fakeSocket = createFakeSocket('socket-alice');
  const fakeServer = createFakeServer();
  const registry = new GameRoomRegistry();
  const session: SocketRoomSession = createEmptySocketRoomSession();

  const alice = new Player('socket-alice', 'alice');
  const game = registry.addPlayerToRoom('nether', alice);
  const opponents: Player[] = [];

  for (const opponentName of opponentNames) {
    const opponent = new Player(`socket-${opponentName}`, opponentName);
    registry.addPlayerToRoom('nether', opponent);
    opponents.push(opponent);
  }

  session.roomName = 'nether';
  session.seatedPlayer = alice;

  if (startTheRound) {
    game.startRound();
  }

  registerPlayerProgressEventHandler(
    fakeServer.asTypedServer,
    fakeSocket.asTypedSocket,
    registry,
    session,
  );

  return { fakeSocket, fakeServer, registry, session, game, alice, opponents };
}

describe('player:spectrum_update', () => {
  it('stores the reported spectrum on the player', () => {
    const context = setUpRunningRound();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.PLAYER_SPECTRUM_UPDATE, {
      spectrumColumnHeights: A_VALID_SPECTRUM,
    });

    expect(context.alice.getLatestSpectrum()).toEqual(A_VALID_SPECTRUM);
  });

  it('relays it to the opponents, not back to the reporter', () => {
    const context = setUpRunningRound();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.PLAYER_SPECTRUM_UPDATE, {
      spectrumColumnHeights: A_VALID_SPECTRUM,
    });

    expect(context.fakeSocket.emittedToThisSocket).toHaveLength(0);
    expect(findLastMessage(context.fakeSocket.broadcastToOthers)?.eventName).toBe(
      SOCKET_EVENT_NAMES.GAME_OPPONENT_SPECTRUM_UPDATED,
    );
  });

  it('says whose spectrum it is', () => {
    const context = setUpRunningRound();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.PLAYER_SPECTRUM_UPDATE, {
      spectrumColumnHeights: A_VALID_SPECTRUM,
    });

    expect(findLastMessage(context.fakeSocket.broadcastToOthers)?.payload).toEqual({
      playerId: 'socket-alice',
      spectrumColumnHeights: A_VALID_SPECTRUM,
    });
  });

  it('drops a spectrum with the wrong number of columns', () => {
    const context = setUpRunningRound();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.PLAYER_SPECTRUM_UPDATE, {
      spectrumColumnHeights: [1, 2, 3],
    });

    expect(context.fakeSocket.broadcastToOthers).toHaveLength(0);
  });

  it('drops a spectrum holding something that is not a number', () => {
    const context = setUpRunningRound();
    const spectrumWithText = new Array<unknown>(BOARD_COLUMN_COUNT).fill(0);
    spectrumWithText[0] = 'tall';

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.PLAYER_SPECTRUM_UPDATE, {
      spectrumColumnHeights: spectrumWithText,
    });

    expect(context.fakeSocket.broadcastToOthers).toHaveLength(0);
  });

  it('leaves the stored spectrum untouched when the report is malformed', () => {
    const context = setUpRunningRound();
    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.PLAYER_SPECTRUM_UPDATE, {
      spectrumColumnHeights: A_VALID_SPECTRUM,
    });

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.PLAYER_SPECTRUM_UPDATE, {
      spectrumColumnHeights: [9, 9],
    });

    expect(context.alice.getLatestSpectrum()).toEqual(A_VALID_SPECTRUM);
  });

  it('is ignored before the round has started', () => {
    const context = setUpRunningRound(['bob'], false);

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.PLAYER_SPECTRUM_UPDATE, {
      spectrumColumnHeights: A_VALID_SPECTRUM,
    });

    expect(context.fakeSocket.broadcastToOthers).toHaveLength(0);
  });
});

describe('player:lines_cleared', () => {
  function findPenaltyMessages(context: ReturnType<typeof setUpRunningRound>) {
    return findMessagesNamed(
      context.fakeServer.roomBroadcasts,
      SOCKET_EVENT_NAMES.GAME_PENALTY_LINES_RECEIVED,
    );
  }

  it('sends nothing for a single cleared line (C11)', () => {
    const context = setUpRunningRound();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.PLAYER_LINES_CLEARED, {
      clearedLineCount: 1,
    });

    expect(findPenaltyMessages(context)).toHaveLength(0);
  });

  it('sends three lines to each opponent for a four-line clear (C11)', () => {
    const context = setUpRunningRound(['bob', 'carol']);

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.PLAYER_LINES_CLEARED, {
      clearedLineCount: 4,
    });

    const penaltyMessages = findPenaltyMessages(context);

    expect(penaltyMessages).toHaveLength(2);
    expect(penaltyMessages[0]?.payload).toEqual({
      penaltyLineCount: 3,
      sourcePlayerId: 'socket-alice',
    });
  });

  it('addresses each opponent by their own socket, not the room', () => {
    const context = setUpRunningRound(['bob', 'carol']);

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.PLAYER_LINES_CLEARED, {
      clearedLineCount: 2,
    });

    const penalisedRooms = findPenaltyMessages(context).map((message) => message.roomName);

    expect(penalisedRooms).toEqual(['socket-bob', 'socket-carol']);
  });

  it('never penalises the player who cleared', () => {
    const context = setUpRunningRound(['bob']);

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.PLAYER_LINES_CLEARED, {
      clearedLineCount: 3,
    });

    const penalisedRooms = findPenaltyMessages(context).map((message) => message.roomName);

    expect(penalisedRooms).not.toContain('socket-alice');
  });

  it('skips an opponent who is already out', () => {
    const context = setUpRunningRound(['bob', 'carol']);
    context.opponents[0]?.setAliveToFalse();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.PLAYER_LINES_CLEARED, {
      clearedLineCount: 4,
    });

    const penalisedRooms = findPenaltyMessages(context).map((message) => message.roomName);

    expect(penalisedRooms).toEqual(['socket-carol']);
  });

  it('sends nothing at all in a solo room (C14)', () => {
    const context = setUpRunningRound([]);

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.PLAYER_LINES_CLEARED, {
      clearedLineCount: 4,
    });

    expect(findPenaltyMessages(context)).toHaveLength(0);
  });

  it('drops a count no tetromino could produce', () => {
    const context = setUpRunningRound();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.PLAYER_LINES_CLEARED, {
      clearedLineCount: 99,
    });

    expect(findPenaltyMessages(context)).toHaveLength(0);
  });

  it('drops a fractional count', () => {
    const context = setUpRunningRound();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.PLAYER_LINES_CLEARED, {
      clearedLineCount: 2.5,
    });

    expect(findPenaltyMessages(context)).toHaveLength(0);
  });

  it('drops a count that is not a number', () => {
    const context = setUpRunningRound();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.PLAYER_LINES_CLEARED, {
      clearedLineCount: '4',
    });

    expect(findPenaltyMessages(context)).toHaveLength(0);
  });

  it('is ignored before the round has started', () => {
    const context = setUpRunningRound(['bob'], false);

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.PLAYER_LINES_CLEARED, {
      clearedLineCount: 4,
    });

    expect(findPenaltyMessages(context)).toHaveLength(0);
  });
});

describe('player:game_over_report', () => {
  it('marks the reporting player as out', () => {
    const context = setUpRunningRound(['bob', 'carol']);

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.PLAYER_GAME_OVER_REPORT);

    expect(context.alice.isAlive()).toBe(false);
  });

  it('tells the room who went out', () => {
    const context = setUpRunningRound(['bob', 'carol']);

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.PLAYER_GAME_OVER_REPORT);

    const eliminationMessages = findMessagesNamed(
      context.fakeServer.roomBroadcasts,
      SOCKET_EVENT_NAMES.GAME_PLAYER_ELIMINATED,
    );

    expect(eliminationMessages[0]?.payload).toEqual({ playerId: 'socket-alice' });
  });

  it('does not close a round that still has two players standing', () => {
    const context = setUpRunningRound(['bob', 'carol']);

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.PLAYER_GAME_OVER_REPORT);

    expect(context.game.status).toBe('running');
    expect(
      findMessagesNamed(context.fakeServer.roomBroadcasts, SOCKET_EVENT_NAMES.GAME_ROUND_FINISHED),
    ).toHaveLength(0);
  });

  it('closes the round and names the winner when one player is left (C14)', () => {
    const context = setUpRunningRound(['bob']);

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.PLAYER_GAME_OVER_REPORT);

    const finishedMessages = findMessagesNamed(
      context.fakeServer.roomBroadcasts,
      SOCKET_EVENT_NAMES.GAME_ROUND_FINISHED,
    );

    expect(context.game.status).toBe('finished');
    expect(finishedMessages[0]?.payload).toEqual({ winnerPlayerId: 'socket-bob' });
  });

  it('closes a solo round with no winner (C14)', () => {
    const context = setUpRunningRound([]);

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.PLAYER_GAME_OVER_REPORT);

    const finishedMessages = findMessagesNamed(
      context.fakeServer.roomBroadcasts,
      SOCKET_EVENT_NAMES.GAME_ROUND_FINISHED,
    );

    expect(context.game.status).toBe('finished');
    expect(finishedMessages[0]?.payload).toEqual({ winnerPlayerId: null });
  });

  it('updates the room state so opponents see the player as out', () => {
    const context = setUpRunningRound(['bob', 'carol']);

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.PLAYER_GAME_OVER_REPORT);

    const stateMessages = findMessagesNamed(
      context.fakeServer.roomBroadcasts,
      SOCKET_EVENT_NAMES.ROOM_STATE_UPDATED,
    );
    const lastState = findLastMessage(stateMessages)?.payload as {
      roomState: { players: { playerId: string; isAlive: boolean }[] };
    };
    const aliceState = lastState.roomState.players.find(
      (player) => player.playerId === 'socket-alice',
    );

    expect(aliceState?.isAlive).toBe(false);
  });

  it('ignores a second report from a player already out', () => {
    const context = setUpRunningRound(['bob', 'carol']);
    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.PLAYER_GAME_OVER_REPORT);
    const broadcastCountAfterFirstReport = context.fakeServer.roomBroadcasts.length;

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.PLAYER_GAME_OVER_REPORT);

    expect(context.fakeServer.roomBroadcasts).toHaveLength(broadcastCountAfterFirstReport);
  });

  it('is ignored before the round has started', () => {
    const context = setUpRunningRound(['bob'], false);

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.PLAYER_GAME_OVER_REPORT);

    expect(context.alice.isAlive()).toBe(true);
  });

  it('is ignored when the socket sits in no room', () => {
    const context = setUpRunningRound(['bob']);
    context.session.roomName = null;
    context.session.seatedPlayer = null;

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.PLAYER_GAME_OVER_REPORT);

    expect(context.alice.isAlive()).toBe(true);
  });
});
