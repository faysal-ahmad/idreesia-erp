import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DmsActivities,
  DmsDocuments,
  DmsDocumentVersions,
  DmsFolders,
} from 'meteor/idreesia-common/server/collections/dms';
import * as storage from 'meteor/idreesia-common/server/test-utils/file-storage-mock';

import { uploadDocument } from './documents';
import {
  createFolder,
  getFolder,
  getFolderPath,
  listFolderContents,
  listFolders,
  moveFolder,
  renameFolder,
} from './folders';
import { checkOutDocument } from './locking';
import {
  emptyTrash,
  listTrash,
  purgeFromTrash,
  restoreFromTrash,
  trashDocument,
  trashFolder,
} from './trash';
import { uploadNewVersion } from './versions';
import { createTestWorkspace } from './test-helpers';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);

let workspaceId: string;

// The unique-name indexes are created by migration 8, not by the collections.
const createNameIndexes = async () => {
  await DmsFolders.rawCollection().createIndex(
    { workspaceId: 1, parentId: 1, nameLower: 1 },
    { unique: true, partialFilterExpression: { trashed: false } }
  );
  await DmsDocuments.rawCollection().createIndex(
    { workspaceId: 1, folderId: 1, nameLower: 1 },
    { unique: true, partialFilterExpression: { trashed: false } }
  );
};

beforeEach(async () => {
  vi.clearAllMocks();
  await createNameIndexes();
  workspaceId = await createTestWorkspace();
});

afterEach(() => {
  vi.restoreAllMocks();
});

const rejectsWith = async (promise: Promise<unknown>, code: string) => {
  await expect(promise).rejects.toMatchObject({ extensions: { code } });
};

const folder = (name: string, parentId?: string | null) =>
  createFolder({ workspaceId, name, parentId }, 'u1');

const doc = (name: string, folderId?: string | null) =>
  uploadDocument(
    {
      workspaceId,
      folderId,
      name,
      fileName: `${name}.txt`,
      body: Buffer.from('hello'),
      mimeType: 'text/plain',
    },
    'u1'
  ).then(r => r.document);

const actions = async () =>
  (await DmsActivities.find({}, { sort: { at: 1 } }).fetchAsync()).map((a: any) => a.action);

describe('folders', () => {
  it('builds ancestor paths and logs creation', async () => {
    const a = await folder('A');
    const b = await folder('B', a._id);
    const c = await folder('C', b._id);
    expect(c.ancestorIds).toEqual([a._id, b._id]);
    expect((await getFolderPath(c._id, 'u1')).map(f => f.name)).toEqual(['A', 'B', 'C']);
    expect(await actions()).toContain('folder-created');
  });

  it('keeps names unique within a parent, case-insensitively, but not across parents', async () => {
    const a = await folder('A');
    await folder('Reports', a._id);
    await rejectsWith(folder('reports', a._id), 'CONFLICT');
    await expect(folder('Reports')).resolves.toBeDefined();
  });

  it('rejects empty names, a missing parent and a parent in another workspace', async () => {
    await rejectsWith(folder('  '), 'BAD_USER_INPUT');
    await rejectsWith(folder('X', 'nope'), 'NOT_FOUND');
    const otherWorkspace = await createTestWorkspace();
    const other = await createFolder({ workspaceId: otherWorkspace, name: 'O' }, 'u1');
    await expect(folder('X', other._id)).rejects.toMatchObject({});
    await rejectsWith(createFolder({ workspaceId: 'nope', name: 'X' }, 'u1'), 'NOT_FOUND');
  });

  it('renames, is a no-op for the same name, and refuses sibling collisions', async () => {
    const a = await folder('A');
    await folder('B');
    expect((await renameFolder(a._id, 'A', 'u1')).updatedAt).toEqual(a.updatedAt);
    expect((await renameFolder(a._id, 'A2', 'u2')).name).toBe('A2');
    await rejectsWith(renameFolder(a._id, 'b', 'u1'), 'CONFLICT');
    const entry = (await DmsActivities.findOneAsync({ action: 'folder-renamed' })) as any;
    expect(entry.details).toEqual({ from: 'A', to: 'A2' });
  });

  it('moves a folder and rewrites descendants ancestor paths', async () => {
    const a = await folder('A');
    const b = await folder('B', a._id);
    const c = await folder('C', b._id);
    const x = await folder('X');
    await moveFolder(b._id, x._id, 'u1');
    expect((await getFolder(c._id, 'u1')).ancestorIds).toEqual([x._id, b._id]);
    await moveFolder(b._id, null, 'u1');
    const movedC = await getFolder(c._id, 'u1');
    expect(movedC.ancestorIds).toEqual([b._id]);
    expect((await getFolder(b._id, 'u1')).parentId).toBeUndefined();
  });

  it('cannot move a folder into itself or its subtree', async () => {
    const a = await folder('A');
    const b = await folder('B', a._id);
    await rejectsWith(moveFolder(a._id, a._id, 'u1'), 'BAD_USER_INPUT');
    await rejectsWith(moveFolder(a._id, b._id, 'u1'), 'BAD_USER_INPUT');
  });

  it('refuses a move that would collide with a sibling name', async () => {
    const a = await folder('A');
    await folder('Same', a._id);
    const other = await folder('Same');
    await rejectsWith(moveFolder(other._id, a._id, 'u1'), 'CONFLICT');
  });

  it('moving to the current parent is a no-op', async () => {
    const a = await folder('A');
    const b = await folder('B', a._id);
    expect((await moveFolder(b._id, a._id, 'u1')).updatedAt).toEqual(b.updatedAt);
  });

  it('lists contents: subfolders and live documents of one level only', async () => {
    const a = await folder('A');
    await folder('Sub', a._id);
    const inA = await doc('inA', a._id);
    await doc('root');
    const trashed = await doc('gone', a._id);
    await trashDocument(trashed._id, 'u1');

    const contents = await listFolderContents(workspaceId, a._id, 'u1');
    expect(contents.folders.map(f => f.name)).toEqual(['Sub']);
    expect(contents.documents.data.map(d => d._id)).toEqual([inA._id]);
    expect(contents.documents.totalResults).toBe(1);
    const root = await listFolderContents(workspaceId, null, 'u1');
    expect(root.folders.map(f => f.name)).toEqual(['A']);
    expect(root.documents.data.map(d => d.name)).toEqual(['root']);
    await rejectsWith(listFolderContents(workspaceId, 'nope', 'u1'), 'NOT_FOUND');
  });

  it('listFolders leaves out trashed folders', async () => {
    const a = await folder('A');
    await folder('B');
    await trashFolder(a._id, 'u1');
    expect((await listFolders(workspaceId, 'u1')).map(f => f.name)).toEqual(['B']);
  });

  it('requires a user id', async () => {
    await rejectsWith(listFolders(workspaceId, ''), 'BAD_USER_INPUT');
  });
});

describe('trash', () => {
  it('trashes a document: it disappears from listings but is kept in the trash', async () => {
    const d = await doc('d');
    await trashDocument(d._id, 'u2');
    const stored = (await DmsDocuments.findOneAsync(d._id))!;
    expect(stored).toMatchObject({ trashed: true, trashRootId: d._id, deletedBy: 'u2' });
    const trash = await listTrash(workspaceId, 'u1');
    expect(trash.documents.map(x => x._id)).toEqual([d._id]);
    expect(await actions()).toContain('document-trashed');
    await rejectsWith(trashDocument(d._id, 'u1'), 'NOT_FOUND');
  });

  it("cannot trash a document that someone else checked out", async () => {
    const d = await doc('d');
    await checkOutDocument(d._id, 'u2');
    await rejectsWith(trashDocument(d._id, 'u1'), 'LOCKED');
    await expect(trashDocument(d._id, 'u2')).resolves.toBeUndefined();
  });

  it('trashes a folder with its whole subtree, and only the root is listed', async () => {
    const a = await folder('A');
    const b = await folder('B', a._id);
    const d = await doc('d', b._id);
    await trashFolder(a._id, 'u1');
    expect((await DmsFolders.findOneAsync(b._id))?.trashed).toBe(true);
    expect((await DmsDocuments.findOneAsync(d._id))?.trashRootId).toBe(a._id);
    const trash = await listTrash(workspaceId, 'u1');
    expect(trash.folders.map(f => f._id)).toEqual([a._id]);
    expect(trash.documents).toEqual([]);
  });

  it('refuses to trash a folder containing a document locked by someone else', async () => {
    const a = await folder('A');
    const d = await doc('d', a._id);
    await checkOutDocument(d._id, 'u2');
    await rejectsWith(trashFolder(a._id, 'u1'), 'LOCKED');
    expect((await DmsFolders.findOneAsync(a._id))?.trashed).toBe(false);
  });

  it('restores a document to its original folder, and a descendant must be restored through its root', async () => {
    const a = await folder('A');
    const d = await doc('d', a._id);
    await trashFolder(a._id, 'u1');
    await rejectsWith(restoreFromTrash(d._id, 'u1'), 'CONFLICT');
    await restoreFromTrash(a._id, 'u1');
    const restored = (await DmsDocuments.findOneAsync(d._id))!;
    expect(restored.trashed).toBe(false);
    expect(restored.trashRootId).toBeUndefined();
    expect(restored.folderId).toBe(a._id);
    expect((await DmsFolders.findOneAsync(a._id))?.deletedAt).toBeUndefined();
  });

  it('restoring a document whose folder is trashed needs another target', async () => {
    const a = await folder('A');
    const d = await doc('d', a._id);
    await trashDocument(d._id, 'u1');
    await trashFolder(a._id, 'u1');
    await rejectsWith(restoreFromTrash(d._id, 'u1'), 'CONFLICT');
    await restoreFromTrash(d._id, 'u1', { targetFolderId: null });
    expect((await DmsDocuments.findOneAsync(d._id))?.folderId).toBeUndefined();
  });

  it('restoring over an existing name conflicts unless renamed', async () => {
    const d = await doc('same');
    await trashDocument(d._id, 'u1');
    await doc('same');
    await rejectsWith(restoreFromTrash(d._id, 'u1'), 'CONFLICT');
    await restoreFromTrash(d._id, 'u1', { newName: 'same (restored)' });
    expect((await DmsDocuments.findOneAsync(d._id))?.name).toBe('same (restored)');
    expect(await actions()).toContain('document-restored');
  });

  it('restores a folder into another parent and fixes the ancestors of its subtree', async () => {
    const a = await folder('A');
    const b = await folder('B', a._id);
    const c = await folder('C', b._id);
    const x = await folder('X');
    await trashFolder(b._id, 'u1');
    await restoreFromTrash(b._id, 'u1', { targetFolderId: x._id });
    expect((await getFolder(b._id, 'u1')).parentId).toBe(x._id);
    expect((await getFolder(c._id, 'u1')).ancestorIds).toEqual([x._id, b._id]);
  });

  it('cannot restore a folder into its own (still trashed) subtree', async () => {
    const a = await folder('A');
    const b = await folder('B', a._id);
    await trashFolder(a._id, 'u1');
    await rejectsWith(restoreFromTrash(a._id, 'u1', { targetFolderId: b._id }), 'NOT_FOUND');
  });

  it('only restores or purges things that are in the trash', async () => {
    const d = await doc('d');
    await rejectsWith(restoreFromTrash(d._id, 'u1'), 'NOT_FOUND');
    await rejectsWith(purgeFromTrash(d._id, 'u1'), 'NOT_FOUND');
    await rejectsWith(restoreFromTrash('nope', 'u1'), 'NOT_FOUND');
  });

  it('purges a document with all its versions and deletes their files', async () => {
    const d = await doc('d');
    await uploadNewVersion(d._id, { body: Buffer.from('v2'), mimeType: 'text/plain' }, 'u1');
    await trashDocument(d._id, 'u1');
    storage.deleteFiles.mockClear();
    storage.deleteFile.mockClear();
    await purgeFromTrash(d._id, 'u1');
    expect(await DmsDocuments.find({}).countAsync()).toBe(0);
    expect(await DmsDocumentVersions.find({}).countAsync()).toBe(0);
    const deleted = [
      ...(storage.deleteFiles.mock.calls as unknown as string[][]).flatMap(c => c[0]),
      ...(storage.deleteFile.mock.calls as unknown as string[][]).map(c => c[0]),
    ];
    expect(deleted).toHaveLength(2);
    expect(await actions()).toContain('document-purged');
  });

  it('purges a folder subtree with its documents, and refuses when one is locked by someone else', async () => {
    const a = await folder('A');
    const b = await folder('B', a._id);
    const d = await doc('d', b._id);
    await checkOutDocument(d._id, 'u2');
    await trashFolder(a._id, 'u2');
    await rejectsWith(purgeFromTrash(a._id, 'u1'), 'LOCKED');
    expect(await DmsFolders.find({}).countAsync()).toBe(2);
    await purgeFromTrash(a._id, 'u2');
    expect(await DmsFolders.find({}).countAsync()).toBe(0);
    expect(await DmsDocuments.find({}).countAsync()).toBe(0);
    const entry = (await DmsActivities.findOneAsync({ action: 'folder-purged' })) as any;
    expect(entry.details).toMatchObject({ folders: 2, documents: 1 });
  });

  it('keeps everything when a purge cannot be logged', async () => {
    const d = await doc('d');
    await trashDocument(d._id, 'u1');
    storage.deleteFiles.mockClear();
    storage.deleteFile.mockClear();
    vi.spyOn(DmsActivities, 'insertAsync').mockRejectedValueOnce(new Error('log failed'));
    await expect(purgeFromTrash(d._id, 'u1')).rejects.toThrow('log failed');
    expect(await DmsDocuments.find({}).countAsync()).toBe(1);
    expect(await DmsDocumentVersions.find({}).countAsync()).toBe(1);
    expect(storage.deleteFiles).not.toHaveBeenCalled();
    expect(storage.deleteFile).not.toHaveBeenCalled();
  });

  it('keeps a trashed folder trashed when its restore cannot be logged', async () => {
    const a = await folder('A');
    const d = await doc('d', a._id);
    await trashFolder(a._id, 'u1');
    vi.spyOn(DmsActivities, 'insertAsync').mockRejectedValueOnce(new Error('log failed'));
    await expect(restoreFromTrash(a._id, 'u1')).rejects.toThrow('log failed');
    expect((await DmsFolders.findOneAsync(a._id))?.trashed).toBe(true);
    expect((await DmsDocuments.findOneAsync(d._id))?.trashed).toBe(true);
  });

  it('empties the trash, skipping what is locked by someone else and honouring olderThanDays', async () => {
    const free = await doc('free');
    const locked = await doc('locked');
    await checkOutDocument(locked._id, 'u2');
    await trashDocument(free._id, 'u1');
    await trashDocument(locked._id, 'u2');
    const recent = await emptyTrash(workspaceId, 'u1', { olderThanDays: 1 });
    expect(recent).toEqual({ purged: 0, skipped: [] });

    const result = await emptyTrash(workspaceId, 'u1');
    expect(result.purged).toBe(1);
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0].itemId).toBe(locked._id);
    expect(await DmsDocuments.find({}).countAsync()).toBe(1);
  });

  it('emptying the trash counts a folder with its contents once', async () => {
    const a = await folder('A');
    await doc('d', a._id);
    await trashFolder(a._id, 'u1');
    const result = await emptyTrash(workspaceId, 'u1');
    expect(result).toEqual({ purged: 1, skipped: [] });
    expect(await DmsDocuments.find({}).countAsync()).toBe(0);
  });
});
