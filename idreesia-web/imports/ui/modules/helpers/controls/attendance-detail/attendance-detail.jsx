import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Formats } from 'meteor/idreesia-common/constants';
import AttendanceDay from './attendance-day';

const weekdayShorts = moment.weekdaysShort();

export default class AttendanceDetail extends Component {
  static propTypes = {
    forMonth: PropTypes.string,
    value: PropTypes.object,
    initialValue: PropTypes.object,
    onChange: PropTypes.func,
  };

  handleAttendanceChange = (day, updatedVal) => {
    const { onChange, value } = this.props;
    const updateAttendances = Object.assign({}, value || {});
    updateAttendances[day] = updatedVal;
    onChange(updateAttendances);
  };

  render() {
    const { forMonth, value, initialValue } = this.props;
    const month = moment(`01-${forMonth}`, Formats.DATE_FORMAT);
    const firstDayOfMonth = month.startOf('month').format('d');
    const attendances = value || initialValue || {};

    const blanks = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      blanks.push(<td key={`b${i}`} className="ant-calendar-cell" />);
    }

    const daysInMonth = [];
    for (let d = 1; d <= month.daysInMonth(); d++) {
      const day = d.toString();
      daysInMonth.push(
        <AttendanceDay
          key={day}
          day={day}
          attendanceValue={attendances[day]}
          onChange={this.handleAttendanceChange}
        />
      );
    }

    const totalSlots = [...blanks, ...daysInMonth];
    const rows = [];
    let cells = [];

    totalSlots.forEach((row, i) => {
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

    const dayNodes = rows.map((d, index) => (
      <tr key={index.toString()}>{d}</tr>
    ));

    const weekdayShortNames = weekdayShorts.map(day => (
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
