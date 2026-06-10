const STORAGE_PREFIX = 'voro_scroll:';
const PENDING_RESTORE_PREFIX = 'voro_scroll_pending:';

/** Pinned Y survives route transitions (ScrollRestoration used to overwrite with 0) */
const pinnedScrollY = {};

let scrollSaveLocked = false;

export function getScrollKey(pathname, search = '', hash = '') {
  return `${pathname}${search}${hash}`;
}

export function isScrollSaveLocked() {
  return scrollSaveLocked;
}

export function readScrollPosition(key) {
  if (typeof window === 'undefined') return null;
  if (Object.prototype.hasOwnProperty.call(pinnedScrollY, key)) {
    return pinnedScrollY[key];
  }
  const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);
  if (raw == null) return null;
  const y = parseInt(raw, 10);
  return Number.isNaN(y) ? null : y;
}

export function saveScrollPosition(key) {
  if (typeof window === 'undefined') return;
  if (scrollSaveLocked) return;
  if (Object.prototype.hasOwnProperty.call(pinnedScrollY, key)) return;
  sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, String(window.scrollY));
}

export function pinScrollPosition(key, y) {
  pinnedScrollY[key] = y;
  sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, String(y));
}

export function releasePinnedScrollPosition(key) {
  delete pinnedScrollY[key];
}

export function markPendingScrollRestore(key) {
  sessionStorage.setItem(`${PENDING_RESTORE_PREFIX}${key}`, '1');
}

export function hasPendingScrollRestore(key) {
  return sessionStorage.getItem(`${PENDING_RESTORE_PREFIX}${key}`) === '1';
}

export function clearPendingScrollRestore(key) {
  sessionStorage.removeItem(`${PENDING_RESTORE_PREFIX}${key}`);
}

export function consumePendingScrollRestore(key) {
  if (hasPendingScrollRestore(key)) {
    clearPendingScrollRestore(key);
    return true;
  }
  return false;
}

/** Restore scroll with retries + ResizeObserver — waits for images/sections to load */
export function restoreScrollPosition(key, options = {}) {
  const y = readScrollPosition(key);
  if (y == null || y <= 0) {
    releasePinnedScrollPosition(key);
    options.onComplete?.(false);
    return null;
  }

  const intervalMs = options.intervalMs ?? 80;
  const stableChecks = options.stableChecks ?? 4;
  const maxDurationMs = options.maxDurationMs ?? 12000;
  const html = document.documentElement;
  const prevBehavior = html.style.scrollBehavior;

  scrollSaveLocked = true;
  let cancelled = false;
  let timerId = null;
  let resizeObserver = null;
  let stableCount = 0;
  const startedAt = Date.now();

  const finish = (success) => {
    if (cancelled) return;
    cancelled = true;
    if (timerId) clearInterval(timerId);
    if (resizeObserver) resizeObserver.disconnect();
    html.style.scrollBehavior = prevBehavior;
    scrollSaveLocked = false;
    clearPendingScrollRestore(key);
    if (success) {
      releasePinnedScrollPosition(key);
    }
    options.onComplete?.(success);
  };

  const apply = () => {
    if (cancelled) return;

    html.style.scrollBehavior = 'auto';
    window.scrollTo(0, y);

    const closeEnough = Math.abs(window.scrollY - y) < 8;
    const docHeight = document.documentElement.scrollHeight;
    const canReach = docHeight >= y + window.innerHeight * 0.2;

    if (closeEnough && canReach) {
      stableCount += 1;
      if (stableCount >= stableChecks) {
        finish(true);
      }
      return;
    }

    stableCount = 0;
    if (Date.now() - startedAt >= maxDurationMs) {
      finish(closeEnough);
    }
  };

  apply();
  requestAnimationFrame(apply);
  timerId = setInterval(apply, intervalMs);

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      stableCount = 0;
      apply();
    });
    resizeObserver.observe(document.documentElement);
    if (document.body) resizeObserver.observe(document.body);
  }

  return () => {
    cancelled = true;
    if (timerId) clearInterval(timerId);
    if (resizeObserver) resizeObserver.disconnect();
    html.style.scrollBehavior = prevBehavior;
    scrollSaveLocked = false;
  };
}

export function navigateWithScrollSave(navigate, to, currentKey) {
  pinScrollPosition(currentKey, window.scrollY);
  markPendingScrollRestore(currentKey);
  navigate(to);
}
