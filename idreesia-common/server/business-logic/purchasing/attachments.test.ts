import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PurchasingAttachments } from 'meteor/idreesia-common/server/collections/purchasing';
import * as storage from 'meteor/idreesia-common/server/test-utils/file-storage-mock';

import {
  abortAttachmentUpload,
  completeAttachmentUpload,
  createAttachmentUpload,
  createQuote,
  createVendor,
  deleteAttachment,
  deleteQuote,
  getAttachmentDownload,
  listAttachments,
} from './index';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);

const user = { _id: 'u1' };
const other = { _id: 'u2' };

let quoteId: string;

beforeEach(async () => {
  vi.clearAllMocks();
  storage.fileInfo.size = 5;
  const vendor = await createVendor({ name: `Attach Co ${Math.random()}` }, user);
  quoteId = (
    await createQuote(
      {
        vendorId: vendor._id,
        quoteDate: new Date(),
        lines: [{ description: 'Item', unit: 'pc', quantity: 1, unitPrice: 5 }],
      },
      user
    )
  )._id;
});

const upload = (extra = {}) =>
  createAttachmentUpload(
    { ownerType: 'quote', ownerId: quoteId, fileName: 'quote.pdf', mimeType: 'application/pdf', size: 5, ...extra },
    user
  );

describe('purchasing attachments', () => {
  it('lists an attachment only after the upload is completed', async () => {
    const ticket = await upload({ name: 'Vendor quote' });
    expect(ticket.url).toBe('https://storage.test/upload');
    expect(ticket.contentType).toBe('application/pdf');
    expect(await listAttachments('quote', quoteId)).toEqual([]);

    const attachment = await completeAttachmentUpload(ticket.uploadId, user);
    expect(attachment).toMatchObject({ name: 'Vendor quote', fileName: 'quote.pdf', status: 'ready' });
    expect(attachment.fileKey).toMatch(/^purchasing-attachments\/quote\/.+\/.+\.pdf$/);
    expect((await listAttachments('quote', quoteId)).map((a) => a._id)).toEqual([ticket.uploadId]);
  });

  it('refuses a file that is too large, of a disallowed type, or for a missing document', async () => {
    await expect(upload({ size: 11 * 1024 * 1024 })).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
    await expect(upload({ mimeType: 'application/x-msdownload', fileName: 'a.exe' })).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });
    await expect(upload({ fileName: '../evil.pdf' })).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
    await expect(upload({ ownerId: 'missing' })).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });
  });

  it('does not complete a file that is missing or the wrong size, and only for its uploader', async () => {
    const ticket = await upload();
    storage.getFileInfo.mockResolvedValueOnce(null as never);
    await expect(completeAttachmentUpload(ticket.uploadId, user)).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });
    storage.fileInfo.size = 9;
    await expect(completeAttachmentUpload(ticket.uploadId, user)).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });
    storage.fileInfo.size = 5;
    await expect(completeAttachmentUpload(ticket.uploadId, other)).rejects.toMatchObject({
      extensions: { code: 'FORBIDDEN' },
    });
    // Still pending, so it can be completed once it is right.
    await expect(completeAttachmentUpload(ticket.uploadId, user)).resolves.toBeTruthy();
    await expect(completeAttachmentUpload(ticket.uploadId, user)).rejects.toMatchObject({
      extensions: { code: 'NOT_FOUND' },
    });
  });

  it('aborts a pending upload and removes its file', async () => {
    const ticket = await upload();
    await abortAttachmentUpload(ticket.uploadId, user);
    expect(await PurchasingAttachments.findOneAsync(ticket.uploadId)).toBeUndefined();
    expect(storage.deleteFiles).toHaveBeenCalledTimes(1);
  });

  it('gives a download link and deletes the attachment with its file', async () => {
    const ticket = await upload();
    await completeAttachmentUpload(ticket.uploadId, user);

    const download = await getAttachmentDownload(ticket.uploadId, { inline: true });
    expect(download).toEqual({ url: 'https://storage.test/file', fileName: 'quote.pdf', mimeType: 'application/pdf' });
    expect(storage.getFileUrl).toHaveBeenCalledWith(expect.any(String), 300, { downloadFileName: 'quote.pdf', inline: true });

    await deleteAttachment(ticket.uploadId, user);
    expect(await listAttachments('quote', quoteId)).toEqual([]);
    expect(storage.deleteFiles).toHaveBeenCalledTimes(1);
    await expect(getAttachmentDownload(ticket.uploadId)).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });
  });

  it('removes a document\'s attachments when the document is deleted', async () => {
    const ticket = await upload();
    await completeAttachmentUpload(ticket.uploadId, user);
    await deleteQuote(quoteId, user);
    expect(await PurchasingAttachments.find({ ownerId: quoteId }).countAsync()).toBe(0);
    expect(storage.deleteFiles).toHaveBeenCalledTimes(1);
  });
});
