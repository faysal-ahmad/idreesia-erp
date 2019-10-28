import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { toSafeInteger } from 'lodash';

import { Button, Pagination, Table } from '/imports/ui/controls';

export default class PagedDataList extends Component {
  static propTypes = {
    columns: PropTypes.array,
    filterParams: PropTypes.array,

    history: PropTypes.object,
    location: PropTypes.object,
    queryParams: PropTypes.object,

    pagedData: PropTypes.shape({
      data: PropTypes.array,
      totalResults: PropTypes.number,
    }),
    newButtonLabel: PropTypes.string,
    handleNewClicked: PropTypes.func,
    ListFilter: PropTypes.element,
  };

  refreshPage = newParams => {
    const { filterParams } = this.props;
    const { queryParams, history, location } = this.props;

    const paramStrings = filterParams.map(({ name, defaultValue }) => {
      let nameVal;
      if (newParams.hasOwnProperty(name)) {
        nameVal = newParams[name] || defaultValue;
      } else {
        nameVal = queryParams[name] || defaultValue;
      }

      return `${name}=${nameVal}`;
    });

    const path = `${location.pathname}?${paramStrings.join('&')}`;
    history.push(path);
  };

  onChange = (pageIndex, pageSize) => {
    this.refreshPage({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  onShowSizeChange = (pageIndex, pageSize) => {
    this.refreshPage({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  getTableHeader = () => {
    const {
      queryParams,
      newButtonLabel,
      handleNewClicked,
      ListFilter,
    } = this.props;

    return (
      <div className="list-table-header">
        <Button type="primary" icon="plus-circle-o" onClick={handleNewClicked}>
          {newButtonLabel}
        </Button>
        <ListFilter refreshPage={this.refreshPage} queryParams={queryParams} />
      </div>
    );
  };

  render() {
    const { columns } = this.props;

    const {
      queryParams: { pageIndex, pageSize },
      pagedData: { totalResults, data },
    } = this.props;

    const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
    const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

    return (
      <Table
        rowKey="_id"
        dataSource={data}
        columns={columns}
        bordered
        title={this.getTableHeader}
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
            onChange={this.onChange}
            onShowSizeChange={this.onShowSizeChange}
            total={totalResults}
          />
        )}
      />
    );
  }
}
