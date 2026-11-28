import { describe, expect, it } from 'vitest';

import { Permissions } from 'meteor/idreesia-common/constants';
import { PhysicalStoreAccess } from 'meteor/idreesia-common/server/collections/inventory';
import {
  makeLockedUser,
  makeSuperAdmin,
  makeUser,
} from 'meteor/idreesia-common/server/test-utils/fixtures';

import {
  asReportName,
  canDownloadReport,
  REPORT_ACCESS,
  type ReportName,
} from './report-access';

// The user holds the permissions on the store (store permissions are per store).
const grant = (userId: string, store: string, permissions: string[]) =>
  PhysicalStoreAccess.insertAsync({
    physicalStoreId: store,
    subjectType: 'user',
    subjectId: userId,
    permissions,
  });

const names = Object.keys(REPORT_ACCESS) as ReportName[];

describe('REPORT_ACCESS', () => {
  it('gives every report a non-empty list of real permissions', () => {
    const real = new Set(Object.values(Permissions));
    for (const name of names) {
      const { permissions } = REPORT_ACCESS[name];
      expect(permissions.length, name).toBeGreaterThan(0);
      for (const p of permissions) expect(real.has(p), `${name}: ${p}`).toBe(true);
    }
  });
});

describe('asReportName', () => {
  it('knows the reports and nothing else, including inherited keys', () => {
    expect(asReportName('Karkuns')).toBe('Karkuns');
    for (const bad of ['karkuns', 'toString', '__proto__', 'constructor', '', 1, undefined, null, ['Karkuns']]) {
      expect(asReportName(bad)).toBeUndefined();
    }
  });
});

describe('canDownloadReport', () => {
  it.each(names)('%s: allows each listed permission, denies unrelated, locked and anonymous', async name => {
    const { permissions } = REPORT_ACCESS[name];
    const onStore = 'storePermissions' in REPORT_ACCESS[name];
    for (const p of permissions) {
      const user = makeUser({ _id: `u-${p}`, permissions: onStore ? [] : [p] });
      if (onStore) await grant(user._id, 's1', [p]);
      expect(await canDownloadReport(user, name, 's1')).toBe(true);
    }
    const unrelated = makeUser({ _id: 'unrelated', permissions: ['X'] });
    await grant(unrelated._id, 's1', ['X']);
    expect(await canDownloadReport(unrelated, name, 's1')).toBe(false);
    expect(await canDownloadReport(makeUser({ _id: 'nobody' }), name, 's1')).toBe(false);
    const locked = makeLockedUser({
      _id: 'locked',
      isSuperAdmin: true,
      permissions: onStore ? [] : [...permissions],
    });
    await grant(locked._id, 's1', [...permissions]);
    expect(await canDownloadReport(locked, name, 's1')).toBe(false);
    expect(await canDownloadReport(makeSuperAdmin(), name, 's1')).toBe(true);
  });

  it('a store permission held globally, not on a store, does not count', async () => {
    const user = makeUser({ permissions: [Permissions.IN_VIEW_ISSUANCE_FORMS] });
    expect(await canDownloadReport(user, 'IssuanceForms', 'ids')).toBe(false);
  });

  it('StockItems needs the permission on the store named by the argument', async () => {
    const user = makeUser();
    await grant(user._id, 's1', [Permissions.IN_MANAGE_STOCK_ITEMS]);
    expect(await canDownloadReport(user, 'StockItems', 's1')).toBe(true);
    expect(await canDownloadReport(user, 'StockItems', 's2')).toBe(false);
  });

  it('form reports need the permission on the store of every form', async () => {
    const user = makeUser();
    await grant(user._id, 's1', [Permissions.IN_VIEW_ISSUANCE_FORMS]);
    expect(await canDownloadReport(user, 'IssuanceForms', 'ids', ['s1', 's1'])).toBe(true);
    expect(await canDownloadReport(user, 'IssuanceForms', 'ids', ['s1', 's2'])).toBe(false);
    // No form named: the permission on some store is enough.
    expect(await canDownloadReport(user, 'IssuanceForms', 'ids', [])).toBe(true);
  });

  it('keeps permissions per store: view on one store is not view on another', async () => {
    const user = makeUser();
    await grant(user._id, 's1', [Permissions.IN_VIEW_ISSUANCE_FORMS]);
    await grant(user._id, 's2', [Permissions.IN_VIEW_PURCHASE_FORMS]);
    expect(await canDownloadReport(user, 'IssuanceForms', 'ids', ['s1'])).toBe(true);
    expect(await canDownloadReport(user, 'IssuanceForms', 'ids', ['s2'])).toBe(false);
  });

  it('HR and security reports need no store', async () => {
    expect(await canDownloadReport(makeUser({ permissions: [Permissions.HR_VIEW_KARKUNS] }), 'Karkuns', '')).toBe(true);
    expect(await canDownloadReport(makeUser({ permissions: [Permissions.SECURITY_VIEW_VISITORS] }), 'Visitors', '')).toBe(true);
    expect(await canDownloadReport(makeUser({ permissions: [Permissions.HR_VIEW_KARKUNS] }), 'Visitors', '')).toBe(false);
  });

  it('the karkuns report is not open to the employee permissions', async () => {
    expect(await canDownloadReport(makeUser({ permissions: [Permissions.HR_VIEW_EMPLOYEES] }), 'Karkuns', '')).toBe(false);
    expect(await canDownloadReport(makeUser({ permissions: [Permissions.HR_MANAGE_EMPLOYEES] }), 'Karkuns', '')).toBe(false);
  });
});
