import Permissions from './permissions';

/**
 * The permissions a user or user group can hold on one physical store. They
 * are stored on the store's access entries (see PhysicalStoreAccess), not on
 * the user, so the same person can hold different permissions on different
 * stores.
 */
export interface StorePermissionInfo {
  key: string;
  /** The part of the Stores module the permission belongs to. */
  groupName: string;
  name: string;
}

export const StorePermissionInfos: StorePermissionInfo[] = [
  {
    key: Permissions.IN_MANAGE_SETUP_DATA,
    groupName: 'Setup Data',
    name: 'Manage Setup Data',
  },
  {
    key: Permissions.IN_MANAGE_STOCK_ITEMS,
    groupName: 'Stock Items',
    name: 'Manage Stock Items',
  },
  {
    key: Permissions.IN_VIEW_ISSUANCE_FORMS,
    groupName: 'Issuance Forms',
    name: 'View Issuance Forms',
  },
  {
    key: Permissions.IN_MANAGE_ISSUANCE_FORMS,
    groupName: 'Issuance Forms',
    name: 'Manage Issuance Forms',
  },
  {
    key: Permissions.IN_APPROVE_ISSUANCE_FORMS,
    groupName: 'Issuance Forms',
    name: 'Approve Issuance Forms',
  },
  {
    key: Permissions.IN_VIEW_PURCHASE_FORMS,
    groupName: 'Purchase Forms',
    name: 'View Purchase Forms',
  },
  {
    key: Permissions.IN_MANAGE_PURCHASE_FORMS,
    groupName: 'Purchase Forms',
    name: 'Manage Purchase Forms',
  },
  {
    key: Permissions.IN_APPROVE_PURCHASE_FORMS,
    groupName: 'Purchase Forms',
    name: 'Approve Purchase Forms',
  },
  {
    key: Permissions.IN_VIEW_STOCK_ADJUSTMENTS,
    groupName: 'Stock Adjustments',
    name: 'View Stock Adjustments',
  },
  {
    key: Permissions.IN_MANAGE_STOCK_ADJUSTMENTS,
    groupName: 'Stock Adjustments',
    name: 'Manage Stock Adjustments',
  },
  {
    key: Permissions.IN_APPROVE_STOCK_ADJUSTMENTS,
    groupName: 'Stock Adjustments',
    name: 'Approve Stock Adjustments',
  },
];

export const StorePermissionValues: string[] = StorePermissionInfos.map(
  info => info.key
);

export const isStorePermission = (value: string): boolean =>
  StorePermissionValues.includes(value);

export type StoreAccessSubjectType = 'user' | 'group';
export const StoreAccessSubjectTypes: StoreAccessSubjectType[] = [
  'user',
  'group',
];
