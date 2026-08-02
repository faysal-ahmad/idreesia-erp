import React, { Component } from 'react';
import dayjs from 'dayjs';

import { Formats } from 'meteor/idreesia-common/constants';
import {
  SecurityOperationType,
  SecurityOperationTypeDisplayName,
} from 'meteor/idreesia-common/constants/audit';
import { Pagination, Table } from 'antd';
import { PersonName } from '/imports/ui/modules/helpers/controls';

import PermissionsChangedRenderer from './permissions-changed-renderer';
import InstanceAccessChangedRenderer from './instance-access-changed-renderer';

interface SecurityLogRecord {
  _id: string;
  entityId?: string | null;
  userId?: string | null;
  userName?: string | null;
  userImageId?: string | null;
  operationById?: string | null;
  operationByName?: string | null;
  operationByImageId?: string | null;
  operationType: string;
  operationTime?: string | null;
  auditValues?: Array<string | null> | null;
  operationDetails?: {
    permissionsAdded?: string[];
    permissionsRemoved?: string[];
    instancesAdded?: string[];
    instancesRemoved?: string[];
  };
}

interface PagedData {
  totalResults?: number | null;
  data?: Array<SecurityLogRecord | null> | null;
}

interface PageParams {
  pageIndex: number;
  pageSize?: number;
}

interface Props {
  entityRenderer?(record: SecurityLogRecord): React.ReactNode;
  listHeader?: () => React.ReactNode;
  handleSelectItem?(record: SecurityLogRecord): void;
  handleDeleteItem?(record: SecurityLogRecord): void;
  setPageParams(params: PageParams): void;
  pageIndex?: number;
  pageSize?: number;
  pagedData?: PagedData;
  allPhysicalStoresLoading?: boolean;
  allPhysicalStores?: unknown[];
}

type PermissionsChangedRecord = React.ComponentProps<
  typeof PermissionsChangedRenderer
>['record'];

type InstanceAccessChangedRecord = React.ComponentProps<
  typeof InstanceAccessChangedRenderer
>['record'];

class SecurityLogsList extends Component<Props> {
  static defaultProps = {
    entityRenderer: (record: SecurityLogRecord) => record.entityId,
  };

  columns = [
    {
      title: 'User',
      key: 'userId',
      render: (_text: unknown, record: SecurityLogRecord) => (
        <PersonName
          person={{
            _id: record.userId ?? record._id,
            name: record.userName,
            imageId: record.userImageId,
          } as Parameters<typeof PersonName>[0]['person']}
        />
      ),
    },
    {
      title: 'Operation Time',
      dataIndex: 'operationTime',
      key: 'operationTime',
      width: 110,
      render: (text: string | number) => {
        const date = dayjs(Number(text));
        return (
          <span>
            {date.format(Formats.DATE_FORMAT)}
            <br />
            {date.format(Formats.TIME_FORMAT)}
          </span>
        );
      },
    },
    {
      title: 'Operation By',
      key: 'operationBy',
      render: (_text: unknown, record: SecurityLogRecord) => (
        <PersonName
          person={{
            _id: record.operationById ?? record._id,
            name: record.operationByName,
            imageId: record.operationByImageId,
          } as Parameters<typeof PersonName>[0]['person']}
        />
      ),
    },
    {
      title: 'Operation Details',
      dataIndex: 'auditValues',
      key: 'auditValues',
      render: (_values: string[] | undefined, record: SecurityLogRecord) => {
        const { operationType } = record;
        if (operationType === SecurityOperationType.PERMISSIONS_CHANGED) {
          return (
            <PermissionsChangedRenderer
              record={record as PermissionsChangedRecord}
            />
          );
        } else if (
          operationType === SecurityOperationType.INSTANCE_ACCESS_CHANGED
        ) {
          return (
            <InstanceAccessChangedRenderer
              record={record as InstanceAccessChangedRecord}
            />
          );
        }

        return SecurityOperationTypeDisplayName[operationType];
      },
    },
  ];

  onPaginationChange = (pageIndex: number, pageSize?: number) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  render() {
    const {
      listHeader,
      pageIndex,
      pageSize,
      pagedData = { totalResults: 0, data: [] },
    } = this.props;

    const { totalResults, data } = pagedData;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 20;

    return (
      <Table
        rowKey="_id"
        dataSource={(data ?? []).filter(
          (log): log is SecurityLogRecord => log != null
        )}
        columns={this.columns as any}
        bordered
        title={listHeader}
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

export default SecurityLogsList;
