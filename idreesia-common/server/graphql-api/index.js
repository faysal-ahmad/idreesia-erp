import { merge } from 'meteor/idreesia-common/utilities/lodash';

/**
 * Common Schema and Resolvers
 */
import AttachmentSchema from './common/attachment/attachment.graphql';
import AttachmentResolvers from './common/attachment/resolvers';

import AuditLogSchema from './common/audit-log/audit-log.graphql';
import AuditLogResolvers from './common/audit-log/resolvers';

import MessageSchema from './common/message/message.graphql';
import MessageResolvers from './common/message/resolvers';

import KarkunSchema from './common/karkun/karkun.graphql';
import KarkunResolvers from './common/karkun/resolvers';

import VisitorSchema from './common/visitor/visitor.graphql';
import VisitorResolvers from './common/visitor/resolvers';

import VisitorMulakaatSchema from './common/visitor-mulakaat/visitor-mulakaat.graphql';
import VisitorMulakaatResolvers from './common/visitor-mulakaat/resolvers';

import ImdadRequestSchema from './common/imdad-request/imdad-request.graphql';
import ImdadRequestResolvers from './common/imdad-request/resolvers';

/**
 * Schema and Resolvers for the Admin module
 */
import AdminJobSchema from './admin/admin-job/admin-job.graphql';
import AdminJobResolvers from './admin/admin-job/resolvers';

import UserSchema from './admin/user/user.graphql';
import UserResolvers from './admin/user/resolvers';

import UserGroupSchema from './admin/user-group/user-group.graphql';
import UserGroupResolvers from './admin/user-group/resolvers';

/**
 * Schema and Resolvers for the Security module
 */
import SecurityAuditLogSchema from './security/audit-log/audit-log.graphql';
import SecurityAuditLogResolvers from './security/audit-log/resolvers';

import MehfilSchema from './security/mehfil/mehfil.graphql';
import MehfilResolvers from './security/mehfil/resolvers';

import MehfilKarkunSchema from './security/mehfil-karkun/mehfil-karkun.graphql';
import MehfilKarkunResolvers from './security/mehfil-karkun/resolvers';

import SecurityVisitorSchema from './security/visitor/visitor.graphql';
import SecurityVisitorResolvers from './security/visitor/resolvers';

import VisitorStaySchema from './security/visitor-stay/visitor-stay.graphql';
import VisitorStayResolvers from './security/visitor-stay/resolvers';

import SecurityVisitorMulakaatSchema from './security/visitor-mulakaat/visitor-mulakaat.graphql';
import SecurityVisitorMulakaatResolvers from './security/visitor-mulakaat/resolvers';

/**
 * Schema and Resolvers for the Telephone Room module
 */
import TelephoneRoomVisitorSchema from './telephone-room/visitor/visitor.graphql';
import TelephoneRoomVisitorResolvers from './telephone-room/visitor/resolvers';

import TelephoneRoomVisitorMulakaatSchema from './telephone-room/visitor-mulakaat/visitor-mulakaat.graphql';
import TelephoneRoomVisitorMulakaatResolvers from './telephone-room/visitor-mulakaat/resolvers';

import TelephoneRoomImdadRequestSchema from './telephone-room/imdad-request/imdad-request.graphql';
import TelephoneRoomImdadRequestResolvers from './telephone-room/imdad-request/resolvers';

/**
 * Schema and Resolvers for the HR module
 */
import HRAuditLogSchema from './hr/audit-log/audit-log.graphql';
import HRAuditLogResolvers from './hr/audit-log/resolvers';

import DutyShiftSchema from './hr/duty-shift/duty-shift.graphql';
import DutyShiftResolvers from './hr/duty-shift/resolvers';

import DutySchema from './hr/duty/duty.graphql';
import DutyResolvers from './hr/duty/resolvers';

import DutyLocationSchema from './hr/duty-location/duty-location.graphql';
import DutyLocationResolvers from './hr/duty-location/resolvers';

import JobSchema from './hr/job/job.graphql';
import JobResolvers from './hr/job/resolvers';

import HRKarkunSchema from './hr/karkun/karkun.graphql';
import HRKarkunResolvers from './hr/karkun/resolvers';

import KarkunDutySchema from './hr/karkun-duties/karkun-duty.graphql';
import KarkunDutyResolvers from './hr/karkun-duties/resolvers';

import AttendanceSchema from './hr/attendance/attendance.graphql';
import AttendanceResolvers from './hr/attendance/resolvers';

import SalarySchema from './hr/salary/salary.graphql';
import SalaryResolvers from './hr/salary/resolvers';

import HrMessageSchema from './hr/message/message.graphql';
import HrMessageResolvers from './hr/message/resolvers';

import SharedResidenceSchema from './hr/shared-residence/shared-residence.graphql';
import SharedResidenceResolvers from './hr/shared-residence/resolvers';

/**
 * Schema and Resolvers for the Outstation module
 */
import CitySchema from './outstation/city/city.graphql';
import CityResolvers from './outstation/city/resolvers';

import CityMehfilSchema from './outstation/city-mehfil/city-mehfil.graphql';
import CityMehfilResolvers from './outstation/city-mehfil/resolvers';

import OutstationAuditLogSchema from './outstation/audit-log/audit-log.graphql';
import OutstationAuditLogResolvers from './outstation/audit-log/resolvers';

import OutstationMemberSchema from './outstation/member/member.graphql';
import OutstationMemberResolvers from './outstation/member/resolvers';

import OutstationKarkunSchema from './outstation/karkun/karkun.graphql';
import OutstationKarkunResolvers from './outstation/karkun/resolvers';

import OutstationKarkunDutySchema from './outstation/karkun-duties/karkun-duty.graphql';
import OutstationKarkunDutyResolvers from './outstation/karkun-duties/resolvers';

import OutstationAttendanceSchema from './outstation/attendance/attendance.graphql';
import OutstationAttendanceResolvers from './outstation/attendance/resolvers';

import OutstationAmaanatLogSchema from './outstation/amaanat-log/amaanat-log.graphql';
import OutstationAmaanatLogResolvers from './outstation/amaanat-log/resolvers';

import OutstationMessageSchema from './outstation/message/message.graphql';
import OutstationMessageResolvers from './outstation/message/resolvers';

/**
 * Schema and Resolvers for the Portals module
 */
import PortalSchema from './portals/portal/portal.graphql';
import PortalResolvers from './portals/portal/resolvers';

import PortalUserSchema from './portals/user/user.graphql';
import PortalUserResolvers from './portals/user/resolvers';

import PortalAuditLogSchema from './portals/audit-log/audit-log.graphql';
import PortalAuditLogResolvers from './portals/audit-log/resolvers';

import PortalKarkunSchema from './portals/karkun/karkun.graphql';
import PortalKarkunResolvers from './portals/karkun/resolvers';

import PortalKarkunDutySchema from './portals/karkun-duties/karkun-duty.graphql';
import PortalKarkunDutyResolvers from './portals/karkun-duties/resolvers';

import PortalMemberSchema from './portals/member/member.graphql';
import PortalMemberResolvers from './portals/member/resolvers';

import PortalAttendanceSchema from './portals/attendance/attendance.graphql';
import PortalAttendanceResolvers from './portals/attendance/resolvers';

import PortalAmaanatLogSchema from './portals/amaanat-log/amaanat-log.graphql';
import PortalAmaanatLogResolvers from './portals/amaanat-log/resolvers';

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

import AccountAuditLogSchema from './accounts/audit-log/audit-log.graphql';
import AccountAuditLogResolvers from './accounts/audit-log/resolvers';

import AccountHeadSchema from './accounts/account-head/account-head.graphql';
import AccountHeadResolvers from './accounts/account-head/resolvers';

import AccountMonthlyBalanceSchema from './accounts/account-monthly-balance/account-monthly-balance.graphql';
import AccountMonthlyBalanceResolvers from './accounts/account-monthly-balance/resolvers';

import VoucherSchema from './accounts/voucher/voucher.graphql';
import VoucherResolvers from './accounts/voucher/resolvers';

import VoucherDetailSchema from './accounts/voucher-detail/voucher-detail.graphql';
import VoucherDetailResolvers from './accounts/voucher-detail/resolvers';

import PaymentTypeSchema from './accounts/payment-type/payment-type.graphql';
import PaymentTypeResolvers from './accounts/payment-type/resolvers';

import PaymentSchema from './accounts/payment/payment.graphql';
import PaymentResolvers from './accounts/payment/resolvers';

/**
 * Schema and Resolvers for the Wazaif Management module
 */
import WazeefaSchema from './wazaif-management/wazeefa/wazeefa.graphql';
import WazeefaResolvers from './wazaif-management/wazeefa/resolvers';

const typeDefs = [
  AttachmentSchema,
  AuditLogSchema,
  MessageSchema,
  KarkunSchema,
  VisitorSchema,
  VisitorMulakaatSchema,
  ImdadRequestSchema,
  AdminJobSchema,
  UserSchema,
  UserGroupSchema,

  SecurityAuditLogSchema,
  MehfilSchema,
  MehfilKarkunSchema,
  SecurityVisitorSchema,
  VisitorStaySchema,
  SecurityVisitorMulakaatSchema,

  TelephoneRoomVisitorSchema,
  TelephoneRoomVisitorMulakaatSchema,
  TelephoneRoomImdadRequestSchema,

  HRAuditLogSchema,
  DutyShiftSchema,
  DutySchema,
  DutyLocationSchema,
  JobSchema,
  HRKarkunSchema,
  KarkunDutySchema,
  AttendanceSchema,
  SalarySchema,
  HrMessageSchema,
  SharedResidenceSchema,

  CitySchema,
  CityMehfilSchema,
  OutstationAuditLogSchema,
  OutstationMemberSchema,
  OutstationKarkunSchema,
  OutstationKarkunDutySchema,
  OutstationAttendanceSchema,
  OutstationAmaanatLogSchema,
  OutstationMessageSchema,

  PortalSchema,
  PortalUserSchema,
  PortalAuditLogSchema,
  PortalKarkunSchema,
  PortalKarkunDutySchema,
  PortalMemberSchema,
  PortalAttendanceSchema,
  PortalAmaanatLogSchema,

  CommonSchema,
  ItemCategorySchema,
  LocationSchema,
  VendorSchema,
  PhysicalStoreSchema,
  StockItemSchema,
  IssuanceFormSchema,
  PurchaseFormSchema,
  StockAdjustmentSchema,

  AccountAuditLogSchema,
  AccountHeadSchema,
  CompanySchema,
  VoucherSchema,
  VoucherDetailSchema,
  AccountMonthlyBalanceSchema,
  PaymentTypeSchema,
  PaymentSchema,

  WazeefaSchema,
];

const resolvers = merge(
  AttachmentResolvers,
  AuditLogResolvers,
  MessageResolvers,
  KarkunResolvers,
  VisitorResolvers,
  VisitorMulakaatResolvers,
  ImdadRequestResolvers,
  AdminJobResolvers,
  UserResolvers,
  UserGroupResolvers,

  SecurityAuditLogResolvers,
  MehfilResolvers,
  MehfilKarkunResolvers,
  SecurityVisitorResolvers,
  VisitorStayResolvers,
  SecurityVisitorMulakaatResolvers,

  TelephoneRoomVisitorResolvers,
  TelephoneRoomVisitorMulakaatResolvers,
  TelephoneRoomImdadRequestResolvers,

  HRAuditLogResolvers,
  DutyShiftResolvers,
  DutyResolvers,
  DutyLocationResolvers,
  JobResolvers,
  HRKarkunResolvers,
  KarkunDutyResolvers,
  AttendanceResolvers,
  SalaryResolvers,
  HrMessageResolvers,
  SharedResidenceResolvers,

  CityResolvers,
  CityMehfilResolvers,
  OutstationAuditLogResolvers,
  OutstationMemberResolvers,
  OutstationKarkunResolvers,
  OutstationKarkunDutyResolvers,
  OutstationAttendanceResolvers,
  OutstationAmaanatLogResolvers,
  OutstationMessageResolvers,

  PortalResolvers,
  PortalUserResolvers,
  PortalAuditLogResolvers,
  PortalKarkunResolvers,
  PortalKarkunDutyResolvers,
  PortalMemberResolvers,
  PortalAttendanceResolvers,
  PortalAmaanatLogResolvers,

  CommonResolvers,
  ItemCategoryResolvers,
  LocationResolvers,
  VendorResolvers,
  PhysicalStoreResolvers,
  StockItemResolvers,
  IssuanceFormResolvers,
  PurchaseFormResolvers,
  StockAdjustmentResolvers,

  AccountAuditLogResolvers,
  AccountHeadResolvers,
  CompanyResolvers,
  VoucherResolvers,
  VoucherDetailResolvers,
  AccountMonthlyBalanceResolvers,
  PaymentTypeResolvers,
  PaymentResolvers,

  WazeefaResolvers
);

export { typeDefs, resolvers };
