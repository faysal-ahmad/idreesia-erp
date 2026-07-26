import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
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

const AntButton = Button as any;
const AntTable = Table as any;
const AntTooltip = Tooltip as any;
const AntPopconfirm = Popconfirm as any;
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

interface ItemCategory {
  _id: string;
  name: string;
  stockItemCount?: number;
}

interface ItemCategoriesData {
  itemCategoriesByPhysicalStoreId: ItemCategory[];
}

const List = ({ history }: ListProps) => {
  const dispatch = useDispatch();
  const { physicalStoreId } = useParams<RouteParams>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const [removeItemCategory] = useMutation(REMOVE_ITEM_CATEGORY as any, {
    refetchQueries: [{
      query: ITEM_CATEGORIES_BY_PHYSICAL_STORE_ID as any,
      variables: {
        physicalStoreId,
      },
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
  }, [dispatch, physicalStore]);

  const handleNewClicked = () => {
    history.push(paths.itemCategoriesNewFormPath(physicalStoreId));
  };

  const handleDeleteClicked = (itemCategory: ItemCategory) => {
    removeItemCategory({
      variables: {
        _id: itemCategory._id,
        physicalStoreId,
      },
    })
      .then(() => {
        message.success('Item category has been deleted.', 5);
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
      render: (text: string, record: ItemCategory) => (
        <RouterLink
          to={`${paths.itemCategoriesEditFormPath(
            physicalStoreId,
            record._id
          )}`}
        >
          {text}
        </RouterLink>
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
      render: (_text: unknown, record: ItemCategory) => {
        const { stockItemCount } = record;

        if (stockItemCount === 0) {
          return (
            <div className="list-actions-column">
              <AntPopconfirm
                title="Are you sure you want to delete this item category?"
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
    ITEM_CATEGORIES_BY_PHYSICAL_STORE_ID as any,
    {
      variables: { physicalStoreId },
    }
  );
  
  if (loading) return null;
  const { itemCategoriesByPhysicalStoreId } =
    (data as ItemCategoriesData) ?? {
      itemCategoriesByPhysicalStoreId: [],
    };

  return (
    <AntTable
      rowKey="_id"
      dataSource={itemCategoriesByPhysicalStoreId}
      columns={columns}
      bordered
      title={() => (
        <div className="list-table-header">
          <AntButton
            type="primary"
            icon={<AntPlusCircleOutlined />}
            onClick={handleNewClicked}
          >
            New Item Category
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
