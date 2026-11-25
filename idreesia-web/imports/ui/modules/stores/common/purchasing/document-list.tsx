import React, { useState, type ReactNode } from 'react';
import { Button, Input, Pagination, Select, Space, Spin, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SyncOutlined } from '@ant-design/icons';

import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import useListScrollY from '/imports/ui/modules/security/security-server/common/use-list-scroll-y';

export interface DocumentListParams {
  search?: string;
  status?: string;
  pageIndex?: number;
  pageSize?: number;
}

interface Props<T> {
  rows: T[];
  totalResults: number;
  loading: boolean;
  columns: ColumnsType<T>;
  /** The primary actions on the left of the toolbar (e.g. New). */
  actions?: ReactNode;
  statusOptions: { value: string; label: string }[];
  queryParams: { search?: unknown; status?: unknown; pageIndex?: unknown; pageSize?: unknown };
  refreshPage(params: DocumentListParams): void;
  refreshData?(): void | Promise<unknown>;
}

/**
 * The list chrome the Stores purchasing pages share: toolbar with a search
 * and status filter, closable filter chips, and a footer pager under a table
 * body that scrolls (see docs/ui-design-guidelines).
 */
const DocumentList = <T extends { _id?: string | null }>({
  rows,
  totalResults,
  loading,
  columns,
  actions,
  statusOptions,
  queryParams,
  refreshPage,
  refreshData,
}: Props<T>) => {
  const { containerRef, scrollY } = useListScrollY();
  const [searchText, setSearchText] = useState<string>(String(queryParams.search ?? ''));

  const search = String(queryParams.search ?? '');
  const status = String(queryParams.status ?? '');
  const numPageIndex = queryParams.pageIndex ? toSafeInteger(queryParams.pageIndex) + 1 : 1;
  const numPageSize = queryParams.pageSize ? toSafeInteger(queryParams.pageSize) : 20;

  if (loading && rows.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const chips = [
    ...(search
      ? [{ key: 'search', label: 'Search', value: search }]
      : []),
    ...(status
      ? [
          {
            key: 'status',
            label: 'Status',
            value: statusOptions.find(option => option.value === status)?.label ?? status,
          },
        ]
      : []),
  ];

  const header = () => (
    <div className="list-table-header">
      <Space size={12}>{actions}</Space>
      <div className="list-table-header-utilities">
        <Space size={8}>
          <Input.Search
            allowClear
            placeholder="Search"
            style={{ width: 220 }}
            value={searchText}
            onChange={event => setSearchText(event.target.value)}
            onSearch={value => refreshPage({ search: value, pageIndex: 0 })}
          />
          <Select
            allowClear
            placeholder="Status"
            style={{ width: 180 }}
            value={status || undefined}
            options={statusOptions}
            onChange={value => refreshPage({ status: value ?? '', pageIndex: 0 })}
          />
          <Button
            icon={<SyncOutlined />}
            title="Reload Data"
            onClick={() => refreshData?.()}
          />
        </Space>
        {chips.length > 0 ? (
          <div className="list-filter-chips">
            <Space size={4} wrap>
              {chips.map(chip => (
                <Tag
                  key={chip.key}
                  closable
                  onClose={event => {
                    event.preventDefault();
                    if (chip.key === 'search') setSearchText('');
                    refreshPage({ [chip.key]: '', pageIndex: 0 });
                  }}
                >
                  {`${chip.label}: ${chip.value}`}
                </Tag>
              ))}
              <a
                onClick={() => {
                  setSearchText('');
                  refreshPage({ search: '', status: '', pageIndex: 0 });
                }}
              >
                Clear all
              </a>
            </Space>
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="list-container" ref={containerRef}>
      <Table<T>
        className="list-table"
        rowKey="_id"
        dataSource={rows}
        columns={columns}
        loading={loading}
        bordered
        title={header}
        size="middle"
        tableLayout="fixed"
        pagination={false}
        scroll={{ y: scrollY }}
        footer={() => (
          <Pagination
            current={numPageIndex}
            pageSize={numPageSize}
            showSizeChanger
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
            onChange={(index, size) => refreshPage({ pageIndex: index - 1, pageSize: size })}
            total={totalResults}
          />
        )}
      />
    </div>
  );
};

export default DocumentList;

/** Builds the URL for a list's search, status and page params. */
export const listUrl = (
  pathname: string,
  current: { search?: unknown; status?: unknown; pageIndex?: unknown; pageSize?: unknown },
  next: DocumentListParams
) => {
  const has = (key: keyof DocumentListParams) =>
    Object.prototype.hasOwnProperty.call(next, key);
  const search = has('search') ? next.search ?? '' : String(current.search ?? '');
  const status = has('status') ? next.status ?? '' : String(current.status ?? '');
  const pageIndex = has('pageIndex') ? next.pageIndex ?? 0 : current.pageIndex ?? 0;
  const pageSize = has('pageSize') ? next.pageSize ?? 20 : current.pageSize ?? 20;
  return `${pathname}?search=${encodeURIComponent(String(search))}&status=${status}&pageIndex=${pageIndex}&pageSize=${pageSize}`;
};
