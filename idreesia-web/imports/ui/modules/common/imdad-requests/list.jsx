import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { noop } from 'meteor/idreesia-common/utilities/lodash';
import {
  Icon,
  Pagination,
  Popconfirm,
  Table,
  Tooltip,
} from '/imports/ui/controls';

export default class ImdadRequestsList extends Component {
  static propTypes = {
    showDeleteAction: PropTypes.bool,
    showAuditLogsAction: PropTypes.bool,

    listHeader: PropTypes.func,
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
    showDeleteAction: false,
    showAuditLogsAction: false,

    handleSelectItem: noop,
    handleDeleteItem: noop,
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
        showDeleteAction,
        showAuditLogsAction,
        handleDeleteItem,
        handleAuditLogsAction,
      } = this.props;

      const auditLogsAction = showAuditLogsAction ? (
        <Tooltip title="Audit Logs">
          <Icon
            type="audit"
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
            <Icon type="delete" className="list-actions-icon" />
          </Tooltip>
        </Popconfirm>
      ) : null;

      return (
        <div className="list-actions-column">
          {auditLogsAction}
          {deleteAction}
        </div>
      );
    },
  };

  getColumns = () => {
    const { showDeleteAction, showAuditLogsAction } = this.props;
    const columns = [this.requestDateColumn, this.statusColumn];

    if (showDeleteAction || showAuditLogsAction) {
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
