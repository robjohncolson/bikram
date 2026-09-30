import { STUDY } from './features';

export function moreItems(study = STUDY) {
  return [
    { to: '/explore', label: 'Explore' },
    { to: '/today', label: 'Moon days' },
    ...(study ? [{ to: '/train', label: 'Study' }] : []),
  ];
}

export function navigationSection(path: string): 'practice' | 'sequence' | 'library' | 'more' | undefined {
  if (path === '/' || path === '/pace') return 'practice';
  if (path === '/sequence' || path.startsWith('/pose/')) return 'sequence';
  if (path === '/library' || path.startsWith('/library/')) return 'library';
  if (['/explore', '/today', '/train'].some((route) => path === route || path.startsWith(`${route}/`))) return 'more';
  return undefined;
}

/** Keep the stored preference intact while study is hidden. */
export function studyRehearsal(saved: boolean, study = STUDY): boolean {
  return study && saved;
}

/** Figure flags do not change the chosen class. */
export function pacerQuery(search: string): string {
  const query = new URLSearchParams(search);
  const selection = new URLSearchParams();
  for (const key of ['program', 'from', 'build']) {
    const value = query.get(key);
    if (value !== null) selection.set(key, value);
  }
  return selection.toString();
}

export function shouldBlockClassNavigation(active: boolean, currentPath: string, nextPath: string): boolean {
  return active && currentPath !== nextPath;
}
