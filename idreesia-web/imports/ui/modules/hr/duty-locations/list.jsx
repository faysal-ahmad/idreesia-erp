import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Button, Icon, Table, Tooltip, message } from "antd";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { flowRight } from "lodash";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { HRSubModulePaths as paths } from "/imports/ui/modules/hr";

const IconStyle = {
  cursor: "pointer",
  fontSize: 20,
};

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    allDutyLocations: PropTypes.array,
    removeDutyLocation: PropTypes.func,
  };

  columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Link to={`${paths.dutyLocationsPath}/${record._id}`}>{text}</Link>
      ),
    },
    {
      key: "action",
      render: (text, record) => {
        if (record.usedCount === 0) {
          return (
            <Tooltip title="Delete">
              <Icon
                style={IconStyle}
                type="delete"
                onClick={() => {
                  this.handleDeleteClicked(record);
                }}
              />
            </Tooltip>
          );
        }
        return null;
      },
    },
  ];

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.dutyLocationsNewFormPath);
  };

  handleDeleteClicked = record => {
    const { removeDutyLocation } = this.props;
    removeDutyLocation({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { allDutyLocations } = this.props;

    return (
      <Table
        rowKey="_id"
        dataSource={allDutyLocations}
        columns={this.columns}
        pagination={{ defaultPageSize: 20 }}
        bordered
        title={() => (
          <Button
            type="primary"
            icon="plus-circle-o"
            onClick={this.handleNewClicked}
          >
            New Duty Location
          </Button>
        )}
      />
    );
  }
}

const listQuery = gql`
  query allDutyLocations {
    allDutyLocations {
      _id
      name
      usedCount
    }
  }
`;

const removeDutyLocationMutation = gql`
  mutation removeDutyLocation($_id: String!) {
    removeDutyLocation(_id: $_id)
  }
`;

export default flowRight(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  graphql(removeDutyLocationMutation, {
    name: "removeDutyLocation",
    options: {
      refetchQueries: ["allDutyLocations"],
    },
  }),
  WithBreadcrumbs(["HR", "Setup", "Duty Locations", "List"])
)(List);
