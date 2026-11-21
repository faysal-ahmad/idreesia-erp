export type AttendanceStatus = 'present' | 'late' | 'absent';

export const ATTENDANCE_STATUSES: { status: AttendanceStatus; label: string; mark: string }[] = [
  { status: 'present', label: 'Present', mark: 'P' },
  { status: 'late', label: 'Late', mark: 'L' },
  { status: 'absent', label: 'Absent', mark: 'A' },
];

export const asStatus = (value?: string | null): AttendanceStatus | null =>
  value === 'present' || value === 'late' || value === 'absent' ? value : null;
