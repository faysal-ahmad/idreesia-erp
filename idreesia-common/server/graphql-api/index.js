import { merge } from 'meteor/idreesia-common/utilities/lodash';

/**
 * Common Schema and Resolvers
 */
import AttachmentSchema from './common/attachments/attachment.graphql';
import AttachmentResolvers from './common/attachments/resolvers';

/**
 * Schema and Resolvers for the Admin module
 */
import AdminJobSchema from './admin/admin-job/admin-job.graphql';
import AdminJobResolvers from './admin/admin-job/resolvers';

/**
 * Schema and Resolvers for the Security module
 */
import VisitorSchema from './security/visitor/visitor.graphql';
import VisitorResolvers from './security/visitor/resolvers';

import VisitorStaySchema from './security/visitor-stay/visitor-stay.graphql';
import VisitorStayResolvers from './security/visitor-stay/resolvers';

/**
 * Schema and Resolvers for the HR module
 */
import DutyShiftSchema from './hr/duty-shift/duty-shift.graphql';
import DutyShiftResolvers from './hr/duty-shift/resolvers';

import DutySchema from './hr/duty/duty.graphql';
import DutyResolvers from './hr/duty/resolvers';

import DutyLocationSchema from './hr/duty-location/duty-location.graphql';
import DutyLocationResolvers from './hr/duty-location/resolvers';

import JobSchema from './hr/job/job.graphql';
import JobResolvers from './hr/job/resolvers';

import KarkunSchema from './hr/karkuns/karkun.graphql';
import KarkunResolvers from './hr/karkuns/resolvers';

import KarkunDutySchema from './hr/karkun-duties/karkun-duty.graphql';
import KarkunDutyResolvers from './hr/karkun-duties/resolvers';

import AttendanceSchema from './hr/attendance/attendance.graphql';
import AttendanceResolvers from './hr/attendance/resolvers';

import SalarySchema from './hr/salary/salary.graphql';
import SalaryResolvers from './hr/salary/resolvers';

import SharedResidenceSchema from './hr/shared-residence/shared-residence.graphql';
import SharedResidenceResolvers from './hr/shared-residence/resolvers';

/**
 * Schema and Resolvers for the Inventory module
 */
import CommonSchema from './inventory/common/common.graphql';
import CommonResolvers from './inventory/common/resolvers';

import ItemCategorySchema from './inventory/item-category/item-category.graphql';
import ItemCategoryResolvers from './inventory/item-category/resolvers';

import LocationSchema from './inventory/location/location.graphql';
import LocationResolvers from './inventory/location/resolvers';

import VendorSchema from './inventory/vendor/vendor.graphql';
import VendorResolvers from './inventory/vendor/resolvers';

import PhysicalStoreSchema from './inventory/physical-store/physical-store.graphql';
import PhysicalStoreResolvers from './inventory/physical-store/resolvers';

import StockItemSchema from './inventory/stock-item/stock-item.graphql';
import StockItemResolvers from './inventory/stock-item/resolvers';

import IssuanceFormSchema from './inventory/issuance-form/issuance-form.graphql';
import IssuanceFormResolvers from './inventory/issuance-form/resolvers';

import PurchaseFormSchema from './inventory/purchase-form/purchase-form.graphql';
import PurchaseFormResolvers from './inventory/purchase-form/resolvers';

import StockAdjustmentSchema from './inventory/stock-adjustment/stock-adjustment.graphql';
import StockAdjustmentResolvers from './inventory/stock-adjustment/resolvers';

/**
 * Schema and Resolvers for the Accounts module
 */
import CompanySchema from './accounts/company/company.graphql';
import CompanyResolvers from './accounts/company/resolvers';

import AccountHeadSchema from './accounts/account-head/account-head.graphql';
import AccountHeadResolvers from './accounts/account-head/resolvers';

import AccountMonthlyBalanceSchema from './accounts/account-monthly-balance/account-monthly-balance.graphql';
import AccountMonthlyBalanceResolvers from './accounts/account-monthly-balance/resolvers';

import VoucherSchema from './accounts/voucher/voucher.graphql';
import VoucherResolvers from './accounts/voucher/resolvers';

import VoucherDetailSchema from './accounts/voucher-detail/voucher-detail.graphql';
import VoucherDetailResolvers from './accounts/voucher-detail/resolvers';

import AmaanatLogSchema from './accounts/amaanat-log/amaanat-log.graphql';
import AmaanatLogResolvers from './accounts/amaanat-log/resolvers';

import PaymentsSchema from './accounts/payments/payment.graphql';
import PaymentsResolvers from './accounts/payments/resolvers';

const typeDefs = [
  AttachmentSchema,
  AdminJobSchema,

  VisitorSchema,
  VisitorStaySchema,

  DutyShiftSchema,
  DutySchema,
  DutyLocationSchema,
  JobSchema,
  KarkunSchema,
  KarkunDutySchema,
  AttendanceSchema,
  SalarySchema,
  SharedResidenceSchema,

  CommonSchema,
  ItemCategorySchema,
  LocationSchema,
  VendorSchema,
  PhysicalStoreSchema,
  StockItemSchema,
  IssuanceFormSchema,
  PurchaseFormSchema,
  StockAdjustmentSchema,

  AccountHeadSchema,
  CompanySchema,
  VoucherSchema,
  VoucherDetailSchema,
  AccountMonthlyBalanceSchema,
  AmaanatLogSchema,
  PaymentsSchema,
];

const resolvers = merge(
  AttachmentResolvers,
  AdminJobResolvers,

  VisitorResolvers,
  VisitorStayResolvers,

  DutyShiftResolvers,
  DutyResolvers,
  DutyLocationResolvers,
  JobResolvers,
  KarkunResolvers,
  KarkunDutyResolvers,
  AttendanceResolvers,
  SalaryResolvers,
  SharedResidenceResolvers,

  CommonResolvers,
  ItemCategoryResolvers,
  LocationResolvers,
  VendorResolvers,
  PhysicalStoreResolvers,
  StockItemResolvers,
  IssuanceFormResolvers,
  PurchaseFormResolvers,
  StockAdjustmentResolvers,

  AccountHeadResolvers,
  CompanyResolvers,
  VoucherResolvers,
  VoucherDetailResolvers,
  AccountMonthlyBalanceResolvers,
  AmaanatLogResolvers,
  PaymentsResolvers
);

export { typeDefs, resolvers };
