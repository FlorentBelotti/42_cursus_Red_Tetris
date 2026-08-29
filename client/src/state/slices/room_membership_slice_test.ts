import { describe, expect, it } from 'vitest';

import { roomMembershipActions, roomMembershipReducer } from './room_membership_slice';

const SAMPLE_ROOM_STATE = {
  status: 'waiting' as const,
  hostPlayerId: 'p1',
  players: [{ playerId: 'p1', playerName: 'ALPHA', isHost: true, isAlive: true }],
};

describe('roomMembershipReducer', () => {
  it('stores the accepted join payload', () => {
    const state = roomMembershipReducer(
      undefined,
      roomMembershipActions.joinAccepted({ playerId: 'p1', isHost: true, roomState: SAMPLE_ROOM_STATE }),
    );

    expect(state.localPlayerId).toBe('p1');
    expect(state.roomState?.players).toHaveLength(1);
    expect(state.rejectionReason).toBeNull();
  });

  it('stores a rejection reason', () => {
    const state = roomMembershipReducer(
      undefined,
      roomMembershipActions.joinRejected({ reasonCode: 'invalid_room_name' }),
    );

    expect(state.rejectionReason).toBe('invalid_room_name');
  });

  it('replaces the room state on update', () => {
    const nextRoomState = { ...SAMPLE_ROOM_STATE, status: 'running' as const };
    const state = roomMembershipReducer(
      undefined,
      roomMembershipActions.roomStateUpdated({ roomState: nextRoomState }),
    );

    expect(state.roomState?.status).toBe('running');
  });

  it('records an opponent spectrum update', () => {
    const state = roomMembershipReducer(
      undefined,
      roomMembershipActions.opponentSpectrumUpdated({
        playerId: 'p2',
        spectrumColumnHeights: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
      }),
    );

    expect(state.opponentSpectrums.p2).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
  });

  it('clears opponent spectrums and the winner on round start', () => {
    const withData = roomMembershipReducer(
      undefined,
      roomMembershipActions.opponentSpectrumUpdated({ playerId: 'p2', spectrumColumnHeights: [1] }),
    );

    const state = roomMembershipReducer(withData, roomMembershipActions.roundStarted());

    expect(state.opponentSpectrums).toEqual({});
    expect(state.lastRoundWinnerPlayerId).toBeNull();
  });

  it('records the round winner', () => {
    const state = roomMembershipReducer(undefined, roomMembershipActions.roundFinished('p1'));

    expect(state.lastRoundWinnerPlayerId).toBe('p1');
  });

  it('resets everything on left', () => {
    const withData = roomMembershipReducer(
      undefined,
      roomMembershipActions.joinAccepted({ playerId: 'p1', isHost: true, roomState: SAMPLE_ROOM_STATE }),
    );

    const state = roomMembershipReducer(withData, roomMembershipActions.left());

    expect(state.localPlayerId).toBeNull();
    expect(state.roomState).toBeNull();
  });
});
