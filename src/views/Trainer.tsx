import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Pose } from '../data';
import { getPose, poses } from '../data';
import { PoseFigure } from '../components/PoseFigure';
import type { Grade, QueueEntry, TrainerStore } from '../trainer';
import {
  band,
  buildQueue,
  dueCount,
  loadStore,
  nodeP,
  recordAnswer,
  resetStore,
  saveStore,
  unseenCount,
} from '../trainer';
import './Trainer.css';

/* ————————————————————————————————————————————— shared helpers */

function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function weightedPick<T>(items: readonly T[], weightOf: (t: T) => number): T {
  let total = 0;
  const ws = items.map((t) => {
    const w = Math.max(weightOf(t), 0.0001);
    total += w;
    return w;
  });
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= ws[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

/** Memory hook, tolerant of not-yet-authored content. */
function memoryHook(pose: Pose): string {
  return pose.mnemonic || pose.sequenceNote || pose.summary || '';
}

function firstSentence(text: string): string {
  const i = text.indexOf('. ');
  return i === -1 ? text : text.slice(0, i + 1);
}

/** Was this key pressed while an interactive element had focus? */
function onControl(e: KeyboardEvent): boolean {
  const el = e.target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' || tag === 'TEXTAREA';
}

/** Honest percent for a P(known) — never rounds up to 1% or 100%. */
function pctLabel(p: number): string {
  const pct = p * 100;
  if (pct < 1) return '<1%';
  if (pct >= 99.5) return '99%';
  return `${Math.round(pct)}%`;
}

/** Rough human duration for "next card due in …". */
function inWords(ms: number): string {
  const min = Math.max(1, Math.round(ms / 60000));
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 48) return `${h} h`;
  return `${Math.round(h / 24)} days`;
}

function praise(streak: number): string {
  if (streak >= 10) return `${streak} in a row — teacher material.`;
  if (streak >= 5) return `${streak} in a row — the room is heating up.`;
  if (streak >= 2) return `${streak} in a row.`;
  return 'That’s it.';
}

/* ————————————————————————————————————————————— multiple choice building */

interface McQuestion {
  /** the stimulus pose ('next': the FROM pose; 'pos': the pose whose number is asked) */
  prompt: Pose;
  /** the correct option */
  answer: Pose;
  options: Pose[];
  correctIndex: number;
}

/** Three decoys biased toward orders near the answer — the tempting mistakes. */
function pickDecoys(target: Pose, exclude: readonly Pose[], count = 3): Pose[] {
  let candidates = poses.filter((p) => !exclude.includes(p));
  const decoys: Pose[] = [];
  while (decoys.length < count && candidates.length > 0) {
    const pick = weightedPick(
      candidates,
      (p) => 1 / (1 + 0.55 * Math.abs(p.order - target.order)),
    );
    decoys.push(pick);
    candidates = candidates.filter((p) => p !== pick);
  }
  return decoys;
}

function makeNextMc(from: Pose): McQuestion | null {
  const next: Pose | undefined = poses[poses.indexOf(from) + 1];
  if (!next) return null;
  const options = shuffle([next, ...pickDecoys(next, [from, next])]);
  return { prompt: from, answer: next, options, correctIndex: options.indexOf(next) };
}

function makePosMc(pose: Pose): McQuestion {
  const options = shuffle([pose, ...pickDecoys(pose, [pose])]);
  return { prompt: pose, answer: pose, options, correctIndex: options.indexOf(pose) };
}

/* ————————————————————————————————————————————— tiny inline icons */

function IconSequence() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="4.5" cy="12" r="2.1" />
      <circle cx="11.5" cy="12" r="2.1" />
      <path d="M16.5 12h4m0 0-2.4-2.4M20.5 12l-2.4 2.4" />
    </svg>
  );
}

function IconCards() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3.5" y="6.5" width="12.5" height="14" rx="2" />
      <path d="M8.5 3.5h10a2 2 0 0 1 2 2v11.5" />
    </svg>
  );
}

function IconLoop() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 12a8 8 0 1 1-2.4-5.7" />
      <path d="M20.2 3.2v3.9h-3.9" />
    </svg>
  );
}

function IconFlame() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 20.5c-3.2 0-5.7-2.4-5.7-5.4 0-3.7 3-5.3 3.8-8.1.1-.4.6-.5.8-.1.6 1 1 2.4.8 3.8 1.1-.4 1.9-1.3 2.2-2.4 2 1.6 3.8 3.9 3.8 6.8 0 3-2.5 5.4-5.7 5.4Z" />
    </svg>
  );
}

function IconBack() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14.5 6 8.5 12l6 6" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 12h15m0 0-5-5m5 5-5 5" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

function IconCross() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" aria-hidden>
      <path d="M7 7l10 10M17 7 7 17" />
    </svg>
  );
}

/* ————————————————————————————————————————————— trainer root */

type Screen = 'landing' | 'review' | 'next' | 'names';

/** Record one graded answer into the engine and persist. */
type AnswerFn = (cardId: string, grade: Grade, streakAfter?: number) => void;

export function Trainer() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [store, setStore] = useState<TrainerStore>(() => loadStore(Date.now()));
  const [, setRev] = useState(0);

  const answer = useCallback<AnswerFn>(
    (cardId, grade, streakAfter = 0) => {
      recordAnswer(store, cardId, grade, Date.now());
      if (streakAfter > store.bestStreak) store.bestStreak = streakAfter;
      saveStore(store);
      setRev((r) => r + 1); // store is mutated in place — nudge React
    },
    [store],
  );

  const reset = useCallback(() => setStore(resetStore()), []);
  const exit = useCallback(() => setScreen('landing'), []);

  if (screen === 'review') {
    return <ReviewMode store={store} answer={answer} onExit={exit} />;
  }
  if (screen === 'next') {
    return <NextMode store={store} answer={answer} onExit={exit} />;
  }
  if (screen === 'names') {
    return <NamesMode store={store} answer={answer} onExit={exit} />;
  }
  return <Landing store={store} onStart={setScreen} onReset={reset} />;
}

/* ————————————————————————————————————————————— landing */

function Landing({
  store,
  onStart,
  onReset,
}: {
  store: TrainerStore;
  onStart: (s: Screen) => void;
  onReset: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  const now = Date.now();
  const due = dueCount(store, now);
  const unseen = unseenCount(store);
  const solidCount = poses.filter((p) => band(nodeP(store, `id:${p.id}`)) === 'solid').length;
  const rootP = nodeP(store, 'root');
  const hasAnyProgress =
    store.answers > 0 || store.bestStreak > 0 || Object.keys(store.cards).length > 0;

  return (
    <div className="page trainer">
      <header className="container tr-hero">
        <p className="eyebrow">Memory trainer</p>
        <h1 className="tr-title">Know the sequence by heart.</h1>
        <p className="tr-lede text-soft">
          Twenty-six items, one fixed order. The trainer watches every answer and
          schedules each card for the moment just before you’d forget it.
        </p>
      </header>

      <div className="container">
        <div className="tr-modes">
          <button className="card tr-mode-card tr-mode-card--primary" onClick={() => onStart('review')}>
            <span className="tr-mode-icon" aria-hidden>
              <IconLoop />
            </span>
            <span className="tr-mode-kicker text-faint">Smart review — spaced repetition</span>
            <span className="tr-mode-name">Review</span>
            <span className="tr-mode-desc text-soft">
              The engine lines up what’s due, folds in a few new cards, and circles
              back to whatever looks weakest. Twenty cards, tops.
            </span>
            <span className="tr-review-badges">
              <span className="pill" data-tone="due" data-zero={due === 0 || undefined}>
                {due} due now
              </span>
              <span className="pill" data-tone="new" data-zero={unseen === 0 || undefined}>
                {unseen} unseen
              </span>
            </span>
            <span className="tr-mode-go">
              Start review
              <IconArrow />
            </span>
          </button>

          <button className="card tr-mode-card" onClick={() => onStart('next')}>
            <span className="tr-mode-icon" aria-hidden>
              <IconSequence />
            </span>
            <span className="tr-mode-kicker text-faint">Free practice</span>
            <span className="tr-mode-name">What comes next?</span>
            <span className="tr-mode-desc text-soft">
              See a posture, name the one that follows. Unscheduled drilling —
              every answer still counts as evidence.
            </span>
            <span className="tr-mode-go">
              Start drilling
              <IconArrow />
            </span>
          </button>

          <button className="card tr-mode-card" onClick={() => onStart('names')}>
            <span className="tr-mode-icon" aria-hidden>
              <IconCards />
            </span>
            <span className="tr-mode-kicker text-faint">Free practice</span>
            <span className="tr-mode-name">Name to name</span>
            <span className="tr-mode-desc text-soft">
              Flashcards pairing English and Sanskrit, weakest names first. Flip
              the card, then sort it — got it, or see it again.
            </span>
            <span className="tr-mode-go">
              Start the deck
              <IconArrow />
            </span>
          </button>
        </div>

        <section className="card tr-progress" aria-label="Your progress">
          <header className="tr-progress-head">
            <div>
              <h2 className="tr-progress-title">Your progress</h2>
              <p className="tr-progress-sub text-faint">
                One dot per item, shaded by how sure the engine is that you know it.
              </p>
            </div>
            {hasAnyProgress &&
              (confirming ? (
                <div className="tr-reset-confirm" role="group" aria-label="Confirm reset">
                  <span className="text-soft">Erase all progress?</span>
                  <button
                    className="tr-btn tr-btn-danger"
                    onClick={() => {
                      onReset();
                      setConfirming(false);
                    }}
                  >
                    Erase
                  </button>
                  <button className="tr-btn" onClick={() => setConfirming(false)}>
                    Keep
                  </button>
                </div>
              ) : (
                <button className="tr-reset" onClick={() => setConfirming(true)}>
                  Reset progress
                </button>
              ))}
          </header>

          {poses.length === 0 ? (
            <p className="text-faint">The sequence is still being written — check back soon.</p>
          ) : (
            <>
              <div
                className="tr-dots"
                role="img"
                aria-label={`${solidCount} of ${poses.length} postures solid`}
              >
                {poses.map((p) => {
                  const state = band(nodeP(store, `id:${p.id}`));
                  return (
                    <span
                      key={p.id}
                      className="tr-dot"
                      data-state={state}
                      title={`${p.order} · ${p.englishName} — ${state}`}
                    />
                  );
                })}
              </div>
              <div className="tr-progress-stats">
                <span>
                  <strong>{solidCount}</strong> of {poses.length} solid
                </span>
                <span className="tr-stat-sep" aria-hidden />
                <span className="tr-progress-streak">
                  <IconFlame />
                  best streak <strong>{store.bestStreak}</strong>
                </span>
              </div>

              <div className="tr-progress-foot">
                <div className="tr-root-stat">
                  <span className="eyebrow">P(whole sequence)</span>
                  <span className="tr-root-num">{pctLabel(rootP)}</span>
                  <span className="tr-root-cap text-faint">
                    Probability you could run the class cold — strict by design.
                  </span>
                </div>
                <Link className="tr-map-link" to="/train/map">
                  <span className="tr-map-link-name">
                    See the knowledge map
                    <IconArrow />
                  </span>
                  <span className="tr-map-link-sub text-faint">
                    Every posture, transition, and arc as the engine sees it.
                  </span>
                </Link>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

/* ————————————————————————————————————————————— mode chrome */

function ModeHeader({
  eyebrow,
  title,
  right,
  onExit,
}: {
  eyebrow: string;
  title: string;
  right?: ReactNode;
  onExit: () => void;
}) {
  return (
    <header className="tr-mode-head">
      <button className="tr-exit" onClick={onExit}>
        <IconBack />
        <span>Trainer</span>
      </button>
      <div className="tr-mode-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="tr-mode-title">{title}</h1>
      </div>
      <div className="tr-mode-right">{right}</div>
    </header>
  );
}

const REASON_LABEL: Record<QueueEntry['reason'], string> = {
  due: 'due now',
  new: 'new',
  weak: 'needs work',
};

function WhyTag({ reason }: { reason: QueueEntry['reason'] }) {
  return (
    <div className="tr-why">
      <span className="pill" data-reason={reason}>
        {REASON_LABEL[reason]}
      </span>
    </div>
  );
}

/** Four answer buttons with keycaps, marks, and the answered dim/flash states. */
function OptionList({
  options,
  correctIndex,
  picked,
  onPick,
}: {
  options: Pose[];
  correctIndex: number;
  picked: number | null;
  onPick: (i: number) => void;
}) {
  const answered = picked !== null;
  return (
    <ol className="tr-options" data-answered={answered || undefined}>
      {options.map((pose, i) => {
        const isCorrect = answered && i === correctIndex;
        const isWrongPick = answered && picked === i && i !== correctIndex;
        return (
          <li key={pose.id}>
            <button
              className={
                'card tr-option' +
                (isCorrect ? ' is-correct' : '') +
                (isWrongPick ? ' is-wrong' : '') +
                (answered && !isCorrect && !isWrongPick ? ' is-dimmed' : '')
              }
              onClick={() => onPick(i)}
              aria-disabled={answered || undefined}
            >
              <span className="tr-key" aria-hidden>
                {i + 1}
              </span>
              <span className="tr-opt-text">
                <span className="tr-opt-name">{pose.englishName}</span>
                <span className="tr-opt-sub text-faint">{pose.sanskritName}</span>
              </span>
              {isCorrect && (
                <span className="tr-opt-mark tr-mark-check" aria-hidden>
                  <IconCheck />
                </span>
              )}
              {isWrongPick && (
                <span className="tr-opt-mark tr-mark-cross" aria-hidden>
                  <IconCross />
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function AnswerReveal({ pose, lead }: { pose: Pose; lead: ReactNode }) {
  return (
    <div className="tr-answer">
      <PoseFigure pose={pose} size={64} />
      <div>
        <p className="tr-answer-lead">{lead}</p>
        {memoryHook(pose) && <p className="tr-mnemonic">“{memoryHook(pose)}”</p>}
      </div>
    </div>
  );
}

/* ————————————————————————————————————————————— review mode */

interface SessionStats {
  answered: number;
  again: number;
  kcs: string[];
}

const FRESH_STATS: SessionStats = { answered: 0, again: 0, kcs: [] };

function ReviewMode({
  store,
  answer,
  onExit,
}: {
  store: TrainerStore;
  answer: AnswerFn;
  onExit: () => void;
}) {
  const build = () => buildQueue(store, Date.now()).filter((e) => getPose(e.card.poseId));
  const [queue, setQueue] = useState<QueueEntry[]>(build);
  const [index, setIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState<SessionStats>(FRESH_STATS);

  const entry: QueueEntry | undefined = queue[index];

  const grade = useCallback(
    (g: Grade) => {
      if (!entry) return;
      const nextStreak = g === 'good' ? streak + 1 : 0;
      setStreak(nextStreak);
      answer(entry.card.id, g, nextStreak);
      setStats((s) => ({
        answered: s.answered + 1,
        again: s.again + (g === 'again' ? 1 : 0),
        kcs: s.kcs.includes(entry.card.kc) ? s.kcs : [...s.kcs, entry.card.kc],
      }));
    },
    [entry, streak, answer],
  );

  const next = useCallback(() => setIndex((i) => i + 1), []);

  const restart = useCallback(() => {
    setQueue(buildQueue(store, Date.now()).filter((e) => getPose(e.card.poseId)));
    setIndex(0);
    setStreak(0);
    setStats(FRESH_STATS);
  }, [store]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onExit]);

  /* ——— nothing scheduled at all */
  if (queue.length === 0) {
    const nextDue = Object.values(store.cards).reduce((m, c) => Math.min(m, c.due), Infinity);
    const wait = Number.isFinite(nextDue) ? nextDue - Date.now() : NaN;
    return (
      <div className="page trainer">
        <div className="container tr-mode-shell">
          <ModeHeader eyebrow="Smart review" title="Review" onExit={onExit} />
          <div className="card tr-done">
            <p className="eyebrow">All caught up</p>
            <h2 className="tr-done-title">Nothing is due right now.</h2>
            <p className="tr-done-root text-soft">
              Every card is scheduled ahead of you.
              {Number.isFinite(wait) && wait > 0 && (
                <> The next one falls due in about <strong>{inWords(wait)}</strong>.</>
              )}
            </p>
            <div className="tr-done-actions">
              <button className="tr-btn tr-btn-primary" onClick={onExit}>
                Back to trainer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ——— end of session */
  if (!entry) {
    return (
      <div className="page trainer">
        <div className="container tr-mode-shell">
          <ModeHeader eyebrow="Smart review" title="Review" onExit={onExit} />
          <div className="card tr-done">
            <p className="eyebrow">Session complete</p>
            <h2 className="tr-done-title">
              {stats.again === 0
                ? 'A clean sweep.'
                : 'Done — the misses are already rescheduled.'}
            </h2>
            <dl className="tr-done-stats">
              <div>
                <dt className="text-faint">Answered</dt>
                <dd>{stats.answered}</dd>
              </div>
              <div>
                <dt className="text-faint">Again</dt>
                <dd>{stats.again}</dd>
              </div>
              <div>
                <dt className="text-faint">Skills touched</dt>
                <dd>{stats.kcs.length}</dd>
              </div>
            </dl>
            <p className="tr-done-root text-soft">
              Whole sequence now at <strong>{pctLabel(nodeP(store, 'root'))}</strong> — the
              probability you could run the class cold.
            </p>
            {stats.again > 0 && (
              <p className="tr-done-note text-faint">
                Missed cards come back five minutes after the miss — review again
                shortly to catch them.
              </p>
            )}
            <div className="tr-done-actions">
              <button className="tr-btn tr-btn-primary" onClick={restart}>
                Review again
              </button>
              <button className="tr-btn" onClick={onExit}>
                Back to trainer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pose = getPose(entry.card.poseId) as Pose; // queue is filtered to known poses
  const isLast = index === queue.length - 1;

  return (
    <div className="page trainer">
      <div className="container tr-mode-shell">
        <ModeHeader
          eyebrow="Smart review"
          title="Review"
          onExit={onExit}
          right={
            <span className="tr-streak-wrap">
              <span key={streak} className="pill tr-streak" data-zero={streak === 0 || undefined}>
                <IconFlame />
                {streak}
              </span>
              <span className="tr-best text-faint">
                card {Math.min(index + 1, queue.length)} of {queue.length}
              </span>
            </span>
          }
        />

        {entry.card.kind === 'name' ? (
          <ReviewFlip
            key={index}
            pose={pose}
            reason={entry.reason}
            onGrade={(g) => {
              grade(g);
              next();
            }}
          />
        ) : (
          <ReviewMc
            key={index}
            kind={entry.card.kind}
            pose={pose}
            reason={entry.reason}
            streak={streak}
            onGrade={grade}
            onNext={next}
            nextLabel={isLast ? 'Finish session' : 'Continue'}
          />
        )}
      </div>
    </div>
  );
}

/* ——— review: multiple choice ('next' and 'pos' cards) */

function ReviewMc({
  kind,
  pose,
  reason,
  streak,
  onGrade,
  onNext,
  nextLabel,
}: {
  kind: 'next' | 'pos';
  pose: Pose;
  reason: QueueEntry['reason'];
  streak: number;
  onGrade: (g: Grade) => void;
  onNext: () => void;
  nextLabel: string;
}) {
  const [question] = useState<McQuestion | null>(() =>
    kind === 'next' ? makeNextMc(pose) : makePosMc(pose),
  );
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;

  const pick = (i: number) => {
    if (!question || answered || i >= question.options.length) return;
    setPicked(i);
    onGrade(i === question.correctIndex ? 'good' : 'again');
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (!answered && e.key >= '1' && e.key <= '4') {
        e.preventDefault();
        pick(Number(e.key) - 1);
        return;
      }
      if (
        answered &&
        (e.key === 'ArrowRight' || ((e.key === 'Enter' || e.key === ' ') && !onControl(e)))
      ) {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!question) return null; // a 'next' card always has a successor in practice

  const { options, correctIndex, answer } = question;
  const wrong = answered && picked !== correctIndex;

  return (
    <section className="tr-quiz" aria-label="Question">
      <WhyTag reason={reason} />

      {kind === 'next' ? (
        <div className="card tr-prompt">
          <PoseFigure pose={pose} size={110} />
          <div className="tr-prompt-text">
            <p className="eyebrow">
              Number {pose.order} of {poses.length}
            </p>
            <h2 className="tr-prompt-name">{pose.englishName}</h2>
            {pose.sanskritName && (
              <p className="tr-prompt-sanskrit text-soft">{pose.sanskritName}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="card tr-prompt tr-prompt-pos">
          <div className="tr-posnum" aria-hidden>
            {pose.order}
          </div>
          <div className="tr-prompt-text">
            <p className="eyebrow">Sequence position</p>
            <h2 className="tr-prompt-name">Number {pose.order}</h2>
            <p className="tr-prompt-sanskrit text-soft">of {poses.length} in the series</p>
          </div>
        </div>
      )}

      <p className="tr-ask">
        {kind === 'next'
          ? 'Which posture comes next?'
          : `Which posture is number ${pose.order}?`}
      </p>

      <OptionList options={options} correctIndex={correctIndex} picked={picked} onPick={pick} />

      <div className="tr-feedback-slot" aria-live="polite">
        {answered && (
          <div className="card tr-feedback" data-ok={!wrong || undefined}>
            {wrong ? (
              <div className="tr-feedback-body">
                <p className="tr-verdict">Not quite.</p>
                <AnswerReveal
                  pose={answer}
                  lead={
                    kind === 'next' ? (
                      <>
                        Next is{' '}
                        <strong>
                          #{answer.order} {answer.englishName}
                        </strong>
                      </>
                    ) : (
                      <>
                        Number {pose.order} is <strong>{answer.englishName}</strong>
                      </>
                    )
                  }
                />
              </div>
            ) : (
              <p className="tr-verdict tr-verdict-ok">{praise(streak)}</p>
            )}
            <button className="tr-btn tr-btn-primary" onClick={onNext}>
              {nextLabel}
              <IconArrow />
            </button>
          </div>
        )}
      </div>

      <p className="tr-kbd-hint text-faint">
        Keys <kbd>1</kbd>–<kbd>4</kbd> answer · <kbd>→</kbd> continues · <kbd>Esc</kbd> exits
      </p>
    </section>
  );
}

/* ——— review: flip card ('name' cards) */

function ReviewFlip({
  pose,
  reason,
  onGrade,
}: {
  pose: Pose;
  reason: QueueEntry['reason'];
  onGrade: (g: Grade) => void;
}) {
  const [face] = useState<'english' | 'sanskrit'>(() =>
    pose.sanskritName && Math.random() < 0.5 ? 'sanskrit' : 'english',
  );
  const [flipped, setFlipped] = useState(false);

  const sort = (g: Grade) => {
    if (!flipped) return;
    onGrade(g);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.key === ' ' || e.key === 'Enter') && !onControl(e)) {
        e.preventDefault();
        setFlipped((f) => !f);
        return;
      }
      if (!flipped) return;
      const k = e.key.toLowerCase();
      if (k === 'g' || e.key === 'ArrowRight') {
        e.preventDefault();
        sort('good');
      } else if (k === 'a' || e.key === 'ArrowLeft') {
        e.preventDefault();
        sort('again');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const frontName =
    face === 'sanskrit' && pose.sanskritName ? pose.sanskritName : pose.englishName;
  const backName =
    face === 'sanskrit' || !pose.sanskritName ? pose.englishName : pose.sanskritName;
  const summaryLine = firstSentence(pose.summary || pose.sequenceNote || '');

  return (
    <div className="tr-deck">
      <WhyTag reason={reason} />

      <div className="tr-scene">
        <button
          className="tr-flip"
          data-flipped={flipped || undefined}
          onClick={() => setFlipped((f) => !f)}
          aria-label={flipped ? 'Flip card back' : 'Flip card to reveal the answer'}
        >
          <span className="card tr-face tr-face-front" aria-hidden={flipped}>
            <PoseFigure pose={pose} size={96} />
            <span className="tr-face-eyebrow eyebrow">
              {face === 'sanskrit' ? 'Sanskrit' : 'English'}
            </span>
            <span className="tr-face-name">{frontName}</span>
            <span className="tr-face-hint text-faint">click or press space to flip</span>
          </span>
          <span className="card tr-face tr-face-back" aria-hidden={!flipped}>
            <span className="tr-face-eyebrow eyebrow">
              Number {pose.order} in the sequence
            </span>
            <span className="tr-face-name">{backName}</span>
            <span className="tr-face-alt text-soft">{frontName}</span>
            {summaryLine && <span className="tr-face-summary text-soft">{summaryLine}</span>}
          </span>
        </button>
      </div>

      <div className="tr-sort" aria-live="polite">
        {flipped ? (
          <>
            <button className="tr-btn tr-btn-again" onClick={() => sort('again')}>
              <IconCross />
              Again
            </button>
            <button className="tr-btn tr-btn-primary" onClick={() => sort('good')}>
              <IconCheck />
              Got it
            </button>
          </>
        ) : (
          <span className="tr-sort-hint text-faint">
            Recall the other name, then flip to check.
          </span>
        )}
      </div>

      <p className="tr-kbd-hint text-faint">
        <kbd>Space</kbd> flips · <kbd>G</kbd> got it · <kbd>A</kbd> again · <kbd>Esc</kbd> exits
      </p>
    </div>
  );
}

/* ————————————————————————————————————————————— free practice: what comes next */

function makeFreeNext(store: TrainerStore, avoidId: string | null): McQuestion | null {
  if (poses.length < 5) return null; // need a prompt, an answer, and three decoys
  // only poses with a successor have a 'next' card (1–25)
  let pool = poses.slice(0, -1);
  if (avoidId && pool.length > 1) pool = pool.filter((p) => p.id !== avoidId);
  if (pool.length === 0) return null;
  // low P(known) transitions come around more often
  const prompt = weightedPick(pool, (p) => 0.25 + (1 - nodeP(store, `tr:${p.order}`)) * 4);
  return makeNextMc(prompt);
}

function NextMode({
  store,
  answer,
  onExit,
}: {
  store: TrainerStore;
  answer: AnswerFn;
  onExit: () => void;
}) {
  const [question, setQuestion] = useState<McQuestion | null>(() => makeFreeNext(store, null));
  const [picked, setPicked] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);

  const answered = picked !== null;

  const pick = (i: number) => {
    if (!question || answered || i >= question.options.length) return;
    const ok = i === question.correctIndex;
    setPicked(i);
    const nextStreak = ok ? streak + 1 : 0;
    setStreak(nextStreak);
    answer(`next:${question.prompt.id}`, ok ? 'good' : 'again', nextStreak);
  };

  const advance = () => {
    setQuestion(makeFreeNext(store, question ? question.prompt.id : null));
    setPicked(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape') {
        onExit();
        return;
      }
      if (!answered && e.key >= '1' && e.key <= '4') {
        e.preventDefault();
        pick(Number(e.key) - 1);
        return;
      }
      if (
        answered &&
        (e.key === 'ArrowRight' || ((e.key === 'Enter' || e.key === ' ') && !onControl(e)))
      ) {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!question) {
    return (
      <div className="page trainer">
        <div className="container">
          <ModeHeader eyebrow="Free practice" title="What comes next?" onExit={onExit} />
          <p className="text-faint">
            Not enough of the sequence is written yet to build a quiz — check back soon.
          </p>
        </div>
      </div>
    );
  }

  const { prompt, options, correctIndex, answer: correctPose } = question;
  const wrong = answered && picked !== correctIndex;

  return (
    <div className="page trainer">
      <div className="container tr-mode-shell">
        <ModeHeader
          eyebrow="Free practice"
          title="What comes next?"
          onExit={onExit}
          right={
            <span className="tr-streak-wrap">
              <span key={streak} className="pill tr-streak" data-zero={streak === 0 || undefined}>
                <IconFlame />
                {streak}
              </span>
              <span className="tr-best text-faint">best {store.bestStreak}</span>
            </span>
          }
        />

        <section className="tr-quiz" aria-label="Question">
          <div className="card tr-prompt">
            <PoseFigure pose={prompt} size={110} />
            <div className="tr-prompt-text">
              <p className="eyebrow">
                Number {prompt.order} of {poses.length}
              </p>
              <h2 className="tr-prompt-name">{prompt.englishName}</h2>
              {prompt.sanskritName && (
                <p className="tr-prompt-sanskrit text-soft">{prompt.sanskritName}</p>
              )}
            </div>
          </div>

          <p className="tr-ask">Which posture comes next?</p>

          <OptionList
            options={options}
            correctIndex={correctIndex}
            picked={picked}
            onPick={pick}
          />

          <div className="tr-feedback-slot" aria-live="polite">
            {answered && (
              <div className="card tr-feedback" data-ok={!wrong || undefined}>
                {wrong ? (
                  <div className="tr-feedback-body">
                    <p className="tr-verdict">Not quite.</p>
                    <AnswerReveal
                      pose={correctPose}
                      lead={
                        <>
                          Next is{' '}
                          <strong>
                            #{correctPose.order} {correctPose.englishName}
                          </strong>
                        </>
                      }
                    />
                  </div>
                ) : (
                  <p className="tr-verdict tr-verdict-ok">{praise(streak)}</p>
                )}
                <button className="tr-btn tr-btn-primary" onClick={advance}>
                  Next question
                  <IconArrow />
                </button>
              </div>
            )}
          </div>

          <p className="tr-kbd-hint text-faint">
            Keys <kbd>1</kbd>–<kbd>4</kbd> answer · <kbd>→</kbd> next question · <kbd>Esc</kbd> exits
          </p>
        </section>
      </div>
    </div>
  );
}

/* ————————————————————————————————————————————— free practice: name to name */

interface DeckCard {
  pose: Pose;
  face: 'english' | 'sanskrit';
  key: number;
}

/** Whole deck, weakest names biased toward the front. */
function buildDeck(store: TrainerStore): DeckCard[] {
  let remaining = [...poses];
  const deck: DeckCard[] = [];
  let key = 0;
  while (remaining.length > 0) {
    const pose = weightedPick(remaining, (p) => 0.2 + (1 - nodeP(store, `id:${p.id}`)) * 3);
    remaining = remaining.filter((p) => p !== pose);
    deck.push({
      pose,
      face: pose.sanskritName && Math.random() < 0.5 ? 'sanskrit' : 'english',
      key: key++,
    });
  }
  return deck;
}

function NamesMode({
  store,
  answer,
  onExit,
}: {
  store: TrainerStore;
  answer: AnswerFn;
  onExit: () => void;
}) {
  const [deck, setDeck] = useState<DeckCard[]>(() => buildDeck(store));
  const [flipped, setFlipped] = useState(false);
  const [got, setGot] = useState(0);
  const [again, setAgain] = useState(0);

  const current: DeckCard | undefined = deck[0];

  const sort = (ok: boolean) => {
    if (!current || !flipped) return;
    answer(`name:${current.pose.id}`, ok ? 'good' : 'again');
    setFlipped(false);
    if (ok) {
      setGot((g) => g + 1);
      setDeck((d) => d.slice(1));
    } else {
      setAgain((a) => a + 1);
      setDeck((d) => {
        const rest = d.slice(1);
        const at = Math.min(3, rest.length); // resurface a few cards later
        return [...rest.slice(0, at), d[0], ...rest.slice(at)];
      });
    }
  };

  const goAgain = () => {
    setDeck(buildDeck(store));
    setGot(0);
    setAgain(0);
    setFlipped(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape') {
        onExit();
        return;
      }
      if (!current) return;
      if ((e.key === ' ' || e.key === 'Enter') && !onControl(e)) {
        e.preventDefault();
        setFlipped((f) => !f);
        return;
      }
      if (!flipped) return;
      const k = e.key.toLowerCase();
      if (k === 'g' || e.key === 'ArrowRight') {
        e.preventDefault();
        sort(true);
      } else if (k === 'a' || e.key === 'ArrowLeft') {
        e.preventDefault();
        sort(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const total = poses.length;
  const donePct = total > 0 ? Math.round((got / total) * 100) : 0;

  /* ——— end of deck */
  if (!current) {
    const rounds = got + again;
    const accuracy = rounds > 0 ? Math.round((got / rounds) * 100) : 0;
    return (
      <div className="page trainer">
        <div className="container tr-mode-shell">
          <ModeHeader eyebrow="Free practice" title="Name to name" onExit={onExit} />
          {total === 0 ? (
            <p className="text-faint">
              The deck is empty — the sequence is still being written.
            </p>
          ) : (
            <div className="card tr-done">
              <p className="eyebrow">Deck complete</p>
              <h2 className="tr-done-title">
                {again === 0
                  ? 'A clean pass through all twenty-six.'
                  : 'Through the whole deck.'}
              </h2>
              <dl className="tr-done-stats">
                <div>
                  <dt className="text-faint">Got it</dt>
                  <dd>{got}</dd>
                </div>
                <div>
                  <dt className="text-faint">Again</dt>
                  <dd>{again}</dd>
                </div>
                <div>
                  <dt className="text-faint">Accuracy</dt>
                  <dd>{accuracy}%</dd>
                </div>
              </dl>
              <div className="tr-done-actions">
                <button className="tr-btn tr-btn-primary" onClick={goAgain}>
                  Go again
                </button>
                <button className="tr-btn" onClick={onExit}>
                  Back to trainer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const { pose, face } = current;
  const frontName =
    face === 'sanskrit' && pose.sanskritName ? pose.sanskritName : pose.englishName;
  const backName =
    face === 'sanskrit' || !pose.sanskritName ? pose.englishName : pose.sanskritName;
  const summaryLine = firstSentence(pose.summary || pose.sequenceNote || '');

  return (
    <div className="page trainer">
      <div className="container tr-mode-shell">
        <ModeHeader
          eyebrow="Free practice"
          title="Name to name"
          onExit={onExit}
          right={
            <span className="pill tr-cards-left">
              {deck.length} {deck.length === 1 ? 'card' : 'cards'} left
            </span>
          }
        />

        <div className="tr-deck">
          <div className="tr-deckbar" aria-hidden>
            <span className="tr-deckbar-fill" style={{ width: `${donePct}%` }} />
          </div>

          <div className="tr-scene">
            <button
              key={current.key}
              className="tr-flip"
              data-flipped={flipped || undefined}
              onClick={() => setFlipped((f) => !f)}
              aria-label={flipped ? 'Flip card back' : 'Flip card to reveal the answer'}
            >
              <span className="card tr-face tr-face-front" aria-hidden={flipped}>
                <PoseFigure pose={pose} size={96} />
                <span className="tr-face-eyebrow eyebrow">
                  {face === 'sanskrit' ? 'Sanskrit' : 'English'}
                </span>
                <span className="tr-face-name">{frontName}</span>
                <span className="tr-face-hint text-faint">click or press space to flip</span>
              </span>
              <span className="card tr-face tr-face-back" aria-hidden={!flipped}>
                <span className="tr-face-eyebrow eyebrow">
                  Number {pose.order} in the sequence
                </span>
                <span className="tr-face-name">{backName}</span>
                <span className="tr-face-alt text-soft">{frontName}</span>
                {summaryLine && (
                  <span className="tr-face-summary text-soft">{summaryLine}</span>
                )}
              </span>
            </button>
          </div>

          <div className="tr-sort" aria-live="polite">
            {flipped ? (
              <>
                <button className="tr-btn tr-btn-again" onClick={() => sort(false)}>
                  <IconCross />
                  Again
                </button>
                <button className="tr-btn tr-btn-primary" onClick={() => sort(true)}>
                  <IconCheck />
                  Got it
                </button>
              </>
            ) : (
              <span className="tr-sort-hint text-faint">
                Recall the other name, then flip to check.
              </span>
            )}
          </div>

          <p className="tr-kbd-hint text-faint">
            <kbd>Space</kbd> flips · <kbd>G</kbd> got it · <kbd>A</kbd> again · <kbd>Esc</kbd> exits
          </p>
        </div>
      </div>
    </div>
  );
}
