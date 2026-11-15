import type { Mongo } from 'meteor/mongo';

type LooseRecord = Record<string, any>;

export interface AppUser extends LooseRecord {
  _id: string;
  username?: string;
  emails?: Array<{ address?: string; verified?: boolean }>;
  profile?: { name?: string };
  personId?: string;
  locked?: boolean;
  lastLoggedInAt?: Date;
  lastActiveAt?: Date;
  permissions?: string[];
  instances?: string[];
  groups?: string[];
  chatUserId?: string;
  isSuperAdmin?: boolean;
}

interface UsersCollection extends Mongo.Collection<AppUser> {
  aggregate<TResult = AppUser>(
    pipelines: LooseRecord[],
    options?: unknown
  ): Promise<TResult[]>;
}

const Users = (Meteor as unknown as { users: UsersCollection }).users;

Users.aggregate = <TResult = AppUser>(
  pipelines: LooseRecord[],
  options?: unknown
) => {
  const rawCollection = Users.rawCollection();
  return rawCollection.aggregate<TResult>(pipelines, options).toArray();
};

export default Users;
