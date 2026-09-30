import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './App';
import { poses } from './data';

function page(path: string) {
  return renderToStaticMarkup(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
    .replace(/<[^>]*>/g, '');
}

describe('sequence routes', () => {
  it.each(['/nothing', '/pose', '/pose/', '/pose/missing'])('renders a useful not-found page at %s', (path) => {
    const text = page(path);
    expect(text).toContain('not found');
    expect(text).toContain(poses[0].englishName);
    expect(text).toContain(poses.at(-1)!.englishName);
    expect(text).toContain('Back to the sequence');
  });

  it.each([poses[0], poses.at(-1)!])('labels breathing item $order using sequence data', (pose) => {
    expect(page(`/pose/${pose.id}`)).toContain(`Item ${pose.order} of ${poses.length}`);
  });
});
