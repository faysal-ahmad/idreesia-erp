import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Button, Table } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { InventorySubModulePaths as paths } from "/imports/ui/modules/inventory";

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
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
    const { allLocations } = this.props;

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

const listQuery = gql`
  query allLocations {
    allLocations {
      _id
      name
      description
    }
  }
`;

export default compose(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  WithBreadcrumbs(["Inventory", "Setup", "Locations", "List"])
)(List);
