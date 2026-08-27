/**
 * One opponent's placeholder spectrum: name, alive flag, and the height
 * (0-19) of each of the 10 columns' highest block.
 */
export type OpponentSpectrumSample = {
  readonly playerName: string;
  readonly isAlive: boolean;
  readonly spectrumColumnHeights: readonly number[];
};

/**
 * Three opponents matching design_handoff_red_tetris/03 In-Game.dc.html
 * exactly (heights derived from the mockup's column percentages).
 */
export const OPPONENT_SPECTRUM_SAMPLES: readonly OpponentSpectrumSample[] = [
  {
    playerName: 'V0ID',
    isAlive: true,
    spectrumColumnHeights: [3, 5, 4, 7, 6, 2, 4, 5, 3, 6],
  },
  {
    playerName: 'KAMI',
    isAlive: true,
    spectrumColumnHeights: [8, 6, 7, 5, 9, 7, 6, 4, 5, 7],
  },
  {
    playerName: 'R3DHAT',
    isAlive: false,
    spectrumColumnHeights: [2, 3, 2, 4, 3, 5, 4, 2, 3, 2],
  },
];
