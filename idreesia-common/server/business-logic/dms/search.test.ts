import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DmsDocuments } from 'meteor/idreesia-common/server/collections/dms';

import { uploadDocument, updateDocument } from './documents';
import { createFolder } from './folders';
import { trashDocument } from './trash';
import { searchDocuments } from './search';
import { createTestWorkspace } from './test-helpers';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);

let workspaceId: string;

// The text index is created by migration 8, not by the collection.
const createTextIndex = () =>
  DmsDocuments.rawCollection().createIndex(
    { workspaceId: 1, name: 'text', description: 'text', tags: 'text' },
    { weights: { name: 10, tags: 5, description: 1 }, default_language: 'none' }
  );

beforeEach(async () => {
  await createTextIndex();
  workspaceId = await createTestWorkspace();
});

const add = async (
  name: string,
  extra: Record<string, unknown> = {},
  user = 'u1',
  mimeType = 'text/plain'
) =>
  (
    await uploadDocument(
      { workspaceId, name, fileName: `${name}.bin`, body: Buffer.from('x'), mimeType, ...extra },
      user
    )
  ).document;

const names = async (options: any = {}) =>
  (await searchDocuments(workspaceId, 'u1', options)).data.map(d => d.name).sort();

const rejectsWith = async (promise: Promise<unknown>, code: string) => {
  await expect(promise).rejects.toMatchObject({ extensions: { code } });
};

describe('searchDocuments', () => {
  it('leaves out trashed documents and documents without a version', async () => {
    const live = await add('live');
    const gone = await add('gone');
    await trashDocument(gone._id, 'u1');
    await DmsDocuments.insertAsync({
      workspaceId,
      name: 'pending',
      nameLower: 'pending',
      tags: [],
      versionCount: 0,
      trashed: false,
      createdAt: new Date(),
      createdBy: 'u1',
      updatedAt: new Date(),
      updatedBy: 'u1',
    } as any);
    expect(await names()).toEqual(['live']);
    expect(live.name).toBe('live');
  });

  it('is scoped to the workspace', async () => {
    await add('mine');
    const other = await createTestWorkspace();
    await uploadDocument(
      { workspaceId: other, fileName: 'o.txt', body: Buffer.from('x'), mimeType: 'text/plain' },
      'u1'
    );
    expect(await names()).toEqual(['mine']);
    await rejectsWith(searchDocuments('nope', 'u1'), 'NOT_FOUND');
    await rejectsWith(searchDocuments(workspaceId, ''), 'BAD_USER_INPUT');
  });

  it('filters by tags (all of them)', async () => {
    await add('a', { tags: ['x', 'y'] });
    await add('b', { tags: ['x'] });
    expect(await names({ tags: ['x'] })).toEqual(['a', 'b']);
    expect(await names({ tags: ['x', 'y'] })).toEqual(['a']);
  });

  it('filters by exact mime type and wildcard patterns', async () => {
    await add('t', {}, 'u1', 'text/plain');
    await add('p', {}, 'u1', 'application/pdf');
    await add('i', {}, 'u1', 'image/png');
    expect(await names({ mimeTypes: ['application/pdf'] })).toEqual(['p']);
    expect(await names({ mimeTypes: ['image/*', 'text/plain'] })).toEqual(['i', 't']);
    await rejectsWith(searchDocuments(workspaceId, 'u1', { mimeTypes: ['bogus'] }), 'BAD_USER_INPUT');
  });

  it('filters by folder, optionally with subfolders', async () => {
    const a = await createFolder({ workspaceId, name: 'A' }, 'u1');
    const b = await createFolder({ workspaceId, name: 'B', parentId: a._id }, 'u1');
    await add('root');
    await add('inA', { folderId: a._id });
    await add('inB', { folderId: b._id });
    expect(await names({ folderId: null })).toEqual(['root']);
    expect(await names({ folderId: null, includeSubfolders: true })).toEqual(['inA', 'inB', 'root']);
    expect(await names({ folderId: a._id })).toEqual(['inA']);
    expect(await names({ folderId: a._id, includeSubfolders: true })).toEqual(['inA', 'inB']);
    await rejectsWith(searchDocuments(workspaceId, 'u1', { folderId: 'nope' }), 'NOT_FOUND');
  });

  it('filters by metadata, creator and update time, and validates metadata keys', async () => {
    await add('m1', { metadata: { year: 2025 } }, 'u2');
    await add('m2', { metadata: { year: 2026 } }, 'u1');
    expect(await names({ metadata: { year: 2025 } })).toEqual(['m1']);
    expect(await names({ createdBy: 'u2' })).toEqual(['m1']);
    expect(await names({ updatedAfter: new Date(Date.now() + 60_000) })).toEqual([]);
    expect(await names({ updatedBefore: new Date(Date.now() + 60_000) })).toEqual(['m1', 'm2']);
    await rejectsWith(
      searchDocuments(workspaceId, 'u1', { metadata: { 'bad key!': 1 } }),
      'BAD_USER_INPUT'
    );
  });

  it('pages results and reports the total', async () => {
    await add('a');
    await add('b');
    await add('c');
    const page = await searchDocuments(workspaceId, 'u1', { limit: 2, skip: 0 });
    expect(page.data).toHaveLength(2);
    expect(page.totalResults).toBe(3);
    const rest = await searchDocuments(workspaceId, 'u1', { limit: 2, skip: 2 });
    expect(rest.data).toHaveLength(1);
  });

  it('matches text on name, tags and description and ranks name matches first', async () => {
    await add('budget plan', { description: 'misc' });
    await add('misc', { description: 'budget notes' });
    await add('other', { tags: ['unrelated'] });
    const result = await searchDocuments(workspaceId, 'u1', { text: ' budget ' });
    expect(result.data.map(d => d.name)).toEqual(['budget plan', 'misc']);
    expect(result.data[0].score).toBeGreaterThan(result.data[1].score as number);
    expect(result.totalResults).toBe(2);
    expect(await names({ text: 'unrelated' })).toEqual(['other']);
    expect(await names({ text: 'budget', tags: ['nomatch'] })).toEqual([]);
  });

  it('sees renamed documents by their new name', async () => {
    const d = await add('old');
    await updateDocument(d._id, { name: 'new' }, 'u1');
    expect(await names()).toEqual(['new']);
  });
});
