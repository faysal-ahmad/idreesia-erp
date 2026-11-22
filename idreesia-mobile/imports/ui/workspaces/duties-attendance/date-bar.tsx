import React, { useState } from 'react';
import { DatePicker } from 'antd-mobile';
import { CalendarOutline, LeftOutline, RightOutline } from 'antd-mobile-icons';

import { fromPickerDate, toPickerDate } from './dates';

interface Props {
  /** The shown text, e.g. "Mon, 03 Nov 2026". */
  label: string;
  /** The date the picker opens on, YYYY-MM-DD. */
  value: string;
  precision: 'day' | 'month';
  /** The latest date that can be picked or stepped to, YYYY-MM-DD. */
  max?: string;
  stepLabel: string; // "day", "week", "month"
  onStep: (direction: -1 | 1) => void;
  onPick: (date: string) => void;
  disableNext?: boolean;
}

/** Previous / next buttons either side of a date; tap the date to pick one. */
export const DateBar = ({ label, value, precision, max, stepLabel, onStep, onPick, disableNext }: Props) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="list-toolbar da-date-bar">
      <button aria-label={`Previous ${stepLabel}`} className="da-date-step" type="button" onClick={() => onStep(-1)}>
        <LeftOutline />
      </button>
      <button className="da-date" type="button" onClick={() => setOpen(true)}>
        <CalendarOutline />
        {label}
      </button>
      <button
        aria-label={`Next ${stepLabel}`}
        className="da-date-step"
        disabled={disableNext}
        type="button"
        onClick={() => onStep(1)}
      >
        <RightOutline />
      </button>
      <DatePicker
        max={max ? toPickerDate(max) : undefined}
        precision={precision}
        title="Choose a date"
        value={toPickerDate(value)}
        visible={open}
        onClose={() => setOpen(false)}
        onConfirm={date => onPick(fromPickerDate(date))}
      />
    </div>
  );
};
