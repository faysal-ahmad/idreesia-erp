import { describe, expect, it } from 'vitest';

import { Permissions } from 'meteor/idreesia-common/constants';
import { makeSuperAdmin, makeUser } from 'meteor/idreesia-common/server/test-utils/fixtures';

import { assertCanAccessAttachments } from './access';

const P = Permissions;
const forbidden = { extensions: { code: 'FORBIDDEN' } };

describe('purchasing attachment access', () => {
  it('lets a user see the attachments of the documents their permission covers, and no others', () => {
    const user = makeUser({ permissions: [P.PURCHASING_VIEW_INVOICES] });
    expect(() => assertCanAccessAttachments(user, 'invoice', 'view')).not.toThrow();
    expect(() => assertCanAccessAttachments(user, 'order', 'view')).toThrow(expect.objectContaining(forbidden));
    expect(() => assertCanAccessAttachments(user, 'payment', 'view')).toThrow(expect.objectContaining(forbidden));
  });

  it('needs a manage permission to change attachments, not just a view permission', () => {
    const viewer = makeUser({ permissions: [P.PURCHASING_VIEW_ORDERS] });
    expect(() => assertCanAccessAttachments(viewer, 'quote', 'manage')).toThrow(expect.objectContaining(forbidden));
    const manager = makeUser({ permissions: [P.PURCHASING_MANAGE_ORDERS] });
    expect(() => assertCanAccessAttachments(manager, 'quote', 'manage')).not.toThrow();
    expect(() => assertCanAccessAttachments(manager, 'order', 'manage')).not.toThrow();
    expect(() => assertCanAccessAttachments(manager, 'receipt', 'manage')).toThrow(expect.objectContaining(forbidden));
  });

  it('refuses an unknown kind of document and a missing user', () => {
    expect(() => assertCanAccessAttachments(makeSuperAdmin(), 'nope', 'view')).toThrow(expect.objectContaining(forbidden));
    expect(() => assertCanAccessAttachments(null, 'order', 'view')).toThrow(expect.objectContaining(forbidden));
  });

  it('lets a super admin through for any kind of document', () => {
    expect(() => assertCanAccessAttachments(makeSuperAdmin(), 'payment', 'manage')).not.toThrow();
  });
});
