import React from 'react';
import dayjs from 'dayjs';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { Table, Tooltip } from 'antd';
import { FileOutlined, EditOutlined } from '@ant-design/icons';
import { type History } from 'history';

import { find } from 'meteor/idreesia-common/utilities/lodash';
import { StoresSubModulePaths as paths } from '/imports/ui/modules/stores';
import type {
  PurchaseFormsByStockItemQuery,
  PurchaseFormsByStockItemQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

type PurchaseFormRow = NonNullable<
  NonNullable<PurchaseFormsByStockItemQuery['purchaseFormsByStockItem']>[number]
>;

type FormItem = NonNullable<
  NonNullable<NonNullable<PurchaseFormRow['items']>[number]>
>;

interface Props {
  history: History;
  physicalStoreId: string;
  stockItemId: string;
}

const PURCHASE_FORMS_BY_STOCK_ITEM: TypedDocumentNode<
  PurchaseFormsByStockItemQuery,
  PurchaseFormsByStockItemQueryVariables
> = gql`
  query purchaseFormsByStockItem(
    $physicalStoreId: String!
    $stockItemId: String!
  ) {
    purchaseFormsByStockItem(
      physicalStoreId: $physicalStoreId
      stockItemId: $stockItemId
    ) {
      _id
      purchaseDate
      receivedBy
      purchasedBy
      physicalStoreId
      approvedOn
      items {
        stockItemId
        quantity
        isInflow
        price
        refStockItem {
          _id
          name
        }
      }
      refReceivedBy {
        _id
        sharedData {
          name
        }
      }
      refPurchasedBy {
        _id
        sharedData {
          name
        }
      }
    }
  }
`;

const PurchaseForms = ({ history, physicalStoreId, stockItemId }: Props) => {
  const { data, loading } = useQuery(PURCHASE_FORMS_BY_STOCK_ITEM, {
    variables: { physicalStoreId, stockItemId },
    skip: !physicalStoreId || !stockItemId,
  });

  const handleViewClicked = (purchaseForm: PurchaseFormRow) => {
    if (!purchaseForm._id) return;
    history.push(
      paths.purchaseFormsViewFormPath(physicalStoreId, purchaseForm._id)
    );
  };

  const handleEditClicked = (purchaseForm: PurchaseFormRow) => {
    if (!purchaseForm._id) return;
    history.push(
      paths.purchaseFormsEditFormPath(physicalStoreId, purchaseForm._id)
    );
  };

  const columns: any[] = [
    {
      title: 'Purchase Date',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      render: (text: string) => dayjs(Number(text)).format('DD MMM, YYYY'),
    },
    {
      title: 'Purchased By',
      dataIndex: ['refPurchasedBy', 'sharedData', 'name'],
      key: 'refPurchasedBy.name',
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items: FormItem[] | null | undefined) => {
        const itemList = (items ?? []).filter(
          (item): item is FormItem => item != null
        );
        const item = find(
          itemList,
          formItem => formItem.stockItemId === stockItemId
        );
        if (!item?.refStockItem?.name) return '';
        return `${item.refStockItem.name} [${item.quantity} ${
          item.isInflow ? 'Purchased' : 'Returned'
        }] for Rs. ${item.price || '???'}`;
      },
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_text: unknown, record: PurchaseFormRow) => {
        let tooltipTitle;
        let icon;

        if (!record.approvedOn) {
          tooltipTitle = 'Edit';
          icon = (
            <EditOutlined
              className="list-actions-icon"
              onClick={() => {
                handleEditClicked(record);
              }}
            />
          );
        } else {
          tooltipTitle = 'View';
          icon = (
            <FileOutlined
              className="list-actions-icon"
              onClick={() => {
                handleViewClicked(record);
              }}
            />
          );
        }

        return (
          <div className="list-actions-column">
            <Tooltip title={tooltipTitle}>{icon}</Tooltip>
          </div>
        );
      },
    },
  ];

  if (loading) return null;

  const purchaseFormsByStockItem = (
    data?.purchaseFormsByStockItem ?? []
  ).filter((row): row is PurchaseFormRow => row != null);

  return (
    <Table
      rowKey="_id"
      dataSource={purchaseFormsByStockItem}
      columns={columns}
      bordered
    />
  );
};

export default PurchaseForms;
