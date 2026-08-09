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
  IssuanceFormsByStockItemQuery,
  IssuanceFormsByStockItemQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

type IssuanceFormRow = NonNullable<
  NonNullable<IssuanceFormsByStockItemQuery['issuanceFormsByStockItem']>[number]
>;

type FormItem = NonNullable<
  NonNullable<NonNullable<IssuanceFormRow['items']>[number]>
>;

interface Props {
  history: History;
  physicalStoreId: string;
  stockItemId: string;
}

const ISSUANCE_FORMS_BY_STOCK_ITEM: TypedDocumentNode<
  IssuanceFormsByStockItemQuery,
  IssuanceFormsByStockItemQueryVariables
> = gql`
  query issuanceFormsByStockItem(
    $physicalStoreId: String!
    $stockItemId: String!
  ) {
    issuanceFormsByStockItem(
      physicalStoreId: $physicalStoreId
      stockItemId: $stockItemId
    ) {
      _id
      issueDate
      issuedBy
      issuedTo
      physicalStoreId
      approvedOn
      items {
        stockItemId
        quantity
        isInflow
        refStockItem {
          _id
          name
        }
      }
      refIssuedTo {
        _id
        name
      }
      refLocation {
        _id
        name
      }
    }
  }
`;

const IssuanceForms = ({ history, physicalStoreId, stockItemId }: Props) => {
  const { data, loading } = useQuery(ISSUANCE_FORMS_BY_STOCK_ITEM, {
    variables: { physicalStoreId, stockItemId },
    skip: !physicalStoreId || !stockItemId,
  });

  const handleViewClicked = (issuanceForm: IssuanceFormRow) => {
    if (!issuanceForm._id) return;
    history.push(
      paths.issuanceFormsViewFormPath(physicalStoreId, issuanceForm._id)
    );
  };

  const handleEditClicked = (issuanceForm: IssuanceFormRow) => {
    if (!issuanceForm._id) return;
    history.push(
      paths.issuanceFormsEditFormPath(physicalStoreId, issuanceForm._id)
    );
  };

  const columns: any[] = [
    {
      title: 'Issue Date',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (text: string) => dayjs(Number(text)).format('DD MMM, YYYY'),
    },
    {
      title: 'Issued To',
      dataIndex: ['refIssuedTo', 'name'],
      key: 'refIssuedTo.name',
    },
    {
      title: 'For Location',
      dataIndex: ['refLocation', 'name'],
      key: 'refLocation.name',
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
          item.isInflow ? 'Returned' : 'Issued'
        }]`;
      },
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_text: unknown, record: IssuanceFormRow) => {
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

  const issuanceFormsByStockItem = (
    data?.issuanceFormsByStockItem ?? []
  ).filter((row): row is IssuanceFormRow => row != null);

  return (
    <Table
      rowKey="_id"
      dataSource={issuanceFormsByStockItem}
      columns={columns}
      bordered
    />
  );
};

export default IssuanceForms;
