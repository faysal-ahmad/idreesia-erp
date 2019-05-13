import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Button, Icon, Table, Tooltip, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

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
    allDuties: PropTypes.array,
    removeDuty: PropTypes.func,
  };

  columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Link to={`${paths.dutiesEditFormPath(record._id)}`}>{text}</Link>
      ),
    },
    {
      key: "action",
      render: (text, record) => {
        if (record.usedCount === 0) {
          return (
            <Tooltip key="delete" title="Delete">
              <Icon
                type="delete"
                style={IconStyle}
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
    history.push(paths.dutiesNewFormPath);
  };

  handleDeleteClicked = record => {
    const { removeDuty } = this.props;
    removeDuty({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { allDuties } = this.props;

    return (
      <Table
        rowKey="_id"
        dataSource={allDuties}
        columns={this.columns}
        bordered
        title={() => (
          <Button
            type="primary"
            icon="plus-circle-o"
            onClick={this.handleNewClicked}
          >
            New Duty
          </Button>
        )}
      />
    );
  }
}

const listQuery = gql`
  query allDuties {
    allDuties {
      _id
      name
      usedCount
    }
  }
`;

const removeDutyMutation = gql`
  mutation removeDuty($_id: String!) {
    removeDuty(_id: $_id)
  }
`;

export default compose(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  graphql(removeDutyMutation, {
    name: "removeDuty",
    options: {
      refetchQueries: ["allDuties"],
    },
  }),
  WithBreadcrumbs(["HR", "Duties", "List"])
)(List);
