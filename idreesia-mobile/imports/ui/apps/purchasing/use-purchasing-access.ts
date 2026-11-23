import { Permissions } from 'meteor/idreesia-common/constants';

import { useCurrentUser } from '../../hooks';

/** What the signed-in user may do in Purchasing. For the UI only; the server enforces every one. */
export const usePurchasingAccess = () => {
  const { user, userLoading } = useCurrentUser();
  const granted = user?.permissions ?? [];
  const has = (...permissions: string[]) => permissions.some(permission => granted.includes(permission));

  return {
    loading: userLoading && !user,
    user,
    has,
    canManageRequisitions: has(Permissions.PURCHASING_MANAGE_REQUISITIONS),
    canApproveRequisitions: has(Permissions.PURCHASING_APPROVE_REQUISITIONS),
    canManageOrders: has(Permissions.PURCHASING_MANAGE_ORDERS),
    canApproveOrders: has(Permissions.PURCHASING_APPROVE_ORDERS),
    canManageReceipts: has(Permissions.PURCHASING_MANAGE_RECEIPTS),
    canManageInvoices: has(Permissions.PURCHASING_MANAGE_INVOICES),
    canManagePayments: has(Permissions.PURCHASING_MANAGE_PAYMENTS),
    canManageCatalog: has(Permissions.PURCHASING_MANAGE_CATALOG),
  };
};
