import { Permissions } from 'meteor/idreesia-common/constants';
import {
  hasInstanceAccess,
  hasOnePermission,
} from 'meteor/idreesia-common/server/graphql-api/security';

type ReportUser = Parameters<typeof hasOnePermission>[0];

export interface ReportAccessRule {
  // Same permissions as the GraphQL list query behind the page the report is
  // downloaded from.
  permissions: string[];
  // Reports whose argument is a physical store id also need access to that
  // store, like @checkInstanceAccess on the store's GraphQL queries.
  argIsPhysicalStoreId?: boolean;
}

/** Who may download each report from /generate-report. */
export const REPORT_ACCESS = {
  IssuanceForms: {
    permissions: [
      Permissions.IN_VIEW_ISSUANCE_FORMS,
      Permissions.IN_MANAGE_ISSUANCE_FORMS,
      Permissions.IN_APPROVE_ISSUANCE_FORMS,
    ],
  },
  PurchaseForms: {
    permissions: [
      Permissions.IN_VIEW_PURCHASE_FORMS,
      Permissions.IN_MANAGE_PURCHASE_FORMS,
      Permissions.IN_APPROVE_PURCHASE_FORMS,
    ],
  },
  StockAdjustments: {
    permissions: [
      Permissions.IN_VIEW_STOCK_ADJUSTMENTS,
      Permissions.IN_MANAGE_STOCK_ADJUSTMENTS,
      Permissions.IN_APPROVE_STOCK_ADJUSTMENTS,
    ],
  },
  StockItems: {
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
} as const satisfies Record<string, ReportAccessRule>;

export type ReportName = keyof typeof REPORT_ACCESS;

/** The report's name when it is one we know; never matches inherited keys. */
export const asReportName = (name: unknown): ReportName | undefined =>
  typeof name === 'string' &&
  Object.prototype.hasOwnProperty.call(REPORT_ACCESS, name)
    ? (name as ReportName)
    : undefined;

/**
 * Whether the user may download the report: the permission, access to the
 * store when the argument is one, and access to the store of every form the
 * report covers (`formStoreIds`).
 */
export const canDownloadReport = (
  user: ReportUser,
  reportName: ReportName,
  reportArgs: string,
  formStoreIds: string[] = []
) => {
  const rule: ReportAccessRule = REPORT_ACCESS[reportName];
  return (
    hasOnePermission(user, rule.permissions) &&
    (!rule.argIsPhysicalStoreId || hasInstanceAccess(user, reportArgs)) &&
    formStoreIds.every(storeId => hasInstanceAccess(user, storeId))
  );
};
