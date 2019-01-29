import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Table, Modal } from "antd";
import { filter, find } from "lodash";

import { default as ItemForm } from "./item-form";

const ButtonBarStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "flex-end",
  width: "100%",
};

export default class ItemsList extends Component {
  static propTypes = {
    physicalStoreId: PropTypes.string,
    stockItemsByPhysicalStore: PropTypes.array,

    readOnly: PropTypes.bool,
    value: PropTypes.array,
    onChange: PropTypes.func,

    inflowLabel: PropTypes.string,
    outflowLabel: PropTypes.string,
  };

  static defaultProps = {
    readOnly: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      showForm: false,
      physicalStoreId: props.physicalStoreId,
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

  itemForm = null;
  stockItemsTable = null;

  handleNewItemClicked = () => {
    this.setState({ showForm: true });
  };

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

  handleNewItemFormCancelled = () => {
    this.setState({ showForm: false });
  };

  handleNewItemFormSaved = () => {
    this.itemForm.validateFields(null, (errors, values) => {
      if (!errors) {
        const { stockItemId, quantity, status } = values;
        const { stockItems } = this.state;
        const isInflow = status === "inflow";
        // If we have an existing item against this itemStockId, then add the
        // count to the existing item instead of adding a new item.
        const existingItem = find(stockItems, { stockItemId, isInflow });
        if (!existingItem) {
          stockItems.push({ stockItemId, quantity, isInflow });
        } else {
          existingItem.quantity += quantity;
        }

        const state = Object.assign({}, this.state, {
          showForm: false,
          stockItems,
        });
        this.setState(state);

        const { onChange } = this.props;
        if (onChange) {
          onChange(stockItems);
        }
      }
    });
  };

  handleRowSelectionChanged = selectedRowKeys => {
    const state = Object.assign({}, this.state, {
      selectedStockItemIds: selectedRowKeys,
    });
    this.setState(state);
  };

  getItemTypeName(stockItemId) {
    const { stockItemsByPhysicalStore } = this.props;
    const stockItem = find(stockItemsByPhysicalStore, { _id: stockItemId });
    if (stockItem) return stockItem.itemTypeFormattedName;
    return null;
  }

  columns = () => {
    const { inflowLabel, outflowLabel } = this.props;

    return [
      {
        title: "Item Name",
        dataIndex: "stockItemId",
        key: "stockItemId",
        render: text => this.getItemTypeName(text),
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

  render() {
    const { showForm, selectedStockItemIds } = this.state;
    const {
      physicalStoreId,
      stockItemsByPhysicalStore,
      readOnly,
      inflowLabel,
      outflowLabel,
    } = this.props;
    const rowSelection = readOnly
      ? null
      : {
          selectedRowKeys: selectedStockItemIds,
          onChange: this.handleRowSelectionChanged,
        };

    return (
      <React.Fragment>
        <Table
          ref={t => {
            this.stockItemsTable = t;
          }}
          rowKey="stockItemId"
          rowSelection={rowSelection}
          columns={this.columns()}
          bordered
          pagination={false}
          dataSource={this.state.stockItems}
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
                    &nbsp;
                    <Button
                      type="primary"
                      icon="plus-circle-o"
                      onClick={this.handleNewItemClicked}
                      disabled={!physicalStoreId}
                    >
                      Add Item
                    </Button>
                  </div>
                )
          }
        />
        <Modal
          visible={showForm}
          title="Add New Item"
          okText="Save"
          destroyOnClose
          onOk={this.handleNewItemFormSaved}
          onCancel={this.handleNewItemFormCancelled}
        >
          <ItemForm
            ref={f => {
              this.itemForm = f;
            }}
            inflowLabel={inflowLabel}
            outflowLabel={outflowLabel}
            stockItems={stockItemsByPhysicalStore}
          />
        </Modal>
      </React.Fragment>
    );
  }
}