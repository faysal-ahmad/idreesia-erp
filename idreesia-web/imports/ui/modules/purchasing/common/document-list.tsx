import React from 'react';
import { type RouteComponentProps } from 'react-router-dom';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { PlusCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Checkbox, DatePicker, Input, Pagination, Select, Space, Spin, Table } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { useBreadcrumbs, useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import useListScrollY from '/imports/ui/modules/security/security-server/common/use-list-scroll-y';

import { toDayjs } from './format';
import { statusOptions } from './status-tag';
import VendorSelect from './vendor-select';

interface DocumentListProps extends RouteComponentProps {
  breadcrumbs: string[];
  // The paged query, and the name of the field it returns.
  query: TypedDocumentNode<any, any>;
  dataKey: string;
  columns: any[];
  // Plural, for the pagination text: "12 orders".
  noun: string;
  searchPlaceholder: string;
  newButton?: { label: string; onClick: () => void };
  statuses?: string[];
  showVendorFilter?: boolean;
  showDateRange?: boolean;
  // A yes/no filter, e.g. { name: 'overdue', label: 'Overdue only' }. The
  // name is both the URL parameter and the query variable.
  toggle?: { name: string; label: string };
}

const { RangePicker } = DatePicker;

/**
 * A server-paged list of a purchasing document, with search, status, vendor
 * and date filters kept in the URL. The toolbar sits in the table title so
 * only the table body scrolls.
 */
const DocumentList = ({
  history,
  location,
  breadcrumbs,
  query,
  dataKey,
  columns,
  noun,
  searchPlaceholder,
  newButton,
  statuses,
  showVendorFilter = false,
  showDateRange = false,
  toggle,
}: DocumentListProps) => {
  useBreadcrumbs(breadcrumbs);

  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['search', 'status', 'vendorId', 'fromDate', 'toDate', 'toggle', 'pageIndex', 'pageSize'],
    paramDefaultValues: { status: 'all' },
  });
  const search = String(queryParams.search ?? '');
  const status = String(queryParams.status ?? 'all');
  const vendorId = String(queryParams.vendorId ?? '');
  const fromDate = String(queryParams.fromDate ?? '');
  const toDate = String(queryParams.toDate ?? '');
  const toggled = String(queryParams.toggle ?? '') === '1';
  const pageIndex = toSafeInteger(queryParams.pageIndex);
  const pageSize = toSafeInteger(queryParams.pageSize) || 20;

  const { containerRef, scrollY } = useListScrollY();

  const variables: Record<string, unknown> = {
    search: search || undefined,
    status: status === 'all' ? undefined : status,
    pageIndex,
    pageSize,
  };
  if (showVendorFilter) variables.vendorId = vendorId || undefined;
  if (showDateRange) {
    variables.fromDate = fromDate || undefined;
    variables.toDate = toDate || undefined;
  }

  if (toggle) variables[toggle.name] = toggled || undefined;

  const { data, loading, refetch } = useQuery(query, { variables });
  const paged = data?.[dataKey];
  const rows = (paged?.data ?? []).filter((row: any) => row?._id != null);
  const totalResults = paged?.totalResults ?? 0;

  const handleRefresh = () => {
    refetch().then(() => {
      message.success('Data Reloaded', 2);
    });
  };

  const handlePaginationChange = (page: number, size?: number) => {
    setPageParams({ pageIndex: page - 1, pageSize: size ?? pageSize });
  };

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="list-container" ref={containerRef}>
      <Table
        className="list-table"
        rowKey="_id"
        dataSource={rows}
        columns={columns}
        bordered
        size="middle"
        tableLayout="fixed"
        pagination={false}
        scroll={{ y: scrollY }}
        title={() => (
          <div className="list-table-header">
            <Space size={12}>
              {newButton ? (
                <Button type="primary" icon={<PlusCircleOutlined />} onClick={newButton.onClick}>
                  {newButton.label}
                </Button>
              ) : null}
            </Space>
            <div className="list-table-header-utilities">
              <Space size={8} wrap>
                <Input.Search
                  allowClear
                  placeholder={searchPlaceholder}
                  defaultValue={search}
                  style={{ width: 220 }}
                  onSearch={(value) => setPageParams({ search: value, pageIndex: 0 })}
                />
                {statuses ? (
                  <Select
                    value={status}
                    style={{ width: 170 }}
                    options={[{ value: 'all', label: 'All statuses' }, ...statusOptions(statuses)]}
                    onChange={(value) => setPageParams({ status: value, pageIndex: 0 })}
                  />
                ) : null}
                {showVendorFilter ? (
                  <VendorSelect
                    includeInactive
                    placeholder="All vendors"
                    value={vendorId || undefined}
                    style={{ minWidth: 200 }}
                    onChange={(value) => setPageParams({ vendorId: value ?? '', pageIndex: 0 })}
                  />
                ) : null}
                {showDateRange ? (
                  <RangePicker
                    format="DD MMM, YYYY"
                    value={[toDayjs(fromDate), toDayjs(toDate)]}
                    onChange={(range) =>
                      setPageParams({
                        fromDate: range?.[0] ? String(range[0].startOf('day').valueOf()) : '',
                        toDate: range?.[1] ? String(range[1].endOf('day').valueOf()) : '',
                        pageIndex: 0,
                      })
                    }
                  />
                ) : null}
                {toggle ? (
                  <Checkbox
                    checked={toggled}
                    onChange={(event) =>
                      setPageParams({ toggle: event.target.checked ? '1' : '', pageIndex: 0 })
                    }
                  >
                    {toggle.label}
                  </Checkbox>
                ) : null}
                <Button icon={<SyncOutlined />} onClick={handleRefresh} title="Reload Data" />
              </Space>
            </div>
          </div>
        )}
        footer={() => (
          <Pagination
            current={pageIndex + 1}
            pageSize={pageSize}
            showSizeChanger
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} ${noun}`}
            onChange={handlePaginationChange}
            onShowSizeChange={handlePaginationChange}
            total={totalResults}
          />
        )}
      />
    </div>
  );
};

export default DocumentList;
