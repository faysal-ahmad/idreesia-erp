import React, { useState } from 'react';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { SyncOutlined } from '@ant-design/icons';
import { Button, DatePicker, Space, Table } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import type { WorkspaceDaAttendanceSheetQuery } from 'meteor/idreesia-common/types/client-operations';

import DutySelect from './duty-select';
import { WORKSPACE_DA_ATTENDANCE_SHEET } from './gql';
import { useDuties } from './hooks';

type Row = NonNullable<
  NonNullable<WorkspaceDaAttendanceSheetQuery['workspaceDaAttendanceSheet']>[number]
>;

// A month's attendance totals per person and duty.
const AttendanceSheetPage = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const { duties } = useDuties(locationId);
  const [month, setMonth] = useState(dayjs());
  // '' is every duty.
  const [dutyId, setDutyId] = useState('');

  const { data, loading, refetch } = useQuery(WORKSPACE_DA_ATTENDANCE_SHEET, {
    variables: {
      locationId,
      month: month.format('MM-YYYY'),
      dutyId: dutyId || undefined,
    },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const rows = (data?.workspaceDaAttendanceSheet ?? []).filter(
    (row): row is Row => row != null
  );

  const columns: any[] = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Duty', dataIndex: 'dutyName', key: 'dutyName' },
    { title: 'Days on duty', dataIndex: 'daysOnDuty', key: 'daysOnDuty', width: 130, align: 'center' },
    { title: 'Present', dataIndex: 'presentCount', key: 'presentCount', width: 100, align: 'center' },
    { title: 'Late', dataIndex: 'lateCount', key: 'lateCount', width: 90, align: 'center' },
    { title: 'Absent', dataIndex: 'absentCount', key: 'absentCount', width: 100, align: 'center' },
    { title: 'Not marked', dataIndex: 'unmarkedCount', key: 'unmarkedCount', width: 120, align: 'center' },
    {
      title: 'Attendance',
      key: 'percentage',
      width: 120,
      align: 'center',
      render: (_text: unknown, row: Row) => `${row.percentage}%`,
    },
  ];

  return (
    <div className="da-page">
      <div className="da-selection">
        <Space size={12}>
          <span className="da-select-label">Duty</span>
          <DutySelect
            duties={duties}
            value={dutyId}
            onChange={setDutyId}
            allLabel="All duties"
          />
        </Space>
        <Space size={8}>
          <DatePicker
            picker="month"
            format="MMMM YYYY"
            allowClear={false}
            value={month}
            onChange={value => {
              if (value) setMonth(value);
            }}
          />
          <Button
            icon={<SyncOutlined />}
            title="Reload Data"
            loading={loading}
            onClick={() =>
              refetch().then(() => {
                message.success('Data Reloaded', 2);
              })
            }
          />
        </Space>
      </div>

      <div className="list-container">
        <Table
          className="list-table"
          rowKey="_id"
          dataSource={rows}
          columns={columns}
          loading={loading && !data}
          bordered
          size="middle"
          tableLayout="fixed"
          pagination={false}
          locale={{ emptyText: 'Nobody was on duty this month' }}
        />
      </div>
    </div>
  );
};

export default AttendanceSheetPage;
