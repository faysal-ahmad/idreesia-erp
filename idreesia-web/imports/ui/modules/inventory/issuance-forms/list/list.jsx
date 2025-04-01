import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { graphql } from 'react-apollo';
import {
  Button,
  Divider,
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
  WithLocationsByPhysicalStore,
} from '/imports/ui/modules/inventory/common/composers';

import ListFilter from './list-filter';
import {
  APPROVE_ISSUANCE_FORMS,
  PAGED_ISSUANCE_FORMS,
  REMOVE_ISSUANCE_FORMS,
} from '../gql';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    queryString: PropTypes.string,
    queryParams: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,

    locationsLoading: PropTypes.bool,
    locationsByPhysicalStoreId: PropTypes.array,
    loading: PropTypes.bool,
    refetchListQuery: PropTypes.func,
    pagedIssuanceForms: PropTypes.shape({
      totalResults: PropTypes.number,
      issuanceForms: PropTypes.array,
    }),
    removeIssuanceForms: PropTypes.func,
    approveIssuanceForms: PropTypes.func,
  };

  state = {
    selectedRows: [],
  };

  columns = [
    {
      title: 'Issue Date',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: text => dayjs(Number(text)).format('DD MMM, YYYY'),
    },
    {
      title: 'Issued To',
      dataIndex: ['refIssuedTo','name'],
      key: 'refIssuedTo.name',
      render: (text, record) => {
        if (record.handedOverTo) {
          return `${record.handedOverTo} - [on behalf of ${text}]`;
        }

        return text;
      },
    },
    {
      title: 'For Location',
      dataIndex: ['refLocation', 'name'],
      key: 'refLocation.name',
    },
    {
      title: 'Issuance Details',
      key: 'details',
      render: (text, record) => {
        const { items, attachments } = record;
        const formattedItems = items.map(item => {
          const key = `${item.stockItemId}${item.isInflow}`;
          let quantity = item.quantity;
          if (item.unitOfMeasurement !== 'quantity') {
            quantity = `${quantity} ${item.unitOfMeasurement}`;
          }

          return (
            <li key={key}>
              {`${item.stockItemName} [${quantity} ${
                item.isInflow ? 'Returned' : 'Issued'
              }]`}
            </li>
          );
        });

        const formattedAttachments = attachments?.map(attachment => (
          <li key={attachment._id}>
            {attachment.name}
          </li>
        ));

        if (formattedAttachments?.length > 0) {
          return (
            <>
              <ul>{formattedItems}</ul>
              <Divider>Attachments</Divider>
              <ul>{formattedAttachments}</ul>
            </>
          );
        }

        return <ul>{formattedItems}</ul>;
      },
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
              <Tooltip title="Print">
                <PrinterOutlined
                  className="list-actions-icon"
                  onClick={() => {
                    this.handlePrintClicked(record);
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
                onClick={() => {
                  this.handlePrintClicked(record);
                }}
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
      locationId,
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

    let locationIdVal;
    if (newParams.hasOwnProperty('locationId')) locationIdVal = locationId;
    else locationIdVal = queryParams.locationId || '';

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

    const path = `${location.pathname}?showApproved=${showApprovedVal}&showUnapproved=${showUnapprovedVal}&locationId=${locationIdVal}&startDate=${startDateVal}&endDate=${endDateVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
  };

  handleNewClicked = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.issuanceFormsNewFormPath(physicalStoreId));
  };

  handleEditClicked = record => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.issuanceFormsEditFormPath(physicalStoreId, record._id));
  };

  handleViewClicked = record => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.issuanceFormsViewFormPath(physicalStoreId, record._id));
  };

  handlePrintClicked = record => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.issuanceFormsPrintFormPath(physicalStoreId, record._id));
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
        title: 'Delete Issuance Forms',
        content:
          'Are you sure you want to delete the selected issuance forms?',
        onOk: () => {
          this.handleDeleteSelected();
        },
      });
    }
  }

  handleApproveSelected = () => {
    const { selectedRows } = this.state;
    const _ids = selectedRows.map(row => row._id);
    const { approveIssuanceForms, physicalStoreId } = this.props;

    approveIssuanceForms({
      variables: { 
        _ids,
        physicalStoreId,
      },
    })
      .then(() => {
        message.success('Issuance forms have been approved.', 5);
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
    }/generate-report?reportName=IssuanceForms&reportArgs=${reportArgs.join(
      ','
    )}`;
    window.open(url, '_blank');
  };

  handleDeleteSelected = () => {
    const { selectedRows } = this.state;
    const _ids = selectedRows.map(row => row._id);
    const { removeIssuanceForms, physicalStoreId } = this.props;
    removeIssuanceForms({
      variables: {
        _ids,
        physicalStoreId,
      },
    })
      .then(() => {
        message.success('Issuance forms have been deleted.', 5);
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
    const {
      locationsByPhysicalStoreId,
      queryParams,
      refetchListQuery,
    } = this.props;

    return (
      <div className="list-table-header">
        <Button
          size="large"
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={this.handleNewClicked}
        >
          New Issuance Form
        </Button>
        <div className="list-table-header-section">
          <ListFilter
            allLocations={locationsByPhysicalStoreId}
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
      pagedIssuanceForms: { totalResults, issuanceForms },
    } = this.props;

    const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
    const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

    return (
      <Table
        rowKey="_id"
        dataSource={issuanceForms}
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

export default flowRight(
  WithQueryParams(),
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  WithLocationsByPhysicalStore(),
  graphql(REMOVE_ISSUANCE_FORMS, {
    name: 'removeIssuanceForms',
    options: {
      refetchQueries: [
        'pagedIssuanceForms',
        'issuanceFormsByStockItem',
        'pagedStockItems',
      ],
    },
  }),
  graphql(APPROVE_ISSUANCE_FORMS, {
    name: 'approveIssuanceForms',
    options: {
      refetchQueries: [
        'pagedIssuanceForms',
        'issuanceFormsByStockItem',
        'pagedStockItems',
      ],
    },
  }),
  graphql(PAGED_ISSUANCE_FORMS, {
    props: ({ data }) => ({ refetchListQuery: data.refetch, ...data }),
    options: ({ physicalStoreId, queryString }) => ({
      variables: { physicalStoreId, queryString },
    }),
  }),
  WithDynamicBreadcrumbs(({ physicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Issuance Forms, List`;
    }
    return `Inventory, Issuance Forms, List`;
  })
)(List);
