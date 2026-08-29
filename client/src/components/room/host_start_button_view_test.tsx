import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { HostStartButtonView } from './host_start_button_view';

describe('HostStartButtonView', () => {
  it('shows a cursor when active', () => {
    const { container } = render(<HostStartButtonView text="> PRESS [ENTER]" state="active" />);
    expect(container.textContent).toContain('█');
  });

  it('shows no cursor when muted', () => {
    const { container } = render(<HostStartButtonView text="> WAITING" state="muted" />);
    expect(container.textContent).not.toContain('█');
  });
});
