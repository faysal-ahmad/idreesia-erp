import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { AuditOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

import { noop } from 'meteor/idreesia-common/utilities/lodash';
import {
  Pagination,
  Popconfirm,
  Table,
  Tooltip,
} from 'antd';
import { PersonName } from '/imports/ui/modules/helpers/controls';

export default class ImdadRequestsList extends Component {
  static propTypes = {
    showRequestDateColumn: PropTypes.bool,
    showNameColumn: PropTypes.bool,
    showCnicNumberColumn: PropTypes.bool,
    showMobileNumberColumn: PropTypes.bool,
    showCityCountryColumn: PropTypes.bool,
    showStatusColumn: PropTypes.bool,
    showEditAction: PropTypes.bool,
    showDeleteAction: PropTypes.bool,
    showAuditLogsAction: PropTypes.bool,

    listHeader: PropTypes.func,
    handlePersonSelect: PropTypes.func,
    handleSelectItem: PropTypes.func,
    handleDeleteItem: PropTypes.func,
    handleAuditLogsAction: PropTypes.func,
    setPageParams: PropTypes.func,

    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    pagedData: PropTypes.shape({
      totalResults: PropTypes.number,
      data: PropTypes.array,
    }),
  };

  static defaultProps = {
    showRequestDateColumn: false,
    showNameColumn: false,
    showCnicNumberColumn: false,
    showMobileNumberColumn: false,
    showCityCountryColumn: false,
    showStatusColumn: false,
    showEditAction: false,
    showDeleteAction: false,
    showAuditLogsAction: false,

    handleSelectItem: noop,
    handleDeleteItem: noop,
    handlePersonSelect: noop,
    handleAuditLogsAction: noop,
    listHeader: () => null,
  };

  requestDateColumn = {
    title: 'Request Date',
    dataIndex: 'requestDate',
    key: 'requestDate',
    render: text => {
      const date = moment(Number(text));
      return date.format('DD MMM, YYYY');
    },
  };

  nameColumn = {
    title: 'Name',
    key: 'visitor.name',
    render: (text, record) => (
      <PersonName
        person={record.visitor}
        onPersonNameClicked={this.props.handlePersonSelect}
      />
    ),
  };

  cnicNumberColumn = {
    title: 'CNIC Number',
    key: 'visitor.cnicNumber',
    dataIndex: ['visitor', 'cnicNumber'],
  };

  mobileNumberColumn = {
    title: 'Mobile No.',
    key: 'visitor.contactNumber1',
    dataIndex: ['visitor', 'contactNumber1'],
  };

  cityCountryColumn = {
    title: 'City / Country',
    key: 'cityCountry',
    render: (text, record) => {
      const { visitor } = record;
      return `${visitor.city}, ${visitor.country}`;
    },
  };

  statusColumn = {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  };

  actionsColumn = {
    key: 'action',
    width: 80,
    render: (text, record) => {
      const {
        showEditAction,
        showDeleteAction,
        showAuditLogsAction,
        handleDeleteItem,
        handleAuditLogsAction,
      } = this.props;

      const editAction = showEditAction ? (
        <Tooltip title="Edit">
          <EditOutlined
            className="list-actions-icon"
            onClick={() => {
              this.props.handleSelectItem(record);
            }}
          />
        </Tooltip>
      ) : null;

      const auditLogsAction = showAuditLogsAction ? (
        <Tooltip title="Audit Logs">
          <AuditOutlined
            className="list-actions-icon"
            onClick={() => {
              handleAuditLogsAction(record);
            }}
          />
        </Tooltip>
      ) : null;

      const deleteAction = showDeleteAction ? (
        <Popconfirm
          title="Are you sure you want to delete this item?"
          onConfirm={() => {
            handleDeleteItem(record);
          }}
          okText="Yes"
          cancelText="No"
        >
          <Tooltip title="Delete">
            <DeleteOutlined className="list-actions-icon" />
          </Tooltip>
        </Popconfirm>
      ) : null;

      return (
        <div className="list-actions-column">
          {editAction}
          {auditLogsAction}
          {deleteAction}
        </div>
      );
    },
  };

  getColumns = () => {
    const {
      showRequestDateColumn,
      showNameColumn,
      showCnicNumberColumn,
      showMobileNumberColumn,
      showCityCountryColumn,
      showStatusColumn,
      showEditAction,
      showDeleteAction,
      showAuditLogsAction,
    } = this.props;
    const columns = [];

    if (showRequestDateColumn) columns.push(this.requestDateColumn);
    if (showNameColumn) columns.push(this.nameColumn);
    if (showCnicNumberColumn) columns.push(this.cnicNumberColumn);
    if (showMobileNumberColumn) columns.push(this.mobileNumberColumn);
    if (showCityCountryColumn) columns.push(this.cityCountryColumn);
    if (showStatusColumn) columns.push(this.statusColumn);

    if (showEditAction || showDeleteAction || showAuditLogsAction) {
      columns.push(this.actionsColumn);
    }

    return columns;
  };

  onPaginationChange = (pageIndex, pageSize) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: (pageIndex - 1).toString(),
      pageSize: pageSize.toString(),
    });
  };

  render() {
    const {
      pageIndex,
      pageSize,
      listHeader,
      pagedData: { totalResults, data },
    } = this.props;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 20;

    return (
      <Table
        rowKey="_id"
        dataSource={data}
        columns={this.getColumns()}
        title={listHeader}
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
            onChange={this.onPaginationChange}
            onShowSizeChange={this.onPaginationChange}
            total={totalResults}
          />
        )}
      />
    );
  }
}
