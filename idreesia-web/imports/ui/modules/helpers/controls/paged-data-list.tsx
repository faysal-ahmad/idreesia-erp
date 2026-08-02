import React, { Component } from 'react';
import { Button, Pagination, Table } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';

type QueryParamValue = string | number | boolean | null | undefined | string[];

export interface PageParams {
  pageIndex?: string | number;
  pageSize?: string | number;
}

export type QueryParams = PageParams & Record<string, QueryParamValue>;

export interface ListFilterProps {
  refreshPage(params: Partial<QueryParams>): void;
  queryParams: QueryParams;
}

interface FilterParam {
  name: string;
  defaultValue?: QueryParamValue;
}

interface HistoryLike {
  push(path: string): void;
}

interface LocationLike {
  pathname: string;
}

interface PagedData<TRow> {
  data: TRow[];
  totalResults: number;
}

interface Props<TRow extends { _id: string } = { _id: string }> {
  columns?: ColumnsType<TRow>;
  filterParams: FilterParam[];
  history: HistoryLike;
  location: LocationLike;
  queryParams: QueryParams;
  pagedData: PagedData<TRow>;
  newButtonLabel?: string;
  handleNewClicked?(): void;
  ListFilter: React.ComponentType<ListFilterProps>;
}

export default class PagedDataList<
  TRow extends { _id: string } = { _id: string },
> extends Component<Props<TRow>> {
  refreshPage = (newParams: Partial<QueryParams>) => {
    const { filterParams } = this.props;
    const { queryParams, history, location } = this.props;

    const paramStrings = filterParams.map(({ name, defaultValue }) => {
      let nameVal: QueryParamValue;
      if (Object.prototype.hasOwnProperty.call(newParams, name)) {
        nameVal = newParams[name] ?? defaultValue;
      } else {
        nameVal = queryParams[name] ?? defaultValue;
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
        <Button type="primary" icon={<PlusCircleOutlined />} onClick={handleNewClicked}>
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
      <Table<TRow>
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
