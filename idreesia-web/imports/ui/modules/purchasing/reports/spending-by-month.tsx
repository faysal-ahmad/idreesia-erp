import React, { useState } from 'react';
import type { RouteComponentProps } from 'react-router-dom';
import { Space, Table } from 'antd';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';

import { formatMoney } from '../common/format';
import { PURCHASING_SPENDING_BY_MONTH } from './gql';
import { DateRange, type Range, rangeArgs, rangeVariables, ReportTable, sum } from './report-table';

const SpendingByMonth = (_props: RouteComponentProps) => {
  useBreadcrumbs(['Purchasing', 'Reports', 'Spending by Month']);
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

export default SpendingByMonth;
