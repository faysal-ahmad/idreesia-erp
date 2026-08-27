import { test } from '@playwright/test';
import { AdminPaths, HrPaths, SecurityPaths, ModulePaths } from '../support/constants';
import { expectBreadcrumb, expectPageLoaded } from '../support/list-page';

/**
 * Broad, shallow regression net: every top-level module and submodule list
 * page should load for an admin user without a stuck spinner or a crashed
 * error boundary, and its breadcrumb trail should match what the module
 * renders. This is deliberately not asserting on table contents (that is
 * covered by the module-specific specs) - it exists to catch route/import/
 * GraphQL-wiring regressions across the whole app cheaply.
 */
const pages: Array<{ path: string; breadcrumbs: string[] }> = [
  { path: AdminPaths.users, breadcrumbs: ['Admin', 'Users', 'List'] },
  { path: AdminPaths.userGroups, breadcrumbs: ['Admin', 'User Groups', 'List'] },
  { path: AdminPaths.physicalStores, breadcrumbs: ['Admin', 'Setup', 'Physical Stores', 'List'] },
  { path: AdminPaths.cities, breadcrumbs: ['Admin', 'Locations Management', 'Cities & Mehfils', 'List'] },
  { path: AdminPaths.peopleTags, breadcrumbs: ['Admin', 'People Tags'] },
  { path: AdminPaths.deletedPeople, breadcrumbs: ['Admin', 'Deleted Data', 'People'] },
  { path: AdminPaths.jobDefinitions, breadcrumbs: ['Admin', 'Scheduled Jobs', 'Job Definitions'] },
  { path: AdminPaths.jobs, breadcrumbs: ['Admin', 'Scheduled Jobs', 'Jobs Dashboard'] },
  { path: AdminPaths.jobLogs, breadcrumbs: ['Admin', 'Scheduled Jobs', 'Job Logs'] },

  { path: HrPaths.karkuns, breadcrumbs: ['HR', 'Karkuns', 'List'] },
  { path: HrPaths.employees, breadcrumbs: ['HR', 'Employees', 'List'] },
  { path: HrPaths.msDuties, breadcrumbs: ['HR', 'Duties & Shifts'] },
  { path: HrPaths.dutyLocations, breadcrumbs: ['HR', 'Duty Locations'] },
  { path: HrPaths.attendanceSheets, breadcrumbs: ['HR', 'Attendance Sheets', 'List'] },
  { path: HrPaths.salarySheets, breadcrumbs: ['HR', 'Salary Sheets', 'List'] },
  { path: HrPaths.auditLogs, breadcrumbs: ['HR', 'Audit Logs', 'List'] },

  { path: SecurityPaths.mehfils, breadcrumbs: ['Security', 'Mehfils'] },
  { path: SecurityPaths.mehfilDuties, breadcrumbs: ['Security', 'Mehfil Duties'] },
  { path: SecurityPaths.mehfilLangarDishes, breadcrumbs: ['Security', 'Langar Dishes'] },
  { path: SecurityPaths.mehfilLangarLocations, breadcrumbs: ['Security', 'Langar Locations'] },
  { path: SecurityPaths.visitorRegistrationList, breadcrumbs: ['Security', 'Visitor Registration', 'List'] },
  { path: SecurityPaths.visitorStayReport, breadcrumbs: ['Security', "Visitor's Stay Report"] },
  { path: SecurityPaths.securityUsers, breadcrumbs: ['Security', 'User Accounts', 'List'] },
  { path: SecurityPaths.auditLogs, breadcrumbs: ['Security', 'Audit Logs', 'List'] },
];

test.describe('Navigation smoke test', () => {
  for (const { path, breadcrumbs } of pages) {
    test(`loads ${path}`, async ({ page }) => {
      await page.goto(path);
      await expectPageLoaded(page);
      await expectBreadcrumb(page, ...breadcrumbs);
    });
  }

  test('stores module offers a physical store selector', async ({ page }) => {
    await page.goto(ModulePaths.stores);
    await expectPageLoaded(page);
  });
});
