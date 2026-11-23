import Permissions from '../permissions';

export interface SecurityPermissionInfo {
  /** The permission string, e.g. "security-view-visitors". */
  key: string;
  name: string;
  description: string;
}

export interface SecurityPermissionGroup {
  featureKey: string;
  featureName: string;
  permissions: SecurityPermissionInfo[];
}

/**
 * The Security permissions, grouped as the Permissions page shows them. Keep
 * it in step with `SecurityPermissionsData` in the Admin permission picker.
 */
const SecurityPermissionCatalog: SecurityPermissionGroup[] = [
  {
    featureKey: 'visitors',
    featureName: 'Visitors',
    permissions: [
      { key: Permissions.SECURITY_VIEW_VISITORS, name: 'View Visitors', description: 'See visitors and visitor stays' },
      { key: Permissions.SECURITY_MANAGE_VISITORS, name: 'Manage Visitors', description: 'Register and manage visitors and their stays' },
      { key: Permissions.SECURITY_VIEW_KARKUN_VERIFICATION, name: 'View Karkun Verification', description: 'Verify mehfil cards of karkuns' },
    ],
  },
  {
    featureKey: 'mehfils',
    featureName: 'Mehfils',
    permissions: [
      { key: Permissions.SECURITY_VIEW_MEHFILS, name: 'View Mehfils', description: 'See mehfils' },
      { key: Permissions.SECURITY_MANAGE_MEHFILS, name: 'Manage Mehfils', description: 'Add and manage mehfils, their karkuns and duties' },
    ],
  },
  {
    featureKey: 'security-server',
    featureName: 'Security Server',
    permissions: [
      { key: Permissions.SECURITY_VIEW_SECURITY_SERVER_DATA, name: 'View Security Server Data', description: 'See alerts, profiles, channels and usage' },
      { key: Permissions.SECURITY_MANAGE_SECURITY_SERVER_DATA, name: 'Manage Security Server Data', description: 'Manage security server profiles and channels' },
      { key: Permissions.SECURITY_SYNC_SECURITY_SERVER_DATA, name: 'Sync Security Server Data', description: 'Sync data with the security server' },
    ],
  },
  {
    featureKey: 'administration',
    featureName: 'Administration',
    permissions: [
      { key: Permissions.SECURITY_MANAGE_SETUP_DATA, name: 'Manage Setup Data', description: 'Manage Security setup data' },
      { key: Permissions.SECURITY_VIEW_AUDIT_LOGS, name: 'View Audit Logs', description: 'The Audit Logs page' },
      { key: Permissions.SECURITY_MANAGE_PERMISSIONS, name: 'Manage Security Permissions', description: 'See who holds each Security permission, and add or remove users and groups' },
    ],
  },
];

export default SecurityPermissionCatalog;
