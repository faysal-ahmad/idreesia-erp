import React, { useRef } from 'react';
import { Button, Tooltip } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

// The panel's width, as a share of the discussion's width.
export const SIDE_PANEL_MIN_PERCENT = 20;
export const SIDE_PANEL_MAX_PERCENT = 50;
export const SIDE_PANEL_DEFAULT_PERCENT = 35;

const clamp = (percent: number) =>
  Math.min(SIDE_PANEL_MAX_PERCENT, Math.max(SIDE_PANEL_MIN_PERCENT, percent));

interface Props {
  title: React.ReactNode;
  /** Width as a percentage of the discussion's width. */
  widthPercent: number;
  onResize(widthPercent: number): void;
  onClose(): void;
  children: React.ReactNode;
}

/**
 * The panel beside the main list (thread, pinned, starred). Its left edge
 * can be dragged to resize it.
 */
const SidePanel = ({ title, widthPercent, onResize, onClose, children }: Props) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // The panel's right edge stays put, so the width is the distance from
  // the pointer to the right edge of the discussion body.
  const resizeTo = (clientX: number) => {
    const body = panelRef.current?.parentElement;
    if (!body) return;
    const rect = body.getBoundingClientRect();
    if (rect.width <= 0) return;
    onResize(clamp(((rect.right - clientX) / rect.width) * 100));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      resizeTo(event.clientX);
    }
  };

  return (
    <div
      className="discussion-side-panel"
      ref={panelRef}
      style={{ width: `${widthPercent}%` }}
    >
      <div
        className="discussion-side-panel-resizer"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panel"
        aria-valuemin={SIDE_PANEL_MIN_PERCENT}
        aria-valuemax={SIDE_PANEL_MAX_PERCENT}
        aria-valuenow={Math.round(widthPercent)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      />
      <div className="discussion-side-panel-header">
        <span className="discussion-title">{title}</span>
        <Tooltip title="Close">
          <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
        </Tooltip>
      </div>
      {children}
    </div>
  );
};

export default SidePanel;
