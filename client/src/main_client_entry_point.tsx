import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ApplicationRouter } from './application_router';
import { store } from './state/redux_store_configuration';
import './styles/design_tokens.css';

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('Root element "#root" was not found in index.html');
}

createRoot(rootElement).render(
  <Provider store={store}>
    <BrowserRouter>
      <ApplicationRouter />
    </BrowserRouter>
  </Provider>,
);
