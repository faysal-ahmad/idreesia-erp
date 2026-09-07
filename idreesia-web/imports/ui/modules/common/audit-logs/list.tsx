import React, { Component } from 'react';
import dayjs from 'dayjs';
import { Pagination, Table } from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';
import { OperationType } from 'meteor/idreesia-common/constants/audit';
import type { PagedHrAuditLogsQuery } from 'meteor/idreesia-common/types/client-operations';
import { PersonName } from '/imports/ui/modules/helpers/controls';

import getFormattedValue from './get-formatted-value';

type AuditLogRow = NonNullable<
  NonNullable<NonNullable<PagedHrAuditLogsQuery['pagedHrAuditLogs']>['data']>[number]
>;

interface PagedData {
  totalResults?: number | null;
  data?: Array<AuditLogRow | null> | null;
}

interface PageParams {
  pageIndex: number;
  pageSize?: number;
}

interface Props {
  entityRenderer?(record: AuditLogRow): React.ReactNode;
  listHeader?: () => React.ReactNode;
  handleSelectItem?(record: AuditLogRow): void;
  handleDeleteItem?(record: AuditLogRow): void;
  setPageParams(params: PageParams): void;
  pageIndex?: number;
  pageSize?: number;
  pagedData?: PagedData;
  allPhysicalStoresLoading?: boolean;
  allPhysicalStores?: unknown[];
}

export default class AuditLogsList extends Component<Props> {
  static defaultProps = {
    entityRenderer: (record: AuditLogRow) => record.entityId,
  };

  columns = [
    {
      title: 'Entity',
      key: 'entityId',
      render: (_text: unknown, record: AuditLogRow) => this.props.entityRenderer?.(record),
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
      render: (_text: unknown, record: AuditLogRow) => (
        <PersonName
          person={{
            _id: record.operationBy,
            name: record.operationByName,
            imageId: record.operationByImageId,
            imageThumbnailId: record.operationByImageThumbnailId ?? undefined,
          } as Parameters<typeof PersonName>[0]['person']}
        />
      ),
    },
    {
      title: 'Audit Values',
      dataIndex: 'auditValues',
      key: 'auditValues',
      render: (values: string[] | undefined, record: AuditLogRow) => {
        const { operationType } = record;
        const fieldNodes = values?.map((value: string, index: number) => {
          const parsedValue = JSON.parse(value);
          const { fieldName, changedFrom, changedTo } = getFormattedValue(
            parsedValue
          );

          if (operationType === OperationType.CREATE) {
            return <li key={index}>{`${fieldName}: ${changedTo}`}</li>;
          }

          return (
            <li key={index}>
              {`${fieldName}: ${changedFrom} -> ${changedTo}`}
            </li>
          );
        });

        return <ul>{fieldNodes}</ul>;
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
          (log): log is AuditLogRow => log != null
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
