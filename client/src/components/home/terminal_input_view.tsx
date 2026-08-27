import { BlockCursorView } from '../ui/block_cursor_view';
import { TERMINAL_SHELL_PROMPT_TEXT } from '../../mock_data/terminal_shell_prompt';
import styles from './terminal_input_view.module.css';

export type TerminalInputViewProps = {
  readonly typedText: string;
};

/**
 * The Home terminal's live input line: shell prompt, typed text, and the
 * blinking block cursor glued immediately after it (no space).
 *
 * @param props - The text typed so far.
 */
export function TerminalInputView(props: TerminalInputViewProps): JSX.Element {
  return (
    <div className={styles.input}>
      <span className={styles.shellPrompt}>{TERMINAL_SHELL_PROMPT_TEXT}</span>
      <span>
        <span className={styles.text}>{props.typedText}</span>
        <BlockCursorView />
      </span>
    </div>
  );
}
