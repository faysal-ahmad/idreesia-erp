import React, { Component } from "react";
import PropTypes from "prop-types";
import { capitalize } from "lodash";
import { Button, Icon, Pagination, Select, Table, Tooltip } from "antd";
import moment from "moment";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { flowRight } from "lodash";

import { JobTypes } from "meteor/idreesia-common/constants";

import ListFilter from "./list-filter";

const ToolbarStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "space-between",
  width: "100%",
};

const ActionsStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
};

const IconStyle = {
  cursor: "pointer",
  fontSize: 20,
};

class List extends Component {
  static propTypes = {
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    jobType: PropTypes.string,
    status: PropTypes.string,
    setPageParams: PropTypes.func,
    handleNewClicked: PropTypes.func,
    handleDeleteClicked: PropTypes.func,

    loading: PropTypes.bool,
    pagedAdminJobs: PropTypes.shape({
      data: PropTypes.array,
      totalResults: PropTypes.number,
    }),
  };

  state = {
    selectedJobType: JobTypes.ACCOUNTS_IMPORT,
  };

  columns = [
    {
      title: "Job Type",
      dataIndex: "jobType",
      key: "jobType",
    },
    {
      title: "Job Details",
      dataIndex: "jobDetails",
      key: "jobDetails",
    },
    {
      title: "Created On",
      dataIndex: "createdAt",
      key: "createdAt",
      render: text => {
        const date = moment(Number(text));
        return date.format("DD-MM-YY hh:mm a");
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: text => capitalize(text),
    },
    {
      title: "Logs",
      dataIndex: "logs",
      key: "logs",
      render: logs => {
        let counter = 0;
        const logNodes = logs.map(log => <li key={counter++}>{log}</li>);
        return <ul>{logNodes}</ul>;
      },
    },
    {
      key: "action",
      render: (text, record) => {
        if (record.status === "completed" || record.status === "errored") {
          return (
            <div style={ActionsStyle}>
              <Tooltip title="Delete">
                <Icon
                  type="delete"
                  style={IconStyle}
                  onClick={() => {
                    this.props.handleDeleteClicked(record._id);
                  }}
                />
              </Tooltip>
            </div>
          );
        }

        return null;
      },
    },
  ];

  onChange = (pageIndex, pageSize) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  onShowSizeChange = (pageIndex, pageSize) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  handleNewClicked = () => {
    const { selectedJobType } = this.state;
    const { handleNewClicked } = this.props;
    handleNewClicked(selectedJobType);
  };

  getTableHeader = () => {
    const { jobType, status, setPageParams } = this.props;
    return (
      <div style={ToolbarStyle}>
        <div>
          <Select
            defaultValue={this.state.selectedJobType}
            allowClear={false}
            onChange={value => {
              this.setState({
                selectedJobType: value,
              });
            }}
          >
            <Select.Option value={JobTypes.ACCOUNTS_IMPORT}>
              Accounts Import
            </Select.Option>
            <Select.Option value={JobTypes.VOUCHERS_IMPORT}>
              Vouchers Import
            </Select.Option>
            <Select.Option value={JobTypes.ACCOUNTS_CALCULATION}>
              Accounts Calculation
            </Select.Option>
          </Select>
          &nbsp;&nbsp;
          <Button
            type="primary"
            icon="plus-circle-o"
            onClick={this.handleNewClicked}
          >
            Create Admin Job
          </Button>
        </div>
        <ListFilter
          jobType={jobType}
          status={status}
          setPageParams={setPageParams}
        />
      </div>
    );
  };

  render() {
    const { loading } = this.props;
    if (loading) return null;

    const {
      pageIndex,
      pageSize,
      pagedAdminJobs: { totalResults, data },
    } = this.props;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 10;

    return (
      <Table
        rowKey="_id"
        dataSource={data}
        columns={this.columns}
        title={this.getTableHeader}
        bordered
        size="small"
        pagination={false}
        footer={() => (
          <Pagination
            current={numPageIndex}
            pageSize={numPageSize}
            showSizeChanger
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
            onChange={this.onChange}
            onShowSizeChange={this.onShowSizeChange}
            total={totalResults}
          />
        )}
      />
    );
  }
}

const listQuery = gql`
  query pagedAdminJobs(
    $jobType: String
    $status: String
    $pageIndex: Float!
    $pageSize: Float!
  ) {
    pagedAdminJobs(
      jobType: $jobType
      status: $status
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        _id
        jobType
        jobDetails
        status
        logs
        createdAt
        createdBy
        updatedAt
        updatedBy
      }
    }
  }
`;

export default flowRight(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ jobType, status, pageIndex, pageSize }) => ({
      variables: {
        jobType,
        status,
        pageIndex,
        pageSize,
      },
    }),
  })
)(List);
