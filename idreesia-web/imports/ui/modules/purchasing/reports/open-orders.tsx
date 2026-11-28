import React from 'react';
import { Link, type RouteComponentProps } from 'react-router-dom';
import { Tag } from 'antd';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';

import { formatDate, formatMoney } from '../common/format';
import StatusTag from '../common/status-tag';
import { default as paths } from '../submodule-paths';
import { PURCHASING_OPEN_ORDERS } from './gql';
import { ReportTable } from './report-table';

const OpenOrders = (_props: RouteComponentProps) => {
  useBreadcrumbs(['Purchasing', 'Reports', 'Open Orders']);
  return (
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
};

export default OpenOrders;
