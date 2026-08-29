import { createAction, type Middleware, type UnknownAction } from '@reduxjs/toolkit';
import type { RoomJoinRequestPayload } from 'shared';

import { computeSpectrumColumnHeights } from '../game_engine/spectrum_column_computation';
import { localGameActions, type LocalGameState } from '../state/slices/local_game_slice';
import { roomMembershipActions } from '../state/slices/room_membership_slice';
import { socketConnectionActions } from '../state/slices/socket_connection_slice';
import {
  emitGameStartRequest,
  emitPlayerGameOverReport,
  emitPlayerLinesCleared,
  emitPlayerSpectrumUpdate,
  emitRoomJoinRequest,
  emitRoomLeaveRequest,
} from './socket_event_emitters';
import { registerSocketEventSubscriptions } from './socket_event_subscription_registry';
import type { TypedClientSocket } from './socket_client_factory';

export const requestRoomJoin = createAction<RoomJoinRequestPayload>('socket/requestRoomJoin');
export const requestRoomLeave = createAction('socket/requestRoomLeave');
export const requestGameStart = createAction('socket/requestGameStart');

const LOCK_CAUSING_ACTION_TYPES: readonly string[] = [
  localGameActions.gravityTicked.type,
  localGameActions.hardDropped.type,
];

type SocketMiddlewareState = { readonly localGame: LocalGameState };

export function createSocketReduxMiddleware(
  socket: TypedClientSocket,
): Middleware<object, SocketMiddlewareState> {
  return (store) => {
    registerSocketEventSubscriptions(socket, {
      onConnected: () => store.dispatch(socketConnectionActions.connected()),
      onDisconnected: () => store.dispatch(socketConnectionActions.disconnected()),
      onConnectError: () => store.dispatch(socketConnectionActions.connectionErrored()),
      onRoomJoinAccepted: (payload) => store.dispatch(roomMembershipActions.joinAccepted(payload)),
      onRoomJoinRejected: (payload) => store.dispatch(roomMembershipActions.joinRejected(payload)),
      onRoomStateUpdated: (payload) => store.dispatch(roomMembershipActions.roomStateUpdated(payload)),
      onGameRoundStarted: (payload) => {
        store.dispatch(roomMembershipActions.roundStarted());
        store.dispatch(localGameActions.roundStarted(payload.pieceSequenceSeed));
      },
      onGamePenaltyLinesReceived: (payload) =>
        store.dispatch(localGameActions.penaltyLinesReceived(payload.penaltyLineCount)),
      onGameOpponentSpectrumUpdated: (payload) =>
        store.dispatch(roomMembershipActions.opponentSpectrumUpdated(payload)),
      onGamePlayerEliminated: () => undefined,
      onGameRoundFinished: (payload) =>
        store.dispatch(roomMembershipActions.roundFinished(payload.winnerPlayerId)),
    });

    return (next) => (action: unknown) => {
      if (requestRoomJoin.match(action)) {
        emitRoomJoinRequest(socket, action.payload);
      } else if (requestRoomLeave.match(action)) {
        emitRoomLeaveRequest(socket);
      } else if (requestGameStart.match(action)) {
        emitGameStartRequest(socket);
      }

      const previousLocalGame = store.getState().localGame;
      const result = next(action);
      const nextLocalGame = store.getState().localGame;
      const actionType = (action as UnknownAction).type;

      if (LOCK_CAUSING_ACTION_TYPES.includes(actionType) && nextLocalGame.board !== previousLocalGame.board) {
        const clearedThisLock = nextLocalGame.linesClearedCount - previousLocalGame.linesClearedCount;

        if (clearedThisLock > 0) {
          emitPlayerLinesCleared(socket, { clearedLineCount: clearedThisLock });
        }

        emitPlayerSpectrumUpdate(socket, {
          spectrumColumnHeights: computeSpectrumColumnHeights(nextLocalGame.board),
        });
      }

      if (previousLocalGame.isGameOver === false && nextLocalGame.isGameOver === true) {
        emitPlayerGameOverReport(socket);
      }

      return result;
    };
  };
}
