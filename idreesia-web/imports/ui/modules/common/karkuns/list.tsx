import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Pagination,
  Popconfirm,
  Row,
  Table,
  Tooltip,
} from 'antd';
import {
  AuditOutlined,
  DeleteOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';

import { noop } from 'meteor/idreesia-common/utilities/lodash';
import { PersonName } from '/imports/ui/modules/helpers/controls';

const AntPagination = Pagination as any;
const AntPopconfirm = Popconfirm as any;
const AntRow = Row as any;
const AntTable = Table as any;
const AntTooltip = Tooltip as any;
const AntAuditOutlined = AuditOutlined as any;
const AntDeleteOutlined = DeleteOutlined as any;
const AntMinusCircleOutlined = MinusCircleOutlined as any;
const PersonNameControl = PersonName as any;
type AnyRecord = Record<string, any>;
interface PagedData { totalResults: number; karkuns: AnyRecord[]; }
interface Props { showSelectionColumn?: boolean; showCnicColumn?: boolean; showPhoneNumbersColumn?: boolean; showDutiesColumn?: boolean; showMehfilCityColumn?: boolean; showDeleteAction?: boolean; showAuditLogsAction?: boolean; showRemoveAction?: boolean; listHeader?: () => React.ReactNode; handleSelectItem?(record: AnyRecord): void; handleDeleteItem?(record: AnyRecord): void; handleRemoveItem?(record: AnyRecord): void; handleAuditLogsAction?(record: AnyRecord): void; setPageParams(params: { pageIndex: string; pageSize: string; }): void; pageIndex?: number; pageSize?: number; pagedData?: PagedData; }
interface State { selectedRows: AnyRecord[]; }

export default class KarkunsList extends Component<Props, State> {
  static propTypes = {
    showSelectionColumn: PropTypes.bool,
    showCnicColumn: PropTypes.bool,
    showPhoneNumbersColumn: PropTypes.bool,
    showDutiesColumn: PropTypes.bool,
    showMehfilCityColumn: PropTypes.bool,
    showDeleteAction: PropTypes.bool,
    showAuditLogsAction: PropTypes.bool,
    showRemoveAction: PropTypes.bool,

    listHeader: PropTypes.func,
    handleSelectItem: PropTypes.func,
    handleDeleteItem: PropTypes.func,
    handleRemoveItem: PropTypes.func,
    handleAuditLogsAction: PropTypes.func,
    setPageParams: PropTypes.func,

    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    pagedData: PropTypes.shape({
      totalResults: PropTypes.number,
      karkuns: PropTypes.array,
    }),
  };

  static defaultProps = {
    showRemoveAction: false,
    showDeleteAction: false,
    showAuditLogsAction: false,

    handleSelectItem: noop,
    handleDeleteItem: noop,
    handleRemoveItem: noop,
    handleAuditLogsAction: noop,
    listHeader: () => null,
    pagedData: {
      totalResults: 0,
      karkuns: [],
    }
  };

  state = {
    selectedRows: [],
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
      if (record.contactNumber1) {
        numbers.push(
          <AntRow key="1">
            <span>{record.contactNumber1}</span>
          </AntRow>
        );
      }

      if (record.contactNumber2) {
        numbers.push(
          <AntRow key="2">
            <span>{record.contactNumber2}</span>
          </AntRow>
        );
      }

      if (numbers.length === 0) return '';
      return <>{numbers}</>;
    },
  };

  mehfilCityColumn = {
    title: 'City / Mehfil',
    key: 'cityMehfil',
    render: (_text: unknown, record: AnyRecord) => {
      const { city, cityMehfil } = record;
      const cityMehfilInfo: React.ReactNode[] = [];

      if (cityMehfil) {
        cityMehfilInfo.push(<AntRow key="1">{cityMehfil.name}</AntRow>);
      }
      if (city) {
        cityMehfilInfo.push(
          <AntRow key="2">{`${city.name}, ${city.country}`}</AntRow>
        );
      }

      if (cityMehfilInfo.length === 0) return '';
      return <>{cityMehfilInfo}</>;
    },
  };

  dutiesColumn = {
    title: 'Duties',
    dataIndex: 'duties',
    key: 'duties',
    render: (duties: AnyRecord[] = []) => {
      let dutyNames: React.ReactNode[] = [];
      if (duties.length > 0) {
        dutyNames = duties.map((duty: AnyRecord) => {
          const dutyName = duty.dutyName;
          return <span>{dutyName}</span>;
        });
      }

      if (dutyNames.length === 0) {
        return null;
      } else if (dutyNames.length === 1) {
        return dutyNames[0];
      }
      return (
        <>
          {dutyNames.map((dutyName, index) => (
            <AntRow key={index}>{dutyName}</AntRow>
          ))}
        </>
      );
    },
  };

  actionsColumn = {
    key: 'action',
    render: (_text: unknown, record: AnyRecord) => {
      const {
        showAuditLogsAction,
        showDeleteAction,
        showRemoveAction,
        
        handleAuditLogsAction,
        handleDeleteItem,
        handleRemoveItem,
      } = this.props;

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

      const deleteAction = showDeleteAction ? (
        <AntPopconfirm
          title="Are you sure you want to delete the data for this karkun?"
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

      const removeAction = showRemoveAction ? (
        <AntPopconfirm
          title="Are you sure you want to remove this person from karkuns?"
          onConfirm={() => {
            handleRemoveItem?.(record);
          }}
          okText="Yes"
          cancelText="No"
        >
          <AntTooltip title="Remove from karkuns">
            <AntMinusCircleOutlined className="list-actions-icon" />
          </AntTooltip>
        </AntPopconfirm>
      ) : null;

      return (
        <div className="list-actions-column">
          {removeAction}
          {auditLogsAction}
          {deleteAction}
        </div>
      );
    },
  };

  getColumns = () => {
    const {
      showCnicColumn,
      showPhoneNumbersColumn,
      showMehfilCityColumn,
      showDutiesColumn,
      showAuditLogsAction,
      showDeleteAction,
    } = this.props;
    const columns: any[] = [this.nameColumn];

    if (showCnicColumn) {
      columns.push(this.cnicColumn);
    }

    if (showPhoneNumbersColumn) {
      columns.push(this.phoneNumberColumn);
    }

    if (showMehfilCityColumn) {
      columns.push(this.mehfilCityColumn);
    }

    if (showDutiesColumn) {
      columns.push(this.dutiesColumn);
    }

    if (showAuditLogsAction || showDeleteAction) {
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
      pagedData = { totalResults: 0, karkuns: [] },
    } = this.props;

    const { totalResults, karkuns } = pagedData;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 20;

    return (
      <AntTable
        rowKey="_id"
        dataSource={karkuns}
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
