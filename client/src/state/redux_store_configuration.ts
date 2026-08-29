import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';

import { createSocketClient } from '../network/socket_client_factory';
import { createSocketReduxMiddleware } from '../network/socket_redux_middleware';
import { localGameReducer } from './slices/local_game_slice';
import { roomMembershipReducer } from './slices/room_membership_slice';
import { socketConnectionReducer } from './slices/socket_connection_slice';

const socket = createSocketClient();

export const store = configureStore({
  reducer: {
    socketConnection: socketConnectionReducer,
    roomMembership: roomMembershipReducer,
    localGame: localGameReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(createSocketReduxMiddleware(socket)),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
