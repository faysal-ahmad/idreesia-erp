import { GraphQLError } from 'graphql';

import { Permissions } from 'meteor/idreesia-common/constants';
import {
  AttachmentOwnerType,
  type AttachmentOwnerTypeValue,
} from 'meteor/idreesia-common/constants/purchasing';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';

const P = Permissions;

/*
 * The permissions behind each kind of document an attachment can belong to.
 * The attachment operations' directive allows the union of these; this table
 * narrows it to the document the attachment is on.
 */
export const ATTACHMENT_PERMISSIONS: Record<
  AttachmentOwnerTypeValue,
  { view: string[]; manage: string[] }
> = {
  [AttachmentOwnerType.REQUISITION]: {
    view: [P.PURCHASING_VIEW_REQUISITIONS, P.PURCHASING_MANAGE_REQUISITIONS, P.PURCHASING_APPROVE_REQUISITIONS],
    manage: [P.PURCHASING_MANAGE_REQUISITIONS],
  },
  [AttachmentOwnerType.QUOTE]: {
    view: [P.PURCHASING_VIEW_ORDERS, P.PURCHASING_MANAGE_ORDERS, P.PURCHASING_APPROVE_ORDERS],
    manage: [P.PURCHASING_MANAGE_ORDERS],
  },
  [AttachmentOwnerType.ORDER]: {
    view: [P.PURCHASING_VIEW_ORDERS, P.PURCHASING_MANAGE_ORDERS, P.PURCHASING_APPROVE_ORDERS],
    manage: [P.PURCHASING_MANAGE_ORDERS],
  },
  [AttachmentOwnerType.RECEIPT]: {
    view: [P.PURCHASING_VIEW_RECEIPTS, P.PURCHASING_MANAGE_RECEIPTS],
    manage: [P.PURCHASING_MANAGE_RECEIPTS],
  },
  [AttachmentOwnerType.INVOICE]: {
    view: [P.PURCHASING_VIEW_INVOICES, P.PURCHASING_MANAGE_INVOICES],
    manage: [P.PURCHASING_MANAGE_INVOICES],
  },
  [AttachmentOwnerType.PAYMENT]: {
    view: [P.PURCHASING_VIEW_PAYMENTS, P.PURCHASING_MANAGE_PAYMENTS],
    manage: [P.PURCHASING_MANAGE_PAYMENTS],
  },
  [AttachmentOwnerType.PETTY_CASH_VOUCHER]: {
    view: [P.PURCHASING_VIEW_PETTY_CASH, P.PURCHASING_MANAGE_PETTY_CASH_VOUCHERS, P.PURCHASING_APPROVE_PETTY_CASH_VOUCHERS],
    manage: [P.PURCHASING_MANAGE_PETTY_CASH_VOUCHERS],
  },
};

interface AccessUser {
  username?: string;
  locked?: boolean;
  isSuperAdmin?: boolean;
  permissions?: string[];
}

/** Throws unless the user may view or manage attachments of that kind of document. */
export function assertCanAccessAttachments(
  user: AccessUser | null | undefined,
  ownerType: string,
  level: 'view' | 'manage'
) {
  const rule = ATTACHMENT_PERMISSIONS[ownerType as AttachmentOwnerTypeValue];
  if (!rule || !hasOnePermission(user, rule[level])) {
    throw new GraphQLError('You are not allowed to do this.', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
}
