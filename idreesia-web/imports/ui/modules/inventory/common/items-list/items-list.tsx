import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { withQuery } from '/imports/ui/modules/inventory/common/composers/apollo-hooks';
import { DeleteOutlined } from '@ant-design/icons';

import { filter, find } from 'meteor/idreesia-common/utilities/lodash';
import { Table, Tooltip, message } from 'antd';
import { default as ItemForm } from './item-form';

const AntTable = Table as any;
const AntTooltip = Tooltip as any;
const AntDeleteOutlined = DeleteOutlined as any;
const AntItemForm = ItemForm as any;

interface StockItem {
  _id: string;
  formattedName?: string;
  unitOfMeasurement?: string;
}

interface ListItem {
  stockItemId: string;
  quantity: number;
  price?: number;
  isInflow: boolean;
}

interface RefForm {
  getFieldsValue(): {
    stockItem?: StockItem;
    quantity?: number;
    price?: number;
    status?: string;
  };
  resetFields(fields: string[]): void;
}

interface ItemsListProps {
  readOnly?: boolean;
  value?: ListItem[];
  onChange?(items: ListItem[]): void;
  physicalStoreId?: string;
  defaultLabel?: string;
  inflowLabel?: string;
  outflowLabel?: string;
  loading?: boolean;
  stockItemsById?: StockItem[];
  showPrice?: boolean;
  refForm?: RefForm;
}

interface ItemsListState {
  referenceStockItems: StockItem[];
  stockItems: ListItem[];
}

class ItemsList extends Component<ItemsListProps, ItemsListState> {
  static propTypes = {
    readOnly: PropTypes.bool,
    value: PropTypes.array,
    onChange: PropTypes.func,
    physicalStoreId: PropTypes.string,
    defaultLabel: PropTypes.string,
    inflowLabel: PropTypes.string,
    outflowLabel: PropTypes.string,
    loading: PropTypes.bool,
    stockItemsById: PropTypes.array,
    showPrice: PropTypes.bool,
    refForm: PropTypes.object,
  };

  static defaultProps = {
    readOnly: false,
  };

  constructor(props: ItemsListProps) {
    super(props);
    this.state = {
      referenceStockItems: [],
      stockItems: props.value
        ? props.value.map(({ stockItemId, quantity, price, isInflow }) => ({
            stockItemId,
            quantity,
            price,
            isInflow,
          }))
        : [],
    };
  }

  handleAddItem = () => {
    const { refForm } = this.props;
    if (!refForm) return;
    const { referenceStockItems } = this.state;
    const fieldValues = refForm.getFieldsValue();
    const { stockItem, quantity, price, status } = fieldValues;
    if (!stockItem || !quantity || !status) {
      message.info(
        'You need to select a stock item, and specify the quantity.',
        5
      );
      return;
    }

    const isInflow = status === 'inflow';
    /*
    if (!isInflow && stockItem.currentStockLevel < quantity) {
      message.error(
        `You current stock level is ${
          stockItem.currentStockLevel
        }. You cannot have ${quantity} ${outflowLabel}.`,
        5
      );
      return;
    }
    */

    // Save this stock item in the state so that we can use it to display the label
    referenceStockItems.push(stockItem);

    const { stockItems } = this.state;
    // If we have an existing item against this itemStockId, then add the
    // count to the existing item instead of adding a new item.
    const existingItem = find(stockItems, {
      stockItemId: stockItem._id,
      isInflow,
    });
    if (!existingItem) {
      stockItems.push({
        stockItemId: stockItem._id,
        quantity,
        isInflow,
        price,
      });
    } else {
      existingItem.quantity += quantity;
      existingItem.price = (existingItem.price ?? 0) + (price ?? 0);
    }

    this.setState({ stockItems });
    const { onChange } = this.props;
    if (onChange) {
      onChange(stockItems);
    }

    refForm.resetFields(['stockItem', 'quantity', 'price', 'status']);
  };

  getStockItemName(stockItemId: string) {
    const { stockItemsById = [] } = this.props;
    const { referenceStockItems } = this.state;

    const allStockItems = referenceStockItems.concat(stockItemsById);
    const stockItem = find(allStockItems, { _id: stockItemId });
    if (stockItem) return stockItem.formattedName;
    return null;
  }

  getStockItemUom(stockItemId: string) {
    const { stockItemsById = [] } = this.props;
    const { referenceStockItems } = this.state;

    const allStockItems = referenceStockItems.concat(stockItemsById);
    const stockItem = find(allStockItems, { _id: stockItemId });
    if (stockItem) return stockItem.unitOfMeasurement;
    return null;
  }

  getColumns = () => {
    const { inflowLabel, outflowLabel, showPrice, readOnly } = this.props;
    const columns: any[] = [
      {
        title: 'Item Name',
        dataIndex: 'stockItemId',
        key: 'stockItemId',
        render: (text: string) => this.getStockItemName(text),
      },
      {
        title: 'Quantity',
        dataIndex: 'quantity',
        key: 'quantity',
        render: (text: number, record: ListItem) => {
          const uom = this.getStockItemUom(record.stockItemId);
          let quantity = text || '';
          if (text && uom && uom !== 'quantity') {
            quantity = `${quantity} ${uom}`;
          }

          if (record.isInflow) {
            return `${quantity} ${inflowLabel}`;
          }
          return `${quantity} ${outflowLabel}`;
        },
      },
    ];

    if (showPrice) {
      columns.push({
        title: 'Price',
        dataIndex: 'price',
        key: 'price',
      });
    }

    if (!readOnly) {
      columns.push({
        key: 'actions',
        render: (_text: unknown, record: ListItem) => (
          <AntTooltip title="Delete">
            <AntDeleteOutlined
              className="list-actions-icon"
              onClick={() => {
                this.handleDeleteClicked(record);
              }}
            />
          </AntTooltip>
        ),
      });
    }
    return columns;
  };

  getTableHeader = () => {
    const {
      refForm,
      readOnly,
      physicalStoreId,
      defaultLabel,
      inflowLabel,
      outflowLabel,
      showPrice,
    } = this.props;

    if (readOnly) return null;
    return (
      <AntItemForm
        refForm={refForm}
        physicalStoreId={physicalStoreId}
        defaultLabel={defaultLabel}
        inflowLabel={inflowLabel}
        outflowLabel={outflowLabel}
        showPrice={showPrice}
        handleAddItem={this.handleAddItem}
      />
    );
  };

  handleDeleteClicked = ({ stockItemId, isInflow }: ListItem) => {
    const { stockItems } = this.state;
    const updatedItemStocks = filter(
      stockItems,
      (item: ListItem) =>
        item.stockItemId !== stockItemId || item.isInflow !== isInflow
    );
    this.setState({
      stockItems: updatedItemStocks,
    });

    const { onChange } = this.props;
    if (onChange) {
      onChange(updatedItemStocks);
    }
  };

  render() {
    const { loading } = this.props;
    if (loading) return null;

    return (
      <AntTable
        rowKey={(item: ListItem) =>
          `${item.stockItemId}_${item.isInflow ? 'inflow' : 'outflow'}`
        }
        columns={this.getColumns()}
        bordered
        pagination={false}
        dataSource={this.state.stockItems}
        title={this.getTableHeader}
        size="small"
      />
    );
  }
}

const stockItemsByIdQuery = gql`
  query stockItemsById($physicalStoreId: String!, $_ids: [String]!) {
    stockItemsById(physicalStoreId: $physicalStoreId, _ids: $_ids) {
      _id
      name
      formattedName
      unitOfMeasurement
    }
  }
`;

export default withQuery(stockItemsByIdQuery, {
  props: ({ data }: { data: Record<string, unknown> }) => ({ ...data }),
  options: ({ physicalStoreId, value }: ItemsListProps) => {
    const _ids = value
      ? value.map(({ stockItemId }: ListItem) => stockItemId)
      : [];
    return { variables: { physicalStoreId, _ids } };
  },
})(ItemsList as any);
