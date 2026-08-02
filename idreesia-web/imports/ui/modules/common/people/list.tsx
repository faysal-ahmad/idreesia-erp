import React, { Component } from 'react';
import { AuditOutlined, DeleteOutlined, DollarOutlined, StarOutlined } from '@ant-design/icons';

import { noop } from 'meteor/idreesia-common/utilities/lodash';
import type { PagedPeopleQuery } from 'meteor/idreesia-common/types/client-operations';
import {
  Pagination,
  Popconfirm,
  Row,
  Table,
  Tooltip,
} from 'antd';
import { PersonName } from '/imports/ui/modules/helpers/controls';

type PersonRow = NonNullable<
  NonNullable<NonNullable<PagedPeopleQuery['pagedPeople']>['data']>[number]
>;

interface PagedData {
  totalResults?: number | null;
  data?: Array<PersonRow | null> | null;
}

interface PageParams {
  pageIndex: string;
  pageSize: string;
}

interface Props {
  showSelectionColumn?: boolean;
  showCategoryColumn?: boolean;
  showCnicColumn?: boolean;
  showPhoneNumbersColumn?: boolean;
  showCityCountryColumn?: boolean;
  showDeleteAction?: boolean;
  showAuditLogsAction?: boolean;
  listHeader?: () => React.ReactNode;
  handleSelectItem?(record: PersonRow): void;
  handleDeleteItem?(record: PersonRow): void;
  handleAuditLogsAction?(record: PersonRow): void;
  setPageParams(params: PageParams): void;
  pageIndex?: number;
  pageSize?: number;
  pagedData?: PagedData;
}

interface State {
  selectedRows: PersonRow[];
}

export default class PeopleList extends Component<Props, State> {
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
    render: (_text: unknown, record: PersonRow) => {
      const icons: React.ReactNode[] = [];
      if (record.isKarkun) {
        icons.push(<StarOutlined key="1" className="list-actions-icon" />);
      }
      if (record.isEmployee) {
        icons.push(<DollarOutlined key="2" className="list-actions-icon" />);
      }

      if (icons.length === 0) return '';
      return <>{icons}</>;
    },
  };

  nameColumn = {
    title: 'Name',
    key: 'name',
    render: (_text: unknown, record: PersonRow) => {
      const personNameData = {
        _id: record._id,
        name: record.sharedData?.name,
        imageId: record.sharedData?.imageId,
        image: record.sharedData?.image,
      };

      return (
        <PersonName
          person={personNameData as Parameters<typeof PersonName>[0]['person']}
          onPersonNameClicked={this.props.handleSelectItem as Parameters<typeof PersonName>[0]['onPersonNameClicked']}
        />
      );
    },
  };

  cnicColumn = {
    title: 'CNIC Number',
    key: 'cnicNumber',
    render: (_text: unknown, record: PersonRow) => record.sharedData?.cnicNumber,
  };

  phoneNumberColumn = {
    title: 'Contact Number',
    key: 'contactNumber',
    render: (_text: unknown, record: PersonRow) => {
      const numbers: React.ReactNode[] = [];
      if (record.sharedData?.contactNumber1)
        numbers.push(<Row key="1">{record.sharedData?.contactNumber1}</Row>);
      if (record.sharedData?.contactNumber2)
        numbers.push(<Row key="2">{record.sharedData?.contactNumber2}</Row>);

      if (numbers.length === 0) return '';
      return <>{numbers}</>;
    },
  };

  cityCountryColumn = {
    title: 'City / Country',
    key: 'cityCountry',
    render: (_text: unknown, record: PersonRow) => {
      const cityCountry: React.ReactNode[] = [];
      if (record.isKarkun) {
        if (record.karkunData?.city) {
          cityCountry.push(<Row key="1">{record.karkunData.city.name}</Row>);
          cityCountry.push(<Row key="2">{(record.visitorData?.city as { country?: string | null } | null)?.country}</Row>);
        }
      } else {
        if (record.visitorData?.city) {
          cityCountry.push(<Row key="1">{record.visitorData?.city}</Row>);
        }
        if (record.visitorData?.country) {
          cityCountry.push(<Row key="2">{record.visitorData?.country}</Row>);
        }
      }
      return <>{cityCountry}</>;
    },
  };

  actionsColumn = {
    key: 'action',
    width: 80,
    render: (_text: unknown, record: PersonRow) => {
      const {
        showDeleteAction,
        showAuditLogsAction,
        handleDeleteItem,
        handleAuditLogsAction,
      } = this.props;

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
    onChange: (_selectedRowKeys: React.Key[], selectedRows: PersonRow[]) => {
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
        dataSource={(data ?? []).filter(
          (person): person is PersonRow => person != null
        )}
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
            total={totalResults ?? 0}
          />
        )}
      />
    );
  }
}
