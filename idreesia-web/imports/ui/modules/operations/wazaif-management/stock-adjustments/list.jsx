import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { CheckSquareOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  Pagination,
  Popconfirm,
  Table,
  Tooltip,
  message,
} from 'antd';

import {
  flowRight,
  toSafeInteger,
} from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import { WithBreadcrumbs, WithQueryParams } from 'meteor/idreesia-common/composers/common';
import { WazeefaName } from '/imports/ui/modules/helpers/controls';

import ListFilter from './list-filter';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    queryString: PropTypes.string,
    queryParams: PropTypes.object,

    loading: PropTypes.bool,
    refetchListQuery: PropTypes.func,
    pagedWazaifStockAdjustments: PropTypes.shape({
      totalResults: PropTypes.number,
      data: PropTypes.array,
    }),
    removeStockAdjustment: PropTypes.func,
    approveStockAdjustment: PropTypes.func,
  };

  columns = [
    {
      title: 'Wazeefa Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <WazeefaName
          wazeefa={record.refWazeefa}
          onWazeefaNameClicked={() => {}}
        />
      ),
    },
    {
      title: 'Adjustment',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Adjustment Date',
      dataIndex: 'adjustmentDate',
      key: 'adjustmentDate',
      render: text => {
        const date = moment(Number(text));
        return date.format('DD MMM, YYYY');
      },
    },
    {
      title: 'Adjusted By',
      key: 'adjustedBy',
      render: (text, record) => record?.refAdjustedBy?.sharedData?.name,
    },
    {
      title: 'Adjustment Reason',
      dataIndex: 'adjustmentReason',
      key: 'adjustmentReason',
    },
    {
      key: 'action',
      render: (text, record) => {
        debugger;
        if (!record.approvedOn) {
          return (
            <div className="list-actions-column">
              <Tooltip title="Approve">
                <CheckSquareOutlined
                  className="list-actions-icon"
                  onClick={() => {
                    this.handleApproveClicked(record);
                  }}
                />
              </Tooltip>
              <Popconfirm
                title="Are you sure you want to delete this stock adjustment?"
                onConfirm={() => {
                  this.handleDeleteClicked(record);
                }}
                okText="Yes"
                cancelText="No"
              >
                <Tooltip title="Delete">
                  <DeleteOutlined className="list-actions-icon" />
                </Tooltip>
              </Popconfirm>
            </div>
          );
        }

        return null;
      },
    },
  ];

  refreshPage = newParams => {
    const {
      approvalStatus,
      startDate,
      endDate,
      pageIndex,
      pageSize,
    } = newParams;
    const { queryParams, history, location } = this.props;

    let showApprovedVal;
    let showUnapprovedVal;
    if (newParams.hasOwnProperty('approvalStatus')) {
      showApprovedVal =
        approvalStatus.indexOf('approved') !== -1 ? 'true' : 'false';
      showUnapprovedVal =
        approvalStatus.indexOf('unapproved') !== -1 ? 'true' : 'false';
    } else {
      showApprovedVal = queryParams.showApproved || 'true';
      showUnapprovedVal = queryParams.showUnapproved || 'true';
    }

    let startDateVal;
    if (newParams.hasOwnProperty('startDate'))
      startDateVal = startDate ? startDate.format(Formats.DATE_FORMAT) : '';
    else startDateVal = queryParams.startDateVal || '';

    let endDateVal;
    if (newParams.hasOwnProperty('endDate'))
      endDateVal = endDate ? endDate.format(Formats.DATE_FORMAT) : '';
    else endDateVal = queryParams.endDateVal || '';

    let pageIndexVal;
    if (newParams.hasOwnProperty('pageIndex')) pageIndexVal = pageIndex || 0;
    else pageIndexVal = queryParams.pageIndex || 0;

    let pageSizeVal;
    if (newParams.hasOwnProperty('pageSize')) pageSizeVal = pageSize || 20;
    else pageSizeVal = queryParams.pageSize || 20;

    const path = `${location.pathname}?showApproved=${showApprovedVal}&showUnapproved=${showUnapprovedVal}&startDate=${startDateVal}&endDate=${endDateVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
  };

  handleDeleteClicked = stockAdjustment => {
    const { removeStockAdjustment } = this.props;
    removeStockAdjustment({
      variables: { _id: stockAdjustment._id },
    })
      .then(() => {
        message.success('Stock adjustment has been deleted.', 5);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  handleApproveClicked = stockAdjustment => {
    const { approveStockAdjustment } = this.props;
    approveStockAdjustment({
      variables: { _id: stockAdjustment._id },
    })
      .then(() => {
        message.success('Stock adjustment has been approved.', 5);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

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

  getTableHeader = () => {
    const { queryParams, refetchListQuery } = this.props;

    return (
      <div className="list-table-header">
        <div />
        <ListFilter
          refreshPage={this.refreshPage}
          queryParams={queryParams}
          refreshData={refetchListQuery}
        />
      </div>
    );
  };

  render() {
    const { loading } = this.props;
    if (loading) return null;

    const {
      queryParams: { pageIndex, pageSize },
      pagedWazaifStockAdjustments: { totalResults, data },
    } = this.props;

    const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
    const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

    return (
      <Table
        rowKey="_id"
        dataSource={data}
        columns={this.columns}
        bordered
        title={this.getTableHeader}
        size="small"
        pagination={false}
        footer={() => (
          <Pagination
            defaultCurrent={1}
            defaultPageSize={20}
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

const formMutationRemove = gql`
  mutation removeStockAdjustment($_id: String!) {
    removeStockAdjustment(_id: $_id)
  }
`;

const formMutationApprove = gql`
  mutation approveStockAdjustment($_id: String!) {
    approveStockAdjustment(_id: $_id) {
      _id
      physicalStoreId
      stockItemId
      adjustmentDate
      adjustedBy
      quantity
      isInflow
      adjustmentReason
      approvedOn
      approvedBy
    }
  }
`;

const listQuery = gql`
  query pagedWazaifStockAdjustments($queryString: String) {
    pagedWazaifStockAdjustments(
      queryString: $queryString
    ) {
      totalResults
      data {
        _id
        wazeefaId
        adjustmentDate
        adjustedBy
        quantity
        adjustmentReason
        approvedOn
        refWazeefa {
          _id
          name
          imageIds
          images {
            _id
            name
          }
        }
        refAdjustedBy {
          _id
          sharedData {
            name
          }
        }
      }
    }
  }
`;

export default flowRight(
  WithQueryParams(),
  graphql(formMutationRemove, {
    name: 'removeStockAdjustment',
    options: {
      refetchQueries: [
        'pagedWazaifStockAdjustments',
      ],
    },
  }),
  graphql(formMutationApprove, {
    name: 'approveStockAdjustment',
    options: {
      refetchQueries: [
        'pagedWazaifStockAdjustments',
      ],
    },
  }),
  graphql(listQuery, {
    props: ({ data }) => ({ refetchListQuery: data.refetch, ...data }),
    options: ({ queryString }) => ({
      variables: { queryString },
    }),
  }),
  WithBreadcrumbs(['Operations', 'Wazaif Management', 'Stock Adjustments'])
)(List);
