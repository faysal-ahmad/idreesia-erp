import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Button, Table } from "antd";
import { flowRight } from "lodash";

import { WithDynamicBreadcrumbs } from "/imports/ui/composers";
import { InventorySubModulePaths as paths } from "/imports/ui/modules/inventory";
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
  WithLocationsByPhysicalStore,
} from "/imports/ui/modules/inventory/common/composers";

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,
    locationsLoading: PropTypes.bool,
    locationsByPhysicalStoreId: PropTypes.array,
  };

  columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Link
          to={`${paths.locationsEditFormPath(
            this.props.physicalStoreId,
            record._id
          )}`}
        >
          {text}
        </Link>
      ),
    },
    {
      title: "Parent Location",
      dataIndex: "parentId",
      key: "parentId",
      render: (text, record) => (
        <Link
          to={`${paths.itemCategoriesEditFormPath(
            this.props.physicalStoreId,
            record.parentId
          )}`}
        >
          {record.refParent ? record.refParent.name : ""}
        </Link>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
  ];

  handleNewClicked = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.locationsNewFormPath(physicalStoreId));
  };

  render() {
    const { locationsLoading, locationsByPhysicalStoreId } = this.props;
    if (locationsLoading) return null;

    return (
      <Table
        rowKey="_id"
        dataSource={locationsByPhysicalStoreId}
        columns={this.columns}
        bordered
        title={() => (
          <Button
            type="primary"
            icon="plus-circle-o"
            onClick={this.handleNewClicked}
          >
            New Location
          </Button>
        )}
      />
    );
  }
}

export default flowRight(
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  WithLocationsByPhysicalStore(),
  WithDynamicBreadcrumbs(({ physicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Setup, Locations, List`;
    }
    return `Inventory, Setup, Locations, List`;
  })
)(List);
