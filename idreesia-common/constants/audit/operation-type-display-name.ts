import OperationType from './operation-type';

const OperationTypeDisplayName = {
  [OperationType.CREATE]: 'Created',
  [OperationType.UPDATE]: 'Updated',
  [OperationType.DELETE]: 'Deleted',

  [OperationType.JOB_RUN_NOW]: 'Run Now',
  [OperationType.JOB_RETRY]: 'Retried',
  [OperationType.JOB_ENABLED]: 'Enabled',
  [OperationType.JOB_DISABLED]: 'Disabled',
  [OperationType.JOB_SCHEDULE_UPDATED]: 'Schedule Updated',
};

export default OperationTypeDisplayName;
