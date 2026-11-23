import React from 'react';
import { List } from 'antd-mobile';
import { useQuery } from '@apollo/client/react';
import { ModulePaths } from 'meteor/idreesia-common/constants';

import { Page, PageError, PageLoading } from '../../../layout';
import { useHistory } from '../../../router';
import { formatMoney } from '../format';
import { MOBILE_PURCHASING_DASHBOARD, MOBILE_PURCHASING_PAYABLES_AGING } from '../gql';
import { PurchasingPaths, PurchasingQueries } from '../paths';
import { usePurchasingAccess } from '../use-purchasing-access';

interface CardProps {
  label: string;
  value: React.ReactNode;
  alert?: boolean;
  onClick?: () => void;
}

const Card = ({ label, value, alert, onClick }: CardProps) => (
  <button
    className={alert ? 'purchasing-card purchasing-card-alert' : 'purchasing-card'}
    disabled={!onClick}
    type="button"
    onClick={onClick}
  >
    <span className="purchasing-card-value">{value}</span>
    <span className="purchasing-card-label">{label}</span>
  </button>
);

/** Purchasing → Dashboard: the numbers that matter, each opening the list behind it. */
export const DashboardScreen = () => {
  const history = useHistory();
  const { has, canApproveRequisitions, canApproveOrders } = usePurchasingAccess();
  const { data, loading, error, refetch } = useQuery(MOBILE_PURCHASING_DASHBOARD, {
    fetchPolicy: 'cache-and-network',
  });
  const aging = useQuery(MOBILE_PURCHASING_PAYABLES_AGING, { fetchPolicy: 'cache-and-network' });

  const dashboard = data?.purchasingDashboard;
  const agingRows = (aging.data?.purchasingPayablesAging ?? []).filter(row => row != null);
  const sum = (pick: (row: (typeof agingRows)[number]) => number | null | undefined) =>
    agingRows.reduce((total, row) => total + (pick(row) ?? 0), 0);

  let content;
  if (loading && !dashboard) content = <PageLoading />;
  else if (error && !dashboard) content = <PageError error={error} onRetry={() => refetch()} />;
  else if (dashboard) {
    content = (
      <>
        <div className="purchasing-cards">
          <Card
            alert={(dashboard.requisitionsAwaitingApproval ?? 0) > 0}
            label="Requisitions awaiting approval"
            value={dashboard.requisitionsAwaitingApproval ?? 0}
            onClick={
              canApproveRequisitions
                ? () => history.push(PurchasingPaths.approvalsTab(PurchasingQueries.approvalsRequisitions))
                : undefined
            }
          />
          <Card
            alert={(dashboard.ordersAwaitingApproval ?? 0) > 0}
            label="Orders awaiting approval"
            value={dashboard.ordersAwaitingApproval ?? 0}
            onClick={
              canApproveOrders
                ? () => history.push(PurchasingPaths.approvalsTab(PurchasingQueries.approvalsOrders))
                : undefined
            }
          />
          <Card
            label="Open orders"
            value={dashboard.openOrders ?? 0}
            onClick={has('purchasing-manage-receipts') ? () => history.push(PurchasingPaths.receiving) : undefined}
          />
          <Card
            alert={(dashboard.overdueInvoices ?? 0) > 0}
            label="Overdue invoices"
            value={dashboard.overdueInvoices ?? 0}
            onClick={
              has('purchasing-view-invoices', 'purchasing-manage-invoices')
                ? () => history.push(PurchasingPaths.invoicesOverdue)
                : undefined
            }
          />
          <Card label="Total payable" value={formatMoney(dashboard.totalPayable ?? 0)} />
          <Card alert={(dashboard.overdueAmount ?? 0) > 0} label="Overdue amount" value={formatMoney(dashboard.overdueAmount ?? 0)} />
        </div>

        {agingRows.length > 0 && (
          <section className="purchasing-section">
            <h3 className="purchasing-section-title">Payables aging</h3>
            <dl className="purchasing-fields">
              {[
                ['Not yet due', sum(row => row?.current)],
                ['1 to 30 days late', sum(row => row?.days1To30)],
                ['31 to 60 days late', sum(row => row?.days31To60)],
                ['61+ days late', sum(row => row?.days61Plus)],
                ['Total', sum(row => row?.total)],
              ].map(([label, value]) => (
                <div
                  key={label as string}
                  className={label === 'Total' ? 'purchasing-field purchasing-field-strong' : 'purchasing-field'}
                >
                  <dt>{label}</dt>
                  <dd>{formatMoney(value as number)}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
        {agingRows.length > 0 && (
          <List mode="card">
            {agingRows
              .filter(row => (row?.total ?? 0) > 0)
              .map(row => (
                <List.Item
                  key={row?.vendorId}
                  extra={formatMoney(row?.total)}
                  onClick={() => row?.vendorId && history.push(PurchasingPaths.vendor(row.vendorId))}
                >
                  {row?.vendor?.name}
                </List.Item>
              ))}
          </List>
        )}
      </>
    );
  }

  return (
    <Page
      backTo={ModulePaths.purchasing}
      title="Dashboard"
      onRefresh={() => Promise.all([refetch(), aging.refetch()])}
    >
      {content}
    </Page>
  );
};
