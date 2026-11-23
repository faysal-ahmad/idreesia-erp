import { useCallback, useEffect, useState } from 'react';
import type { ApolloClient } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import { Permissions } from 'meteor/idreesia-common/constants';

import { useCurrentUser } from '../../hooks';
import { getUsableFeatures } from '../access';
import { RECEIVABLE_ORDER_STATUSES } from './format';
import {
  MOBILE_PURCHASING_PAGED_INVOICES,
  MOBILE_PURCHASING_PAGED_ORDERS,
  MOBILE_PURCHASING_PAGED_REQUISITIONS,
} from './gql';
import { PurchasingModule } from './index';
import { PurchasingPaths, PurchasingQueries } from './paths';

/** One line of the Home tab's Purchasing section: something that needs the user's attention. */
export interface PurchasingHomeItem {
  key: string;
  /** What it is, e.g. "Requisitions awaiting approval". */
  label: string;
  count: number;
  /** The Purchasing screen that deals with it. */
  path: string;
}

type FetchPolicy = 'network-only' | 'cache-only';

const P = Permissions;
const PAGE = { pageIndex: 0, pageSize: 1 };

/** How many items a paged Purchasing list holds; only the count is read, so one row is fetched. */
const countOf = async (request: Promise<number | null | undefined>) => {
  try {
    return (await request) ?? 0;
  } catch {
    // One failing count mustn't hide the others.
    return 0;
  }
};

const fetchItems = async (
  client: ApolloClient,
  granted: string[],
  karkunId: string | null | undefined,
  fetchPolicy: FetchPolicy
): Promise<PurchasingHomeItem[]> => {
  const has = (...permissions: string[]) => permissions.some(permission => granted.includes(permission));

  const requisitions = (variables: { status: string; requestedBy?: string }) =>
    client
      .query({ query: MOBILE_PURCHASING_PAGED_REQUISITIONS, variables: { ...variables, ...PAGE }, fetchPolicy })
      .then(result => result.data?.pagedPurchasingRequisitions?.totalResults);
  const orders = (variables: { status?: string; statuses?: string[] }) =>
    client
      .query({ query: MOBILE_PURCHASING_PAGED_ORDERS, variables: { ...variables, ...PAGE }, fetchPolicy })
      .then(result => result.data?.pagedPurchasingOrders?.totalResults);
  const overdueInvoices = () =>
    client
      .query({
        query: MOBILE_PURCHASING_PAGED_INVOICES,
        variables: { overdue: true, ...PAGE },
        fetchPolicy,
      })
      .then(result => result.data?.pagedPurchasingInvoices?.totalResults);

  const [requisitionApprovals, orderApprovals, awaitingDelivery, drafts, overdue] = await Promise.all([
    has(P.PURCHASING_APPROVE_REQUISITIONS) ? countOf(requisitions({ status: 'submitted' })) : 0,
    has(P.PURCHASING_APPROVE_ORDERS) ? countOf(orders({ status: 'pending-approval' })) : 0,
    has(P.PURCHASING_MANAGE_RECEIPTS) ? countOf(orders({ statuses: RECEIVABLE_ORDER_STATUSES })) : 0,
    has(P.PURCHASING_MANAGE_REQUISITIONS) && karkunId
      ? countOf(requisitions({ status: 'draft', requestedBy: karkunId }))
      : 0,
    has(P.PURCHASING_VIEW_INVOICES, P.PURCHASING_MANAGE_INVOICES) ? countOf(overdueInvoices()) : 0,
  ]);

  const items: PurchasingHomeItem[] = [
    {
      key: 'requisition-approvals',
      label: 'Requisitions awaiting your approval',
      count: requisitionApprovals,
      path: PurchasingPaths.approvalsTab(PurchasingQueries.approvalsRequisitions),
    },
    {
      key: 'order-approvals',
      label: 'Purchase orders awaiting your approval',
      count: orderApprovals,
      path: PurchasingPaths.approvalsTab(PurchasingQueries.approvalsOrders),
    },
    {
      key: 'awaiting-delivery',
      label: 'Orders awaiting delivery',
      count: awaitingDelivery,
      path: PurchasingPaths.receiving,
    },
    {
      key: 'draft-requisitions',
      label: 'My draft requisitions',
      count: drafts,
      path: `${PurchasingPaths.requisitionsWithStatus('draft')}&mine=1`,
    },
    {
      key: 'overdue-invoices',
      label: 'Overdue invoices',
      count: overdue,
      path: PurchasingPaths.invoicesOverdue,
    },
  ];
  return items.filter(item => item.count > 0);
};

/**
 * The Home tab's Purchasing section: what needs this user's attention, with
 * the Purchasing screen to deal with each. Only what the user's permissions
 * allow is counted, and only for users who can use a Purchasing feature.
 */
export const usePurchasingHome = () => {
  const client = useApolloClient();
  const { user } = useCurrentUser();
  const [state, setState] = useState<{ loading: boolean; items: PurchasingHomeItem[] }>({
    loading: true,
    items: [],
  });

  const enabled = Boolean(user) && getUsableFeatures(user, PurchasingModule).length > 0;
  const permissions = (user?.permissions ?? []).filter((permission): permission is string => permission != null);
  const permissionKey = permissions.join(',');
  const karkunId = user?.karkun?._id;

  const load = useCallback(async () => {
    if (!enabled) {
      setState({ loading: false, items: [] });
      return;
    }
    const granted = permissionKey ? permissionKey.split(',') : [];
    try {
      const items = await fetchItems(client, granted, karkunId, 'network-only');
      setState({ loading: false, items });
    } catch {
      // Offline: what was loaded before, or nothing.
      const items = await fetchItems(client, granted, karkunId, 'cache-only').catch(() => []);
      setState({ loading: false, items });
    }
  }, [client, enabled, permissionKey, karkunId]);

  useEffect(() => {
    load();
  }, [load]);

  return { enabled, items: state.items, loading: state.loading, refresh: load };
};
