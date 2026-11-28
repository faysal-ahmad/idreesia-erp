import Permissions from '../permissions';

export interface HrPermissionInfo {
  /** The permission string, e.g. "hr-karkuns-view". */
  key: string;
  name: string;
  description: string;
}

export interface HrPermissionGroup {
  featureKey: string;
  featureName: string;
  permissions: HrPermissionInfo[];
}

/*
 * The permissions of the two HR modules, grouped as each module's
 * Permissions page shows them. Keep them in step with
 * `HrKarkunsPermissionsData` and `HrEmployeesPermissionsData` in the Admin
 * permission picker.
 */

export const HrKarkunsPermissionCatalog: HrPermissionGroup[] = [
  {
    featureKey: 'karkuns',
    featureName: 'Karkuns',
    permissions: [
      { key: Permissions.HR_VIEW_KARKUNS, name: 'View Karkuns', description: 'See karkuns, their duties and attendance' },
      { key: Permissions.HR_MANAGE_KARKUNS, name: 'Manage Karkuns', description: 'Add, edit and manage karkuns' },
      { key: Permissions.HR_MANAGE_KARKUNS_SETUP_DATA, name: 'Manage Karkuns Setup Data', description: 'Manage duties, shifts, teams and other karkun setup data' },
    ],
  },
  {
    featureKey: 'administration',
    featureName: 'Administration',
    permissions: [
      { key: Permissions.HR_KARKUNS_VIEW_AUDIT_LOGS, name: 'View Audit Logs', description: 'The Audit Logs page' },
      { key: Permissions.HR_KARKUNS_MANAGE_PERMISSIONS, name: 'Manage Permissions', description: 'See who holds each HR - Karkuns permission, and add or remove users and groups' },
    ],
  },
];

export const HrEmployeesPermissionCatalog: HrPermissionGroup[] = [
  {
    featureKey: 'employees',
    featureName: 'Employees',
    permissions: [
      { key: Permissions.HR_VIEW_EMPLOYEES, name: 'View Employees', description: 'See employees and salary sheets' },
      { key: Permissions.HR_MANAGE_EMPLOYEES, name: 'Manage Employees', description: 'Add, edit and manage employees and salary sheets' },
      { key: Permissions.HR_MANAGE_EMPLOYEES_SETUP_DATA, name: 'Manage Employees Setup Data', description: 'Manage jobs, shifts, leave types and other employee setup data' },
    ],
  },
  {
    featureKey: 'leaves',
    featureName: 'Leaves',
    permissions: [
      { key: Permissions.HR_VIEW_LEAVES, name: 'View Leaves', description: 'See leave requests and balances' },
      { key: Permissions.HR_MANAGE_LEAVES, name: 'Manage Leaves', description: 'Enter and cancel leave requests, record whom HR checked with, and adjust balances' },
      { key: Permissions.HR_APPROVE_LEAVES, name: 'Approve Leaves', description: 'Approve or reject leave requests' },
    ],
  },
  {
    featureKey: 'administration',
    featureName: 'Administration',
    permissions: [
      { key: Permissions.HR_EMPLOYEES_VIEW_AUDIT_LOGS, name: 'View Audit Logs', description: 'The Audit Logs page' },
      { key: Permissions.HR_EMPLOYEES_MANAGE_PERMISSIONS, name: 'Manage Permissions', description: 'See who holds each HR - Employees permission, and add or remove users and groups' },
    ],
  },
];
