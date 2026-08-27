import type { TerminalCommandReferenceEntry } from './terminal_command_reference';

/**
 * One entry of the terminal's session log. "echo" is the typed command line
 * as it was entered; "output" is a resulting message (optionally an error,
 * shown in the brightest red); "table" is the HELP command's grid of
 * command/description pairs.
 */
export type TerminalLogEntry =
  | { readonly kind: 'echo'; readonly commandLine: string }
  | { readonly kind: 'output'; readonly text: string; readonly isError: boolean }
  | { readonly kind: 'table'; readonly rows: readonly TerminalCommandReferenceEntry[] };
