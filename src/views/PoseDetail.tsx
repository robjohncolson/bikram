import { useEffect } from 'react';
import type { CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import { chakraById, getNeighbors, getPose, muscleById } from '../data';
import type { MuscleId, Pose } from '../data';
import { BodyMap } from '../components/BodyMap';
import type { MuscleHighlight } from '../components/BodyMap';
import { PoseFigure } from '../components/PoseFigure';
import './PoseDetail.css';

/** Compact prev/next link shown above the header. */
function TopLink({ pose, dir }: { pose: Pose; dir: 'prev' | 'next' }) {
  return (
    <Link
      to={`/pose/${pose.id}`}
      className={`pd-toplink pd-toplink--${dir}`}
      aria-label={`${dir === 'prev' ? 'Previous' : 'Next'} posture: ${pose.englishName}`}
    >
      {dir === 'prev' && <span aria-hidden>←</span>}
      <span className="pd-toplink-text">
        <span className="pd-toplink-order">{pose.order}</span> {pose.englishName}
      </span>
      {dir === 'next' && <span aria-hidden>→</span>}
    </Link>
  );
}

/** Larger prev/next card shown at the bottom of the page. */
function NavCard({ pose, dir }: { pose: Pose; dir: 'prev' | 'next' }) {
  return (
    <Link
      to={`/pose/${pose.id}`}
      className={`card pd-navcard pd-navcard--${dir}`}
      aria-label={`${dir === 'prev' ? 'Previous' : 'Next'} posture: ${pose.englishName}`}
    >
      <PoseFigure pose={pose} size={54} />
      <span className="pd-navcard-text">
        <span className="pd-navcard-label">
          {dir === 'prev' ? '← Previous' : 'Next →'} · {pose.order} of 26
        </span>
        <span className="pd-navcard-name">{pose.englishName}</span>
      </span>
    </Link>
  );
}

export function PoseDetail() {
  const { id } = useParams();
  const pose = id ? getPose(id) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!pose) {
    return (
      <div className="page container pd-missing">
        <p className="eyebrow">26 &amp; 2</p>
        <h1>Posture not found</h1>
        <p className="text-soft pd-missing-copy">
          Nothing in the sequence lives at this address. The class runs from
          posture 1, Standing Deep Breathing, to posture 26, Blowing in Firm.
        </p>
        <Link to="/" className="pd-missing-link">
          ← Back to the sequence
        </Link>
      </div>
    );
  }

  const { prev, next } = getNeighbors(pose);

  // Body-map highlights: primary entries win over secondary on collision.
  const highlights: Partial<Record<MuscleId, MuscleHighlight>> = {};
  for (const m of pose.muscles) {
    if (m.emphasis === 'primary' && !(m.id in highlights)) highlights[m.id] = m.action;
  }
  for (const m of pose.muscles) {
    if (!(m.id in highlights)) highlights[m.id] = m.action;
  }

  const chakraLinks = pose.chakras
    .map((link) => {
      const chakra = chakraById.get(link.id);
      return chakra ? { link, chakra } : null;
    })
    .filter((c) => c !== null);

  const hasSetup = pose.setup.length > 0;
  const hasCues = pose.cues.length > 0;
  const hasBreath = Boolean(pose.breath);
  const hasBody = pose.muscles.length > 0;
  const hasEnergy = chakraLinks.length > 0;
  const hasLeft = hasSetup || hasCues || hasBreath;
  const hasRight = hasBody || hasEnergy;

  return (
    <div className="page pd" key={pose.id}>
      <div className="container">
        {(prev || next) && (
          <nav className="pd-topnav" aria-label="Sequence navigation">
            {prev && <TopLink pose={prev} dir="prev" />}
            {next && <TopLink pose={next} dir="next" />}
          </nav>
        )}

        <header className="pd-header">
          <div className="pd-header-copy">
            <p className="eyebrow">
              Posture {pose.order} of 26 · {pose.category}
            </p>
            <h1 className="pd-title">{pose.englishName}</h1>
            <p className="pd-sanskrit">
              {pose.sanskritName}
              {pose.pronunciation && (
                <span className="pd-pron"> · {pose.pronunciation}</span>
              )}
            </p>
            <div className="pd-pills">
              <span className="pill">
                {pose.sets} {pose.sets === 1 ? 'set' : 'sets'}
              </span>
              {pose.timing && <span className="pill">{pose.timing}</span>}
            </div>
          </div>
          <div className="pd-figurewrap" aria-hidden>
            <PoseFigure pose={pose} size={140} />
          </div>
        </header>

        {pose.summary && <p className="pd-summary">{pose.summary}</p>}

        {(hasLeft || hasRight) && (
          <div className={`pd-grid${hasLeft && hasRight ? '' : ' pd-grid--single'}`}>
            {hasLeft && (
              <div className="pd-col">
                {hasSetup && (
                  <section>
                    <h2 className="pd-h">Getting in</h2>
                    <ol className="pd-steps">
                      {pose.setup.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </section>
                )}

                {hasCues && (
                  <section>
                    <h2 className="pd-h">While you&rsquo;re there</h2>
                    <ul className="pd-cues">
                      {pose.cues.map((cue, i) => (
                        <li key={i}>{cue}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {hasBreath && (
                  <aside className="card pd-breath">
                    <svg
                      className="pd-breath-icon"
                      viewBox="0 0 48 22"
                      width="44"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      aria-hidden
                    >
                      <path d="M3 7c6-6 12-6 18 0s12 6 18 0" />
                      <path d="M3 15c6-6 12-6 18 0s12 6 18 0" opacity="0.45" />
                    </svg>
                    <div>
                      <h2 className="pd-h pd-breath-h">Breath</h2>
                      <p className="pd-breath-text">{pose.breath}</p>
                    </div>
                  </aside>
                )}
              </div>
            )}

            {hasRight && (
              <div className="pd-col">
                {hasBody && (
                  <section className="card pd-card">
                    <h2 className="pd-h">In the body</h2>
                    <div className="pd-bodymap">
                      <BodyMap view="both" height={260} highlights={highlights} />
                    </div>
                    <div className="pd-legend" aria-hidden>
                      <span className="pd-legend-item pd-action--strengthens">
                        <span className="pd-legend-dot" /> strengthens
                      </span>
                      <span className="pd-legend-item pd-action--stretches">
                        <span className="pd-legend-dot" /> stretches
                      </span>
                    </div>
                    <ul className="pd-muscles">
                      {pose.muscles.map((m, i) => (
                        <li key={`${m.id}-${i}`} className="pd-muscle">
                          <div className="pd-muscle-line">
                            <span className="pd-muscle-name">
                              {muscleById.get(m.id)?.name ?? m.id}
                            </span>
                            <span className={`pd-action pd-action--${m.action}`}>
                              {m.action}
                            </span>
                            {m.emphasis === 'primary' && (
                              <span className="pd-tag">primary</span>
                            )}
                          </div>
                          {m.note && <p className="pd-muscle-note">{m.note}</p>}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {hasEnergy && (
                  <section className="card pd-card">
                    <h2 className="pd-h">Energy</h2>
                    <ul className="pd-chakras">
                      {chakraLinks.map(({ link, chakra }) => (
                        <li
                          key={chakra.id}
                          className="pd-chakra"
                          style={{ '--chakra': chakra.color } as CSSProperties}
                        >
                          <span className="pd-chakra-dot" aria-hidden />
                          <div>
                            <p className="pd-chakra-name">
                              <strong>{chakra.englishName}</strong>
                              <span className="pd-chakra-meta">
                                {' '}
                                · {chakra.sanskritName} · No. {chakra.number}
                              </span>
                            </p>
                            <p className="pd-chakra-why">{link.why}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}
          </div>
        )}

        {(pose.benefits.length > 0 || pose.contraindications.length > 0) && (
          <div className="pd-pair">
            {pose.benefits.length > 0 && (
              <section className="card pd-card">
                <h2 className="pd-h">Benefits</h2>
                <ul className="pd-benefits">
                  {pose.benefits.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </section>
            )}
            {pose.contraindications.length > 0 && (
              <section className="card pd-card pd-care">
                <h2 className="pd-h">Take care</h2>
                <ul className="pd-cautions">
                  {pose.contraindications.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        {(pose.mnemonic || pose.sequenceNote) && (
          <div className="pd-pair">
            {pose.mnemonic && (
              <aside className="card pd-card pd-remember">
                <h2 className="pd-h">Remember it</h2>
                <p className="pd-quote">{pose.mnemonic}</p>
              </aside>
            )}
            {pose.sequenceNote && (
              <aside className="card pd-card">
                <h2 className="pd-h">Why here</h2>
                <p className="pd-whyhere">{pose.sequenceNote}</p>
              </aside>
            )}
          </div>
        )}

        {(prev || next) && (
          <nav className="pd-navcards" aria-label="Sequence navigation">
            {prev && <NavCard pose={prev} dir="prev" />}
            {next && <NavCard pose={next} dir="next" />}
          </nav>
        )}
      </div>
    </div>
  );
}
