import { EntityType } from 'meteor/idreesia-common/constants/audit';
import { searchAuditLogs } from 'meteor/idreesia-common/server/business-logic/common';

const PURCHASING_ENTITY_TYPES = [
  EntityType.PURCHASING_VENDOR,
  EntityType.PURCHASING_CATALOG_ITEM,
  EntityType.PURCHASING_REQUISITION,
  EntityType.PURCHASING_QUOTE,
  EntityType.PURCHASING_ORDER,
  EntityType.PURCHASING_RECEIPT,
  EntityType.PURCHASING_INVOICE,
  EntityType.PURCHASING_PAYMENT,
];

export default {
  Query: {
    pagedPurchasingAuditLogs: async (
      _obj: unknown,
      { filter }: { filter?: Record<string, unknown> }
    ) =>
      searchAuditLogs({
        ...filter,
        entityTypes: PURCHASING_ENTITY_TYPES,
      }),
  },
};
