import React, { useState } from 'react';
import { Picker } from 'antd-mobile';
import { DownOutline } from 'antd-mobile-icons';

import type { Duty } from './hooks';

interface Props {
  duties: Duty[];
  /** The chosen duty's id; '' is every duty (when `allLabel` is set). */
  value: string;
  onChange: (dutyId: string) => void;
  /** Adds an "All duties" choice with this label. */
  allLabel?: string;
}

/** A one-line bar showing the chosen duty; tap to choose another. */
export const DutyBar = ({ duties, value, onChange, allLabel }: Props) => {
  const [open, setOpen] = useState(false);
  const options = [
    ...(allLabel ? [{ label: allLabel, value: '' }] : []),
    ...duties.map(duty => ({
      label: duty.isActive ? (duty.name ?? '') : `${duty.name} (inactive)`,
      value: duty._id ?? '',
    })),
  ];
  const current = options.find(option => option.value === value);

  return (
    <>
      <button className="da-bar" type="button" onClick={() => setOpen(true)}>
        <span className="da-bar-label">Duty</span>
        <span className="da-bar-value">{current?.label ?? 'Select a duty'}</span>
        <DownOutline />
      </button>
      <Picker
        columns={[options]}
        title="Duty"
        value={[value]}
        visible={open}
        onClose={() => setOpen(false)}
        onConfirm={([picked]) => onChange(String(picked ?? ''))}
      />
    </>
  );
};
