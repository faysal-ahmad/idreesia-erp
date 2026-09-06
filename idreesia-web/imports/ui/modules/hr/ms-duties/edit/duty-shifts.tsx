import React, { useState } from 'react';
import { format, isValid } from 'date-fns';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {
  Button,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Table,
  Tooltip,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';
import type { DutyShiftsByDutyIdQuery } from 'meteor/idreesia-common/types/client-operations';

import {
  DUTY_SHIFTS_BY_DUTY_ID,
  CREATE_DUTY_SHIFT,
  UPDATE_DUTY_SHIFT,
  REMOVE_DUTY_SHIFT,
} from '../gql';
import ShiftNewForm from './shift-new-form';
import ShiftEditForm from './shift-edit-form';

interface ListProps {
  dutyId: string;
}

type DutyShift = NonNullable<
  NonNullable<DutyShiftsByDutyIdQuery['dutyShiftsByDutyId']>[number]
> & { _id: string; dutyId: string; name: string };

interface ShiftFormValues {
  name: string;
  startTime?: unknown;
  endTime?: unknown;
  attendanceSheet?: string;
}

interface ShiftEditValues extends ShiftFormValues {
  _id: string;
  dutyId: string;
}

const List = ({ dutyId }: ListProps) => {
  const [showNewForm, setShowNewForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [dutyShift, setDutyShift] = useState<DutyShift | null>(null);
  const { data, loading, refetch } = useQuery(DUTY_SHIFTS_BY_DUTY_ID, {
    variables: { dutyId },
  });
  const [createDutyShift] = useMutation(CREATE_DUTY_SHIFT, {
    refetchQueries: ['dutyShiftsByDutyId', 'listAllMSDuties', 'composerAllMSDuties'],
  });
  const [updateDutyShift] = useMutation(UPDATE_DUTY_SHIFT, {
    refetchQueries: ['dutyShiftsByDutyId', 'listAllMSDuties', 'composerAllMSDuties'],
  });
  const [removeDutyShift] = useMutation(REMOVE_DUTY_SHIFT, {
    refetchQueries: ['dutyShiftsByDutyId', 'listAllMSDuties', 'composerAllMSDuties'],
  });

  const dutyShiftsByDutyId = (data?.dutyShiftsByDutyId ?? []).filter(
    (row): row is DutyShift =>
      row != null && row._id != null && row.dutyId != null && row.name != null
  );

  const handleNewClicked = () => {
    setShowNewForm(true);
  };

  const handleNewShiftSave = ({
    name,
    startTime,
    endTime,
    attendanceSheet,
  }: ShiftFormValues) => {
    setShowNewForm(false);

    createDutyShift({
      variables: {
        name,
        dutyId,
        startTime: startTime as string | undefined,
        endTime: endTime as string | undefined,
        attendanceSheet,
      },
    })
      .then(() => {
        message.success('Shift created', 2);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleNewShiftCancel = () => {
    setShowNewForm(false);
  };

  const handleEditClicked = (selectedDutyShift: DutyShift) => {
    setShowEditForm(true);
    setDutyShift(selectedDutyShift);
  };

  const handleEditShiftSave = ({
    _id,
    dutyId: selectedDutyId,
    name,
    startTime,
    endTime,
    attendanceSheet,
  }: ShiftEditValues) => {
    setShowEditForm(false);
    setDutyShift(null);

    updateDutyShift({
      variables: {
        _id,
        dutyId: selectedDutyId,
        name,
        startTime: startTime as string | undefined,
        endTime: endTime as string | undefined,
        attendanceSheet,
      },
    })
      .then(() => {
        message.success('Shift updated', 2);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleEditShiftCancel = () => {
    setShowEditForm(false);
    setDutyShift(null);
  };

  const handleDeleteClicked = (record: DutyShift) => {
    removeDutyShift({
      variables: {
        _id: record._id,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  const handleRefresh = () => {
    refetch().then(() => {
      message.success('Data Reloaded', 2);
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const columns: any[] = [
    {
      title: 'Shift Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (text: string | Date) => {
        const startTime = new Date(text);
        return isValid(startTime) ? format(startTime, 'h:mm aaa') : null;
      },
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (text: string | Date) => {
        const endTime = new Date(text);
        return isValid(endTime) ? format(endTime, 'h:mm aaa') : null;
      },
    },
    {
      key: 'action',
      width: 72,
      render: (_text: unknown, record: DutyShift) => {
        const deleteAction = record.canDelete ? (
          <Popconfirm
            title="Are you sure you want to delete this shift?"
            onConfirm={() => {
              handleDeleteClicked(record);
            }}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <DeleteOutlined className="list-actions-icon" />
            </Tooltip>
          </Popconfirm>
        ) : null;

        return (
          <div className="list-actions-column">
            <Tooltip title="Edit">
              <EditOutlined
                className="list-actions-icon"
                onClick={() => {
                  handleEditClicked(record);
                }}
              />
            </Tooltip>
            {deleteAction}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="list-container">
        <div className="list-table-header" style={{ marginBottom: 12 }}>
          <Space size={12}>
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              onClick={handleNewClicked}
            >
              New Duty Shift
            </Button>
          </Space>
          <div className="list-table-header-utilities">
            <Space size={8}>
              <Button
                icon={<SyncOutlined />}
                onClick={handleRefresh}
                title="Reload Data"
              />
            </Space>
          </div>
        </div>
        <Table
          className="list-table"
          rowKey="_id"
          dataSource={dutyShiftsByDutyId}
          columns={columns}
          pagination={false}
          bordered
          size="middle"
          tableLayout="fixed"
        />
      </div>
      <Modal
        title="New Shift"
        open={showNewForm}
        onCancel={handleNewShiftCancel}
        width={600}
        footer={null}
        destroyOnHidden
      >
        {showNewForm ? (
          <ShiftNewForm
            handleSave={handleNewShiftSave}
            handleCancel={handleNewShiftCancel}
          />
        ) : null}
      </Modal>
      <Modal
        title="Edit Shift"
        open={showEditForm}
        onCancel={handleEditShiftCancel}
        width={600}
        footer={null}
        destroyOnHidden
      >
        {showEditForm && dutyShift ? (
          <ShiftEditForm
            dutyShift={dutyShift}
            handleSave={handleEditShiftSave}
            handleCancel={handleEditShiftCancel}
          />
        ) : null}
      </Modal>
    </>
  );
};

export default List;
