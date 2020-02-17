export const MessageStatus = {
  WAITING_APPROVAL: 'waiting-approval',
  APPROVED: 'approved',
  SENDING: 'sending',
  SENT: 'sent',
  ERRORED: 'errored',
};

export const MessageStatusDescription = {
  [MessageStatus.WAITING_APPROVAL]: 'Waiting Approval',
  [MessageStatus.APPROVED]: 'Approved',
  [MessageStatus.SENDING]: 'Sending',
  [MessageStatus.SENT]: 'Sent',
  [MessageStatus.ERRORED]: 'Errored',
};
