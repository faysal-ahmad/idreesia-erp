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
  refStockItem: {
    name: string;
  };
}

interface IssuanceForm {
  _id: string;
  issueDate: string;
  approvedOn?: string;
  items: FormItem[];
}

interface ListProps {
  history: HistoryLike;
  physicalStoreId?: string;
  stockItemId?: string;
  loading?: boolean;
  issuanceFormsByStockItem?: IssuanceForm[];
}

class List extends Component<ListProps> {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
    stockItemId: PropTypes.string,
    loading: PropTypes.bool,
    issuanceFormsByStockItem: PropTypes.array,
  };

  columns: any[] = [
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
      render: (items: FormItem[]) => {
        const { stockItemId } = this.props;
        const item = find(items, (_item: FormItem) => _item.stockItemId === stockItemId);
        if (!item) return '';
        return `${item.refStockItem.name} [${item.quantity} ${
          item.isInflow ? 'Returned' : 'Issued'
        }]`;
      },
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_text: unknown, record: IssuanceForm) => {
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

  handleViewClicked = (issuanceForm: IssuanceForm) => {
    const { history, physicalStoreId } = this.props;
    history.push(
      paths.issuanceFormsViewFormPath(physicalStoreId, issuanceForm._id)
    );
  };

  handleEditClicked = (issuanceForm: IssuanceForm) => {
    const { history, physicalStoreId } = this.props;
    history.push(
      paths.issuanceFormsEditFormPath(physicalStoreId, issuanceForm._id)
    );
  };

  render() {
    const { loading, issuanceFormsByStockItem } = this.props;
    if (loading) return null;

    return (
      <AntTable
        rowKey="_id"
        dataSource={issuanceFormsByStockItem}
        columns={this.columns}
        bordered
      />
    );
  }
}

const listQuery = gql`
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
