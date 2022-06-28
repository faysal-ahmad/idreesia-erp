import { merge } from 'meteor/idreesia-common/utilities/lodash';

/**
 * Custom Directives
 */
import Permission from './_directives/permission.graphql';
import CheckPermissionsDirective from './_directives/check-permissions.graphql';
import CheckInstanceAccessDirective from './_directives/check-instance-access.graphql';

import ExternalTypes from './_external-types/external-types.graphql';
import ExternalTypeResolvers from './_external-types/resolvers';

/**
 * Common Schema and Resolvers
 */
import AttachmentSchema from './common/attachment/attachment.graphql';
import AttachmentResolvers from './common/attachment/resolvers';

import AuditLogSchema from './common/audit-log/audit-log.graphql';
import AuditLogResolvers from './common/audit-log/resolvers';

import SecurityLogSchema from './common/security-log/security-log.graphql';
import SecurityLogResolvers from './common/security-log/resolvers';

import ImdadRequestSchema from './common/imdad-request/imdad-request.graphql';
import ImdadRequestResolvers from './common/imdad-request/resolvers';

import KarkunSchema from './common/karkun/karkun.graphql';
import KarkunResolvers from './common/karkun/resolvers';

import MessageSchema from './common/message/message.graphql';
import MessageResolvers from './common/message/resolvers';

import PersonSchema from './common/person/person.graphql';
import PersonResolvers from './common/person/resolvers';

import VisitorSchema from './common/visitor/visitor.graphql';
import VisitorResolvers from './common/visitor/resolvers';

import WazeefaSchema from './common/wazeefa/wazeefa.graphql';
import WazeefaResolvers from './common/wazeefa/resolvers';

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

import SecurityMehfilSchema from './security/mehfil/mehfil.graphql';
import SecurityMehfilResolvers from './security/mehfil/resolvers';

import SecurityMehfilDutySchema from './security/mehfil-duty/mehfil-duty.graphql';
import SecurityMehfilDutyResolvers from './security/mehfil-duty/resolvers';

import SecurityMehfilKarkunSchema from './security/mehfil-karkun/mehfil-karkun.graphql';
import SecurityMehfilKarkunResolvers from './security/mehfil-karkun/resolvers';

import SecurityVisitorSchema from './security/visitor/visitor.graphql';
import SecurityVisitorResolvers from './security/visitor/resolvers';

import SecurityVisitorStaySchema from './security/visitor-stay/visitor-stay.graphql';
import SecurityVisitorStayResolvers from './security/visitor-stay/resolvers';

import SecuritySharedResidenceSchema from './security/shared-residence/shared-residence.graphql';
import SecuritySharedResidenceResolvers from './security/shared-residence/resolvers';

/**
 * Schema and Resolvers for the Operations module
 */
import OperationsVisitorSchema from './operations/visitor/visitor.graphql';
import OperationsVisitorResolvers from './operations/visitor/resolvers';

import OperationsMessageSchema from './operations/message/message.graphql';
import OperationsMessageResolvers from './operations/message/resolvers';

import OperationsWazeefaSchema from './operations/wazeefa/wazeefa.graphql';
import OperationsWazeefaResolvers from './operations/wazeefa/resolvers';

import ImdadReasonSchema from './operations/imdad-reason/imdad-reason.graphql';
import ImdadReasonResolvers from './operations/imdad-reason/resolvers';

import OperationsImdadRequestSchema from './operations/imdad-request/imdad-request.graphql';
import OperationsImdadRequestResolvers from './operations/imdad-request/resolvers';

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

import HRMessageSchema from './hr/message/message.graphql';
import HRMessageResolvers from './hr/message/resolvers';

/**
 * Schema and Resolvers for the Outstation module
 */
import PortalSchema from './outstation/portal/portal.graphql';
import PortalResolvers from './outstation/portal/resolvers';

import CitySchema from './outstation/city/city.graphql';
import CityResolvers from './outstation/city/resolvers';

import CityMehfilSchema from './outstation/city-mehfil/city-mehfil.graphql';
import CityMehfilResolvers from './outstation/city-mehfil/resolvers';

import MehfilDutySchema from './outstation/mehfil-duty/duty.graphql';
import MehfilDutyResolvers from './outstation/mehfil-duty/resolvers';

import OutstationAuditLogSchema from './outstation/audit-log/audit-log.graphql';
import OutstationAuditLogResolvers from './outstation/audit-log/resolvers';

import OutstationSecurityLogSchema from './outstation/security-log/security-log.graphql';
import OutstationSecurityLogResolvers from './outstation/security-log/resolvers';

import OutstationMemberSchema from './outstation/member/member.graphql';
import OutstationMemberResolvers from './outstation/member/resolvers';

import OutstationKarkunSchema from './outstation/karkun/karkun.graphql';
import OutstationKarkunResolvers from './outstation/karkun/resolvers';

import OutstationKarkunDutySchema from './outstation/karkun-duty/karkun-duty.graphql';
import OutstationKarkunDutyResolvers from './outstation/karkun-duty/resolvers';

import OutstationAttendanceSchema from './outstation/attendance/attendance.graphql';
import OutstationAttendanceResolvers from './outstation/attendance/resolvers';

import OutstationMessageSchema from './outstation/message/message.graphql';
import OutstationMessageResolvers from './outstation/message/resolvers';

import OutstationUserSchema from './outstation/outstation-user/outstation-user.graphql';
import OutstationUserResolvers from './outstation/outstation-user/resolvers';

import OutstationPortalUserSchema from './outstation/portal-user/portal-user.graphql';
import OutstationPortalUserResolvers from './outstation/portal-user/resolvers';

/**
 * Schema and Resolvers for the Portals module
 */
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

import AccountsAmaanatLogSchema from './accounts/amaanat-log/amaanat-log.graphql';
import AccountsAmaanatLogResolvers from './accounts/amaanat-log/resolvers';

const typeDefs = [
  Permission,
  CheckPermissionsDirective,
  CheckInstanceAccessDirective,
  ExternalTypes,

  AttachmentSchema,
  AuditLogSchema,
  SecurityLogSchema,
  ImdadRequestSchema,
  KarkunSchema,
  MessageSchema,
  PersonSchema,
  VisitorSchema,
  WazeefaSchema,
  AdminJobSchema,
  UserSchema,
  UserGroupSchema,

  SecurityAuditLogSchema,
  SecurityMehfilSchema,
  SecurityMehfilDutySchema,
  SecurityMehfilKarkunSchema,
  SecurityVisitorSchema,
  SecurityVisitorStaySchema,
  SecuritySharedResidenceSchema,

  OperationsVisitorSchema,
  OperationsMessageSchema,
  OperationsWazeefaSchema,
  OperationsImdadRequestSchema,

  HRAuditLogSchema,
  DutyShiftSchema,
  DutySchema,
  DutyLocationSchema,
  JobSchema,
  HRKarkunSchema,
  KarkunDutySchema,
  AttendanceSchema,
  SalarySchema,
  HRMessageSchema,

  PortalSchema,
  CitySchema,
  CityMehfilSchema,
  MehfilDutySchema,
  OutstationAuditLogSchema,
  OutstationSecurityLogSchema,
  OutstationMemberSchema,
  OutstationKarkunSchema,
  OutstationKarkunDutySchema,
  OutstationAttendanceSchema,
  OutstationMessageSchema,
  OutstationUserSchema,
  OutstationPortalUserSchema,

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
  ImdadReasonSchema,
  AccountMonthlyBalanceSchema,
  PaymentTypeSchema,
  PaymentSchema,
  AccountsAmaanatLogSchema,

  WazeefaSchema,
];

const resolvers = merge(
  ExternalTypeResolvers,

  AttachmentResolvers,
  AuditLogResolvers,
  SecurityLogResolvers,
  ImdadRequestResolvers,
  KarkunResolvers,
  MessageResolvers,
  PersonResolvers,
  VisitorResolvers,
  WazeefaResolvers,
  AdminJobResolvers,
  UserResolvers,
  UserGroupResolvers,

  SecurityAuditLogResolvers,
  SecurityMehfilResolvers,
  SecurityMehfilDutyResolvers,
  SecurityMehfilKarkunResolvers,
  SecurityVisitorResolvers,
  SecurityVisitorStayResolvers,
  SecuritySharedResidenceResolvers,

  OperationsVisitorResolvers,
  OperationsMessageResolvers,
  OperationsWazeefaResolvers,
  OperationsImdadRequestResolvers,

  HRAuditLogResolvers,
  DutyShiftResolvers,
  DutyResolvers,
  DutyLocationResolvers,
  JobResolvers,
  HRKarkunResolvers,
  KarkunDutyResolvers,
  AttendanceResolvers,
  SalaryResolvers,
  HRMessageResolvers,

  PortalResolvers,
  CityResolvers,
  CityMehfilResolvers,
  MehfilDutyResolvers,
  OutstationAuditLogResolvers,
  OutstationSecurityLogResolvers,
  OutstationMemberResolvers,
  OutstationKarkunResolvers,
  OutstationKarkunDutyResolvers,
  OutstationAttendanceResolvers,
  OutstationMessageResolvers,
  OutstationUserResolvers,
  OutstationPortalUserResolvers,

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
  ImdadReasonResolvers,
  AccountMonthlyBalanceResolvers,
  PaymentTypeResolvers,
  PaymentResolvers,
  AccountsAmaanatLogResolvers,

  WazeefaResolvers
);

export { typeDefs, resolvers };
