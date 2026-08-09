import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { type History } from 'history';
import {
  Button,
  Popconfirm,
  Table,
  Tooltip,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';
import {
  DeleteOutlined,
  PlusCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import type { LocationsByPhysicalStoreIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { ModuleNames } from 'meteor/idreesia-common/constants';
import { StoresSubModulePaths as paths } from '/imports/ui/modules/stores';
import { usePhysicalStore } from '/imports/ui/modules/stores/common/hooks';

import {
  REMOVE_LOCATION,
  LOCATIONS_BY_PHYSICAL_STORE_ID,
} from './gql';

const RouterLink = Link as any;

interface ListProps {
  history: History;
}

type LocationRow = NonNullable<
  NonNullable<LocationsByPhysicalStoreIdQuery['locationsByPhysicalStoreId']>[number]
>;

const List = ({ history }: ListProps) => {
  const { physicalStoreId } = useParams<{ physicalStoreId: string }>();
  const { physicalStore } = usePhysicalStore(physicalStoreId!);

  useDynamicBreadcrumbs(
    physicalStore
      ? [ModuleNames.stores, physicalStore.name ?? '', 'Setup', 'Locations', 'List']
      : [ModuleNames.stores, 'Setup', 'Locations', 'List']
  );

  const [removeLocation] = useMutation(REMOVE_LOCATION, {
    refetchQueries: [{
      query: LOCATIONS_BY_PHYSICAL_STORE_ID,
      variables: {
        physicalStoreId,
      },
    }],
  });

  const handleNewClicked = () => {
    history.push(paths.locationsNewFormPath(physicalStoreId!));
  };

  const handleDeleteClicked = (location: LocationRow) => {
    removeLocation({
      variables: {
        _id: location._id!,
        physicalStoreId: physicalStoreId!,
      },
    })
      .then(() => {
        message.success('Location has been deleted.', 5);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const columns: any[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: LocationRow) => (
        <RouterLink
          to={`${paths.locationsEditFormPath(
            physicalStoreId!,
            record._id!
          )}`}
        >
          {text}
        </RouterLink>
      ),
    },
    {
      title: 'Parent Location',
      dataIndex: 'parentId',
      key: 'parentId',
      render: (_text: unknown, record: LocationRow) => (
        <RouterLink
          to={`${paths.itemCategoriesEditFormPath(
            physicalStoreId!,
            record.parentId!
          )}`}
        >
          {record.refParent ? record.refParent.name : ''}
        </RouterLink>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_text: unknown, record: LocationRow) => {
        const { isInUse } = record;

        if (!isInUse) {
          return (
            <div className="list-actions-column">
              <Popconfirm
                title="Are you sure you want to delete this location?"
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
            </div>
          );
        }

        return null;
      },
    },
  ];

  const { data, loading, refetch } = useQuery(LOCATIONS_BY_PHYSICAL_STORE_ID, {
    variables: { physicalStoreId: physicalStoreId! },
  });

  if (loading) return null;

  const locationsByPhysicalStoreId = (data?.locationsByPhysicalStoreId ?? []).filter(
    (row): row is LocationRow => row != null
  );

  return (
    <Table
      rowKey="_id"
      dataSource={locationsByPhysicalStoreId}
      columns={columns}
      bordered
      title={() => (
        <div className="list-table-header">
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={handleNewClicked}
          >
            New Location
          </Button>
          <div className="list-table-header-section">
            <Button
              size="large"
              icon={<SyncOutlined />}
              onClick={() => { refetch(); }}
            />
          </div>
        </div>
      )}
    />
  );
};

export default List;
