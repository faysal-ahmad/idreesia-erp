import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { DeleteOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import {
  Button,
  Modal,
  Table,
  Tooltip,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';
import type {
  CityMehfilsByCityIdQuery,
  CreateCityMehfilMutationVariables,
  UpdateCityMehfilMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

import {
  CITY_MEHFILS_BY_CITY_ID,
  CREATE_CITY_MEHFIL,
  UPDATE_CITY_MEHFIL,
  REMOVE_CITY_MEHFIL,
} from '../gql';
import MehfilNewForm from './mehfil-new-form';
import MehfilEditForm from './mehfil-edit-form';

type CityMehfilRow = NonNullable<
  NonNullable<CityMehfilsByCityIdQuery['cityMehfilsByCityId']>[number]
> & { _id: string };

interface Props {
  cityId: string;
}

const List = ({ cityId }: Props) => {
  const [showNewForm, setShowNewForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [cityMehfil, setCityMehfil] = useState<CityMehfilRow | null>(null);
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

  const cityMehfilsByCityId: CityMehfilRow[] = (
    data?.cityMehfilsByCityId ?? []
  ).filter((row): row is CityMehfilRow => row != null && row._id != null);

  const handleNewClicked = () => {
    setShowNewForm(true);
  };

  const handleNewMehfilSave = (
    values: Omit<CreateCityMehfilMutationVariables, 'cityId'>
  ) => {
    setShowNewForm(false);

    createCityMehfil({
      variables: {
        cityId,
        ...values,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  const handleNewMehfilCancel = () => {
    setShowNewForm(false);
  };

  const handleEditClicked = (selectedCityMehfil: CityMehfilRow) => {
    setShowEditForm(true);
    setCityMehfil(selectedCityMehfil);
  };

  const handleEditMehfilSave = (values: UpdateCityMehfilMutationVariables) => {
    setShowEditForm(false);
    setCityMehfil(null);

    updateCityMehfil({
      variables: values,
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  const handleEditMehfilCancel = () => {
    setShowEditForm(false);
    setCityMehfil(null);
  };

  const handleDeleteClicked = (record: CityMehfilRow) => {
    removeCityMehfil({
      variables: {
        _id: record._id,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  const columns: any[] = [
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
      render: (text: boolean) => (text ? 'Yes' : 'No'),
    },
    {
      title: 'Tablet',
      dataIndex: 'tabAvailability',
      key: 'tabAvailability',
      render: (text: boolean) => (text ? 'Yes' : 'No'),
    },
    {
      key: 'action',
      render: (_text: unknown, record: CityMehfilRow) => (
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
        columns={columns as any}
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

export default List;
