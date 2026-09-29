/**
 * The hand orbit on a posture page's live figure: drag the disc (mouse,
 * touch, pen) or use the arrow keys to turn and tilt the view. The result
 * is an OFFSET added to the sheet's authored camera (`rig/camera.ts
 * withOffset`), so the demonstration's own orbits still play under it and
 * it survives stage changes and chip scrubs — only `reset` clears it.
 * No inertia: the view stops when the pointer stops. The math and the
 * state machine (`orbitReducer`) are pure; `createOrbit` wires events to
 * the reducer (the one owner of the offset); the hook only mounts it.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { clampElevation, smoothstep } from '../rig';
import type { ViewOffset } from '../rig';

export const LEVEL_VIEW: ViewOffset = { azimuth: 0, elevation: 0 };
/** a drag across the disc's whole width turns the figure half way round */
export const DRAG_TURN = Math.PI;
/** per arrow press: a turn, a tilt */
export const KEY_TURN = (15 * Math.PI) / 180;
export const KEY_TILT = (10 * Math.PI) / 180;
export const RESET_MS = 400;
/** below this (radians) the view counts as the authored one */
const EPS = 1e-6;

/** An angle folded into (-π, π], so a reset always turns the short way back. */
export function wrapAngle(a: number): number {
  const w = a - 2 * Math.PI * Math.floor((a + Math.PI) / (2 * Math.PI));
  return w === -Math.PI ? Math.PI : w;
}

/**
 * The offset `dx`/`dy` px of drag after the pointer went down on `start`,
 * over a disc `width` px across. The figure follows the finger: dragging
 * right turns its front to the right (the camera goes the other way), and
 * dragging down tips its top toward you (the camera rises over it).
 */
export function dragOffset(start: ViewOffset, dx: number, dy: number, width: number): ViewOffset {
  const perPx = DRAG_TURN / Math.max(1, width);
  return {
    azimuth: wrapAngle(start.azimuth - dx * perPx),
    elevation: clampElevation(start.elevation + dy * perPx),
  };
}

/**
 * What a key does to the view: arrows turn by `KEY_TURN` (right = as a
 * drag to the right) and tilt by `KEY_TILT` (up = the camera rises);
 * `0` and Home reset; anything else is not ours.
 */
export function keyOffset(cur: ViewOffset, key: string): ViewOffset | 'reset' | undefined {
  switch (key) {
    case 'ArrowLeft':
      return { azimuth: wrapAngle(cur.azimuth + KEY_TURN), elevation: cur.elevation };
    case 'ArrowRight':
      return { azimuth: wrapAngle(cur.azimuth - KEY_TURN), elevation: cur.elevation };
    case 'ArrowUp':
      return { azimuth: cur.azimuth, elevation: clampElevation(cur.elevation + KEY_TILT) };
    case 'ArrowDown':
      return { azimuth: cur.azimuth, elevation: clampElevation(cur.elevation - KEY_TILT) };
    case '0':
    case 'Home':
      return 'reset';
    default:
      return undefined;
  }
}

/** The view `ms` into an eased reset from `from` (smoothstep over `RESET_MS`); exactly level at the end. */
export function resetAt(from: ViewOffset, ms: number, duration = RESET_MS): ViewOffset {
  if (ms >= duration) return LEVEL_VIEW;
  const k = 1 - smoothstep(ms / duration);
  return { azimuth: from.azimuth * k, elevation: from.elevation * k };
}

/** Is the view off the authored one? */
export function isOffView(o: ViewOffset): boolean {
  return Math.abs(o.azimuth) > EPS || Math.abs(o.elevation) > EPS;
}

/** A pointer turning the view: which pointer, where it went down, the disc's width, the view it grabbed. */
export interface DragSession {
  id: number;
  x: number;
  y: number;
  width: number;
  start: ViewOffset;
}

/**
 * The whole orbit, one owner: the offset, the drag holding it (if any)
 * and the eased reset (if any). At most one of `drag`/`ease` is set.
 */
export interface OrbitState {
  offset: ViewOffset;
  drag?: DragSession;
  ease?: { from: ViewOffset; t0: number };
}

export type OrbitEvent =
  | { type: 'down'; id: number; x: number; y: number; width: number; button: number; pointerType: string }
  | { type: 'move'; id: number; x: number; y: number }
  /** pointerup, pointercancel, lost capture — or capture that could not be taken */
  | { type: 'end'; id: number }
  | { type: 'key'; key: string; now: number; reduced: boolean }
  | { type: 'reset'; now: number; reduced: boolean }
  | { type: 'tick'; now: number };

export const ORBIT_START: OrbitState = { offset: LEVEL_VIEW };

/**
 * Every change to the view goes through here. A key or a reset during a
 * drag ENDS the drag rather than rebasing it: the explicit command wins,
 * and the still-held pointer owns nothing until it is pressed again — a
 * rebased drag would start moving the view again on its next pixel,
 * mid-ease, or straight after an instant reduced-motion reset.
 * Unchanged state is returned as-is (so a caller can tell "not ours").
 */
export function orbitReducer(s: OrbitState, e: OrbitEvent): OrbitState {
  switch (e.type) {
    case 'down':
      if (s.drag || (e.pointerType === 'mouse' && e.button !== 0)) return s;
      // grabbing the figure stops a reset where it is
      return { offset: s.offset, drag: { id: e.id, x: e.x, y: e.y, width: e.width, start: s.offset } };
    case 'move':
      if (!s.drag || e.id !== s.drag.id) return s;
      return { offset: dragOffset(s.drag.start, e.x - s.drag.x, e.y - s.drag.y, s.drag.width), drag: s.drag };
    case 'end':
      if (!s.drag || e.id !== s.drag.id) return s;
      return { offset: s.offset };
    case 'key': {
      const next = keyOffset(s.offset, e.key);
      if (!next) return s;
      if (next === 'reset') return orbitReducer(s, { type: 'reset', now: e.now, reduced: e.reduced });
      return { offset: next };
    }
    case 'reset':
      if (!isOffView(s.offset)) return s.drag || s.ease ? { offset: s.offset } : s;
      if (e.reduced) return { offset: LEVEL_VIEW };
      return { offset: s.offset, ease: { from: s.offset, t0: e.now } };
    case 'tick': {
      if (!s.ease) return s;
      const o = resetAt(s.ease.from, e.now - s.ease.t0);
      return isOffView(o) ? { offset: o, ease: s.ease } : { offset: LEVEL_VIEW };
    }
  }
}

/** The element the orbit listens on (the disc); an `EventTarget` stand-in works in tests. */
export interface OrbitHost extends EventTarget {
  readonly clientWidth: number;
  setPointerCapture(id: number): void;
  releasePointerCapture(id: number): void;
}

export interface OrbitControllerOptions {
  reduced: () => boolean;
  onChange: (s: OrbitState) => void;
  now?: () => number;
  raf?: (cb: (now: number) => void) => number;
  caf?: (id: number) => void;
}

/**
 * The orbit's event wiring, outside React so the tests can mount it on a
 * plain `EventTarget`: `attach` listens on the disc and returns the
 * detach; `reset` is the button. The only side effects besides the state
 * are pointer capture (taken on down, released when the reducer ends a
 * drag) and the easing frame (scheduled while `ease` is set).
 */
export function createOrbit(opts: OrbitControllerOptions) {
  const now = opts.now ?? (() => performance.now());
  const raf = opts.raf ?? ((cb) => requestAnimationFrame(cb));
  const caf = opts.caf ?? ((id) => cancelAnimationFrame(id));
  let state = ORBIT_START;
  let frame = 0;
  let host: OrbitHost | undefined;

  const tick = (t: number) => {
    frame = 0;
    dispatch({ type: 'tick', now: t });
  };
  const schedule = () => {
    if (state.ease && !frame) frame = raf(tick);
    if (!state.ease && frame) {
      caf(frame);
      frame = 0;
    }
  };
  function dispatch(e: OrbitEvent): boolean {
    const prev = state;
    const next = orbitReducer(prev, e);
    if (next === prev) return false;
    state = next;
    if (prev.drag && next.drag !== prev.drag && host) {
      try {
        host.releasePointerCapture(prev.drag.id);
      } catch {
        /* already released (pointerup does it) */
      }
    }
    schedule();
    opts.onChange(state);
    return true;
  }

  const onDown = (ev: Event) => {
    const e = ev as PointerEvent;
    const el = host;
    if (!el) return;
    dispatch({ type: 'down', id: e.pointerId, x: e.clientX, y: e.clientY, width: el.clientWidth, button: e.button, pointerType: e.pointerType });
    if (state.drag?.id !== e.pointerId) return;
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      // without capture a release outside the disc would never reach us and
      // later hovering would turn the view: no drag at all
      dispatch({ type: 'end', id: e.pointerId });
    }
  };
  const onMove = (ev: Event) => {
    const e = ev as PointerEvent;
    dispatch({ type: 'move', id: e.pointerId, x: e.clientX, y: e.clientY });
  };
  const onEnd = (ev: Event) => {
    dispatch({ type: 'end', id: (ev as PointerEvent).pointerId });
  };
  const onKey = (ev: Event) => {
    const e = ev as KeyboardEvent;
    if (e.altKey || e.ctrlKey || e.metaKey || keyOffset(state.offset, e.key) === undefined) return;
    e.preventDefault(); // the arrows would scroll the page
    dispatch({ type: 'key', key: e.key, now: now(), reduced: opts.reduced() });
  };
  const events: [string, (ev: Event) => void][] = [
    ['pointerdown', onDown],
    ['pointermove', onMove],
    ['pointerup', onEnd],
    ['pointercancel', onEnd],
    ['lostpointercapture', onEnd],
    ['keydown', onKey],
  ];

  return {
    get state() {
      return state;
    },
    reset() {
      dispatch({ type: 'reset', now: now(), reduced: opts.reduced() });
    },
    attach(el: OrbitHost): () => void {
      host = el;
      for (const [name, fn] of events) el.addEventListener(name, fn);
      schedule(); // a reset interrupted by a detach carries on
      return () => {
        for (const [name, fn] of events) el.removeEventListener(name, fn);
        if (state.drag) dispatch({ type: 'end', id: state.drag.id });
        if (frame) caf(frame);
        frame = 0;
        if (host === el) host = undefined;
      };
    },
  };
}

export interface Orbit {
  offset: ViewOffset;
  /** off the authored view (the reset button shows) */
  off: boolean;
  /** a pointer is down and turning the view */
  dragging: boolean;
  /** back to the authored view: eased, or instant under reduced motion */
  reset: () => void;
}

/**
 * The orbit on `ref` (the figure disc) while `enabled`. The page is never
 * scrolled by a drag (the disc sets `touch-action: none` while orbitable).
 */
export function useOrbit(ref: RefObject<HTMLElement | null>, { enabled, reduced }: { enabled: boolean; reduced: boolean }): Orbit {
  const [state, setState] = useState<OrbitState>(ORBIT_START);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const [orbit] = useState(() => createOrbit({ reduced: () => reducedRef.current, onChange: setState }));

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    return orbit.attach(el);
  }, [ref, enabled, orbit]);

  const reset = useCallback(() => orbit.reset(), [orbit]);
  return { offset: state.offset, off: isOffView(state.offset), dragging: Boolean(state.drag), reset };
}
