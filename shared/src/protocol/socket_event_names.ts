export const SOCKET_EVENT_NAMES = Object.freeze({
  ROOM_JOIN_REQUEST: 'room:join_request',
  ROOM_LEAVE_REQUEST: 'room:leave_request',
  GAME_START_REQUEST: 'game:start_request',
  PLAYER_SPECTRUM_UPDATE: 'player:spectrum_update',
  PLAYER_LINES_CLEARED: 'player:lines_cleared',
  PLAYER_GAME_OVER_REPORT: 'player:game_over_report',

  ROOM_JOIN_ACCEPTED: 'room:join_accepted',
  ROOM_JOIN_REJECTED: 'room:join_rejected',
  ROOM_STATE_UPDATED: 'room:state_updated',
  GAME_ROUND_STARTED: 'game:round_started',
  GAME_PENALTY_LINES_RECEIVED: 'game:penalty_lines_received',
  GAME_OPPONENT_SPECTRUM_UPDATED: 'game:opponent_spectrum_updated',
  GAME_PLAYER_ELIMINATED: 'game:player_eliminated',
  GAME_ROUND_FINISHED: 'game:round_finished',
} as const);
