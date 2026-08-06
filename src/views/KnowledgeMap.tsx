import { useMemo, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { ARCS, band, kcNodes, loadStore, nodeP } from '../trainer';
import type { KcId, KcNode } from '../trainer';
import { getPose } from '../data';
import { PoseFigure } from '../components/PoseFigure';
import './KnowledgeMap.css';

/* ————————————————————————————————————————————— static layout
   One wide viewBox, four horizontal layers, subway-map feel:
   root on top, arc bands, transition diamonds, identity circles. */

type Band = ReturnType<typeof band>;

const W = 1000;
const H = 404;
const X0 = 26;
const STEP = (W - 2 * X0) / 25;
const xOf = (order: number) => X0 + (order - 1) * STEP;

const ID_Y = 340; // identity circle centers
const ID_R = 11.5;
const TR_Y = 268; // transition diamond centers
const TR_S = 8;
const ARC_Y = 176; // arc rect top
const ARC_H = 26;
const ZONE_TOP = 234; // faint membership band behind leaves
const ZONE_BOT = 384;
const ROOT_W = 244;
const ROOT_H = 46;
const ROOT_Y = 22;

const idSpots = [...kcNodes.values()]
  .filter((n) => n.kind === 'identity')
  .sort((a, b) => a.order - b.order)
  .map((n) => ({ node: n, x: xOf(n.order) }));

const trSpots = [...kcNodes.values()]
  .filter((n) => n.kind === 'transition')
  .sort((a, b) => a.order - b.order)
  .map((n) => ({ node: n, x: (xOf(n.order) + xOf(n.order + 1)) / 2 }));

const arcSpots = ARCS.map((arc) => {
  const node = kcNodes.get(`arc:${arc.key}`);
  const left = xOf(arc.from) - 17;
  const right = xOf(arc.to) + 17;
  const cx = (left + right) / 2;
  const narrow = right - left < 120;
  return {
    node: node as KcNode,
    arc,
    left,
    right,
    cx,
    // narrow arcs (single-pose Opening/Closing) label outward from the edge
    labelText: narrow ? arc.label.split(' ')[0] : arc.label,
    labelX: narrow ? (cx < W / 2 ? left : right) : cx,
    labelAnchor: narrow ? (cx < W / 2 ? 'start' : 'end') : 'middle',
  };
});

const rootNode = kcNodes.get('root') as KcNode;

/* ————————————————————————————————————————————— probability dressing */

function fmtPct(p: number): string {
  if (p < 0.01) return '<1%';
  if (p >= 0.995) return '99%';
  return `${Math.max(1, Math.round(p * 100))}%`;
}

/** Node fill: bare surface at P=0 warming to full ember at P=1. */
const fillFor = (p: number) =>
  `color-mix(in srgb, var(--ember) ${(p * 100).toFixed(1)}%, var(--bg-sunken))`;

const BANDS: Band[] = ['unseen', 'shaky', 'developing', 'solid'];

const BAND_RANGE: Record<Band, string> = {
  unseen: 'below 15%',
  shaky: '15 – 50%',
  developing: '50 – 85%',
  solid: '85% and up',
};

/** Representative P for legend swatches, one per band. */
const BAND_SAMPLE: Record<Band, number> = {
  unseen: 0.06,
  shaky: 0.32,
  developing: 0.68,
  solid: 0.94,
};

/** Pill/accent tint per band — always derived from tokens. */
const BAND_TINT: Record<Band, string> = {
  unseen: 'var(--text-faint)',
  shaky: 'color-mix(in srgb, var(--ember) 45%, var(--text-faint))',
  developing: 'color-mix(in srgb, var(--ember) 72%, var(--text-soft))',
  solid: 'var(--ember)',
};

const KIND_NAME: Record<KcNode['kind'], string> = {
  identity: 'Identity',
  transition: 'Transition',
  arc: 'Arc',
  root: 'Whole sequence',
};

const KIND_NOTE: Record<KcNode['kind'], string> = {
  identity:
    'One posture, known by name and by number. The name and position cards feed evidence here — and every hand-off touching this posture leans on it.',
  transition:
    'A hand-off: knowing what follows this posture. The what-comes-next cards feed evidence here, and it rests on the two identities beneath it.',
  arc:
    'An aggregate. An arc counts as known only to the degree that every identity and hand-off inside it is — the probabilities multiply, so one weak piece holds the whole arc down.',
  root:
    'The top of the map: the product of all four arcs. It only climbs when everything beneath it does, so a tiny number early on is honesty, not a bug.',
};

function ago(last: number): string {
  const days = Math.floor((Date.now() - last) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

function IconBack() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14.5 6 8.5 12l6 6" />
    </svg>
  );
}

function IconGo() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 12h15m0 0-5-5m5 5-5 5" />
    </svg>
  );
}

/* ————————————————————————————————————————————— view */

export function KnowledgeMap() {
  const store = useMemo(() => loadStore(Date.now()), []);
  const pOf = useMemo(() => {
    const m = new Map<KcId, number>();
    for (const id of kcNodes.keys()) m.set(id, nodeP(store, id));
    return m;
  }, [store]);

  const [selected, setSelected] = useState<KcId>('root');

  const leafCounts = useMemo(() => {
    const counts: Record<Band, number> = { unseen: 0, shaky: 0, developing: 0, solid: 0 };
    for (const n of kcNodes.values()) {
      if (n.kind === 'identity' || n.kind === 'transition') {
        counts[band(pOf.get(n.id) ?? 0)] += 1;
      }
    }
    return counts;
  }, [pOf]);

  const fresh = Object.keys(store.kcs).length === 0;
  const rootP = pOf.get('root') ?? 0;
  const isSolid = (id: KcId) => band(pOf.get(id) ?? 0) === 'solid';

  /** Shared props for every interactive node in the SVG. */
  const nodeProps = (node: KcNode, p: number) => ({
    className: 'km-node',
    role: 'button',
    tabIndex: 0,
    'aria-label': `${node.kind === 'identity' ? `#${node.order} ` : ''}${node.label} — ${fmtPct(p)}, ${band(p)}`,
    'aria-pressed': selected === node.id,
    'data-band': band(p),
    'data-strong': p >= 0.85 || undefined,
    'data-selected': selected === node.id || undefined,
    onClick: () => setSelected(node.id),
    onKeyDown: (e: KeyboardEvent<SVGGElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setSelected(node.id);
      }
    },
  });

  /* ——— selection detail */
  const selNode = kcNodes.get(selected) ?? rootNode;
  const selP = pOf.get(selNode.id) ?? 0;
  const selBand = band(selP);
  const selState = store.kcs[selNode.id];
  const selPose = selNode.poseId ? getPose(selNode.poseId) : undefined;
  const isLeaf = selNode.kind === 'identity' || selNode.kind === 'transition';

  let agg: { total: number; solid: number; weakest: KcNode; weakestP: number } | null = null;
  if (selNode.kind === 'arc' || selNode.kind === 'root') {
    let solidCount = 0;
    let weakest = kcNodes.get(selNode.children[0]) as KcNode;
    let weakestP = pOf.get(weakest.id) ?? 1;
    for (const cid of selNode.children) {
      const cp = pOf.get(cid) ?? 0;
      if (band(cp) === 'solid') solidCount += 1;
      if (cp < weakestP) {
        weakestP = cp;
        weakest = kcNodes.get(cid) as KcNode;
      }
    }
    agg = { total: selNode.children.length, solid: solidCount, weakest, weakestP };
  }

  return (
    <div className="page km">
      <div className="container">
        <header className="km-head">
          <Link to="/train" className="km-back">
            <IconBack />
            <span>Trainer</span>
          </Link>
          <p className="eyebrow">Knowledge map</p>
          <h1 className="km-title">The sequence as a living structure.</h1>
          <p className="km-lede text-soft">
            Every answer updates a Bayesian estimate of what you know — identities feed
            transitions, transitions feed arcs, arcs feed the whole sequence.
          </p>
        </header>

        <section className="card km-stats" aria-label="Progress summary">
          <div className="km-stat-main">
            <span className="km-stat-num">{fmtPct(rootP)}</span>
            <span className="km-stat-cap text-faint">whole sequence</span>
          </div>
          <span className="km-stat-sep" aria-hidden />
          <div className="km-stat-arcs">
            {arcSpots.map(({ node, arc }) => {
              const ap = pOf.get(node.id) ?? 0;
              return (
                <button
                  key={arc.key}
                  className="pill km-arcpill"
                  style={{ '--pill': BAND_TINT[band(ap)] } as CSSProperties}
                  onClick={() => setSelected(node.id)}
                  aria-pressed={selected === node.id}
                >
                  {arc.label} · {fmtPct(ap)}
                </button>
              );
            })}
          </div>
          <div className="km-stat-bands" aria-label="The 51 identities and hand-offs, counted by band">
            {BANDS.map((b) => (
              <span key={b} className="km-bandcount">
                <i className="km-swatch km-swatch--sm" data-band={b} style={{ background: fillFor(BAND_SAMPLE[b]) }} aria-hidden />
                <strong>{leafCounts[b]}</strong> {b}
              </span>
            ))}
          </div>
        </section>

        {fresh && (
          <div className="card km-empty" role="status">
            <p>
              <strong>Nothing lit yet.</strong>{' '}
              <span className="text-soft">
                Every node sits at its faint prior — answer a few cards and the structure
                starts to glow from the bottom up.
              </span>
            </p>
            <Link to="/train" className="km-cta">
              Start a review
              <IconGo />
            </Link>
          </div>
        )}

        <section className="card km-map" aria-label="Knowledge map diagram">
          <div className="km-scroll">
            <svg
              className="km-svg"
              viewBox={`0 0 ${W} ${H}`}
              role="group"
              aria-label="The knowledge DAG: 26 identities, 25 transitions, 4 arcs, and the whole sequence"
            >
              {/* membership zones: one soft band per arc, spanning its postures */}
              {arcSpots.map(({ arc, left, right }) => (
                <rect
                  key={`zone-${arc.key}`}
                  className="km-zone"
                  x={left}
                  y={ZONE_TOP}
                  width={right - left}
                  height={ZONE_BOT - ZONE_TOP}
                  rx={12}
                />
              ))}

              {/* trunks: each arc node down into its zone */}
              {arcSpots.map(({ node, arc, cx }) => (
                <line
                  key={`trunk-${arc.key}`}
                  className="km-edge km-trunk"
                  x1={cx}
                  y1={ARC_Y + ARC_H}
                  x2={cx}
                  y2={ZONE_TOP}
                  data-lit={isSolid(node.id) || undefined}
                />
              ))}

              {/* root → arc edges */}
              {arcSpots.map(({ node, arc, cx }, i) => {
                const sx = W / 2 + (i - 1.5) * 54;
                return (
                  <path
                    key={`redge-${arc.key}`}
                    className="km-edge"
                    d={`M ${sx} ${ROOT_Y + ROOT_H} C ${sx} ${ROOT_Y + ROOT_H + 42}, ${cx} ${ARC_Y - 46}, ${cx} ${ARC_Y}`}
                    data-lit={(isSolid('root') && isSolid(node.id)) || undefined}
                  />
                );
              })}

              {/* transition → identity prerequisite edges */}
              {trSpots.map(({ node, x }) => {
                const trSolid = isSolid(node.id);
                return node.prereqs.map((pid) => {
                  const pn = kcNodes.get(pid) as KcNode;
                  return (
                    <line
                      key={`${node.id}-${pid}`}
                      className="km-edge"
                      x1={x}
                      y1={TR_Y + TR_S}
                      x2={xOf(pn.order)}
                      y2={ID_Y - ID_R}
                      data-lit={(trSolid && isSolid(pid)) || undefined}
                    />
                  );
                });
              })}

              {/* arc nodes */}
              {arcSpots.map(({ node, left, right, labelText, labelX, labelAnchor }) => {
                const p = pOf.get(node.id) ?? 0;
                return (
                  <g key={node.id} {...nodeProps(node, p)}>
                    <title>{`${node.label} — ${fmtPct(p)} · ${band(p)}`}</title>
                    <text className="km-arclabel" x={labelX} y={ARC_Y - 9} textAnchor={labelAnchor as 'start' | 'middle' | 'end'}>
                      {labelText}
                      <tspan className="km-arclabel-pct"> · {fmtPct(p)}</tspan>
                    </text>
                    <rect
                      className="km-shape"
                      x={left}
                      y={ARC_Y}
                      width={right - left}
                      height={ARC_H}
                      rx={9}
                      fill={fillFor(p)}
                    />
                  </g>
                );
              })}

              {/* root node */}
              <g {...nodeProps(rootNode, rootP)}>
                <title>{`${rootNode.label} — ${fmtPct(rootP)} · ${band(rootP)}`}</title>
                <rect
                  className="km-shape"
                  x={W / 2 - ROOT_W / 2}
                  y={ROOT_Y}
                  width={ROOT_W}
                  height={ROOT_H}
                  rx={12}
                  fill={fillFor(rootP)}
                />
                <text className="km-root-name" x={W / 2} y={ROOT_Y + 20.5} textAnchor="middle">
                  The whole sequence
                </text>
                <text className="km-root-pct" x={W / 2} y={ROOT_Y + 37} textAnchor="middle">
                  {fmtPct(rootP)}
                </text>
              </g>

              {/* transition diamonds */}
              {trSpots.map(({ node, x }) => {
                const p = pOf.get(node.id) ?? 0;
                return (
                  <g key={node.id} {...nodeProps(node, p)}>
                    <title>{`${node.label} — ${fmtPct(p)} · ${band(p)}`}</title>
                    <path
                      className="km-shape"
                      d={`M ${x} ${TR_Y - TR_S} L ${x + TR_S} ${TR_Y} L ${x} ${TR_Y + TR_S} L ${x - TR_S} ${TR_Y} Z`}
                      fill={fillFor(p)}
                    />
                  </g>
                );
              })}

              {/* identity circles + order numbers */}
              {idSpots.map(({ node, x }) => {
                const p = pOf.get(node.id) ?? 0;
                return (
                  <g key={node.id} {...nodeProps(node, p)}>
                    <title>{`#${node.order} ${node.label} — ${fmtPct(p)} · ${band(p)}`}</title>
                    <circle className="km-shape" cx={x} cy={ID_Y} r={ID_R} fill={fillFor(p)} />
                    <text className="km-order" x={x} y={ID_Y + ID_R + 15.5} textAnchor="middle">
                      {node.order}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <p className="km-map-hint text-faint">
            Circles are postures, diamonds are hand-offs, bands are arcs — select any node to inspect it.
          </p>
        </section>

        <div className="km-below">
          <section className="card km-detail" aria-live="polite" aria-label="Selected node">
            <p className="eyebrow">{KIND_NAME[selNode.kind]}</p>
            <div className="km-detail-head">
              {selNode.kind === 'identity' && selPose && <PoseFigure pose={selPose} size={64} />}
              <div className="km-detail-names">
                <h2 className="km-detail-title">
                  {selNode.kind === 'identity' ? `${selNode.order}. ${selNode.label}` : selNode.label}
                </h2>
                {selNode.kind === 'identity' && selPose?.sanskritName && (
                  <p className="km-detail-sanskrit text-soft">{selPose.sanskritName}</p>
                )}
              </div>
            </div>

            <div className="km-meter-row">
              <span className="km-meter-num">{fmtPct(selP)}</span>
              <span className="pill" style={{ '--pill': BAND_TINT[selBand] } as CSSProperties}>
                <span className="dot" aria-hidden />
                {selBand}
              </span>
            </div>
            <div className="km-meter" role="img" aria-label={`Estimated probability known: ${fmtPct(selP)}`}>
              <span className="km-meter-fill" style={{ width: `${Math.max(selP * 100, 0.5)}%` }} />
            </div>

            <p className="km-kind-note text-soft">{KIND_NOTE[selNode.kind]}</p>

            {isLeaf && (
              <p className="km-evidence">
                {selState ? (
                  <>
                    <strong>{selState.correct}</strong> correct · <strong>{selState.wrong}</strong> missed
                    <span className="text-faint"> · last practiced {ago(selState.last)}</span>
                  </>
                ) : (
                  <span className="text-faint">No answers recorded yet — this sits at its prior.</span>
                )}
              </p>
            )}

            {selNode.kind === 'transition' && (
              <div className="km-children">
                <p className="km-subhead">Rests on</p>
                <ul className="km-childlist">
                  {selNode.prereqs.map((pid) => {
                    const pn = kcNodes.get(pid) as KcNode;
                    const pp = pOf.get(pid) ?? 0;
                    const ppose = pn.poseId ? getPose(pn.poseId) : undefined;
                    return (
                      <li key={pid}>
                        <button className="km-childrow" onClick={() => setSelected(pid)}>
                          {ppose && <PoseFigure pose={ppose} size={32} />}
                          <span className="km-childname">
                            {pn.order}. {pn.label}
                          </span>
                          <span className="km-childpct" data-band={band(pp)}>
                            {fmtPct(pp)}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {agg && (
              <div className="km-children">
                <p className="km-subhead">
                  {agg.solid} of {agg.total} {selNode.kind === 'root' ? 'arcs' : 'pieces'} solid
                </p>
                <button className="km-childrow" onClick={() => setSelected(agg.weakest.id)}>
                  <span className="km-childtag text-faint">weakest link</span>
                  <span className="km-childname">
                    {agg.weakest.kind === 'identity' ? `${agg.weakest.order}. ` : ''}
                    {agg.weakest.label}
                  </span>
                  <span className="km-childpct" data-band={band(agg.weakestP)}>
                    {fmtPct(agg.weakestP)}
                  </span>
                </button>
              </div>
            )}

            {selNode.kind === 'identity' && selPose && (
              <Link className="km-poselink" to={`/pose/${selPose.id}`}>
                Study this posture
                <IconGo />
              </Link>
            )}
          </section>

          <aside className="card km-legend" aria-label="Legend">
            <p className="eyebrow">Reading the map</p>
            <ul className="km-legend-list">
              {BANDS.map((b) => (
                <li key={b}>
                  <span className="km-swatch" data-band={b} style={{ background: fillFor(BAND_SAMPLE[b]) }} aria-hidden />
                  <span className="km-legend-word">{b}</span>
                  <span className="km-legend-range text-faint">{BAND_RANGE[b]}</span>
                </li>
              ))}
            </ul>
            <p className="km-legend-note text-soft">
              An arc counts as known only when every piece inside it is — the probabilities
              multiply, so a single shaky hand-off keeps a whole arc low.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
