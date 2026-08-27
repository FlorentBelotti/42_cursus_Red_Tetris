/**
 * One row of the Room Lobby's player table.
 */
export type RoomLobbySamplePlayer = {
  readonly playerName: string;
  readonly isHost: boolean;
};

/**
 * Matches design_handoff_red_tetris/02 Room Lobby.dc.html: the local player
 * (PELICAN) is host, three opponents have already joined.
 */
export const ROOM_LOBBY_SAMPLE_PLAYERS: readonly RoomLobbySamplePlayer[] = [
  { playerName: 'PELICAN', isHost: true },
  { playerName: 'V0ID', isHost: false },
  { playerName: 'KAMI', isHost: false },
  { playerName: 'R3DHAT', isHost: false },
];
