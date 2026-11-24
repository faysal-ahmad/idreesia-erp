import { beforeEach, describe, expect, it } from 'vitest';

import { AttachmentCategory, Permissions } from 'meteor/idreesia-common/constants';
import { PhysicalStoreAccess } from 'meteor/idreesia-common/server/collections/inventory';
import {
  makeLockedUser,
  makeSuperAdmin,
  makeUser,
} from 'meteor/idreesia-common/server/test-utils/fixtures';

import { decideAttachmentUpload, downloadErrorStatus } from './attachment-upload-access';

// Purchase and issuance form permissions are held on a store.
const manager = makeUser({ _id: 'manager' });
const holdOnStore = (userId: string, permission: string) =>
  PhysicalStoreAccess.insertAsync({
    physicalStoreId: 's1',
    subjectType: 'user',
    subjectId: userId,
    permissions: [permission],
  });
beforeEach(async () => {
  await holdOnStore('manager', Permissions.IN_MANAGE_PURCHASE_FORMS);
});
const ok = { category: AttachmentCategory.PURCHASE_FORM, hasContent: true, mimeType: 'image/png' };

describe('decideAttachmentUpload', () => {
  it('accepts a permitted upload', async () => {
    expect(await decideAttachmentUpload(manager, ok)).toEqual({ ok: true, category: AttachmentCategory.PURCHASE_FORM });
  });

  it('is invalid without content or with an unknown category, before any permission check', async () => {
    expect(await decideAttachmentUpload(undefined, { ...ok, hasContent: false })).toEqual({ ok: false, reason: 'invalid' });
    for (const category of ['nope', undefined, 5, null, '../etc']) {
      expect(await decideAttachmentUpload(manager, { ...ok, category })).toEqual({ ok: false, reason: 'invalid' });
    }
  });

  it('is forbidden without the manage permission of that category', async () => {
    const viewer = makeUser({ _id: 'viewer' });
    const wrongFeature = makeUser({ _id: 'wrong' });
    await holdOnStore('viewer', Permissions.IN_VIEW_PURCHASE_FORMS);
    await holdOnStore('wrong', Permissions.IN_MANAGE_ISSUANCE_FORMS);
    // Held globally rather than on a store: not enough.
    const global = makeUser({ _id: 'global', permissions: [Permissions.IN_MANAGE_PURCHASE_FORMS] });
    for (const user of [viewer, wrongFeature, global, makeUser(), undefined, makeLockedUser({ isSuperAdmin: true })]) {
      expect(await decideAttachmentUpload(user, ok)).toEqual({ ok: false, reason: 'forbidden' });
    }
  });

  it('lets a super-admin upload to every category', async () => {
    for (const category of Object.values(AttachmentCategory)) {
      expect(await decideAttachmentUpload(makeSuperAdmin(), { ...ok, category })).toMatchObject({ ok: true });
    }
  });

  it('refuses types a browser would run as a page, only after the permission check', async () => {
    for (const mimeType of ['text/html', 'image/svg+xml', 'application/xhtml+xml']) {
      expect(await decideAttachmentUpload(manager, { ...ok, mimeType })).toEqual({ ok: false, reason: 'type-not-allowed' });
    }
    expect(await decideAttachmentUpload(undefined, { ...ok, mimeType: 'text/html' })).toEqual({ ok: false, reason: 'forbidden' });
  });
});

describe('downloadErrorStatus', () => {
  it('maps FORBIDDEN and NOT_FOUND, and leaves anything else to be thrown', () => {
    expect(downloadErrorStatus({ extensions: { code: 'FORBIDDEN' } })).toBe(403);
    expect(downloadErrorStatus({ extensions: { code: 'NOT_FOUND' } })).toBe(404);
    expect(downloadErrorStatus(new Error('x'))).toBeNull();
    expect(downloadErrorStatus(undefined)).toBeNull();
  });
});
