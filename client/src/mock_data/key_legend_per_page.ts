/**
 * One entry of the bottom key legend bar: a key label and what it does.
 */
export type KeyLegendEntry = {
  readonly key: string;
  readonly label: string;
};

export const HOME_TERMINAL_KEY_LEGEND: readonly KeyLegendEntry[] = [
  { key: 'A-Z 0-9', label: 'TYPE' },
  { key: '[BKSP]', label: 'ERASE' },
  { key: '[↑ ↓]', label: 'HISTORY' },
  { key: '[ENTER]', label: 'RUN COMMAND' },
];

export const ROOM_LOBBY_HOST_KEY_LEGEND: readonly KeyLegendEntry[] = [
  { key: '[ENTER]', label: 'START GAME' },
  { key: '[ESC]', label: 'LEAVE ROOM' },
];

export const ROOM_LOBBY_GUEST_KEY_LEGEND: readonly KeyLegendEntry[] = [
  { key: '[ESC]', label: 'LEAVE ROOM' },
];

export const IN_GAME_KEY_LEGEND: readonly KeyLegendEntry[] = [
  { key: '← →', label: 'MOVE' },
  { key: '↑', label: 'ROTATE' },
  { key: '↓', label: 'SOFT DROP' },
  { key: '[SPACE]', label: 'HARD DROP' },
  { key: '[ESC]', label: 'LEAVE ROOM' },
];

export const ROUND_OVER_HOST_KEY_LEGEND: readonly KeyLegendEntry[] = [
  { key: '[ENTER]', label: 'RESTART' },
  { key: '[ESC]', label: 'BACK TO LOBBY' },
];

export const ROUND_OVER_GUEST_KEY_LEGEND: readonly KeyLegendEntry[] = [
  { key: '[ESC]', label: 'BACK TO LOBBY' },
];

export const JOIN_REJECTED_KEY_LEGEND: readonly KeyLegendEntry[] = [{ key: '[ENTER]', label: 'TRY AGAIN' }];
