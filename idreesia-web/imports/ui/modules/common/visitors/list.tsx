import React, { Component, type CSSProperties } from 'react';
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

const StatusStyle: CSSProperties = {
  fontSize: 20,
};

export interface VisitorListItem {
  _id: string;
  name?: string | null;
  cnicNumber?: string | null;
  contactNumber1?: string | null;
  contactNumber2?: string | null;
  city?: string | null;
  country?: string | null;
  imageId?: string | null;
  image?: { data?: string | null } | null;
  criminalRecord?: string | null;
  otherNotes?: string | null;
  isKarkun?: boolean | null;
}

interface PagedData { totalResults: number; data: VisitorListItem[]; }

interface Props {
  showSelectionColumn?: boolean;
  showStatusColumn?: boolean;
  showCnicColumn?: boolean;
  showPhoneNumbersColumn?: boolean;
  showCityCountryColumn?: boolean;
  showDeleteAction?: boolean;
  showStayHistoryAction?: boolean;
  showImdadRequestsAction?: boolean;
  showAuditLogsAction?: boolean;
  showKarkunCreateAction?: boolean;
  listHeader?: () => React.ReactNode;
  handleSelectItem?(record: VisitorListItem): void;
  handleDeleteItem?(record: VisitorListItem): void;
  handleStayHistoryAction?(record: VisitorListItem): void;
  handleImdadRequestsAction?(record: VisitorListItem): void;
  handleAuditLogsAction?(record: VisitorListItem): void;
  handleKarkunCreateAction?(record: VisitorListItem): void;
  setPageParams(params: { pageIndex: string; pageSize: string; }): void;
  pageIndex?: number;
  pageSize?: number;
  pagedData?: PagedData;
}

interface State { selectedRows: VisitorListItem[]; }

export default class VisitorsList extends Component<Props, State> {
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
    render: (_text: unknown, record: VisitorListItem) => {
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
    render: (_text: unknown, record: VisitorListItem) => (
      <PersonName
        person={{
          _id: record._id,
          name: record.name ?? '',
          imageId: record.imageId ?? undefined,
          image: record.image
            ? { data: record.image.data ?? undefined }
            : undefined,
        }}
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
    render: (_text: unknown, record: VisitorListItem) => {
      const numbers: React.ReactNode[] = [];
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
    render: (_text: unknown, record: VisitorListItem) => {
      if (record.city) {
        return `${record.city}, ${record.country}`;
      }
      return record.country;
    },
  };

  actionsColumn = {
    key: 'action',
    width: 80,
    render: (_text: unknown, record: VisitorListItem) => {
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
              handleStayHistoryAction?.(record);
            }}
          />
        </Tooltip>
      ) : null;

      const imdadRequestsAction = showImdadRequestsAction ? (
        <Tooltip title="Imdad Requests">
          <WalletOutlined
            className="list-actions-icon"
            onClick={() => {
              handleImdadRequestsAction?.(record);
            }}
          />
        </Tooltip>
      ) : null;

      const auditLogsAction = showAuditLogsAction ? (
        <Tooltip title="Audit Logs">
          <AuditOutlined
            className="list-actions-icon"
            onClick={() => {
              handleAuditLogsAction?.(record);
            }}
          />
        </Tooltip>
      ) : null;

      const createAction =
        showKarkunCreateAction && !record.isKarkun ? (
          <Popconfirm
            title="Are you sure you want to add this person to karkuns?"
            onConfirm={() => {
              handleKarkunCreateAction?.(record);
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
            handleDeleteItem?.(record);
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
    onChange: (_selectedRowKeys: React.Key[], selectedRows: VisitorListItem[]) => {
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
      <Table
        rowKey="_id"
        dataSource={data}
        columns={this.getColumns() as any}
        title={listHeader}
        rowSelection={showSelectionColumn ? this.rowSelection : undefined}
        bordered
        size="small"
        pagination={false}
        footer={() => (
          <Pagination
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
