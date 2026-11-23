import { subMinutes } from 'date-fns';
import {
  Users,
  type AppUser,
} from 'meteor/idreesia-common/server/collections/admin';
import { escapeRegExp, get, kebabCase } from 'meteor/idreesia-common/utilities/lodash';

import { mapUser, type MappedUser } from './map-user';

type LooseRecord = Record<string, any>;

export interface UserSearchResult {
  totalResults: number;
  data: MappedUser[];
}

interface CountResult {
  total: number;
}

const EMPTY_RESULT: UserSearchResult = { data: [], totalResults: 0 };

/**
 * The aggregation stages for a user search, or null when the filters
 * exclude every user (e.g. neither locked nor unlocked users).
 */
export function buildUserSearchPipeline(
  params: LooseRecord
): LooseRecord[] | null {
  const {
    showLocked,
    showUnlocked,
    showActive,
    showInactive,
    moduleAccess,
    serviceAccounts,
    name,
  } = params;

  // Service accounts are listed on their own page and kept off the Users page.
  const pipeline: LooseRecord[] = [
    {
      $match: {
        isServiceAccount:
          serviceAccounts === 'true' ? { $eq: true } : { $ne: true },
      },
    },
  ];

  if (showLocked === 'true' && showUnlocked === 'false') {
    pipeline.push({
      $match: {
        locked: { $eq: true },
      },
    });
  } else if (showLocked === 'false' && showUnlocked === 'true') {
    pipeline.push({
      $match: {
        locked: { $ne: true },
      },
    });
  } else if (showLocked === 'false' && showUnlocked === 'false') {
    return null;
  }

  const now = subMinutes(new Date(), 3);
  if (showActive === 'true' && showInactive === 'false') {
    pipeline.push({
      $match: {
        lastActiveAt: { $gte: now },
      },
    });
  } else if (showActive === 'false' && showInactive === 'true') {
    pipeline.push({
      $match: {
        $or: [
          { lastActiveAt: { $exists: false } },
          { lastActiveAt: { $lt: now } },
        ],
      },
    });
  } else if (showActive === 'false' && showInactive === 'false') {
    return null;
  }

  if (moduleAccess) {
    const lcModuleName = kebabCase(moduleAccess);
    const hasModulePermission = {
      $elemMatch: { $regex: `^${lcModuleName}` },
    };
    // Access comes from the user's own permissions or from their groups.
    pipeline.push(
      {
        $lookup: {
          from: 'user-groups',
          localField: 'groups',
          foreignField: '_id',
          as: 'groupDocs',
        },
      },
      {
        $match: {
          $or: [
            { permissions: hasModulePermission },
            { 'groupDocs.permissions': hasModulePermission },
          ],
        },
      },
      { $project: { groupDocs: 0 } }
    );
  }

  if (name) {
    const regex = new RegExp(escapeRegExp(String(name).trim()), 'i');
    pipeline.push({
      $match: { $or: [{ username: regex }, { 'profile.name': regex }] },
    });
  }

  return pipeline;
}

export async function searchUsers(
  params: LooseRecord
): Promise<UserSearchResult> {
  const { pageIndex = '0', pageSize = '20' } = params;
  const pipeline = buildUserSearchPipeline(params);
  if (!pipeline) {
    return EMPTY_RESULT;
  }
  const countingPipeline = pipeline.concat({
    $count: 'total',
  });

  const nPageIndex = parseInt(pageIndex, 10);
  const nPageSize = parseInt(pageSize, 10);
  const resultsPipeline = pipeline.concat([
    { $sort: { username: 1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const [users, totalResults] = await Promise.all([
    Users.aggregate<AppUser>(resultsPipeline),
    Users.aggregate<CountResult>(countingPipeline),
  ]);

  return {
    totalResults: get(totalResults, ['0', 'total'], 0),
    data: users.map(user => mapUser(user)),
  };
}
