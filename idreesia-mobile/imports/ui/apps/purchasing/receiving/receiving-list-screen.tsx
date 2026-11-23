import React from 'react';
import { List, Tag } from 'antd-mobile';
import { ModulePaths } from 'meteor/idreesia-common/constants';

import { PagedList } from '../../../components';
import { usePagedQuery } from '../../../hooks';
import { Page } from '../../../layout';
import { useHistory } from '../../../router';
import { useListControls } from '../components/list-controls';
import { StatusTag } from '../components/status-tag';
import { formatDate, RECEIVABLE_ORDER_STATUSES, toDate } from '../format';
import { MOBILE_PURCHASING_PAGED_ORDERS } from '../gql';
import { PurchasingPaths } from '../paths';

const isLate = (expected?: string | null) => {
  const date = toDate(expected);
  return Boolean(date && date.getTime() < new Date().setHours(0, 0, 0, 0));
};

/** Purchasing → Receiving: the orders goods can be received against. */
export const ReceivingListScreen = () => {
  const history = useHistory();
  const controls = useListControls({ placeholder: 'Order number' });

  const paged = usePagedQuery(MOBILE_PURCHASING_PAGED_ORDERS, {
    filter: { search: controls.search, statuses: RECEIVABLE_ORDER_STATUSES },
    toVariables: (filter, paging) => ({
      ...filter,
      pageIndex: Number(paging.pageIndex),
      pageSize: Number(paging.pageSize),
    }),
    getPage: data => data.pagedPurchasingOrders,
    getKey: order => order._id,
  });

  return (
    <Page backTo={ModulePaths.purchasing} title="Receiving">
      {controls.toolbar}
      <PagedList
        emptyDescription="Approved orders waiting for delivery appear here."
        emptyTitle="Nothing to receive"
        getKey={order => order._id ?? ''}
        itemsLabel="orders awaiting delivery"
        paged={paged}
        renderItem={order => (
          <List.Item
            arrowIcon
            description={[
              order.number,
              order.expectedDeliveryDate ? `Expected ${formatDate(order.expectedDeliveryDate)}` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
            extra={
              <div className="purchasing-row-tags">
                {isLate(order.expectedDeliveryDate) && (
                  <Tag color="danger" fill="outline">
                    Late
                  </Tag>
                )}
                <StatusTag status={order.status} />
              </div>
            }
            onClick={() => order._id && history.push(PurchasingPaths.receive(order._id))}
          >
            {order.vendor?.name ?? order.number}
          </List.Item>
        )}
      />
    </Page>
  );
};
