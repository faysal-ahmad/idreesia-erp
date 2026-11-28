import React from 'react';
import { useMutation } from '@apollo/client/react';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Table, Tooltip } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { formatShiftDuration, formatShiftTime } from '/imports/ui/modules/helpers/shifts';

import { REMOVE_DUTY_SHIFT } from './gql';

export interface DutyShiftRow {
  _id: string;
  dutyId?: string | null;
  name: string;
  startTime?: string | null;
  endTime?: string | null;
  canDelete?: boolean | null;
}

interface Props {
  shifts: DutyShiftRow[];
  onAdd: () => void;
  onEdit: (shift: DutyShiftRow) => void;
}

const DutyShiftsPanel = ({ shifts, onAdd, onEdit }: Props) => {
  const [removeDutyShift] = useMutation(REMOVE_DUTY_SHIFT, {
    refetchQueries: ['listAllMSDuties', 'composerAllMSDuties'],
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
