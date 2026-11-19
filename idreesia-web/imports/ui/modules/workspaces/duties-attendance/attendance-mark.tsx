import React from 'react';
import { Dropdown } from 'antd';

export type AttendanceStatus = 'present' | 'late' | 'absent';

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
};

const STATUS_MARK: Record<AttendanceStatus, string> = {
  present: 'P',
  late: 'L',
  absent: 'A',
};

export const asStatus = (value?: string | null): AttendanceStatus | null =>
  value === 'present' || value === 'late' || value === 'absent' ? value : null;

interface Props {
  status: AttendanceStatus | null;
  editable: boolean;
  saving?: boolean;
  onChange?: (status: AttendanceStatus | null) => void;
}

// P / L / A for a day; a dropdown to change it when editable.
const AttendanceMark = ({ status, editable, saving = false, onChange }: Props) => {
  const label = status ? STATUS_LABEL[status] : 'Not set';
  const mark = (
    <span className={`da-attendance-mark is-${status ?? 'unset'}`} aria-hidden>
      {status ? STATUS_MARK[status] : '—'}
    </span>
  );

  if (!editable) {
    return (
      <span className="da-attendance-mark-button" title={label} aria-label={label}>
        {mark}
      </span>
    );
  }

  return (
    <Dropdown
      trigger={['click']}
      disabled={saving}
      menu={{
        items: [
          { key: 'present', label: 'Present' },
          { key: 'late', label: 'Late' },
          { key: 'absent', label: 'Absent' },
          ...(status ? [{ key: 'clear', label: 'Clear' }] : []),
        ],
        onClick: ({ key }) => {
          const next = key === 'clear' ? null : asStatus(key);
          if (next === status) return;
          onChange?.(next);
        },
      }}
    >
      <button
        type="button"
        className="da-attendance-mark-button"
        title={label}
        aria-label={label}
        disabled={saving}
      >
        {mark}
      </button>
    </Dropdown>
  );
};

export default AttendanceMark;
