import { Permissions } from 'meteor/idreesia-common/constants';
import {
  hasAnyStorePermission,
  hasStorePermission,
  type StoreAccessUser,
} from 'meteor/idreesia-common/server/business-logic/inventory/store-access';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';

type ReportUser = Parameters<typeof hasOnePermission>[0] & StoreAccessUser;

export interface ReportAccessRule {
  // Same permissions as the GraphQL list query behind the page the report is
  // downloaded from.
  permissions: string[];
  // The permissions are store permissions: held on a physical store rather
  // than globally, like @checkStoreAccess on the store's GraphQL queries.
  storePermissions?: boolean;
  // Reports whose argument is a physical store id need the permissions on
  // that store.
  argIsPhysicalStoreId?: boolean;
}

/** Who may download each report from /generate-report. */
export const REPORT_ACCESS = {
  IssuanceForms: {
    storePermissions: true,
    permissions: [
      Permissions.IN_VIEW_ISSUANCE_FORMS,
      Permissions.IN_MANAGE_ISSUANCE_FORMS,
      Permissions.IN_APPROVE_ISSUANCE_FORMS,
    ],
  },
  PurchaseForms: {
    storePermissions: true,
    permissions: [
      Permissions.IN_VIEW_PURCHASE_FORMS,
      Permissions.IN_MANAGE_PURCHASE_FORMS,
      Permissions.IN_APPROVE_PURCHASE_FORMS,
    ],
  },
  StockAdjustments: {
    storePermissions: true,
    permissions: [
      Permissions.IN_VIEW_STOCK_ADJUSTMENTS,
      Permissions.IN_MANAGE_STOCK_ADJUSTMENTS,
      Permissions.IN_APPROVE_STOCK_ADJUSTMENTS,
    ],
  },
  StockItems: {
    storePermissions: true,
    permissions: [Permissions.IN_MANAGE_STOCK_ITEMS],
    argIsPhysicalStoreId: true,
  },
  Karkuns: {
    permissions: [
      Permissions.HR_VIEW_KARKUNS,
      Permissions.HR_MANAGE_KARKUNS,
      Permissions.HR_VIEW_EMPLOYEES,
      Permissions.HR_MANAGE_EMPLOYEES,
    ],
  },
  Visitors: {
    permissions: [
      Permissions.SECURITY_VIEW_VISITORS,
      Permissions.SECURITY_MANAGE_VISITORS,
    ],
  },
  PurchasingSpendingByVendor: {
    permissions: [Permissions.PURCHASING_VIEW_REPORTS],
  },
  PurchasingSpendingByMonth: {
    permissions: [Permissions.PURCHASING_VIEW_REPORTS],
  },
  PurchasingOpenOrders: {
    permissions: [Permissions.PURCHASING_VIEW_REPORTS],
  },
  PurchasingPayablesAging: {
    permissions: [Permissions.PURCHASING_VIEW_REPORTS],
  },
  PurchasingVendorLedger: {
    permissions: [Permissions.PURCHASING_VIEW_REPORTS],
  },
} as const satisfies Record<string, ReportAccessRule>;

export type ReportName = keyof typeof REPORT_ACCESS;

/** The report's name when it is one we know; never matches inherited keys. */
export const asReportName = (name: unknown): ReportName | undefined =>
  typeof name === 'string' &&
  Object.prototype.hasOwnProperty.call(REPORT_ACCESS, name)
    ? (name as ReportName)
    : undefined;

/**
 * Whether the user may download the report: the permission (on the report's
 * store when the argument is one, else on every store of the forms the report
 * covers, `formStoreIds`; on any store when there is no store to name).
 */
export const canDownloadReport = async (
  user: ReportUser,
  reportName: ReportName,
  reportArgs: string,
  formStoreIds: string[] = []
): Promise<boolean> => {
  const rule: ReportAccessRule = REPORT_ACCESS[reportName];
  if (!rule.storePermissions) return hasOnePermission(user, rule.permissions);

  const storeIds = [
    ...(rule.argIsPhysicalStoreId ? [reportArgs] : []),
    ...formStoreIds,
  ];
  if (storeIds.length === 0) return hasAnyStorePermission(user, rule.permissions);
  const results = await Promise.all(
    storeIds.map(storeId => hasStorePermission(user, storeId, rule.permissions))
  );
  return results.every(Boolean);
};
