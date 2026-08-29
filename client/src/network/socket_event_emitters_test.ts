import { describe, expect, it, vi } from 'vitest';

import type { TypedClientSocket } from './socket_client_factory';
import {
  emitGameStartRequest,
  emitPlayerGameOverReport,
  emitPlayerLinesCleared,
  emitPlayerSpectrumUpdate,
  emitRoomJoinRequest,
  emitRoomLeaveRequest,
} from './socket_event_emitters';

function createFakeSocket(): TypedClientSocket {
  return { emit: vi.fn() } as unknown as TypedClientSocket;
}

describe('emitRoomJoinRequest', () => {
  it('emits room:join_request with the room name and player name', () => {
    const fakeSocket = createFakeSocket();

    emitRoomJoinRequest(fakeSocket, { roomName: 'myroom', playerName: 'heloise' });

    expect(fakeSocket.emit).toHaveBeenCalledWith('room:join_request', {
      roomName: 'myroom',
      playerName: 'heloise',
    });
  });
});

describe('emitRoomLeaveRequest', () => {
  it('emits room:leave_request with no payload', () => {
    const fakeSocket = createFakeSocket();

    emitRoomLeaveRequest(fakeSocket);

    expect(fakeSocket.emit).toHaveBeenCalledWith('room:leave_request');
  });
});

describe('emitGameStartRequest', () => {
  it('emits game:start_request with no payload', () => {
    const fakeSocket = createFakeSocket();

    emitGameStartRequest(fakeSocket);

    expect(fakeSocket.emit).toHaveBeenCalledWith('game:start_request');
  });
});

describe('emitPlayerSpectrumUpdate', () => {
  it('emits player:spectrum_update with the reported column heights', () => {
    const fakeSocket = createFakeSocket();
    const spectrumColumnHeights = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    emitPlayerSpectrumUpdate(fakeSocket, { spectrumColumnHeights });

    expect(fakeSocket.emit).toHaveBeenCalledWith('player:spectrum_update', {
      spectrumColumnHeights,
    });
  });
});

describe('emitPlayerLinesCleared', () => {
  it('emits player:lines_cleared with the cleared line count', () => {
    const fakeSocket = createFakeSocket();

    emitPlayerLinesCleared(fakeSocket, { clearedLineCount: 2 });

    expect(fakeSocket.emit).toHaveBeenCalledWith('player:lines_cleared', { clearedLineCount: 2 });
  });
});

describe('emitPlayerGameOverReport', () => {
  it('emits player:game_over_report with no payload', () => {
    const fakeSocket = createFakeSocket();

    emitPlayerGameOverReport(fakeSocket);

    expect(fakeSocket.emit).toHaveBeenCalledWith('player:game_over_report');
  });
});
