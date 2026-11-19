import { describe, expect, it } from 'vitest';

import { AttachmentCategory, Permissions } from 'meteor/idreesia-common/constants';
import {
  makeLockedUser,
  makeSuperAdmin,
  makeUser,
} from 'meteor/idreesia-common/server/test-utils/fixtures';

import { decideAttachmentUpload, downloadErrorStatus } from './attachment-upload-access';

const manager = makeUser({ permissions: [Permissions.IN_MANAGE_PURCHASE_FORMS] });
const ok = { category: AttachmentCategory.PURCHASE_FORM, hasContent: true, mimeType: 'image/png' };

describe('decideAttachmentUpload', () => {
  it('accepts a permitted upload', () => {
    expect(decideAttachmentUpload(manager, ok)).toEqual({ ok: true, category: AttachmentCategory.PURCHASE_FORM });
  });

  it('is invalid without content or with an unknown category, before any permission check', () => {
    expect(decideAttachmentUpload(undefined, { ...ok, hasContent: false })).toEqual({ ok: false, reason: 'invalid' });
    for (const category of ['nope', undefined, 5, null, '../etc']) {
      expect(decideAttachmentUpload(manager, { ...ok, category })).toEqual({ ok: false, reason: 'invalid' });
    }
  });

  it('is forbidden without the manage permission of that category', () => {
    const viewer = makeUser({ permissions: [Permissions.IN_VIEW_PURCHASE_FORMS] });
    const wrongFeature = makeUser({ permissions: [Permissions.IN_MANAGE_ISSUANCE_FORMS] });
    for (const user of [viewer, wrongFeature, makeUser(), undefined, makeLockedUser({ isSuperAdmin: true })]) {
      expect(decideAttachmentUpload(user, ok)).toEqual({ ok: false, reason: 'forbidden' });
    }
  });

  it('lets a super-admin upload to every category', () => {
    for (const category of Object.values(AttachmentCategory)) {
      expect(decideAttachmentUpload(makeSuperAdmin(), { ...ok, category })).toMatchObject({ ok: true });
    }
  });

  it('refuses types a browser would run as a page, only after the permission check', () => {
    for (const mimeType of ['text/html', 'image/svg+xml', 'application/xhtml+xml']) {
      expect(decideAttachmentUpload(manager, { ...ok, mimeType })).toEqual({ ok: false, reason: 'type-not-allowed' });
    }
    expect(decideAttachmentUpload(undefined, { ...ok, mimeType: 'text/html' })).toEqual({ ok: false, reason: 'forbidden' });
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
