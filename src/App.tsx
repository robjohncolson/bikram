import { useEffect } from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Timeline } from './views/Timeline';
import { PoseDetail } from './views/PoseDetail';
import { Explorer } from './views/Explorer';
import { Trainer } from './views/Trainer';
import { KnowledgeMap } from './views/KnowledgeMap';
import { Pacer } from './views/Pacer';
import './App.css';

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
        </Routes>
      </main>
    </>
  );
}
