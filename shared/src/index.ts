
export { BOARD_COLUMN_COUNT, BOARD_ROW_COUNT } from './game_rules/board_dimension_constants.js';
export { ALL_TETROMINO_TYPES, TetrominoType } from './game_rules/tetromino_type_enum.js';
export { TETROMINO_SHAPE_DEFINITIONS } from './game_rules/tetromino_shape_definitions.js';
export type {
  TetrominoCellCoordinate,
  TetrominoRotationState,
  TetrominoRotationStates,
  TetrominoShapeDefinition,
} from './game_rules/tetromino_shape_definitions';
export { createPieceSequenceGenerator } from './game_rules/piece_sequence_generator';
export type { PieceSequenceGenerator } from './game_rules/piece_sequence_generator';

export {
  createEmptySpectrumColumnHeights,
  isValidSpectrumColumnHeights,
} from './domain_types/spectrum_column_heights';
export type { SpectrumColumnHeights } from './domain_types/spectrum_column_heights';
export type { PlayerPublicState } from './domain_types/player_public_state';
export type { RoomPublicState, RoomStatus } from './domain_types/room_public_state';

export { createSeededRandomNumberGenerator } from './utils/seeded_random_number_generator';
export type { RandomNumberGenerator } from './utils/seeded_random_number_generator';

export { SOCKET_EVENT_NAMES } from './protocol/socket_event_names.js';
export type {
  PlayerLinesClearedPayload,
  PlayerSpectrumUpdatePayload,
  RoomJoinRequestPayload,
} from './protocol/client_to_server_payloads.js';
export type {
  GameOpponentSpectrumUpdatedPayload,
  GamePenaltyLinesReceivedPayload,
  GamePlayerEliminatedPayload,
  GameRoundFinishedPayload,
  GameRoundStartedPayload,
  JoinRejectionReasonCode,
  RoomJoinAcceptedPayload,
  RoomJoinRejectedPayload,
  RoomStateUpdatedPayload,
} from './protocol/server_to_client_payloads.js';
export type {
  ClientToServerEvents,
  ServerToClientEvents,
} from './protocol/socket_typed_interfaces.js';
