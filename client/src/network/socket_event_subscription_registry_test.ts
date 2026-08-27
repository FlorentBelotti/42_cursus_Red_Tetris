import { describe, expect, it, vi } from 'vitest';

import type { TypedClientSocket } from './socket_client_factory';
import {
  registerSocketEventSubscriptions,
  type SocketEventHandlers,
} from './socket_event_subscription_registry';

/**
 * Builds a fake socket whose only working members are mocked `on`/`off`,
 * which is all `registerSocketEventSubscriptions` ever calls.
 */
function createFakeSocket(): TypedClientSocket {
  return { on: vi.fn(), off: vi.fn() } as unknown as TypedClientSocket;
}

/** Builds a full set of handlers, each a distinct mock function. */
function createFakeHandlers(): SocketEventHandlers {
  return {
    onConnected: vi.fn(),
    onDisconnected: vi.fn(),
    onConnectError: vi.fn(),
    onRoomJoinAccepted: vi.fn(),
    onRoomJoinRejected: vi.fn(),
    onRoomStateUpdated: vi.fn(),
    onGameRoundStarted: vi.fn(),
    onGamePenaltyLinesReceived: vi.fn(),
    onGameOpponentSpectrumUpdated: vi.fn(),
    onGamePlayerEliminated: vi.fn(),
    onGameRoundFinished: vi.fn(),
  };
}

/**
 * Every event name `registerSocketEventSubscriptions` is expected to
 * subscribe to, paired with the `SocketEventHandlers` field it must be
 * wired to.
 */
const EXPECTED_EVENT_NAME_TO_HANDLER_KEY: ReadonlyArray<readonly [string, keyof SocketEventHandlers]> = [
  ['connect', 'onConnected'],
  ['disconnect', 'onDisconnected'],
  ['connect_error', 'onConnectError'],
  ['room:join_accepted', 'onRoomJoinAccepted'],
  ['room:join_rejected', 'onRoomJoinRejected'],
  ['room:state_updated', 'onRoomStateUpdated'],
  ['game:round_started', 'onGameRoundStarted'],
  ['game:penalty_lines_received', 'onGamePenaltyLinesReceived'],
  ['game:opponent_spectrum_updated', 'onGameOpponentSpectrumUpdated'],
  ['game:player_eliminated', 'onGamePlayerEliminated'],
  ['game:round_finished', 'onGameRoundFinished'],
];

describe('registerSocketEventSubscriptions subscribes to every event', () => {
  it('registers exactly one listener per event, wired to the matching handler', () => {
    const fakeSocket = createFakeSocket();
    const handlers = createFakeHandlers();

    registerSocketEventSubscriptions(fakeSocket, handlers);

    for (const [eventName, handlerKey] of EXPECTED_EVENT_NAME_TO_HANDLER_KEY) {
      expect(fakeSocket.on).toHaveBeenCalledWith(eventName, handlers[handlerKey]);
    }

    expect(fakeSocket.on).toHaveBeenCalledTimes(EXPECTED_EVENT_NAME_TO_HANDLER_KEY.length);
  });
});

describe('the returned unsubscribe function removes every listener', () => {
  it('calls socket.off with the exact same event name and handler as socket.on', () => {
    const fakeSocket = createFakeSocket();
    const handlers = createFakeHandlers();

    const unsubscribeFromSocketEvents = registerSocketEventSubscriptions(fakeSocket, handlers);
    unsubscribeFromSocketEvents();

    for (const [eventName, handlerKey] of EXPECTED_EVENT_NAME_TO_HANDLER_KEY) {
      expect(fakeSocket.off).toHaveBeenCalledWith(eventName, handlers[handlerKey]);
    }

    expect(fakeSocket.off).toHaveBeenCalledTimes(EXPECTED_EVENT_NAME_TO_HANDLER_KEY.length);
  });
});
