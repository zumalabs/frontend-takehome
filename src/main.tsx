import { createRoot } from 'react-dom/client';
import App from './App';
import { RendererErrorBoundary } from './components/RendererErrorBoundary';
import {
  installDesktopBridgeMock,
  installEnvironmentSelector,
} from './lib/desktopBridgeMock';
import './styles.css';

installEnvironmentSelector();
installDesktopBridgeMock();

createRoot(document.getElementById('root')!).render(
  <RendererErrorBoundary>
    <App />
  </RendererErrorBoundary>,
);
