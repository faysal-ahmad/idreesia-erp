import {
  DmsDocuments,
  type DmsDocumentDocument,
} from 'meteor/idreesia-common/server/collections/dms';

import { dmsError } from './errors';
import {
  documentSort,
  getSubtreeFolderIds,
  METADATA_KEY_PATTERN,
  normalizeMimeType,
  normalizePage,
  normalizeTags,
  requireFolder,
  requireUserId,
  requireWorkspace,
  type DmsPage,
  type DmsPageOptions,
  type DmsSortOptions,
} from './internal';

export interface SearchDocumentsOptions extends DmsPageOptions, DmsSortOptions {
  /** Words matched against name, description and tags (not file content). */
  text?: string;
  /** Documents that have all of these tags. */
  tags?: string[];
  /** Exact types; `image/*` style wildcards are allowed. */
  mimeTypes?: string[];
  /** Limit to this folder (null = root). Unset searches everywhere. */
  folderId?: string | null;
  /** With folderId: also search its subfolders. */
  includeSubfolders?: boolean;
  /** Exact matches on top-level metadata values. */
  metadata?: Record<string, string | number | boolean>;
  createdBy?: string;
  updatedAfter?: Date;
  updatedBefore?: Date;
}

export interface DmsSearchResult extends DmsDocumentDocument {
  /** Text relevance, when searching by text. */
  score?: number;
}

/**
 * Searches a workspace's (non-trashed) documents. With `text` and no
 * explicit sortBy, results are ordered by relevance.
 */
export async function searchDocuments(
  workspaceId: string,
  userId: string,
  options: SearchDocumentsOptions = {}
): Promise<DmsPage<DmsSearchResult>> {
  requireUserId(userId);
  await requireWorkspace(workspaceId);
  const { skip, limit } = normalizePage(options);

  const selector: Record<string, unknown> = {
    workspaceId,
    trashed: false,
    currentVersionId: { $exists: true },
  };
  const and: Record<string, unknown>[] = [];

  const text = options.text?.trim();
  if (text) selector.$text = { $search: text };

  const tags = normalizeTags(options.tags);
  if (tags.length) selector.tags = { $all: tags };

  if (options.mimeTypes?.length) {
    and.push({
      $or: options.mimeTypes.map(type => {
        const normalized = type.trim().toLowerCase();
        if (normalized.endsWith('/*')) {
          const prefix = normalized.slice(0, -1).replace(/[.+]/g, '\\$&');
          return { mimeType: { $regex: `^${prefix}` } };
        }
        return { mimeType: normalizeMimeType(normalized) };
      }),
    });
  }

  if (options.folderId !== undefined) {
    if (options.folderId === null) {
      if (!options.includeSubfolders) selector.folderId = null;
    } else {
      await requireFolder(options.folderId, { workspaceId });
      selector.folderId = options.includeSubfolders
        ? { $in: await getSubtreeFolderIds(options.folderId) }
        : options.folderId;
    }
  }

  Object.entries(options.metadata ?? {}).forEach(([key, value]) => {
    if (!METADATA_KEY_PATTERN.test(key)) {
      throw dmsError('BAD_USER_INPUT', `Invalid metadata key "${key}"`);
    }
    selector[`metadata.${key}`] = value;
  });

  if (options.createdBy) selector.createdBy = options.createdBy;
  if (options.updatedAfter || options.updatedBefore) {
    selector.updatedAt = {
      ...(options.updatedAfter ? { $gte: options.updatedAfter } : {}),
      ...(options.updatedBefore ? { $lt: options.updatedBefore } : {}),
    };
  }
  if (and.length) selector.$and = and;

  const byRelevance = !!text && !options.sortBy;
  const collection = DmsDocuments.rawCollection();
  const [data, totalResults] = await Promise.all([
    collection
      .find(selector, {
        ...(text ? { projection: { score: { $meta: 'textScore' } } } : {}),
        sort: byRelevance
          ? { score: { $meta: 'textScore' }, _id: 1 }
          : documentSort(options),
        skip,
        limit,
      })
      .toArray(),
    collection.countDocuments(selector),
  ]);
  return { data: data as DmsSearchResult[], totalResults };
}
