import { BlockCursorView } from './block_cursor_view';
import styles from './keyboard_prompt_view.module.css';

export type KeyboardPromptState = 'active' | 'disabled' | 'muted';

export type KeyboardPromptViewProps = {
  readonly text: string;
  readonly state?: KeyboardPromptState;
  readonly cursor?: boolean;
};

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
