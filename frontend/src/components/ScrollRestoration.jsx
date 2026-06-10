import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import {
  getScrollKey,
  restoreScrollPosition,
  saveScrollPosition,
} from '../utils/scrollRestore';

/**
 * Saves scroll per route; restores on browser back (POP).
 */
export default function ScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const scrollKey = getScrollKey(location.pathname, location.search, location.hash);
  const prevKeyRef = useRef(scrollKey);

  useEffect(() => {
    if (navigationType === 'POP') {
      restoreScrollPosition(scrollKey);
    } else if (navigationType === 'PUSH' && location.pathname.startsWith('/product/')) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [scrollKey, navigationType, location.pathname]);

  useEffect(() => {
    const prevKey = prevKeyRef.current;
    if (prevKey && prevKey !== scrollKey) {
      saveScrollPosition(prevKey);
    }
    prevKeyRef.current = scrollKey;

    const onScroll = () => saveScrollPosition(scrollKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      saveScrollPosition(scrollKey);
    };
  }, [scrollKey]);

  return null;
}
