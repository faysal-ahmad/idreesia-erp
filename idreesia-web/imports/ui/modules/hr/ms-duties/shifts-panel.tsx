import React from 'react';
import { format, isValid } from 'date-fns';
import { useMutation } from '@apollo/client/react';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Table, Tooltip } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { REMOVE_DUTY_SHIFT } from './gql';

export interface DutyShiftRow {
  _id: string;
  dutyId?: string | null;
  name: string;
  startTime?: string | null;
  endTime?: string | null;
  attendanceSheet?: string | null;
  canDelete?: boolean | null;
}

interface Props {
  shifts: DutyShiftRow[];
  onAdd: () => void;
  onEdit: (shift: DutyShiftRow) => void;
}

const formatShiftTime = (value?: string | null) => {
  if (!value) return '';
  const time = new Date(value);
  return isValid(time) ? format(time, 'h:mm aaa') : '';
};

const minutesOfDay = (value?: string | null) => {
  if (!value) return null;
  const time = new Date(value);
  if (!isValid(time)) return null;
  return time.getHours() * 60 + time.getMinutes();
};

const formatShiftDuration = (
  startValue?: string | null,
  endValue?: string | null
) => {
  const startMinutes = minutesOfDay(startValue);
  const endMinutes = minutesOfDay(endValue);
  if (startMinutes == null || endMinutes == null) return '-';

  let minutes = endMinutes - startMinutes;
  if (minutes < 0) minutes += 24 * 60;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

const DutyShiftsPanel = ({ shifts, onAdd, onEdit }: Props) => {
  const [removeDutyShift] = useMutation(REMOVE_DUTY_SHIFT, {
    refetchQueries: [
      'listAllMSDuties',
      'composerAllMSDuties',
      'dutyShiftsByDutyId',
    ],
  });

  const handleRemove = (shiftId: string) => {
    removeDutyShift({ variables: { _id: shiftId } }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  const columns = [
    {
      title: 'Shift Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: DutyShiftRow) => (
        <Button
          type="link"
          style={{ padding: 0, height: 'auto' }}
          onClick={() => onEdit(record)}
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 140,
      render: (value: string | null | undefined) => formatShiftTime(value),
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 140,
      render: (value: string | null | undefined) => formatShiftTime(value),
    },
    {
      title: 'Duration',
      key: 'duration',
      width: 110,
      render: (_text: unknown, record: DutyShiftRow) =>
        formatShiftDuration(record.startTime, record.endTime),
    },
    {
      key: 'action',
      width: 72,
      render: (_text: unknown, record: DutyShiftRow) => {
        if (!record.canDelete) return null;

        return (
          <div className="list-actions-column">
            <Popconfirm
              title="Are you sure you want to delete this shift?"
              onConfirm={() => handleRemove(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete">
                <DeleteOutlined className="list-actions-icon" />
              </Tooltip>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="duty-expanded-header">
        <div className="duty-expanded-title">Shifts</div>
        <Button size="small" icon={<PlusOutlined />} onClick={onAdd}>
          Add Shift
        </Button>
      </div>
      <Table
        rowKey="_id"
        dataSource={shifts}
        columns={columns}
        size="small"
        bordered
        pagination={false}
        locale={{ emptyText: 'No shifts added yet' }}
      />
    </div>
  );
};

export default DutyShiftsPanel;
