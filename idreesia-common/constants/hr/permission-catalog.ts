import Permissions from '../permissions';

export interface HrPermissionInfo {
  /** The permission string, e.g. "hr-view-karkuns". */
  key: string;
  name: string;
  description: string;
}

export interface HrPermissionGroup {
  featureKey: string;
  featureName: string;
  permissions: HrPermissionInfo[];
}

/**
 * The HR permissions, grouped as the Permissions page shows them. Keep it in
 * step with `HrPermissionsData` in the Admin permission picker.
 */
const HrPermissionCatalog: HrPermissionGroup[] = [
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
    featureKey: 'employees',
    featureName: 'Employees',
    permissions: [
      { key: Permissions.HR_VIEW_EMPLOYEES, name: 'View Employees', description: 'See employees and salary sheets' },
      { key: Permissions.HR_MANAGE_EMPLOYEES, name: 'Manage Employees', description: 'Add, edit and manage employees and salary sheets' },
      { key: Permissions.HR_MANAGE_EMPLOYEES_SETUP_DATA, name: 'Manage Employees Setup Data', description: 'Manage jobs and other employee setup data' },
    ],
  },
  {
    featureKey: 'administration',
    featureName: 'Administration',
    permissions: [
      { key: Permissions.HR_VIEW_AUDIT_LOGS, name: 'View Audit Logs', description: 'The Audit Logs page' },
      { key: Permissions.HR_MANAGE_PERMISSIONS, name: 'Manage HR Permissions', description: 'See who holds each HR permission, and add or remove users and groups' },
    ],
  },
];

export default HrPermissionCatalog;
