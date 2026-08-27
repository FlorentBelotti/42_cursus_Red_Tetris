import { Fragment } from 'react';
import type { TerminalLogEntry } from '../../mock_data/terminal_log_entry';
import { TERMINAL_SHELL_PROMPT_TEXT } from '../../mock_data/terminal_shell_prompt';
import styles from './terminal_log_view.module.css';

export type TerminalLogViewProps = {
  readonly entries: readonly TerminalLogEntry[];
};

/**
 * Renders one log entry: an echoed command line, a plain or error output
 * line, or the HELP command's table.
 *
 * @param entry - The log entry to render.
 * @returns The rendered entry.
 */
function renderLogEntry(entry: TerminalLogEntry): JSX.Element {
  if (entry.kind === 'echo') {
    return (
      <div className={styles.echo}>
        <span className={styles.shellPrompt}>{TERMINAL_SHELL_PROMPT_TEXT}</span>
        <span className={styles.echoCommand}>{entry.commandLine}</span>
      </div>
    );
  }

  if (entry.kind === 'output') {
    let className = styles.output;
    if (entry.isError) {
      className = `${styles.output} ${styles.outputError}`;
    }

    return <div className={className}>{entry.text}</div>;
  }

  return (
    <div className={styles.table}>
      {entry.rows.map((row) => (
        <Fragment key={row.command}>
          <span className={styles.tableCommand}>{row.usage}</span>
          <span className={styles.tableDescription}>{row.description}</span>
        </Fragment>
      ))}
    </div>
  );
}

/**
 * The Home terminal's session log: every command typed so far, echoed and
 * followed by its output. Never scrolls — the caller keeps only the last
 * TERMINAL_LOG_LINE_CAP entries in state.
 *
 * @param props - The log entries to render, oldest first.
 */
export function TerminalLogView(props: TerminalLogViewProps): JSX.Element {
  return (
    <div className={styles.log}>
      {props.entries.map((entry, entryIndex) => (
        <div key={entryIndex}>{renderLogEntry(entry)}</div>
      ))}
    </div>
  );
}
