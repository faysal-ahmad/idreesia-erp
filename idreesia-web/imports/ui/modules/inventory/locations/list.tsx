import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  Button,
  Popconfirm,
  Table,
  Tooltip,
  message,
} from 'antd';
import {
  DeleteOutlined,
  PlusCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import { usePhysicalStore } from '/imports/ui/modules/inventory/common/hooks';

import {
  REMOVE_LOCATION,
  LOCATIONS_BY_PHYSICAL_STORE_ID,
} from './gql';

const AntButton = Button as any;
const AntPopconfirm = Popconfirm as any;
const AntTable = Table as any;
const AntTooltip = Tooltip as any;
const AntDeleteOutlined = DeleteOutlined as any;
const AntPlusCircleOutlined = PlusCircleOutlined as any;
const AntSyncOutlined = SyncOutlined as any;
const RouterLink = Link as any;

interface RouteParams {
  physicalStoreId: string;
}

interface HistoryLike {
  push(path: string): void;
}

interface ListProps {
  history: HistoryLike;
}

interface LocationRecord {
  _id: string;
  name: string;
  parentId?: string;
  description?: string;
  isInUse?: boolean;
  refParent?: {
    name?: string;
  };
}

interface LocationsData {
  locationsByPhysicalStoreId: LocationRecord[];
}

const List = ({ history }: ListProps) => {
  const dispatch = useDispatch();
  const { physicalStoreId } = useParams<RouteParams>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const [removeLocation] = useMutation(REMOVE_LOCATION as any, {
    refetchQueries: [{
      query: LOCATIONS_BY_PHYSICAL_STORE_ID as any,
      variables: {
        physicalStoreId,
      },
    }],
  });
  
  useEffect(() => {
    if (physicalStore) {
      dispatch(
        setBreadcrumbs(['Inventory', physicalStore.name, 'Setup', 'Locations', 'List'])
      );
    } else {
      dispatch(setBreadcrumbs(['Inventory', 'Setup', 'Locations', 'List']));
    }
  }, [dispatch, physicalStore]);

  const handleNewClicked = () => {
    history.push(paths.locationsNewFormPath(physicalStoreId));
  };

  const handleDeleteClicked = (location: LocationRecord) => {
    removeLocation({
      variables: {
        _id: location._id,
        physicalStoreId,
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
      render: (text: string, record: LocationRecord) => (
        <RouterLink
          to={`${paths.locationsEditFormPath(
            physicalStoreId,
            record._id
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
      render: (_text: unknown, record: LocationRecord) => (
        <RouterLink
          to={`${paths.itemCategoriesEditFormPath(
            physicalStoreId,
            record.parentId
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
      render: (_text: unknown, record: LocationRecord) => {
        const { isInUse } = record;

        if (!isInUse) {
          return (
            <div className="list-actions-column">
              <AntPopconfirm
                title="Are you sure you want to delete this location?"
                onConfirm={() => {
                  handleDeleteClicked(record);
                }}
                okText="Yes"
                cancelText="No"
              >
                <AntTooltip title="Delete">
                  <AntDeleteOutlined className="list-actions-icon" />
                </AntTooltip>
              </AntPopconfirm>
            </div>
          );
        }

        return null;
      },
    },
  ];

  const { data, loading, refetch } = useQuery(
    LOCATIONS_BY_PHYSICAL_STORE_ID as any,
    {
      variables: { physicalStoreId },
    }
  );
  
  if (loading) return null;
  const { locationsByPhysicalStoreId } = (data as LocationsData) ?? {
    locationsByPhysicalStoreId: [],
  };

  return (
    <AntTable
      rowKey="_id"
      dataSource={locationsByPhysicalStoreId}
      columns={columns}
      bordered
      title={() => (
        <div className="list-table-header">
          <AntButton
            type="primary"
            icon={<AntPlusCircleOutlined />}
            onClick={handleNewClicked}
          >
            New Location
          </AntButton>
          <div className="list-table-header-section">
            <AntButton
              size="large"
              icon={<AntSyncOutlined />}
              onClick={() => { refetch(); }}
            />
          </div>
        </div>
      )}
    />
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
