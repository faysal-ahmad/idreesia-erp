// @ts-nocheck
import React, { useState } from 'react';
import PropTypes from 'prop-types';
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
  CITY_MEHFILS_BY_CITY_ID,
  CREATE_CITY_MEHFIL,
  UPDATE_CITY_MEHFIL,
  REMOVE_CITY_MEHFIL,
} from '../gql';
import { default as MehfilNewForm } from './mehfil-new-form';
import { default as MehfilEditForm } from './mehfil-edit-form';

const List = ({ cityId }) => {
  const [showNewForm, setShowNewForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [cityMehfil, setCityMehfil] = useState(null);
  const { data } = useQuery(CITY_MEHFILS_BY_CITY_ID, {
    variables: { cityId },
  });
  const [createCityMehfil] = useMutation(CREATE_CITY_MEHFIL, {
    refetchQueries: ['cityMehfilsByCityId'],
  });
  const [updateCityMehfil] = useMutation(UPDATE_CITY_MEHFIL, {
    refetchQueries: ['cityMehfilsByCityId'],
  });
  const [removeCityMehfil] = useMutation(REMOVE_CITY_MEHFIL, {
    refetchQueries: ['cityMehfilsByCityId'],
  });
  const { cityMehfilsByCityId } = data || {};

  const handleNewClicked = () => {
    setShowNewForm(true);
  };

  const handleNewMehfilSave = values => {
    setShowNewForm(false);

    createCityMehfil({
      variables: {
        cityId,
        ...values,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  const handleNewMehfilCancel = () => {
    setShowNewForm(false);
  };

  const handleEditClicked = selectedCityMehfil => {
    setShowEditForm(true);
    setCityMehfil(selectedCityMehfil);
  };

  const handleEditMehfilSave = values => {
    setShowEditForm(false);
    setCityMehfil(null);

    updateCityMehfil({
      variables: values,
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  const handleEditMehfilCancel = () => {
    setShowEditForm(false);
    setCityMehfil(null);
  };

  const handleDeleteClicked = record => {
    removeCityMehfil({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  const columns = [
    {
      title: 'Mehfil Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Start Year',
      dataIndex: 'mehfilStartYear',
      key: 'mehfilStartYear',
    },
    {
      title: 'Timings',
      dataIndex: 'timingDetails',
      key: 'timingDetails',
    },
    {
      title: 'Karkuns',
      dataIndex: 'karkunCount',
      key: 'karkunCount',
    },
    {
      title: 'LCD',
      dataIndex: 'lcdAvailability',
      key: 'lcdAvailability',
      render: text => (text ? 'Yes' : 'No'),
    },
    {
      title: 'Tablet',
      dataIndex: 'tabAvailability',
      key: 'tabAvailability',
      render: text => (text ? 'Yes' : 'No'),
    },
    {
      key: 'action',
      render: (text, record) => (
        <div className="list-actions-column">
          <Tooltip title="Edit">
            <EditOutlined
              className="list-actions-icon"
              onClick={() => {
                handleEditClicked(record);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <DeleteOutlined
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

  return (
    <>
      <Table
        rowKey="_id"
        dataSource={cityMehfilsByCityId}
        columns={columns}
        pagination={false}
        bordered
        title={() => (
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={handleNewClicked}
          >
            New Mehfil
          </Button>
        )}
      />
      <Modal
        title="New Mehfil"
        open={showNewForm}
        onCancel={handleNewMehfilCancel}
        width={600}
        footer={null}
      >
        {showNewForm ? (
          <MehfilNewForm
            handleSave={handleNewMehfilSave}
            handleCancel={handleNewMehfilCancel}
          />
        ) : null}
      </Modal>
      <Modal
        title="Edit Mehfil"
        open={showEditForm}
        onCancel={handleEditMehfilCancel}
        width={600}
        footer={null}
      >
        {showEditForm ? (
          <MehfilEditForm
            cityMehfil={cityMehfil}
            handleSave={handleEditMehfilSave}
            handleCancel={handleEditMehfilCancel}
          />
        ) : null}
      </Modal>
    </>
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  cityId: PropTypes.string,
};

export default List;
