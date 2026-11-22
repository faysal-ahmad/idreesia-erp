import React, { useState } from 'react';
import { Link, type RouteComponentProps } from 'react-router-dom';
import { parse } from 'query-string';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { DownloadOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, DatePicker, Empty, Space, Table, Tabs, Tag } from 'antd';
import type { Dayjs } from 'dayjs';

import { message } from '/imports/ui/antd-feedback';
import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { downloadReport } from 'meteor/idreesia-common/utilities';

import { formatDate, formatMoney } from '../common/format';
import StatusTag from '../common/status-tag';
import VendorSelect from '../common/vendor-select';
import { default as paths } from '../submodule-paths';
import {
  PURCHASING_OPEN_ORDERS,
  PURCHASING_PAYABLES_AGING,
  PURCHASING_SPENDING_BY_MONTH,
  PURCHASING_SPENDING_BY_VENDOR,
  PURCHASING_VENDOR_LEDGER,
} from './gql';

const { RangePicker } = DatePicker;

type Range = [Dayjs | null, Dayjs | null];

const rangeVariables = (range: Range) => ({
  fromDate: range[0] ? String(range[0].startOf('day').valueOf()) : undefined,
  toDate: range[1] ? String(range[1].endOf('day').valueOf()) : undefined,
});

/** The "fromMs,toMs" argument the Excel reports take. */
const rangeArgs = (range: Range) => {
  const { fromDate, toDate } = rangeVariables(range);
  return `${fromDate ?? ''},${toDate ?? ''}`;
};

const exportReport = (reportName: string, reportArgs: string) =>
  downloadReport(reportName, reportArgs).catch(() =>
    message.error('The report could not be downloaded.', 5)
  );

const ExportButton = ({ reportName, reportArgs }: { reportName: string; reportArgs: string }) => (
  <Button icon={<DownloadOutlined />} onClick={() => exportReport(reportName, reportArgs)}>
    Excel
  </Button>
);

const DateRange = ({ value, onChange }: { value: Range; onChange: (range: Range) => void }) => (
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
const ReportTable = ({ query, variables, dataKey, rowKey, columns, skip, summary, rowsOf, exportAs }: ReportTableProps) => {
  const { data, loading, refetch } = useQuery(query, { variables, skip });
  const result = data?.[dataKey];
  const rows = ((rowsOf ? rowsOf(result) : result) ?? []).filter((row: any) => row != null);

  return (
    <>
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
      />
    </>
  );
};

const sum = (rows: any[], field: string) =>
  Math.round(rows.reduce((total, row) => total + (row[field] ?? 0), 0) * 100) / 100;

const SpendingByVendor = () => {
  const [range, setRange] = useState<Range>([null, null]);
  return (
    <>
      <Space style={{ marginBottom: 12 }}><DateRange value={range} onChange={setRange} /></Space>
      <ReportTable
        query={PURCHASING_SPENDING_BY_VENDOR}
        variables={rangeVariables(range)}
        dataKey="purchasingSpendingByVendor"
        exportAs={{ reportName: 'PurchasingSpendingByVendor', reportArgs: rangeArgs(range) }}
        rowKey="vendorId"
        columns={[
          { title: 'Vendor', key: 'vendor', render: (_: unknown, r: any) => r.vendor?.name ?? '' },
          { title: 'Invoices', dataIndex: 'invoiceCount', width: 110, align: 'right' },
          { title: 'Billed', dataIndex: 'total', width: 160, align: 'right', render: formatMoney },
          { title: 'Paid', dataIndex: 'paidAmount', width: 160, align: 'right', render: formatMoney },
          {
            title: 'Outstanding',
            key: 'outstanding',
            width: 160,
            align: 'right',
            render: (_: unknown, r: any) => formatMoney(Math.round((r.total - r.paidAmount) * 100) / 100),
          },
        ]}
        summary={(rows) => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0}><strong>Total</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={1} align="right"><strong>{sum(rows, 'invoiceCount')}</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={2} align="right"><strong>{formatMoney(sum(rows, 'total'))}</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={3} align="right"><strong>{formatMoney(sum(rows, 'paidAmount'))}</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={4} align="right">
              <strong>{formatMoney(Math.round((sum(rows, 'total') - sum(rows, 'paidAmount')) * 100) / 100)}</strong>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    </>
  );
};

const SpendingByMonth = () => {
  const [range, setRange] = useState<Range>([null, null]);
  return (
    <>
      <Space style={{ marginBottom: 12 }}><DateRange value={range} onChange={setRange} /></Space>
      <ReportTable
        query={PURCHASING_SPENDING_BY_MONTH}
        variables={rangeVariables(range)}
        dataKey="purchasingSpendingByMonth"
        exportAs={{ reportName: 'PurchasingSpendingByMonth', reportArgs: rangeArgs(range) }}
        rowKey="month"
        columns={[
          { title: 'Month', dataIndex: 'month' },
          { title: 'Invoices', dataIndex: 'invoiceCount', width: 110, align: 'right' },
          { title: 'Billed', dataIndex: 'total', width: 180, align: 'right', render: formatMoney },
        ]}
        summary={(rows) => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0}><strong>Total</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={1} align="right"><strong>{sum(rows, 'invoiceCount')}</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={2} align="right"><strong>{formatMoney(sum(rows, 'total'))}</strong></Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    </>
  );
};

const OpenOrders = () => (
  <ReportTable
    query={PURCHASING_OPEN_ORDERS}
    dataKey="purchasingOpenOrders"
    exportAs={{ reportName: 'PurchasingOpenOrders', reportArgs: '' }}
    rowKey="orderId"
    columns={[
      {
        title: 'Order',
        dataIndex: 'number',
        width: 150,
        render: (text: string, r: any) => <Link to={paths.orderEditPath(r.orderId)}>{text}</Link>,
      },
      { title: 'Vendor', key: 'vendor', render: (_: unknown, r: any) => r.vendor?.name ?? '' },
      { title: 'Status', dataIndex: 'status', width: 160, render: (s: string) => <StatusTag status={s} /> },
      {
        title: 'Expected Delivery',
        dataIndex: 'expectedDeliveryDate',
        width: 190,
        render: (value: string, r: any) => (
          <>
            {formatDate(value)} {r.isOverdue ? <Tag color="error">Overdue</Tag> : null}
          </>
        ),
      },
      { title: 'Order Total', dataIndex: 'total', width: 140, align: 'right', render: formatMoney },
      { title: 'Still Due', dataIndex: 'outstandingValue', width: 140, align: 'right', render: formatMoney },
    ]}
  />
);

const PayablesAging = () => (
  <ReportTable
    query={PURCHASING_PAYABLES_AGING}
    dataKey="purchasingPayablesAging"
    exportAs={{ reportName: 'PurchasingPayablesAging', reportArgs: '' }}
    rowKey="vendorId"
    columns={[
      { title: 'Vendor', key: 'vendor', render: (_: unknown, r: any) => r.vendor?.name ?? '' },
      { title: 'Not Yet Due', dataIndex: 'current', width: 140, align: 'right', render: formatMoney },
      { title: '1-30 Days', dataIndex: 'days1To30', width: 140, align: 'right', render: formatMoney },
      { title: '31-60 Days', dataIndex: 'days31To60', width: 140, align: 'right', render: formatMoney },
      { title: '61+ Days', dataIndex: 'days61Plus', width: 140, align: 'right', render: formatMoney },
      { title: 'Total Owed', dataIndex: 'total', width: 150, align: 'right', render: formatMoney },
    ]}
    summary={(rows) => (
      <Table.Summary.Row>
        <Table.Summary.Cell index={0}><strong>Total</strong></Table.Summary.Cell>
        {['current', 'days1To30', 'days31To60', 'days61Plus', 'total'].map((field, i) => (
          <Table.Summary.Cell key={field} index={i + 1} align="right">
            <strong>{formatMoney(sum(rows, field))}</strong>
          </Table.Summary.Cell>
        ))}
      </Table.Summary.Row>
    )}
  />
);

const VendorLedger = () => {
  const [vendorId, setVendorId] = useState<string | undefined>();
  const [range, setRange] = useState<Range>([null, null]);
  const { data } = useQuery(PURCHASING_VENDOR_LEDGER, {
    variables: { vendorId: vendorId ?? '', ...rangeVariables(range) },
    skip: !vendorId,
  });
  const ledger = data?.purchasingVendorLedger;

  return (
    <>
      <Space style={{ marginBottom: 12 }} wrap>
        <VendorSelect includeInactive value={vendorId} onChange={setVendorId} />
        <DateRange value={range} onChange={setRange} />
        {vendorId ? (
          <ExportButton reportName="PurchasingVendorLedger" reportArgs={`${vendorId},${rangeArgs(range)}`} />
        ) : null}
      </Space>
      {!vendorId ? (
        <Empty description="Choose a vendor" />
      ) : (
        <Table
          className="list-table"
          rowKey={(row: any) => `${row.type}-${row.documentId}`}
          size="middle"
          bordered
          pagination={false}
          dataSource={(ledger?.entries ?? []).filter((e) => e != null) as any[]}
          columns={[
            { title: 'Date', dataIndex: 'date', width: 130, render: formatDate },
            {
              title: 'Document',
              key: 'document',
              render: (_: unknown, e: any) => (
                <Link to={e.type === 'invoice' ? paths.invoiceViewPath(e.documentId) : paths.paymentViewPath(e.documentId)}>
                  {e.number}
                </Link>
              ),
            },
            { title: 'Reference', dataIndex: 'reference' },
            {
              title: 'Billed',
              key: 'billed',
              width: 150,
              align: 'right',
              render: (_: unknown, e: any) => (e.amount > 0 ? formatMoney(e.amount) : ''),
            },
            {
              title: 'Paid',
              key: 'paid',
              width: 150,
              align: 'right',
              render: (_: unknown, e: any) => (e.amount < 0 ? formatMoney(-e.amount) : ''),
            },
            { title: 'Balance', dataIndex: 'balance', width: 150, align: 'right', render: formatMoney },
          ]}
          title={() => <strong>Opening balance: {formatMoney(ledger?.openingBalance ?? 0)}</strong>}
          footer={() => <strong>Closing balance: {formatMoney(ledger?.closingBalance ?? 0)}</strong>}
        />
      )}
    </>
  );
};

const TABS = [
  { key: 'vendors', label: 'Spending by Vendor', children: <SpendingByVendor /> },
  { key: 'months', label: 'Spending by Month', children: <SpendingByMonth /> },
  { key: 'open-orders', label: 'Open Orders', children: <OpenOrders /> },
  { key: 'aging', label: 'Payables Aging', children: <PayablesAging /> },
  { key: 'ledger', label: 'Vendor Ledger', children: <VendorLedger /> },
];

const ReportsPage = ({ history, location }: RouteComponentProps) => {
  useBreadcrumbs(['Purchasing', 'Reports']);
  const requested = String(parse(location.search).tab ?? '');
  const activeKey = TABS.some((t) => t.key === requested) ? requested : TABS[0].key;

  return (
    <Tabs
      activeKey={activeKey}
      items={TABS}
      destroyOnHidden
      onChange={(key) => history.replace(`${location.pathname}?tab=${key}`)}
    />
  );
};

export default ReportsPage;
