import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Pose } from '../data';
import { poses } from '../data';
import { PoseFigure } from '../components/PoseFigure';
import './Trainer.css';

/* ————————————————————————————————————————————— progress store */

const STORAGE_KEY = 'yoga-trainer-v1';

interface PoseStat {
  seen: number;
  correct: number;
  wrong: number;
}

interface Progress {
  version: 1;
  poses: Record<string, PoseStat>;
  bestStreak: number;
}

const emptyProgress = (): Progress => ({ version: 1, poses: {}, bestStreak: 0 });

function asCount(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0;
}

function loadProgress(): Progress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const data = JSON.parse(raw) as Partial<Progress> | null;
    if (!data || data.version !== 1 || typeof data.poses !== 'object' || !data.poses) {
      return emptyProgress();
    }
    const cleaned: Record<string, PoseStat> = {};
    for (const [id, s] of Object.entries(data.poses)) {
      if (!s || typeof s !== 'object') continue;
      cleaned[id] = { seen: asCount(s.seen), correct: asCount(s.correct), wrong: asCount(s.wrong) };
    }
    return { version: 1, poses: cleaned, bestStreak: asCount(data.bestStreak) };
  } catch {
    return emptyProgress();
  }
}

function saveProgress(p: Progress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable — train without persistence */
  }
}

function statFor(progress: Progress, id: string): PoseStat {
  return progress.poses[id] ?? { seen: 0, correct: 0, wrong: 0 };
}

function isMastered(s: PoseStat): boolean {
  return s.correct >= 3 && s.correct > s.wrong;
}

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

type Screen = 'landing' | 'next' | 'names';

type RecordFn = (poseId: string, ok: boolean, streakAfter?: number) => void;

export function Trainer() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [progress, setProgress] = useState<Progress>(loadProgress);

  const record = useCallback<RecordFn>((poseId, ok, streakAfter = 0) => {
    setProgress((prev) => {
      const s = statFor(prev, poseId);
      const next: Progress = {
        version: 1,
        poses: {
          ...prev.poses,
          [poseId]: {
            seen: s.seen + 1,
            correct: s.correct + (ok ? 1 : 0),
            wrong: s.wrong + (ok ? 0 : 1),
          },
        },
        bestStreak: Math.max(prev.bestStreak, streakAfter),
      };
      saveProgress(next);
      return next;
    });
  }, []);

  const resetProgress = useCallback(() => {
    const fresh = emptyProgress();
    saveProgress(fresh);
    setProgress(fresh);
  }, []);

  const exit = useCallback(() => setScreen('landing'), []);

  if (screen === 'next') {
    return <NextMode progress={progress} record={record} onExit={exit} />;
  }
  if (screen === 'names') {
    return <NamesMode record={record} onExit={exit} />;
  }
  return <Landing progress={progress} onStart={setScreen} onReset={resetProgress} />;
}

/* ————————————————————————————————————————————— landing */

function Landing({
  progress,
  onStart,
  onReset,
}: {
  progress: Progress;
  onStart: (s: Screen) => void;
  onReset: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  const masteredCount = poses.filter((p) => isMastered(statFor(progress, p.id))).length;
  const seenCount = poses.filter((p) => statFor(progress, p.id).seen > 0).length;
  const hasAnyProgress = seenCount > 0 || progress.bestStreak > 0;

  return (
    <div className="page trainer">
      <header className="container tr-hero">
        <p className="eyebrow">Memory trainer</p>
        <h1 className="tr-title">Know the sequence by heart.</h1>
        <p className="tr-lede text-soft">
          Twenty-six items, one fixed order. Drill the transitions until the next
          posture arrives in your mind before the teacher calls it.
        </p>
      </header>

      <div className="container">
        <div className="tr-modes">
          <button className="card tr-mode-card" onClick={() => onStart('next')}>
            <span className="tr-mode-icon" aria-hidden>
              <IconSequence />
            </span>
            <span className="tr-mode-name">What comes next?</span>
            <span className="tr-mode-desc text-soft">
              See a posture, name the one that follows. Multiple choice, streaks,
              and a mnemonic whenever you slip.
            </span>
            <span className="tr-mode-go">
              Start drilling
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 12h15m0 0-5-5m5 5-5 5" />
              </svg>
            </span>
          </button>

          <button className="card tr-mode-card" onClick={() => onStart('names')}>
            <span className="tr-mode-icon" aria-hidden>
              <IconCards />
            </span>
            <span className="tr-mode-name">Name to name</span>
            <span className="tr-mode-desc text-soft">
              Flashcards pairing English and Sanskrit. Flip the card, then sort it —
              got it, or see it again.
            </span>
            <span className="tr-mode-go">
              Start the deck
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 12h15m0 0-5-5m5 5-5 5" />
              </svg>
            </span>
          </button>
        </div>

        <section className="card tr-progress" aria-label="Your progress">
          <header className="tr-progress-head">
            <div>
              <h2 className="tr-progress-title">Your progress</h2>
              <p className="tr-progress-sub text-faint">
                A posture is mastered after three correct answers, net of misses.
              </p>
            </div>
            {hasAnyProgress &&
              (confirming ? (
                <div className="tr-reset-confirm" role="alertdialog" aria-label="Confirm reset">
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
                aria-label={`${masteredCount} of ${poses.length} postures mastered`}
              >
                {poses.map((p) => {
                  const s = statFor(progress, p.id);
                  const state = isMastered(s) ? 'mastered' : s.seen > 0 ? 'practicing' : 'unseen';
                  return (
                    <span
                      key={p.id}
                      className="tr-dot"
                      data-state={state}
                      title={`${p.order} · ${p.englishName}`}
                    />
                  );
                })}
              </div>
              <div className="tr-progress-stats">
                <span>
                  <strong>{masteredCount}</strong> of {poses.length} mastered
                </span>
                <span className="tr-stat-sep" aria-hidden />
                <span>
                  <strong>{seenCount}</strong> practiced
                </span>
                <span className="tr-stat-sep" aria-hidden />
                <span className="tr-progress-streak">
                  <IconFlame />
                  best streak <strong>{progress.bestStreak}</strong>
                </span>
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

/* ————————————————————————————————————————————— mode: what comes next */

type NextOption = { kind: 'pose'; pose: Pose } | { kind: 'end' };

interface NextQuestion {
  prompt: Pose;
  options: NextOption[];
  correctIndex: number;
}

function promptWeight(s: PoseStat): number {
  if (s.seen === 0) return 3; // fresh material first
  const accuracy = s.correct / s.seen;
  const base = 1 + (1 - accuracy) * 6; // shaky transitions come around more
  return isMastered(s) ? base * 0.35 : base;
}

function makeNextQuestion(progress: Progress, avoidId: string | null): NextQuestion | null {
  if (poses.length < 5) return null; // need a prompt, an answer, and three decoys

  const pool = avoidId && poses.length > 1 ? poses.filter((p) => p.id !== avoidId) : poses;
  const prompt = weightedPick(pool, (p) => promptWeight(statFor(progress, p.id)));
  const idx = poses.indexOf(prompt);
  const nextPose: Pose | undefined = poses[idx + 1];

  const correct: NextOption = nextPose
    ? { kind: 'pose', pose: nextPose }
    : { kind: 'end' }; // pose 26: the class is over
  const targetOrder = nextPose ? nextPose.order : prompt.order;

  let candidates = poses.filter((p) => p !== prompt && p !== nextPose);
  const decoys: Pose[] = [];
  while (decoys.length < 3 && candidates.length > 0) {
    const pick = weightedPick(
      candidates,
      (p) => 1 / (1 + 0.55 * Math.abs(p.order - targetOrder)), // nearby postures are the tempting mistakes
    );
    decoys.push(pick);
    candidates = candidates.filter((p) => p !== pick);
  }

  const options = shuffle<NextOption>([
    correct,
    ...decoys.map((pose) => ({ kind: 'pose' as const, pose })),
  ]);
  return { prompt, options, correctIndex: options.indexOf(correct) };
}

function praise(streak: number): string {
  if (streak >= 10) return `${streak} in a row — teacher material.`;
  if (streak >= 5) return `${streak} in a row — the room is heating up.`;
  if (streak >= 2) return `${streak} in a row.`;
  return 'That’s it.';
}

function NextMode({
  progress,
  record,
  onExit,
}: {
  progress: Progress;
  record: RecordFn;
  onExit: () => void;
}) {
  const [question, setQuestion] = useState<NextQuestion | null>(() =>
    makeNextQuestion(progress, null),
  );
  const [picked, setPicked] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);

  const answered = picked !== null;

  const pick = (i: number) => {
    if (!question || answered || i >= question.options.length) return;
    const ok = i === question.correctIndex;
    setPicked(i);
    const nextStreak = ok ? streak + 1 : 0;
    setStreak(nextStreak);
    record(question.prompt.id, ok, ok ? nextStreak : streak);
  };

  const advance = () => {
    setQuestion(makeNextQuestion(progress, question ? question.prompt.id : null));
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
        (e.key === 'ArrowRight' ||
          ((e.key === 'Enter' || e.key === ' ') && !onControl(e)))
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
          <ModeHeader eyebrow="Drill" title="What comes next?" onExit={onExit} />
          <p className="text-faint">
            Not enough of the sequence is written yet to build a quiz — check back soon.
          </p>
        </div>
      </div>
    );
  }

  const { prompt, options, correctIndex } = question;
  const wrong = answered && picked !== correctIndex;
  const correctOption = options[correctIndex];

  return (
    <div className="page trainer">
      <div className="container tr-mode-shell">
        <ModeHeader
          eyebrow="Drill"
          title="What comes next?"
          onExit={onExit}
          right={
            <span className="tr-streak-wrap">
              <span key={streak} className="pill tr-streak" data-zero={streak === 0 || undefined}>
                <IconFlame />
                {streak}
              </span>
              <span className="tr-best text-faint">best {progress.bestStreak}</span>
            </span>
          }
        />

        <section className="tr-quiz" aria-label="Question">
          <div className="card tr-prompt">
            <PoseFigure pose={prompt} size={110} />
            <div className="tr-prompt-text">
              <p className="eyebrow">Number {prompt.order} of {poses.length}</p>
              <h2 className="tr-prompt-name">{prompt.englishName}</h2>
              {prompt.sanskritName && (
                <p className="tr-prompt-sanskrit text-soft">{prompt.sanskritName}</p>
              )}
            </div>
          </div>

          <p className="tr-ask">Which posture comes next?</p>

          <ol className="tr-options" data-answered={answered || undefined}>
            {options.map((o, i) => {
              const isCorrect = answered && i === correctIndex;
              const isWrongPick = answered && picked === i && i !== correctIndex;
              return (
                <li key={o.kind === 'pose' ? o.pose.id : 'end'}>
                  <button
                    className={
                      'card tr-option' +
                      (isCorrect ? ' is-correct' : '') +
                      (isWrongPick ? ' is-wrong' : '') +
                      (answered && !isCorrect && !isWrongPick ? ' is-dimmed' : '')
                    }
                    onClick={() => pick(i)}
                    aria-disabled={answered || undefined}
                  >
                    <span className="tr-key" aria-hidden>
                      {i + 1}
                    </span>
                    <span className="tr-opt-text">
                      <span className="tr-opt-name">
                        {o.kind === 'end' ? 'Class is over — final savasana' : o.pose.englishName}
                      </span>
                      <span className="tr-opt-sub text-faint">
                        {o.kind === 'end' ? 'the sequence is complete' : o.pose.sanskritName}
                      </span>
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

          <div className="tr-feedback-slot" aria-live="polite">
            {answered && (
              <div className="card tr-feedback" data-ok={!wrong || undefined}>
                {wrong ? (
                  <div className="tr-feedback-body">
                    <p className="tr-verdict">Not quite.</p>
                    {correctOption.kind === 'pose' ? (
                      <div className="tr-answer">
                        <PoseFigure pose={correctOption.pose} size={64} />
                        <div>
                          <p className="tr-answer-lead">
                            Next is{' '}
                            <strong>
                              #{correctOption.pose.order} {correctOption.pose.englishName}
                            </strong>
                          </p>
                          {memoryHook(correctOption.pose) && (
                            <p className="tr-mnemonic">“{memoryHook(correctOption.pose)}”</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="tr-answer-lead">
                        {prompt.englishName} is the last of the twenty-six — nothing follows
                        but final savasana.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="tr-verdict tr-verdict-ok">{praise(streak)}</p>
                )}
                <button className="tr-btn tr-btn-primary" onClick={advance}>
                  Next question
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M4 12h15m0 0-5-5m5 5-5 5" />
                  </svg>
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

/* ————————————————————————————————————————————— mode: name to name */

interface DeckCard {
  pose: Pose;
  face: 'english' | 'sanskrit';
  key: number;
}

function buildDeck(): DeckCard[] {
  return shuffle(poses).map((pose, i) => ({
    pose,
    face: pose.sanskritName && Math.random() < 0.5 ? 'sanskrit' : 'english',
    key: i,
  }));
}

function NamesMode({ record, onExit }: { record: RecordFn; onExit: () => void }) {
  const [deck, setDeck] = useState<DeckCard[]>(buildDeck);
  const [flipped, setFlipped] = useState(false);
  const [got, setGot] = useState(0);
  const [again, setAgain] = useState(0);

  const current: DeckCard | undefined = deck[0];

  const answer = (ok: boolean) => {
    if (!current || !flipped) return;
    record(current.pose.id, ok);
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
    setDeck(buildDeck());
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
      if (flipped && e.key === 'ArrowRight') {
        e.preventDefault();
        answer(true);
      } else if (flipped && e.key === 'ArrowLeft') {
        e.preventDefault();
        answer(false);
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
          <ModeHeader eyebrow="Flashcards" title="Name to name" onExit={onExit} />
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
  const frontName = face === 'sanskrit' && pose.sanskritName ? pose.sanskritName : pose.englishName;
  const backName = face === 'sanskrit' || !pose.sanskritName ? pose.englishName : pose.sanskritName;
  const summaryLine = firstSentence(pose.summary || pose.sequenceNote || '');

  return (
    <div className="page trainer">
      <div className="container tr-mode-shell">
        <ModeHeader
          eyebrow="Flashcards"
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
                <button className="tr-btn tr-btn-again" onClick={() => answer(false)}>
                  <IconCross />
                  Again
                </button>
                <button className="tr-btn tr-btn-primary" onClick={() => answer(true)}>
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
            <kbd>Space</kbd> flips · <kbd>←</kbd> again · <kbd>→</kbd> got it · <kbd>Esc</kbd> exits
          </p>
        </div>
      </div>
    </div>
  );
}
