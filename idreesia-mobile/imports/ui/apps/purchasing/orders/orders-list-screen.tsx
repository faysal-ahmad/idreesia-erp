import React from 'react';
import { List } from 'antd-mobile';
import { ModulePaths } from 'meteor/idreesia-common/constants';

import { PagedList } from '../../../components';
import { usePagedQuery } from '../../../hooks';
import { Page } from '../../../layout';
import { useHistory } from '../../../router';
import { useListControls } from '../components/list-controls';
import { StatusTag } from '../components/status-tag';
import { useQueryParams } from '../components/use-query-params';
import { formatDate, formatMoney, ORDER_STATUSES } from '../format';
import { MOBILE_PURCHASING_PAGED_ORDERS } from '../gql';
import { PurchasingPaths } from '../paths';

/** Purchasing → Purchase orders. Read-only; approval and receiving act from the order's screen. */
export const OrdersListScreen = () => {
  const history = useHistory();
  const params = useQueryParams();
  const controls = useListControls({
    statuses: ORDER_STATUSES,
    initialStatus: params.get('status') ?? undefined,
    placeholder: 'Order number',
  });

  const paged = usePagedQuery(MOBILE_PURCHASING_PAGED_ORDERS, {
    filter: { search: controls.search, status: controls.status },
    toVariables: (filter, paging) => ({
      ...filter,
      pageIndex: Number(paging.pageIndex),
      pageSize: Number(paging.pageSize),
    }),
    getPage: data => data.pagedPurchasingOrders,
    getKey: order => order._id,
  });

  return (
    <Page
      backTo={ModulePaths.purchasing}
      right={<div className="page-nav-actions">{controls.filterAction}</div>}
      title="Purchase orders"
    >
      {controls.toolbar}
      <PagedList
        emptyTitle="No purchase orders found"
        getKey={order => order._id ?? ''}
        itemsLabel="purchase orders"
        paged={paged}
        renderItem={order => (
          <List.Item
            arrowIcon
            description={[
              order.number,
              formatDate(order.orderDate),
              order.total ? formatMoney(order.total) : null,
            ]
              .filter(Boolean)
              .join(' · ')}
            extra={<StatusTag status={order.status} />}
            onClick={() => order._id && history.push(PurchasingPaths.order(order._id))}
          >
            {order.vendor?.name ?? order.number}
          </List.Item>
        )}
      />
    </Page>
  );
};
