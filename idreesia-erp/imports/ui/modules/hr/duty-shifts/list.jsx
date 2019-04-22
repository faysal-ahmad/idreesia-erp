import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import moment from "moment";
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
    allDutyShifts: PropTypes.array,
    removeDutyShift: PropTypes.func,
  };

  columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Link to={`${paths.dutyShiftsPath}/${record._id}`}>{text}</Link>
      ),
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
      key: "startTime",
      render: text => {
        const startTime = moment(text);
        return startTime.isValid() ? startTime.format("h:mm a") : null;
      },
    },
    {
      title: "End Time",
      dataIndex: "endTime",
      key: "endTime",
      render: text => {
        const endTime = moment(text);
        return endTime.isValid() ? endTime.format("h:mm a") : null;
      },
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
    history.push(paths.dutyShiftsNewFormPath);
  };

  handleDeleteClicked = record => {
    const { removeDutyShift } = this.props;
    removeDutyShift({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { allDutyShifts } = this.props;

    return (
      <Table
        rowKey="_id"
        dataSource={allDutyShifts}
        columns={this.columns}
        bordered
        title={() => (
          <Button
            type="primary"
            icon="plus-circle-o"
            onClick={this.handleNewClicked}
          >
            New Duty Shift
          </Button>
        )}
      />
    );
  }
}

const listQuery = gql`
  query allDutyShifts {
    allDutyShifts {
      _id
      name
      startTime
      endTime
      usedCount
    }
  }
`;

const removeDutyShiftMutation = gql`
  mutation removeDutyShift($_id: String!) {
    removeDutyShift(_id: $_id)
  }
`;

export default compose(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  graphql(removeDutyShiftMutation, {
    name: "removeDutyShift",
    options: {
      refetchQueries: ["allDutyShifts"],
    },
  }),
  WithBreadcrumbs(["HR", "Setup", "Duty Shifts", "List"])
)(List);
