import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import { Formats } from 'meteor/idreesia-common/constants';
import AttendanceDay from './attendance-day';

const weekdayShorts = dayjs.weekdaysShort();

const AttendanceDayInput = AttendanceDay as any;
type AttendanceValue = 'pr' | 'la' | 'ab' | 'ms' | null | undefined;
type AttendanceMap = Record<string, AttendanceValue>;
interface Props { forMonth?: string; value?: AttendanceMap; initialValue?: AttendanceMap; onChange?(value: AttendanceMap): void; }

export default class AttendanceDetail extends Component<Props> {
  static propTypes = {
    forMonth: PropTypes.string,
    value: PropTypes.object,
    initialValue: PropTypes.object,
    onChange: PropTypes.func,
  };

  handleAttendanceChange = (day: string, updatedVal: AttendanceValue) => {
    const { onChange, value } = this.props;
    const updateAttendances = Object.assign({}, value || {});
    updateAttendances[day] = updatedVal;
    onChange?.(updateAttendances);
  };

  render() {
    const { forMonth, value, initialValue } = this.props;
    const month = dayjs(`01-${forMonth}`, Formats.DATE_FORMAT);
    const firstDayOfMonth = Number(month.startOf('month').format('d'));
    const attendances = value || initialValue || {};

    const blanks: React.ReactNode[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      blanks.push(<td key={`b${i}`} className="ant-calendar-cell" />);
    }

    const daysInMonth: React.ReactNode[] = [];
    for (let d = 1; d <= month.daysInMonth(); d++) {
      const day = d.toString();
      daysInMonth.push(
        <AttendanceDayInput
          key={day}
          day={day}
          attendanceValue={attendances[day]}
          onChange={this.handleAttendanceChange}
        />
      );
    }

    const totalSlots = [...blanks, ...daysInMonth];
    const rows: React.ReactNode[][] = [];
    let cells: React.ReactNode[] = [];

    totalSlots.forEach((row: React.ReactNode, i: number) => {
      if (i % 7 !== 0) {
        cells.push(row);
      } else {
        rows.push(cells);
        cells = [];
        cells.push(row);
      }
      if (i === totalSlots.length - 1) {
        rows.push(cells);
      }
    });

    const dayNodes = rows.map((d: React.ReactNode[], index: number) => (
      <tr key={index.toString()}>{d}</tr>
    ));

    const weekdayShortNames = weekdayShorts.map((day: string) => (
      <th key={day} className="ant-calendar-column-header">
        <span className="ant-calendar-column-header-inner">{day}</span>
      </th>
    ));

    return (
      <div className="attendance-body">
        <table className="ant-calendar-table" cellSpacing="0" role="grid">
          <thead>
            <tr role="row">{weekdayShortNames}</tr>
          </thead>
          <tbody className="ant-calendar-tbody">{dayNodes}</tbody>
        </table>
      </div>
    );
  }
}
