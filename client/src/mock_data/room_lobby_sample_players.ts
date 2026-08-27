export type RoomLobbySamplePlayer = {
  readonly playerName: string;
  readonly isHost: boolean;
};

export const ROOM_LOBBY_SAMPLE_PLAYERS: readonly RoomLobbySamplePlayer[] = [
  { playerName: 'PELICAN', isHost: true },
  { playerName: 'V0ID', isHost: false },
  { playerName: 'KAMI', isHost: false },
  { playerName: 'R3DHAT', isHost: false },
];
