/**
 * SPA bootstrap: mounts the React tree onto the #root element declared in
 * index.html. Renders a placeholder heading only, to prove the build/dev
 * toolchain works end to end before any routing, state, or game UI exists.
 */
import { createRoot } from 'react-dom/client';

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('Root element "#root" was not found in index.html');
}

createRoot(rootElement).render(<h1>Red Tetris</h1>);
