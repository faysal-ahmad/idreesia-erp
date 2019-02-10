import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Button, Table } from "antd";
import { compose } from "react-apollo";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { InventorySubModulePaths as paths } from "/imports/ui/modules/inventory";
import { WithLocations } from "/imports/ui/modules/inventory/common/composers";

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    locationsListLoading: PropTypes.bool,
    allLocations: PropTypes.array,
  };

  columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Link to={`${paths.locationsPath}/${record._id}`}>{text}</Link>
      ),
    },
    {
      title: "Parent Location",
      dataIndex: "parentId",
      key: "parentId",
      render: (text, record) => (
        <Link to={`${paths.locationsPath}/${record.parentId}`}>
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
    const { history } = this.props;
    history.push(paths.locationsNewFormPath);
  };

  render() {
    const { locationsListLoading, allLocations } = this.props;
    if (locationsListLoading) return null;

    return (
      <Table
        rowKey="_id"
        dataSource={allLocations}
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

export default compose(
  WithLocations(),
  WithBreadcrumbs(["Inventory", "Setup", "Locations", "List"])
)(List);
