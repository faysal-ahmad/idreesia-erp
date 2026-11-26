import { EntityType } from 'meteor/idreesia-common/constants/audit';
import { searchAuditLogs } from 'meteor/idreesia-common/server/business-logic/common';

const PURCHASING_ENTITY_TYPES: string[] = [
  EntityType.PURCHASING_VENDOR,
  EntityType.PURCHASING_CATALOG_ITEM,
  EntityType.PURCHASING_REQUISITION,
  EntityType.PURCHASING_QUOTE,
  EntityType.PURCHASING_ORDER,
  EntityType.PURCHASING_RECEIPT,
  EntityType.PURCHASING_INVOICE,
  EntityType.PURCHASING_PAYMENT,
  EntityType.PURCHASING_PETTY_CASH_FUND,
  EntityType.PURCHASING_PETTY_CASH_EXPENSE_HEAD,
  EntityType.PURCHASING_PETTY_CASH_VOUCHER,
  EntityType.PURCHASING_PETTY_CASH_REPLENISHMENT,
];

interface PurchasingAuditLogFilter {
  entityId?: string | null;
  entityTypes?: (string | null)[] | null;
  fromDate?: string | null;
  toDate?: string | null;
  pageIndex?: string | null;
  pageSize?: string | null;
}

const toDate = (value?: string | null) => {
  if (!value) return undefined;
  const date = new Date(Number(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export default {
  Query: {
    pagedPurchasingAuditLogs: async (
      _obj: unknown,
      { filter }: { filter?: PurchasingAuditLogFilter | null }
    ) => {
      // Never wider than the purchasing document types, whatever the caller asks for.
      const requested = (filter?.entityTypes ?? []).filter(
        (type): type is string => !!type && PURCHASING_ENTITY_TYPES.includes(type)
      );
      return searchAuditLogs({
        entityId: filter?.entityId ?? undefined,
        entityTypes: requested.length ? requested : PURCHASING_ENTITY_TYPES,
        fromTime: toDate(filter?.fromDate),
        toTime: toDate(filter?.toDate),
        pageIndex: filter?.pageIndex ?? undefined,
        pageSize: filter?.pageSize ?? undefined,
      });
    },
  },
};
