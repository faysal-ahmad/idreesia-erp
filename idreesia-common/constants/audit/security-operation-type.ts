const SecurityOperationType = {
  ACCOUNT_CREATED: 'account-created',
  ACCOUNT_LOCKED: 'account-locked',
  ACCOUNT_UNLOCKED: 'account-unlocked',
  PASSWORD_RESET: 'password-reset',
  PERMISSIONS_CHANGED: 'permissions-changed',
  INSTANCE_ACCESS_CHANGED: 'instance-access-changed',
  GROUPS_CHANGED: 'groups-changed',
  CHAT_ACCOUNT_CREATED: 'chat-account-created',
  TWO_FACTOR_ENABLED: 'two-factor-enabled',
  TWO_FACTOR_DISABLED: 'two-factor-disabled',
  TWO_FACTOR_RESET: 'two-factor-reset',
  SUPER_ADMIN_GRANTED: 'super-admin-granted',
  SUPER_ADMIN_REVOKED: 'super-admin-revoked',
  LOGIN_BLOCKS_CLEARED: 'login-blocks-cleared',
  TRUSTED_DEVICE_ENROLLED: 'trusted-device-enrolled',
  TRUSTED_DEVICE_REMOVED: 'trusted-device-removed',
  TRUSTED_DEVICE_REVOKED: 'trusted-device-revoked',

  LOGIN: 'login',
  INVALID_LOGIN_ATTEMPT: 'invalid-login-attempt',
};

export default SecurityOperationType;
