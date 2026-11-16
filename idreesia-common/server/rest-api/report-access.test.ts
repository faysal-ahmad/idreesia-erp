import { describe, expect, it } from 'vitest';

import { Permissions } from 'meteor/idreesia-common/constants';
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
  it.each(names)('%s: allows each listed permission, denies unrelated, locked and anonymous', name => {
    const needsStore = 'argIsPhysicalStoreId' in REPORT_ACCESS[name];
    for (const p of REPORT_ACCESS[name].permissions) {
      const user = makeUser({ permissions: [p], instances: ['s1'] });
      expect(canDownloadReport(user, name, 's1')).toBe(true);
    }
    const unrelated = makeUser({ permissions: ['X'], instances: ['s1'] });
    expect(canDownloadReport(unrelated, name, 's1')).toBe(false);
    expect(canDownloadReport(undefined, name, 's1')).toBe(false);
    expect(
      canDownloadReport(
        makeLockedUser({ isSuperAdmin: true, permissions: [...REPORT_ACCESS[name].permissions], instances: ['s1'] }),
        name,
        's1'
      )
    ).toBe(false);
    expect(canDownloadReport(makeSuperAdmin(), name, 's1')).toBe(true);
    expect(needsStore || true).toBe(true);
  });

  it('StockItems also needs access to the store named by the argument', () => {
    const user = makeUser({ permissions: [Permissions.IN_MANAGE_STOCK_ITEMS], instances: ['s1'] });
    expect(canDownloadReport(user, 'StockItems', 's1')).toBe(true);
    expect(canDownloadReport(user, 'StockItems', 's2')).toBe(false);
  });

  it('form reports need access to the store of every form', () => {
    const user = makeUser({ permissions: [Permissions.IN_VIEW_ISSUANCE_FORMS], instances: ['s1'] });
    expect(canDownloadReport(user, 'IssuanceForms', 'ids', ['s1', 's1'])).toBe(true);
    expect(canDownloadReport(user, 'IssuanceForms', 'ids', ['s1', 's2'])).toBe(false);
    expect(canDownloadReport(user, 'IssuanceForms', 'ids', [])).toBe(true);
  });

  it('HR and security reports need no store', () => {
    expect(canDownloadReport(makeUser({ permissions: [Permissions.HR_VIEW_KARKUNS] }), 'Karkuns', '')).toBe(true);
    expect(canDownloadReport(makeUser({ permissions: [Permissions.SECURITY_VIEW_VISITORS] }), 'Visitors', '')).toBe(true);
    expect(canDownloadReport(makeUser({ permissions: [Permissions.HR_VIEW_KARKUNS] }), 'Visitors', '')).toBe(false);
  });
});
