import { afterEach, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PoseDetail } from './PoseDetail';

// Run the page's effects in node; figure animation is outside this storage contract.
vi.mock('react', async (original) => ({
  ...await original<typeof import('react')>(),
  useEffect: (effect: () => void) => { effect(); },
}));
vi.mock('../components/useRestingBreath', () => ({ useRestingBreath: () => undefined }));
vi.mock('../components/PoseMotion', () => ({ PoseMotion: () => <span>Live figure</span> }));
afterEach(() => vi.unstubAllGlobals());

it('posture visits persist rig and clear sprite overrides while keeping one live figure', () => {
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  });
  vi.stubGlobal('window', { scrollTo: () => {} });
  for (const flag of ['rig', 'sprite']) {
    const html = renderToStaticMarkup(<MemoryRouter initialEntries={[`/pose/half-moon?figure=${flag}`]}>
      <Routes><Route path="/pose/:id" element={<PoseDetail />} /></Routes>
    </MemoryRouter>);
    expect(values.get('yoga-figure-v1')).toBe(flag === 'rig' ? 'rig' : undefined);
    expect(html.match(/Live figure/g)).toHaveLength(1);
  }
});
