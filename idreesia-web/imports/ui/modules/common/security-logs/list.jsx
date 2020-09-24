import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Formats } from 'meteor/idreesia-common/constants';
import {
  SecurityOperationType,
  SecurityOperationTypeDisplayName,
} from 'meteor/idreesia-common/constants/audit';
import { Pagination, Row, Table } from '/imports/ui/controls';
import { PersonName } from '/imports/ui/modules/helpers/controls';

const PermissionAdded = {
  color: 'green',
};

const PermissionRemoved = {
  color: 'red',
};

export default class AuditLogsList extends Component {
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
        const { operationType, operationDetails } = record;
        if (operationType === SecurityOperationType.PERMISSIONS_CHANGED) {
          const {
            permissionsAdded = [],
            permissionsRemoved = [],
          } = operationDetails;

          const permissions = [
            <Row key={`permission-changed-${record._id}`}>
              <span>{SecurityOperationTypeDisplayName[operationType]}</span>
            </Row>,
          ];

          permissionsAdded.forEach((permission, index) => {
            permissions.push(
              <Row key={`permission-added-${index}`}>
                <span style={PermissionAdded}>{permission}</span>
              </Row>
            );
          });
          permissionsRemoved.forEach((permission, index) => {
            permissions.push(
              <Row key={`permission-removed-${index}`}>
                <span style={PermissionRemoved}>{permission}</span>
              </Row>
            );
          });

          return <>{permissions}</>;
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
      listHeader,
      pageIndex,
      pageSize,
      pagedData: { totalResults, data },
    } = this.props;

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
