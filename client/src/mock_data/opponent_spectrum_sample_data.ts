export type OpponentSpectrumSample = {
  readonly playerName: string;
  readonly isAlive: boolean;
  readonly spectrumColumnHeights: readonly number[];
};

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
