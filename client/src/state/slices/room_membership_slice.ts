import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  JoinRejectionReasonCode,
  PlayerPublicState,
  RoomJoinAcceptedPayload,
  RoomJoinRejectedPayload,
  RoomPublicState,
  RoomStateUpdatedPayload,
  SpectrumColumnHeights,
} from 'shared';

export type RoomMembershipRoomState = {
  status: RoomPublicState['status'];
  hostPlayerId: string | null;
  players: PlayerPublicState[];
};

export type RoomMembershipState = {
  localPlayerId: string | null;
  roomState: RoomMembershipRoomState | null;
  rejectionReason: JoinRejectionReasonCode | null;
  opponentSpectrums: Record<string, number[]>;
  lastRoundWinnerPlayerId: string | null;
};

function toMutableRoomState(roomState: RoomPublicState): RoomMembershipRoomState {
  return {
    status: roomState.status,
    hostPlayerId: roomState.hostPlayerId,
    players: roomState.players.map((player) => ({ ...player })),
  };
}

const initialState: RoomMembershipState = {
  localPlayerId: null,
  roomState: null,
  rejectionReason: null,
  opponentSpectrums: {},
  lastRoundWinnerPlayerId: null,
};

const roomMembershipSlice = createSlice({
  name: 'roomMembership',
  initialState,
  reducers: {
    joinAccepted: (state, action: PayloadAction<RoomJoinAcceptedPayload>) => {
      state.localPlayerId = action.payload.playerId;
      state.roomState = toMutableRoomState(action.payload.roomState);
      state.rejectionReason = null;
    },
    joinRejected: (state, action: PayloadAction<RoomJoinRejectedPayload>) => {
      state.rejectionReason = action.payload.reasonCode;
    },
    roomStateUpdated: (state, action: PayloadAction<RoomStateUpdatedPayload>) => {
      state.roomState = toMutableRoomState(action.payload.roomState);
    },
    opponentSpectrumUpdated: (
      state,
      action: PayloadAction<{ playerId: string; spectrumColumnHeights: SpectrumColumnHeights }>,
    ) => {
      state.opponentSpectrums[action.payload.playerId] = [...action.payload.spectrumColumnHeights];
    },
    roundStarted: (state) => {
      state.opponentSpectrums = {};
      state.lastRoundWinnerPlayerId = null;
    },
    roundFinished: (state, action: PayloadAction<string | null>) => {
      state.lastRoundWinnerPlayerId = action.payload;
    },
    left: () => initialState,
  },
});

export const roomMembershipActions = roomMembershipSlice.actions;
export const roomMembershipReducer = roomMembershipSlice.reducer;
