import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Icon, Pagination, Table, Tooltip } from "antd";
import moment from "moment";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

const ToolbarStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "space-between",
  alignItems: "center",
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
    companyId: PropTypes.string,
    setPageParams: PropTypes.func,
    showNewButton: PropTypes.bool,
    handleNewClicked: PropTypes.func,
    handleDeleteClicked: PropTypes.func,

    loading: PropTypes.bool,
    pagedDataImports: PropTypes.shape({
      data: PropTypes.array,
      totalResults: PropTypes.number,
    }),
  };

  columns = [
    {
      title: "Created On",
      dataIndex: "createdAt",
      key: "createdAt",
      render: text => {
        const date = moment(new Date(text));
        return date.format("DD-MM-YY hh:mm a");
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
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
      title: "Actions",
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

  getTableHeader = () => {
    const { showNewButton, handleNewClicked } = this.props;

    let newButton = null;
    if (showNewButton) {
      newButton = (
        <Button type="primary" icon="plus-circle-o" onClick={handleNewClicked}>
          New Data Import
        </Button>
      );
    }

    return <div style={ToolbarStyle}>{newButton}</div>;
  };

  render() {
    const { loading } = this.props;
    if (loading) return null;

    const {
      pageIndex,
      pageSize,
      pagedDataImports: { totalResults, data },
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
  query pagedDataImports(
    $companyId: String!
    $pageIndex: Float!
    $pageSize: Float!
  ) {
    pagedDataImports(
      companyId: $companyId
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        _id
        companyId
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

export default compose(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ companyId, pageIndex, pageSize }) => ({
      variables: {
        companyId,
        pageIndex,
        pageSize,
      },
    }),
  })
)(List);
