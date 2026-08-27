export type TerminalCommandName = 'JOIN' | 'START' | 'LEAVE' | 'KEYS' | 'CLEAR' | 'HELP';

export type TerminalCommandReferenceEntry = {
  readonly command: TerminalCommandName;
  readonly usage: string;
  readonly description: string;
};

export const TERMINAL_COMMAND_REFERENCE: readonly TerminalCommandReferenceEntry[] = [
  { command: 'JOIN', usage: 'JOIN <ROOM> <PLAYER>', description: 'ENTER A ROOM UNDER THAT PLAYER NAME' },
  { command: 'START', usage: 'START', description: 'START THE ROUND — HOST ONLY' },
  { command: 'LEAVE', usage: 'LEAVE', description: 'LEAVE THE CURRENT ROOM' },
  { command: 'KEYS', usage: 'KEYS', description: 'SHOW THE IN-GAME KEY MAP' },
  { command: 'CLEAR', usage: 'CLEAR', description: 'CLEAR THIS TERMINAL' },
  { command: 'HELP', usage: 'HELP', description: 'SHOW THIS LIST' },
];
