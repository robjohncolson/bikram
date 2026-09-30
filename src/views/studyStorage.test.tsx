import { afterEach, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { STUDY } from '../features';
import { FULL_CLASS } from '../pacer';
import { Pacer } from './Pacer';
import { CoachDebrief } from './CoachDebrief';

afterEach(() => vi.unstubAllGlobals());

it.each(['pacer', 'coach'])('%s does not read or migrate trainer storage with Study off', (view) => {
  expect(STUDY).toBe(false);
  const storage = {
    getItem: vi.fn((key: string) => key === 'yoga-trainer-v1' ? JSON.stringify({ version: 1, cards: {} }) : null),
    setItem: vi.fn(), removeItem: vi.fn(),
  };
  vi.stubGlobal('localStorage', storage);
  vi.stubGlobal('window', { localStorage: storage, location: { search: '' } });
  renderToStaticMarkup(<MemoryRouter>{view === 'pacer'
    ? <Pacer />
    : <CoachDebrief program={FULL_CLASS} beatsPerBar={6} onAdopt={() => {}} />}</MemoryRouter>);
  expect(storage.getItem.mock.calls.flat()).not.toContain('yoga-trainer-v1');
  expect(storage.getItem.mock.calls.flat()).not.toContain('yoga-trainer-v2');
  expect(storage.setItem).not.toHaveBeenCalled();
});
