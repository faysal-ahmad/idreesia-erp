import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { DatePicker, Pagination, Select, Space, Table } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';

import { Formats } from 'meteor/idreesia-common/constants';
import {
  EntityType,
  OperationTypeDisplayName,
} from 'meteor/idreesia-common/constants/audit';
import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';

import { PAGED_PURCHASING_AUDIT_LOGS } from '../common/gql';
import { changeLines } from '../common/history-tab';
import useListScrollY from '/imports/ui/modules/security/security-server/common/use-list-scroll-y';
import { default as paths } from '../submodule-paths';

const { RangePicker } = DatePicker;

// Document type -> display name and the page that opens that document.
const DOCUMENT_TYPES: Record<string, { label: string; path: (id: string) => string }> = {
  [EntityType.PURCHASING_VENDOR]: { label: 'Vendor', path: paths.vendorEditPath },
  [EntityType.PURCHASING_CATALOG_ITEM]: { label: 'Catalog Item', path: paths.catalogItemEditPath },
  [EntityType.PURCHASING_REQUISITION]: { label: 'Requisition', path: paths.requisitionEditPath },
  [EntityType.PURCHASING_QUOTE]: { label: 'Quote', path: paths.quoteEditPath },
  [EntityType.PURCHASING_ORDER]: { label: 'Purchase Order', path: paths.orderEditPath },
  [EntityType.PURCHASING_RECEIPT]: { label: 'Goods Receipt', path: paths.receiptViewPath },
  [EntityType.PURCHASING_INVOICE]: { label: 'Invoice', path: paths.invoiceViewPath },
  [EntityType.PURCHASING_PAYMENT]: { label: 'Payment', path: paths.paymentViewPath },
};

type Range = [Dayjs | null, Dayjs | null];

/** Every change made to any Purchasing document, newest first. */
const AuditLogsPage = () => {
  useBreadcrumbs(['Purchasing', 'Administration', 'Audit Logs']);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [entityTypes, setEntityTypes] = useState<string[]>([]);
  const [range, setRange] = useState<Range>([null, null]);

  const { data, loading } = useQuery(PAGED_PURCHASING_AUDIT_LOGS, {
    variables: {
      filter: {
        entityTypes: entityTypes.length ? entityTypes : undefined,
        fromDate: range[0] ? String(range[0].startOf('day').valueOf()) : undefined,
        toDate: range[1] ? String(range[1].endOf('day').valueOf()) : undefined,
        pageIndex: String(pageIndex),
        pageSize: String(pageSize),
      },
    },
  });
  const { containerRef, scrollY } = useListScrollY();
  const paged = data?.pagedPurchasingAuditLogs;
  const rows = (paged?.data ?? []).filter((row) => row?._id);

  return (
    <div className="list-container" ref={containerRef}>
      <Space wrap style={{ marginBottom: 12 }}>
        <Select
          mode="multiple"
          allowClear
          placeholder="All document types"
          style={{ minWidth: 260 }}
          value={entityTypes}
          options={Object.entries(DOCUMENT_TYPES).map(([value, { label }]) => ({ value, label }))}
          onChange={(value) => {
            setEntityTypes(value);
            setPageIndex(0);
          }}
        />
        <RangePicker
          format="DD MMM, YYYY"
          value={range}
          onChange={(next) => {
            setRange([next?.[0] ?? null, next?.[1] ?? null]);
            setPageIndex(0);
          }}
        />
      </Space>
      <Table
        className="list-table"
        rowKey="_id"
        size="small"
        bordered
        loading={loading}
        pagination={false}
        scroll={{ y: scrollY }}
        dataSource={rows as any[]}
        columns={[
          {
            title: 'When',
            dataIndex: 'operationTime',
            width: 150,
            render: (value: string) => {
              const date = dayjs(Number(value));
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
            title: 'Document',
            key: 'document',
            width: 190,
            render: (_: unknown, row: any) => {
              const type = DOCUMENT_TYPES[row.entityType];
              if (!type) return row.entityId;
              return <Link to={type.path(row.entityId)}>{type.label}</Link>;
            },
          },
          { title: 'By', dataIndex: 'operationByName', width: 200 },
          {
            title: 'Action',
            dataIndex: 'operationType',
            width: 110,
            render: (type: string) => OperationTypeDisplayName[type] ?? type,
          },
          {
            title: 'Changes',
            key: 'changes',
            render: (_: unknown, row: any) => (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {changeLines(row.operationType, row.auditValues)}
              </ul>
            ),
          },
        ]}
        footer={() => (
          <Pagination
            current={pageIndex + 1}
            pageSize={pageSize}
            showSizeChanger
            showTotal={(total, r) => `${r[0]}-${r[1]} of ${total} entries`}
            total={paged?.totalResults ?? 0}
            onChange={(page, size) => {
              setPageIndex(page - 1);
              if (size != null) setPageSize(size);
            }}
            onShowSizeChange={(_page, size) => {
              setPageIndex(0);
              setPageSize(size);
            }}
          />
        )}
      />
    </div>
  );
};

export default AuditLogsPage;
