import { Link } from 'react-router-dom';
import { libraryFamilies } from '../data/library';
import './Library.css';

/**
 * The posture library: the wider classical repertoire, family by family.
 * Text cards only — no figures here (a live WebGL context per card is too
 * many); each posture's own page draws it. A short family index at the top
 * links to the section headings.
 */
export function Library() {
  return (
    <div className="page lib">
      <header className="container lib-hero">
        <p className="eyebrow">Beyond the sequence</p>
        <h1 className="lib-title">The posture library</h1>
        <p className="lib-lede text-soft">
          Postures from the wider classical repertoire, each drawn by the live figure and set beside our own
          instructions, the cautions that matter, and the principles the tradition brings to them. A separate
          collection: none of it is part of the 26&nbsp;&amp;&nbsp;2 class.
        </p>
      </header>
      {/* 56 cards run long on a phone: the families as in-page links to their headings */}
      <nav className="container lib-index" aria-label="Families">
        <ul className="lib-index-list">
          {libraryFamilies.map((f) => (
            <li key={f.id}>
              <a href={`#lib-${f.id}`} className="lib-index-link">
                {f.title}
                <span className="lib-index-count" aria-label={`${f.asanas.length} postures`}>
                  {f.asanas.length}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {libraryFamilies.map((f) => (
        <section key={f.id} className="container lib-family" aria-labelledby={`lib-${f.id}`}>
          <h2 id={`lib-${f.id}`} className="lib-family-title">
            {f.title}
          </h2>
          <p className="lib-family-blurb text-soft">{f.blurb}</p>
          <ul className="lib-grid">
            {f.asanas.map((a) => (
              <li key={a.id}>
                <Link to={`/library/${a.id}`} className="card lib-card">
                  <span className="lib-card-sanskrit">{a.sanskrit}</span>
                  <span className="lib-card-english">{a.english}</span>
                  {a.grade !== undefined && (
                    <span className="pill lib-card-grade" title="The book’s difficulty grade">
                      Grade {a.grade}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
