const STORAGE_PREFIX = 'voro_scroll:';
const PENDING_RESTORE_PREFIX = 'voro_scroll_pending:';
const CAROUSEL_CONTEXT_PREFIX = 'voro_carousel:';

/** Pinned Y survives route transitions (ScrollRestoration used to overwrite with 0) */
const pinnedScrollY = {};
/** Pinned carousel context: which category row + product the user opened */
const pinnedCarouselContext = {};

let scrollSaveLocked = false;

export function getScrollKey(pathname, search = '', hash = '') {
  return `${pathname}${search}${hash}`;
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

/** Restore scroll with retries + ResizeObserver — waits for images/sections to load */
export function restoreScrollPosition(key, options = {}) {
  const y = readScrollPosition(key);
  const hasCarousel = hasPinnedCarouselContext(key);

  if ((y == null || y <= 0) && !hasCarousel) {
    releasePinnedScrollPosition(key);
    options.onComplete?.(false);
    return null;
  }

  if (y == null || y <= 0) {
    clearPendingScrollRestore(key);
    releasePinnedScrollPosition(key);
    const cancelCarousel = restoreCarouselContext(key, options.carousel);
    options.onComplete?.(true);
    return cancelCarousel;
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

  let cancelCarousel = null;

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
    if (success && hasCarousel) {
      requestAnimationFrame(() => {
        cancelCarousel = restoreCarouselContext(key, options.carousel);
      });
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
    if (cancelCarousel) cancelCarousel();
    html.style.scrollBehavior = prevBehavior;
    scrollSaveLocked = false;
  };
}

export function pinCarouselContext(key, context) {
  if (!context?.categoryId || !context?.productId) return;
  pinnedCarouselContext[key] = {
    categoryId: String(context.categoryId),
    productId: String(context.productId),
  };
  sessionStorage.setItem(
    `${CAROUSEL_CONTEXT_PREFIX}${key}`,
    JSON.stringify(pinnedCarouselContext[key])
  );
}

export function readCarouselContext(key) {
  if (Object.prototype.hasOwnProperty.call(pinnedCarouselContext, key)) {
    return pinnedCarouselContext[key];
  }
  const raw = sessionStorage.getItem(`${CAROUSEL_CONTEXT_PREFIX}${key}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function hasPinnedCarouselContext(key) {
  return readCarouselContext(key) != null;
}

export function releasePinnedCarouselContext(key) {
  delete pinnedCarouselContext[key];
  sessionStorage.removeItem(`${CAROUSEL_CONTEXT_PREFIX}${key}`);
}

/** Scroll the category row so the product the user opened stays in view */
export function restoreCarouselContext(key, options = {}) {
  const ctx = readCarouselContext(key);
  if (!ctx) return null;

  const intervalMs = options.intervalMs ?? 100;
  const maxAttempts = options.maxAttempts ?? 40;
  let attempts = 0;
  let timerId = null;

  const tryRestore = () => {
    const carousel = document.querySelector(
      `[data-category-carousel="${ctx.categoryId}"]`
    );
    const productEl = carousel?.querySelector(
      `[data-product-id="${ctx.productId}"]`
    );

    if (!carousel || !productEl) return false;

    carousel.style.scrollBehavior = 'auto';
    productEl.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
    carousel.style.scrollBehavior = '';
    releasePinnedCarouselContext(key);
    return true;
  };

  const finishCleanup = () => {
    if (timerId) clearInterval(timerId);
  };

  if (tryRestore()) return finishCleanup;

  timerId = setInterval(() => {
    attempts += 1;
    if (tryRestore() || attempts >= maxAttempts) {
      if (attempts >= maxAttempts) releasePinnedCarouselContext(key);
      finishCleanup();
    }
  }, intervalMs);

  return finishCleanup;
}

export function navigateWithScrollSave(navigate, to, currentKey, carouselContext = null) {
  pinScrollPosition(currentKey, window.scrollY);
  if (carouselContext) {
    pinCarouselContext(currentKey, carouselContext);
  }
  markPendingScrollRestore(currentKey);
  navigate(to);
}
