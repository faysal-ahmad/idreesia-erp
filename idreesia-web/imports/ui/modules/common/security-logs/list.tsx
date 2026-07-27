import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import { Formats } from 'meteor/idreesia-common/constants';
import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  SecurityOperationType,
  SecurityOperationTypeDisplayName,
} from 'meteor/idreesia-common/constants/audit';
import { Pagination, Table } from 'antd';
import { PersonName } from '/imports/ui/modules/helpers/controls';

import PermissionsChangedRenderer from './permissions-changed-renderer';
import InstanceAccessChangedRenderer from './instance-access-changed-renderer';

const AntPagination = Pagination as any;
const AntTable = Table as any;
const PersonNameControl = PersonName as any;
type AnyRecord = Record<string, any>;
interface PagedData { totalResults: number; data: AnyRecord[]; }
interface Props { entityRenderer?(record: AnyRecord): React.ReactNode; listHeader?: () => React.ReactNode; handleSelectItem?(record: AnyRecord): void; handleDeleteItem?(record: AnyRecord): void; setPageParams(params: { pageIndex: number; pageSize?: number; }): void; pageIndex?: number; pageSize?: number; pagedData?: PagedData; allPhysicalStoresLoading?: boolean; allPhysicalStores?: AnyRecord[]; }
class AuditLogsList extends Component<Props> {
  static propTypes = {
    entityRenderer: PropTypes.func,
    listHeader: PropTypes.func,
    handleSelectItem: PropTypes.func,
    handleDeleteItem: PropTypes.func,
    setPageParams: PropTypes.func,

    allPhysicalStoresLoading: PropTypes.bool,
    allPhysicalStores: PropTypes.array,
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
      title: 'User',
      key: 'userId',
      render: (_text: unknown, record: AnyRecord) => (
        <PersonNameControl
          person={{
            name: record.userName,
            imageId: record.userImageId,
          }}
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
      title: 'Operation Details',
      dataIndex: 'auditValues',
      key: 'auditValues',
      render: (values: string[] | undefined, record: AnyRecord) => {
        const { operationType } = record;
        if (operationType === SecurityOperationType.PERMISSIONS_CHANGED) {
          return <PermissionsChangedRenderer record={record as any} />;
        } else if (
          operationType === SecurityOperationType.INSTANCE_ACCESS_CHANGED
        ) {
          return <InstanceAccessChangedRenderer record={record as any} />;
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

export default flowRight()(AuditLogsList as any);
