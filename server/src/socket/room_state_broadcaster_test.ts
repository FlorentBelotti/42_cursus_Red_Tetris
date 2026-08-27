import { describe, expect, it } from 'vitest';

import { SOCKET_EVENT_NAMES } from 'shared';

import { GameRoomRegistry } from '../domain/game_room_registry';
import { Player } from '../domain/player';
import {
  broadcastRoomStateToRoom,
  broadcastSpectrumToOpponents,
} from './room_state_broadcaster';
import type { TypedSocket, TypedSocketIoServer } from './typed_socket_aliases';

interface RecordedBroadcast {
  roomName: string;
  eventName: string;
  payload: unknown;
}

function createBroadcastRecorder() {
  const recordedBroadcasts: RecordedBroadcast[] = [];

  const fakeEmitter = {
    to(roomName: string) {
      return {
        emit(eventName: string, payload: unknown) {
          recordedBroadcasts.push({ roomName, eventName, payload });
        },
      };
    },
  };

  return { recordedBroadcasts, fakeEmitter };
}

function createPlayerNamed(playerName: string): Player {
  return new Player(`socket-${playerName}`, playerName);
}

describe('broadcastRoomStateToRoom', () => {
  it('broadcasts to the room it was given', () => {
    const recorder = createBroadcastRecorder();
    const registry = new GameRoomRegistry();
    registry.addPlayerToRoom('nether', createPlayerNamed('alice'));

    broadcastRoomStateToRoom(
      recorder.fakeEmitter as unknown as TypedSocketIoServer,
      registry,
      'nether',
    );

    expect(recorder.recordedBroadcasts).toHaveLength(1);
    expect(recorder.recordedBroadcasts[0]?.roomName).toBe('nether');
  });

  it('uses the room state event name from the shared protocol', () => {
    const recorder = createBroadcastRecorder();
    const registry = new GameRoomRegistry();
    registry.addPlayerToRoom('nether', createPlayerNamed('alice'));

    broadcastRoomStateToRoom(
      recorder.fakeEmitter as unknown as TypedSocketIoServer,
      registry,
      'nether',
    );

    expect(recorder.recordedBroadcasts[0]?.eventName).toBe(SOCKET_EVENT_NAMES.ROOM_STATE_UPDATED);
  });

  it('carries the full room state, not a delta', () => {
    const recorder = createBroadcastRecorder();
    const registry = new GameRoomRegistry();
    const alice = createPlayerNamed('alice');
    registry.addPlayerToRoom('nether', alice);
    registry.addPlayerToRoom('nether', createPlayerNamed('bob'));

    broadcastRoomStateToRoom(
      recorder.fakeEmitter as unknown as TypedSocketIoServer,
      registry,
      'nether',
    );

    expect(recorder.recordedBroadcasts[0]?.payload).toEqual({
      roomState: {
        status: 'waiting',
        hostPlayerId: alice.getPlayerId(),
        players: [
          { playerId: alice.getPlayerId(), playerName: 'alice', isHost: true, isAlive: true },
          {
            playerId: 'socket-bob',
            playerName: 'bob',
            isHost: false,
            isAlive: true,
          },
        ],
      },
    });
  });

  it('says nothing about a room that does not exist', () => {
    const recorder = createBroadcastRecorder();
    const registry = new GameRoomRegistry();

    broadcastRoomStateToRoom(
      recorder.fakeEmitter as unknown as TypedSocketIoServer,
      registry,
      'nether',
    );

    expect(recorder.recordedBroadcasts).toHaveLength(0);
  });

  it('says nothing once the room has been destroyed by its last player leaving', () => {
    const recorder = createBroadcastRecorder();
    const registry = new GameRoomRegistry();
    const alice = createPlayerNamed('alice');
    registry.addPlayerToRoom('nether', alice);
    registry.removePlayerFromRoom('nether', alice);

    broadcastRoomStateToRoom(
      recorder.fakeEmitter as unknown as TypedSocketIoServer,
      registry,
      'nether',
    );

    expect(recorder.recordedBroadcasts).toHaveLength(0);
  });

  it('reflects the room as it is at the moment of the broadcast', () => {
    const recorder = createBroadcastRecorder();
    const registry = new GameRoomRegistry();
    const alice = createPlayerNamed('alice');
    registry.addPlayerToRoom('nether', alice);
    const fakeServer = recorder.fakeEmitter as unknown as TypedSocketIoServer;

    broadcastRoomStateToRoom(fakeServer, registry, 'nether');
    registry.addPlayerToRoom('nether', createPlayerNamed('bob'));
    broadcastRoomStateToRoom(fakeServer, registry, 'nether');

    const firstBroadcast = recorder.recordedBroadcasts[0]?.payload as {
      roomState: { players: unknown[] };
    };
    const secondBroadcast = recorder.recordedBroadcasts[1]?.payload as {
      roomState: { players: unknown[] };
    };

    expect(firstBroadcast.roomState.players).toHaveLength(1);
    expect(secondBroadcast.roomState.players).toHaveLength(2);
  });

  it('shows the new host after the previous one has left (C12)', () => {
    const recorder = createBroadcastRecorder();
    const registry = new GameRoomRegistry();
    const alice = createPlayerNamed('alice');
    const bob = createPlayerNamed('bob');
    registry.addPlayerToRoom('nether', alice);
    registry.addPlayerToRoom('nether', bob);
    registry.removePlayerFromRoom('nether', alice);

    broadcastRoomStateToRoom(
      recorder.fakeEmitter as unknown as TypedSocketIoServer,
      registry,
      'nether',
    );

    const broadcastPayload = recorder.recordedBroadcasts[0]?.payload as {
      roomState: { hostPlayerId: string };
    };

    expect(broadcastPayload.roomState.hostPlayerId).toBe(bob.getPlayerId());
  });
});

describe('broadcastSpectrumToOpponents', () => {
  it('relays into the room it was given', () => {
    const recorder = createBroadcastRecorder();

    broadcastSpectrumToOpponents(
      recorder.fakeEmitter as unknown as TypedSocket,
      'nether',
      'socket-alice',
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    );

    expect(recorder.recordedBroadcasts[0]?.roomName).toBe('nether');
  });

  it('uses the opponent spectrum event name from the shared protocol', () => {
    const recorder = createBroadcastRecorder();

    broadcastSpectrumToOpponents(
      recorder.fakeEmitter as unknown as TypedSocket,
      'nether',
      'socket-alice',
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    );

    expect(recorder.recordedBroadcasts[0]?.eventName).toBe(
      SOCKET_EVENT_NAMES.GAME_OPPONENT_SPECTRUM_UPDATED,
    );
  });

  it('says whose spectrum it is and what it looks like', () => {
    const recorder = createBroadcastRecorder();

    broadcastSpectrumToOpponents(
      recorder.fakeEmitter as unknown as TypedSocket,
      'nether',
      'socket-alice',
      [0, 0, 3, 3, 0, 0, 0, 0, 0, 0],
    );

    expect(recorder.recordedBroadcasts[0]?.payload).toEqual({
      playerId: 'socket-alice',
      spectrumColumnHeights: [0, 0, 3, 3, 0, 0, 0, 0, 0, 0],
    });
  });

  it('sends exactly one broadcast per report', () => {
    const recorder = createBroadcastRecorder();

    broadcastSpectrumToOpponents(
      recorder.fakeEmitter as unknown as TypedSocket,
      'nether',
      'socket-alice',
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    );

    expect(recorder.recordedBroadcasts).toHaveLength(1);
  });
});
