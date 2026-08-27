import { BlockCursorView } from './block_cursor_view';
import styles from './keyboard_prompt_view.module.css';

/**
 * A keyboard prompt's visual state. "disabled" means its condition isn't met
 * yet (still visible, dimmed, states the condition). "muted" means it's a
 * secondary action (e.g. a non-host waiting on the host).
 */
export type KeyboardPromptState = 'active' | 'disabled' | 'muted';

export type KeyboardPromptViewProps = {
  readonly text: string;
  readonly state?: KeyboardPromptState;
  readonly cursor?: boolean;
};

/**
 * Renders a keyboard prompt line such as "> PRESS [ENTER] TO JOIN". Replaces
 * every button in the application (LIST.md) — a prompt is never hidden, only
 * dimmed when its condition isn't met.
 *
 * @param props - text, visual state (defaults to "active"), and whether to
 * show the trailing blinking block cursor.
 */
export function KeyboardPromptView(props: KeyboardPromptViewProps): JSX.Element {
  let className = styles.prompt;
  if (props.state === 'disabled') {
    className = `${styles.prompt} ${styles.promptDisabled}`;
  } else if (props.state === 'muted') {
    className = `${styles.prompt} ${styles.promptMuted}`;
  }

  let cursorElement = null;
  if (props.cursor === true) {
    cursorElement = (
      <>
        {' '}
        <BlockCursorView />
      </>
    );
  }

  return (
    <div className={className}>
      {props.text}
      {cursorElement}
    </div>
  );
}
