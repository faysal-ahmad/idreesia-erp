import React, { Component } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { Button, Table } from "antd";
import { filter, find } from "lodash";

import { default as ItemForm } from "./item-form";

const ButtonBarStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "flex-end",
  width: "100%",
};

class ItemsList extends Component {
  static propTypes = {
    readOnly: PropTypes.bool,
    value: PropTypes.array,
    onChange: PropTypes.func,
    physicalStoreId: PropTypes.string,
    inflowLabel: PropTypes.string,
    outflowLabel: PropTypes.string,
    loading: PropTypes.bool,
    stockItemsById: PropTypes.array,
    refForm: PropTypes.object,
  };

  static defaultProps = {
    readOnly: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      referenceStockItems: [],
      stockItems: props.value
        ? props.value.map(({ stockItemId, quantity, isInflow }) => ({
            stockItemId,
            quantity,
            isInflow,
          }))
        : [],
      selectedStockItemIds: [],
    };
  }

  handleRemoveItemClicked = () => {
    const { stockItems, selectedStockItemIds } = this.state;
    if (selectedStockItemIds && selectedStockItemIds.length > 0) {
      const updatedItemStocks = filter(
        stockItems,
        stockItem => selectedStockItemIds.indexOf(stockItem.stockItemId) === -1
      );

      const state = Object.assign({}, this.state, {
        stockItems: updatedItemStocks,
        selectedStockItemIds: [],
      });
      this.setState(state);

      const { onChange } = this.props;
      if (onChange) {
        onChange(updatedItemStocks);
      }
    }
  };

  handleAddItem = () => {
    const { refForm } = this.props;
    const { referenceStockItems } = this.state;
    const { stockItem, quantity, status } = refForm.getFieldsValue();
    if (!stockItem || !quantity || !status) return;

    // Save this stock item in the state so that we can use it to display the label
    referenceStockItems.push(stockItem);
    debugger;

    const { stockItems } = this.state;
    const isInflow = status === "inflow";
    // If we have an existing item against this itemStockId, then add the
    // count to the existing item instead of adding a new item.
    const existingItem = find(stockItems, {
      stockItemId: stockItem._id,
      isInflow,
    });
    if (!existingItem) {
      stockItems.push({ stockItemId: stockItem._id, quantity, isInflow });
    } else {
      existingItem.quantity += quantity;
    }

    this.setState({ stockItems });
    const { onChange } = this.props;
    if (onChange) {
      onChange(stockItems);
    }

    refForm.resetFields(["stockItem", "quantity", "status"]);
  };

  handleRowSelectionChanged = selectedRowKeys => {
    const state = Object.assign({}, this.state, {
      selectedStockItemIds: selectedRowKeys,
    });
    this.setState(state);
  };

  getStockItemName(stockItemId) {
    const { stockItemsById } = this.props;
    const { referenceStockItems } = this.state;

    const allStockItems = referenceStockItems.concat(stockItemsById);
    const stockItem = find(allStockItems, { _id: stockItemId });
    if (stockItem) return stockItem.formattedName;
    return null;
  }

  columns = () => {
    const { inflowLabel, outflowLabel } = this.props;

    return [
      {
        title: "Item Name",
        dataIndex: "stockItemId",
        key: "stockItemId",
        render: text => this.getStockItemName(text),
      },
      {
        title: "Quantity",
        dataIndex: "quantity",
        key: "quantity",
        render: (text, record) => {
          if (record.isInflow) {
            return `${text} ${inflowLabel}`;
          }
          return `${text} ${outflowLabel}`;
        },
      },
    ];
  };

  getTableHeader = () => {
    const {
      refForm,
      readOnly,
      physicalStoreId,
      inflowLabel,
      outflowLabel,
    } = this.props;

    if (readOnly) return null;
    return (
      <ItemForm
        refForm={refForm}
        physicalStoreId={physicalStoreId}
        inflowLabel={inflowLabel}
        outflowLabel={outflowLabel}
        handleAddItem={this.handleAddItem}
      />
    );
  };

  render() {
    const { loading, readOnly } = this.props;
    if (loading) return null;
    const { selectedStockItemIds } = this.state;
    const rowSelection = readOnly
      ? null
      : {
          selectedRowKeys: selectedStockItemIds,
          onChange: this.handleRowSelectionChanged,
        };

    return (
      <Table
        rowKey={item =>
          `${item.stockItemId}_${item.isInflow ? "inflow" : "outflow"}`
        }
        rowSelection={rowSelection}
        columns={this.columns()}
        bordered
        pagination={false}
        dataSource={this.state.stockItems}
        title={this.getTableHeader}
        footer={
          this.props.readOnly
            ? null
            : () => (
                <div style={ButtonBarStyle}>
                  <Button
                    type="default"
                    icon="minus-circle-o"
                    onClick={this.handleRemoveItemClicked}
                    disabled={selectedStockItemIds.length === 0}
                  >
                    Remove Item
                  </Button>
                </div>
              )
        }
      />
    );
  }
}

const stockItemsByIdQuery = gql`
  query stockItemsById($_ids: [String]!) {
    stockItemsById(_ids: $_ids) {
      _id
      name
      formattedName
    }
  }
`;

export default graphql(stockItemsByIdQuery, {
  props: ({ data }) => ({ ...data }),
  options: ({ value }) => {
    const _ids = value ? value.map(({ stockItemId }) => stockItemId) : [];
    return { variables: { _ids } };
  },
})(ItemsList);
