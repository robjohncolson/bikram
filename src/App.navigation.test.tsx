import { Children } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import App from './App';

const pacerKeys = vi.hoisted(() => [] as (string | null)[]);
vi.mock('react-router-dom', async (original) => ({
  ...await original<typeof import('react-router-dom')>(),
  Routes: ({ children }: { children: ReactNode }) => {
    const routes = Children.toArray(children) as ReactElement<{ path: string; element: ReactElement }>[];
    pacerKeys.push(routes.find((route) => route.props.path === '/')!.props.element.key);
    return null;
  },
}));

it('preserves the Pacer element identity across query-only route changes', () => {
  pacerKeys.length = 0;
  for (const query of ['?program=short', '', '?from=4', '?figure=sprite']) {
    renderToStaticMarkup(<MemoryRouter initialEntries={[`/${query}`]}><App /></MemoryRouter>);
  }
  expect(new Set(pacerKeys).size).toBe(1);
});
