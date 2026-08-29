import { createSlice, type Draft, type PayloadAction } from '@reduxjs/toolkit';

import type { ActivePieceState } from '../../game_engine/active_piece_state';
import { clearCompletedLines } from '../../game_engine/completed_line_clearing';
import { createEmptyBoardMatrix, type BoardMatrix } from '../../game_engine/empty_board_matrix_factory';
import { doesActivePieceCollide } from '../../game_engine/collision_detection';
import { applyGravityStep } from '../../game_engine/piece_gravity_step';
import { isBoardToppedOut } from '../../game_engine/game_over_detection';
import { hardDropActivePiece } from '../../game_engine/piece_hard_drop_resolution';
import { lockActivePieceIntoBoard } from '../../game_engine/piece_locking_into_board';
import { moveActivePieceHorizontally } from '../../game_engine/piece_horizontal_movement';
import { insertPenaltyLines } from '../../game_engine/penalty_line_insertion';
import { getTetrominoTypeAtSequenceIndex } from '../../game_engine/piece_sequence_indexing';
import { rotateActivePiece } from '../../game_engine/piece_rotation_resolution';
import { spawnActivePiece } from '../../game_engine/piece_spawn_positioning';

const LINE_KEPT_BY_CLEARING_PLAYER = 1;

export type LocalGameState = {
  pieceSequenceSeed: number | null;
  pieceSpawnCount: number;
  board: BoardMatrix;
  activePiece: ActivePieceState | null;
  linesClearedCount: number;
  penaltyLinesSentCount: number;
  isGameOver: boolean;
};

const initialState: LocalGameState = {
  pieceSequenceSeed: null,
  pieceSpawnCount: 0,
  board: createEmptyBoardMatrix(),
  activePiece: null,
  linesClearedCount: 0,
  penaltyLinesSentCount: 0,
  isGameOver: false,
};

function spawnNextPiece(state: Draft<LocalGameState>): void {
  if (state.pieceSequenceSeed === null) {
    return;
  }

  const nextPiece = spawnActivePiece(
    getTetrominoTypeAtSequenceIndex(state.pieceSequenceSeed, state.pieceSpawnCount),
  );
  state.pieceSpawnCount += 1;

  if (doesActivePieceCollide(state.board, nextPiece)) {
    state.activePiece = null;
    state.isGameOver = true;
    return;
  }

  state.activePiece = nextPiece;
}

function lockActivePieceAndAdvance(state: Draft<LocalGameState>): void {
  if (state.activePiece === null) {
    return;
  }

  const lockedBoard = lockActivePieceIntoBoard(state.board, state.activePiece);
  const { board: clearedBoard, clearedLineCount } = clearCompletedLines(lockedBoard);

  state.board = clearedBoard;
  state.linesClearedCount += clearedLineCount;
  state.penaltyLinesSentCount += Math.max(0, clearedLineCount - LINE_KEPT_BY_CLEARING_PLAYER);

  if (isBoardToppedOut(state.board)) {
    state.activePiece = null;
    state.isGameOver = true;
    return;
  }

  spawnNextPiece(state);
}

const localGameSlice = createSlice({
  name: 'localGame',
  initialState,
  reducers: {
    roundStarted: (state, action: PayloadAction<number>) => {
      state.pieceSequenceSeed = action.payload;
      state.pieceSpawnCount = 0;
      state.board = createEmptyBoardMatrix();
      state.linesClearedCount = 0;
      state.penaltyLinesSentCount = 0;
      state.isGameOver = false;
      spawnNextPiece(state);
    },
    movedLeft: (state) => {
      if (state.activePiece === null || state.isGameOver) {
        return;
      }
      state.activePiece = moveActivePieceHorizontally(state.board, state.activePiece, -1);
    },
    movedRight: (state) => {
      if (state.activePiece === null || state.isGameOver) {
        return;
      }
      state.activePiece = moveActivePieceHorizontally(state.board, state.activePiece, 1);
    },
    rotated: (state) => {
      if (state.activePiece === null || state.isGameOver) {
        return;
      }
      state.activePiece = rotateActivePiece(state.board, state.activePiece);
    },
    gravityTicked: (state) => {
      if (state.activePiece === null || state.isGameOver) {
        return;
      }

      const droppedPiece = applyGravityStep(state.board, state.activePiece);

      if (droppedPiece === state.activePiece) {
        lockActivePieceAndAdvance(state);
        return;
      }

      state.activePiece = droppedPiece;
    },
    hardDropped: (state) => {
      if (state.activePiece === null || state.isGameOver) {
        return;
      }

      state.activePiece = hardDropActivePiece(state.board, state.activePiece);
      lockActivePieceAndAdvance(state);
    },
    penaltyLinesReceived: (state, action: PayloadAction<number>) => {
      if (state.isGameOver) {
        return;
      }

      state.board = insertPenaltyLines(state.board, action.payload);

      if (isBoardToppedOut(state.board)) {
        state.isGameOver = true;
      }
    },
  },
});

export const localGameActions = localGameSlice.actions;
export const localGameReducer = localGameSlice.reducer;
