import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Pagination, Table } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';

const AntButton = Button as any;
const AntPagination = Pagination as any;
const AntTable = Table as any;
const AntPlusCircleOutlined = PlusCircleOutlined as any;
type AnyRecord = Record<string, any>;
interface FilterParam { name: string; defaultValue?: unknown; }
interface HistoryLike { push(path: string): void; }
interface LocationLike { pathname: string; }
interface Props { columns?: unknown[]; filterParams: FilterParam[]; history: HistoryLike; location: LocationLike; queryParams: AnyRecord; pagedData: { data: AnyRecord[]; totalResults: number; }; newButtonLabel?: string; handleNewClicked?(): void; ListFilter: React.ComponentType<any>; }

export default class PagedDataList extends Component<Props> {
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

  refreshPage = (newParams: AnyRecord) => {
    const { filterParams } = this.props;
    const { queryParams, history, location } = this.props;

    const paramStrings = filterParams.map(({ name, defaultValue }) => {
      let nameVal;
      if (Object.prototype.hasOwnProperty.call(newParams, name)) {
        nameVal = newParams[name] || defaultValue;
      } else {
        nameVal = queryParams[name] || defaultValue;
      }

      return `${name}=${nameVal}`;
    });

    const path = `${location.pathname}?${paramStrings.join('&')}`;
    history.push(path);
  };

  onChange = (pageIndex: number, pageSize: number) => {
    this.refreshPage({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  onShowSizeChange = (pageIndex: number, pageSize: number) => {
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
        <AntButton type="primary" icon={<AntPlusCircleOutlined />} onClick={handleNewClicked}>
          {newButtonLabel}
        </AntButton>
        {React.createElement(ListFilter as any, { refreshPage: this.refreshPage, queryParams })}
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
      <AntTable
        rowKey="_id"
        dataSource={data}
        columns={columns}
        bordered
        title={this.getTableHeader}
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
            onChange={this.onChange}
            onShowSizeChange={this.onShowSizeChange}
            total={totalResults}
          />
        )}
      />
    );
  }
}
