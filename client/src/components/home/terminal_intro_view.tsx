import { PanelView } from '../ui/panel_view';
import styles from './terminal_intro_view.module.css';

export function TerminalIntroView(): JSX.Element {
  return (
    <div className={styles.wrapper}>
      <PanelView>
        <div className={styles.lines}>
          <div className={styles.title}>RED TETRIS</div>
          <div className={styles.line}>NETWORKED TETRIS TERMINAL — ROM v1.0 — 10 x 20 FIELD</div>
          <div className={`${styles.line} ${styles.lineDim}`}>LAST FIELD STANDING WINS. THERE IS NO SCORE.</div>
          <div className={`${styles.line} ${styles.lineDim}`}>
            TYPE <span className={styles.key}>HELP</span> FOR THE LIST OF COMMANDS.
          </div>
        </div>
      </PanelView>
    </div>
  );
}
