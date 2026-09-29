import { describe, expect, it } from 'vitest';
import { tempoOf } from './tempo';

describe('tempoOf', () => {
  it('reads slow motion as a move that spans the line', () => {
    const t = tempoOf('Part three: heels up, knees together, and lower in slow motion until you hover just above the heels.');
    expect(t.kind).toBe('slow');
    expect(t.starts).toBe('line-start');
    expect(t.over!({ clipSeconds: 4, barSeconds: 6 })).toBe(5.5);
    expect(tempoOf('round forward slowly until the crown touches the floor').kind).toBe('slow');
  });

  it('reads one motion, dive and kick as a snap after the line', () => {
    expect(tempoOf('In one motion, sit up — arms swinging forward past the ears.')).toMatchObject({ kind: 'quick', starts: 'line-end' });
    expect(tempoOf('Dive forward, take hold of the big toes').kind).toBe('quick');
    expect(tempoOf('Begin kicking the right leg back and up').kind).toBe('quick');
    expect(tempoOf('kick').over!({ clipSeconds: 3, barSeconds: 6 })).toBe(0.35);
  });

  it('rides the next inhale for lifts on an inhale, even when they are also one motion', () => {
    const t = tempoOf('On an inhale, lift arms, head, chest, and legs off the floor in one motion.');
    expect(t).toMatchObject({ kind: 'inhale', starts: 'next-inhale' });
    expect(t.over!({ clipSeconds: 3, barSeconds: 6 })).toBe(3);
    expect(tempoOf('Look up toward the ceiling, then inhale and curl the chest off the floor.').kind).toBe('inhale');
  });

  it('leaves ordinary lines at sheet speed after the line', () => {
    expect(tempoOf('Place your hands on the back of your hips.')).toEqual({ kind: 'normal', starts: 'line-end' });
  });
});
