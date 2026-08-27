import path from 'node:path';
import { config as loadEnv } from 'dotenv';

// Load e2e/.env here, at the top of the module every other support/test file
// pulls credentials from - ES module imports execute before any top-level
// code in the *importing* file, so loading it in playwright.config.ts alone
// ran too late: this module's `?? 'default'` fallbacks had already resolved
// against an empty process.env by the time that later call fired.
loadEnv({ path: path.join(__dirname, '..', '.env') });

/**
 * Route paths mirrored from idreesia-common/constants/module-paths.ts and the
 * per-module SubModulePaths classes. Kept as plain strings here (rather than
 * importing the Meteor package) so the e2e suite has zero build-time
 * dependency on the Meteor app.
 */
export const ModulePaths = {
  admin: '/admin',
  stores: '/stores',
  hr: '/hr',
  security: '/security',
} as const;

export const AdminPaths = {
  users: `${ModulePaths.admin}/users`,
  usersNew: `${ModulePaths.admin}/users/new`,
  userGroups: `${ModulePaths.admin}/user-groups`,
  physicalStores: `${ModulePaths.admin}/physical-stores`,
  cities: `${ModulePaths.admin}/cities`,
  citiesNew: `${ModulePaths.admin}/cities/new`,
  peopleTags: `${ModulePaths.admin}/people-tags`,
  deletedPeople: `${ModulePaths.admin}/deleted-people`,
  jobs: `${ModulePaths.admin}/jobs`,
  jobLogs: `${ModulePaths.admin}/job-logs`,
  jobDefinitions: `${ModulePaths.admin}/job-definitions`,
} as const;

export const HrPaths = {
  jobs: `${ModulePaths.hr}/jobs`,
  msDuties: `${ModulePaths.hr}/ms-duties`,
  dutyLocations: `${ModulePaths.hr}/duty-locations`,
  employees: `${ModulePaths.hr}/employees`,
  karkuns: `${ModulePaths.hr}/karkuns`,
  attendanceSheets: `${ModulePaths.hr}/attendance-sheets`,
  salarySheets: `${ModulePaths.hr}/salary-sheets`,
  auditLogs: `${ModulePaths.hr}/audit-logs`,
} as const;

export const SecurityPaths = {
  mehfils: `${ModulePaths.security}/mehfils`,
  mehfilDuties: `${ModulePaths.security}/mehfil-duties`,
  mehfilLangarDishes: `${ModulePaths.security}/mehfil-langar-dishes`,
  mehfilLangarLocations: `${ModulePaths.security}/mehfil-langar-locations`,
  mehfilCardVerification: `${ModulePaths.security}/mehfil-card-verification`,
  visitorCardVerification: `${ModulePaths.security}/visitor-card-verification`,
  visitorStayReport: `${ModulePaths.security}/visitor-stay-report`,
  visitorRegistrationList: `${ModulePaths.security}/visitor-registration/list`,
  securityUsers: `${ModulePaths.security}/security-users`,
  auditLogs: `${ModulePaths.security}/audit-logs`,
} as const;

/**
 * Seeded by idreesia-web/imports/startup/server/migrations/1-create-admin-user.ts
 * on a fresh dev database. Overridable via env vars for other environments.
 */
export const AdminCredentials = {
  userName: process.env.E2E_ADMIN_USERNAME ?? 'erp-admin',
  password: process.env.E2E_ADMIN_PASSWORD ?? 'p@ssw0rd',
};

export const AUTH_STORAGE_STATE = 'e2e/.auth/admin.json';
