import { Suspense, lazy, useEffect } from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Timeline } from './views/Timeline';
import { PoseDetail } from './views/PoseDetail';
import { Explorer } from './views/Explorer';
import { Trainer } from './views/Trainer';
import { KnowledgeMap } from './views/KnowledgeMap';
import { Pacer } from './views/Pacer';
import { Today } from './views/Today';
import './App.css';

// the posture library is a second collection: its pages (and the book
// indexes they read) load only when visited
const Library = lazy(() => import('./views/Library').then((m) => ({ default: m.Library })));
const LibraryPose = lazy(() => import('./views/LibraryPose').then((m) => ({ default: m.LibraryPose })));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <header className="app-nav">
        <div className="container app-nav-inner">
          <NavLink to="/" className="app-brand">
            <span className="app-brand-mark">26&2</span>
            <span className="app-brand-name">the hot sequence</span>
          </NavLink>
          <nav className="app-links">
            <NavLink to="/" end>Sequence</NavLink>
            <NavLink to="/explore">Explore</NavLink>
            <NavLink to="/train">Train</NavLink>
            <NavLink to="/pace">Pace</NavLink>
          </nav>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Timeline />} />
          <Route path="/pose/:id" element={<PoseDetail />} />
          <Route path="/explore" element={<Explorer />} />
          <Route path="/train" element={<Trainer />} />
          <Route path="/train/map" element={<KnowledgeMap />} />
          <Route path="/pace" element={<Pacer />} />
          <Route path="/today" element={<Today />} />
          <Route
            path="/library"
            element={
              <Suspense fallback={null}>
                <Library />
              </Suspense>
            }
          />
          <Route
            path="/library/:id"
            element={
              <Suspense fallback={null}>
                <LibraryPose />
              </Suspense>
            }
          />
        </Routes>
      </main>
    </>
  );
}
