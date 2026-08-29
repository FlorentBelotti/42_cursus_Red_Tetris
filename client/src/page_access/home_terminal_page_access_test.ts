import { describe, expect, it } from 'vitest';

import { resolveTerminalCommandOutcome } from './home_terminal_page_access';

describe('resolveTerminalCommandOutcome', () => {
  it('returns null for a blank line', () => {
    expect(resolveTerminalCommandOutcome('   ')).toBeNull();
  });

  it('navigates on a well-formed JOIN command', () => {
    const outcome = resolveTerminalCommandOutcome('join redroom pelican');

    expect(outcome).toEqual({ kind: 'navigate', room: 'redroom', playerName: 'pelican' });
  });

  it('reports an error when JOIN is missing arguments', () => {
    const outcome = resolveTerminalCommandOutcome('join redroom');

    expect(outcome?.kind).toBe('append');
  });

  it('clears on CLEAR', () => {
    expect(resolveTerminalCommandOutcome('clear')).toEqual({ kind: 'clear' });
  });

  it('shows help with the command table', () => {
    const outcome = resolveTerminalCommandOutcome('help');

    expect(outcome?.kind).toBe('append');
    if (outcome?.kind === 'append') {
      expect(outcome.entries.some((entry) => entry.kind === 'table')).toBe(true);
    }
  });

  it('reports an unknown command', () => {
    const outcome = resolveTerminalCommandOutcome('nonsense');

    expect(outcome?.kind).toBe('append');
    if (outcome?.kind === 'append') {
      expect(outcome.entries.some((entry) => entry.kind === 'output' && entry.isError)).toBe(true);
    }
  });
});
