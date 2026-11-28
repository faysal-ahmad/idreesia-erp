const EntityType = {
  USER: 'user',
  PERSON: 'person',
  // A person's own data changes are logged against PERSON; changes to their
  // karkun, employee or visitor data against KARKUN, EMPLOYEE or VISITOR.
  KARKUN: 'karkun',
  EMPLOYEE: 'employee',
  VISITOR: 'visitor',
  PAYMENT: 'payment',
  SCHEDULED_JOB: 'scheduled-job',
  JOB_DEFINITION: 'job-definition',
  PURCHASING_VENDOR: 'purchasing-vendor',
  PURCHASING_CATALOG_ITEM: 'purchasing-catalog-item',
  PURCHASING_REQUISITION: 'purchasing-requisition',
  PURCHASING_QUOTE: 'purchasing-quote',
  PURCHASING_ORDER: 'purchasing-order',
  PURCHASING_RECEIPT: 'purchasing-receipt',
  PURCHASING_INVOICE: 'purchasing-invoice',
  PURCHASING_PAYMENT: 'purchasing-payment',
  PURCHASING_ATTACHMENT: 'purchasing-attachment',
  PURCHASING_PETTY_CASH_FUND: 'purchasing-petty-cash-fund',
  PURCHASING_PETTY_CASH_EXPENSE_HEAD: 'purchasing-petty-cash-expense-head',
  PURCHASING_PETTY_CASH_VOUCHER: 'purchasing-petty-cash-voucher',
  PURCHASING_PETTY_CASH_REPLENISHMENT: 'purchasing-petty-cash-replenishment',
  HR_JOB_SHIFT: 'hr-job-shift',
  HR_EMPLOYMENT_EVENT: 'hr-employment-event',
  HR_LEAVE_TYPE: 'hr-leave-type',
  HR_LEAVE_REQUEST: 'hr-leave-request',
  HR_LEAVE_ADJUSTMENT: 'hr-leave-adjustment',
};

export default EntityType;
