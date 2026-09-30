import { STUDY } from '../features';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ofTheDay, setSkyEnabled, skyEnabled, todayLens } from '../sky';
import type { SkyNote, TodayLens } from '../sky';
import type { Pose } from '../data';
import { loadRigData, poses } from '../data';
import { KALAPURUSHA, VEDIC_SOURCES, vedicSky, vedicPostures, vedicLibrary } from '../sky';
import type { VedicLibraryEntry } from '../sky';
import { PoseFigure } from '../components/PoseFigure';
import type { LibraryEntry } from '../data/library';
import './Today.css';

/** The library's posture of the day. The library is its own lazy chunk (it
 *  loads the book's indexes), so it arrives after the page does. */
function LibraryOfTheDay({ day }: { day: number }) {
  const [pick, setPick] = useState<{ asana: LibraryEntry; family: string; count: number } | null>(null);
  useEffect(() => {
    let live = true;
    import('../data/library').then(({ libraryAsanas, libraryFamilies }) => {
      if (!live || libraryAsanas.length === 0) return;
      const asana = ofTheDay(libraryAsanas, day);
      const family = libraryFamilies.find((f) => f.id === asana.family)?.title ?? '';
      setPick({ asana, family, count: libraryAsanas.length });
    }).catch(() => {
      /* offline before the library was ever cached: the card simply stays away */
    });
    return () => {
      live = false;
    };
  }, [day]);
  if (!pick) return null;
  const { asana, family, count } = pick;
  return (
    <section className="card td-card td-potd">
      <div>
        <p className="eyebrow">From the library</p>
        <h2 className="td-card-title">{asana.english}</h2>
        <p className="td-sanskrit text-soft"><em>{asana.sanskrit}</em> · {family}</p>
        <p className="text-soft">
          One posture a day from <em>Light on Yoga</em>, in the book’s own order — each of the {count} gets its
          day once every {count} days.
        </p>
        <p className="td-links">
          <Link to={`/library/${asana.id}`}>See it move →</Link>
        </p>
      </div>
    </section>
  );
}

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

function VedicCard({ now }: { now: number }) {
  const sky = vedicSky(now);
  const region = KALAPURUSHA[sky.moon.index];
  const [library, setLibrary] = useState<VedicLibraryEntry[]>([]);
  const [libraryFailed, setLibraryFailed] = useState(false);
  useEffect(() => {
    let live = true;
    import('../data/library').then(async ({ libraryAsanas, libraryRigId }) => {
      // Rank the whole library (only the view loads it; sky stays pure).
      const entries: VedicLibraryEntry[] = await Promise.all(libraryAsanas.map(async (asana) => {
        const rig = await loadRigData(libraryRigId(asana.id));
        return { id: asana.id, english: asana.english, stages: rig.stages };
      }));
      if (live) setLibrary(vedicLibrary(region, entries));
    }).catch(() => { if (live) setLibraryFailed(true); });
    return () => { live = false; };
  }, [region]);
  return (
    <section className="card td-card td-vedic" aria-labelledby="vedic-title">
      <p className="eyebrow">Vedic sky</p>
      <h2 className="td-card-title" id="vedic-title">Moon in {sky.moon.sanskrit} · {sky.moon.name}</h2>
      <p className="text-soft">Sidereal Sun: {sky.sun.sanskrit} · {sky.sun.name}</p>
      <p>Nakshatra: {sky.nakshatra.name} · pada {sky.nakshatra.pada}<br />
        Tithi {sky.tithi.number}: {sky.tithi.name} · {sky.tithi.paksha} paksha</p>
      {sky.tithi.moonDay && <p className="td-vedic-flag">{sky.tithi.name} · Moon day</p>}
      <p className="td-tradition text-soft">In <a href={VEDIC_SOURCES.moonDays}>Ashtanga tradition</a>, Purnima and Amavasya are rest days, a custom you can read alongside your practice.</p>
      <p className="td-sky-note text-faint">Astronomy: Meeus Sun and Moon, with Lahiri (Chitrapaksha) ayanamsa.
        This is the sky at the time you opened the page. The approximate Moon can be 1–2° off,
        so a sign, nakshatra, pada or tithi near its boundary may differ from a precise almanac.</p>
      <div className="td-vedic-chain">
        <h3>Kalapurusha: the {region.region} <a href={`${VEDIC_SOURCES.text}#page=46`}>({region.citation})</a></h3>
        <p className="td-tradition text-soft">{region.tradition}</p>
        <p>{region.anatomy}</p>
        <p>Tonight, notice the {region.region} in:</p>
        <p className="eyebrow">26 &amp; 2 · our muscle data</p>
        <PostureChips postures={vedicPostures(region, poses)} />
        <p className="eyebrow">Library · our stage notice regions</p>
        <ul className="td-chips">{library.map(p => <li key={p.id}><Link className="pill td-chip" to={`/library/${p.id}`}>{p.english}</Link></li>)}</ul>
        {library.length === 0 && <p className="text-soft">{libraryFailed ? 'Library notes are unavailable right now.' : 'Loading library notes…'}</p>}
      </div>
      <p className="td-sky-note text-faint">Sources: <a href={VEDIC_SOURCES.astronomy}>astronomy · Meeus + Lahiri precession</a>;
        {' '}<a href={`${VEDIC_SOURCES.text}#page=46`}>text · Brihat Jataka 1.4, Aiyar translation</a>;
        {' '}our anatomy · muscle groups and library stage notices.</p>
      <p className="td-sky-note text-faint">The lens elsewhere uses tropical signs, measured from the equinox.
        This card uses sidereal signs; precession separates the two starting points by about {sky.ayanamsa.toFixed(1)}° today.</p>
    </section>
  );
}

function Lens({ lens, now, onDisable }: { lens: TodayLens; now: number; onDisable: () => void }) {
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
            One posture a day, walking the class in order — every posture gets its day once every 26 days,
            whatever the moon and the weekday lean toward.
          </p>
          <p className="td-links">
            <Link to={`/pose/${potd.id}`}>Read the posture →</Link>
            {STUDY && <Link to={`/train?drill=id:${potd.id}`}>Drill it →</Link>}
            <Link to={`/?from=${potd.order}`}>Class from here →</Link>
          </p>
        </div>
        <PoseFigure pose={potd} size={110} />
      </section>

      <VedicCard key={vedicSky(now).moon.index} now={now} />
      <LibraryOfTheDay day={lens.day} />

      <div className="td-grid">
        <NoteCard note={lens.phaseNote} postures={leanPhase} eyebrow="By the moon" />
        <NoteCard note={lens.dayNote} postures={leanDay} eyebrow="By the day" />
      </div>

      <footer className="td-foot text-faint">
        <p>
          These are traditional associations, described as tradition. They never change the sequence, the
          class, or the cautions on a posture’s page{STUDY ? ', and the trainer’s own choice of what to drill always comes first' : ''}.
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
  const now = Date.now();
  const lens = todayLens(now);

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
          <Lens lens={lens} now={now} onDisable={() => toggle(false)} />
        ) : (
          <section className="card td-card td-optin">
            <h2 className="td-card-title">Off by default.</h2>
            <p className="text-soft">
              Turn it on and this page shows tonight’s moon phase, the planetary day, a posture of the day
              from the class (each of the 26 once every 26 days) and one from the library, and two short
              notes. It computes the sky here, offline — nothing is sent anywhere, and nothing about the
              class changes.
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
