import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import type { Pose } from '../data';
import {
  poses,
  chakraById,
  muscleById,
  classTotalSeconds,
  classOffsetSeconds,
  formatMinutes,
} from '../data';
import { FULL_CLASS, SHORT_CLASS, classMinutes as programMinutes } from '../pacer';
import {
  dayKey,
  daysSince,
  dueCount,
  lastClass,
  loadJournal,
  loadStore,
  practiceStreak,
} from '../trainer';
import type { ClassRecord } from '../trainer';
import { PoseFigure } from '../components/PoseFigure';
import './Timeline.css';

/** The four arcs of the class, by sequence number. */
const ARCS = [
  { key: 'opening', title: 'Opening Breath', from: 1, to: 1 },
  { key: 'standing', title: 'Standing Series', from: 2, to: 12 },
  { key: 'floor', title: 'Floor Series', from: 13, to: 25 },
  { key: 'closing', title: 'Closing Breath', from: 26, to: 26 },
] as const;

function arcCountLabel(group: Pose[]): string {
  const allBreathing = group.every((p) => p.category === 'breathing');
  const noun = allBreathing
    ? group.length === 1
      ? 'breathing exercise'
      : 'breathing exercises'
    : group.length === 1
      ? 'posture'
      : 'postures';
  return `${group.length} ${noun}`;
}

function PoseRow({ pose }: { pose: Pose }) {
  const primaries = pose.muscles
    .filter((m) => m.emphasis === 'primary')
    .slice(0, 3);
  const chakraNames = pose.chakras
    .map((c) => chakraById.get(c.id)?.englishName)
    .filter(Boolean)
    .join(', ');

  return (
    <li className="tl-row">
      <Link to={`/pose/${pose.id}`} className="tl-row-link">
        <span className="tl-node" aria-hidden="true">
          {pose.order}
        </span>
        <span className="card tl-card">
          <span className="tl-fig">
            <PoseFigure pose={pose} size={72} />
          </span>
          <span className="tl-main">
            <span className="tl-name">{pose.englishName}</span>
            <span className="tl-sanskrit">{pose.sanskritName}</span>
            <span className="tl-meta">
              <span className="tl-timing">{pose.timing}</span>
              {pose.chakras.length > 0 && (
                <span
                  className="tl-chakras"
                  role="img"
                  aria-label={`Chakras: ${chakraNames}`}
                >
                  {pose.chakras.map((link) => {
                    const ch = chakraById.get(link.id);
                    if (!ch) return null;
                    return (
                      <span
                        key={link.id}
                        className="tl-chakra-dot"
                        style={{ background: ch.color }}
                        title={`${ch.englishName} · ${ch.sanskritName}`}
                        aria-hidden="true"
                      />
                    );
                  })}
                </span>
              )}
            </span>
          </span>
          {primaries.length > 0 && (
            <span className="tl-pills">
              {primaries.map((m) => {
                const mg = muscleById.get(m.id);
                if (!mg) return null;
                const tint =
                  m.action === 'strengthens'
                    ? 'var(--strengthens)'
                    : 'var(--stretches)';
                return (
                  <span
                    key={m.id}
                    className="pill tl-pill"
                    style={{ '--pill': tint } as CSSProperties}
                    title={`${m.action === 'strengthens' ? 'Strengthens' : 'Stretches'} · ${mg.name}`}
                  >
                    <span className="dot" />
                    {mg.name}
                  </span>
                );
              })}
            </span>
          )}
        </span>
      </Link>
    </li>
  );
}

/** "Short class · 15 min", "Full class · 66 min", "Postures 14–26 · 40 min". */
function classSummary(c: ClassRecord): string {
  const name =
    c.program === 'short'
      ? SHORT_CLASS.name
      : c.fromOrder === 1 && c.toOrder === poses.length
        ? FULL_CLASS.name
        : `Postures ${c.fromOrder}–${c.toOrder}`;
  return `${name} · ${Math.max(1, Math.round(c.pacedSeconds / 60))} min`;
}

function agoWords(days: number): string {
  return days === 0 ? 'today' : days === 1 ? 'yesterday' : `${days} days ago`;
}

/**
 * Tonight: one card that says what to do right now, from the practice
 * journal. Not practised today → the short class, with the full class
 * beside it. Practised today → acknowledge it and offer the trainer's
 * due reviews instead.
 */
function TonightCard() {
  const now = Date.now();
  const journal = loadJournal();
  const last = lastClass(journal);
  const streak = practiceStreak(journal, now);
  const ago = last ? daysSince(last.endedAt, now) : null;
  const practisedToday = journal.days.includes(dayKey(now));
  const shortMin = programMinutes(SHORT_CLASS);
  const fullMin = programMinutes(FULL_CLASS);

  let title: string;
  let body: string;
  if (practisedToday) {
    title = 'You have practised today.';
    body =
      last && ago === 0
        ? `${classSummary(last)}, today.`
        : 'The trainer has seen you today.';
  } else if (!last) {
    title = 'Start where the class starts.';
    body = `${shortMin} minutes: the opening breath, three standing postures, a floor backbend pair, the twist and the closing breath.`;
  } else if (streak > 0) {
    title = 'Keep the line going.';
    body = `Last class ${agoWords(ago ?? 0)} — ${classSummary(last)}.`;
  } else {
    title = 'Come back to the breath.';
    body = `Your last class was ${agoWords(ago ?? 0)} — ${classSummary(last)}. A short one tonight is plenty.`;
  }
  const streakLine = streak > 1 ? `${streak} days of practice running.` : null;
  const due = practisedToday ? dueCount(loadStore(now), now) : 0;

  return (
    <section className="card tl-tonight" aria-labelledby="tl-tonight-title">
      <p className="eyebrow">Tonight</p>
      <h2 id="tl-tonight-title" className="tl-tonight-title">
        {title}
      </h2>
      <p className="tl-tonight-body text-soft">
        {body}
        {streakLine && <> {streakLine}</>}
      </p>
      <div className="tl-tonight-actions">
        {practisedToday ? (
          due > 0 ? (
            <>
              <Link to="/train" className="tl-btn tl-btn-primary">
                Review {due} due card{due === 1 ? '' : 's'}
              </Link>
              <Link to="/pace?program=short" className="tl-btn">
                Short class · {shortMin} min
              </Link>
            </>
          ) : (
            <>
              <span className="tl-tonight-note text-faint">
                Nothing is due in the trainer. Rest, and come back tomorrow.
              </span>
              <Link to="/train" className="tl-btn">
                Open the trainer
              </Link>
            </>
          )
        ) : (
          <>
            <Link to="/pace?program=short" className="tl-btn tl-btn-primary">
              Start the short class · {shortMin} min
            </Link>
            <Link to="/pace" className="tl-btn">
              Full class · {fullMin} min
            </Link>
          </>
        )}
      </div>
    </section>
  );
}

export function Timeline() {
  const totalMin = Math.round(classTotalSeconds / 60);
  const breathingCount = poses.filter((p) => p.category === 'breathing').length;
  const postureCount = poses.length - breathingCount;

  return (
    <div className="page timeline">
      <header className="container tl-hero">
        <p className="eyebrow">The Bikram Sequence</p>
        <h1 className="tl-title">
          Twenty&#8209;six postures, two breaths, one unbroken line.
        </h1>
        <p className="tl-lede text-soft">
          The classic hot-room sequence in class order — every posture with its
          timing, chakras, and muscle work, laid out to be learned by heart.
        </p>
        <div className="tl-stats">
          <span className="pill" style={{ '--pill': 'var(--ember)' } as CSSProperties}>
            <span className="dot" />
            {poses.length} in sequence
          </span>
          <span className="pill tl-stat">
            {postureCount} postures + {breathingCount} breathing
          </span>
          <span className="pill tl-stat">~{totalMin} min of postures</span>
          <span className="pill tl-stat">standing then floor</span>
        </div>
      </header>

      <div className="container">
        <TonightCard />
        <div className="tl-flow">
          {ARCS.map((arc) => {
            const group = poses.filter(
              (p) => p.order >= arc.from && p.order <= arc.to,
            );
            if (group.length === 0) return null;
            const arcSeconds = group.reduce(
              (s, p) => s + p.approxTotalSeconds,
              0,
            );
            const startMin = Math.round(
              classOffsetSeconds(group[0]) / 60,
            );
            return (
              <section
                key={arc.key}
                className="tl-group"
                aria-label={arc.title}
              >
                <header className="tl-group-head">
                  <span className="tl-clock">min {startMin}</span>
                  <div className="tl-group-title">
                    <h2>{arc.title}</h2>
                    <p className="tl-group-sub text-faint">
                      {arcCountLabel(group)} · ~{formatMinutes(arcSeconds)}
                    </p>
                  </div>
                </header>
                <ol className="tl-list">
                  {group.map((p) => (
                    <PoseRow key={p.id} pose={p} />
                  ))}
                </ol>
              </section>
            );
          })}

          <div className="tl-end">
            <span className="tl-clock">min {totalMin}</span>
            <p className="tl-end-note text-faint">
              class complete — rest in final savasana
            </p>
            <p className="tl-end-note text-faint">
              <Link to="/today">Moon days — an optional lens for today’s practice →</Link>
            </p>
            <p className="tl-end-note text-faint">
              <Link to="/library">The posture library — beyond the twenty-six →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
