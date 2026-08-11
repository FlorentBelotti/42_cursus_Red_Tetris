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

/**
 * Longest room or player name accepted. Names come from the join URL and are
 * shown in every opponent's lobby, so an unbounded one is both a display
 * problem and a way to waste memory on a room nobody asked for.
 */
const LONGEST_ALLOWED_NAME_LENGTH = 20;

/**
 * Characters a room or player name may use: letters of any alphabet, digits,
 * hyphen and underscore. Letters are matched by unicode property rather than
 * by an A-Z range, so "Chloé" and "Iñaki" are accepted like any other name.
 */
const USABLE_NAME_PATTERN = /^[\p{L}\p{N}_-]+$/u;

/**
 * Registers the room membership events for a single connected socket.
 *
 * @param socketIoServer - The socket.io server, for room broadcasts.
 * @param socket - The connected client socket.
 * @param gameRoomRegistry - The registry owning every live room.
 * @param session - Mutable record of what this socket is seated as.
 */
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

/**
 * Seats a socket in a room, or tells it why it cannot be seated.
 *
 * A socket that is already seated is released first, so a client moving from
 * one room URL to another never leaves a ghost player behind.
 *
 * @param socketIoServer - The socket.io server, for room broadcasts.
 * @param socket - The socket asking to join.
 * @param gameRoomRegistry - The registry owning every live room.
 * @param session - Mutable record of what this socket is seated as.
 * @param payload - The requested room name and player name.
 */
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

/**
 * Hands a player to the registry, and rejects the join when the domain refuses
 * to seat them.
 *
 * @param socket - The socket asking to join, told directly when refused.
 * @param gameRoomRegistry - The registry owning every live room.
 * @param roomName - The room being joined.
 * @param joiningPlayer - The player being seated.
 * @returns The game the player now belongs to, or null when the join failed.
 */
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

/**
 * Maps a domain failure onto the rejection code the client understands.
 *
 * A room whose round has finished reports `game_already_started` as well: from
 * the client's point of view both mean "this room is mid-cycle, try the next
 * round", and the protocol deliberately keeps one code for that.
 *
 * An unrecognised failure is reported rather than swallowed, so a bug can never
 * look like a successful join.
 *
 * @param joinFailure - The error thrown by the domain layer.
 * @returns The reason code to send back.
 */
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

/**
 * Checks the two names a join request carries, and says which one is at fault.
 *
 * Payloads arrive from the network and are not trusted, so both names are
 * checked before anything reaches the domain. Reporting the offending name
 * separately lets the client tell the player which half of the URL to fix.
 *
 * @param payload - The received join request payload.
 * @returns The rejection code for the first unusable name, or null when both
 *          names are fine.
 */
function findNameProblem(payload: RoomJoinRequestPayload): JoinRejectionReasonCode | null {
  if (isUsableName(payload.roomName) === false) {
    return 'invalid_room_name';
  }

  if (isUsableName(payload.playerName) === false) {
    return 'invalid_player_name';
  }

  return null;
}

/**
 * Tells whether a value received over the network is a usable room or player
 * name.
 *
 * @param candidateName - The value to check, of unknown type until proven.
 * @returns True when the value is a short, non-empty string of allowed
 *          characters.
 */
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
