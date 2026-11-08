import { type RefObject, useEffect, useRef } from 'react';

// A swipe must start this close to the left edge of the screen…
const EDGE_WIDTH = 24;
// …and travel at least this far to the right, mostly horizontally.
const MIN_DISTANCE = 72;

/**
 * Swipe right from the left edge of `ref`'s element to go back, like iOS's
 * back gesture, on every platform. Listens on the page itself, so popups and
 * the image viewer (rendered outside it) aren't affected, and only edge
 * swipes count, so it doesn't clash with list SwipeActions.
 */
export const useSwipeBack = (
  ref: RefObject<HTMLElement | null>,
  onBack: () => void,
  enabled: boolean
) => {
  // Kept in a ref so the listeners don't need re-binding on every render.
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element) return undefined;

    let start: { x: number; y: number } | null = null;

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      start =
        event.touches.length === 1 && touch.clientX <= EDGE_WIDTH
          ? { x: touch.clientX, y: touch.clientY }
          : null;
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (!start) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - start.x;
      const dy = Math.abs(touch.clientY - start.y);
      start = null;
      if (dx >= MIN_DISTANCE && dy < dx / 2) onBackRef.current();
    };

    const onTouchCancel = () => {
      start = null;
    };

    element.addEventListener('touchstart', onTouchStart, { passive: true });
    element.addEventListener('touchend', onTouchEnd, { passive: true });
    element.addEventListener('touchcancel', onTouchCancel, { passive: true });
    return () => {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchend', onTouchEnd);
      element.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [ref, enabled]);
};
