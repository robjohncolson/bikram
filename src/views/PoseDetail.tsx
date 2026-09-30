import { useEffect, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { applyFigureFlag, chakraById, getNeighbors, getPose, muscleById, poses } from '../data';
import { NotFound } from './NotFound';
import { band, loadStore, nodeP } from '../trainer';
import type { ClassicalNote, MuscleId, Pose } from '../data';
import { BodyMap } from '../components/BodyMap';
import type { MuscleHighlight } from '../components/BodyMap';
import { PoseFigure } from '../components/PoseFigure';
import { PoseMotion } from '../components/PoseMotion';
import { useRestingBreath } from '../components/useRestingBreath';
import { STUDY } from '../features';
import './PoseDetail.css';

/** Compact prev/next link shown above the header. */
function TopLink({ pose, dir }: { pose: Pose; dir: 'prev' | 'next' }) {
  return (
    <Link
      to={`/pose/${pose.id}`}
      className={`pd-toplink pd-toplink--${dir}`}
      aria-label={`${dir === 'prev' ? 'Previous' : 'Next'} ${pose.category === 'breathing' ? 'item' : 'posture'}: ${pose.englishName}`}
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
      aria-label={`${dir === 'prev' ? 'Previous' : 'Next'} ${pose.category === 'breathing' ? 'item' : 'posture'}: ${pose.englishName}`}
    >
      <PoseFigure pose={pose} size={54} />
      <span className="pd-navcard-text">
        <span className="pd-navcard-label">
          {dir === 'prev' ? '← Previous' : 'Next →'} · {pose.order} of {poses.length}
        </span>
        <span className="pd-navcard-name">{pose.englishName}</span>
      </span>
    </Link>
  );
}

const BAND_WORD = { unseen: 'not yet practiced', shaky: 'shaky', developing: 'developing', solid: 'solid' } as const;

/**
 * Where this posture stands in memory, and the two doors out of the page
 * into practice: a focused drill and a class started from here.
 */
function PracticeRow({ pose, next }: { pose: Pose; next?: Pose }) {
  const bands = useMemo(() => {
    if (!STUDY) return null;
    const now = Date.now();
    const store = loadStore(now);
    return {
      identity: band(nodeP(store, `id:${pose.id}`, now)),
      handoff: next ? band(nodeP(store, `tr:${pose.order}`, now)) : null,
    };
  }, [pose, next]);
  return (
    <div className="pd-practice" aria-label="Practice">
      {bands && <span className="pill" data-band={bands.identity}>
        memory · {BAND_WORD[bands.identity]}
      </span>}
      {bands?.handoff && (
        <span className="pill" data-band={bands.handoff}>
          hand-off · {BAND_WORD[bands.handoff]}
        </span>
      )}
      <span className="pd-practice-links">
        {STUDY && <Link className="pd-practice-link" to={`/train?drill=id:${pose.id}`}>
          Drill this posture →
        </Link>}
        {STUDY && next && (
          <Link className="pd-practice-link" to={`/train?drill=tr:${pose.order}`}>
            Drill the hand-off →
          </Link>
        )}
        <Link className="pd-practice-link" to={`/?from=${pose.order}`}>
          Practise from here →
        </Link>
      </span>
    </div>
  );
}

/**
 * "Go deeper": the posture read against the classical repertoire as
 * Iyengar documents it — our own words, his plate numbers.
 */
function ClassicalSection({ note, pose }: { note: ClassicalNote; pose: Pose }) {
  const baseName = (name: string) =>
    name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+[ivx]+$/i, '')
      .replace(/[^a-z]/gi, '')
      .toLowerCase();
  const sameName = note.asana !== null && baseName(note.asana) === baseName(pose.sanskritName);
  const plateCount = note.reference?.plates.match(/\d+[a-z]?/gi)?.length ?? 0;
  return (
    <details className="card pd-card pd-classical" aria-labelledby="pd-classical-h">
      <summary id="pd-classical-h">Go deeper — the classical form</summary>
      <div className="pd-classical-head">
        <p className="pd-classical-lede text-soft">
          The same shape as the classical repertoire describes it — read against B.K.S. Iyengar&rsquo;s{' '}
          <em>Light on Yoga</em>, in our own words, with his plate numbers so you can open your copy.
        </p>
      </div>

      <div className="pd-classical-grid">
        <div className="pd-classical-col">
          <h3 className="pd-h3">
            {note.asana === null ? 'No classical entry' : sameName ? 'The classical name' : 'Classical counterpart'}
          </h3>
          {note.asana !== null && (
            <p className="pd-classical-asana">
              <strong>{note.asana}</strong>
              {note.asanaEnglish && <span className="text-soft"> · {note.asanaEnglish}</span>}
            </p>
          )}
          {note.reference && (
            <p className="pd-classical-ref">
              <span className="pill">
                Light on Yoga · {plateCount === 1 ? 'plate' : 'plates'} {note.reference.plates}
              </span>
              {note.reference.difficulty !== undefined && (
                <span className="pill" title="Iyengar grades every asana from 1 (easiest) to 60">
                  grade {note.reference.difficulty} of 60
                </span>
              )}
            </p>
          )}
          <p className="pd-classical-etym">{note.etymology}</p>

          <h3 className="pd-h3">Where 26 &amp; 2 differs</h3>
          <p className="pd-classical-contrast">{note.contrast}</p>
        </div>

        <div className="pd-classical-col">
          {note.refinements.length > 0 && (
            <>
              <h3 className="pd-h3">Refinements that transfer</h3>
              <ul className="pd-cues pd-classical-list">
                {note.refinements.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </>
          )}
          {note.stages.length > 0 && (
            <>
              <h3 className="pd-h3">If the full form isn&rsquo;t there yet</h3>
              <ol className="pd-steps pd-classical-list">
                {note.stages.map((st, i) => (
                  <li key={i}>{st}</li>
                ))}
              </ol>
            </>
          )}
          {(note.ladder.before.length > 0 || note.ladder.beyond.length > 0) && (
            <div className="pd-ladder">
              {note.ladder.before.length > 0 && (
                <div>
                  <h3 className="pd-h3">Prepares from</h3>
                  <ul className="pd-ladder-chips">
                    {note.ladder.before.map((n) => (
                      <li key={n} className="pill">
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {note.ladder.beyond.length > 0 && (
                <div>
                  <h3 className="pd-h3">Leads toward</h3>
                  <ul className="pd-ladder-chips">
                    {note.ladder.beyond.map((n) => (
                      <li key={n} className="pill">
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <p className="pd-classical-foot text-faint">
        Iyengar and 26 &amp; 2 are different lineages that sometimes disagree; nothing here corrects
        the class. Traditional effects are described as tradition, not as medical fact.
      </p>
    </details>
  );
}

/** One live demonstration; PoseMotion owns loading and unavailable fallbacks. */
function HeroMotion({ motion }: { motion: NonNullable<Pose['motion']> }) {
  const breath = useRestingBreath(6);
  return <PoseMotion motion={motion} size={240} frameClassName="pd-figurewrap" breath={breath} renderer="rig" />;
}

export function PoseDetail() {
  const { id } = useParams();
  const { search } = useLocation();
  useEffect(() => { applyFigureFlag(search); }, [search]);
  const pose = id ? getPose(id) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!pose) return <NotFound />;

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
              {pose.category === 'breathing' ? 'Item' : 'Posture'} {pose.order} of {poses.length} · {pose.category}
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

        </header>

        {pose.summary && <p className="pd-summary">{pose.summary}</p>}

        <PracticeRow pose={pose} next={next} />

        <div className="pd-main">
          <div className="pd-main-figure">
            {pose.motion ? (
              <HeroMotion motion={pose.motion} />
            ) : (
              <div className="pd-figurewrap" aria-hidden>
                <PoseFigure pose={pose} size={140} />
              </div>
            )}
          </div>
          {hasSetup && (
            <section>
              <h2 className="pd-h">How to</h2>
              <ol className="pd-steps">
                {pose.setup.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </section>
          )}
        </div>

        <section className="pd-inclass pd-col" aria-labelledby="pd-inclass-h">
          <h2 className="pd-h" id="pd-inclass-h">In class</h2>
          {pose.segments && pose.segments.length > 0 && (
            <ol className="pd-segments">
              {pose.segments.map((segment, i) => <li key={i}>{segment.label}</li>)}
            </ol>
          )}

          {hasCues && (
            <section>
              <h3 className="pd-h">While you&rsquo;re there</h3>
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
                <h3 className="pd-h pd-breath-h">Breath</h3>
                <p className="pd-breath-text">{pose.breath}</p>
              </div>
            </aside>
          )}

          {(pose.mnemonic || pose.sequenceNote) && (
            <div className="pd-pair">
              {pose.mnemonic && (
                <aside className="card pd-card pd-remember">
                  <h3 className="pd-h">Remember it</h3>
                  <p className="pd-quote">{pose.mnemonic}</p>
                </aside>
              )}
              {pose.sequenceNote && (
                <aside className="card pd-card">
                  <h3 className="pd-h">Why here</h3>
                  <p className="pd-whyhere">{pose.sequenceNote}</p>
                </aside>
              )}
            </div>
          )}
        </section>
        <div className="pd-sections">
          {(hasBody || pose.benefits.length > 0) && (
            <section className="card pd-card">
              <h2 className="pd-h">Your body</h2>
              {hasBody && (
                <>
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
                </>
              )}
              {pose.benefits.length > 0 && (
                <div className="pd-body-benefits">
                  <h3 className="pd-h3">Benefits</h3>
                  <ul className="pd-benefits">
                    {pose.benefits.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {hasEnergy && (
            <section className="card pd-card">
              <h2 className="pd-h">Chakras</h2>
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
          {pose.contraindications.length > 0 && (
            <section className="card pd-card pd-care">
              <h2 className="pd-h">Cautions</h2>
              <ul className="pd-cautions">
                {pose.contraindications.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {pose.classical && <ClassicalSection note={pose.classical} pose={pose} />}

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
