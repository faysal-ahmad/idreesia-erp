import { People } from 'meteor/idreesia-common/server/collections/common';
import { ImageVectorStatus } from 'meteor/idreesia-common/constants';

interface FaceVectorsArgs {
  since?: Date;
  limit?: number;
}

interface FaceVectorsContext {
  user?: {
    locked?: boolean;
  } | null;
}

// Keeps a single page cheap regardless of what the caller asks for - the initial full sync and
// every later incremental poll both page through results via `since` + `limit` rather than one
// server ever returning its entire backlog (tens of thousands of records) in a single response.
const DEFAULT_PAGE_SIZE = 500;
const MAX_PAGE_SIZE = 2000;

export default {
  Query: {
    faceVectors: async (
      _obj: unknown,
      { since, limit }: FaceVectorsArgs,
      { user }: FaceVectorsContext
    ) => {
      // No @checkPermissions here by design - any logged-in idreesia-erp user (e.g. the
      // security-server service account) may call this, not just ones with a specific
      // permission grant. Only requires a valid, unlocked session.
      if (!user || user.locked === true) {
        throw new Error('You must be logged in to perform this operation.');
      }

      const query: Record<string, unknown> = {
        'sharedData.imageVectorData.status': ImageVectorStatus.COMPUTED,
      };
      if (since) {
        query['sharedData.imageVectorData.computedAt'] = { $gt: since };
      }

      const pageSize = Math.min(
        limit && limit > 0 ? limit : DEFAULT_PAGE_SIZE,
        MAX_PAGE_SIZE
      );

      // Sorted ascending by computedAt so the caller can advance its cursor with the last
      // record's computedAt and keep paging until a short (< pageSize) page signals it's caught up.
      const people = await People.find(query, {
        sort: { 'sharedData.imageVectorData.computedAt': 1 },
        limit: pageSize,
      }).fetchAsync();

      return people.map((person: NonNullable<Parameters<typeof People.personToKarkun>[0]>) => ({
        personId: person._id,
        vector: person.sharedData.imageVectorData.vector,
        computedAt: person.sharedData.imageVectorData.computedAt,
      }));
    },
  },
};
