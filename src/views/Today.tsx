import { useState } from 'react';
import { Link } from 'react-router-dom';
import { setSkyEnabled, skyEnabled, todayLens } from '../sky';
import type { SkyNote, TodayLens } from '../sky';
import type { Pose } from '../data';
import { PoseFigure } from '../components/PoseFigure';
import './Today.css';

/** A moon disc lit to today's phase — the terminator is an ellipse. */
function MoonDisc({ elongation }: { elongation: number }) {
  const r = 44;
  const e = ((elongation % 360) + 360) % 360;
  const waxing = e < 180;
  const lit = (1 - Math.cos((e * Math.PI) / 180)) / 2;
  const rx = Math.abs(Math.cos((e * Math.PI) / 180)) * r;
  const crescent = lit < 0.5;
  const bulgeRight = waxing ? crescent : !crescent;
  const d = `M0,${-r} A${r},${r} 0 0 ${waxing ? 1 : 0} 0,${r} A${rx},${r} 0 0 ${bulgeRight ? 0 : 1} 0,${-r} Z`;
  return (
    <svg className="td-moon" viewBox="-50 -50 100 100" width="96" height="96" aria-hidden="true">
      <circle r={r} className="td-moon-dark" />
      <path d={d} className="td-moon-lit" />
      <circle r={r} className="td-moon-rim" />
    </svg>
  );
}

function PostureChips({ postures }: { postures: Pose[] }) {
  return (
    <ul className="td-chips">
      {postures.map((p) => (
        <li key={p.id}>
          <Link className="pill td-chip" to={`/pose/${p.id}`}>
            <span className="td-chip-num">{p.order}</span> {p.englishName}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function NoteCard({ note, postures, eyebrow }: { note: SkyNote; postures: Pose[]; eyebrow: string }) {
  return (
    <section className="card td-card">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="td-card-title">{note.title}</h2>
      <p className="td-tradition text-faint">{note.tradition}</p>
      <p className="td-text">{note.text}</p>
      <PostureChips postures={postures} />
      <p className="td-notice">
        <span className="td-notice-label">Notice</span> {note.notice}.
      </p>
    </section>
  );
}

function Lens({ lens, onDisable }: { lens: TodayLens; onDisable: () => void }) {
  const pct = Math.round(lens.phase.illumination * 100);
  const potd = lens.postureOfTheDay;
  const leanPhase = lens.leaning.filter((p) => lens.phaseNote.postures.includes(p.id));
  const leanDay = lens.leaning.filter((p) => lens.dayNote.postures.includes(p.id));
  return (
    <>
      <section className="card td-sky">
        <MoonDisc elongation={lens.phase.elongation} />
        <div className="td-sky-text">
          <p className="eyebrow">Tonight’s moon</p>
          <h2 className="td-phase">{lens.phase.name}</h2>
          <p className="text-soft">
            {pct}% lit · day {Math.round(lens.phase.ageDays)} of the lunar month · Moon in{' '}
            {lens.moonSign.name} {Math.floor(lens.moonSign.degree)}° · Sun in {lens.sunSign.name} ·{' '}
            {lens.weekday.day}, the {lens.weekday.planet}’s day
          </p>
          <p className="td-sky-note text-faint">
            Tropical signs, computed here offline (the Moon within a degree or two). Moon Chorus names the
            Moon by constellation boundaries, so its sign can differ — a choice, not a bug.
          </p>
        </div>
      </section>

      <section className="card td-card td-potd">
        <div>
          <p className="eyebrow">Posture of the day</p>
          <h2 className="td-card-title">
            {potd.order} · {potd.englishName}
          </h2>
          <p className="text-soft">
            One posture a day, walking the class in order — every posture gets its day once each lunar month,
            whatever the moon and the weekday lean toward.
          </p>
          <p className="td-links">
            <Link to={`/pose/${potd.id}`}>Read the posture →</Link>
            <Link to={`/train?drill=id:${potd.id}`}>Drill it →</Link>
            <Link to={`/pace?from=${potd.order}`}>Class from here →</Link>
          </p>
        </div>
        <PoseFigure pose={potd} size={110} />
      </section>

      <div className="td-grid">
        <NoteCard note={lens.phaseNote} postures={leanPhase} eyebrow="By the moon" />
        <NoteCard note={lens.dayNote} postures={leanDay} eyebrow="By the day" />
      </div>

      <footer className="td-foot text-faint">
        <p>
          These are traditional associations, described as tradition. They never change the sequence, the
          class, or the cautions on a posture’s page, and the trainer’s own choice of what to drill always
          comes first.
        </p>
        <button type="button" className="td-off" onClick={onDisable}>
          Turn the lens off
        </button>
      </footer>
    </>
  );
}

export function Today() {
  const [enabled, setEnabled] = useState<boolean>(skyEnabled);
  const lens = todayLens(Date.now());

  const toggle = (on: boolean) => {
    setSkyEnabled(on);
    setEnabled(on);
  };

  return (
    <div className="page td">
      <div className="container">
        <header className="td-hero">
          <p className="eyebrow">Moon days</p>
          <h1 className="td-title">A lens for today’s practice.</h1>
          <p className="td-lede text-soft">
            The sequence never changes; where your attention goes inside it can. This optional lens reads
            tonight’s moon and the day of the week, names a few postures the day traditionally leans toward,
            and gives you one thing to notice.
          </p>
        </header>

        {enabled ? (
          <Lens lens={lens} onDisable={() => toggle(false)} />
        ) : (
          <section className="card td-card td-optin">
            <h2 className="td-card-title">Off by default.</h2>
            <p className="text-soft">
              Turn it on and this page shows tonight’s moon phase, the planetary day, a posture of the day
              (every posture once per lunar month), and two short notes. It computes the sky here, offline —
              nothing is sent anywhere, and nothing about the class or the trainer changes.
            </p>
            <p className="td-tradition text-faint">
              What it is not: a prediction, a prescription, or a health claim. The associations are old
              conventions, and the page says so on every card.
            </p>
            <button type="button" className="td-on" onClick={() => toggle(true)}>
              Turn the lens on
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
