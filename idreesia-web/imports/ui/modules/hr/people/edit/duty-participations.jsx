/* eslint "no-script-url": "off" */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery } from '@apollo/client/react';
import { DeleteOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import {
  Button,
  Divider,
  Form,
  Table,
  Tooltip,
  Modal,
  Popconfirm,
  message,
} from 'antd';

import {
  useAllMSDuties,
  useAllDutyShifts,
  useAllDutyLocations,
} from '/imports/ui/modules/hr/common/composers';

import DutyForm from './duty-form';
import {
  KARKUN_DUTIES_BY_KARKUN_ID,
  CREATE_KARKUN_DUTY,
  UPDATE_KARKUN_DUTY,
  REMOVE_KARKUN_DUTY,
} from '../gql';

const DutyParticipation = props => {
  const { match, karkunId } = props;
  const [showNewForm, setShowNewForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [defaultValues, setDefaultValues] = useState({});
  const [newDutyForm] = Form.useForm();
  const [editDutyForm] = Form.useForm();
  const { data } = useQuery(KARKUN_DUTIES_BY_KARKUN_ID, {
    variables: { karkunId: match.params.karkunId },
  });
  const [createKarkunDuty] = useMutation(CREATE_KARKUN_DUTY, {
    refetchQueries: ['karkunDutiesByKarkunId'],
  });
  const [updateKarkunDuty] = useMutation(UPDATE_KARKUN_DUTY, {
    refetchQueries: ['karkunDutiesByKarkunId'],
  });
  const [removeKarkunDuty] = useMutation(REMOVE_KARKUN_DUTY, {
    refetchQueries: [
      'pagedHrKarkuns',
      'karkunDutiesByKarkunId',
      'allMSDuties',
    ],
  });
  const { allMSDuties } = useAllMSDuties();
  const { allDutyShifts } = useAllDutyShifts();
  const { allDutyLocations } = useAllDutyLocations();
  const { karkunDutiesByKarkunId } = data || {};

  const handleNewClicked = () => {
    setShowNewForm(true);
  };

  const handleEditClicked = record => {
    setShowEditForm(true);
    setDefaultValues(record);
  };

  const handleDeleteClicked = record => {
    removeKarkunDuty({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  const handleNewDutyFormCancelled = () => {
    setShowNewForm(false);
  };

  const handleEditDutyFormCancelled = () => {
    setShowEditForm(false);
  };

  const handleNewDutyFormSaved = () => {
    newDutyForm.validateFields().then(({ dutyIdShiftId, locationId, role, weekDays }) => {
      setShowNewForm(false);
      createKarkunDuty({
        variables: {
          karkunId,
          dutyId: dutyIdShiftId[0],
          shiftId: dutyIdShiftId[1],
          locationId,
          role,
          daysOfWeek: weekDays,
        },
      })
      .catch(error => {
        message.error(error.message, 5);
      });
    });
  };

  const handleEditDutyFormSaved = () => {
    const { _id } = defaultValues;
    editDutyForm.validateFields().then(({ dutyIdShiftId, locationId, role, weekDays }) => {
      setShowEditForm(false);
      updateKarkunDuty({
        variables: {
          _id,
          karkunId,
          dutyId: dutyIdShiftId[0],
          shiftId: dutyIdShiftId[1],
          locationId,
          role,
          daysOfWeek: weekDays,
        },
      })
        .catch(error => {
          message.error(error.message, 5);
        });
      });
  };

  const columns = [
    {
      title: 'Duty Name',
      dataIndex: 'dutyName',
      key: 'dutyName',
      render: (text, record) => {
        if (record.role) {
          return `${text} (${record.role})`;
        }
        return text;
      },
    },
    {
      title: 'Shift Name',
      dataIndex: 'shiftName',
      key: 'shiftName',
    },
    {
      title: 'Location Name',
      dataIndex: 'locationName',
      key: 'locationName',
    },
    {
      title: 'Days of Week',
      dataIndex: 'daysOfWeek',
      key: 'daysOfWeek',
      render: textArray => (textArray ? textArray.join() : null),
    },
    {
      key: 'action',
      render: (text, record) => (
        <span>
          <Tooltip title="Edit">
            <EditOutlined
              className="list-actions-icon"
              onClick={() => {
                handleEditClicked(record);
              }}
            />
          </Tooltip>
          <Divider type="vertical" />
          <Popconfirm
            title="Are you sure you want to delete this duty?"
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
        </span>
      ),
    },
  ];

  return (
    <>
      <Table
        rowKey="_id"
        dataSource={karkunDutiesByKarkunId}
        columns={columns}
        bordered
        title={() => (
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={handleNewClicked}
          >
            New Duty
          </Button>
        )}
      />

      <Modal
        open={showNewForm}
        title="Add Duty"
        okText="Save"
        width={600}
        destroyOnClose
        onOk={handleNewDutyFormSaved}
        onCancel={handleNewDutyFormCancelled}
      >
        <DutyForm
          form={newDutyForm}
          defaultValues={defaultValues}
          allMSDuties={allMSDuties}
          allDutyShifts={allDutyShifts}
          allDutyLocations={allDutyLocations}
        />
      </Modal>

      <Modal
        open={showEditForm}
        title="Edit Duty"
        okText="Save"
        width={600}
        destroyOnClose
        onOk={handleEditDutyFormSaved}
        onCancel={handleEditDutyFormCancelled}
      >
        <DutyForm
          form={editDutyForm}
          defaultValues={defaultValues}
          allMSDuties={allMSDuties}
          allDutyShifts={allDutyShifts}
          allDutyLocations={allDutyLocations}
        />
      </Modal>
    </>
  );
};

DutyParticipation.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,

  karkunId: PropTypes.string,
};

export default DutyParticipation;
