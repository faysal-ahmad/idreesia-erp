import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import {
  Button,
  Dropdown,
  Modal,
  Pagination,
  Table,
  Tooltip,
  message,
} from 'antd';
import {
  CheckSquareOutlined,
  DeleteOutlined,
  EditOutlined,
  FileExcelOutlined,
  FileOutlined,
  PlusCircleOutlined,
  PrinterOutlined,
  SettingOutlined,
} from '@ant-design/icons';

import {
  flowRight,
  toSafeInteger,
} from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import {
  WithDynamicBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
} from '/imports/ui/modules/inventory/common/composers';
import { getNameWithImageRenderer } from '/imports/ui/modules/helpers/controls';

import ListFilter from './list-filter';

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
    removeStockAdjustments: PropTypes.func,
    approveStockAdjustments: PropTypes.func,
  };

  state = {
    selectedRows: [],
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
      render: text => text ? dayjs(Number(text)).format('DD MMM, YYYY') : '',
    },
    {
      title: 'Adjusted By',
      dataIndex: ['refAdjustedBy', 'name'],
      key: 'adjustedBy',
    },
    {
      title: 'Actions',
      key: 'action',
      render: (text, record) => {
        if (!record.approvedOn) {
          return (
            <div className="list-actions-column">
              <Tooltip title="Edit">
                <EditOutlined
                  className="list-actions-icon"
                  onClick={() => {
                    this.handleEditClicked(record);
                  }}
                />
              </Tooltip>
            </div>
          );
        }

        return (
          <div className="list-actions-column">
            <Tooltip title="View">
              <FileOutlined
                className="list-actions-icon"
                onClick={() => {
                  this.handleViewClicked(record);
                }}
              />
            </Tooltip>
            <Tooltip title="Print">
              <PrinterOutlined
                className="list-actions-icon"
                onClick={() => {}}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      this.setState({
        selectedRows,
      });
    },
  };

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

  handleAction = ({ key }) => {
    const { selectedRows } = this.state;
    if (selectedRows.length === 0) return;

    if (key === 'approve') {
      this.handleApproveSelected();
    } else if (key === 'export') {
      this.handleExportSelected();
    } else if (key === 'delete') {
      Modal.confirm({
        title: 'Delete Stock Adjustment Forms',
        content:
          'Are you sure you want to delete the selected stock adjustment forms?',
        onOk: () => {
          this.handleDeleteSelected();
        },
      });
    }
  }

  handleDeleteSelected = () => {
    const { selectedRows } = this.state;
    const _ids = selectedRows.map(row => row._id);
    const { removeStockAdjustments, physicalStoreId } = this.props;
    removeStockAdjustments({
      variables: {
        _ids,
        physicalStoreId,
      },
    })
      .then(() => {
        message.success('Stock adjustments have been deleted.', 5);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  handleApproveSelected = () => {
    const { selectedRows } = this.state;
    const _ids = selectedRows.map(row => row._id);
    const { approveStockAdjustments, physicalStoreId } = this.props;
    approveStockAdjustments({
      variables: {
        _ids,
        physicalStoreId,
      },
    })
      .then(() => {
        message.success('Stock adjustments have been approved.', 5);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  handleExportSelected = () => {
    const { selectedRows } = this.state;
    const reportArgs = selectedRows.map(row => row._id);
    const url = `${
      window.location.origin
    }/generate-report?reportName=StockAdjustments&reportArgs=${reportArgs.join(
      ','
    )}`;
    window.open(url, '_blank');
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

  getActionsMenu = () => {
    const items = [
      {
        key: 'approve',
        label: 'Approve Selected',
        icon: <CheckSquareOutlined />,
      },
      {
        key: 'export',
        label: 'Export Selected',
        icon: <FileExcelOutlined />,
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        label: 'Delete Selected',
        icon: <DeleteOutlined />,
      },
    ];

    return (
      <Dropdown menu={{ items, onClick: this.handleAction }}>
        <Button icon={<SettingOutlined />} size="large" />
      </Dropdown>
    );
  };

  getTableHeader = () => {
    const { queryParams, refetchListQuery } = this.props;

    return (
      <div className="list-table-header">
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={this.handleNewClicked}
        >
          New Stock Adjustment
        </Button>
        <div className="list-table-header-section">
          <ListFilter
            refreshPage={this.refreshPage}
            queryParams={queryParams}
            refreshData={refetchListQuery}
          />
          &nbsp;&nbsp;
          {this.getActionsMenu()}
        </div>
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
        rowSelection={this.rowSelection}
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
  mutation removeStockAdjustments($physicalStoreId: String!, $_ids: [String]!) {
    removeStockAdjustments(physicalStoreId: $physicalStoreId, _ids: $_ids)
  }
`;

const formMutationApprove = gql`
  mutation approveStockAdjustments($physicalStoreId: String!, $_ids: [String]!) {
    approveStockAdjustments(physicalStoreId: $physicalStoreId, _ids: $_ids) {
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
    name: 's',
    options: {
      refetchQueries: [
        'pagedStockAdjustments',
        'stockAdjustmentsByStockItem',
        'pagedStockItems',
      ],
    },
  }),
  graphql(formMutationApprove, {
    name: 'approveStockAdjustments',
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
