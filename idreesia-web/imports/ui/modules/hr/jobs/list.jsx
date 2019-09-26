import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { flowRight } from "lodash";

import { Button, Icon, Table, Tooltip, message } from "/imports/ui/controls";
import { WithBreadcrumbs } from "/imports/ui/composers";
import { HRSubModulePaths as paths } from "/imports/ui/modules/hr";
import { WithAllJobs } from "/imports/ui/modules/hr/common/composers";

const IconStyle = {
  cursor: "pointer",
  fontSize: 20,
};

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    allJobs: PropTypes.array,
    allJobsLoading: PropTypes.bool,
    removeJob: PropTypes.func,
  };

  columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Link to={`${paths.jobsEditFormPath(record._id)}`}>{text}</Link>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Employees",
      dataIndex: "usedCount",
      key: "usedCount",
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
    history.push(paths.jobsNewFormPath);
  };

  handleDeleteClicked = record => {
    const { removeJob } = this.props;
    removeJob({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { allJobs, allJobsLoading } = this.props;
    if (allJobsLoading) return null;

    return (
      <Table
        rowKey="_id"
        dataSource={allJobs}
        columns={this.columns}
        bordered
        pagination={{ defaultPageSize: 20 }}
        title={() => (
          <Button
            type="primary"
            icon="plus-circle-o"
            onClick={this.handleNewClicked}
          >
            New Job
          </Button>
        )}
      />
    );
  }
}

const removeJobMutation = gql`
  mutation removeJob($_id: String!) {
    removeJob(_id: $_id)
  }
`;

export default flowRight(
  WithAllJobs(),
  graphql(removeJobMutation, {
    name: "removeJob",
    options: {
      refetchQueries: ["allJobs"],
    },
  }),
  WithBreadcrumbs(["HR", "Jobs", "List"])
)(List);
