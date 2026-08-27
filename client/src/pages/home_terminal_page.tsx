import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApplicationShell } from '../components/layout/application_shell';
import { TerminalIntroView } from '../components/home/terminal_intro_view';
import { TerminalLogView } from '../components/home/terminal_log_view';
import { TerminalInputView } from '../components/home/terminal_input_view';
import { useKeyboardInputBindings, type KeyboardInputHandler } from '../hooks/use_keyboard_input_bindings';
import type { TerminalLogEntry } from '../mock_data/terminal_log_entry';
import {
  HOME_TERMINAL_PAGE_KEY_LEGEND,
  TERMINAL_LOG_LINE_CAP,
  resolveTerminalCommandOutcome,
} from '../page_access/home_terminal_page_access';
import styles from './home_terminal_page.module.css';

const TERMINAL_INPUT_CHARACTER_PATTERN = /^[a-z0-9_ -]$/i;

function appendToLog(
  currentEntries: readonly TerminalLogEntry[],
  newEntries: readonly TerminalLogEntry[],
): TerminalLogEntry[] {
  return currentEntries.concat(newEntries).slice(-TERMINAL_LOG_LINE_CAP);
}

export function HomeTerminalPage(): JSX.Element {
  const navigate = useNavigate();
  const [log, setLog] = useState<TerminalLogEntry[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const handleKeyDown: KeyboardInputHandler = useCallback(
    (event) => {
      if (event.key === 'Backspace') {
        setInputValue((currentValue) => currentValue.slice(0, -1));
        return true;
      }

      if (event.key === 'ArrowUp') {
        if (history.length === 0) {
          return true;
        }

        let nextIndex = history.length - 1;
        if (historyIndex !== null && historyIndex > 0) {
          nextIndex = historyIndex - 1;
        }

        setHistoryIndex(nextIndex);
        setInputValue(history[nextIndex] ?? '');
        return true;
      }

      if (event.key === 'ArrowDown') {
        if (historyIndex === null) {
          return true;
        }

        const nextIndex = historyIndex + 1;
        if (nextIndex >= history.length) {
          setHistoryIndex(null);
          setInputValue('');
        } else {
          setHistoryIndex(nextIndex);
          setInputValue(history[nextIndex] ?? '');
        }
        return true;
      }

      if (event.key === 'Enter') {
        const submittedLine = inputValue;
        setInputValue('');
        setHistoryIndex(null);

        const outcome = resolveTerminalCommandOutcome(submittedLine);
        if (outcome === null) {
          return true;
        }

        setHistory((currentHistory) => currentHistory.concat(submittedLine.trim()));

        if (outcome.kind === 'navigate') {
          navigate(`/${outcome.room}/${outcome.playerName}`);
          return true;
        }

        if (outcome.kind === 'clear') {
          setLog([]);
          return true;
        }

        setLog((currentLog) => appendToLog(currentLog, outcome.entries));
        return true;
      }

      if (event.key.length === 1 && TERMINAL_INPUT_CHARACTER_PATTERN.test(event.key)) {
        setInputValue((currentValue) => currentValue + event.key.toUpperCase());
        return true;
      }

      return false;
    },
    [inputValue, history, historyIndex, navigate],
  );

  useKeyboardInputBindings(handleKeyDown);

  return (
    <ApplicationShell room="---" playerName="GUEST" socketStatus="IDLE" legend={HOME_TERMINAL_PAGE_KEY_LEGEND}>
      <div className={styles.terminal}>
        <TerminalIntroView />
        <TerminalLogView entries={log} />
        <TerminalInputView typedText={inputValue} />
      </div>
    </ApplicationShell>
  );
}
