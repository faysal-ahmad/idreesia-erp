import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import { parse } from 'query-string';
import { SecurityOperationType } from 'meteor/idreesia-common/constants/audit';
import {
  UserGroups,
  Users,
  type UserGroupDocument,
} from 'meteor/idreesia-common/server/collections/admin';
import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';
import { difference, get } from 'meteor/idreesia-common/utilities/lodash';

interface UserRef {
  _id: string;
}

interface CountResult {
  total: number;
}

interface GroupValues {
  _id: string;
  name: string;
  moduleName?: string;
  description?: string;
}

interface PermissionsValues {
  _id: string;
  permissions: string[];
}

interface InstanceAccessValues {
  _id: string;
  instances: string[];
}

export function searchUserGroups(queryString: string) {
  const params = parse(queryString);
  const pipeline: Record<string, unknown>[] = [];

  const { pageIndex = '0', pageSize = '20' } = params;

  const countingPipeline = pipeline.concat({
    $count: 'total',
  });

  const nPageIndex = parseInt(String(pageIndex), 10);
  const nPageSize = parseInt(String(pageSize), 10);
  const resultsPipeline = pipeline.concat([
    { $sort: { name: 1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const userGroups = UserGroups.aggregate<UserGroupDocument>(resultsPipeline);
  const totalResults = UserGroups.aggregate<CountResult>(countingPipeline);

  return Promise.all([userGroups, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}

export async function createUserGroup(
  { name, moduleName, description }: Omit<GroupValues, '_id'>,
  user: UserRef
) {
  const existingGroup = await UserGroups.findOneAsync({ name });
  if (existingGroup) {
    throw new Error(`User Group name '${name}' is already in use.`);
  }

  const date = new Date();
  const newUserGroupId = await UserGroups.insertAsync({
    name,
    moduleName,
    description,
    createdAt: date,
    createdBy: user._id,
    updatedAt: date,
    updatedBy: user._id,
  });

  return UserGroups.findOneAsync(newUserGroupId);
}

export async function updateUserGroup(
  { _id, name, description }: GroupValues,
  user: UserRef
) {
  const date = new Date();
  await UserGroups.updateAsync(_id, {
    $set: {
      name,
      description,
      updatedAt: date,
      updatedBy: user._id,
    },
  });

  return UserGroups.findOneAsync(_id);
}

/** Deletes a group, unless users are still assigned to it. */
export async function removeUserGroup({ _id }: { _id: string }) {
  return runInTransaction(async () => {
    const groupUserCount = await Users.find({
      groups: { $in: [_id] },
    }).countAsync();

    if (groupUserCount > 0) {
      throw new Error(`This Group is currently in use and cannot be deleted.`);
    }

    return UserGroups.removeAsync(_id);
  });
}

export async function setUserGroupPermissions(
  { _id, permissions }: PermissionsValues,
  user: UserRef,
  dataSource: string,
  dataSourceDetail: string | null = null
) {
  return runInTransaction(async () => {
    const existingGroup = await UserGroups.findOneAsync(_id);
    await UserGroups.updateAsync(_id, { $set: { permissions } });

    // Create a security log
    const permissionsAdded = difference(
      permissions,
      existingGroup?.permissions || []
    );
    const permissionsRemoved = difference(
      existingGroup?.permissions || [],
      permissions
    );

    await SecurityLogs.insertAsync({
      groupId: _id,
      operationType: SecurityOperationType.PERMISSIONS_CHANGED,
      operationBy: user._id,
      operationTime: new Date(),
      operationDetails: {
        permissionsAdded,
        permissionsRemoved,
      },
      dataSource,
      dataSourceDetail,
    });

    return UserGroups.findOneAsync(_id);
  });
}

export async function setUserGroupInstanceAccess(
  { _id, instances }: InstanceAccessValues,
  user: UserRef,
  dataSource: string,
  dataSourceDetail: string | null = null
) {
  return runInTransaction(async () => {
    const existingGroup = await UserGroups.findOneAsync(_id);
    await UserGroups.updateAsync(_id, { $set: { instances } });

    // Create a security log
    const instancesAdded = difference(instances, existingGroup?.instances || []);
    const instancesRemoved = difference(
      existingGroup?.instances || [],
      instances
    );

    await SecurityLogs.insertAsync({
      groupId: _id,
      operationType: SecurityOperationType.INSTANCE_ACCESS_CHANGED,
      operationBy: user._id,
      operationTime: new Date(),
      operationDetails: {
        instancesAdded,
        instancesRemoved,
      },
      dataSource,
      dataSourceDetail,
    });

    return UserGroups.findOneAsync(_id);
  });
}
