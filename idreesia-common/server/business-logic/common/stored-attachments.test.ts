import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AttachmentCategory } from 'meteor/idreesia-common/constants';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';
import {
  deleteFiles,
  getFileUrl,
  putFile,
  StorageFolders,
} from 'meteor/idreesia-common/server/file-storage';

import {
  attachmentCategoryOf,
  createStoredAttachment,
  getAttachmentDownloadUrl,
  getAttachmentFileKey,
  isAttachmentCategory,
  removeAttachment,
  removeAttachments,
  updateAttachmentDetails,
} from './stored-attachments';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);

const putFileMock = putFile as unknown as ReturnType<typeof vi.fn>;
const deleteFilesMock = deleteFiles as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  putFileMock.mockClear();
  deleteFilesMock.mockReset().mockResolvedValue(undefined);
});

describe('isAttachmentCategory', () => {
  it('accepts only known categories', () => {
    expect(isAttachmentCategory(AttachmentCategory.PROFILE)).toBe(true);
    expect(isAttachmentCategory('nope')).toBe(false);
    expect(isAttachmentCategory(undefined)).toBe(false);
    expect(isAttachmentCategory(5)).toBe(false);
  });
});

describe('attachmentCategoryOf', () => {
  it('reads the category from the folder of the file key', () => {
    expect(
      attachmentCategoryOf(`${StorageFolders.PurchaseFormAttachments}/a.pdf`)
    ).toBe(AttachmentCategory.PURCHASE_FORM);
    expect(
      attachmentCategoryOf(`${StorageFolders.ProfileAttachments}/a.pdf`)
    ).toBe(AttachmentCategory.PROFILE);
  });

  it('is undefined for other folders and empty keys', () => {
    expect(attachmentCategoryOf('somewhere-else/a.pdf')).toBeUndefined();
    expect(attachmentCategoryOf(null)).toBeUndefined();
    expect(attachmentCategoryOf(undefined)).toBeUndefined();
    expect(attachmentCategoryOf('')).toBeUndefined();
  });
});

describe('getAttachmentFileKey', () => {
  it('uses the extension of the file name, else of the MIME type', () => {
    expect(getAttachmentFileKey('f', 'id1', 'Scan.PDF', 'x/y')).toBe('f/id1.pdf');
    expect(getAttachmentFileKey('f', 'id1', undefined, 'image/png')).toBe(
      'f/id1.png'
    );
    expect(getAttachmentFileKey('f', 'id1', 'noext', 'weird/type')).toBe(
      'f/id1.bin'
    );
  });
});

describe('createStoredAttachment', () => {
  it('stores the file in its category folder and records the attachment', async () => {
    const body = Buffer.from('pdf');
    const id = await createStoredAttachment({
      category: AttachmentCategory.ISSUANCE_FORM,
      name: 'form.pdf',
      mimeType: 'application/pdf',
      body,
      createdBy: 'u1',
    });

    const attachment = await Attachments.findOneAsync(id);
    expect(attachment).toMatchObject({
      name: 'form.pdf',
      mimeType: 'application/pdf',
      fileKey: `${StorageFolders.IssuanceFormAttachments}/${id}.pdf`,
      createdBy: 'u1',
      updatedBy: 'u1',
    });
    expect(putFileMock).toHaveBeenCalledWith(
      attachment?.fileKey,
      body,
      'application/pdf'
    );
  });

  it('records nothing when the upload fails', async () => {
    putFileMock.mockRejectedValueOnce(new Error('storage down'));
    await expect(
      createStoredAttachment({
        category: AttachmentCategory.PROFILE,
        mimeType: 'image/png',
        body: Buffer.from('x'),
      })
    ).rejects.toThrow('storage down');
    expect(await Attachments.find().countAsync()).toBe(0);
  });
});

describe('updateAttachmentDetails', () => {
  it('renames an attachment and stamps the updater', async () => {
    const id = await createStoredAttachment({
      category: AttachmentCategory.PROFILE,
      name: 'a.pdf',
      mimeType: 'application/pdf',
      body: Buffer.from('x'),
      createdBy: 'u1',
    });
    const updated = await updateAttachmentDetails(
      id,
      { name: 'b.pdf', description: 'desc' },
      'u2'
    );
    expect(updated).toMatchObject({
      name: 'b.pdf',
      description: 'desc',
      createdBy: 'u1',
      updatedBy: 'u2',
    });
  });
});

describe('getAttachmentDownloadUrl', () => {
  it('asks storage for a presigned URL', async () => {
    expect(await getAttachmentDownloadUrl('k')).toBe('https://storage.test/file');
    expect(getFileUrl).toHaveBeenCalledWith('k');
  });
});

describe('removeAttachments', () => {
  const create = () =>
    createStoredAttachment({
      category: AttachmentCategory.PROFILE,
      name: 'a.pdf',
      mimeType: 'application/pdf',
      body: Buffer.from('x'),
    });

  it('does nothing for no ids', async () => {
    await removeAttachments(null);
    await removeAttachments([]);
    await removeAttachments(['', undefined as unknown as string]);
    expect(deleteFilesMock).not.toHaveBeenCalled();
  });

  it('deletes the records and their files', async () => {
    const a = await create();
    const b = await create();
    const keys = (
      await Attachments.find({ _id: { $in: [a, b] } }).fetchAsync()
    ).map(attachment => attachment.fileKey);

    await removeAttachments([a, b]);

    expect(await Attachments.find().countAsync()).toBe(0);
    expect(deleteFilesMock).toHaveBeenCalledTimes(1);
    expect(deleteFilesMock.mock.calls[0][0].sort()).toEqual(keys.sort());
  });

  it('removes a single attachment', async () => {
    const id = await create();
    await removeAttachment(id);
    expect(await Attachments.findOneAsync(id)).toBeUndefined();
    expect(deleteFilesMock).toHaveBeenCalledTimes(1);
  });

  it('does not fail the removal when the file cannot be deleted', async () => {
    const id = await create();
    deleteFilesMock.mockRejectedValueOnce(new Error('storage down'));
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(removeAttachments([id])).resolves.toBeUndefined();
    expect(await Attachments.findOneAsync(id)).toBeUndefined();
    spy.mockRestore();
  });

  it('deletes the files only after the surrounding transaction commits', async () => {
    const id = await create();
    await runInTransaction(async () => {
      await removeAttachments([id]);
      expect(deleteFilesMock).not.toHaveBeenCalled();
    });
    expect(deleteFilesMock).toHaveBeenCalledTimes(1);
  });

  it('keeps the files when the surrounding transaction rolls back', async () => {
    const id = await create();
    await expect(
      runInTransaction(async () => {
        await removeAttachments([id]);
        throw new Error('boom');
      })
    ).rejects.toThrow('boom');
    expect(await Attachments.findOneAsync(id)).toBeDefined();
    expect(deleteFilesMock).not.toHaveBeenCalled();
  });
});
