import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from '@apollo/react-hooks';
import moment from 'moment';

import { Formats } from 'meteor/idreesia-common/constants';
import {
  Button,
  Icon,
  Modal,
  Table,
  Tooltip,
  message,
} from '/imports/ui/controls';
import { VisitorName } from '/imports/ui/modules/security/common/controls';

import {
  SHARED_RESIDENCE_BY_ID,
  CREATE_RESIDENT,
  UPDATE_RESIDENT,
  REMOVE_RESIDENT,
} from '../gql';
import { default as ResidentNewForm } from './resident-new-form';
import { default as ResidentEditForm } from './resident-edit-form';

const ResidentsList = ({ sharedResidenceId }) => {
  const [createResident] = useMutation(CREATE_RESIDENT);
  const [updateResident] = useMutation(UPDATE_RESIDENT);
  const [removeResident] = useMutation(REMOVE_RESIDENT);
  const [resident, setResident] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const { data, loading } = useQuery(SHARED_RESIDENCE_BY_ID, {
    variables: {
      _id: sharedResidenceId,
    },
  });

  if (loading) return null;

  const handleNewClicked = () => {
    setShowNewForm(true);
  };

  const handleDeleteClicked = record => {
    removeResident({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  const handleNewResidentSave = ({
    residentId,
    isOwner,
    roomNumber,
    fromDate,
    toDate,
  }) => {
    setShowNewForm(false);
    createResident({
      variables: {
        sharedResidenceId,
        residentId,
        isOwner,
        roomNumber,
        fromDate,
        toDate,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  const handleNewResidentCancel = () => {
    setShowNewForm(false);
  };

  const handleEditClicked = record => {
    setResident(record);
    setShowEditForm(true);
  };

  const handleEditResidentSave = ({
    isOwner,
    roomNumber,
    fromDate,
    toDate,
  }) => {
    const _id = resident._id;
    setResident(null);
    setShowEditForm(false);
    updateResident({
      variables: {
        _id,
        isOwner,
        roomNumber,
        fromDate,
        toDate,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  const handleEditResidentCancel = () => {
    setResident(null);
    setShowEditForm(false);
  };

  const columns = [
    {
      title: 'Resident',
      key: 'resident',
      render: (text, record) => {
        const visitor = record.resident;
        return <VisitorName key={visitor._id} visitor={visitor} />;
      },
    },
    {
      title: 'Is Owner',
      dataIndex: 'isOwner',
      key: 'isOwner',
      render: text => (text ? 'Yes' : ''),
    },
    {
      title: 'Room Number',
      dataIndex: 'roomNumber',
      key: 'roomNumber',
    },
    {
      title: 'From Date',
      dataIndex: 'fromDate',
      key: 'fromDate',
      render: text =>
        text ? moment(Number(text)).format(Formats.DATE_FORMAT) : '',
    },
    {
      title: 'To Date',
      dataIndex: 'toDate',
      key: 'toDate',
      render: text =>
        text ? moment(Number(text)).format(Formats.DATE_FORMAT) : '',
    },
    {
      key: 'action',
      render: (text, record) => (
        <div className="list-actions-column">
          <Tooltip title="Edit">
            <Icon
              className="list-actions-icon"
              type="edit"
              onClick={() => {
                handleEditClicked(record);
              }}
            />
          </Tooltip>
          <Tooltip key="delete" title="Delete">
            <Icon
              type="delete"
              className="list-actions-icon"
              onClick={() => {
                handleDeleteClicked(record);
              }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const getTableHeader = () => (
    <div className="list-table-header">
      <Button type="primary" icon="plus-circle-o" onClick={handleNewClicked}>
        New Resident
      </Button>
    </div>
  );

  const {
    sharedResidenceById: { residents },
  } = data;

  return (
    <>
      <Table
        rowKey="_id"
        dataSource={residents}
        columns={columns}
        bordered
        size="small"
        pagination={false}
        title={getTableHeader}
      />
      <Modal
        title="New Resident"
        visible={showNewForm}
        onCancel={handleNewResidentCancel}
        width={600}
        footer={null}
      >
        {showNewForm ? (
          <ResidentNewForm
            handleSave={handleNewResidentSave}
            handleCancel={handleNewResidentCancel}
          />
        ) : null}
      </Modal>
      <Modal
        title="Edit Resident"
        visible={showEditForm}
        onCancel={handleEditResidentCancel}
        width={600}
        footer={null}
      >
        {showEditForm ? (
          <ResidentEditForm
            resident={resident}
            handleSave={handleEditResidentSave}
            handleCancel={handleEditResidentCancel}
          />
        ) : null}
      </Modal>
    </>
  );
};

ResidentsList.propTypes = {
  sharedResidenceId: PropTypes.string,
};

export default ResidentsList;
