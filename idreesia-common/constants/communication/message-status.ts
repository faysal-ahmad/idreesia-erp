export const MessageStatus = {
  WAITING_APPROVAL: 'waiting-approval',
  APPROVED: 'approved',
  SENDING: 'sending',
  COMPLETED: 'completed',
  ERRORED: 'errored',
};

export const MessageStatusDescription = {
  [MessageStatus.WAITING_APPROVAL]: 'Waiting Approval',
  [MessageStatus.APPROVED]: 'Approved',
  [MessageStatus.SENDING]: 'Sending',
  [MessageStatus.COMPLETED]: 'Completed',
  [MessageStatus.ERRORED]: 'Errored',
};
