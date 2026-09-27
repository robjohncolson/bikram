import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { clipUrls } from './pacer';
import { motionUrls } from './data';
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
    // Hand the worker the studio-voice clip list (so a class never has to
    // fetch a line mid-hold) and the motion sprites (so posture pages
    // animate offline); it fills both caches in small batches. Sent to
    // whichever worker is active now AND again when an updated worker
    // takes control, since the old one may not know the new URLs.
    const precache = (target: ServiceWorker | null | undefined) =>
      target?.postMessage({ type: 'precache', urls: [...clipUrls(), ...motionUrls()] });
    navigator.serviceWorker.ready.then((reg) => precache(reg.active)).catch(() => {});
    navigator.serviceWorker.addEventListener('controllerchange', () =>
      precache(navigator.serviceWorker.controller),
    );
  });
}
