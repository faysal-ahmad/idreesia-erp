import React, { useState } from 'react';

type AttendanceValue = 'pr' | 'la' | 'ab' | 'ms' | null | undefined;

interface Props {
  day: string;
  attendanceValue?: AttendanceValue;
  onChange(day: string, value: AttendanceValue): void;
}

function getClassNamesForAttendance(attendanceValue: AttendanceValue) {
  if (attendanceValue === 'pr') return 'attendance-date attendance-present';
  if (attendanceValue === 'la') return 'attendance-date attendance-late';
  if (attendanceValue === 'ab') return 'attendance-date attendance-absent';
  if (attendanceValue === 'ms') return 'attendance-date attendance-ms';

  return 'attendance-date';
}

const AttendanceDay = ({ day, attendanceValue, onChange }: Props) => {
  const [currentAttendanceValue, setCurrentAttendanceValue] = useState(
    attendanceValue
  );

  const handleClick = () => {
    let newAttendanceValue: AttendanceValue;
    if (!currentAttendanceValue) newAttendanceValue = 'pr';
    if (currentAttendanceValue === 'pr') newAttendanceValue = 'la';
    if (currentAttendanceValue === 'la') newAttendanceValue = 'ab';
    if (currentAttendanceValue === 'ab') newAttendanceValue = 'ms';
    if (currentAttendanceValue === 'ms') newAttendanceValue = null;

    setCurrentAttendanceValue(newAttendanceValue);
    onChange(day, newAttendanceValue);
  };

  const classNames = getClassNamesForAttendance(currentAttendanceValue);
  return (
    <td className="ant-calendar-cell" onClick={handleClick}>
      <div className={classNames}>{day}</div>
    </td>
  );
};

export default AttendanceDay;
