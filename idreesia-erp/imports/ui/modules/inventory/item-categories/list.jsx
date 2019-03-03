import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Button, Table } from "antd";
import { compose } from "react-apollo";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { InventorySubModulePaths as paths } from "/imports/ui/modules/inventory";
import {
  WithPhysicalStoreId,
  WithItemCategoriesByPhysicalStore,
} from "/imports/ui/modules/inventory/common/composers";

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
    itemCategoriesLoading: PropTypes.bool,
    itemCategoriesByPhysicalStoreId: PropTypes.array,
  };

  columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Link
          to={`${paths.itemCategoriesEditFormPath(
            this.props.physicalStoreId,
            record._id
          )}`}
        >
          {text}
        </Link>
      ),
    },
    {
      title: "Stock Items Count",
      dataIndex: "stockItemCount",
      key: "stockItemCount",
    },
  ];

  handleNewClicked = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.itemCategoriesNewFormPath(physicalStoreId));
  };

  render() {
    const {
      itemCategoriesLoading,
      itemCategoriesByPhysicalStoreId,
    } = this.props;
    if (itemCategoriesLoading) return null;

    return (
      <Table
        rowKey="_id"
        dataSource={itemCategoriesByPhysicalStoreId}
        columns={this.columns}
        bordered
        title={() => (
          <Button
            type="primary"
            icon="plus-circle-o"
            onClick={this.handleNewClicked}
          >
            New Item Category
          </Button>
        )}
      />
    );
  }
}

export default compose(
  WithPhysicalStoreId(),
  WithItemCategoriesByPhysicalStore(),
  WithBreadcrumbs(["Inventory", "Setup", "Item Categories", "List"])
)(List);
