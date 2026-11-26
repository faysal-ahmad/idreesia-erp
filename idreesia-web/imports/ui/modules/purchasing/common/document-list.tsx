import React from 'react';
import { type RouteComponentProps } from 'react-router-dom';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Pagination, Space, Spin, Table } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { useBreadcrumbs, useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import useListScrollY from '/imports/ui/modules/security/security-server/common/use-list-scroll-y';

import { DocumentFilterChips, DocumentListFilter, type DocumentFilterValues } from './document-list-filter';

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
  // Purchasing's own documents or the ones raised for a store.
  showSourceFilter?: boolean;
  showDateRange?: boolean;
  // A yes/no filter, e.g. { name: 'overdue', label: 'Overdue only' }. The
  // name is both the URL parameter and the query variable.
  toggle?: { name: string; label: string };
}

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
  showSourceFilter = false,
  showDateRange = false,
  toggle,
}: DocumentListProps) => {
  useBreadcrumbs(breadcrumbs);

  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['search', 'status', 'vendorId', 'source', 'fromDate', 'toDate', 'toggle', 'pageIndex', 'pageSize'],
    paramDefaultValues: { status: 'all', source: 'all' },
  });
  const search = String(queryParams.search ?? '');
  const status = String(queryParams.status ?? 'all');
  const vendorId = String(queryParams.vendorId ?? '');
  const source = String(queryParams.source ?? 'all');
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
  if (showSourceFilter) variables.source = source === 'all' ? undefined : source;
  if (showDateRange) {
    variables.fromDate = fromDate || undefined;
    variables.toDate = toDate || undefined;
  }

  if (toggle) variables[toggle.name] = toggled || undefined;

  const { data, loading, refetch } = useQuery(query, { variables, fetchPolicy: 'cache-and-network' });
  const paged = data?.[dataKey];
  const rows = (paged?.data ?? []).filter((row: any) => row?._id != null);
  const totalResults = paged?.totalResults ?? 0;

  const handleRefresh = () => {
    refetch().then(() => {
      message.success('Data Reloaded', 2);
    });
  };

  const filterValues: DocumentFilterValues = {
    search,
    status,
    vendorId,
    source,
    fromDate,
    toDate,
    toggled,
  };
  const filterProps = {
    values: filterValues,
    searchPlaceholder,
    statuses,
    showVendorFilter,
    showSourceFilter,
    showDateRange,
    toggle,
    onApply: (next: Partial<DocumentFilterValues>) => {
      const { toggled: nextToggled, ...rest } = next;
      setPageParams({
        ...rest,
        ...(nextToggled === undefined ? {} : { toggle: nextToggled ? '1' : '' }),
        pageIndex: 0,
      });
    },
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
              <DocumentListFilter {...filterProps} onRefresh={handleRefresh} />
              <DocumentFilterChips {...filterProps} />
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
