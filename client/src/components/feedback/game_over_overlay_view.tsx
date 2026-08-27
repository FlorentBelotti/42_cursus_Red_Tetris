import { KeyboardPromptView, type KeyboardPromptState } from '../ui/keyboard_prompt_view';
import styles from './game_over_overlay_view.module.css';

export type GameOverOverlayViewProps = {
  readonly title: string;
  readonly subtitle: string;
  readonly restartPromptText: string;
  readonly restartPromptState: KeyboardPromptState;
};

/**
 * The Round Over overlay: drawn on top of the In-Game screen (the board
 * stays visible behind it), not a separate page. The resolved title,
 * subtitle, and restart prompt come from
 * page_access/round_over_page_access.ts — this component only renders them.
 *
 * @param props - The title ("WINNER" or "GAME OVER"), subtitle, and the
 * resolved restart prompt.
 */
export function GameOverOverlayView(props: GameOverOverlayViewProps): JSX.Element {
  return (
    <div className={styles.overlay}>
      <div className={styles.title}>{props.title}</div>
      <div className={styles.subtitle}>{props.subtitle}</div>
      <div className={styles.prompts}>
        <KeyboardPromptView
          text={props.restartPromptText}
          state={props.restartPromptState}
          cursor={props.restartPromptState === 'active'}
        />
        <KeyboardPromptView text="> PRESS [ESC] TO GO BACK TO LOBBY" state="muted" />
      </div>
    </div>
  );
}
