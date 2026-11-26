import { merge } from 'meteor/idreesia-common/utilities/lodash';

/**
 * Custom Directives
 */
import Permission from './_directives/permission';
import CheckPermissionsDirective from './_directives/check-permissions';
import CheckStoreAccessDirective from './_directives/check-store-access';
import CheckCommitteeAccessDirective from './_directives/check-committee-access';
import CheckDutiesAttendanceAccessDirective from './_directives/check-duties-attendance-access';
import CheckMehfilDetailsAccessDirective from './_directives/check-mehfil-details-access';
import CheckMehfilKarkunsAccessDirective from './_directives/check-mehfil-karkuns-access';
import CheckMehfilPermissionsAccessDirective from './_directives/check-mehfil-permissions-access';
import SuperAdminOnlyDirective from './_directives/super-admin-only';

import RootTypes from './_root-types/root-types';
import ExternalTypes from './_external-types/external-types';
import ExternalTypeResolvers from './_external-types/resolvers';

/**
 * Common Schema and Resolvers
 */
import AttachmentSchema from './common/attachment/attachment';
import AttachmentResolvers from './common/attachment/resolvers';

import AuditLogSchema from './common/audit-log/audit-log';
import AuditLogResolvers from './common/audit-log/resolvers';

import SecurityLogSchema from './common/security-log/security-log';
import SecurityLogResolvers from './common/security-log/resolvers';

import PersonSchema from './common/person/person';
import PersonResolvers from './common/person/resolvers';
import KarkunSchema from './common/karkun/karkun';

/**
 * Schema and Resolvers for the Admin module
 */
import UserSchema from './admin/user/user';
import UserResolvers from './admin/user/resolvers';

import TrustedDeviceSchema from './admin/trusted-device/trusted-device';
import TrustedDeviceResolvers from './admin/trusted-device/resolvers';

import UserGroupSchema from './admin/user-group/user-group';
import UserGroupResolvers from './admin/user-group/resolvers';

import ScheduledJobSchema from './admin/scheduled-job/scheduled-job';
import ScheduledJobResolvers from './admin/scheduled-job/resolvers';

import JobDefinitionSchema from './admin/job-definition/job-definition';
import JobDefinitionResolvers from './admin/job-definition/resolvers';

import PeopleTagSchema from './admin/people-tag/people-tag';
import PeopleTagResolvers from './admin/people-tag/resolvers';
import SystemSettingsSchema from './admin/system-settings/system-settings';
import SystemSettingsResolvers from './admin/system-settings/resolvers';
import FreeFormDataSchema from './admin/free-form-data/free-form-data';
import FreeFormDataResolvers from './admin/free-form-data/resolvers';
import OrgLocationSchema from './admin/org-location/org-location';
import OrgLocationResolvers from './admin/org-location/resolvers';
import MehfilTemplateSchema from './admin/mehfil-template/mehfil-template';
import MehfilTemplateResolvers from './admin/mehfil-template/resolvers';

import DeletedPeopleSchema from './admin/deleted-people/deleted-people';
import DeletedPeopleResolvers from './admin/deleted-people/resolvers';
import UserKarkunSchema from './admin/user-karkun/user-karkun';
import UserKarkunResolvers from './admin/user-karkun/resolvers';

import DuplicatePeopleSchema from './admin/duplicate-people/duplicate-people';
import DuplicatePeopleResolvers from './admin/duplicate-people/resolvers';

import AdminSecurityLogSchema from './admin/security-log/security-log';
import AdminSecurityLogResolvers from './admin/security-log/resolvers';

/**
 * Schema and Resolvers for the Security module
 */
import SecurityPermissionSchema from './security/permission/permission';
import SecurityPermissionResolvers from './security/permission/resolvers';
import SecurityUserGroupSchema from './security/user-group/user-group';
import SecurityUserGroupResolvers from './security/user-group/resolvers';
import SecurityAuditLogSchema from './security/audit-log/audit-log';
import SecurityAuditLogResolvers from './security/audit-log/resolvers';

import SecurityMehfilSchema from './security/mehfil/mehfil';
import SecurityMehfilResolvers from './security/mehfil/resolvers';

import SecurityMehfilDutySchema from './security/mehfil-duty/mehfil-duty';
import SecurityMehfilDutyResolvers from './security/mehfil-duty/resolvers';

import SecurityMehfilKarkunSchema from './security/mehfil-karkun/mehfil-karkun';
import SecurityMehfilKarkunResolvers from './security/mehfil-karkun/resolvers';

import SecurityMehfilLangarDishSchema from './security/mehfil-langar-dish/mehfil-langar-dish';
import SecurityMehfilLangarDishResolvers from './security/mehfil-langar-dish/resolvers';

import SecurityMehfilLangarLocationSchema from './security/mehfil-langar-location/mehfil-langar-location';
import SecurityMehfilLangarLocationResolvers from './security/mehfil-langar-location/resolvers';

import SecurityVisitorSchema from './security/visitor/visitor';
import SecurityVisitorResolvers from './security/visitor/resolvers';

import SecurityVisitorStaySchema from './security/visitor-stay/visitor-stay';
import SecurityVisitorStayResolvers from './security/visitor-stay/resolvers';

import SecurityServerChannelSchema from './security/security-server-channel/security-server-channel';
import SecurityServerChannelResolvers from './security/security-server-channel/resolvers';

import SecurityServerProfileSchema from './security/security-server-profile/security-server-profile';
import SecurityServerProfileResolvers from './security/security-server-profile/resolvers';

import SecurityServerAlertSchema from './security/security-server-alert/security-server-alert';
import SecurityServerAlertResolvers from './security/security-server-alert/resolvers';

import PurchasingVendorSchema from './purchasing/vendor/vendor';
import PurchasingVendorResolvers from './purchasing/vendor/resolvers';
import PurchasingCatalogItemSchema from './purchasing/catalog-item/catalog-item';
import PurchasingCatalogItemResolvers from './purchasing/catalog-item/resolvers';
import PurchasingRequisitionSchema from './purchasing/requisition/requisition';
import PurchasingRequisitionResolvers from './purchasing/requisition/resolvers';
import PurchasingQuoteSchema from './purchasing/quote/quote';
import PurchasingQuoteResolvers from './purchasing/quote/resolvers';
import PurchasingOrderSchema from './purchasing/order/order';
import PurchasingOrderResolvers from './purchasing/order/resolvers';
import PurchasingReceiptSchema from './purchasing/receipt/receipt';
import PurchasingReceiptResolvers from './purchasing/receipt/resolvers';
import PurchasingInvoiceSchema from './purchasing/invoice/invoice';
import PurchasingInvoiceResolvers from './purchasing/invoice/resolvers';
import PurchasingPaymentSchema from './purchasing/payment/payment';
import PurchasingPaymentResolvers from './purchasing/payment/resolvers';
import PurchasingPettyCashExpenseHeadSchema from './purchasing/petty-cash-expense-head/petty-cash-expense-head';
import PurchasingPettyCashExpenseHeadResolvers from './purchasing/petty-cash-expense-head/resolvers';
import PurchasingPettyCashFundSchema from './purchasing/petty-cash-fund/petty-cash-fund';
import PurchasingPettyCashFundResolvers from './purchasing/petty-cash-fund/resolvers';
import PurchasingPettyCashVoucherSchema from './purchasing/petty-cash-voucher/petty-cash-voucher';
import PurchasingPettyCashVoucherResolvers from './purchasing/petty-cash-voucher/resolvers';
import PurchasingPettyCashReplenishmentSchema from './purchasing/petty-cash-replenishment/petty-cash-replenishment';
import PurchasingPettyCashReplenishmentResolvers from './purchasing/petty-cash-replenishment/resolvers';
import PurchasingReportSchema from './purchasing/report/report';
import PurchasingReportResolvers from './purchasing/report/resolvers';
import PurchasingAttachmentSchema from './purchasing/attachment/attachment';
import PurchasingAttachmentResolvers from './purchasing/attachment/resolvers';
import PurchasingAuditLogSchema from './purchasing/audit-log/audit-log';
import PurchasingAuditLogResolvers from './purchasing/audit-log/resolvers';
import PurchasingPermissionSchema from './purchasing/permission/permission';
import PurchasingKarkunSchema from './purchasing/karkun/karkun';
import PurchasingKarkunResolvers from './purchasing/karkun/resolvers';
import PurchasingPermissionResolvers from './purchasing/permission/resolvers';
import PurchasingUserGroupSchema from './purchasing/user-group/user-group';
import PurchasingUserGroupResolvers from './purchasing/user-group/resolvers';

/**
 * Schema and Resolvers for the Stores module's use of Purchasing
 */
import StoreRequisitionSchema from './stores/purchasing/store-requisition/store-requisition';
import StoreRequisitionResolvers from './stores/purchasing/store-requisition/resolvers';
import StoreOrderSchema from './stores/purchasing/store-order/store-order';
import StoreOrderResolvers from './stores/purchasing/store-order/resolvers';
import StoreReceiptSchema from './stores/purchasing/store-receipt/store-receipt';
import StoreReceiptResolvers from './stores/purchasing/store-receipt/resolvers';
import InboxSchema from './correspondence/inbox/inbox';
import InboxResolvers from './correspondence/inbox/resolvers';
import SecurityServerUsageSchema from './security/security-server-usage/security-server-usage';
import SecurityServerUsageResolvers from './security/security-server-usage/resolvers';

/**
 * Schema and Resolvers for the HR module
 */
import HRAuditLogSchema from './hr/audit-log/audit-log';
import HRAuditLogResolvers from './hr/audit-log/resolvers';

import DutyShiftSchema from './hr/duty-shift/duty-shift';
import DutyShiftResolvers from './hr/duty-shift/resolvers';

import DutySchema from './hr/duty/duty';
import DutyResolvers from './hr/duty/resolvers';

import DutyLocationSchema from './hr/duty-location/duty-location';
import DutyLocationResolvers from './hr/duty-location/resolvers';

import TeamSchema from './hr/team/team';
import TeamResolvers from './hr/team/resolvers';

import DutyPlanSchema from './hr/duty-plan/duty-plan';
import DutyPlanResolvers from './hr/duty-plan/resolvers';

import CommitteeSchema from './organization/committee/committee';
import CommitteeResolvers from './organization/committee/resolvers';

import JobSchema from './hr/job/job';
import JobResolvers from './hr/job/resolvers';

import HrPermissionSchema from './hr/permission/permission';
import HrPermissionResolvers from './hr/permission/resolvers';
import HrUserGroupSchema from './hr/user-group/user-group';
import HrUserGroupResolvers from './hr/user-group/resolvers';

import HRKarkunSchema from './hr/karkun/karkun';
import HRKarkunResolvers from './hr/karkun/resolvers';

import SalarySchema from './hr/salary/salary';
import SalaryResolvers from './hr/salary/resolvers';

/**
 * Workspaces Schema and Resolvers
 */
// Registers every headless module (side effect).
import 'meteor/idreesia-common/server/headless/modules';
import WorkspaceCommitteeSchema from './workspaces/committee/committee';
import WorkspaceCommitteeResolvers from './workspaces/committee/resolvers';
import WorkspaceDiscussionsSchema from './workspaces/discussions/discussions';
import WorkspaceDiscussionsResolvers from './workspaces/discussions/resolvers';
import WorkspaceNotificationsSchema from './workspaces/notifications/notifications';
import WorkspaceNotificationsResolvers from './workspaces/notifications/resolvers';
import WorkspaceDocumentsSchema from './workspaces/documents/documents';
import WorkspaceDocumentsResolvers from './workspaces/documents/resolvers';
import WorkspaceMeetingsSchema from './workspaces/meetings/meetings';
import WorkspaceMeetingsResolvers from './workspaces/meetings/resolvers';
import WorkspacePollsSchema from './workspaces/polls/polls';
import WorkspacePollsResolvers from './workspaces/polls/resolvers';
import WorkspaceDutiesAttendanceSchema from './workspaces/duties-attendance/duties-attendance';
import WorkspaceDutiesAttendanceResolvers from './workspaces/duties-attendance/resolvers';
import WorkspaceMehfilDetailsSchema from './workspaces/mehfil-details/mehfil-details';
import WorkspaceMehfilDetailsResolvers from './workspaces/mehfil-details/resolvers';
import WorkspaceMehfilKarkunsSchema from './workspaces/mehfil-karkuns/mehfil-karkuns';
import WorkspaceMehfilKarkunsResolvers from './workspaces/mehfil-karkuns/resolvers';
import WorkspaceMehfilPermissionsSchema from './workspaces/mehfil-permissions/mehfil-permissions';
import WorkspaceMehfilPermissionsResolvers from './workspaces/mehfil-permissions/resolvers';
import WorkspaceProjectsSchema from './workspaces/projects/projects';
import WorkspaceProjectsResolvers from './workspaces/projects/resolvers';
import WorkspaceNightStayReportSchema from './workspaces/night-stay-report/night-stay-report';
import WorkspaceNightStayReportResolvers from './workspaces/night-stay-report/resolvers';
import WorkspaceMonitoringAlertsSchema from './workspaces/monitoring-alerts/monitoring-alerts';
import WorkspaceMonitoringAlertsResolvers from './workspaces/monitoring-alerts/resolvers';
import WorkspaceMonitoringProfilesSchema from './workspaces/monitoring-profiles/monitoring-profiles';
import WorkspaceMonitoringProfilesResolvers from './workspaces/monitoring-profiles/resolvers';

/**
 * Schema and Resolvers for the Outstation module
 */
import CitySchema from './outstation/city/city';
import CityResolvers from './outstation/city/resolvers';

import CityMehfilSchema from './outstation/city-mehfil/city-mehfil';
import CityMehfilResolvers from './outstation/city-mehfil/resolvers';

/**
 * Schema and Resolvers for the Inventory module
 */
import CommonSchema from './inventory/common/common';
import StoreKarkunSchema from './inventory/karkun/karkun';
import StoreKarkunResolvers from './inventory/karkun/resolvers';
import CommonResolvers from './inventory/common/resolvers';

import ItemCategorySchema from './inventory/item-category/item-category';
import ItemCategoryResolvers from './inventory/item-category/resolvers';

import LocationSchema from './inventory/location/location';
import LocationResolvers from './inventory/location/resolvers';

import VendorSchema from './inventory/vendor/vendor';
import VendorResolvers from './inventory/vendor/resolvers';

import PhysicalStoreSchema from './inventory/physical-store/physical-store';
import PhysicalStoreResolvers from './inventory/physical-store/resolvers';
import StoreUserGroupSchema from './inventory/store-user-group/store-user-group';
import StoreUserGroupResolvers from './inventory/store-user-group/resolvers';

/**
 * Reference data: cross-module reads of data owned by another module
 */
import ReferenceDutySchema from './reference-data/duty/duty';
import ReferenceDutyResolvers from './reference-data/duty/resolvers';

import ReferenceOrgLocationSchema from './reference-data/org-location/org-location';
import ReferenceOrgLocationResolvers from './reference-data/org-location/resolvers';

import ReferencePhysicalStoreSchema from './reference-data/physical-store/physical-store';
import ReferencePhysicalStoreResolvers from './reference-data/physical-store/resolvers';
import ReferenceStockItemSchema from './reference-data/stock-item/stock-item';
import ReferenceStockItemResolvers from './reference-data/stock-item/resolvers';

import StockItemSchema from './inventory/stock-item/stock-item';
import StockItemResolvers from './inventory/stock-item/resolvers';

import IssuanceFormSchema from './inventory/issuance-form/issuance-form';
import IssuanceFormResolvers from './inventory/issuance-form/resolvers';

import PurchaseFormSchema from './inventory/purchase-form/purchase-form';
import PurchaseFormResolvers from './inventory/purchase-form/resolvers';

import StockAdjustmentSchema from './inventory/stock-adjustment/stock-adjustment';
import StockAdjustmentResolvers from './inventory/stock-adjustment/resolvers';

const typeDefs = [
  Permission,
  CheckPermissionsDirective,
  CheckStoreAccessDirective,
  CheckCommitteeAccessDirective,
  CheckDutiesAttendanceAccessDirective,
  CheckMehfilDetailsAccessDirective,
  CheckMehfilKarkunsAccessDirective,
  CheckMehfilPermissionsAccessDirective,
  SuperAdminOnlyDirective,
  RootTypes,
  ExternalTypes,

  AttachmentSchema,
  AuditLogSchema,
  SecurityLogSchema,
  KarkunSchema,
  PersonSchema,
  UserSchema,
  TrustedDeviceSchema,
  UserGroupSchema,
  ScheduledJobSchema,
  JobDefinitionSchema,
  PeopleTagSchema,
  SystemSettingsSchema,
  FreeFormDataSchema,
  OrgLocationSchema,
  MehfilTemplateSchema,
  DeletedPeopleSchema,
  UserKarkunSchema,
  DuplicatePeopleSchema,
  AdminSecurityLogSchema,

  SecurityAuditLogSchema,
  SecurityMehfilSchema,
  SecurityMehfilDutySchema,
  SecurityMehfilKarkunSchema,
  SecurityMehfilLangarDishSchema,
  SecurityMehfilLangarLocationSchema,
  SecurityPermissionSchema,
  SecurityUserGroupSchema,
  SecurityVisitorSchema,
  SecurityVisitorStaySchema,
  SecurityServerChannelSchema,
  SecurityServerProfileSchema,
  SecurityServerAlertSchema,
  SecurityServerUsageSchema,

  InboxSchema,

  HRAuditLogSchema,
  DutyShiftSchema,
  DutySchema,
  DutyLocationSchema,
  TeamSchema,
  DutyPlanSchema,
  CommitteeSchema,
  JobSchema,
  HRKarkunSchema,
  HrPermissionSchema,
  HrUserGroupSchema,
  SalarySchema,

  WorkspaceCommitteeSchema,
  WorkspaceDiscussionsSchema,
  WorkspaceNotificationsSchema,
  WorkspaceDocumentsSchema,
  WorkspaceMeetingsSchema,
  WorkspacePollsSchema,
  WorkspaceDutiesAttendanceSchema,
  WorkspaceMehfilDetailsSchema,
  WorkspaceMehfilKarkunsSchema,
  WorkspaceMehfilPermissionsSchema,
  WorkspaceProjectsSchema,
  WorkspaceNightStayReportSchema,
  WorkspaceMonitoringAlertsSchema,
  WorkspaceMonitoringProfilesSchema,

  CitySchema,
  CityMehfilSchema,

  CommonSchema,
  StoreKarkunSchema,
  ItemCategorySchema,
  LocationSchema,
  VendorSchema,
  PurchasingVendorSchema,
  PurchasingCatalogItemSchema,
  PurchasingRequisitionSchema,
  PurchasingQuoteSchema,
  PurchasingOrderSchema,
  PurchasingReceiptSchema,
  PurchasingInvoiceSchema,
  PurchasingPaymentSchema,
  PurchasingPettyCashExpenseHeadSchema,
  PurchasingPettyCashFundSchema,
  PurchasingPettyCashVoucherSchema,
  PurchasingPettyCashReplenishmentSchema,
  PurchasingReportSchema,
  PurchasingAuditLogSchema,
  PurchasingPermissionSchema,
  PurchasingKarkunSchema,
  PurchasingUserGroupSchema,
  StoreRequisitionSchema,
  StoreOrderSchema,
  StoreReceiptSchema,
  PurchasingAttachmentSchema,
  PhysicalStoreSchema,
  StoreUserGroupSchema,
  ReferenceDutySchema,
  ReferenceOrgLocationSchema,
  ReferencePhysicalStoreSchema,
  ReferenceStockItemSchema,
  StockItemSchema,
  IssuanceFormSchema,
  PurchaseFormSchema,
  StockAdjustmentSchema,
];

const resolvers = merge(
  ExternalTypeResolvers,

  AttachmentResolvers,
  AuditLogResolvers,
  SecurityLogResolvers,
  PersonResolvers,
  UserResolvers,
  TrustedDeviceResolvers,
  UserGroupResolvers,
  ScheduledJobResolvers,
  JobDefinitionResolvers,
  PeopleTagResolvers,
  SystemSettingsResolvers,
  FreeFormDataResolvers,
  OrgLocationResolvers,
  MehfilTemplateResolvers,
  DeletedPeopleResolvers,
  UserKarkunResolvers,
  DuplicatePeopleResolvers,
  AdminSecurityLogResolvers,

  SecurityAuditLogResolvers,
  SecurityMehfilResolvers,
  SecurityMehfilDutyResolvers,
  SecurityMehfilKarkunResolvers,
  SecurityMehfilLangarDishResolvers,
  SecurityMehfilLangarLocationResolvers,
  SecurityPermissionResolvers,
  SecurityUserGroupResolvers,
  SecurityVisitorResolvers,
  SecurityVisitorStayResolvers,
  SecurityServerChannelResolvers,
  SecurityServerProfileResolvers,
  SecurityServerAlertResolvers,
  SecurityServerUsageResolvers,

  InboxResolvers,

  HRAuditLogResolvers,
  DutyShiftResolvers,
  DutyResolvers,
  DutyLocationResolvers,
  TeamResolvers,
  DutyPlanResolvers,
  CommitteeResolvers,
  JobResolvers,
  HRKarkunResolvers,
  HrPermissionResolvers,
  HrUserGroupResolvers,
  SalaryResolvers,

  WorkspaceCommitteeResolvers,
  WorkspaceDiscussionsResolvers,
  WorkspaceNotificationsResolvers,
  WorkspaceDocumentsResolvers,
  WorkspaceMeetingsResolvers,
  WorkspacePollsResolvers,
  WorkspaceDutiesAttendanceResolvers,
  WorkspaceMehfilDetailsResolvers,
  WorkspaceMehfilKarkunsResolvers,
  WorkspaceMehfilPermissionsResolvers,
  WorkspaceProjectsResolvers,
  WorkspaceNightStayReportResolvers,
  WorkspaceMonitoringAlertsResolvers,
  WorkspaceMonitoringProfilesResolvers,

  CityResolvers,
  CityMehfilResolvers,

  CommonResolvers,
  StoreKarkunResolvers,
  ItemCategoryResolvers,
  LocationResolvers,
  VendorResolvers,
  PurchasingVendorResolvers,
  PurchasingCatalogItemResolvers,
  PurchasingRequisitionResolvers,
  PurchasingQuoteResolvers,
  PurchasingOrderResolvers,
  PurchasingReceiptResolvers,
  PurchasingInvoiceResolvers,
  PurchasingPaymentResolvers,
  PurchasingPettyCashExpenseHeadResolvers,
  PurchasingPettyCashFundResolvers,
  PurchasingPettyCashVoucherResolvers,
  PurchasingPettyCashReplenishmentResolvers,
  PurchasingReportResolvers,
  PurchasingAuditLogResolvers,
  PurchasingPermissionResolvers,
  PurchasingKarkunResolvers,
  PurchasingUserGroupResolvers,
  StoreRequisitionResolvers,
  StoreOrderResolvers,
  StoreReceiptResolvers,
  PurchasingAttachmentResolvers,
  PhysicalStoreResolvers,
  StoreUserGroupResolvers,
  ReferenceDutyResolvers,
  ReferenceOrgLocationResolvers,
  ReferencePhysicalStoreResolvers,
  ReferenceStockItemResolvers,
  StockItemResolvers,
  IssuanceFormResolvers,
  PurchaseFormResolvers,
  StockAdjustmentResolvers
);

export { typeDefs, resolvers };
