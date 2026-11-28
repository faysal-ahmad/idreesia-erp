import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';
import { Pagination, Table } from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';
import { OperationType, OperationTypeDisplayName } from 'meteor/idreesia-common/constants/audit';

import { PAGED_PURCHASING_AUDIT_LOGS } from './gql';

interface HistoryTabProps {
  entityId: string;
}

// "vendorInvoiceNo" -> "Vendor Invoice No"
const fieldLabel = (fieldName: string) =>
  fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (first) => first.toUpperCase())
    .trim();

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

const formatValue = (value: unknown) => {
  if (value == null || value === '') return '(none)';
  if (typeof value === 'string' && ISO_DATE.test(value)) {
    return dayjs(value).format(Formats.DATE_FORMAT);
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

export const changeLines = (operationType: string | null | undefined, auditValues: (string | null)[] | null | undefined) =>
  (auditValues ?? []).flatMap((entry, index) => {
    if (!entry) return [];
    let parsed: { fieldName?: string; changedFrom?: unknown; changedTo?: unknown };
    try {
      parsed = JSON.parse(entry);
    } catch {
      return [];
    }
    if (!parsed.fieldName) return [];
    const label = fieldLabel(parsed.fieldName);
    // A created document, and values logged without a previous one, have no "from".
    const text =
      operationType === OperationType.CREATE || parsed.changedFrom === undefined
        ? `${label}: ${formatValue(parsed.changedTo)}`
        : `${label}: ${formatValue(parsed.changedFrom)} → ${formatValue(parsed.changedTo)}`;
    return [<li key={index}>{text}</li>];
  });

/** Who changed a purchasing document, and when. */
const HistoryTab = ({ entityId }: HistoryTabProps) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const { data, loading } = useQuery(PAGED_PURCHASING_AUDIT_LOGS, {
    variables: {
      filter: { entityId, pageIndex: String(pageIndex), pageSize: String(pageSize) },
    },
    fetchPolicy: 'cache-and-network',
  });
  const paged = data?.pagedPurchasingAuditLogs;
  const rows = (paged?.data ?? []).filter((row) => row?._id);

  return (
    <div className="purchasing-document">
      <Table
        className="list-table"
        rowKey="_id"
        size="small"
        bordered
        loading={loading}
        pagination={false}
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
            render: (_: unknown, row: any) => <ul style={{ margin: 0, paddingLeft: 18 }}>{changeLines(row.operationType, row.auditValues)}</ul>,
          },
        ]}
        footer={() => (
          <Pagination
            current={pageIndex + 1}
            pageSize={pageSize}
            showSizeChanger
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} entries`}
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

export default HistoryTab;
