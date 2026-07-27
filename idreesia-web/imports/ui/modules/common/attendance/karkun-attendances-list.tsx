import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import { Formats } from 'meteor/idreesia-common/constants';
import { Table, Pagination } from 'antd';

const AntPagination = Pagination as any;
const AntTable = Table as any;
type AttendanceValue = 'pr' | 'ab' | 'none' | null | undefined;
type AnyRecord = Record<string, any>;
interface PagedAttendances { totalResults: number; data: AnyRecord[]; }
interface Props { pagedAttendances?: PagedAttendances; pageIndex?: number; pageSize?: number; onPageParamsChange?(pageIndex: number, pageSize?: number): void; }

const AttendanceContainer = {
  display: 'flex',
  flexFlow: 'row nowrap',
  alignItems: 'center',
};

const attendanceStyles = {
  pr: 'ant-calendar-cell attendance-date-linear attendance-present',
  ab: 'ant-calendar-cell attendance-date-linear attendance-absent',
  none: 'ant-calendar-cell attendance-date-linear attendance-none',
};

const getAttendanceStyle = (val: AttendanceValue) => {
  if (!val) return attendanceStyles.none;
  return attendanceStyles[val] ?? attendanceStyles.none;
};

const columns: any[] = [
  {
    title: 'Month',
    dataIndex: 'month',
    key: 'month',
    fixed: 'left',
    width: 100,
    render: (text: string) => {
      const date = dayjs(`01-${text}`, Formats.DATE_FORMAT);
      return date.format('MMM, YYYY');
    },
  },
  {
    title: 'Attendance Details',
    dataIndex: 'attendanceDetails',
    key: 'attendanceDetails',
    width: 1100,
    render: (text: string | undefined, record: AnyRecord) => {
      const attendanceDetails = text ? JSON.parse(text) : {};

      const month = dayjs(`01-${record.month}`, Formats.DATE_FORMAT);
      const days: React.ReactNode[] = [];
      for (let d = 1; d <= month.daysInMonth(); d++) {
        const day = d.toString();
        const val = attendanceDetails[day];
        days.push(
          <div key={day} className={getAttendanceStyle(val)}>
            {day}
          </div>
        );
      }

      return <div style={AttendanceContainer as any}>{days}</div>;
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
    render: (text: string | number) => `${text}%`,
  },
];

const KarkunAttendancesList = ({
  pagedAttendances,
  pageIndex,
  pageSize,
  onPageParamsChange,
}: Props) => {
  const { data, totalResults } = pagedAttendances ?? { data: [], totalResults: 0 };

  return (
    <AntTable
      rowKey="_id"
      size="small"
      columns={columns as any}
      dataSource={data}
      pagination={false}
      bordered
      scroll={{ x: 1000 }}
      footer={() => (
        <AntPagination
          current={(pageIndex ?? 0) + 1}
          pageSize={pageSize ?? 20}
          showSizeChanger
          showTotal={(total: number, range: [number, number]) =>
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
    data: PropTypes.array,
  }),
};

export default KarkunAttendancesList;
