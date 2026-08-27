import { BlockCursorView } from '../ui/block_cursor_view';
import { TERMINAL_SHELL_PROMPT_TEXT } from '../../mock_data/terminal_shell_prompt';
import styles from './terminal_input_view.module.css';

export type TerminalInputViewProps = {
  readonly typedText: string;
};

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
