import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { UserGroup as UserGroupSchema } from 'meteor/idreesia-common/server/schemas/admin';
import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';
import { SecurityOperationType } from 'meteor/idreesia-common/constants/audit';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { difference, get } from 'meteor/idreesia-common/utilities/lodash';
import { parse } from 'query-string';

interface UserRef {
  _id: string;
}

interface UserGroupDocument {
  _id?: string;
  name: string;
  moduleName: string;
  description?: string;
  permissions?: string[];
  instances?: string[];
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
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

class UserGroups extends AggregatableCollection<UserGroupDocument> {
  constructor(name = 'user-groups', options = {}) {
    super(name, options);
    this.attachSchema(UserGroupSchema);
  }

  searchGroups = (queryString: string) => {
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

    const userGroups = this.aggregate<UserGroupDocument>(resultsPipeline);
    const totalResults = this.aggregate<CountResult>(countingPipeline);

    return Promise.all([userGroups, totalResults]).then(results => ({
      data: results[0],
      totalResults: get(results[1], ['0', 'total'], 0),
    }));
  };

  // *******************************************************************
  // Common Create/Update methods for UserGroups.
  // Used from Admin/Outstation/Portals.
  // *******************************************************************
  async createGroup(
    { name, moduleName, description }: Omit<GroupValues, '_id'>,
    user: UserRef
  ) {
    const existingGroup = await this.findOneAsync({ name });
    if (existingGroup) {
      throw new Error(`User Group name '${name}' is already in use.`);
    }

    const date = new Date();
    const newUserGroupId = await this.insertAsync({
      name,
      moduleName,
      description,
      createdAt: date,
      createdBy: user._id,
      updatedAt: date,
      updatedBy: user._id,
    });

    return this.findOneAsync(newUserGroupId);
  }

  async updateGroup({ _id, name, description }: GroupValues, user: UserRef) {
    const date = new Date();
    await this.updateAsync(_id, {
      $set: {
        name,
        description,
        updatedAt: date,
        updatedBy: user._id,
      },
    });

    return this.findOneAsync(_id);
  }

  async removeGroup({ _id }: { _id: string }) {
    // Check if there are users that have been assigned to
    // this group.
    const groupUserCount = await Users.find({
      groups: { $in: [_id] },
    }).countAsync();

    if (groupUserCount > 0) {
      throw new Error(`This Group is currently in use and cannot be deleted.`);
    }

    return this.removeAsync(_id);
  }

  setPermissions = async (
    { _id, permissions }: PermissionsValues,
    user: UserRef,
    dataSource: string,
    dataSourceDetail: string | null = null
  ) => {
    const existingGroup = await this.findOneAsync(_id);
    await this.updateAsync(_id, { $set: { permissions } });

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

    return this.findOneAsync(_id);
  };

  setInstanceAccess = async (
    { _id, instances }: InstanceAccessValues,
    user: UserRef,
    dataSource: string,
    dataSourceDetail: string | null = null
  ) => {
    const existingGroup = await this.findOneAsync(_id);
    await this.updateAsync(_id, { $set: { instances } });

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

    return this.findOneAsync(_id);
  };
}

export default new UserGroups();
