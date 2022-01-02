import React, { useState } from 'react';
import PropTypes from 'prop-types';

function getClassNamesForAttendance(attendanceValue) {
  if (attendanceValue === 'pr') return 'attendance-date attendance-present';
  if (attendanceValue === 'la') return 'attendance-date attendance-late';
  if (attendanceValue === 'ab') return 'attendance-date attendance-absent';
  if (attendanceValue === 'ms') return 'attendance-date attendance-ms';

  return 'attendance-date';
}

const AttendanceDay = ({ day, attendanceValue, onChange }) => {
  const [currentAttendanceValue, setCurrentAttendanceValue] = useState(
    attendanceValue
  );

  const handleClick = () => {
    let newAttendanceValue;
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

AttendanceDay.propTypes = {
  day: PropTypes.string,
  attendanceValue: PropTypes.string,
  onChange: PropTypes.func,
};

export default AttendanceDay;
