import { describe, expect, it } from 'vitest';

import { SOCKET_EVENT_NAMES } from 'shared';

import type { Game } from '../domain/game';
import { GameRoomRegistry } from '../domain/game_room_registry';
import { Player } from '../domain/player';
import {
  createEmptySocketRoomSession,
  type SocketRoomSession,
} from './connection_lifecycle_handler';
import {
  announceRoundFinishedWhenOver,
  registerGameLifecycleEventHandler,
} from './game_lifecycle_event_handler';
import {
  createFakeServer,
  createFakeSocket,
  findLastMessage,
  findMessagesNamed,
} from './socket_test_doubles';

function setUpSeatedHost(otherPlayerNames: string[] = []) {
  const fakeSocket = createFakeSocket('socket-alice');
  const fakeServer = createFakeServer();
  const registry = new GameRoomRegistry();
  const session: SocketRoomSession = createEmptySocketRoomSession();

  const alice = new Player('socket-alice', 'alice');
  const game: Game = registry.addPlayerToRoom('nether', alice);

  for (const otherPlayerName of otherPlayerNames) {
    registry.addPlayerToRoom('nether', new Player(`socket-${otherPlayerName}`, otherPlayerName));
  }

  session.roomName = 'nether';
  session.seatedPlayer = alice;

  registerGameLifecycleEventHandler(
    fakeServer.asTypedServer,
    fakeSocket.asTypedSocket,
    registry,
    session,
  );

  return { fakeSocket, fakeServer, registry, session, game, alice };
}

function findRoundStartedMessages(context: ReturnType<typeof setUpSeatedHost>) {
  return findMessagesNamed(context.fakeServer.roomBroadcasts, SOCKET_EVENT_NAMES.GAME_ROUND_STARTED);
}

describe('game:start_request from the host', () => {
  it('starts the round', () => {
    const context = setUpSeatedHost(['bob']);

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.GAME_START_REQUEST);

    expect(context.game.status).toBe('running');
  });

  it('announces the round to the room', () => {
    const context = setUpSeatedHost(['bob']);

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.GAME_START_REQUEST);

    expect(findRoundStartedMessages(context)).toHaveLength(1);
  });

  it('carries the seed, and nothing else', () => {
    const context = setUpSeatedHost(['bob']);

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.GAME_START_REQUEST);

    expect(findRoundStartedMessages(context)[0]?.payload).toEqual({
      pieceSequenceSeed: context.game.getRoundSeed(),
    });
  });

  it('announces into the right room', () => {
    const context = setUpSeatedHost(['bob']);

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.GAME_START_REQUEST);

    expect(findRoundStartedMessages(context)[0]?.roomName).toBe('nether');
  });

  it('tells the room its status changed before announcing the round', () => {
    const context = setUpSeatedHost(['bob']);

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.GAME_START_REQUEST);

    const broadcastNames = context.fakeServer.roomBroadcasts.map((message) => message.eventName);

    expect(broadcastNames).toEqual([
      SOCKET_EVENT_NAMES.ROOM_STATE_UPDATED,
      SOCKET_EVENT_NAMES.GAME_ROUND_STARTED,
    ]);
  });

  it('works for a solo room (C14)', () => {
    const context = setUpSeatedHost();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.GAME_START_REQUEST);

    expect(context.game.status).toBe('running');
  });

  it('ignores a second request rather than drawing a new seed mid-round', () => {
    const context = setUpSeatedHost(['bob']);
    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.GAME_START_REQUEST);
    const seedOfTheRunningRound = context.game.getRoundSeed();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.GAME_START_REQUEST);

    expect(context.game.getRoundSeed()).toBe(seedOfTheRunningRound);
    expect(findRoundStartedMessages(context)).toHaveLength(1);
  });

  it('restarts a finished round with a clean slate (C12)', () => {
    const context = setUpSeatedHost(['bob']);
    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.GAME_START_REQUEST);
    context.game.markPlayerAsEliminated(context.alice);

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.GAME_START_REQUEST);

    expect(context.game.status).toBe('running');
    expect(context.alice.isAlive()).toBe(true);
    expect(findRoundStartedMessages(context)).toHaveLength(2);
  });
});

describe('game:start_request from someone who may not start', () => {
  it('is ignored when the socket is not the host', () => {
    const context = setUpSeatedHost(['bob']);
    context.alice.demoteFromHost();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.GAME_START_REQUEST);

    expect(context.game.status).toBe('waiting');
    expect(context.fakeServer.roomBroadcasts).toHaveLength(0);
  });

  it('is ignored when the socket sits in no room', () => {
    const context = setUpSeatedHost(['bob']);
    context.session.roomName = null;
    context.session.seatedPlayer = null;

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.GAME_START_REQUEST);

    expect(context.game.status).toBe('waiting');
  });

  it('is ignored when the room has disappeared underneath the socket', () => {
    const context = setUpSeatedHost();
    context.registry.removePlayerFromRoom('nether', context.alice);
    context.session.seatedPlayer = context.alice;
    context.alice.promoteToHost();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.GAME_START_REQUEST);

    expect(context.fakeServer.roomBroadcasts).toHaveLength(0);
  });

  it('answers nothing at all, since the protocol has no start rejection', () => {
    const context = setUpSeatedHost(['bob']);
    context.alice.demoteFromHost();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.GAME_START_REQUEST);

    expect(context.fakeSocket.emittedToThisSocket).toHaveLength(0);
  });
});

describe('announceRoundFinishedWhenOver', () => {
  it('says nothing while the round is still being played', () => {
    const context = setUpSeatedHost(['bob']);
    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.GAME_START_REQUEST);

    announceRoundFinishedWhenOver(context.fakeServer.asTypedServer, context.game, 'nether');

    expect(
      findMessagesNamed(context.fakeServer.roomBroadcasts, SOCKET_EVENT_NAMES.GAME_ROUND_FINISHED),
    ).toHaveLength(0);
  });

  it('names the last player standing as the winner (C14)', () => {
    const context = setUpSeatedHost(['bob']);
    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.GAME_START_REQUEST);
    context.game.markPlayerAsEliminated(context.alice);

    announceRoundFinishedWhenOver(context.fakeServer.asTypedServer, context.game, 'nether');

    expect(findLastMessage(context.fakeServer.roomBroadcasts)?.payload).toEqual({
      winnerPlayerId: 'socket-bob',
    });
  });

  it('reports no winner for a solo round (C14)', () => {
    const context = setUpSeatedHost();
    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.GAME_START_REQUEST);
    context.game.markPlayerAsEliminated(context.alice);

    announceRoundFinishedWhenOver(context.fakeServer.asTypedServer, context.game, 'nether');

    expect(findLastMessage(context.fakeServer.roomBroadcasts)?.payload).toEqual({
      winnerPlayerId: null,
    });
  });

  it('uses the round finished event name from the shared protocol', () => {
    const context = setUpSeatedHost(['bob']);
    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.GAME_START_REQUEST);
    context.game.markPlayerAsEliminated(context.alice);

    announceRoundFinishedWhenOver(context.fakeServer.asTypedServer, context.game, 'nether');

    expect(findLastMessage(context.fakeServer.roomBroadcasts)?.eventName).toBe(
      SOCKET_EVENT_NAMES.GAME_ROUND_FINISHED,
    );
  });
});
