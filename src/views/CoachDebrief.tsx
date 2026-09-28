import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { poses } from '../data';
import type { ClassProgram } from '../pacer';
import { askCoach, buildSystemPrompt, OPENING_LINE, readProposal, saveCoachProgram } from '../coach';
import type { ChatMessage, Proposal } from '../coach';
import { loadJournal, loadStore, lastClass } from '../trainer';
import './CoachDebrief.css';

interface Turn {
  role: 'user' | 'assistant';
  text: string;
  proposal?: Proposal;
  /** validation errors the coach was told about */
  errors?: string[];
}

/** The reply with its proposal block folded away — the card shows it instead. */
function prose(text: string): string {
  return text.replace(/```json[\s\S]*?```/i, '').replace(/```[\s\S]*?```/, '').trim();
}

const nameOf = (order: number) => poses.find((p) => p.order === order)?.englishName ?? `#${order}`;

/**
 * The post-class debrief: a short conversation with the coach that ends
 * in a proposed next class. The coach's proposal is validated here; a bad
 * one is sent back with the rules it broke. "Use this build" saves it as
 * the "Coach's build" program in the pacer.
 */
export function CoachDebrief({
  program,
  beatsPerBar,
  onAdopt,
}: {
  program: ClassProgram;
  beatsPerBar: number;
  onAdopt: (p: ClassProgram) => void;
}) {
  const system = useMemo(() => {
    const now = Date.now();
    const journal = loadJournal();
    return buildSystemPrompt({ journal, store: loadStore(now), program, last: lastClass(journal), now });
  }, [program]);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adopted, setAdopted] = useState(false);
  const historyRef = useRef<ChatMessage[]>([{ role: 'system', content: system }]);
  const started = useRef(false);
  const logRef = useRef<HTMLDivElement>(null);

  const send = useCallback(
    async (text: string, show = true) => {
      setBusy(true);
      setError(null);
      historyRef.current.push({ role: 'user', content: text });
      if (show) setTurns((t) => [...t, { role: 'user', text }]);
      try {
        const reply = await askCoach(historyRef.current);
        historyRef.current.push({ role: 'assistant', content: reply });
        const r = readProposal(reply, beatsPerBar);
        const turn: Turn = { role: 'assistant', text: prose(reply) };
        if (r.ok) turn.proposal = r.proposal;
        else if ('errors' in r) turn.errors = r.errors;
        setTurns((t) => [...t, turn]);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setBusy(false);
      }
    },
    [beatsPerBar],
  );

  // the app opens the conversation once, on the practitioner's behalf
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void send(OPENING_LINE, false);
  }, [send]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns, busy]);

  const submit = () => {
    const text = draft.trim();
    if (!text || busy) return;
    setDraft('');
    void send(text);
  };

  const askToFix = (errors: string[]) => {
    void send(`That proposal was not a valid class:\n- ${errors.join('\n- ')}\nPlease send a corrected one.`);
  };

  const adopt = (p: Proposal) => {
    saveCoachProgram(p.program);
    onAdopt(p.program);
    setAdopted(true);
  };

  return (
    <section className="coach" aria-label="Debrief with the coach">
      <h4 className="coach-title">Debrief with the coach</h4>
      <div className="coach-log" ref={logRef}>
        {turns.map((t, i) => (
          <div key={i} className={`coach-turn coach-turn--${t.role}`}>
            {t.text && <p className="coach-text">{t.text}</p>}
            {t.proposal && (
              <div className="coach-proposal">
                <p className="coach-proposal-head">
                  <strong>{t.proposal.program.name}</strong> · ≈ {t.proposal.minutes} min
                </p>
                <p className="coach-proposal-blurb text-soft">{t.proposal.program.blurb}</p>
                <ol className="coach-proposal-list">
                  {t.proposal.program.items.map((it) => (
                    <li key={it.order}>
                      <span className="coach-proposal-name">
                        {it.order} · {nameOf(it.order)}
                        {it.sets === 1 && <span className="text-faint"> · first set</span>}
                      </span>
                      {t.proposal!.reasons[String(it.order)] && (
                        <span className="coach-proposal-why text-soft"> — {t.proposal!.reasons[String(it.order)]}</span>
                      )}
                    </li>
                  ))}
                </ol>
                <button type="button" className="pc-btn pc-btn-primary" onClick={() => adopt(t.proposal!)} disabled={adopted}>
                  {adopted ? 'Saved as Coach’s build' : 'Use this as my next class'}
                </button>
              </div>
            )}
            {t.errors && (
              <div className="coach-errors">
                <p className="text-soft">The proposal broke the class rules:</p>
                <ul>
                  {t.errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
                <button type="button" className="pc-btn" onClick={() => askToFix(t.errors!)} disabled={busy}>
                  Ask the coach to fix it
                </button>
              </div>
            )}
          </div>
        ))}
        {busy && <p className="coach-busy text-faint">the coach is thinking…</p>}
        {error && (
          <p className="coach-error">
            {error.includes('unavailable') || error.includes('Failed to fetch')
              ? 'The coach is not running. Start it with `npm run coach` beside the dev server.'
              : error}
          </p>
        )}
      </div>
      <form
        className="coach-compose"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="How did it feel? What do you want more of?"
          rows={2}
          disabled={busy}
          aria-label="Your message to the coach"
        />
        <button type="submit" className="pc-btn pc-btn-primary" disabled={busy || !draft.trim()}>
          Send
        </button>
      </form>
    </section>
  );
}
