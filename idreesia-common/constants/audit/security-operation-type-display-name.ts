import SecurityOperationType from './security-operation-type';

const SecurityOperationTypeDisplayName = {
  [SecurityOperationType.ACCOUNT_CREATED]: 'Account Created',
  [SecurityOperationType.ACCOUNT_LOCKED]: 'Account Locked',
  [SecurityOperationType.ACCOUNT_UNLOCKED]: 'Account Unlocked',
  [SecurityOperationType.PASSWORD_RESET]: 'Password Reset',
  [SecurityOperationType.PERMISSIONS_CHANGED]: 'Permissions Changed',
  [SecurityOperationType.INSTANCE_ACCESS_CHANGED]: 'Instance Access Changed',
  [SecurityOperationType.GROUPS_CHANGED]: 'Groups Changed',
  [SecurityOperationType.CHAT_ACCOUNT_CREATED]: 'Chat Account Created',
  [SecurityOperationType.TWO_FACTOR_ENABLED]: 'Two-Factor Enabled',
  [SecurityOperationType.TWO_FACTOR_DISABLED]: 'Two-Factor Disabled',
  [SecurityOperationType.TWO_FACTOR_RESET]: 'Two-Factor Reset',
  [SecurityOperationType.SUPER_ADMIN_GRANTED]: 'Super Admin Granted',
  [SecurityOperationType.SUPER_ADMIN_REVOKED]: 'Super Admin Revoked',
  [SecurityOperationType.LOGIN_BLOCKS_CLEARED]: 'Login Blocks Cleared',
  [SecurityOperationType.TRUSTED_DEVICE_ENROLLED]: 'Trusted Device Enrolled',
  [SecurityOperationType.TRUSTED_DEVICE_REMOVED]: 'Trusted Device Removed',
  [SecurityOperationType.TRUSTED_DEVICE_REVOKED]: 'Trusted Device Revoked',
  [SecurityOperationType.INVALID_LOGIN_ATTEMPT]: 'Invalid Login Attempt',
  [SecurityOperationType.LOGIN]: 'Login to System',
};

export default SecurityOperationTypeDisplayName;
