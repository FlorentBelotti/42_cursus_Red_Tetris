import { SOCKET_EVENT_NAMES } from 'shared';
import type { JoinRejectionReasonCode, RoomJoinRequestPayload } from 'shared';

import type { Game } from '../domain/game';
import type { GameRoomRegistry } from '../domain/game_room_registry';
import { Player } from '../domain/player';
import {
  GameAlreadyRunningError,
  GameEndedError,
  NameAlreadyInUse,
} from '../errors/management_errors';
import { releaseSocketFromItsRoom, type SocketRoomSession } from './connection_lifecycle_handler';
import { broadcastRoomStateToRoom } from './room_state_broadcaster';
import type { TypedSocket, TypedSocketIoServer } from './typed_socket_aliases';

const LONGEST_ALLOWED_NAME_LENGTH = 20;

const USABLE_NAME_PATTERN = /^[\p{L}\p{N}_-]+$/u;

export function registerRoomMembershipEventHandler(
  socketIoServer: TypedSocketIoServer,
  socket: TypedSocket,
  gameRoomRegistry: GameRoomRegistry,
  session: SocketRoomSession,
): void {
  socket.on(SOCKET_EVENT_NAMES.ROOM_JOIN_REQUEST, (payload: RoomJoinRequestPayload) => {
    handleRoomJoinRequest(socketIoServer, socket, gameRoomRegistry, session, payload);
  });

  socket.on(SOCKET_EVENT_NAMES.ROOM_LEAVE_REQUEST, () => {
    releaseSocketFromItsRoom(socketIoServer, socket, gameRoomRegistry, session);
  });
}

function handleRoomJoinRequest(
  socketIoServer: TypedSocketIoServer,
  socket: TypedSocket,
  gameRoomRegistry: GameRoomRegistry,
  session: SocketRoomSession,
  payload: RoomJoinRequestPayload,
): void {
  const nameProblem = findNameProblem(payload);

  if (nameProblem !== null) {
    socket.emit(SOCKET_EVENT_NAMES.ROOM_JOIN_REJECTED, { reasonCode: nameProblem });
    return;
  }

  releaseSocketFromItsRoom(socketIoServer, socket, gameRoomRegistry, session);

  const joiningPlayer = new Player(socket.id, payload.playerName);
  const joinedGame = seatPlayerOrRejectJoin(
    socket,
    gameRoomRegistry,
    payload.roomName,
    joiningPlayer,
  );

  if (joinedGame === null) {
    return;
  }

  session.roomName = payload.roomName;
  session.seatedPlayer = joiningPlayer;

  socket.join(payload.roomName);
  socket.emit(SOCKET_EVENT_NAMES.ROOM_JOIN_ACCEPTED, {
    playerId: joiningPlayer.getPlayerId(),
    isHost: joiningPlayer.isHost(),
    roomState: joinedGame.getRoomPublicState(),
  });
  broadcastRoomStateToRoom(socketIoServer, gameRoomRegistry, payload.roomName);
}

function seatPlayerOrRejectJoin(
  socket: TypedSocket,
  gameRoomRegistry: GameRoomRegistry,
  roomName: string,
  joiningPlayer: Player,
): Game | null {
  try {
    return gameRoomRegistry.addPlayerToRoom(roomName, joiningPlayer);
  } catch (joinFailure) {
    socket.emit(SOCKET_EVENT_NAMES.ROOM_JOIN_REJECTED, {
      reasonCode: resolveJoinRejectionReasonCode(joinFailure),
    });
    return null;
  }
}

function resolveJoinRejectionReasonCode(joinFailure: unknown): JoinRejectionReasonCode {
  if (joinFailure instanceof GameAlreadyRunningError) {
    return 'game_already_started';
  }

  if (joinFailure instanceof GameEndedError) {
    return 'game_already_started';
  }

  if (joinFailure instanceof NameAlreadyInUse) {
    return 'player_name_already_taken';
  }

  return 'invalid_room_name';
}

function findNameProblem(payload: RoomJoinRequestPayload): JoinRejectionReasonCode | null {
  if (isUsableName(payload.roomName) === false) {
    return 'invalid_room_name';
  }

  if (isUsableName(payload.playerName) === false) {
    return 'invalid_player_name';
  }

  return null;
}

function isUsableName(candidateName: unknown): boolean {
  if (typeof candidateName !== 'string') {
    return false;
  }

  if (candidateName.length === 0) {
    return false;
  }

  if (candidateName.length > LONGEST_ALLOWED_NAME_LENGTH) {
    return false;
  }

  return USABLE_NAME_PATTERN.test(candidateName);
}
