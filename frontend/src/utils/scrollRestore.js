const STORAGE_PREFIX = 'voro_scroll:';

export function getScrollKey(pathname, search = '', hash = '') {
  return `${pathname}${search}${hash}`;
}

export function saveScrollPosition(key) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, String(window.scrollY));
}

export function readScrollPosition(key) {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);
  if (raw == null) return null;
  const y = parseInt(raw, 10);
  return Number.isNaN(y) ? null : y;
}

export function restoreScrollPosition(key) {
  const y = readScrollPosition(key);
  if (y == null) return false;

  const apply = () => window.scrollTo({ top: y, left: 0, behavior: 'auto' });
  apply();
  requestAnimationFrame(apply);
  setTimeout(apply, 50);
  setTimeout(apply, 150);
  return true;
}

export function navigateWithScrollSave(navigate, to, currentKey) {
  saveScrollPosition(currentKey);
  navigate(to);
}
