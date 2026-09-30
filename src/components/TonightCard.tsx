import { Link } from 'react-router-dom';
import { STUDY } from '../features';
import { SHORT_CLASS, classMinutes } from '../pacer';
import type { ClassProgram } from '../pacer';
import { dayKey, dueCount, loadJournal, loadStore } from '../trainer';
import './TonightCard.css';

export function TonightCard({ bpm, beatsPerBar, onChoose }: {
  bpm: number; beatsPerBar: number; onChoose: (program: ClassProgram) => void;
}) {
  const now = Date.now();
  const practisedToday = loadJournal().days.includes(dayKey(now));
  const due = STUDY && practisedToday ? dueCount(loadStore(now), now) : 0;
  return (
    <section className="card practice-tonight" aria-labelledby="tonight-title">
      <p className="eyebrow">Tonight</p>
      <h2 id="tonight-title">{practisedToday ? 'You have practised today.' : 'Come back to the breath.'}</h2>
      <p className="text-soft">{practisedToday
        ? 'Let the practice settle. Rest, and come back when you are ready.'
        : 'A shorter practice leaves room for the opening breath, standing work, backbends and the closing breath.'}</p>
      <div className="practice-tonight-actions">
        {!practisedToday && <button type="button" className="pc-btn" onClick={() => onChoose(SHORT_CLASS)}>
          Choose the short class · ~{classMinutes(SHORT_CLASS, bpm, beatsPerBar)} min
        </button>}
        {STUDY && practisedToday && <Link to="/train" className="pc-btn">
          {due > 0 ? `Review ${due} due card${due === 1 ? '' : 's'}` : 'Open the trainer'}
        </Link>}
      </div>
    </section>
  );
}
