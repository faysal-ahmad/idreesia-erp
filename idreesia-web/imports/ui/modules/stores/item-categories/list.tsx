import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { type History } from 'history';
import {
  Button,
  Table,
  Tooltip,
  Popconfirm,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';
import {
  DeleteOutlined,
  PlusCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import type { ItemCategoriesByPhysicalStoreIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { ModuleNames } from 'meteor/idreesia-common/constants';
import { StoresSubModulePaths as paths } from '/imports/ui/modules/stores';
import { usePhysicalStore } from '/imports/ui/modules/stores/common/hooks';

import {
  REMOVE_ITEM_CATEGORY,
  ITEM_CATEGORIES_BY_PHYSICAL_STORE_ID,
} from './gql';

const RouterLink = Link as any;

interface ListProps {
  history: History;
}

type ItemCategoryRow = NonNullable<
  NonNullable<ItemCategoriesByPhysicalStoreIdQuery['itemCategoriesByPhysicalStoreId']>[number]
>;

const List = ({ history }: ListProps) => {
  const { physicalStoreId } = useParams<{ physicalStoreId: string }>();
  const { physicalStore } = usePhysicalStore(physicalStoreId!);

  useDynamicBreadcrumbs(
    physicalStore
      ? [ModuleNames.stores, physicalStore.name ?? '', 'Setup', 'Item Categories', 'List']
      : [ModuleNames.stores, 'Setup', 'Item Categories', 'List']
  );

  const [removeItemCategory] = useMutation(REMOVE_ITEM_CATEGORY, {
    refetchQueries: [{
      query: ITEM_CATEGORIES_BY_PHYSICAL_STORE_ID,
      variables: {
        physicalStoreId,
      },
    }],
  });

  const handleNewClicked = () => {
    history.push(paths.itemCategoriesNewFormPath(physicalStoreId!));
  };

  const handleDeleteClicked = (itemCategory: ItemCategoryRow) => {
    removeItemCategory({
      variables: {
        _id: itemCategory._id!,
        physicalStoreId: physicalStoreId!,
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
      render: (text: string, record: ItemCategoryRow) => (
        <RouterLink
          to={`${paths.itemCategoriesEditFormPath(
            physicalStoreId!,
            record._id!
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
      render: (_text: unknown, record: ItemCategoryRow) => {
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

  const { data, loading, refetch } = useQuery(
    ITEM_CATEGORIES_BY_PHYSICAL_STORE_ID,
    {
      variables: { physicalStoreId: physicalStoreId! },
    }
  );

  if (loading) return null;

  const itemCategoriesByPhysicalStoreId = (
    data?.itemCategoriesByPhysicalStoreId ?? []
  ).filter((row): row is ItemCategoryRow => row != null);

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
              onClick={() => { refetch(); }}
            />
          </div>
        </div>
      )}
    />
  );
};

export default List;
