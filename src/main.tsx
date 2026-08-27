import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { clipUrls } from './pacer';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

// Offline support: everything is self-contained, so once visited the
// whole app works without network (hot rooms have terrible reception).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
    // Hand the worker the studio-voice clip list so a class never has to
    // fetch a line mid-hold; it fills the voice cache in small batches.
    navigator.serviceWorker.ready
      .then((reg) => reg.active?.postMessage({ type: 'precache-voice', urls: clipUrls() }))
      .catch(() => {});
  });
}
