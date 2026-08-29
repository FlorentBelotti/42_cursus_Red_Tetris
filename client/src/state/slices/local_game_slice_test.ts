import { describe, expect, it } from 'vitest';
import { BOARD_ROW_COUNT } from 'shared';

import { localGameActions, localGameReducer } from './local_game_slice';

describe('localGameReducer', () => {
  it('spawns a piece on round start', () => {
    const state = localGameReducer(undefined, localGameActions.roundStarted(1));

    expect(state.pieceSequenceSeed).toBe(1);
    expect(state.activePiece).not.toBeNull();
    expect(state.isGameOver).toBe(false);
    expect(state.linesClearedCount).toBe(0);
  });

  it('moves the active piece left and right', () => {
    const started = localGameReducer(undefined, localGameActions.roundStarted(1));
    const startColumn = started.activePiece?.column;

    const movedRight = localGameReducer(started, localGameActions.movedRight());
    expect(movedRight.activePiece?.column).toBe((startColumn ?? 0) + 1);

    const movedBack = localGameReducer(movedRight, localGameActions.movedLeft());
    expect(movedBack.activePiece?.column).toBe(startColumn);
  });

  it('locks the piece and spawns the next one once gravity can no longer move it down', () => {
    let state = localGameReducer(undefined, localGameActions.roundStarted(1));
    const spawnCount = state.pieceSpawnCount;

    for (let tick = 0; tick < BOARD_ROW_COUNT + 2; tick += 1) {
      state = localGameReducer(state, localGameActions.gravityTicked());
    }

    expect(state.pieceSpawnCount).toBeGreaterThan(spawnCount);
  });

  it('hard drops and locks in a single dispatch', () => {
    const started = localGameReducer(undefined, localGameActions.roundStarted(1));
    const dropped = localGameReducer(started, localGameActions.hardDropped());

    expect(dropped.board).not.toBe(started.board);
    expect(dropped.activePiece).not.toBeNull();
  });

  it('reports a game over once the board tops out from penalty lines', () => {
    const started = localGameReducer(undefined, localGameActions.roundStarted(1));

    const state = localGameReducer(started, localGameActions.penaltyLinesReceived(BOARD_ROW_COUNT));

    expect(state.isGameOver).toBe(true);
  });

  it('ignores movement once the game is over', () => {
    const started = localGameReducer(undefined, localGameActions.roundStarted(1));
    const toppedOut = localGameReducer(started, localGameActions.penaltyLinesReceived(BOARD_ROW_COUNT));

    const afterMove = localGameReducer(toppedOut, localGameActions.movedLeft());

    expect(afterMove).toBe(toppedOut);
  });
});
