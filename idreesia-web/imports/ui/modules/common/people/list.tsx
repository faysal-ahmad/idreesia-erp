import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AuditOutlined, DeleteOutlined, DollarOutlined, StarOutlined } from '@ant-design/icons';

import { noop } from 'meteor/idreesia-common/utilities/lodash';
import {
  Pagination,
  Popconfirm,
  Row,
  Table,
  Tooltip,
} from 'antd';
import { PersonName } from '/imports/ui/modules/helpers/controls';

const AntAuditOutlined = AuditOutlined as any;
const AntDeleteOutlined = DeleteOutlined as any;
const AntDollarOutlined = DollarOutlined as any;
const AntStarOutlined = StarOutlined as any;
const AntPagination = Pagination as any;
const AntPopconfirm = Popconfirm as any;
const AntRow = Row as any;
const AntTable = Table as any;
const AntTooltip = Tooltip as any;
const PersonNameControl = PersonName as any;
type AnyRecord = Record<string, any>;
interface PagedData { totalResults: number; data: AnyRecord[]; }
interface Props { showSelectionColumn?: boolean; showCategoryColumn?: boolean; showCnicColumn?: boolean; showPhoneNumbersColumn?: boolean; showCityCountryColumn?: boolean; showDeleteAction?: boolean; showAuditLogsAction?: boolean; listHeader?: () => React.ReactNode; handleSelectItem?(record: AnyRecord): void; handleDeleteItem?(record: AnyRecord): void; handleAuditLogsAction?(record: AnyRecord): void; setPageParams(params: { pageIndex: string; pageSize: string; }): void; pageIndex?: number; pageSize?: number; pagedData?: PagedData; }
interface State { selectedRows: AnyRecord[]; }

export default class PeopleList extends Component<Props, State> {
  static propTypes = {
    showSelectionColumn: PropTypes.bool,
    showCategoryColumn: PropTypes.bool,
    showCnicColumn: PropTypes.bool,
    showPhoneNumbersColumn: PropTypes.bool,
    showCityCountryColumn: PropTypes.bool,
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
    showSelectionColumn: false,
    showCategoryColumn: false,
    showCnicColumn: false,
    showPhoneNumbersColumn: false,
    showCityCountryColumn: false,
    showDeleteAction: false,
    showAuditLogsAction: false,

    handleSelectItem: noop,
    handleDeleteItem: noop,
    handleAuditLogsAction: noop,
    listHeader: () => null,
  };

  state = {
    selectedRows: [],
  };

  categoryColumn = {
    title: '',
    key: 'status',
    render: (_text: unknown, record: AnyRecord) => {
      const icons: React.ReactNode[] = [];
      if (record.isKarkun) {
        icons.push(<AntStarOutlined key="1" className="list-actions-icon" />);
      }
      if (record.isEmployee) {
        icons.push(<AntDollarOutlined key="2" className="list-actions-icon" />);
      }

      if (icons.length === 0) return '';
      return <>{icons}</>;
    },
  };

  nameColumn = {
    title: 'Name',
    key: 'name',
    render: (_text: unknown, record: AnyRecord) => {
      const personNameData = {
        _id: record._id,
        name: record.sharedData.name,
        imageId: record.sharedData.imageId,
        image: record.sharedData.image,
      };

      return (
        <PersonNameControl
          person={personNameData}
          onPersonNameClicked={this.props.handleSelectItem}
        />
      );
    },
  };

  cnicColumn = {
    title: 'CNIC Number',
    key: 'cnicNumber',
    render: (_text: unknown, record: AnyRecord) => record.sharedData.cnicNumber,
  };

  phoneNumberColumn = {
    title: 'Contact Number',
    key: 'contactNumber',
    render: (_text: unknown, record: AnyRecord) => {
      const numbers: React.ReactNode[] = [];
      if (record.sharedData?.contactNumber1)
        numbers.push(<AntRow key="1">{record.sharedData?.contactNumber1}</AntRow>);
      if (record.sharedData.contactNumber2)
        numbers.push(<AntRow key="2">{record.sharedData?.contactNumber2}</AntRow>);

      if (numbers.length === 0) return '';
      return <>{numbers}</>;
    },
  };

  cityCountryColumn = {
    title: 'City / Country',
    key: 'cityCountry',
    render: (_text: unknown, record: AnyRecord) => {
      const cityCountry: React.ReactNode[] = [];
      if (record.isKarkun) {
        if (record.karkunData?.city) {
          cityCountry.push(<AntRow key="1">{record.karkunData.city.name}</AntRow>);
          cityCountry.push(<AntRow key="2">{record.visitorData.city.country}</AntRow>);
        }
      } else {
        if (record.visitorData?.city) {
          cityCountry.push(<AntRow key="1">{record.visitorData?.city}</AntRow>);
        }
        if (record.visitorData?.country) {
          cityCountry.push(<AntRow key="2">{record.visitorData?.country}</AntRow>);
        }
      }
      return <>{cityCountry}</>;
    },
  };

  actionsColumn = {
    key: 'action',
    width: 80,
    render: (_text: unknown, record: AnyRecord) => {
      const {
        showDeleteAction,
        showAuditLogsAction,
        handleDeleteItem,
        handleAuditLogsAction,
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
          {auditLogsAction}
          {deleteAction}
        </div>
      );
    },
  };

  getColumns = () => {
    const {
      showCategoryColumn,
      showCnicColumn,
      showPhoneNumbersColumn,
      showCityCountryColumn,
      showDeleteAction,
      showAuditLogsAction,
    } = this.props;

    const columns: any[] = [];
    if (showCategoryColumn) {
      columns.push(this.categoryColumn);
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

    if (showDeleteAction || showAuditLogsAction) {
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
