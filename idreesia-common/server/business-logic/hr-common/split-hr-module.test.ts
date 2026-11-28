import { describe, expect, it } from 'vitest';

import { ModuleNames } from 'meteor/idreesia-common/constants';
import {
  Committees,
  PeopleTags,
  UserGroups,
  Users,
} from 'meteor/idreesia-common/server/collections/admin';

import { renameHrPermissions, splitHrModule } from './split-hr-module';

// Raw inserts: the stored data is in the old shape, which the schemas may not accept.
const raw = (collection: { rawCollection(): unknown }) =>
  collection.rawCollection() as unknown as { insertOne(doc: unknown): Promise<unknown> };

describe('renameHrPermissions', () => {
  it('renames the HR permissions and leaves the others alone', () => {
    expect(
      renameHrPermissions(['hr-view-karkuns', 'hr-approve-leaves', 'admin-view-users-and-groups'])
    ).toEqual(['hr-karkuns-view', 'hr-employees-approve-leaves', 'admin-view-users-and-groups']);
  });

  it('gives the shared administration permissions to both modules, once', () => {
    expect(
      renameHrPermissions(['hr-manage-permissions', 'hr-view-audit-logs', 'hr-manage-permissions'])
    ).toEqual([
      'hr-karkuns-manage-permissions',
      'hr-employees-manage-permissions',
      'hr-karkuns-view-audit-logs',
      'hr-employees-view-audit-logs',
    ]);
  });
});

describe('splitHrModule', () => {
  const seed = async () => {
    await raw(Users).insertOne({
      _id: 'u1',
      username: 'u1',
      permissions: ['hr-view-karkuns', 'hr-manage-employees', 'security-view-visitors'],
      groups: ['mixed'],
    });
    await raw(Users).insertOne({ _id: 'u2', username: 'u2', groups: ['mixed', 'karkuns'] });
    await raw(Users).insertOne({ _id: 'u3', username: 'u3', permissions: ['purchasing-view-reports'] });
    await raw(UserGroups).insertOne({
      _id: 'karkuns',
      name: 'Duty Team',
      moduleName: 'HR',
      permissions: ['hr-view-karkuns', 'hr-manage-karkuns-setup-data'],
    });
    await raw(UserGroups).insertOne({
      _id: 'employees',
      name: 'Payroll',
      moduleName: 'HR',
      permissions: ['hr-view-employees', 'hr-approve-leaves'],
    });
    await raw(UserGroups).insertOne({
      _id: 'mixed',
      name: 'HR Office',
      moduleName: 'HR',
      description: 'Everyone in the office',
      permissions: ['hr-view-karkuns', 'hr-manage-permissions', 'hr-view-employees'],
    });
    await raw(UserGroups).insertOne({
      _id: 'other',
      name: 'Buyers',
      moduleName: 'Purchasing',
      permissions: ['purchasing-view-reports'],
    });
    await raw(Committees).insertOne({ _id: 'c1', name: 'HR Committee', permissions: ['hr-view-leaves'] });
    await raw(PeopleTags).insertOne({ _id: 't1', name: 'Staff', moduleNames: ['HR', 'Security'] });
  };

  it('renames the permissions held by users and committees', async () => {
    await seed();
    await splitHrModule();

    expect((await Users.findOneAsync('u1'))?.permissions).toEqual([
      'hr-karkuns-view',
      'hr-employees-manage',
      'security-view-visitors',
    ]);
    expect((await Users.findOneAsync('u3'))?.permissions).toEqual(['purchasing-view-reports']);
    expect((await Committees.findOneAsync('c1'))?.permissions).toEqual(['hr-employees-view-leaves']);
  });

  it('moves a one-sided group to its module', async () => {
    await seed();
    await splitHrModule();

    expect(await UserGroups.findOneAsync('karkuns')).toMatchObject({
      name: 'Duty Team',
      moduleName: ModuleNames.hrKarkuns,
      permissions: ['hr-karkuns-view', 'hr-karkuns-manage-setup-data'],
    });
    expect(await UserGroups.findOneAsync('employees')).toMatchObject({
      name: 'Payroll',
      moduleName: ModuleNames.hrEmployees,
      permissions: ['hr-employees-view', 'hr-employees-approve-leaves'],
    });
    expect((await UserGroups.findOneAsync('other'))?.moduleName).toBe('Purchasing');
  });

  it('splits a group holding both sides into two, with the same members', async () => {
    await seed();
    await splitHrModule();

    expect(await UserGroups.findOneAsync('mixed')).toMatchObject({
      name: 'HR Office (Karkuns)',
      moduleName: ModuleNames.hrKarkuns,
      permissions: ['hr-karkuns-view', 'hr-karkuns-manage-permissions'],
    });
    const employeesGroup = await UserGroups.findOneAsync({ name: 'HR Office (Employees)' });
    expect(employeesGroup).toMatchObject({
      moduleName: ModuleNames.hrEmployees,
      description: 'Everyone in the office',
      permissions: ['hr-employees-manage-permissions', 'hr-employees-view'],
    });
    const employeesGroupId = employeesGroup!._id as string;
    expect((await Users.findOneAsync('u1'))?.groups).toEqual(['mixed', employeesGroupId]);
    expect((await Users.findOneAsync('u2'))?.groups).toEqual(['mixed', 'karkuns', employeesGroupId]);
    expect(await UserGroups.find({ moduleName: 'HR' }).countAsync()).toBe(0);
  });

  it('points people tags tagged for HR at both modules', async () => {
    await seed();
    await splitHrModule();

    expect((await PeopleTags.findOneAsync('t1'))?.moduleNames).toEqual([
      ModuleNames.hrKarkuns,
      ModuleNames.hrEmployees,
      'Security',
    ]);
  });

  it('changes nothing when run again', async () => {
    await seed();
    await splitHrModule();
    const groupsBefore = await UserGroups.find({}, { sort: { _id: 1 } }).fetchAsync();
    const result = await splitHrModule();

    expect(result).toEqual({ users: 0, groups: 0, committees: 0, hrGroups: 0, tags: 0 });
    expect(await UserGroups.find({}, { sort: { _id: 1 } }).fetchAsync()).toEqual(groupsBefore);
  });
});
