import React from 'react';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { DownloadOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, DatePicker, Empty, Space, Table } from 'antd';
import type { Dayjs } from 'dayjs';

import { message } from '/imports/ui/antd-feedback';
import useListScrollY from '/imports/ui/modules/security/security-server/common/use-list-scroll-y';
import { downloadReport } from 'meteor/idreesia-common/utilities';

const { RangePicker } = DatePicker;

export type Range = [Dayjs | null, Dayjs | null];

export const rangeVariables = (range: Range) => ({
  fromDate: range[0] ? String(range[0].startOf('day').valueOf()) : undefined,
  toDate: range[1] ? String(range[1].endOf('day').valueOf()) : undefined,
});

/** The "fromMs,toMs" argument the Excel reports take. */
export const rangeArgs = (range: Range) => {
  const { fromDate, toDate } = rangeVariables(range);
  return `${fromDate ?? ''},${toDate ?? ''}`;
};

const exportReport = (reportName: string, reportArgs: string) =>
  downloadReport(reportName, reportArgs).catch(() =>
    message.error('The report could not be downloaded.', 5)
  );

export const ExportButton = ({ reportName, reportArgs }: { reportName: string; reportArgs: string }) => (
  <Button icon={<DownloadOutlined />} onClick={() => exportReport(reportName, reportArgs)}>
    Excel
  </Button>
);

export const DateRange = ({ value, onChange }: { value: Range; onChange: (range: Range) => void }) => (
  <RangePicker
    format="DD MMM, YYYY"
    value={value}
    onChange={(next) => onChange([next?.[0] ?? null, next?.[1] ?? null])}
  />
);

interface ReportTableProps {
  query: TypedDocumentNode<any, any>;
  variables?: Record<string, unknown>;
  dataKey: string;
  rowKey: string;
  columns: any[];
  skip?: boolean;
  summary?: (rows: any[]) => React.ReactNode;
  // Pull the rows out of the result when it isn't a plain list.
  rowsOf?: (result: any) => any[];
  // The Excel version of this report.
  exportAs?: { reportName: string; reportArgs: string };
}

/** A report: toolbar with refresh, and a table of what the query returns. */
export const ReportTable = ({ query, variables, dataKey, rowKey, columns, skip, summary, rowsOf, exportAs }: ReportTableProps) => {
  const { data, loading, refetch } = useQuery(query, { variables, skip, fetchPolicy: 'cache-and-network' });
  const { containerRef, scrollY } = useListScrollY();
  const result = data?.[dataKey];
  const rows = ((rowsOf ? rowsOf(result) : result) ?? []).filter((row: any) => row != null);

  return (
    <div className="list-container" ref={containerRef}>
      <div style={{ marginBottom: 12, textAlign: 'right' }}>
        <Space>
          {exportAs ? <ExportButton {...exportAs} /> : null}
          <Button icon={<SyncOutlined />} onClick={() => refetch()} title="Reload Data" />
        </Space>
      </div>
      <Table
        className="list-table"
        rowKey={rowKey}
        size="middle"
        bordered
        loading={loading}
        pagination={false}
        dataSource={rows}
        columns={columns}
        locale={{ emptyText: <Empty description="Nothing to show" /> }}
        summary={summary ? () => summary(rows) : undefined}
        scroll={{ y: scrollY }}
      />
    </div>
  );
};

export const sum = (rows: any[], field: string) =>
  Math.round(rows.reduce((total, row) => total + (row[field] ?? 0), 0) * 100) / 100;
