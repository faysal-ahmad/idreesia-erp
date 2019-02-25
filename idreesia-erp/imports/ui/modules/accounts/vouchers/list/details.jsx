import React, { Component } from "react";
import PropTypes from "prop-types";
import { Icon, Table, Tooltip, Pagination } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import moment from "moment";
import { Formats } from "meteor/idreesia-common/constants";

const IconStyle = {
  cursor: "pointer",
  fontSize: 20,
};

class List extends Component {
  static propTypes = {
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    companyId: PropTypes.string,
    startDate: PropTypes.object,
    endDate: PropTypes.object,
    setPageParams: PropTypes.func,
    handleItemSelected: PropTypes.func,
    showNewButton: PropTypes.bool,
    handleNewClicked: PropTypes.func,
    handleViewClicked: PropTypes.func,

    loading: PropTypes.bool,
    pagedVouchers: PropTypes.shape({
      data: PropTypes.array,
      totalResults: PropTypes.number,
    }),
  };

  columns = [
    {
      title: "Voucher No.",
      dataIndex: "voucherNumber",
      key: "voucherNumber",
    },
    {
      title: "Voucher Date",
      dataIndex: "voucherDate",
      key: "voucherDate",
      render: text => {
        const date = moment(Number(text));
        return date.format("DD MMM, YYYY");
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      key: "action",
      render: (text, record) => (
        <Tooltip title="Details">
          <Icon
            type="bars"
            style={IconStyle}
            onClick={() => {
              this.onViewClicked(record);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  onChange = (pageIndex, pageSize) => {
    this.refreshPage({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  onShowSizeChange = (pageIndex, pageSize) => {
    this.refreshPage({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  onViewClicked = voucher => {
    const { handleViewClicked } = this.props;
    if (handleViewClicked) handleViewClicked(voucher);
  };

  render() {
    const { loading } = this.props;
    if (loading) return null;

    const {
      pageIndex,
      pageSize,
      pagedVouchers: { totalResults, data },
    } = this.props;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 10;

    return (
      <Table
        rowKey="_id"
        dataSource={data}
        columns={this.columns}
        bordered
        size="small"
        pagination={false}
        footer={() => (
          <Pagination
            defaultCurrent={1}
            defaultPageSize={10}
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
  query pagedVouchers($companyId: String!, $queryString: String) {
    pagedVouchers(companyId: $companyId, queryString: $queryString) {
      totalResults
      data {
        _id
        companyId
        externalReferenceId
        voucherNumber
        voucherDate
        description
        order
      }
    }
  }
`;

export default compose(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ companyId, startDate, endDate, pageIndex, pageSize }) => ({
      variables: {
        companyId,
        queryString: `?startDate=${
          startDate ? startDate.format(Formats.DATE_FORMAT) : ""
        }&endDate=${
          endDate ? endDate.format(Formats.DATE_FORMAT) : ""
        }&pageIndex=${pageIndex}&pageSize=${pageSize}`,
      },
    }),
  })
)(List);
