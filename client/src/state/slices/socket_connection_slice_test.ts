import { describe, expect, it } from 'vitest';

import { socketConnectionActions, socketConnectionReducer } from './socket_connection_slice';

describe('socketConnectionReducer', () => {
  it('starts connecting', () => {
    const state = socketConnectionReducer(undefined, { type: '@@INIT' });
    expect(state.status).toBe('connecting');
  });

  it('moves to connected', () => {
    const state = socketConnectionReducer(undefined, socketConnectionActions.connected());
    expect(state.status).toBe('connected');
  });

  it('moves to link_lost on disconnect', () => {
    const state = socketConnectionReducer(undefined, socketConnectionActions.disconnected());
    expect(state.status).toBe('link_lost');
  });

  it('moves to link_lost on connection error', () => {
    const state = socketConnectionReducer(undefined, socketConnectionActions.connectionErrored());
    expect(state.status).toBe('link_lost');
  });
});
