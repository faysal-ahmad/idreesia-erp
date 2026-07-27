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

const AntDeleteOutlined = DeleteOutlined as any;
const AntEditOutlined = EditOutlined as any;
const AntPlusCircleOutlined = PlusCircleOutlined as any;
const AntButton = Button as any;
const AntModal = Modal as any;
const AntTable = Table as any;
const AntTooltip = Tooltip as any;
const MehfilNewFormComponent = MehfilNewForm as any;
const MehfilEditFormComponent = MehfilEditForm as any;
type AnyRecord = Record<string, any>;
interface CityMehfil extends AnyRecord { _id: string; cityId?: string; name?: string; }
interface QueryData { cityMehfilsByCityId?: CityMehfil[] | null; }
interface Props { cityId?: string | null; }

const List = ({ cityId }: Props) => {
  const [showNewForm, setShowNewForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [cityMehfil, setCityMehfil] = useState<CityMehfil | null>(null);
  const { data } = useQuery(CITY_MEHFILS_BY_CITY_ID as any, {
    variables: { cityId },
  });
  const [createCityMehfil] = useMutation(CREATE_CITY_MEHFIL as any, {
    refetchQueries: ['cityMehfilsByCityId'],
  });
  const [updateCityMehfil] = useMutation(UPDATE_CITY_MEHFIL as any, {
    refetchQueries: ['cityMehfilsByCityId'],
  });
  const [removeCityMehfil] = useMutation(REMOVE_CITY_MEHFIL as any, {
    refetchQueries: ['cityMehfilsByCityId'],
  });
  const { cityMehfilsByCityId } = (data ?? {}) as QueryData;

  const handleNewClicked = () => {
    setShowNewForm(true);
  };

  const handleNewMehfilSave = (values: AnyRecord) => {
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

  const handleEditClicked = (selectedCityMehfil: CityMehfil) => {
    setShowEditForm(true);
    setCityMehfil(selectedCityMehfil);
  };

  const handleEditMehfilSave = (values: AnyRecord) => {
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

  const handleDeleteClicked = (record: CityMehfil) => {
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
      render: (_text: unknown, record: CityMehfil) => (
        <div className="list-actions-column">
          <AntTooltip title="Edit">
            <AntEditOutlined
              className="list-actions-icon"
              onClick={() => {
                handleEditClicked(record);
              }}
            />
          </AntTooltip>
          <AntTooltip title="Delete">
            <AntDeleteOutlined
              className="list-actions-icon"
              onClick={() => {
                handleDeleteClicked(record);
              }}
            />
          </AntTooltip>
        </div>
      ),
    },
  ];

  return (
    <>
      <AntTable
        rowKey="_id"
        dataSource={cityMehfilsByCityId ?? []}
        columns={columns as any}
        pagination={false}
        bordered
        title={() => (
          <AntButton
            type="primary"
            icon={<AntPlusCircleOutlined />}
            onClick={handleNewClicked}
          >
            New Mehfil
          </AntButton>
        )}
      />
      <AntModal
        title="New Mehfil"
        open={showNewForm}
        onCancel={handleNewMehfilCancel}
        width={600}
        footer={null}
      >
        {showNewForm ? (
          <MehfilNewFormComponent
            handleSave={handleNewMehfilSave}
            handleCancel={handleNewMehfilCancel}
          />
        ) : null}
      </AntModal>
      <AntModal
        title="Edit Mehfil"
        open={showEditForm}
        onCancel={handleEditMehfilCancel}
        width={600}
        footer={null}
      >
        {showEditForm ? (
          <MehfilEditFormComponent
            cityMehfil={cityMehfil}
            handleSave={handleEditMehfilSave}
            handleCancel={handleEditMehfilCancel}
          />
        ) : null}
      </AntModal>
    </>
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  cityId: PropTypes.string,
};

export default List;
