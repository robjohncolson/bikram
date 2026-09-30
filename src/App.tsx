import { Suspense, lazy, useEffect, useRef } from 'react';
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Timeline } from './views/Timeline';
import { PoseDetail } from './views/PoseDetail';
import { NotFound } from './views/NotFound';
import { Explorer } from './views/Explorer';
import { Trainer } from './views/Trainer';
import { KnowledgeMap } from './views/KnowledgeMap';
import { Pacer } from './views/Pacer';
import { Today } from './views/Today';
import { moreItems, navigationSection } from './navigation';
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

function PaceRedirect() {
  const { search, hash } = useLocation();
  return <Navigate replace to={{ pathname: '/', search, hash }} />;
}

export default function App() {
  const { pathname, search } = useLocation();
  const section = navigationSection(pathname);
  const more = useRef<HTMLDetailsElement>(null);
  useEffect(() => { if (more.current) more.current.open = false; }, [pathname]);
  return (
    <>
      <ScrollToTop />
      <header className="app-nav">
        <div className="container app-nav-inner">
          <NavLink to="/" className="app-brand">
            <span className="app-brand-mark">26&2</span>
            <span className="app-brand-name">the hot sequence</span>
          </NavLink>
          <nav className="app-links" aria-label="Main navigation">
            <NavLink to="/" end>Practice</NavLink>
            <NavLink to="/sequence" className={section === 'sequence' ? 'active' : ''}
              aria-current={section === 'sequence' ? 'page' : undefined}>Sequence</NavLink>
            <NavLink to="/library">Library</NavLink>
            <details className="app-more" ref={more} onKeyDown={(event) => {
              if (event.key === 'Escape' && more.current) {
                more.current.open = false;
                more.current.querySelector('summary')?.focus();
              }
            }}>
              <summary className={section === 'more' ? 'active' : ''}>More</summary>
              <div className="app-more-menu">
                {moreItems().map((item) => <NavLink key={item.to} to={item.to}
                  onClick={() => { if (more.current) more.current.open = false; }}>{item.label}</NavLink>)}
              </div>
            </details>
          </nav>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={<Pacer key={search} />} />
          <Route path="/sequence" element={<Timeline />} />
          <Route path="/pose/:id" element={<PoseDetail />} />
          <Route path="/explore" element={<Explorer />} />
          <Route path="/train" element={<Trainer />} />
          <Route path="/train/map" element={<KnowledgeMap />} />
          <Route path="/pace" element={<PaceRedirect />} />
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
