import { describe, expect, it } from 'vitest';

import { SOCKET_EVENT_NAMES } from 'shared';

import { GameRoomRegistry } from '../domain/game_room_registry';
import { Player } from '../domain/player';
import {
  createEmptySocketRoomSession,
  type SocketRoomSession,
} from './connection_lifecycle_handler';
import { registerRoomMembershipEventHandler } from './room_membership_event_handler';
import type { TypedSocket, TypedSocketIoServer } from './typed_socket_aliases';

interface RecordedMessage {
  eventName: string;
  payload: unknown;
}

/**
 * A stand-in for one connected socket. It records what was emitted straight to
 * it, which rooms it joined and left, and lets a test fire an incoming event by
 * name the way a real client would.
 */
function createFakeSocket(socketId: string) {
  const emittedToThisSocket: RecordedMessage[] = [];
  const broadcastToOthers: RecordedMessage[] = [];
  const joinedRooms: string[] = [];
  const leftRooms: string[] = [];
  const registeredHandlers = new Map<string, (payload?: unknown) => void>();

  const fakeSocket = {
    id: socketId,
    on(eventName: string, handler: (payload?: unknown) => void) {
      registeredHandlers.set(eventName, handler);
    },
    emit(eventName: string, payload: unknown) {
      emittedToThisSocket.push({ eventName, payload });
    },
    join(roomName: string) {
      joinedRooms.push(roomName);
    },
    leave(roomName: string) {
      leftRooms.push(roomName);
    },
    to(roomName: string) {
      return {
        emit(eventName: string, payload: unknown) {
          broadcastToOthers.push({ eventName, payload: { roomName, payload } });
        },
      };
    },
  };

  function receiveFromClient(eventName: string, payload?: unknown) {
    const handler = registeredHandlers.get(eventName);

    if (handler === undefined) {
      throw new Error(`The server never registered a handler for ${eventName}`);
    }

    handler(payload);
  }

  return {
    emittedToThisSocket,
    broadcastToOthers,
    joinedRooms,
    leftRooms,
    receiveFromClient,
    asTypedSocket: fakeSocket as unknown as TypedSocket,
  };
}

/** A stand-in for the socket.io server that records room broadcasts. */
function createFakeServer() {
  const roomBroadcasts: RecordedMessage[] = [];

  const fakeServer = {
    to(roomName: string) {
      return {
        emit(eventName: string, payload: unknown) {
          roomBroadcasts.push({ eventName, payload: { roomName, payload } });
        },
      };
    },
  };

  return { roomBroadcasts, asTypedServer: fakeServer as unknown as TypedSocketIoServer };
}

/**
 * Wires the handler under test to a fresh fake socket, server and registry.
 */
function setUpJoinableRoom(socketId = 'socket-alice') {
  const fakeSocket = createFakeSocket(socketId);
  const fakeServer = createFakeServer();
  const registry = new GameRoomRegistry();
  const session: SocketRoomSession = createEmptySocketRoomSession();

  registerRoomMembershipEventHandler(
    fakeServer.asTypedServer,
    fakeSocket.asTypedSocket,
    registry,
    session,
  );

  return { fakeSocket, fakeServer, registry, session };
}

function findLastMessage(messages: RecordedMessage[]): RecordedMessage | undefined {
  return messages[messages.length - 1];
}

describe('room:join_request accepted', () => {
  it('answers with join_accepted', () => {
    const context = setUpJoinableRoom();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, {
      roomName: 'nether',
      playerName: 'alice',
    });

    expect(findLastMessage(context.fakeSocket.emittedToThisSocket)?.eventName).toBe(
      SOCKET_EVENT_NAMES.ROOM_JOIN_ACCEPTED,
    );
  });

  it('creates the room and seats the player', () => {
    const context = setUpJoinableRoom();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, {
      roomName: 'nether',
      playerName: 'alice',
    });

    expect(context.registry.roomExists('nether')).toBe(true);
  });

  it('tells the first player they are the host (C12)', () => {
    const context = setUpJoinableRoom();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, {
      roomName: 'nether',
      playerName: 'alice',
    });

    const acceptance = findLastMessage(context.fakeSocket.emittedToThisSocket)?.payload as {
      isHost: boolean;
      playerId: string;
    };

    expect(acceptance.isHost).toBe(true);
    expect(acceptance.playerId).toBe('socket-alice');
  });

  it('carries the whole room state in the acceptance', () => {
    const context = setUpJoinableRoom();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, {
      roomName: 'nether',
      playerName: 'alice',
    });

    const acceptance = findLastMessage(context.fakeSocket.emittedToThisSocket)?.payload as {
      roomState: { status: string; players: unknown[] };
    };

    expect(acceptance.roomState.status).toBe('waiting');
    expect(acceptance.roomState.players).toHaveLength(1);
  });

  it('puts the socket into the socket.io room', () => {
    const context = setUpJoinableRoom();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, {
      roomName: 'nether',
      playerName: 'alice',
    });

    expect(context.fakeSocket.joinedRooms).toEqual(['nether']);
  });

  it('records the seat in the session', () => {
    const context = setUpJoinableRoom();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, {
      roomName: 'nether',
      playerName: 'alice',
    });

    expect(context.session.roomName).toBe('nether');
    expect(context.session.seatedPlayer?.getName()).toBe('alice');
  });

  it('tells the rest of the room about the new arrival', () => {
    const context = setUpJoinableRoom();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, {
      roomName: 'nether',
      playerName: 'alice',
    });

    expect(findLastMessage(context.fakeServer.roomBroadcasts)?.eventName).toBe(
      SOCKET_EVENT_NAMES.ROOM_STATE_UPDATED,
    );
  });

  it('accepts a name with an accent', () => {
    const context = setUpJoinableRoom();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, {
      roomName: 'nether',
      playerName: 'Chloé',
    });

    expect(findLastMessage(context.fakeSocket.emittedToThisSocket)?.eventName).toBe(
      SOCKET_EVENT_NAMES.ROOM_JOIN_ACCEPTED,
    );
  });

  it('accepts a name with digits', () => {
    const context = setUpJoinableRoom();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, {
      roomName: 'nether',
      playerName: 'player1',
    });

    expect(findLastMessage(context.fakeSocket.emittedToThisSocket)?.eventName).toBe(
      SOCKET_EVENT_NAMES.ROOM_JOIN_ACCEPTED,
    );
  });
});

describe('room:join_request rejected', () => {
  function readRejectionReason(context: ReturnType<typeof setUpJoinableRoom>): string | undefined {
    const lastMessage = findLastMessage(context.fakeSocket.emittedToThisSocket);
    const rejection = lastMessage?.payload as { reasonCode: string };

    return rejection.reasonCode;
  }

  it('rejects an empty room name as invalid_room_name', () => {
    const context = setUpJoinableRoom();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, {
      roomName: '',
      playerName: 'alice',
    });

    expect(readRejectionReason(context)).toBe('invalid_room_name');
  });

  it('blames the player name, not the room, when the player name is bad', () => {
    const context = setUpJoinableRoom();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, {
      roomName: 'nether',
      playerName: '',
    });

    expect(readRejectionReason(context)).toBe('invalid_player_name');
  });

  it('rejects a name holding a character that has no place in a URL', () => {
    const context = setUpJoinableRoom();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, {
      roomName: 'nether/../etc',
      playerName: 'alice',
    });

    expect(readRejectionReason(context)).toBe('invalid_room_name');
  });

  it('rejects a name that is far too long', () => {
    const context = setUpJoinableRoom();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, {
      roomName: 'nether',
      playerName: 'a'.repeat(200),
    });

    expect(readRejectionReason(context)).toBe('invalid_player_name');
  });

  it('rejects a payload whose names are not strings at all', () => {
    const context = setUpJoinableRoom();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, {
      roomName: 42,
      playerName: 'alice',
    });

    expect(readRejectionReason(context)).toBe('invalid_room_name');
  });

  it('rejects a name already taken in that room', () => {
    const context = setUpJoinableRoom('socket-bob');
    context.registry.addPlayerToRoom('nether', new Player('socket-alice', 'alice'));

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, {
      roomName: 'nether',
      playerName: 'alice',
    });

    expect(readRejectionReason(context)).toBe('player_name_already_taken');
  });

  it('rejects a join once the round is running (C13)', () => {
    const context = setUpJoinableRoom('socket-bob');
    const game = context.registry.addPlayerToRoom('nether', new Player('socket-alice', 'alice'));
    game.startRound();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, {
      roomName: 'nether',
      playerName: 'bob',
    });

    expect(readRejectionReason(context)).toBe('game_already_started');
  });

  it('leaves the session empty after a rejection', () => {
    const context = setUpJoinableRoom();

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, {
      roomName: '',
      playerName: 'alice',
    });

    expect(context.session.roomName).toBeNull();
    expect(context.session.seatedPlayer).toBeNull();
  });

  it('does not put a rejected socket into the socket.io room', () => {
    const context = setUpJoinableRoom('socket-bob');
    context.registry.addPlayerToRoom('nether', new Player('socket-alice', 'alice'));

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, {
      roomName: 'nether',
      playerName: 'alice',
    });

    expect(context.fakeSocket.joinedRooms).toEqual([]);
  });
});

describe('room:join_request from an already seated socket', () => {
  it('leaves the first room before joining the second', () => {
    const context = setUpJoinableRoom();
    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, {
      roomName: 'nether',
      playerName: 'alice',
    });

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, {
      roomName: 'overworld',
      playerName: 'alice',
    });

    expect(context.fakeSocket.leftRooms).toEqual(['nether']);
    expect(context.session.roomName).toBe('overworld');
  });

  it('leaves no ghost player behind in the first room', () => {
    const context = setUpJoinableRoom();
    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, {
      roomName: 'nether',
      playerName: 'alice',
    });

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, {
      roomName: 'overworld',
      playerName: 'alice',
    });

    expect(context.registry.roomExists('nether')).toBe(false);
  });
});

describe('room:leave_request', () => {
  it('takes the player out of the room', () => {
    const context = setUpJoinableRoom();
    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, {
      roomName: 'nether',
      playerName: 'alice',
    });

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_LEAVE_REQUEST);

    expect(context.registry.roomExists('nether')).toBe(false);
  });

  it('empties the session', () => {
    const context = setUpJoinableRoom();
    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, {
      roomName: 'nether',
      playerName: 'alice',
    });

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_LEAVE_REQUEST);

    expect(context.session.roomName).toBeNull();
    expect(context.session.seatedPlayer).toBeNull();
  });

  it('leaves the socket.io room', () => {
    const context = setUpJoinableRoom();
    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, {
      roomName: 'nether',
      playerName: 'alice',
    });

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_LEAVE_REQUEST);

    expect(context.fakeSocket.leftRooms).toEqual(['nether']);
  });

  it('promotes a new host when the host is the one leaving (C12)', () => {
    const context = setUpJoinableRoom();
    const bob = new Player('socket-bob', 'bob');
    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, {
      roomName: 'nether',
      playerName: 'alice',
    });
    context.registry.addPlayerToRoom('nether', bob);

    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_LEAVE_REQUEST);

    expect(bob.isHost()).toBe(true);
  });

  it('does nothing when the socket was never seated', () => {
    const context = setUpJoinableRoom();

    expect(() =>
      context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_LEAVE_REQUEST),
    ).not.toThrow();
  });

  it('survives being asked to leave twice', () => {
    const context = setUpJoinableRoom();
    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, {
      roomName: 'nether',
      playerName: 'alice',
    });
    context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_LEAVE_REQUEST);

    expect(() =>
      context.fakeSocket.receiveFromClient(SOCKET_EVENT_NAMES.ROOM_LEAVE_REQUEST),
    ).not.toThrow();
  });
});
