import { Accounts } from 'meteor/accounts-base';
import { compact, values } from 'meteor/idreesia-common/utilities/lodash';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';
import { SecurityOperationType } from 'meteor/idreesia-common/constants/audit';
import { DataSource } from 'meteor/idreesia-common/constants';

interface UserType {
  _id: string;
  personId?: string;
  username?: string;
  permissions?: string[];
  displayName?: string;
}

interface PersonRecord {
  sharedData?: {
    name?: string;
  };
}

interface ResolverContext {
  user?: {
    _id: string;
    username?: string;
    locked?: boolean;
    permissions?: string[];
  };
}

interface UserArgs extends Record<string, unknown> {
  _id: string;
  ids?: Array<string | null | undefined>;
  displayName: string;
  email: string;
}

function requireUser(user: ResolverContext['user']) {
  if (!user) {
    throw new Error('User is required.');
  }
  return user;
}

export default {
  UserType: {
    person: async (userType: UserType) => {
      if (!userType.personId) return null;
      return People.findOneAsync(userType.personId);
    },

    karkun: async (userType: UserType) => {
      if (!userType.personId) return null;
      const person = await People.findOneAsync(userType.personId);
      if (!person) return null;
      return People.personToKarkun(person);
    },
  },

  Query: {
    pagedUsers: async (_obj: unknown, { filter }: { filter: Record<string, unknown> }) =>
      Users.searchUsers(filter),

    userById: async (
      _obj: unknown,
      { _id }: Pick<UserArgs, '_id'>,
      { user }: ResolverContext
    ) => {
      if (!_id || !user) {
        return null;
      }

      const _user = await Users.findOneUser(_id);
      if (_user.username === 'erp-admin') {
        _user.permissions = values(PermissionConstants);
      }

      return _user;
    },

    currentUser: async (_obj: unknown, _args: unknown, { user }: ResolverContext) => {
      if (!user) return null;
      const _user = await Users.findOneUser(user._id);
      if (_user.username === 'erp-admin') {
        _user.permissions = values(PermissionConstants);
      }

      return _user;
    },

    userNames: async (_obj: unknown, { ids }: Pick<UserArgs, 'ids'>) => {
      const names: Array<string | undefined> = [];
      if (!ids) return names;

      const idsToSearch = compact(ids);
      for (const _id of idsToSearch) {
        const user = await Users.findOneAsync(_id);
        if (!user) {
          names.push(undefined);
        } else if (user.personId) {
          const person = (await People.findOneAsync(
            user.personId
          )) as PersonRecord | null;
          names.push(person?.sharedData?.name);
        } else {
          names.push(user.displayName);
        }
      }

      return names;
    },
  },

  Mutation: {
    registerUser: async (
      _obj: unknown,
      { displayName, email }: Pick<UserArgs, 'displayName' | 'email'>
    ) => {
      // Check if this email is already registered for a user
      const user = await Accounts.findUserByEmail(email);
      if (user) {
        throw new Error('This email address is already registered.');
      }

      const userId = await Accounts.createUserAsync({
        email,
        profile: {
          name: displayName,
        },
      });

      if (userId) {
        await Accounts.sendEnrollmentEmail(userId);
      }

      return 1;
    },

    createUser: async (
      _obj: unknown,
      params: Record<string, unknown>,
      { user }: ResolverContext
    ) => Users.createUser(params, requireUser(user), DataSource.ADMIN),

    updateUser: async (
      _obj: unknown,
      params: Record<string, unknown>,
      { user }: ResolverContext
    ) => Users.updateUser(params, requireUser(user), DataSource.ADMIN),

    setPermissions: async (
      _obj: unknown,
      params: { userId: string; permissions: string[] },
      { user }: ResolverContext
    ) => Users.setPermissions(params, requireUser(user), DataSource.ADMIN),

    setInstanceAccess: async (
      _obj: unknown,
      params: { userId: string; instances: string[] },
      { user }: ResolverContext
    ) => Users.setInstanceAccess(params, requireUser(user), DataSource.ADMIN),

    setGroups: async (
      _obj: unknown,
      params: { userId: string; groups: string[] },
      { user }: ResolverContext
    ) => Users.setGroups(params, requireUser(user), DataSource.ADMIN),

    resetPassword: async (
      _obj: unknown,
      params: { userId?: string; userName?: string },
      { user }: ResolverContext
    ) => Users.resetPassword(params, requireUser(user), DataSource.ADMIN),

    updateLoginTime: async (_obj: unknown, _args: unknown, { user }: ResolverContext) => {
      if (user) {
        const loginTime = new Date();
        await Users.updateAsync(user._id, {
          $set: {
            lastLoggedInAt: loginTime,
          },
        });

        // Create a security log
        await SecurityLogs.insertAsync({
          userId: user._id,
          operationType: SecurityOperationType.LOGIN,
          operationTime: new Date(),
          dataSource: DataSource.ADMIN,
          dataSourceDetail: null,
        });
      }

      return 1;
    },

    updateLastActiveTime: async (_obj: unknown, _args: unknown, { user }: ResolverContext) => {
      if (user) {
        await Users.updateAsync(user._id, {
          $set: {
            lastActiveAt: new Date(),
          },
        });
      }

      return 1;
    },
  },
};
