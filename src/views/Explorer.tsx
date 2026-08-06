import type { CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  chakras,
  chakraById,
  muscles,
  muscleById,
  posesForChakra,
  posesForMuscle,
} from '../data';
import type {
  BodyRegion,
  Chakra,
  ChakraId,
  MuscleGroup,
  MuscleId,
  MuscleWork,
  Pose,
} from '../data';
import { PoseFigure } from '../components/PoseFigure';
import { BodyMap } from '../components/BodyMap';
import './Explorer.css';

type Lens = 'chakra' | 'muscle';

const REGIONS: { id: BodyRegion; label: string }[] = [
  { id: 'head-neck', label: 'Head & neck' },
  { id: 'upper-body', label: 'Upper body' },
  { id: 'core', label: 'Core' },
  { id: 'lower-body', label: 'Lower body' },
];

/* ————————————————————————————— mini pose card, shared by both lenses */

function PoseCard({ pose, note }: { pose: Pose; note?: string }) {
  return (
    <li>
      <Link to={`/pose/${pose.id}`} className="card ex-pose">
        <span className="ex-pose-fig">
          <PoseFigure pose={pose} size={56} />
        </span>
        <span className="ex-pose-body">
          <span className="ex-pose-top">
            <span className="ex-pose-order" aria-hidden="true">
              {pose.order}
            </span>
            <span className="ex-pose-name">{pose.englishName}</span>
            <span className="ex-pose-sanskrit">{pose.sanskritName}</span>
          </span>
          {note && <span className="ex-pose-note">{note}</span>}
        </span>
      </Link>
    </li>
  );
}

/* ————————————————————————————— chakra lens */

function ChakraDetail({ chakra }: { chakra: Chakra }) {
  const linked = posesForChakra(chakra.id);
  return (
    <div className="ex-detail" style={{ '--c': chakra.color } as CSSProperties}>
      <section className="card ex-card">
        <header className="ex-card-head">
          <span className="ex-dot ex-dot--lg" aria-hidden="true" />
          <div>
            <h2 className="ex-card-title">{chakra.englishName}</h2>
            <p className="ex-card-sub">
              {chakra.sanskritName} · chakra {chakra.number} of 7
            </p>
          </div>
        </header>

        <dl className="ex-facts">
          <div>
            <dt>Location</dt>
            <dd>{chakra.location}</dd>
          </div>
          <div>
            <dt>Element</dt>
            <dd>{chakra.element}</dd>
          </div>
          <div>
            <dt>Bija mantra</dt>
            <dd>{chakra.bija}</dd>
          </div>
        </dl>

        {chakra.themes.length > 0 && (
          <div className="ex-themes">
            {chakra.themes.map((t) => (
              <span
                key={t}
                className="pill"
                style={{ '--pill': chakra.color } as CSSProperties}
              >
                <span className="dot" />
                {t}
              </span>
            ))}
          </div>
        )}

        <p className="ex-desc">{chakra.description}</p>
      </section>

      <section className="ex-section">
        <header className="ex-section-head">
          <h3>Postures that work the {chakra.englishName}</h3>
          <span className="ex-count">{linked.length}</span>
        </header>
        {linked.length === 0 ? (
          <p className="ex-empty">No postures linked yet.</p>
        ) : (
          <ul className="ex-pose-list">
            {linked.map((p) => (
              <PoseCard
                key={p.id}
                pose={p}
                note={p.chakras.find((c) => c.id === chakra.id)?.why}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ————————————————————————————— muscle lens */

function WorkSection({
  muscle,
  action,
  list,
}: {
  muscle: MuscleGroup;
  action: MuscleWork['action'];
  list: Pose[];
}) {
  const strengthens = action === 'strengthens';
  const tint = strengthens ? 'var(--strengthens)' : 'var(--stretches)';
  return (
    <section className="ex-section">
      <header
        className="ex-section-head"
        style={{ '--w': tint } as CSSProperties}
      >
        <span className="ex-work-dot" aria-hidden="true" />
        <h3>{strengthens ? 'Strengthened in' : 'Stretched in'}</h3>
        <span className="ex-count ex-count--work">{list.length}</span>
      </header>
      {list.length === 0 ? (
        <p className="ex-empty">No postures linked yet.</p>
      ) : (
        <ul className="ex-pose-list">
          {list.map((p) => (
            <PoseCard
              key={p.id}
              pose={p}
              note={
                p.muscles.find((w) => w.id === muscle.id && w.action === action)
                  ?.note
              }
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function MuscleDetail({ muscle }: { muscle: MuscleGroup }) {
  const linked = posesForMuscle(muscle.id);
  const region = REGIONS.find((r) => r.id === muscle.region);
  const withAction = (action: MuscleWork['action']) =>
    linked.filter((p) =>
      p.muscles.some((w) => w.id === muscle.id && w.action === action),
    );
  const strengthened = withAction('strengthens');
  const stretched = withAction('stretches');

  return (
    <div className="ex-detail">
      <section className="card ex-card">
        {region && <p className="eyebrow">{region.label}</p>}
        <h2 className="ex-card-title ex-card-title--muscle">{muscle.name}</h2>
        {muscle.anatomicalName && (
          <p className="ex-card-sub">{muscle.anatomicalName}</p>
        )}
        <p className="ex-desc">{muscle.description}</p>
      </section>

      {linked.length === 0 ? (
        <p className="ex-empty">No postures linked yet.</p>
      ) : (
        <>
          <WorkSection muscle={muscle} action="strengthens" list={strengthened} />
          <WorkSection muscle={muscle} action="stretches" list={stretched} />
        </>
      )}
    </div>
  );
}

/* ————————————————————————————— page */

export function Explorer() {
  const [params, setParams] = useSearchParams();

  const lens: Lens = params.get('lens') === 'muscle' ? 'muscle' : 'chakra';
  const rawId = params.get('id') ?? '';
  const chakra = chakraById.get(rawId as ChakraId) ?? chakraById.get('root')!;
  const muscle =
    muscleById.get(rawId as MuscleId) ?? muscleById.get('quadriceps')!;

  const setLens = (next: Lens) => {
    const sp = new URLSearchParams(params);
    if (next === 'chakra') sp.delete('lens');
    else sp.set('lens', next);
    sp.delete('id');
    setParams(sp);
  };

  const setId = (id: string) => {
    const sp = new URLSearchParams(params);
    sp.set('id', id);
    setParams(sp);
  };

  return (
    <div className="page explorer">
      <header className="container ex-hero">
        <p className="eyebrow">Explore the sequence</p>
        <h1 className="ex-title">Two ways into the same twenty-six.</h1>
        <p className="ex-lede text-soft">
          Trace the postures through the body&rsquo;s seven energy centers, or
          through the muscles doing the work. Every selection lives in the
          address bar, so any view can be shared.
        </p>
        <div className="ex-seg" role="group" aria-label="Choose a lens">
          <button
            type="button"
            className={lens === 'chakra' ? 'ex-seg-btn is-active' : 'ex-seg-btn'}
            aria-pressed={lens === 'chakra'}
            onClick={() => setLens('chakra')}
          >
            By chakra
          </button>
          <button
            type="button"
            className={lens === 'muscle' ? 'ex-seg-btn is-active' : 'ex-seg-btn'}
            aria-pressed={lens === 'muscle'}
            onClick={() => setLens('muscle')}
          >
            By muscle
          </button>
        </div>
      </header>

      <div className="container">
        <div className="ex-layout">
          {lens === 'chakra' ? (
            <aside className="ex-rail ex-rail--chakra">
              <nav className="ex-spine" aria-label="Chakras, crown to root">
                {[...chakras].reverse().map((ch) => {
                  const active = ch.id === chakra.id;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      className={active ? 'ex-chakra is-active' : 'ex-chakra'}
                      style={{ '--c': ch.color } as CSSProperties}
                      aria-pressed={active}
                      onClick={() => setId(ch.id)}
                    >
                      <span className="ex-dot" aria-hidden="true" />
                      <span className="ex-chakra-text">
                        <span className="ex-chakra-en">
                          <span className="ex-chakra-num" aria-hidden="true">
                            {ch.number}
                          </span>
                          {ch.englishName}
                        </span>
                        <span className="ex-chakra-sa">{ch.sanskritName}</span>
                      </span>
                      <span className="ex-chakra-count">
                        {posesForChakra(ch.id).length}
                        <span className="ex-vh"> linked postures</span>
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>
          ) : (
            <aside className="ex-rail">
              <div className="card ex-map">
                <BodyMap
                  view="both"
                  height={340}
                  selected={muscle.id}
                  onSelect={(id) => setId(id)}
                />
              </div>
              <div className="ex-regions">
                {REGIONS.map((r) => {
                  const group = muscles.filter((m) => m.region === r.id);
                  if (group.length === 0) return null;
                  return (
                    <div key={r.id}>
                      <p className="ex-region-label">{r.label}</p>
                      <div
                        className="ex-muscle-btns"
                        role="group"
                        aria-label={r.label}
                      >
                        {group.map((m) => {
                          const active = m.id === muscle.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              className={
                                active
                                  ? 'ex-muscle-btn is-active'
                                  : 'ex-muscle-btn'
                              }
                              aria-pressed={active}
                              onClick={() => setId(m.id)}
                            >
                              {m.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>
          )}

          {lens === 'chakra' ? (
            <ChakraDetail key={chakra.id} chakra={chakra} />
          ) : (
            <MuscleDetail key={muscle.id} muscle={muscle} />
          )}
        </div>
      </div>
    </div>
  );
}
