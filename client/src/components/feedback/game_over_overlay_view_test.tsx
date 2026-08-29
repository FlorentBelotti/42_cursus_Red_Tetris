import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { GameOverOverlayView } from './game_over_overlay_view';

describe('GameOverOverlayView', () => {
  it('renders the title, subtitle and restart prompt', () => {
    const { container } = render(
      <GameOverOverlayView
        title="WINNER"
        subtitle="LAST FIELD STANDING : ALPHA"
        restartPromptText="> PRESS [ENTER] TO RESTART"
        restartPromptState="active"
      />,
    );

    expect(container.textContent).toContain('WINNER');
    expect(container.textContent).toContain('LAST FIELD STANDING : ALPHA');
    expect(container.textContent).toContain('> PRESS [ENTER] TO RESTART');
    expect(container.textContent).toContain('BACK TO LOBBY');
  });
});
