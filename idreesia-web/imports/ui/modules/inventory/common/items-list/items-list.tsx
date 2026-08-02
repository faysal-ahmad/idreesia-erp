import React, { type CSSProperties, Component } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { DeleteOutlined } from '@ant-design/icons';

import { filter, find } from 'meteor/idreesia-common/utilities/lodash';
import type {
  StockItemsByIdQuery,
  StockItemsByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';
import { Table, Tooltip, message } from 'antd';
import { default as ItemForm } from './item-form';

type StockItemRow = NonNullable<
  NonNullable<StockItemsByIdQuery['stockItemsById']>[number]
>;

interface StockItem {
  _id: string;
  formattedName?: string | null;
  unitOfMeasurement?: string | null;
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
  stockItemsById?: StockItemRow[];
  showPrice?: boolean;
  refForm?: RefForm;
}

interface ItemsListState {
  referenceStockItems: StockItem[];
  stockItems: ListItem[];
}

const STOCK_ITEMS_BY_ID: TypedDocumentNode<
  StockItemsByIdQuery,
  StockItemsByIdQueryVariables
> = gql`
  query stockItemsById($physicalStoreId: String!, $_ids: [String]!) {
    stockItemsById(physicalStoreId: $physicalStoreId, _ids: $_ids) {
      _id
      name
      formattedName
      unitOfMeasurement
    }
  }
`;

class ItemsList extends Component<ItemsListProps, ItemsListState> {
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

    referenceStockItems.push(stockItem);

    const { stockItems } = this.state;
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

  getResolvedStockItems(): StockItem[] {
    const { stockItemsById = [] } = this.props;
    const { referenceStockItems } = this.state;

    const queriedItems = stockItemsById
      .filter((row): row is StockItemRow => row != null && row._id != null)
      .map((row) => ({
        _id: row._id!,
        formattedName: row.formattedName,
        unitOfMeasurement: row.unitOfMeasurement,
      }));

    return referenceStockItems.concat(queriedItems);
  }

  getStockItemName(stockItemId: string) {
    const stockItem = find(this.getResolvedStockItems(), { _id: stockItemId });
    if (stockItem) return stockItem.formattedName;
    return null;
  }

  getStockItemUom(stockItemId: string) {
    const stockItem = find(this.getResolvedStockItems(), { _id: stockItemId });
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
          <Tooltip title="Delete">
            <DeleteOutlined
              className="list-actions-icon"
              onClick={() => {
                this.handleDeleteClicked(record);
              }}
            />
          </Tooltip>
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
      <ItemForm
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
      <Table
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

interface ItemsListContainerProps extends Omit<ItemsListProps, 'stockItemsById' | 'loading'> {}

const ItemsListContainer = (props: ItemsListContainerProps) => {
  const { physicalStoreId, value, ...rest } = props;
  const _ids = value ? value.map(({ stockItemId }) => stockItemId) : [];
  const { data, loading } = useQuery(STOCK_ITEMS_BY_ID, {
    variables: {
      physicalStoreId: physicalStoreId ?? '',
      _ids,
    },
    skip: !physicalStoreId,
  });

  const stockItemsById = (data?.stockItemsById ?? []).filter(
    (row): row is StockItemRow => row != null
  );

  return (
    <ItemsList
      {...rest}
      physicalStoreId={physicalStoreId}
      value={value}
      loading={loading}
      stockItemsById={stockItemsById}
    />
  );
};

export default ItemsListContainer;
