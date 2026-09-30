import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LiveFigure } from '../components/LiveFigure';
import { useReducedMotion } from '../components/figurePrefs';
import { useSheetPlayer } from '../components/useSheetPlayer';
import type { RigData } from '../data';
import { loadRigData, rigDataIfLoaded } from '../data';
import { getLibraryAsana, libraryRigId, noticeLabel, resolveLink, sourceLine, sutraInfo } from '../data/library';
import type { LibraryEntry } from '../data/library';
import './LibraryPose.css';

/** The figure's size: as large as reads well, never wider than a phone allows. */
const fitSize = (max: number) => (typeof window === 'undefined' ? max : Math.max(200, Math.min(max, window.innerWidth - 72)));

function useFigureSize(max = 300): number {
  const [size, setSize] = useState(() => fitSize(max));
  useEffect(() => {
    const onResize = () => setSize(fitSize(max));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [max]);
  return size;
}

/** A library posture's rig sheet, loaded lazily (its own chunk); undefined until it arrives. */
function useLibrarySheet(id: string): { sheet?: RigData; failed: boolean } {
  const rigId = libraryRigId(id);
  const [state, setState] = useState<{ id: string; sheet?: RigData; failed: boolean }>(() => ({
    id: rigId,
    sheet: rigDataIfLoaded(rigId),
    failed: false,
  }));
  useEffect(() => {
    if (rigDataIfLoaded(rigId)) return;
    let alive = true;
    loadRigData(rigId).then(
      (sheet) => alive && setState({ id: rigId, sheet, failed: false }),
      () => alive && setState({ id: rigId, failed: true }),
    );
    return () => {
      alive = false;
    };
  }, [rigId]);
  const cached = rigDataIfLoaded(rigId);
  if (cached) return { sheet: cached, failed: false };
  return state.id === rigId ? { sheet: state.sheet, failed: state.failed } : { failed: false };
}

function LinkRow({ title, ids }: { title: string; ids?: string[] }) {
  const links = (ids ?? []).map(resolveLink).filter((l) => l !== undefined);
  if (!links.length) return null;
  return (
    <div className="lp-linkrow">
      <h3 className="lp-linkrow-title">{title}</h3>
      <ul className="lp-linkrow-list">
        {links.map((l) => (
          <li key={l.id}>
            <Link to={l.to} className="pill lp-link" data-kind={l.kind}>
              {l.label}
              {l.kind === 'sequence' && <span className="lp-link-tag">26&amp;2</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Posture({ a }: { a: LibraryEntry }) {
  const { sheet, failed } = useLibrarySheet(a.id);
  const reduced = useReducedMotion();
  const player = useSheetPlayer(sheet, { reduced });
  const [unavailable, setUnavailable] = useState(false);
  const size = useFigureSize();
  // no figure (no WebGL, or the sheet would not load): no clock, no highlight
  const figureOff = unavailable || failed;
  const { setPlaying } = player;
  useEffect(() => {
    if (figureOff) setPlaying(false);
  }, [figureOff, setPlaying]);
  const stage = figureOff ? undefined : sheet?.stages[player.current];
  const notice = stage?.notice ?? [];

  return (
    <div className="page lp">
      <div className="container">
        <nav className="lp-crumbs" aria-label="Breadcrumb">
          <Link to="/library">← The posture library</Link>
        </nav>

        <header className="lp-head">
          <p className="eyebrow">Inversion · the library</p>
          <h1 className="lp-title">{a.english}</h1>
          <p className="lp-sanskrit">{a.sanskrit}</p>
          {a.grade !== undefined && (
            <span className="pill lp-grade" title="The book’s difficulty grade">
              Grade {a.grade}
            </span>
          )}
        </header>

        <div className="lp-main">
          <div className="lp-figure">
            {figureOff ? (
              <p className="lp-nofigure text-soft" role="status">
                {failed
                  ? 'The figure couldn’t load — the steps below still describe every stage.'
                  : 'The live figure can’t be drawn in this browser (it needs WebGL) — the steps below still describe every stage.'}
              </p>
            ) : sheet ? (
              <LiveFigure
                sheet={sheet}
                player={player}
                size={size}
                frameClassName="lp-disc"
                onUnavailable={() => setUnavailable(true)}
              />
            ) : (
              <div className="lp-disc lp-disc--empty" style={{ width: size, height: size }} aria-hidden />
            )}
            {notice.length > 0 && (
              <p className="lp-notice" aria-live="polite">
                <span className="lp-notice-label">Notice:</span>{' '}
                {notice.map((r, i) => (
                  <span key={r}>
                    {i > 0 && <span className="lp-notice-sep"> · </span>}
                    <span className="lp-notice-chip">{noticeLabel(r)}</span>
                  </span>
                ))}
              </p>
            )}
          </div>

          <section className="lp-steps" aria-labelledby="lp-steps-h">
            <h2 id="lp-steps-h" className="lp-h">
              How to
            </h2>
            <ol className="lp-steplist">
              {a.steps.map((s, i) => {
                const on = !figureOff && sheet !== undefined && s.stage === player.current;
                return (
                  <li key={i} className={'lp-step' + (on ? ' is-current' : '')} aria-current={on ? 'step' : undefined}>
                    {s.stage !== undefined && sheet && !figureOff ? (
                      <button type="button" className="lp-step-btn" onClick={() => player.seek(s.stage!)}>
                        <span className="lp-step-n">{i + 1}</span>
                        <span className="lp-step-text">{s.text}</span>
                      </button>
                    ) : (
                      <span className="lp-step-btn">
                        <span className="lp-step-n">{i + 1}</span>
                        <span className="lp-step-text">{s.text}</span>
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
            <p className="lp-hold">
              <span className="lp-hold-label">Hold</span> {a.hold}
            </p>
          </section>
        </div>

        <section className="card lp-cautions" aria-labelledby="lp-cautions-h">
          <h2 id="lp-cautions-h" className="lp-h">
            What the lineage asks
          </h2>
          <p className="lp-cautions-intro text-soft">
            As B.K.S. Iyengar teaches it in <cite>The Illustrated Light on Yoga</cite> — in our words, with the page.
          </p>
          <ul className="lp-cautionlist">
            {a.cautions.map((c) => (
              <li key={c.text}>
                {c.text} <span className="lp-cite text-faint">(p.&nbsp;{c.page})</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card lp-tradition" aria-labelledby="lp-tradition-h">
          <h2 id="lp-tradition-h" className="lp-h">
            The tradition
          </h2>
          <p className="lp-tradition-intro text-soft">
            Patanjali names no posture and gives no technique; what he says of posture as such is below. He places
            breath practice after posture is established.
          </p>
          <ul className="lp-sutras">
            {a.sutras.map((s) => {
              const info = sutraInfo(s.id);
              return (
                <li key={s.id} className="lp-sutra">
                  <p className="lp-sutra-head">
                    <span className="lp-sutra-id">{s.id}</span>
                    {info && <span className="lp-sutra-sk">{info.sanskrit}</span>}
                  </p>
                  {info && <p className="lp-sutra-topic">{info.topic}</p>}
                  <p className="lp-sutra-note text-soft">{s.note}</p>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="lp-links" aria-label="Related postures">
          <LinkRow title="Leads in" ids={a.prepares} />
          <LinkRow title="Afterwards" ids={a.counter} />
          <LinkRow title="The same action in the 26 & 2" ids={a.related} />
        </section>

        <p className="lp-source text-faint">{sourceLine(a)}</p>
      </div>
    </div>
  );
}

/** `/library/:id` — one library posture, taught with the live figure. */
export function LibraryPose() {
  const { id = '' } = useParams();
  const a = getLibraryAsana(id);
  if (!a) {
    return (
      <div className="page container lp-missing">
        <h1>Not in the library</h1>
        <p className="text-soft">There is no library posture called “{id}”.</p>
        <Link to="/library">← The posture library</Link>
      </div>
    );
  }
  // a fresh page (and player) per posture
  return <Posture key={a.id} a={a} />;
}
