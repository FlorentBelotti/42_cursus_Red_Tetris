import type { TerminalCommandReferenceEntry } from './terminal_command_reference';

export type TerminalLogEntry =
  | { readonly kind: 'echo'; readonly commandLine: string }
  | { readonly kind: 'output'; readonly text: string; readonly isError: boolean }
  | { readonly kind: 'table'; readonly rows: readonly TerminalCommandReferenceEntry[] };
