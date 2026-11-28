import React from 'react';
import type { RouteComponentProps } from 'react-router-dom';
import { Table } from 'antd';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';

import { formatMoney } from '../common/format';
import { PURCHASING_PAYABLES_AGING } from './gql';
import { ReportTable, sum } from './report-table';

const PayablesAging = (_props: RouteComponentProps) => {
  useBreadcrumbs(['Purchasing', 'Reports', 'Payables Aging']);
  return (
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
};

export default PayablesAging;
