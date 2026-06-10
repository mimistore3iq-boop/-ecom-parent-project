import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import {
  getScrollKey,
  hasPendingScrollRestore,
  restoreScrollPosition,
  saveScrollPosition,
} from '../utils/scrollRestore';

export default function ScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const scrollKey = getScrollKey(location.pathname, location.search, location.hash);
  const cancelRestoreRef = useRef(null);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useLayoutEffect(() => {
    if (cancelRestoreRef.current) {
      cancelRestoreRef.current();
      cancelRestoreRef.current = null;
    }

    if (navigationType === 'PUSH' && location.pathname.startsWith('/product/')) {
      window.scrollTo(0, 0);
      return undefined;
    }

    const shouldRestore =
      location.pathname === '/' && hasPendingScrollRestore(scrollKey);

    if (shouldRestore) {
      cancelRestoreRef.current = restoreScrollPosition(scrollKey, {
        intervalMs: 80,
        stableChecks: 4,
        maxDurationMs: 12000,
      });
    }

    return () => {
      if (cancelRestoreRef.current) {
        cancelRestoreRef.current();
        cancelRestoreRef.current = null;
      }
    };
  }, [scrollKey, navigationType, location.pathname]);

  useEffect(() => {
    const onScroll = () => saveScrollPosition(scrollKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrollKey]);

  return null;
}
