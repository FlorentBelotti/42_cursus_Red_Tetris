import { createSlice } from '@reduxjs/toolkit';

export type SocketConnectionStatus = 'idle' | 'connecting' | 'connected' | 'link_lost';

export type SocketConnectionState = {
  readonly status: SocketConnectionStatus;
};

const initialState: SocketConnectionState = { status: 'connecting' };

const socketConnectionSlice = createSlice({
  name: 'socketConnection',
  initialState,
  reducers: {
    connected: (state) => {
      state.status = 'connected';
    },
    disconnected: (state) => {
      state.status = 'link_lost';
    },
    connectionErrored: (state) => {
      state.status = 'link_lost';
    },
  },
});

export const socketConnectionActions = socketConnectionSlice.actions;
export const socketConnectionReducer = socketConnectionSlice.reducer;
