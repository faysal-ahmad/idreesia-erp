import React, { useState } from 'react';
import type { RouteComponentProps } from 'react-router-dom';
import { Space, Table } from 'antd';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';

import { formatMoney } from '../common/format';
import { PURCHASING_SPENDING_BY_VENDOR } from './gql';
import { DateRange, type Range, rangeArgs, rangeVariables, ReportTable, sum } from './report-table';

const SpendingByVendor = (_props: RouteComponentProps) => {
  useBreadcrumbs(['Purchasing', 'Reports', 'Spending by Vendor']);
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

export default SpendingByVendor;
