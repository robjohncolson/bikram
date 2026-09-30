import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PoseDetail } from './PoseDetail';

const features = vi.hoisted(() => ({ STUDY: false }));
vi.mock('../features', () => features);

function renderPose() {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={['/pose/half-moon']}>
      <Routes><Route path="/pose/:id" element={<PoseDetail />} /></Routes>
    </MemoryRouter>,
  );
}

describe('posture practice surfaces', () => {
  beforeEach(() => { features.STUDY = false; });

  it('hides drills and memory status with study off, keeping class entry', () => {
    const html = renderPose();
    expect(html).not.toContain('/train?drill=');
    expect(html).not.toContain('memory ·');
    expect(html).not.toContain('hand-off ·');
    expect(html).toContain('href="/?from=2"');
  });

  it('restores both drills and memory status with study on', () => {
    features.STUDY = true;
    const html = renderPose();
    expect(html).toContain('/train?drill=id:half-moon');
    expect(html).toContain('/train?drill=tr:2');
    expect(html).toContain('memory ·');
    expect(html).toContain('hand-off ·');
    expect(html).toContain('href="/?from=2"');
  });

  it('keeps cautions before the closed classical disclosure and its anchor', () => {
    const html = renderPose();
    expect(html.indexOf('Cautions')).toBeLessThan(html.indexOf('<details'));
    expect(html).toContain('<summary id="pd-classical-h">');
    expect(html).not.toMatch(/<details[^>]*\sopen/);
  });
});
