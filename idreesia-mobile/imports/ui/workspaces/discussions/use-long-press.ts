import { type MouseEvent, type PointerEvent, useRef } from 'react';

const LONG_PRESS_MS = 450;
// More finger movement than this is a scroll, not a press.
const MOVE_TOLERANCE_PX = 10;

/**
 * Pointer handlers that call `onLongPress` after the finger stays down,
 * without moving, for a moment. Android's long-press context menu is
 * suppressed; iOS's text callout is turned off in CSS.
 */
export const useLongPress = (onLongPress: () => void) => {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = useRef({ x: 0, y: 0 });
  // Set once the press fires, so lifting the finger doesn't also "tap" what
  // was under it (e.g. open a photo or follow a link).
  const fired = useRef(false);

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  return {
    onPointerDown: (event: PointerEvent) => {
      clear();
      fired.current = false;
      start.current = { x: event.clientX, y: event.clientY };
      timer.current = setTimeout(() => {
        timer.current = null;
        fired.current = true;
        onLongPress();
      }, LONG_PRESS_MS);
    },
    onPointerMove: (event: PointerEvent) => {
      if (!timer.current) return;
      const dx = event.clientX - start.current.x;
      const dy = event.clientY - start.current.y;
      if (Math.hypot(dx, dy) > MOVE_TOLERANCE_PX) clear();
    },
    onPointerUp: clear,
    onPointerCancel: clear,
    onPointerLeave: clear,
    onClickCapture: (event: MouseEvent) => {
      if (!fired.current) return;
      fired.current = false;
      event.preventDefault();
      event.stopPropagation();
    },
    onContextMenu: (event: { preventDefault: () => void }) => event.preventDefault(),
  };
};
