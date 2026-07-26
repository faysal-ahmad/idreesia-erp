// @ts-nocheck
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

const List = ({ dutyId }) => {
  const [showNewForm, setShowNewForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [dutyShift, setDutyShift] = useState(null);
  const { data } = useQuery(DUTY_SHIFTS_BY_DUTY_ID, {
    variables: { dutyId },
  });
  const [createDutyShift] = useMutation(CREATE_DUTY_SHIFT, {
    refetchQueries: ['dutyShiftsByDutyId'],
  });
  const [updateDutyShift] = useMutation(UPDATE_DUTY_SHIFT, {
    refetchQueries: ['dutyShiftsByDutyId'],
  });
  const [removeDutyShift] = useMutation(REMOVE_DUTY_SHIFT, {
    refetchQueries: ['dutyShiftsByDutyId'],
  });
  const { dutyShiftsByDutyId } = data || {};

  const handleNewClicked = () => {
    setShowNewForm(true);
  };

  const handleNewShiftSave = ({ name, startTime, endTime, attendanceSheet }) => {
    setShowNewForm(false);

    createDutyShift({
      variables: {
        name,
        dutyId,
        startTime,
        endTime,
        attendanceSheet,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  const handleNewShiftCancel = () => {
    setShowNewForm(false);
  };

  const handleEditClicked = selectedDutyShift => {
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
  }) => {
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
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  const handleEditShiftCancel = () => {
    setShowEditForm(false);
    setDutyShift(null);
  };

  const handleDeleteClicked = record => {
    removeDutyShift({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  const columns = [
    {
      title: 'Shift Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      render: text => {
        const startTime = new Date(text);
        return isValid(startTime) ? format(startTime, 'h:mm aaa') : null;
      },
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      render: text => {
        const endTime = new Date(text);
        return isValid(endTime) ? format(endTime, 'h:mm aaa') : null;
      },
    },
    {
      key: 'action',
      render: (text, record) => {
        let deleteAction = null;
        if (record.canDelete) {
          deleteAction = (
            <Tooltip title="Delete">
              <DeleteOutlined
                className="list-actions-icon"
                onClick={() => {
                  handleDeleteClicked(record);
                }}
              />
            </Tooltip>
          );
        }

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
      <Table
        rowKey="_id"
        dataSource={dutyShiftsByDutyId}
        columns={columns}
        pagination={false}
        bordered
        title={() => (
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={handleNewClicked}
          >
            New Duty Shift
          </Button>
        )}
      />
      <Modal
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
      </Modal>
      <Modal
        title="Edit Shift"
        open={showEditForm}
        onCancel={handleEditShiftCancel}
        width={600}
        footer={null}
      >
        {showEditForm ? (
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

List.propTypes = {
  dutyId: PropTypes.string,
};

export default List;
