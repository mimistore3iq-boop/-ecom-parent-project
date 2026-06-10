const STORAGE_PREFIX = 'voro_scroll:';
const PENDING_RESTORE_PREFIX = 'voro_scroll_pending:';

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

export function markPendingScrollRestore(key) {
  sessionStorage.setItem(`${PENDING_RESTORE_PREFIX}${key}`, '1');
}

export function consumePendingScrollRestore(key) {
  const flag = sessionStorage.getItem(`${PENDING_RESTORE_PREFIX}${key}`);
  if (flag) {
    sessionStorage.removeItem(`${PENDING_RESTORE_PREFIX}${key}`);
    return true;
  }
  return false;
}

/** Restore scroll with retries — needed after async content/images load */
export function restoreScrollPosition(key, options = {}) {
  const y = readScrollPosition(key);
  if (y == null) return null;

  const maxAttempts = options.maxAttempts ?? 20;
  const intervalMs = options.intervalMs ?? 150;
  const html = document.documentElement;
  const prevBehavior = html.style.scrollBehavior;

  let attempts = 0;
  let timerId = null;

  const apply = () => {
    html.style.scrollBehavior = 'auto';
    window.scrollTo(0, y);
    attempts += 1;

    const closeEnough = Math.abs(window.scrollY - y) < 8;
    const docHeight = document.documentElement.scrollHeight;
    const canReach = docHeight >= y + window.innerHeight * 0.25;

    if ((closeEnough && canReach) || attempts >= maxAttempts) {
      if (timerId) clearInterval(timerId);
      html.style.scrollBehavior = prevBehavior;
    }
  };

  apply();
  requestAnimationFrame(apply);
  timerId = setInterval(apply, intervalMs);

  return () => {
    if (timerId) clearInterval(timerId);
    html.style.scrollBehavior = prevBehavior;
  };
}

export function navigateWithScrollSave(navigate, to, currentKey) {
  saveScrollPosition(currentKey);
  markPendingScrollRestore(currentKey);
  navigate(to);
}
