import { HOME_TERMINAL_KEY_LEGEND, type KeyLegendEntry } from '../mock_data/key_legend_per_page';
import { TERMINAL_COMMAND_REFERENCE } from '../mock_data/terminal_command_reference';
import type { TerminalLogEntry } from '../mock_data/terminal_log_entry';

/**
 * Session log is never scrolled — only the last N entries are kept. Part of
 * the terminal's config per PROMPT.md rule 3 ("the terminal log line cap").
 */
export const TERMINAL_LOG_LINE_CAP = 8;

/**
 * The key legend shown at the bottom of the Home terminal screen.
 */
export const HOME_TERMINAL_PAGE_KEY_LEGEND: readonly KeyLegendEntry[] = HOME_TERMINAL_KEY_LEGEND;

export type TerminalCommandOutcome =
  | { readonly kind: 'navigate'; readonly room: string; readonly playerName: string }
  | { readonly kind: 'clear' }
  | { readonly kind: 'append'; readonly entries: readonly TerminalLogEntry[] };

/**
 * Splits a typed command line into its command token and arguments.
 *
 * @param rawInputLine - The raw text typed at the terminal prompt.
 * @returns The uppercased command token and its arguments, or null if the
 * line is empty or whitespace only.
 */
function tokenizeCommandLine(rawInputLine: string): { commandToken: string; args: readonly string[] } | null {
  const tokens = rawInputLine.trim().split(/\s+/).filter((token) => token.length > 0);

  if (tokens.length === 0) {
    return null;
  }

  const [commandToken, ...args] = tokens;

  return { commandToken: (commandToken ?? '').toUpperCase(), args };
}

/**
 * Builds the echo entry for a submitted command line.
 *
 * @param rawInputLine - The raw text typed at the terminal prompt.
 * @returns The echo log entry.
 */
function buildEchoEntry(rawInputLine: string): TerminalLogEntry {
  return { kind: 'echo', commandLine: rawInputLine.trim() };
}

/**
 * Resolves what a submitted terminal command line should do: navigate to a
 * room, clear the log, or append log entries. Only JOIN and HELP are fully
 * wired (per PROMPT.md scope); START/LEAVE/KEYS are recognised but have no
 * room state to act on yet.
 *
 * @param rawInputLine - The raw text typed at the terminal prompt.
 * @returns The outcome to apply, or null for an empty line (a no-op).
 */
export function resolveTerminalCommandOutcome(rawInputLine: string): TerminalCommandOutcome | null {
  const tokenized = tokenizeCommandLine(rawInputLine);

  if (tokenized === null) {
    return null;
  }

  const { commandToken, args } = tokenized;
  const echoEntry = buildEchoEntry(rawInputLine);

  if (commandToken === 'JOIN') {
    if (args.length === 2) {
      const [room, playerName] = args;
      return { kind: 'navigate', room: room ?? '', playerName: playerName ?? '' };
    }

    return {
      kind: 'append',
      entries: [echoEntry, { kind: 'output', text: 'JOIN REQUIRES A ROOM AND A PLAYER NAME.', isError: true }],
    };
  }

  if (commandToken === 'HELP') {
    return {
      kind: 'append',
      entries: [
        echoEntry,
        { kind: 'output', text: 'AVAILABLE COMMANDS', isError: false },
        { kind: 'table', rows: TERMINAL_COMMAND_REFERENCE },
        {
          kind: 'output',
          text: 'IN-GAME KEYS ARE NOT COMMANDS : ARROWS MOVE, SPACE HARD DROPS.',
          isError: false,
        },
      ],
    };
  }

  if (commandToken === 'CLEAR') {
    return { kind: 'clear' };
  }

  if (commandToken === 'START' || commandToken === 'LEAVE' || commandToken === 'KEYS') {
    return {
      kind: 'append',
      entries: [echoEntry, { kind: 'output', text: 'NO ROOM JOINED.', isError: false }],
    };
  }

  return {
    kind: 'append',
    entries: [echoEntry, { kind: 'output', text: `UNKNOWN COMMAND : ${commandToken}. TYPE HELP.`, isError: true }],
  };
}
