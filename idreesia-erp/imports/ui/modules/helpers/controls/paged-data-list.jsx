import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Pagination, Table } from "antd";
import { toSafeInteger } from "lodash";

const ToolbarStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
};

export default class PagedDataList extends Component {
  static propTypes = {
    columns: PropTypes.array,
    queryParams: PropTypes.object,
    pagedData: PropTypes.shape({
      data: PropTypes.array,
      totalResults: PropTypes.number,
    }),
    newButtonLabel: PropTypes.string,
    refreshPage: PropTypes.func,
    handleNewClicked: PropTypes.func,
    ListFilter: PropTypes.element,
  };

  onChange = (pageIndex, pageSize) => {
    const { refreshPage } = this.props;
    refreshPage({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  onShowSizeChange = (pageIndex, pageSize) => {
    const { refreshPage } = this.props;
    refreshPage({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  getTableHeader = () => {
    const {
      queryParams,
      newButtonLabel,
      handleNewClicked,
      refreshPage,
      ListFilter,
    } = this.props;

    return (
      <div style={ToolbarStyle}>
        <Button type="primary" icon="plus-circle-o" onClick={handleNewClicked}>
          {newButtonLabel}
        </Button>
        <ListFilter refreshPage={refreshPage} queryParams={queryParams} />
      </div>
    );
  };

  render() {
    const { columns } = this.props;

    const {
      queryParams: { pageIndex, pageSize },
      pagedData: { totalResults, data },
    } = this.props;

    const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
    const numPageSize = pageSize ? toSafeInteger(pageSize) : 10;

    return (
      <Table
        rowKey="_id"
        dataSource={data}
        columns={columns}
        bordered
        title={this.getTableHeader}
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
