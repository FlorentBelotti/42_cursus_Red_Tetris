import { PanelView } from '../ui/panel_view';
import styles from './terminal_intro_view.module.css';

/**
 * The Home terminal's fixed intro block: logo, description, rule, and the
 * "TYPE HELP..." hook. Always visible, never scrolled. Static copy — matches
 * design_handoff_red_tetris/01 Home Terminal.dc.html exactly, so it isn't
 * pulled from mock_data like the terminal's actual command output is.
 */
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
