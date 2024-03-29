import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AuditOutlined, DeleteOutlined, HistoryOutlined, PlusCircleOutlined, WalletOutlined, WarningTwoTone } from '@ant-design/icons';

import { noop } from 'meteor/idreesia-common/utilities/lodash';
import {
  Pagination,
  Popconfirm,
  Row,
  Table,
  Tooltip,
} from 'antd';
import { PersonName } from '/imports/ui/modules/helpers/controls';

const StatusStyle = {
  fontSize: 20,
};

export default class VisitorsList extends Component {
  static propTypes = {
    showSelectionColumn: PropTypes.bool,
    showStatusColumn: PropTypes.bool,
    showCnicColumn: PropTypes.bool,
    showPhoneNumbersColumn: PropTypes.bool,
    showCityCountryColumn: PropTypes.bool,
    showDeleteAction: PropTypes.bool,
    showStayHistoryAction: PropTypes.bool,
    showImdadRequestsAction: PropTypes.bool,
    showAuditLogsAction: PropTypes.bool,
    showKarkunCreateAction: PropTypes.bool,

    listHeader: PropTypes.func,
    handleSelectItem: PropTypes.func,
    handleDeleteItem: PropTypes.func,
    handleStayHistoryAction: PropTypes.func,
    handleImdadRequestsAction: PropTypes.func,
    handleAuditLogsAction: PropTypes.func,
    handleKarkunCreateAction: PropTypes.func,
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
    showStayHistoryAction: false,
    showImdadRequestsAction: false,
    showAuditLogsAction: false,
    showKarkunCreateAction: false,

    handleSelectItem: noop,
    handleDeleteItem: noop,
    handleStayHistoryAction: noop,
    handleImdadRequestsAction: noop,
    handleAuditLogsAction: noop,
    handleKarkunCreateAction: noop,
    listHeader: () => null,
  };

  state = {
    selectedRows: [],
  };

  statusColumn = {
    title: '',
    key: 'status',
    render: (text, record) => {
      if (record.criminalRecord) {
        return (
          <WarningTwoTone
            style={StatusStyle}
            twoToneColor="red"
          />
        );
      } else if (record.otherNotes) {
        return (
          <WarningTwoTone
            style={StatusStyle}
            twoToneColor="orange"
          />
        );
      }

      return null;
    },
  };

  nameColumn = {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text, record) => (
      <PersonName
        person={record}
        onPersonNameClicked={this.props.handleSelectItem}
      />
    ),
  };

  cnicColumn = {
    title: 'CNIC Number',
    dataIndex: 'cnicNumber',
    key: 'cnicNumber',
  };

  phoneNumberColumn = {
    title: 'Contact Number',
    key: 'contactNumber',
    render: (text, record) => {
      const numbers = [];
      if (record.contactNumber1)
        numbers.push(<Row key="1">{record.contactNumber1}</Row>);
      if (record.contactNumber2)
        numbers.push(<Row key="2">{record.contactNumber2}</Row>);

      if (numbers.length === 0) return '';
      return <>{numbers}</>;
    },
  };

  cityCountryColumn = {
    title: 'City / Country',
    key: 'cityCountry',
    render: (text, record) => {
      if (record.city) {
        return `${record.city}, ${record.country}`;
      }
      return record.country;
    },
  };

  actionsColumn = {
    key: 'action',
    width: 80,
    render: (text, record) => {
      const {
        showDeleteAction,
        showStayHistoryAction,
        showImdadRequestsAction,
        showAuditLogsAction,
        showKarkunCreateAction,
        handleDeleteItem,
        handleStayHistoryAction,
        handleImdadRequestsAction,
        handleAuditLogsAction,
        handleKarkunCreateAction,
      } = this.props;

      const stayHistoryAction = showStayHistoryAction ? (
        <Tooltip title="Stay History">
          <HistoryOutlined
            className="list-actions-icon"
            onClick={() => {
              handleStayHistoryAction(record);
            }}
          />
        </Tooltip>
      ) : null;

      const imdadRequestsAction = showImdadRequestsAction ? (
        <Tooltip title="Imdad Requests">
          <WalletOutlined
            className="list-actions-icon"
            onClick={() => {
              handleImdadRequestsAction(record);
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

      const createAction =
        showKarkunCreateAction && !record.isKarkun ? (
          <Popconfirm
            title="Are you sure you want to add this person to karkuns?"
            onConfirm={() => {
              handleKarkunCreateAction(record);
            }}
            okText="Yes"
            cancelText="No"
          >
          <Tooltip title="Add to karkuns">
            <PlusCircleOutlined className="list-actions-icon" />
          </Tooltip>
        </Popconfirm>
        ) : null;

      const deleteAction = showDeleteAction ? (
        <Popconfirm
          title="Are you sure you want to delete the data for this person?"
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
          {stayHistoryAction}
          {imdadRequestsAction}
          {auditLogsAction}
          {createAction}
          {deleteAction}
        </div>
      );
    },
  };

  getColumns = () => {
    const {
      showStatusColumn,
      showCnicColumn,
      showPhoneNumbersColumn,
      showCityCountryColumn,
      showDeleteAction,
      showStayHistoryAction,
      showAuditLogsAction,
      showKarkunCreateAction,
    } = this.props;

    const columns = [];
    if (showStatusColumn) {
      columns.push(this.statusColumn);
    }

    columns.push(this.nameColumn);

    if (showCnicColumn) {
      columns.push(this.cnicColumn);
    }

    if (showPhoneNumbersColumn) {
      columns.push(this.phoneNumberColumn);
    }

    if (showCityCountryColumn) {
      columns.push(this.cityCountryColumn);
    }

    if (
      showDeleteAction ||
      showStayHistoryAction ||
      showAuditLogsAction ||
      showKarkunCreateAction
    ) {
      columns.push(this.actionsColumn);
    }

    return columns;
  };

  rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      this.setState({
        selectedRows,
      });
    },
  };

  onPaginationChange = (pageIndex, pageSize) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: (pageIndex - 1).toString(),
      pageSize: pageSize.toString(),
    });
  };

  getSelectedRows = () => this.state.selectedRows;

  render() {
    const {
      pageIndex,
      pageSize,
      listHeader,
      showSelectionColumn,
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
        rowSelection={showSelectionColumn ? this.rowSelection : null}
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
