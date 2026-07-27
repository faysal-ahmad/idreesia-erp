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

const AntAuditOutlined = AuditOutlined as any;
const AntDeleteOutlined = DeleteOutlined as any;
const AntHistoryOutlined = HistoryOutlined as any;
const AntPlusCircleOutlined = PlusCircleOutlined as any;
const AntWalletOutlined = WalletOutlined as any;
const AntWarningTwoTone = WarningTwoTone as any;
const AntPagination = Pagination as any;
const AntPopconfirm = Popconfirm as any;
const AntRow = Row as any;
const AntTable = Table as any;
const AntTooltip = Tooltip as any;
const PersonNameControl = PersonName as any;
type AnyRecord = Record<string, any>;
interface PagedData { totalResults: number; data: AnyRecord[]; }
interface Props extends Record<string, any> { listHeader?: () => React.ReactNode; setPageParams(params: { pageIndex: string; pageSize: string; }): void; pageIndex?: number; pageSize?: number; pagedData?: PagedData; }
interface State { selectedRows: AnyRecord[]; }

export default class VisitorsList extends Component<Props, State> {
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
    render: (_text: unknown, record: AnyRecord) => {
      if (record.criminalRecord) {
        return (
          <AntWarningTwoTone
            style={StatusStyle as any}
            twoToneColor="red"
          />
        );
      } else if (record.otherNotes) {
        return (
          <AntWarningTwoTone
            style={StatusStyle as any}
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
    render: (_text: unknown, record: AnyRecord) => (
      <PersonNameControl
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
    render: (_text: unknown, record: AnyRecord) => {
      const numbers: React.ReactNode[] = [];
      if (record.contactNumber1)
        numbers.push(<AntRow key="1">{record.contactNumber1}</AntRow>);
      if (record.contactNumber2)
        numbers.push(<AntRow key="2">{record.contactNumber2}</AntRow>);

      if (numbers.length === 0) return '';
      return <>{numbers}</>;
    },
  };

  cityCountryColumn = {
    title: 'City / Country',
    key: 'cityCountry',
    render: (_text: unknown, record: AnyRecord) => {
      if (record.city) {
        return `${record.city}, ${record.country}`;
      }
      return record.country;
    },
  };

  actionsColumn = {
    key: 'action',
    width: 80,
    render: (_text: unknown, record: AnyRecord) => {
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
        <AntTooltip title="Stay History">
          <AntHistoryOutlined
            className="list-actions-icon"
            onClick={() => {
              handleStayHistoryAction?.(record);
            }}
          />
        </AntTooltip>
      ) : null;

      const imdadRequestsAction = showImdadRequestsAction ? (
        <AntTooltip title="Imdad Requests">
          <AntWalletOutlined
            className="list-actions-icon"
            onClick={() => {
              handleImdadRequestsAction?.(record);
            }}
          />
        </AntTooltip>
      ) : null;

      const auditLogsAction = showAuditLogsAction ? (
        <AntTooltip title="Audit Logs">
          <AntAuditOutlined
            className="list-actions-icon"
            onClick={() => {
              handleAuditLogsAction?.(record);
            }}
          />
        </AntTooltip>
      ) : null;

      const createAction =
        showKarkunCreateAction && !record.isKarkun ? (
          <AntPopconfirm
            title="Are you sure you want to add this person to karkuns?"
            onConfirm={() => {
              handleKarkunCreateAction?.(record);
            }}
            okText="Yes"
            cancelText="No"
          >
          <AntTooltip title="Add to karkuns">
            <AntPlusCircleOutlined className="list-actions-icon" />
          </AntTooltip>
        </AntPopconfirm>
        ) : null;

      const deleteAction = showDeleteAction ? (
        <AntPopconfirm
          title="Are you sure you want to delete the data for this person?"
          onConfirm={() => {
            handleDeleteItem?.(record);
          }}
          okText="Yes"
          cancelText="No"
        >
          <AntTooltip title="Delete">
            <AntDeleteOutlined className="list-actions-icon" />
          </AntTooltip>
        </AntPopconfirm>
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

    const columns: any[] = [];
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
    onChange: (_selectedRowKeys: React.Key[], selectedRows: AnyRecord[]) => {
      this.setState({
        selectedRows,
      });
    },
  };

  onPaginationChange = (pageIndex: number, pageSize?: number) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: (pageIndex - 1).toString(),
      pageSize: (pageSize ?? 20).toString(),
    });
  };

  getSelectedRows = () => this.state.selectedRows;

  render() {
    const {
      pageIndex,
      pageSize,
      listHeader,
      showSelectionColumn,
      pagedData = { totalResults: 0, data: [] },
    } = this.props;

    const { totalResults, data } = pagedData;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 20;

    return (
      <AntTable
        rowKey="_id"
        dataSource={data}
        columns={this.getColumns() as any}
        title={listHeader}
        rowSelection={showSelectionColumn ? this.rowSelection : null}
        bordered
        size="small"
        pagination={false}
        footer={() => (
          <AntPagination
            current={numPageIndex}
            pageSize={numPageSize}
            showSizeChanger
            showTotal={(total: number, range: [number, number]) =>
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
