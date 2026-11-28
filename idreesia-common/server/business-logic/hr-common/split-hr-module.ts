import { ModuleNames } from 'meteor/idreesia-common/constants';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import {
  Committees,
  PeopleTags,
  UserGroups,
  Users,
} from 'meteor/idreesia-common/server/collections/admin';
import { escapeRegExp } from 'meteor/idreesia-common/utilities/lodash';

/*
 * One-off data change for splitting the HR module into HR - Karkuns and
 * HR - Employees (run by migration 10). The strings are spelled out here, not
 * taken from Permissions, because they describe stored data at the time of
 * the split.
 */

/** Each old HR permission and what it becomes. */
export const HR_PERMISSION_RENAMES: Record<string, string[]> = {
  'hr-view-karkuns': ['hr-karkuns-view'],
  'hr-manage-karkuns': ['hr-karkuns-manage'],
  'hr-manage-karkuns-setup-data': ['hr-karkuns-manage-setup-data'],
  'hr-view-employees': ['hr-employees-view'],
  'hr-manage-employees': ['hr-employees-manage'],
  'hr-manage-employees-setup-data': ['hr-employees-manage-setup-data'],
  'hr-view-leaves': ['hr-employees-view-leaves'],
  'hr-manage-leaves': ['hr-employees-manage-leaves'],
  'hr-approve-leaves': ['hr-employees-approve-leaves'],
  // The shared administration permissions become one per module.
  'hr-view-audit-logs': ['hr-karkuns-view-audit-logs', 'hr-employees-view-audit-logs'],
  'hr-manage-permissions': ['hr-karkuns-manage-permissions', 'hr-employees-manage-permissions'],
};

const OLD_KEYS = Object.keys(HR_PERMISSION_RENAMES);
const OLD_MODULE_NAME = 'HR';
const KARKUNS_PREFIX = 'hr-karkuns-';
const EMPLOYEES_PREFIX = 'hr-employees-';

/** The permissions with every old HR permission replaced by its new ones. */
export const renameHrPermissions = (permissions: string[] = []) => [
  ...new Set(permissions.flatMap(key => HR_PERMISSION_RENAMES[key] ?? [key])),
];

interface PermissionHolders {
  find(selector: object): { fetchAsync(): Promise<any[]> };
  updateAsync(selector: string, modifier: object): Promise<unknown>;
}

async function renameIn(collection: PermissionHolders) {
  const docs = await collection.find({ permissions: { $in: OLD_KEYS } }).fetchAsync();
  for (const doc of docs) {
    await collection.updateAsync(doc._id, {
      $set: { permissions: renameHrPermissions(doc.permissions) },
    });
  }
  return docs.length;
}

/** A group name no other group uses (names are unique across modules). */
async function freeGroupName(name: string, exceptId?: string) {
  for (let n = 1; ; n += 1) {
    const candidate = n === 1 ? name : `${name} ${n}`;
    const clash = await UserGroups.findOneAsync({
      name: { $regex: new RegExp(`^${escapeRegExp(candidate)}$`, 'i') },
      ...(exceptId ? { _id: { $ne: exceptId } } : {}),
    });
    if (!clash) return candidate;
  }
}

/**
 * Moves an HR user group (its permissions already renamed) to the new
 * modules. A group with the permissions of one side moves to that module. A
 * group with both is split: it keeps the karkun side as "<name> (Karkuns)",
 * and a new "<name> (Employees)" group with the same members takes the
 * employee side. A group with neither moves to HR - Karkuns.
 */
async function rehomeGroup(groupId: string) {
  return runInTransaction(async () => {
    const group = await UserGroups.findOneAsync(groupId);
    if (!group) return;
    const permissions: string[] = group.permissions ?? [];
    const employeeKeys = permissions.filter(key => key.startsWith(EMPLOYEES_PREFIX));
    const karkunKeys = permissions.filter(key => key.startsWith(KARKUNS_PREFIX));

    if (employeeKeys.length === 0 || karkunKeys.length === 0) {
      await UserGroups.updateAsync(groupId, {
        $set: {
          moduleName:
            employeeKeys.length > 0 ? ModuleNames.hrEmployees : ModuleNames.hrKarkuns,
        },
      });
      return;
    }

    const now = new Date();
    await UserGroups.updateAsync(groupId, {
      $set: {
        moduleName: ModuleNames.hrKarkuns,
        name: await freeGroupName(`${group.name} (Karkuns)`, groupId),
        permissions: permissions.filter(key => !key.startsWith(EMPLOYEES_PREFIX)),
        updatedAt: now,
      },
    });
    const employeesGroupId = (await UserGroups.insertAsync({
      name: await freeGroupName(`${group.name} (Employees)`),
      moduleName: ModuleNames.hrEmployees,
      description: group.description,
      permissions: employeeKeys,
      createdAt: now,
      createdBy: group.createdBy,
      updatedAt: now,
      updatedBy: group.updatedBy,
    })) as string;
    const members = await Users.find({ groups: groupId }).fetchAsync();
    for (const member of members) {
      await Users.updateAsync(member._id as string, {
        $addToSet: { groups: employeesGroupId },
      });
    }
  });
}

/**
 * Renames the HR permissions held by users, groups and committees, moves the
 * HR user groups to the two new modules, and points people tags tagged for HR
 * at both modules.
 */
export async function splitHrModule() {
  const users = await renameIn(Users as unknown as PermissionHolders);
  const groups = await renameIn(UserGroups as unknown as PermissionHolders);
  const committees = await renameIn(Committees as unknown as PermissionHolders);

  const hrGroups = await UserGroups.find({ moduleName: OLD_MODULE_NAME }).fetchAsync();
  for (const group of hrGroups) {
    await rehomeGroup(group._id as string);
  }

  const tags = await PeopleTags.find({ moduleNames: OLD_MODULE_NAME }).fetchAsync();
  for (const tag of tags) {
    const moduleNames = (tag.moduleNames ?? []).flatMap((name: string) =>
      name === OLD_MODULE_NAME ? [ModuleNames.hrKarkuns, ModuleNames.hrEmployees] : [name]
    );
    await PeopleTags.updateAsync(tag._id as string, {
      $set: { moduleNames: [...new Set(moduleNames)] },
    });
  }

  return { users, groups, committees, hrGroups: hrGroups.length, tags: tags.length };
}
