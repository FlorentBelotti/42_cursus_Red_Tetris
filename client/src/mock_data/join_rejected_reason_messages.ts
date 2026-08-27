/**
 * The three join-rejection reason codes the (future) server can send, per
 * CLAUDE.md's socket protocol proposal (room:join_rejected).
 */
export type JoinRejectedReasonCode =
  | 'game_already_started'
  | 'player_name_already_taken'
  | 'invalid_room_name';

export type JoinRejectedReasonMessage = {
  readonly displayCode: string;
  readonly explanation: string;
};

const JOIN_REJECTED_REASON_MESSAGES: Record<JoinRejectedReasonCode, JoinRejectedReasonMessage> = {
  game_already_started: {
    displayCode: 'GAME ALREADY STARTED',
    explanation: 'ROUND IN PROGRESS. WAIT FOR THE NEXT ONE.',
  },
  player_name_already_taken: {
    displayCode: 'PLAYER NAME ALREADY TAKEN',
    explanation: 'THAT PLAYER NAME IS ALREADY USED IN THIS ROOM.',
  },
  invalid_room_name: {
    displayCode: 'INVALID ROOM NAME',
    explanation: 'ROOM NAME CONTAINS UNSUPPORTED CHARACTERS.',
  },
};

/**
 * Looks up the display code and explanation text for a join-rejection reason.
 *
 * @param reasonCode - The reason code reported by the server.
 * @returns The matching display code and explanation.
 */
export function resolveJoinRejectedReasonMessage(
  reasonCode: JoinRejectedReasonCode,
): JoinRejectedReasonMessage {
  return JOIN_REJECTED_REASON_MESSAGES[reasonCode];
}
