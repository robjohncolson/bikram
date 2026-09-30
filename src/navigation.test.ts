import { describe, expect, it } from 'vitest';
import { moreItems, navigationSection, studyRehearsal } from './navigation';

describe('practice-first navigation', () => {
  it('hides Study without losing Explore or Moon days and restores it when enabled', () => {
    expect(moreItems(false).map((item) => item.to)).toEqual(['/explore', '/today']);
    expect(moreItems(true).map((item) => item.to)).toEqual(['/explore', '/today', '/train']);
  });
  it('groups nested routes with their parent destination', () => {
    expect(navigationSection('/')).toBe('practice');
    expect(navigationSection('/pose/camel')).toBe('sequence');
    expect(navigationSection('/library/utthita-trikonasana')).toBe('library');
    for (const path of ['/explore', '/today', '/train/map']) expect(navigationSection(path)).toBe('more');
    expect(navigationSection('/missing')).toBeUndefined();
  });
  it('disables a previously saved rehearsal preference and restores it with Study', () => {
    expect(studyRehearsal(true, false)).toBe(false);
    expect(studyRehearsal(true, true)).toBe(true);
    expect(studyRehearsal(false, true)).toBe(false);
  });
});
