import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/react-hooks';
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

const List = ({ history }) => {
  const dispatch = useDispatch();
  const { physicalStoreId } = useParams();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const [removeLocation] = useMutation(REMOVE_LOCATION, {
    refetchQueries: [{ 
      query: LOCATIONS_BY_PHYSICAL_STORE_ID,
      variables: {
        physicalStoreId,
      }
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
  }, [physicalStore]);

  const handleNewClicked = () => {
    history.push(paths.locationsNewFormPath(physicalStoreId));
  };

  const handleDeleteClicked = location => {
    removeLocation({
      variables: {
        _id: location._id,
        physicalStoreId,
      },
    })
      .then(() => {
        message.success('Location has been deleted.', 5);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link
          to={`${paths.locationsEditFormPath(
            physicalStoreId,
            record._id
          )}`}
        >
          {text}
        </Link>
      ),
    },
    {
      title: 'Parent Location',
      dataIndex: 'parentId',
      key: 'parentId',
      render: (text, record) => (
        <Link
          to={`${paths.itemCategoriesEditFormPath(
            physicalStoreId,
            record.parentId
          )}`}
        >
          {record.refParent ? record.refParent.name : ''}
        </Link>
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
      render: (text, record) => {
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
    variables: { physicalStoreId }
  });
  
  if (loading) return null;
  const { locationsByPhysicalStoreId } = data;

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
              onClick={() => { refetch() }}
            />
          </div>
        </div>
      )}
    />
  );
}

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
