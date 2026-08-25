import { merge } from 'meteor/idreesia-common/utilities/lodash';

/**
 * Custom Directives
 */
import Permission from './_directives/permission';
import CheckPermissionsDirective from './_directives/check-permissions';
import CheckInstanceAccessDirective from './_directives/check-instance-access';

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

import UserGroupSchema from './admin/user-group/user-group';
import UserGroupResolvers from './admin/user-group/resolvers';

import ScheduledJobSchema from './admin/scheduled-job/scheduled-job';
import ScheduledJobResolvers from './admin/scheduled-job/resolvers';

import JobDefinitionSchema from './admin/job-definition/job-definition';
import JobDefinitionResolvers from './admin/job-definition/resolvers';

import PeopleTagSchema from './admin/people-tag/people-tag';
import PeopleTagResolvers from './admin/people-tag/resolvers';

import DeletedPeopleSchema from './admin/deleted-people/deleted-people';
import DeletedPeopleResolvers from './admin/deleted-people/resolvers';

/**
 * Schema and Resolvers for the Security module
 */
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

import SecurityUserSchema from './security/security-user/security-user';
import SecurityUserResolvers from './security/security-user/resolvers';

import SecurityPersonSchema from './security/person/person';
import SecurityPersonResolvers from './security/person/resolvers';

import SecurityVisitorStaySchema from './security/visitor-stay/visitor-stay';
import SecurityVisitorStayResolvers from './security/visitor-stay/resolvers';

import FaceVectorSchema from './security/face-vector/face-vector';
import FaceVectorResolvers from './security/face-vector/resolvers';

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

import JobSchema from './hr/job/job';
import JobResolvers from './hr/job/resolvers';

import HRKarkunSchema from './hr/karkun/karkun';
import HRKarkunResolvers from './hr/karkun/resolvers';

import KarkunDutySchema from './hr/karkun-duties/karkun-duty';
import KarkunDutyResolvers from './hr/karkun-duties/resolvers';

import AttendanceSchema from './hr/attendance/attendance';
import AttendanceResolvers from './hr/attendance/resolvers';

import SalarySchema from './hr/salary/salary';
import SalaryResolvers from './hr/salary/resolvers';

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
import CommonResolvers from './inventory/common/resolvers';

import ItemCategorySchema from './inventory/item-category/item-category';
import ItemCategoryResolvers from './inventory/item-category/resolvers';

import LocationSchema from './inventory/location/location';
import LocationResolvers from './inventory/location/resolvers';

import VendorSchema from './inventory/vendor/vendor';
import VendorResolvers from './inventory/vendor/resolvers';

import PhysicalStoreSchema from './inventory/physical-store/physical-store';
import PhysicalStoreResolvers from './inventory/physical-store/resolvers';

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
  CheckInstanceAccessDirective,
  ExternalTypes,

  AttachmentSchema,
  AuditLogSchema,
  SecurityLogSchema,
  KarkunSchema,
  PersonSchema,
  UserSchema,
  UserGroupSchema,
  ScheduledJobSchema,
  JobDefinitionSchema,
  PeopleTagSchema,
  DeletedPeopleSchema,

  SecurityAuditLogSchema,
  SecurityMehfilSchema,
  SecurityMehfilDutySchema,
  SecurityMehfilKarkunSchema,
  SecurityMehfilLangarDishSchema,
  SecurityMehfilLangarLocationSchema,
  SecurityUserSchema,
  SecurityPersonSchema,
  SecurityVisitorStaySchema,
  FaceVectorSchema,

  HRAuditLogSchema,
  DutyShiftSchema,
  DutySchema,
  DutyLocationSchema,
  JobSchema,
  HRKarkunSchema,
  KarkunDutySchema,
  AttendanceSchema,
  SalarySchema,

  CitySchema,
  CityMehfilSchema,

  CommonSchema,
  ItemCategorySchema,
  LocationSchema,
  VendorSchema,
  PhysicalStoreSchema,
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
  UserGroupResolvers,
  ScheduledJobResolvers,
  JobDefinitionResolvers,
  PeopleTagResolvers,
  DeletedPeopleResolvers,

  SecurityAuditLogResolvers,
  SecurityMehfilResolvers,
  SecurityMehfilDutyResolvers,
  SecurityMehfilKarkunResolvers,
  SecurityMehfilLangarDishResolvers,
  SecurityMehfilLangarLocationResolvers,
  SecurityUserResolvers,
  SecurityPersonResolvers,
  SecurityVisitorStayResolvers,
  FaceVectorResolvers,

  HRAuditLogResolvers,
  DutyShiftResolvers,
  DutyResolvers,
  DutyLocationResolvers,
  JobResolvers,
  HRKarkunResolvers,
  KarkunDutyResolvers,
  AttendanceResolvers,
  SalaryResolvers,

  CityResolvers,
  CityMehfilResolvers,

  CommonResolvers,
  ItemCategoryResolvers,
  LocationResolvers,
  VendorResolvers,
  PhysicalStoreResolvers,
  StockItemResolvers,
  IssuanceFormResolvers,
  PurchaseFormResolvers,
  StockAdjustmentResolvers
);

export { typeDefs, resolvers };
