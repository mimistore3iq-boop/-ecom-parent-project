import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import {
  getScrollKey,
  restoreScrollPosition,
  saveScrollPosition,
} from '../utils/scrollRestore';

export default function ScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const scrollKey = getScrollKey(location.pathname, location.search, location.hash);
  const prevKeyRef = useRef(scrollKey);
  const cancelRestoreRef = useRef(null);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    if (cancelRestoreRef.current) {
      cancelRestoreRef.current();
      cancelRestoreRef.current = null;
    }

    if (navigationType === 'PUSH' && location.pathname.startsWith('/product/')) {
      window.scrollTo(0, 0);
    }

    return () => {
      if (cancelRestoreRef.current) {
        cancelRestoreRef.current();
        cancelRestoreRef.current = null;
      }
    };
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
