import React, { useState } from 'react';
import { List, Tabs } from 'antd-mobile';
import { ModulePaths } from 'meteor/idreesia-common/constants';

import { PagedList } from '../../../components';
import { usePagedQuery } from '../../../hooks';
import { Page } from '../../../layout';
import { useHistory } from '../../../router';
import { useQueryParams } from '../components/use-query-params';
import { formatDate, formatMoney } from '../format';
import { MOBILE_PURCHASING_PAGED_ORDERS, MOBILE_PURCHASING_PAGED_REQUISITIONS } from '../gql';
import { PurchasingPaths, PurchasingQueries } from '../paths';
import { usePurchasingAccess } from '../use-purchasing-access';

const toVariables = <T extends object>(filter: T, paging: { pageIndex: string; pageSize: string }) => ({
  ...filter,
  pageIndex: Number(paging.pageIndex),
  pageSize: Number(paging.pageSize),
});

const RequisitionApprovals = () => {
  const history = useHistory();
  const paged = usePagedQuery(MOBILE_PURCHASING_PAGED_REQUISITIONS, {
    filter: { status: 'submitted' },
    toVariables,
    getPage: data => data.pagedPurchasingRequisitions,
    getKey: requisition => requisition._id,
  });

  return (
    <PagedList
      emptyDescription="Requisitions waiting for approval appear here."
      emptyTitle="Nothing to approve"
      getKey={requisition => requisition._id ?? ''}
      itemsLabel="requisitions waiting"
      paged={paged}
      renderItem={requisition => (
        <List.Item
          arrowIcon
          description={[
            requisition.number,
            requisition.requestedByPerson?.sharedData?.name,
            requisition.estimatedTotal ? formatMoney(requisition.estimatedTotal) : null,
          ]
            .filter(Boolean)
            .join(' · ')}
          onClick={() => requisition._id && history.push(PurchasingPaths.approvalRequisition(requisition._id))}
        >
          {requisition.title ?? requisition.number}
        </List.Item>
      )}
    />
  );
};

const OrderApprovals = () => {
  const history = useHistory();
  const paged = usePagedQuery(MOBILE_PURCHASING_PAGED_ORDERS, {
    filter: { status: 'pending-approval' },
    toVariables,
    getPage: data => data.pagedPurchasingOrders,
    getKey: order => order._id,
  });

  return (
    <PagedList
      emptyDescription="Purchase orders waiting for approval appear here."
      emptyTitle="Nothing to approve"
      getKey={order => order._id ?? ''}
      itemsLabel="orders waiting"
      paged={paged}
      renderItem={order => (
        <List.Item
          arrowIcon
          description={[order.number, formatDate(order.orderDate), order.total ? formatMoney(order.total) : null]
            .filter(Boolean)
            .join(' · ')}
          onClick={() => order._id && history.push(PurchasingPaths.approvalOrder(order._id))}
        >
          {order.vendor?.name ?? order.number}
        </List.Item>
      )}
    />
  );
};

/** Purchasing → Approvals: what is waiting for this user's decision, by kind of document. */
export const ApprovalsScreen = () => {
  const params = useQueryParams();
  const { canApproveRequisitions, canApproveOrders } = usePurchasingAccess();

  const tabs = [
    ...(canApproveRequisitions
      ? [{ key: PurchasingQueries.approvalsRequisitions, title: 'Requisitions', content: <RequisitionApprovals /> }]
      : []),
    ...(canApproveOrders
      ? [{ key: PurchasingQueries.approvalsOrders, title: 'Orders', content: <OrderApprovals /> }]
      : []),
  ];
  const requested = params.get('tab');
  const [active, setActive] = useState(
    tabs.some(tab => tab.key === requested) ? requested : (tabs[0]?.key ?? PurchasingQueries.approvalsRequisitions)
  );

  return (
    <Page backTo={ModulePaths.purchasing} title="Approvals">
      <Tabs activeKey={active ?? undefined} onChange={setActive}>
        {tabs.map(tab => (
          <Tabs.Tab key={tab.key} title={tab.title}>
            {tab.content}
          </Tabs.Tab>
        ))}
      </Tabs>
    </Page>
  );
};
