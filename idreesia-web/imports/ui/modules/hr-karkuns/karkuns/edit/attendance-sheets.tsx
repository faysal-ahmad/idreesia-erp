import React from 'react';
import { useQuery } from '@apollo/client/react';
import { Spin, Table, type TableColumnsType } from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';
import { formatDate, parseDate } from 'meteor/idreesia-common/utilities/date-fns';
import type { KarkunDutyAttendanceSheetQuery } from 'meteor/idreesia-common/types/client-operations';

import { KARKUN_DUTY_ATTENDANCE_SHEET } from '../gql';

type AttendanceRow = NonNullable<
  NonNullable<KarkunDutyAttendanceSheetQuery['karkunDutyAttendanceSheet']>[number]
> & { _id: string };

interface Props {
  karkunId: string;
}

const countColumn = (title: string, dataIndex: keyof AttendanceRow) => ({
  title,
  dataIndex,
  key: dataIndex,
  width: 90,
  align: 'right' as const,
  render: (value: number | null) => value ?? 0,
});

const columns: TableColumnsType<AttendanceRow> = [
  {
    title: 'Month',
    dataIndex: 'month',
    key: 'month',
    render: (text: string) =>
      formatDate(parseDate(`01-${text}`, Formats.DATE_FORMAT), 'MMM, YYYY'),
  },
  {
    title: 'Duty / Location / Shift',
    key: 'duty',
    render: (_text, record) =>
      [record.duty?.name, record.location?.name, record.shiftName]
        .filter(Boolean)
        .join(' – '),
  },
  countColumn('Days', 'daysOnDuty'),
  countColumn('Present', 'presentCount'),
  countColumn('Late', 'lateCount'),
  countColumn('Absent', 'absentCount'),
  countColumn('Not Marked', 'unmarkedCount'),
  {
    title: 'Percentage',
    dataIndex: 'percentage',
    key: 'percentage',
    width: 110,
    align: 'right',
    render: (value: number | null) => `${value ?? 0}%`,
  },
];

// Monthly duty attendance for the karkun, computed from day records.
const AttendanceSheets = ({ karkunId }: Props) => {
  const { data, loading } = useQuery(KARKUN_DUTY_ATTENDANCE_SHEET, {
    variables: { karkunId },
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const rows = (data?.karkunDutyAttendanceSheet ?? []).filter(
    (row): row is AttendanceRow => row?._id != null
  );

  return (
    <Table
      rowKey="_id"
      size="small"
      columns={columns}
      dataSource={rows}
      pagination={false}
      bordered
    />
  );
};

export default AttendanceSheets;
