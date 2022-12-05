import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { UserGroup as UserGroupSchema } from 'meteor/idreesia-common/server/schemas/admin';
import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';
import { SecurityOperationType } from 'meteor/idreesia-common/constants/audit';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { difference, get } from 'meteor/idreesia-common/utilities/lodash';
import { parse } from 'query-string';

class UserGroups extends AggregatableCollection {
  constructor(name = 'user-groups', options = {}) {
    const userGroups = super(name, options);
    userGroups.attachSchema(UserGroupSchema);
    return userGroups;
  }

  searchGroups = queryString => {
    const params = parse(queryString);
    const pipeline = [];

    const { pageIndex = '0', pageSize = '20' } = params;

    const countingPipeline = pipeline.concat({
      $count: 'total',
    });

    const nPageIndex = parseInt(pageIndex, 10);
    const nPageSize = parseInt(pageSize, 10);
    const resultsPipeline = pipeline.concat([
      { $sort: { name: 1 } },
      { $skip: nPageIndex * nPageSize },
      { $limit: nPageSize },
    ]);

    const userGroups = this.aggregate(resultsPipeline);
    const totalResults = this.aggregate(countingPipeline);

    return Promise.all([userGroups, totalResults]).then(results => ({
      data: results[0],
      totalResults: get(results[1], ['0', 'total'], 0),
    }));
  };

  // *******************************************************************
  // Common Create/Update methods for UserGroups.
  // Used from Admin/Outstation/Portals.
  // *******************************************************************
  createGroup({ name, moduleName, description }, user) {
    const existingGroup = this.findOne({ name });
    if (existingGroup) {
      throw new Error(`User Group name '${name}' is already in use.`);
    }

    const date = new Date();
    const newUserGroupId = this.insert({
      name,
      moduleName,
      description,
      createdAt: date,
      createdBy: user._id,
      updatedAt: date,
      updatedBy: user._id,
    });

    return this.findOne(newUserGroupId);
  }

  updateGroup({ _id, name, description }, user) {
    const date = new Date();
    UserGroups.update(_id, {
      $set: {
        name,
        description,
        updatedAt: date,
        updatedBy: user._id,
      },
    });

    return UserGroups.findOne(_id);
  }

  removeGroup({ _id }) {
    // Check if there are users that have been assigned to
    // this group.
    const groupUserCount = Users.find({
      groups: { $in: [_id] },
    }).count();

    if (groupUserCount > 0) {
      throw new Error(`This Group is currently in use and cannot be deleted.`);
    }

    return UserGroups.remove(_id);
  }

  setPermissions = (
    { _id, permissions },
    user,
    dataSource,
    dataSourceDetail = null
  ) => {
    const existingGroup = this.findOne(_id);
    this.update(_id, { $set: { permissions } });

    // Create a security log
    const permissionsAdded = difference(
      permissions,
      existingGroup.permissions || []
    );
    const permissionsRemoved = difference(
      existingGroup.permissions || [],
      permissions
    );

    SecurityLogs.insert({
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

    return this.findOne(_id);
  };

  setInstanceAccess = (
    { _id, instances },
    user,
    dataSource,
    dataSourceDetail = null
  ) => {
    const existingGroup = this.findOne(_id);
    this.update(_id, { $set: { instances } });

    // Create a security log
    const instancesAdded = difference(instances, existingGroup.instances || []);
    const instancesRemoved = difference(
      existingGroup.instances || [],
      instances
    );

    SecurityLogs.insert({
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

    return this.findOne(_id);
  };
}

export default new UserGroups();
