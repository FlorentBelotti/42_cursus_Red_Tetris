import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { JoinRejectedView } from './join_rejected_view';

describe('JoinRejectedView', () => {
  it('renders the reason and explanation', () => {
    const { container } = render(
      <JoinRejectedView displayCode="GAME ALREADY STARTED" explanation="WAIT FOR THE NEXT ONE." />,
    );

    expect(container.textContent).toContain('JOIN REJECTED');
    expect(container.textContent).toContain('GAME ALREADY STARTED');
    expect(container.textContent).toContain('WAIT FOR THE NEXT ONE.');
  });
});
