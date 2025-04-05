import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/react-hooks';
import {
  Button,
  Table,
  Tooltip,
  Popconfirm,
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
  REMOVE_ITEM_CATEGORY,
  ITEM_CATEGORIES_BY_PHYSICAL_STORE_ID,
} from './gql';

const List = ({ history }) => {
  const dispatch = useDispatch();
  const { physicalStoreId } = useParams();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const [removeItemCategory] = useMutation(REMOVE_ITEM_CATEGORY, {
    refetchQueries: [{ 
      query: ITEM_CATEGORIES_BY_PHYSICAL_STORE_ID,
      variables: {
        physicalStoreId,
      }
    }],
  });
  
  useEffect(() => {
    if (physicalStore) {
      dispatch(
        setBreadcrumbs(['Inventory', physicalStore.name, 'Setup', 'Item Categories', 'List'])
      );
    } else {
      dispatch(setBreadcrumbs(['Inventory', 'Setup', 'Item Categories', 'List']));
    }
  }, [physicalStoreId]);

  const handleNewClicked = () => {
    history.push(paths.itemCategoriesNewFormPath(physicalStoreId));
  };

  const handleDeleteClicked = itemCategory => {
    removeItemCategory({
      variables: {
        _id: itemCategory._id,
        physicalStoreId,
      },
    })
      .then(() => {
        message.success('Item category has been deleted.', 5);
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
          to={`${paths.itemCategoriesEditFormPath(
            physicalStoreId,
            record._id
          )}`}
        >
          {text}
        </Link>
      ),
    },
    {
      title: 'Stock Items Count',
      dataIndex: 'stockItemCount',
      key: 'stockItemCount',
    },
    {
      title: 'Actions',
      key: 'action',
      render: (text, record) => {
        const { stockItemCount } = record;

        if (stockItemCount === 0) {
          return (
            <div className="list-actions-column">
              <Popconfirm
                title="Are you sure you want to delete this item category?"
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

  const { data, loading, refetch } = useQuery(ITEM_CATEGORIES_BY_PHYSICAL_STORE_ID, {
    variables: { physicalStoreId }
  });
  
  if (loading) return null;
  const { itemCategoriesByPhysicalStoreId } = data;

  return (
    <Table
      rowKey="_id"
      dataSource={itemCategoriesByPhysicalStoreId}
      columns={columns}
      bordered
      title={() => (
        <div className="list-table-header">
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={handleNewClicked}
          >
            New Item Category
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
