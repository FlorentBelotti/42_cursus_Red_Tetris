/**
 * SPA bootstrap: mounts the React tree onto the #root element declared in
 * index.html, wrapped in the BrowserRouter that resolves C6 join URLs.
 */
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ApplicationRouter } from './application_router';
import './styles/design_tokens.css';

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('Root element "#root" was not found in index.html');
}

createRoot(rootElement).render(
  <BrowserRouter>
    <ApplicationRouter />
  </BrowserRouter>,
);
