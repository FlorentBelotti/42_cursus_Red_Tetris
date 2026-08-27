/**
 * The public surface of the `shared` workspace, and the entry point
 * `package.json` advertises as `main` and `types`.
 *
 * Both workspaces import from `'shared'` and never from `'shared/src/...'`:
 * a deep path resolves to a `.ts` source at compile time but to a `.js` that
 * does not exist at run time, so a deep import typechecks happily and then
 * throws the moment the built server starts.
 */

export { BOARD_COLUMN_COUNT, BOARD_ROW_COUNT } from './game_rules/board_dimension_constants';
export { ALL_TETROMINO_TYPES, TetrominoType } from './game_rules/tetromino_type_enum';
export { TETROMINO_SHAPE_DEFINITIONS } from './game_rules/tetromino_shape_definitions';
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

export { SOCKET_EVENT_NAMES } from './protocol/socket_event_names';
export type {
  PlayerLinesClearedPayload,
  PlayerSpectrumUpdatePayload,
  RoomJoinRequestPayload,
} from './protocol/client_to_server_payloads';
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
} from './protocol/server_to_client_payloads';
export type {
  ClientToServerEvents,
  ServerToClientEvents,
} from './protocol/socket_typed_interfaces';
