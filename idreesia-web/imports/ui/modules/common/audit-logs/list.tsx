import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { Pagination, Table } from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';
import { OperationType } from 'meteor/idreesia-common/constants/audit';
import { PersonName } from '/imports/ui/modules/helpers/controls';

import getFormattedValue from './get-formatted-value';

const AntPagination = Pagination as any;
const AntTable = Table as any;
const PersonNameControl = PersonName as any;
type AnyRecord = Record<string, any>;
interface PagedData { totalResults: number; data: AnyRecord[]; }
interface Props { entityRenderer?(record: AnyRecord): React.ReactNode; listHeader?: () => React.ReactNode; handleSelectItem?(record: AnyRecord): void; handleDeleteItem?(record: AnyRecord): void; setPageParams(params: { pageIndex: number; pageSize?: number; }): void; pageIndex?: number; pageSize?: number; pagedData?: PagedData; allPhysicalStoresLoading?: boolean; allPhysicalStores?: AnyRecord[]; }
export default class AuditLogsList extends Component<Props> {
  static propTypes = {
    entityRenderer: PropTypes.func,
    listHeader: PropTypes.func,
    handleSelectItem: PropTypes.func,
    handleDeleteItem: PropTypes.func,
    setPageParams: PropTypes.func,

    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    pagedData: PropTypes.shape({
      totalResults: PropTypes.number,
      data: PropTypes.array,
    }),
  };

  static defaultProps = {
    entityRenderer: (record: AnyRecord) => record.entityId,
  };

  columns = [
    {
      title: 'Entity',
      key: 'entityId',
      render: (_text: unknown, record: AnyRecord) => this.props.entityRenderer?.(record),
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
      render: (_text: unknown, record: AnyRecord) => (
        <PersonNameControl
          person={{
            name: record.operationByName,
            imageId: record.operationByImageId,
          }}
        />
      ),
    },
    {
      title: 'Audit Values',
      dataIndex: 'auditValues',
      key: 'auditValues',
      render: (values: string[] | undefined, record: AnyRecord) => {
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
      <AntTable
        rowKey="_id"
        dataSource={data}
        columns={this.columns as any}
        bordered
        title={listHeader}
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
