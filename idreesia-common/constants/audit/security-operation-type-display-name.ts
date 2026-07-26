import SecurityOperationType from './security-operation-type';

const SecurityOperationTypeDisplayName = {
  [SecurityOperationType.ACCOUNT_CREATED]: 'Account Created',
  [SecurityOperationType.ACCOUNT_LOCKED]: 'Account Locked',
  [SecurityOperationType.ACCOUNT_UNLOCKED]: 'Account Unlocked',
  [SecurityOperationType.PASSWORD_RESET]: 'Password Reset',
  [SecurityOperationType.PERMISSIONS_CHANGED]: 'Permissions Changed',
  [SecurityOperationType.INSTANCE_ACCESS_CHANGED]: 'Instance Access Changed',
  [SecurityOperationType.INVALID_LOGIN_ATTEMPT]: 'Invalid Login Attempt',
  [SecurityOperationType.LOGIN]: 'Login to System',
};

export default SecurityOperationTypeDisplayName;
