import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Formats } from 'meteor/idreesia-common/constants';
import { Table, Pagination } from 'antd';

const AttendanceContainer = {
  display: 'flex',
  flexFlow: 'row nowrap',
  alignItems: 'center',
};

const attendanceStyles = {
  pr: 'ant-calendar-cell attendance-date-linear attendance-present',
  la: 'ant-calendar-cell attendance-date-linear attendance-late',
  ab: 'ant-calendar-cell attendance-date-linear attendance-absent',
  none: 'ant-calendar-cell attendance-date-linear attendance-none',
};

const getAttendanceStyle = val => {
  if (!val) return attendanceStyles.none;
  return attendanceStyles[val];
};

const columns = [
  {
    title: 'Month',
    dataIndex: 'month',
    key: 'month',
    fixed: 'left',
    width: 100,
    render: text => {
      const date = moment(`01-${text}`, Formats.DATE_FORMAT);
      return date.format('MMM, YYYY');
    },
  },
  {
    title: 'Attendance Details',
    dataIndex: 'attendanceDetails',
    key: 'attendanceDetails',
    width: 1100,
    render: (text, record) => {
      const attendanceDetails = text ? JSON.parse(text) : {};

      const month = moment(`01-${record.month}`, Formats.DATE_FORMAT);
      const days = [];
      for (let d = 1; d <= month.daysInMonth(); d++) {
        const day = d.toString();
        const val = attendanceDetails[day];
        days.push(
          <div key={day} className={getAttendanceStyle(val)}>
            {day}
          </div>
        );
      }

      return <div style={AttendanceContainer}>{days}</div>;
    },
  },
  {
    title: 'Present',
    dataIndex: 'presentCount',
    key: 'presentCount',
    fixed: 'right',
    width: 70,
  },
  {
    title: 'Late',
    dataIndex: 'lateCount',
    key: 'lateCount',
    fixed: 'right',
    width: 70,
  },
  {
    title: 'Absent',
    dataIndex: 'absentCount',
    key: 'absentCount',
    fixed: 'right',
    width: 70,
  },
  {
    title: '%age',
    dataIndex: 'percentage',
    key: 'percentage',
    fixed: 'right',
    width: 70,
    render: text => `${text}%`,
  },
];

const KarkunAttendancesList = ({
  pagedAttendances,
  pageIndex,
  pageSize,
  onPageParamsChange,
}) => {
  const { attendance, totalResults } = pagedAttendances;

  return (
    <Table
      rowKey="_id"
      size="small"
      columns={columns}
      dataSource={attendance}
      pagination={false}
      bordered
      scroll={{ x: 1000 }}
      footer={() => (
        <Pagination
          current={pageIndex + 1}
          pageSize={pageSize}
          showSizeChanger
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} of ${total} items`
          }
          onChange={onPageParamsChange}
          onShowSizeChange={onPageParamsChange}
          total={totalResults}
        />
      )}
    />
  );
};

KarkunAttendancesList.propTypes = {
  pageIndex: PropTypes.number,
  pageSize: PropTypes.number,
  onPageParamsChange: PropTypes.func,

  pagedAttendances: PropTypes.shape({
    totalResults: PropTypes.number,
    attendance: PropTypes.array,
  }),
};

export default KarkunAttendancesList;
