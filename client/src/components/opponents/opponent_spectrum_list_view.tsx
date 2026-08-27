import type { OpponentSpectrumSample } from '../../mock_data/opponent_spectrum_sample_data';
import { OpponentSpectrumColumnView } from './opponent_spectrum_column_view';
import styles from './opponent_spectrum_list_view.module.css';

export type OpponentSpectrumListViewProps = {
  readonly opponents: readonly OpponentSpectrumSample[];
};

function describeOpponentStatus(opponent: OpponentSpectrumSample): { statusLabel: string; headClassName: string } {
  if (opponent.isAlive) {
    return { statusLabel: 'ALIVE', headClassName: styles.cardHead ?? '' };
  }

  return { statusLabel: 'DEAD', headClassName: `${styles.cardHead} ${styles.cardHeadDead}` };
}

export function OpponentSpectrumListView(props: OpponentSpectrumListViewProps): JSX.Element {
  return (
    <>
      <div className={styles.heading}>OPPONENTS</div>
      <div className={styles.grid}>
        {props.opponents.map((opponent) => {
          const { statusLabel, headClassName } = describeOpponentStatus(opponent);

          return (
            <div key={opponent.playerName} className={styles.card}>
              <div className={headClassName}>
                <span>{opponent.playerName}</span>
                <span>{statusLabel}</span>
              </div>
              <div className={styles.columns}>
                {opponent.spectrumColumnHeights.map((columnHeight, columnIndex) => (
                  <OpponentSpectrumColumnView key={columnIndex} columnHeight={columnHeight} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
