'use client';

import { useState, useEffect, useRef } from 'react';

interface UseScrollDirectionOptions {
  thresholdDown?: number; // Minimum downward delta in px to trigger hide (default: 14)
  thresholdUp?: number;   // Minimum upward delta in px to trigger show (default: 8)
  topThreshold?: number;  // Distance from top where nav is always visible (default: 45)
  disabled?: boolean;     // Pause direction hiding during programmatic scroll
}

export function useScrollDirection(options: UseScrollDirectionOptions = {}) {
  const {
    thresholdDown = 14,
    thresholdUp = 8,
    topThreshold = 45,
    disabled = false,
  } = options;

  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const disabledRef = useRef(disabled);

  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    lastScrollY.current = window.pageYOffset || document.documentElement.scrollTop || 0;

    const updateScrollDirection = () => {
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

      // When programmatic scroll is active (e.g. clicking category tab), stay visible
      if (disabledRef.current) {
        lastScrollY.current = currentScrollY;
        ticking.current = false;
        return;
      }

      // Always visible when user is at or near the top of the page
      if (currentScrollY <= topThreshold) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        ticking.current = false;
        return;
      }

      // Ignore iOS Safari rubber-band overscroll at the top
      if (currentScrollY < 0) {
        ticking.current = false;
        return;
      }

      // Ignore iOS Safari rubber-band bounce at the bottom of the page
      const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
      if (currentScrollY >= maxScrollY - 25) {
        ticking.current = false;
        return;
      }

      const delta = currentScrollY - lastScrollY.current;

      // Scrolling DOWN past downward threshold -> smoothly hide
      if (delta > thresholdDown && currentScrollY > topThreshold + 40) {
        setIsVisible(false);
        lastScrollY.current = currentScrollY;
      }
      // Scrolling UP past upward threshold -> promptly reveal
      else if (delta < -thresholdUp) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
      }

      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [thresholdDown, thresholdUp, topThreshold]);

  return { isVisible: disabled ? true : isVisible, setIsVisible };
}
