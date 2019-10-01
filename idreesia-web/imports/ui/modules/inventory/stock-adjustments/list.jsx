import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import {
  flowRight,
  toSafeInteger,
} from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import {
  WithDynamicBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import {
  Button,
  Icon,
  Pagination,
  Popconfirm,
  Table,
  Tooltip,
  message,
} from '/imports/ui/controls';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
} from '/imports/ui/modules/inventory/common/composers';
import { getNameWithImageRenderer } from '/imports/ui/modules/helpers/controls';

import ListFilter from './list-filter';

const ToolbarStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
};

const ActionsStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
};

const IconStyle = {
  cursor: 'pointer',
  fontSize: 20,
};

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    queryString: PropTypes.string,
    queryParams: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,

    loading: PropTypes.bool,
    refetchListQuery: PropTypes.func,
    pagedStockAdjustments: PropTypes.shape({
      totalResults: PropTypes.number,
      data: PropTypes.array,
    }),
    removeStockAdjustment: PropTypes.func,
    approveStockAdjustment: PropTypes.func,
  };

  columns = [
    {
      title: 'Stock Item',
      dataIndex: 'refStockItem',
      key: 'stockItem',
      render: (text, record) => {
        const {
          _id,
          physicalStoreId,
          approvedOn,
          refStockItem: { formattedName, imageId },
        } = record;
        const path = approvedOn
          ? paths.stockAdjustmentsViewFormPath(physicalStoreId, _id)
          : paths.stockAdjustmentsEditFormPath(physicalStoreId, _id);
        return getNameWithImageRenderer(
          _id,
          imageId,
          formattedName,
          path,
          'picture'
        );
      },
    },
    {
      title: 'Adjustment',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text, record) => {
        if (record.isInflow) {
          return `Increased by ${text}`;
        }
        return `Decreased by ${text}`;
      },
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
      dataIndex: 'refAdjustedBy.name',
      key: 'adjustedBy',
    },
    {
      title: 'Actions',
      key: 'action',
      render: (text, record) => {
        if (!record.approvedOn) {
          return (
            <div style={ActionsStyle}>
              <Tooltip title="Approve">
                <Icon
                  type="check-square-o"
                  style={IconStyle}
                  onClick={() => {
                    this.handleApproveClicked(record);
                  }}
                />
              </Tooltip>
              <Tooltip title="Edit">
                <Icon
                  type="edit"
                  style={IconStyle}
                  onClick={() => {
                    this.handleEditClicked(record);
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
                  <Icon type="delete" style={IconStyle} />
                </Tooltip>
              </Popconfirm>
            </div>
          );
        }

        return (
          <Tooltip title="View">
            <Icon
              type="file"
              style={IconStyle}
              onClick={() => {
                this.handleViewClicked(record);
              }}
            />
          </Tooltip>
        );
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

  handleNewClicked = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.stockAdjustmentsNewFormPath(physicalStoreId));
  };

  handleEditClicked = record => {
    const { history, physicalStoreId } = this.props;
    history.push(
      paths.stockAdjustmentsEditFormPath(physicalStoreId, record._id)
    );
  };

  handleViewClicked = record => {
    const { history, physicalStoreId } = this.props;
    history.push(
      paths.stockAdjustmentsViewFormPath(physicalStoreId, record._id)
    );
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
      <div style={ToolbarStyle}>
        <Button
          type="primary"
          icon="plus-circle-o"
          onClick={this.handleNewClicked}
        >
          New Stock Adjustment
        </Button>
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
      pagedStockAdjustments: { totalResults, data },
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
  query pagedStockAdjustments($physicalStoreId: String!, $queryString: String) {
    pagedStockAdjustments(
      physicalStoreId: $physicalStoreId
      queryString: $queryString
    ) {
      totalResults
      data {
        _id
        physicalStoreId
        stockItemId
        adjustmentDate
        adjustedBy
        quantity
        isInflow
        adjustmentReason
        approvedOn
        refStockItem {
          _id
          formattedName
          imageId
        }
        refAdjustedBy {
          _id
          name
        }
      }
    }
  }
`;

export default flowRight(
  WithQueryParams(),
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  graphql(formMutationRemove, {
    name: 'removeStockAdjustment',
    options: {
      refetchQueries: [
        'pagedStockAdjustments',
        'stockAdjustmentsByStockItem',
        'pagedStockItems',
      ],
    },
  }),
  graphql(formMutationApprove, {
    name: 'approveStockAdjustment',
    options: {
      refetchQueries: [
        'pagedStockAdjustments',
        'stockAdjustmentsByStockItem',
        'pagedStockItems',
      ],
    },
  }),
  graphql(listQuery, {
    props: ({ data }) => ({ refetchListQuery: data.refetch, ...data }),
    options: ({ physicalStoreId, queryString }) => ({
      variables: { physicalStoreId, queryString },
    }),
  }),
  WithDynamicBreadcrumbs(({ physicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Stock Adjustments, List`;
    }
    return `Inventory, Stock Adjustments, List`;
  })
)(List);
