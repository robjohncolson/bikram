import { describe, expect, it } from 'vitest';
import { settleBlend, shownStage } from './useSheetPlayer';

describe('the library player: the stage named is the stage drawn', () => {
  it('names the nearer end of a travel when motion is allowed', () => {
    expect(shownStage({ from: 2, to: 3, t: 0.3 }, false)).toBe(2);
    expect(shownStage({ from: 2, to: 3, t: 0.5 }, false)).toBe(3);
    expect(shownStage({ from: 4, to: 4, t: 1 }, false)).toBe(4);
  });

  it('names the destination under reduced motion, where FigureRig snaps to it (t < 0.5 included)', () => {
    expect(shownStage({ from: 2, to: 3, t: 0.2 }, true)).toBe(3);
    expect(shownStage({ from: 7, to: 0, t: 0.1 }, true)).toBe(0);
  });

  it('settles a travel caught when reduced motion turns on onto the stage the figure shows', () => {
    const caught = { from: 2, to: 3, t: 0.25 };
    const held = settleBlend(caught);
    expect(held).toEqual({ from: 3, to: 3, t: 1 });
    expect(shownStage(held, false)).toBe(shownStage(caught, true));
    // a hold is left as it is (no new object, no re-render)
    const hold = { from: 1, to: 1, t: 1 };
    expect(settleBlend(hold)).toBe(hold);
  });
});
