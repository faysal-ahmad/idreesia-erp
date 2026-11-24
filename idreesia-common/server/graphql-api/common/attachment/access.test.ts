import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Permissions } from 'meteor/idreesia-common/constants';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';
import {
  IssuanceForms,
  PhysicalStoreAccess,
  PurchaseForms,
} from 'meteor/idreesia-common/server/collections/inventory';
import {
  attachmentCategoryOf,
  createStoredAttachment,
  updateAttachmentDetails,
} from 'meteor/idreesia-common/server/business-logic/common/stored-attachments';

import {
  assertCanManageAttachment,
  assertCanViewAttachment,
  canUploadAttachment,
  type AttachmentUser,
} from './access';

vi.mock('meteor/idreesia-common/server/file-storage', () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);

const user = (overrides: Partial<AttachmentUser> = {}): AttachmentUser => ({
  _id: 'u1',
  permissions: [],
  ...overrides,
});

// A user holding the permission on the store (store permissions are held per
// store, not globally).
let nextUser = 0;
const storeUser = async (
  permission: string,
  store: string,
  _id = `store-user-${(nextUser += 1)}`
) => {
  await PhysicalStoreAccess.insertAsync({
    physicalStoreId: store,
    subjectType: 'user',
    subjectId: _id,
    permissions: [permission],
  });
  return user({ _id });
};

const upload = (category: 'purchase-form' | 'issuance-form' | 'profile', createdBy = 'uploader') =>
  createStoredAttachment({
    category,
    name: 'file.pdf',
    mimeType: 'application/pdf',
    body: Buffer.from('x'),
    createdBy,
  });

// Raw writes skip the forms' schemas, which need many fields these tests do not use.
interface RawWrites {
  insertOne(doc: unknown): Promise<unknown>;
  updateOne(filter: unknown, update: unknown): Promise<unknown>;
}
const raw = (collection: { rawCollection(): unknown }) =>
  collection.rawCollection() as unknown as RawWrites;

const insertForm = (
  collection: { rawCollection(): unknown },
  attachmentId: string,
  physicalStoreId: string
) =>
  raw(collection).insertOne({
    _id: `form-${attachmentId}`,
    physicalStoreId,
    attachmentIds: [attachmentId],
  });

const code = (promise: Promise<unknown>) =>
  promise.then(
    () => 'ok',
    error => (error as { extensions?: { code?: string } }).extensions?.code
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe('attachmentCategoryOf', () => {
  it('reads the category from the folder of the file key', async () => {
    expect(attachmentCategoryOf('purchase-form-attachments/a1.pdf')).toBe('purchase-form');
    expect(attachmentCategoryOf('issuance-form-attachments/a1.jpg')).toBe('issuance-form');
    expect(attachmentCategoryOf('profile-attachments/a1.png')).toBe('profile');
  });

  it('knows no category for other folders or missing keys', () => {
    expect(attachmentCategoryOf('meeting-attachments/a1.pdf')).toBeUndefined();
    expect(attachmentCategoryOf('a1.pdf')).toBeUndefined();
    expect(attachmentCategoryOf(undefined)).toBeUndefined();
    expect(attachmentCategoryOf('')).toBeUndefined();
  });

  it('matches what createStoredAttachment filed it under', async () => {
    for (const category of ['purchase-form', 'issuance-form', 'profile'] as const) {
      const id = await upload(category);
      const attachment = await Attachments.findOneAsync(id);
      expect(attachmentCategoryOf(attachment?.fileKey)).toBe(category);
    }
  });
});

describe('createStoredAttachment', () => {
  it('records who uploaded the file', async () => {
    const id = await upload('profile', 'u9');
    expect(await Attachments.findOneAsync(id)).toMatchObject({ createdBy: 'u9' });
  });
});

describe('canUploadAttachment', () => {
  it.each([
    ['purchase-form', Permissions.IN_MANAGE_PURCHASE_FORMS],
    ['issuance-form', Permissions.IN_MANAGE_ISSUANCE_FORMS],
  ] as const)('%s needs %s on a store', async (category, permission) => {
    expect(await canUploadAttachment(await storeUser(permission, 's1'), category)).toBe(true);
    expect(await canUploadAttachment(user(), category)).toBe(false);
    // Holding it globally, not on a store, is not enough.
    expect(await canUploadAttachment(user({ permissions: [permission] }), category)).toBe(false);
  });

  it.each([
    ['profile', Permissions.HR_MANAGE_KARKUNS],
    ['profile', Permissions.HR_MANAGE_EMPLOYEES],
  ] as const)('%s needs %s', async (category, permission) => {
    expect(await canUploadAttachment(user({ permissions: [permission] }), category)).toBe(true);
    expect(await canUploadAttachment(user(), category)).toBe(false);
  });

  it('is not allowed by the view permission alone', async () => {
    expect(
      await canUploadAttachment(
        await storeUser(Permissions.IN_VIEW_PURCHASE_FORMS, 's1'),
        'purchase-form'
      )
    ).toBe(false);
  });

  it('lets a super-admin in and a locked one out', async () => {
    expect(await canUploadAttachment({ isSuperAdmin: true }, 'profile')).toBe(true);
    expect(await canUploadAttachment({ _id: 'a', isSuperAdmin: true }, 'purchase-form')).toBe(true);
    expect(await canUploadAttachment({ isSuperAdmin: true, locked: true }, 'profile')).toBe(false);
  });
});

describe('form attachments', () => {
  it('lets someone with the view permission open an attachment of a form in their store', async () => {
    const id = await upload('purchase-form');
    await insertForm(PurchaseForms, id, 's1');
    const viewer = (await storeUser(Permissions.IN_VIEW_PURCHASE_FORMS, 's1'));

    await expect(assertCanViewAttachment(viewer, id)).resolves.toMatchObject({ _id: id });
  });

  it('refuses an attachment of a form in another store', async () => {
    const id = await upload('purchase-form');
    await insertForm(PurchaseForms, id, 's2');
    const viewer = (await storeUser(Permissions.IN_VIEW_PURCHASE_FORMS, 's1'));

    expect(await code(assertCanViewAttachment(viewer, id))).toBe('FORBIDDEN');
  });

  it('refuses the wrong feature permission, even for the right store', async () => {
    const id = await upload('purchase-form');
    await insertForm(PurchaseForms, id, 's1');
    const viewer = (await storeUser(Permissions.IN_VIEW_ISSUANCE_FORMS, 's1'));

    expect(await code(assertCanViewAttachment(viewer, id))).toBe('FORBIDDEN');
  });

  it('checks issuance form attachments against issuance forms', async () => {
    const id = await upload('issuance-form');
    await insertForm(IssuanceForms, id, 's1');
    const viewer = (await storeUser(Permissions.IN_VIEW_ISSUANCE_FORMS, 's1'));
    const other = (await storeUser(Permissions.IN_VIEW_ISSUANCE_FORMS, 's9'));

    await expect(assertCanViewAttachment(viewer, id)).resolves.toMatchObject({ _id: id });
    expect(await code(assertCanViewAttachment(other, id))).toBe('FORBIDDEN');
  });

  it('needs the manage permission to rename, plus the store', async () => {
    const id = await upload('purchase-form');
    await insertForm(PurchaseForms, id, 's1');
    const viewer = (await storeUser(Permissions.IN_VIEW_PURCHASE_FORMS, 's1'));
    const manager = (await storeUser(Permissions.IN_MANAGE_PURCHASE_FORMS, 's1'));
    const elsewhere = (await storeUser(Permissions.IN_MANAGE_PURCHASE_FORMS, 's2'));

    expect(await code(assertCanManageAttachment(viewer, id))).toBe('FORBIDDEN');
    expect(await code(assertCanManageAttachment(elsewhere, id))).toBe('FORBIDDEN');
    expect(await code(assertCanManageAttachment(manager, id))).toBe('ok');
  });

  it('lets a super-admin open any form attachment', async () => {
    const id = await upload('purchase-form');
    await insertForm(PurchaseForms, id, 's5');

    expect(await code(assertCanViewAttachment({ _id: 'a', isSuperAdmin: true }, id))).toBe('ok');
    expect(
      await code(assertCanViewAttachment({ _id: 'a', isSuperAdmin: true, locked: true }, id))
    ).toBe('FORBIDDEN');
  });
});

describe('attachments not yet on a form', () => {
  it('can be used by whoever uploaded them', async () => {
    const id = await upload('purchase-form', 'u1');
    const uploader = (await storeUser(Permissions.IN_MANAGE_PURCHASE_FORMS, 's1', 'u1'));

    expect(await code(assertCanViewAttachment(uploader, id))).toBe('ok');
    expect(await code(assertCanManageAttachment(uploader, id))).toBe('ok');
  });

  it('cannot be used by anyone else with the permission', async () => {
    const id = await upload('purchase-form', 'u1');
    const other = (await storeUser(Permissions.IN_MANAGE_PURCHASE_FORMS, 's1', 'u2'));

    expect(await code(assertCanViewAttachment(other, id))).toBe('FORBIDDEN');
  });

  it('cannot be used by their uploader once they lose the permission', async () => {
    const id = await upload('purchase-form', 'u1');

    expect(await code(assertCanViewAttachment(user({ _id: 'u1' }), id))).toBe('FORBIDDEN');
  });

  it('is open to a super-admin', async () => {
    const id = await upload('purchase-form', 'u1');

    expect(await code(assertCanViewAttachment({ _id: 'a', isSuperAdmin: true }, id))).toBe('ok');
  });

  it('is not usable when an old attachment has no uploader recorded', async () => {
    const id = await upload('purchase-form', 'u1');
    await raw(Attachments).updateOne({ _id: id }, { $unset: { createdBy: '' } });
    const viewer = (await storeUser(Permissions.IN_VIEW_PURCHASE_FORMS, 's1', 'u1'));

    expect(await code(assertCanViewAttachment(viewer, id))).toBe('FORBIDDEN');
  });
});

describe('profile attachments', () => {
  it('follow the HR permissions, with no store involved', async () => {
    const id = await upload('profile');

    expect(
      await code(assertCanViewAttachment(user({ permissions: [Permissions.HR_VIEW_KARKUNS] }), id))
    ).toBe('ok');
    expect(
      await code(assertCanViewAttachment(user({ permissions: [Permissions.HR_VIEW_EMPLOYEES] }), id))
    ).toBe('ok');
    expect(await code(assertCanViewAttachment(user(), id))).toBe('FORBIDDEN');
  });

  it('can be renamed only with a manage permission', async () => {
    const id = await upload('profile');

    expect(
      await code(assertCanManageAttachment(user({ permissions: [Permissions.HR_VIEW_KARKUNS] }), id))
    ).toBe('FORBIDDEN');
    expect(
      await code(assertCanManageAttachment(user({ permissions: [Permissions.HR_MANAGE_KARKUNS] }), id))
    ).toBe('ok');
  });
});

describe('other attachments', () => {
  it('refuses an unknown attachment id', async () => {
    expect(await code(assertCanViewAttachment({ isSuperAdmin: true }, 'nope'))).toBe('NOT_FOUND');
  });

  it('refuses an attachment filed outside the category folders, even for a super-admin', async () => {
    const id = (await Attachments.insertAsync({
      mimeType: 'application/pdf',
      fileKey: 'somewhere-else/x.pdf',
    })) as string;

    expect(await code(assertCanViewAttachment({ _id: 'a', isSuperAdmin: true }, id))).toBe('FORBIDDEN');
  });

  it('refuses a caller who is not signed in', async () => {
    const id = await upload('profile');

    expect(await code(assertCanViewAttachment(undefined, id))).toBe('FORBIDDEN');
  });
});

describe('updateAttachmentDetails', () => {
  it('renames and stamps who changed it', async () => {
    const id = await upload('profile');

    const updated = await updateAttachmentDetails(id, { name: 'New name', description: 'Notes' }, 'u7');

    expect(updated).toMatchObject({ name: 'New name', description: 'Notes', updatedBy: 'u7' });
  });
});
