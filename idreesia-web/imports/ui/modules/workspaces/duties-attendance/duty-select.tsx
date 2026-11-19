import React from 'react';
import { Select } from 'antd';

import type { Duty } from './hooks';

interface Props {
  duties: Duty[];
  value?: string;
  onChange: (dutyId: string) => void;
  /** Adds an "All duties" choice with this label (value ''). */
  allLabel?: string;
}

const DutySelect = ({ duties, value, onChange, allLabel }: Props) => (
  <Select
    className="da-duty-select"
    placeholder="Select a duty"
    showSearch
    optionFilterProp="label"
    value={value}
    onChange={onChange}
    options={[
      ...(allLabel ? [{ value: '', label: allLabel }] : []),
      ...duties.map(duty => ({
        value: duty._id,
        label: duty.isActive ? duty.name : `${duty.name} (inactive)`,
      })),
    ]}
  />
);

export default DutySelect;
