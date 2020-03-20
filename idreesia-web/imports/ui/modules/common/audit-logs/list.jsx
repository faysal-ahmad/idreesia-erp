import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Formats } from 'meteor/idreesia-common/constants';
import { OperationTypes } from 'meteor/idreesia-common/constants/audit';
import { Pagination, Table } from '/imports/ui/controls';
import { PersonName } from '/imports/ui/modules/helpers/controls';

import getFormattedValue from './get-formatted-value';

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
      title: 'Entity',
      key: 'entityId',
      render: (text, record) => this.props.entityRenderer(record),
    },
    {
      title: 'Operation Time',
      dataIndex: 'operationTime',
      key: 'operationTime',
      width: 100,
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
      title: 'Audit Values',
      dataIndex: 'auditValues',
      key: 'auditValues',
      render: (values, record) => {
        const { operationType } = record;
        const fieldNodes = values.map((value, index) => {
          const parsedValue = JSON.parse(value);
          const { fieldName, changedFrom, changedTo } = getFormattedValue(
            parsedValue
          );

          if (operationType === OperationTypes.CREATE) {
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
