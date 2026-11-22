import React from 'react';

import { ATTENDANCE_STATUSES, type AttendanceStatus } from './attendance-status';

interface Props {
  status: AttendanceStatus | null;
  /** Set to let the user mark; tapping the current status clears it. */
  onChange?: (status: AttendanceStatus | null) => void;
  disabled?: boolean;
}

/** P / L / A for a day: three buttons when it can be marked, one badge when not. */
export const AttendanceMark = ({ status, onChange, disabled }: Props) => {
  if (!onChange) {
    const current = ATTENDANCE_STATUSES.find(item => item.status === status);
    return (
      <span
        aria-label={current?.label ?? 'Not marked'}
        className={`da-mark da-mark-${status ?? 'unset'}`}
      >
        {current?.mark ?? '—'}
      </span>
    );
  }
  return (
    <span className="da-mark-group">
      {ATTENDANCE_STATUSES.map(item => (
        <button
          key={item.status}
          aria-label={item.label}
          aria-pressed={status === item.status}
          className={`da-mark da-mark-${item.status}${status === item.status ? ' da-mark-on' : ''}`}
          disabled={disabled}
          type="button"
          onClick={event => {
            event.stopPropagation();
            onChange(status === item.status ? null : item.status);
          }}
        >
          {item.mark}
        </button>
      ))}
    </span>
  );
};
