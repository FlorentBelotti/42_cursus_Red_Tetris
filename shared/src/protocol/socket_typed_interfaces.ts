import {
  PlayerLinesClearedPayload,
  PlayerSpectrumUpdatePayload,
  RoomJoinRequestPayload,
} from './client_to_server_payloads';
import {
  GameOpponentSpectrumUpdatedPayload,
  GamePenaltyLinesReceivedPayload,
  GamePlayerEliminatedPayload,
  GameRoundFinishedPayload,
  GameRoundStartedPayload,
  RoomJoinAcceptedPayload,
  RoomJoinRejectedPayload,
  RoomStateUpdatedPayload,
} from './server_to_client_payloads';

/** Events the client emits and the server listens for. */
export interface ClientToServerEvents {
  'room:join_request': (payload: RoomJoinRequestPayload) => void;
  'room:leave_request': () => void;
  'game:start_request': () => void;
  'player:spectrum_update': (payload: PlayerSpectrumUpdatePayload) => void;
  'player:lines_cleared': (payload: PlayerLinesClearedPayload) => void;
  'player:game_over_report': () => void;
}

/** Events the server emits and the client listens for. */
export interface ServerToClientEvents {
  'room:join_accepted': (payload: RoomJoinAcceptedPayload) => void;
  'room:join_rejected': (payload: RoomJoinRejectedPayload) => void;
  'room:state_updated': (payload: RoomStateUpdatedPayload) => void;
  'game:round_started': (payload: GameRoundStartedPayload) => void;
  'game:penalty_lines_received': (payload: GamePenaltyLinesReceivedPayload) => void;
  'game:opponent_spectrum_updated': (payload: GameOpponentSpectrumUpdatedPayload) => void;
  'game:player_eliminated': (payload: GamePlayerEliminatedPayload) => void;
  'game:round_finished': (payload: GameRoundFinishedPayload) => void;
}
