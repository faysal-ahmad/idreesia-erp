import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Formats } from 'meteor/idreesia-common/constants';
import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithAllPortals } from 'meteor/idreesia-common/composers/admin';
import {
  SecurityOperationType,
  SecurityOperationTypeDisplayName,
} from 'meteor/idreesia-common/constants/audit';
import { Pagination, Table } from 'antd';
import { PersonName } from '/imports/ui/modules/helpers/controls';

import PermissionsChangedRenderer from './permissions-changed-renderer';
import InstanceAccessChangedRenderer from './instance-access-changed-renderer';

class AuditLogsList extends Component {
  static propTypes = {
    entityRenderer: PropTypes.func,
    listHeader: PropTypes.func,
    handleSelectItem: PropTypes.func,
    handleDeleteItem: PropTypes.func,
    setPageParams: PropTypes.func,

    allCompaniesLoading: PropTypes.bool,
    allCompanies: PropTypes.array,
    allPhysicalStoresLoading: PropTypes.bool,
    allPhysicalStores: PropTypes.array,
    allPortalsLoading: PropTypes.bool,
    allPortals: PropTypes.array,
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    pagedData: PropTypes.shape({
      totalResults: PropTypes.number,
      data: PropTypes.array,
    }),
  };

  static defaultProps = {
    entityRenderer: record => record.entityId,
  };

  columns = [
    {
      title: 'User',
      key: 'userId',
      render: (text, record) => (
        <PersonName
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
      render: text => {
        const date = moment(Number(text));
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
      render: (text, record) => (
        <PersonName
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
      render: (values, record) => {
        const { allPortals } = this.props;
        const { operationType } = record;
        if (operationType === SecurityOperationType.PERMISSIONS_CHANGED) {
          return <PermissionsChangedRenderer record={record} />;
        } else if (
          operationType === SecurityOperationType.INSTANCE_ACCESS_CHANGED
        ) {
          return (
            <InstanceAccessChangedRenderer
              record={record}
              allPortals={allPortals}
            />
          );
        }

        return SecurityOperationTypeDisplayName[operationType];
      },
    },
  ];

  onPaginationChange = (pageIndex, pageSize) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  render() {
    const {
      allPortalsLoading,
      listHeader,
      pageIndex,
      pageSize,
      pagedData: { totalResults, data },
    } = this.props;
    if (allPortalsLoading) {
      return null;
    }

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 20;

    return (
      <Table
        rowKey="_id"
        dataSource={data}
        columns={this.columns}
        bordered
        title={listHeader}
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

export default flowRight(WithAllPortals())(AuditLogsList);
