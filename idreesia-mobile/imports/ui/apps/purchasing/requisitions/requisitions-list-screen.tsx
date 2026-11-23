import React, { useState } from 'react';
import { List } from 'antd-mobile';
import { AddOutline } from 'antd-mobile-icons';
import { ModulePaths } from 'meteor/idreesia-common/constants';

import { PagedList } from '../../../components';
import { usePagedQuery } from '../../../hooks';
import { Page } from '../../../layout';
import { useHistory } from '../../../router';
import { useListControls } from '../components/list-controls';
import { StatusTag } from '../components/status-tag';
import { useQueryParams } from '../components/use-query-params';
import { formatDate, formatMoney, REQUISITION_STATUSES } from '../format';
import { MOBILE_PURCHASING_PAGED_REQUISITIONS } from '../gql';
import { PurchasingPaths } from '../paths';
import { usePurchasingAccess } from '../use-purchasing-access';

/** Purchasing → Requisitions. `?status=draft&mine=1` opens it already filtered (Home tab links). */
export const RequisitionsListScreen = () => {
  const history = useHistory();
  const params = useQueryParams();
  const { user, canManageRequisitions } = usePurchasingAccess();
  const [mine, setMine] = useState(params.get('mine') === '1');

  const controls = useListControls({
    statuses: REQUISITION_STATUSES,
    initialStatus: params.get('status') ?? undefined,
    placeholder: 'Number or title',
    extraChips: mine ? [{ label: 'My requisitions', onClear: () => setMine(false) }] : [],
  });

  const paged = usePagedQuery(MOBILE_PURCHASING_PAGED_REQUISITIONS, {
    // Without a karkun profile "mine" matches nothing rather than everything.
    filter: {
      search: controls.search,
      status: controls.status,
      requestedBy: mine ? (user?.karkun?._id ?? 'none') : undefined,
    },
    toVariables: (filter, paging) => ({
      ...filter,
      pageIndex: Number(paging.pageIndex),
      pageSize: Number(paging.pageSize),
    }),
    getPage: data => data.pagedPurchasingRequisitions,
    getKey: requisition => requisition._id,
  });

  return (
    <Page
      backTo={ModulePaths.purchasing}
      right={
        <div className="page-nav-actions">
          {canManageRequisitions && (
            <AddOutline
              aria-label="New requisition"
              className="page-nav-action"
              onClick={() => history.push(PurchasingPaths.requisitionNew)}
            />
          )}
          {controls.filterAction}
        </div>
      }
      title="Requisitions"
    >
      {controls.toolbar}
      <PagedList
        emptyTitle="No requisitions found"
        getKey={requisition => requisition._id ?? ''}
        itemsLabel="requisitions"
        paged={paged}
        renderItem={requisition => (
          <List.Item
            arrowIcon
            description={[
              requisition.number,
              requisition.requestedByPerson?.sharedData?.name,
              requisition.neededBy ? `Needed by ${formatDate(requisition.neededBy)}` : null,
              requisition.estimatedTotal ? formatMoney(requisition.estimatedTotal) : null,
            ]
              .filter(Boolean)
              .join(' · ')}
            extra={<StatusTag status={requisition.status} />}
            onClick={() => requisition._id && history.push(PurchasingPaths.requisition(requisition._id))}
          >
            {requisition.title ?? requisition.number}
          </List.Item>
        )}
      />
    </Page>
  );
};
