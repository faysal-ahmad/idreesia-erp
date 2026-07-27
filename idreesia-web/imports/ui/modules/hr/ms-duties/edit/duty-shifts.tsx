import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { format, isValid } from 'date-fns';
import { useMutation, useQuery } from '@apollo/client/react';
import { DeleteOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import {
  Button,
  Modal,
  Table,
  Tooltip,
  message,
} from 'antd';

import {
  DUTY_SHIFTS_BY_DUTY_ID,
  CREATE_DUTY_SHIFT,
  UPDATE_DUTY_SHIFT,
  REMOVE_DUTY_SHIFT,
} from '../gql';
import { default as ShiftNewForm } from './shift-new-form';
import { default as ShiftEditForm } from './shift-edit-form';

const AntButton = Button as any;
const AntModal = Modal as any;
const AntTable = Table as any;
const AntTooltip = Tooltip as any;
const AntDeleteOutlined = DeleteOutlined as any;
const AntEditOutlined = EditOutlined as any;
const AntPlusCircleOutlined = PlusCircleOutlined as any;
interface ListProps { dutyId?: string | null; }
interface DutyShift { _id: string; dutyId: string; name: string; startTime?: string | Date | null; endTime?: string | Date | null; attendanceSheet?: string; canDelete?: boolean; }
interface QueryData { dutyShiftsByDutyId?: DutyShift[]; }
interface ShiftFormValues { name: string; startTime?: unknown; endTime?: unknown; attendanceSheet?: string; }
interface ShiftEditValues extends ShiftFormValues { _id: string; dutyId: string; }

const List = ({ dutyId }: ListProps) => {
  const [showNewForm, setShowNewForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [dutyShift, setDutyShift] = useState<DutyShift | null>(null);
  const { data } = useQuery(DUTY_SHIFTS_BY_DUTY_ID as any, {
    variables: { dutyId },
  });
  const [createDutyShift] = useMutation(CREATE_DUTY_SHIFT as any, {
    refetchQueries: ['dutyShiftsByDutyId'],
  });
  const [updateDutyShift] = useMutation(UPDATE_DUTY_SHIFT as any, {
    refetchQueries: ['dutyShiftsByDutyId'],
  });
  const [removeDutyShift] = useMutation(REMOVE_DUTY_SHIFT as any, {
    refetchQueries: ['dutyShiftsByDutyId'],
  });
  const { dutyShiftsByDutyId = [] } = (data ?? {}) as QueryData;

  const handleNewClicked = () => {
    setShowNewForm(true);
  };

  const handleNewShiftSave = ({ name, startTime, endTime, attendanceSheet }: ShiftFormValues) => {
    setShowNewForm(false);

    createDutyShift({
      variables: {
        name,
        dutyId,
        startTime,
        endTime,
        attendanceSheet,
      },
    }).catch((error: Error) => {
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
        startTime,
        endTime,
        attendanceSheet,
      },
    }).catch((error: Error) => {
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
      render: (_text: unknown, record: DutyShift) => {
        let deleteAction = null;
        if (record.canDelete) {
          deleteAction = (
            <AntTooltip title="Delete">
              <AntDeleteOutlined
                className="list-actions-icon"
                onClick={() => {
                  handleDeleteClicked(record);
                }}
              />
            </AntTooltip>
          );
        }

        return (
          <div className="list-actions-column">
            <AntTooltip title="Edit">
              <AntEditOutlined
                className="list-actions-icon"
                onClick={() => {
                  handleEditClicked(record);
                }}
              />
            </AntTooltip>
            {deleteAction}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <AntTable
        rowKey="_id"
        dataSource={dutyShiftsByDutyId}
        columns={columns}
        pagination={false}
        bordered
        title={() => (
          <AntButton
            type="primary"
            icon={<AntPlusCircleOutlined />}
            onClick={handleNewClicked}
          >
            New Duty Shift
          </AntButton>
        )}
      />
      <AntModal
        title="New Shift"
        open={showNewForm}
        onCancel={handleNewShiftCancel}
        width={600}
        footer={null}
      >
        {showNewForm ? (
          <ShiftNewForm
            handleSave={handleNewShiftSave}
            handleCancel={handleNewShiftCancel}
          />
        ) : null}
      </AntModal>
      <AntModal
        title="Edit Shift"
        open={showEditForm}
        onCancel={handleEditShiftCancel}
        width={600}
        footer={null}
      >
        {showEditForm && dutyShift ? (
          <ShiftEditForm
            dutyShift={dutyShift}
            handleSave={handleEditShiftSave}
            handleCancel={handleEditShiftCancel}
          />
        ) : null}
      </AntModal>
    </>
  );
};

List.propTypes = {
  dutyId: PropTypes.string,
};

export default List;
