import { describe, expect, it } from 'vitest';
import { MAX_ELEVATION, smoothstep } from '../rig';
import { KEY_TILT, KEY_TURN, LEVEL_VIEW, ORBIT_START, RESET_MS, createOrbit, dragOffset, isOffView, keyOffset, orbitReducer, resetAt, wrapAngle } from './useOrbit';
import type { OrbitState } from './useOrbit';

const DEG = Math.PI / 180;

describe('hand orbit math', () => {
  it('turns the figure 180° across the disc, following the finger', () => {
    const across = dragOffset(LEVEL_VIEW, 200, 0, 200);
    expect(Math.abs(across.azimuth)).toBeCloseTo(Math.PI, 12);
    // right drag = the camera goes the other way round
    expect(dragOffset(LEVEL_VIEW, 50, 0, 200).azimuth).toBeCloseTo(-45 * DEG, 12);
    // down drag = the camera rises over the figure
    expect(dragOffset(LEVEL_VIEW, 0, 20, 200).elevation).toBeCloseTo(18 * DEG, 12);
    // relative to where the drag began
    const start = { azimuth: 30 * DEG, elevation: -10 * DEG };
    const d = dragOffset(start, -20, -10, 200);
    expect(d.azimuth).toBeCloseTo(48 * DEG, 12);
    expect(d.elevation).toBeCloseTo(-19 * DEG, 12);
  });

  it('clamps the tilt to ±60° and folds the turn into (-180°, 180°]', () => {
    expect(dragOffset(LEVEL_VIEW, 0, 1000, 200).elevation).toBe(MAX_ELEVATION);
    expect(dragOffset(LEVEL_VIEW, 0, -1000, 200).elevation).toBe(-MAX_ELEVATION);
    expect(wrapAngle(Math.PI)).toBeCloseTo(Math.PI, 12);
    expect(wrapAngle(-Math.PI)).toBeCloseTo(Math.PI, 12);
    expect(wrapAngle(3 * Math.PI + 0.1)).toBeCloseTo(-Math.PI + 0.1, 12);
    expect(wrapAngle(-200 * DEG)).toBeCloseTo(160 * DEG, 12);
    const far = dragOffset(LEVEL_VIEW, 700, 0, 200);
    expect(far.azimuth).toBeGreaterThan(-Math.PI);
    expect(far.azimuth).toBeLessThanOrEqual(Math.PI);
  });

  it('orbits 15° and tilts 10° a key, 0 and Home reset', () => {
    expect(KEY_TURN).toBeCloseTo(15 * DEG, 12);
    expect(KEY_TILT).toBeCloseTo(10 * DEG, 12);
    expect(keyOffset(LEVEL_VIEW, 'ArrowRight')).toEqual({ azimuth: -KEY_TURN, elevation: 0 });
    expect(keyOffset(LEVEL_VIEW, 'ArrowLeft')).toEqual({ azimuth: KEY_TURN, elevation: 0 });
    expect(keyOffset(LEVEL_VIEW, 'ArrowUp')).toEqual({ azimuth: 0, elevation: KEY_TILT });
    expect(keyOffset(LEVEL_VIEW, 'ArrowDown')).toEqual({ azimuth: 0, elevation: -KEY_TILT });
    expect(keyOffset({ azimuth: 0, elevation: 55 * DEG }, 'ArrowUp')).toEqual({ azimuth: 0, elevation: MAX_ELEVATION });
    expect(keyOffset(LEVEL_VIEW, '0')).toBe('reset');
    expect(keyOffset(LEVEL_VIEW, 'Home')).toBe('reset');
    expect(keyOffset(LEVEL_VIEW, 'a')).toBeUndefined();
    expect(keyOffset(LEVEL_VIEW, 'Tab')).toBeUndefined();
  });

  it('eases a reset back over 400 ms with smoothstep, ending exactly level', () => {
    const from = { azimuth: 90 * DEG, elevation: -40 * DEG };
    expect(RESET_MS).toBe(400);
    expect(resetAt(from, 0)).toEqual(from);
    const mid = resetAt(from, 100);
    expect(mid.azimuth).toBeCloseTo(90 * DEG * (1 - smoothstep(0.25)), 12);
    expect(mid.elevation).toBeCloseTo(-40 * DEG * (1 - smoothstep(0.25)), 12);
    expect(resetAt(from, 200).azimuth).toBeCloseTo(45 * DEG, 12);
    expect(resetAt(from, RESET_MS)).toEqual(LEVEL_VIEW);
    expect(isOffView(resetAt(from, 1000))).toBe(false);
    expect(isOffView(from)).toBe(true);
    expect(isOffView(LEVEL_VIEW)).toBe(false);
  });
});

/** The disc, as far as the orbit sees it: events, a width, pointer capture. */
class FakeDisc extends EventTarget {
  clientWidth = 200;
  captured = new Set<number>();
  refuseCapture = false;
  setPointerCapture(id: number) {
    if (this.refuseCapture) throw new Error('InvalidPointerId');
    this.captured.add(id);
  }
  releasePointerCapture(id: number) {
    this.captured.delete(id);
  }
}

function pointer(type: string, id: number, x: number, y: number, extra: Record<string, unknown> = {}): Event {
  return Object.assign(new Event(type), { pointerId: id, clientX: x, clientY: y, button: 0, pointerType: 'touch', ...extra });
}

function key(k: string): Event {
  return Object.assign(new Event('keydown', { cancelable: true }), { key: k });
}

/** A mounted orbit on a fake disc with a hand-cranked clock and frame queue. */
function mount({ reduced = false, refuseCapture = false } = {}) {
  let clock = 1000;
  const frames = new Map<number, (t: number) => void>();
  let nextId = 1;
  const changes: OrbitState[] = [];
  const orbit = createOrbit({
    reduced: () => reduced,
    onChange: (s) => changes.push(s),
    now: () => clock,
    raf: (cb) => {
      frames.set(nextId, cb);
      return nextId++;
    },
    caf: (id) => frames.delete(id),
  });
  const disc = new FakeDisc();
  disc.refuseCapture = refuseCapture;
  const detach = orbit.attach(disc);
  const fire = (e: Event) => disc.dispatchEvent(e);
  /** run the frames due, `ms` later */
  const advance = (ms: number) => {
    clock += ms;
    const due = [...frames.values()];
    frames.clear();
    for (const cb of due) cb(clock);
  };
  return { orbit, disc, detach, fire, advance, frames, changes };
}

describe('hand orbit session (one owner of the view)', () => {
  it('Home during a drag ends it; the held pointer moves nothing during or after the reset', () => {
    const m = mount();
    m.fire(pointer('pointerdown', 1, 100, 100));
    expect(m.disc.captured.has(1)).toBe(true);
    m.fire(pointer('pointermove', 1, 150, 100));
    expect(m.orbit.state.offset.azimuth).toBeCloseTo(-45 * DEG, 12);
    // Home mid-drag: the drag ends (capture released) and the reset eases
    m.fire(key('Home'));
    expect(m.orbit.state.drag).toBeUndefined();
    expect(m.disc.captured.has(1)).toBe(false);
    expect(m.orbit.state.ease).toBeDefined();
    // the still-held pointer moves DURING the reset: ignored, the ease alone writes
    m.advance(100);
    const during = m.orbit.state.offset.azimuth;
    expect(during).toBeCloseTo(-45 * DEG * (1 - smoothstep(0.25)), 12);
    m.fire(pointer('pointermove', 1, 190, 140));
    expect(m.orbit.state.offset.azimuth).toBe(during);
    // and AFTER it: still nothing, the view stays level
    m.advance(400);
    expect(m.orbit.state).toEqual({ offset: LEVEL_VIEW });
    expect(m.frames.size).toBe(0);
    m.fire(pointer('pointermove', 1, 20, 20));
    m.fire(pointer('pointerup', 1, 20, 20));
    expect(m.orbit.state).toEqual({ offset: LEVEL_VIEW });
  });

  it('0 during a drag resets too', () => {
    const m = mount();
    m.fire(pointer('pointerdown', 1, 100, 100));
    m.fire(pointer('pointermove', 1, 100, 140));
    expect(m.orbit.state.offset.elevation).toBeCloseTo(36 * DEG, 12);
    m.fire(key('0'));
    expect(m.orbit.state.drag).toBeUndefined();
    m.advance(RESET_MS);
    expect(m.orbit.state.offset).toEqual(LEVEL_VIEW);
  });

  it('reduced motion: a reset during a drag is instant and the next move cannot undo it', () => {
    const m = mount({ reduced: true });
    m.fire(pointer('pointerdown', 1, 100, 100));
    m.fire(pointer('pointermove', 1, 160, 120));
    expect(isOffView(m.orbit.state.offset)).toBe(true);
    m.orbit.reset();
    expect(m.orbit.state).toEqual({ offset: LEVEL_VIEW });
    expect(m.disc.captured.size).toBe(0);
    expect(m.frames.size).toBe(0);
    m.fire(pointer('pointermove', 1, 180, 150));
    expect(m.orbit.state).toEqual({ offset: LEVEL_VIEW });
  });

  it('an arrow during a drag ends the drag and sticks', () => {
    const m = mount();
    m.fire(pointer('pointerdown', 1, 100, 100));
    m.fire(pointer('pointermove', 1, 120, 100));
    const before = m.orbit.state.offset;
    const k = key('ArrowUp');
    m.fire(k);
    expect(k.defaultPrevented).toBe(true);
    expect(m.orbit.state.drag).toBeUndefined();
    expect(m.orbit.state.offset).toEqual({ azimuth: before.azimuth, elevation: KEY_TILT });
    m.fire(pointer('pointermove', 1, 200, 200));
    expect(m.orbit.state.offset).toEqual({ azimuth: before.azimuth, elevation: KEY_TILT });
  });

  it('a new drag during a reset stops it where it is', () => {
    const m = mount();
    m.fire(key('ArrowLeft'));
    m.orbit.reset();
    m.advance(200);
    const mid = m.orbit.state.offset;
    expect(isOffView(mid)).toBe(true);
    m.fire(pointer('pointerdown', 2, 50, 50));
    expect(m.orbit.state.ease).toBeUndefined();
    expect(m.frames.size).toBe(0);
    m.fire(pointer('pointermove', 2, 50, 50));
    expect(m.orbit.state.offset).toEqual(mid);
  });

  it('pointercancel and lost capture end the session', () => {
    for (const type of ['pointercancel', 'lostpointercapture']) {
      const m = mount();
      m.fire(pointer('pointerdown', 7, 100, 100));
      m.fire(pointer('pointermove', 7, 110, 100));
      m.fire(pointer(type, 7, 110, 100));
      expect(m.orbit.state.drag).toBeUndefined();
      const held = m.orbit.state.offset;
      m.fire(pointer('pointermove', 7, 190, 190));
      expect(m.orbit.state.offset).toEqual(held);
    }
  });

  it('ignores other pointers and non-primary mouse buttons', () => {
    const m = mount();
    m.fire(pointer('pointerdown', 1, 100, 100, { pointerType: 'mouse', button: 2 }));
    expect(m.orbit.state.drag).toBeUndefined();
    m.fire(pointer('pointerdown', 1, 100, 100));
    m.fire(pointer('pointerdown', 2, 0, 0));
    m.fire(pointer('pointermove', 2, 150, 100));
    m.fire(pointer('pointerup', 2, 150, 100));
    expect(m.orbit.state.drag?.id).toBe(1);
    expect(m.orbit.state.offset).toEqual(LEVEL_VIEW);
  });

  it('no pointer capture, no drag: hovering later cannot turn the view', () => {
    const m = mount({ refuseCapture: true });
    m.fire(pointer('pointerdown', 1, 100, 100, { pointerType: 'mouse' }));
    expect(m.orbit.state.drag).toBeUndefined();
    m.fire(pointer('pointermove', 1, 180, 160, { pointerType: 'mouse' }));
    expect(m.orbit.state.offset).toEqual(LEVEL_VIEW);
  });

  it('detaching (unmount) removes every listener, ends the drag and stops the ease', () => {
    const m = mount();
    m.fire(pointer('pointerdown', 1, 100, 100));
    m.fire(pointer('pointermove', 1, 140, 100));
    m.detach();
    expect(m.orbit.state.drag).toBeUndefined();
    expect(m.disc.captured.size).toBe(0);
    const held = m.orbit.state.offset;
    const k = key('Home');
    m.fire(k);
    m.fire(pointer('pointerdown', 3, 0, 0));
    m.fire(pointer('pointermove', 3, 100, 100));
    expect(k.defaultPrevented).toBe(false);
    expect(m.orbit.state.offset).toEqual(held);

    const n = mount();
    n.fire(key('ArrowRight'));
    n.orbit.reset();
    expect(n.frames.size).toBe(1);
    n.detach();
    expect(n.frames.size).toBe(0);
  });

  it('hands back unchanged state for what is not its business', () => {
    expect(orbitReducer(ORBIT_START, { type: 'key', key: 'x', now: 0, reduced: false })).toBe(ORBIT_START);
    expect(orbitReducer(ORBIT_START, { type: 'reset', now: 0, reduced: false })).toBe(ORBIT_START);
    expect(orbitReducer(ORBIT_START, { type: 'tick', now: 5 })).toBe(ORBIT_START);
    expect(orbitReducer(ORBIT_START, { type: 'end', id: 1 })).toBe(ORBIT_START);
  });
});
