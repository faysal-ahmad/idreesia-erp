import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import gql from 'graphql-tag';
import { withQuery } from '/imports/ui/modules/inventory/common/composers/apollo-hooks';
import { Table, Tooltip } from 'antd';
import { FileOutlined, EditOutlined } from '@ant-design/icons';

import { find, flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';

const AntTable = Table as any;
const AntTooltip = Tooltip as any;
const AntFileOutlined = FileOutlined as any;
const AntEditOutlined = EditOutlined as any;

interface HistoryLike {
  push(path: string): void;
}

interface FormItem {
  stockItemId: string;
  quantity: number;
  isInflow: boolean;
  price?: number;
  refStockItem: {
    name: string;
  };
}

interface PurchaseForm {
  _id: string;
  purchaseDate: string;
  approvedOn?: string;
  items: FormItem[];
}

interface ListProps {
  history: HistoryLike;
  physicalStoreId?: string;
  stockItemId?: string;
  loading?: boolean;
  purchaseFormsByStockItem?: PurchaseForm[];
}

class List extends Component<ListProps> {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
    stockItemId: PropTypes.string,
    loading: PropTypes.bool,
    purchaseFormsByStockItem: PropTypes.array,
  };

  columns: any[] = [
    {
      title: 'Purchase Date',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      render: (text: string) => dayjs(Number(text)).format('DD MMM, YYYY'),
    },
    {
      title: 'Purchased By',
      dataIndex: ['refPurchasedBy', 'name'],
      key: 'refPurchasedBy.name',
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items: FormItem[]) => {
        const { stockItemId } = this.props;
        const item = find(items, (_item: FormItem) => _item.stockItemId === stockItemId);
        if (!item) return '';
        return `${item.refStockItem.name} [${item.quantity} ${
          item.isInflow ? 'Purchased' : 'Returned'
        }] for Rs. ${item.price || '???'}`;
      },
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_text: unknown, record: PurchaseForm) => {
        let tooltipTitle;
        let icon;

        if (!record.approvedOn) {
          tooltipTitle = 'Edit';
          icon = (
            <AntEditOutlined
              className="list-actions-icon"
              onClick={() => {
                this.handleEditClicked(record);
              }}
            />
          );
        } else {
          tooltipTitle = 'View';
          icon = (
            <AntFileOutlined
              className="list-actions-icon"
              onClick={() => {
                this.handleViewClicked(record);
              }}
            />
          );
        }

        return (
          <div className="list-actions-column">
            <AntTooltip title={tooltipTitle}>{icon}</AntTooltip>
          </div>
        );
      },
    },
  ];

  handleViewClicked = (purchaseForm: PurchaseForm) => {
    const { history, physicalStoreId } = this.props;
    history.push(
      paths.purchaseFormsViewFormPath(physicalStoreId, purchaseForm._id)
    );
  };

  handleEditClicked = (purchaseForm: PurchaseForm) => {
    const { history, physicalStoreId } = this.props;
    history.push(
      paths.purchaseFormsEditFormPath(physicalStoreId, purchaseForm._id)
    );
  };

  render() {
    const { loading, purchaseFormsByStockItem } = this.props;
    if (loading) return null;

    return (
      <AntTable
        rowKey="_id"
        dataSource={purchaseFormsByStockItem}
        columns={this.columns}
        bordered
      />
    );
  }
}

const listQuery = gql`
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
        name
      }
      refPurchasedBy {
        _id
        name
      }
    }
  }
`;

export default flowRight(
  withQuery(listQuery, {
    props: ({ data }: { data: Record<string, unknown> }) => ({ ...data }),
    options: ({
      physicalStoreId,
      stockItemId,
    }: {
      physicalStoreId?: string;
      stockItemId?: string;
    }) => ({
      variables: { physicalStoreId, stockItemId },
    }),
  })
)(List as any);
