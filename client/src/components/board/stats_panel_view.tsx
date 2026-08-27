import { PanelView } from '../ui/panel_view';
import styles from './stats_panel_view.module.css';

export type StatsPanelViewProps = {
  readonly linesClearedCount: number;
  readonly penaltyLinesSentCount: number;
};

const STAT_DISPLAY_DIGIT_COUNT = 3;

export function StatsPanelView(props: StatsPanelViewProps): JSX.Element {
  const linesDisplay = String(props.linesClearedCount).padStart(STAT_DISPLAY_DIGIT_COUNT, '0');
  const sentDisplay = String(props.penaltyLinesSentCount).padStart(STAT_DISPLAY_DIGIT_COUNT, '0');

  return (
    <PanelView>
      <div className={styles.grid}>
        <span className={styles.key}>LINES</span>
        <span className={styles.value}>{linesDisplay}</span>
        <span className={styles.key}>SENT</span>
        <span className={styles.value}>{sentDisplay}</span>
      </div>
    </PanelView>
  );
}
