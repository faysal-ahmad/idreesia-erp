import React from 'react';
import { Link, type RouteComponentProps } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { Card, Spin, Statistic } from 'antd';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';

import { formatMoney } from '../common/format';
import { default as paths } from '../submodule-paths';
import { PURCHASING_DASHBOARD } from './gql';

const Dashboard = (_props: RouteComponentProps) => {
  useBreadcrumbs(['Purchasing', 'Dashboard']);
  const { data, loading } = useQuery(PURCHASING_DASHBOARD, { fetchPolicy: 'cache-and-network' });
  const counts = data?.purchasingDashboard;

  if (loading && !counts) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const cards = [
    {
      title: 'Requisitions awaiting approval',
      value: counts?.requisitionsAwaitingApproval ?? 0,
      to: `${paths.requisitionsPath}?status=submitted`,
    },
    {
      title: 'Orders awaiting approval',
      value: counts?.ordersAwaitingApproval ?? 0,
      to: `${paths.ordersPath}?status=pending-approval`,
    },
    {
      title: 'Open orders',
      value: counts?.openOrders ?? 0,
      to: `${paths.reportsPath}?tab=open-orders`,
    },
    {
      title: 'Overdue invoices',
      value: counts?.overdueInvoices ?? 0,
      to: `${paths.invoicesPath}?toggle=1`,
      alert: (counts?.overdueInvoices ?? 0) > 0,
    },
    {
      title: 'Total payable',
      value: formatMoney(counts?.totalPayable ?? 0),
      to: `${paths.reportsPath}?tab=aging`,
    },
    {
      title: 'Overdue amount',
      value: formatMoney(counts?.overdueAmount ?? 0),
      to: `${paths.reportsPath}?tab=aging`,
      alert: (counts?.overdueAmount ?? 0) > 0,
    },
  ];

  return (
    <div className="purchasing-dashboard-cards">
      {cards.map((card) => (
        <Link key={card.title} to={card.to}>
          <Card size="small" hoverable>
            <Statistic
              title={card.title}
              value={card.value}
              valueStyle={card.alert ? { color: '#b42318' } : undefined}
            />
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default Dashboard;
