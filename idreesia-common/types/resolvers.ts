import type * as Types from './graphql';

import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Types.Maybe<TTypes> | Promise<Types.Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Attachment: ResolverTypeWrapper<Types.Attachment>;
  AttendanceType: ResolverTypeWrapper<Types.AttendanceType>;
  AuditLogFilter: Types.AuditLogFilter;
  AuditLogType: ResolverTypeWrapper<Types.AuditLogType>;
  Boolean: ResolverTypeWrapper<Types.Scalars['Boolean']['output']>;
  CityFilter: Types.CityFilter;
  CityMehfilType: ResolverTypeWrapper<Types.CityMehfilType>;
  CityType: ResolverTypeWrapper<Types.CityType>;
  Currency: ResolverTypeWrapper<Types.Scalars['Currency']['output']>;
  Date: ResolverTypeWrapper<Types.Scalars['Date']['output']>;
  DateTime: ResolverTypeWrapper<Types.Scalars['DateTime']['output']>;
  DutyLocationType: ResolverTypeWrapper<Types.DutyLocationType>;
  DutyShiftType: ResolverTypeWrapper<Types.DutyShiftType>;
  DutyType: ResolverTypeWrapper<Types.DutyType>;
  EmailAddress: ResolverTypeWrapper<Types.Scalars['EmailAddress']['output']>;
  FaceVectorRecord: ResolverTypeWrapper<Types.FaceVectorRecord>;
  Float: ResolverTypeWrapper<Types.Scalars['Float']['output']>;
  Int: ResolverTypeWrapper<Types.Scalars['Int']['output']>;
  InventoryStatistics: ResolverTypeWrapper<Types.InventoryStatistics>;
  IssuanceForm: ResolverTypeWrapper<Types.IssuanceForm>;
  ItemCategory: ResolverTypeWrapper<Types.ItemCategory>;
  ItemWithQuantity: ResolverTypeWrapper<Types.ItemWithQuantity>;
  ItemWithQuantityAndPrice: ResolverTypeWrapper<Types.ItemWithQuantityAndPrice>;
  ItemWithQuantityAndPriceInput: Types.ItemWithQuantityAndPriceInput;
  ItemWithQuantityInput: Types.ItemWithQuantityInput;
  JSON: ResolverTypeWrapper<Types.Scalars['JSON']['output']>;
  JSONObject: ResolverTypeWrapper<Types.Scalars['JSONObject']['output']>;
  JobDefinitionType: ResolverTypeWrapper<Types.JobDefinitionType>;
  JobLogEntryType: ResolverTypeWrapper<Types.JobLogEntryType>;
  JobLogsFilterType: Types.JobLogsFilterType;
  JobType: ResolverTypeWrapper<Types.JobType>;
  KarkunDutyType: ResolverTypeWrapper<Types.KarkunDutyType>;
  KarkunFilter: Types.KarkunFilter;
  Location: ResolverTypeWrapper<Types.Location>;
  MehfilDutyType: ResolverTypeWrapper<Types.MehfilDutyType>;
  MehfilKarkunType: ResolverTypeWrapper<Types.MehfilKarkunType>;
  MehfilLangarDishType: ResolverTypeWrapper<Types.MehfilLangarDishType>;
  MehfilLangarLocationType: ResolverTypeWrapper<Types.MehfilLangarLocationType>;
  MehfilType: ResolverTypeWrapper<Types.MehfilType>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  PagedAttendanceType: ResolverTypeWrapper<Types.PagedAttendanceType>;
  PagedAuditLogType: ResolverTypeWrapper<Types.PagedAuditLogType>;
  PagedCityType: ResolverTypeWrapper<Types.PagedCityType>;
  PagedIssuanceForm: ResolverTypeWrapper<Types.PagedIssuanceForm>;
  PagedJobLogsType: ResolverTypeWrapper<Types.PagedJobLogsType>;
  PagedKarkunType: ResolverTypeWrapper<Types.PagedKarkunType>;
  PagedPeopleType: ResolverTypeWrapper<Types.PagedPeopleType>;
  PagedPurchaseForm: ResolverTypeWrapper<Types.PagedPurchaseForm>;
  PagedSalaryType: ResolverTypeWrapper<Types.PagedSalaryType>;
  PagedScheduledJobsType: ResolverTypeWrapper<Types.PagedScheduledJobsType>;
  PagedSecurityLogType: ResolverTypeWrapper<Types.PagedSecurityLogType>;
  PagedStockAdjustment: ResolverTypeWrapper<Types.PagedStockAdjustment>;
  PagedStockItem: ResolverTypeWrapper<Types.PagedStockItem>;
  PagedUserGroupType: ResolverTypeWrapper<Types.PagedUserGroupType>;
  PagedUserType: ResolverTypeWrapper<Types.PagedUserType>;
  PagedVisitorStayType: ResolverTypeWrapper<Types.PagedVisitorStayType>;
  PagedVisitorType: ResolverTypeWrapper<Types.PagedVisitorType>;
  PeopleTagType: ResolverTypeWrapper<Types.PeopleTagType>;
  Permission: Types.Permission;
  PersonEmployeeDataType: ResolverTypeWrapper<Types.PersonEmployeeDataType>;
  PersonFilter: Types.PersonFilter;
  PersonImageVectorDataType: ResolverTypeWrapper<Types.PersonImageVectorDataType>;
  PersonKarkunDataType: ResolverTypeWrapper<Types.PersonKarkunDataType>;
  PersonSharedDataType: ResolverTypeWrapper<Types.PersonSharedDataType>;
  PersonType: ResolverTypeWrapper<Types.PersonType>;
  PersonVisitorDataType: ResolverTypeWrapper<Types.PersonVisitorDataType>;
  PhoneNumber: ResolverTypeWrapper<Types.Scalars['PhoneNumber']['output']>;
  PhysicalStore: ResolverTypeWrapper<Types.PhysicalStore>;
  PostalCode: ResolverTypeWrapper<Types.Scalars['PostalCode']['output']>;
  PurchaseForm: ResolverTypeWrapper<Types.PurchaseForm>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  SalaryType: ResolverTypeWrapper<Types.SalaryType>;
  ScheduledJobType: ResolverTypeWrapper<Types.ScheduledJobType>;
  ScheduledJobsFilterType: Types.ScheduledJobsFilterType;
  SecurityLogFilter: Types.SecurityLogFilter;
  SecurityLogType: ResolverTypeWrapper<Types.SecurityLogType>;
  StockAdjustment: ResolverTypeWrapper<Types.StockAdjustment>;
  StockItem: ResolverTypeWrapper<Types.StockItem>;
  String: ResolverTypeWrapper<Types.Scalars['String']['output']>;
  Time: ResolverTypeWrapper<Types.Scalars['Time']['output']>;
  Timestamp: ResolverTypeWrapper<Types.Scalars['Timestamp']['output']>;
  URL: ResolverTypeWrapper<Types.Scalars['URL']['output']>;
  UserFilter: Types.UserFilter;
  UserGroupType: ResolverTypeWrapper<Types.UserGroupType>;
  UserType: ResolverTypeWrapper<Types.UserType>;
  UtcOffset: ResolverTypeWrapper<Types.Scalars['UtcOffset']['output']>;
  Vendor: ResolverTypeWrapper<Types.Vendor>;
  VisitorFilter: Types.VisitorFilter;
  VisitorStayType: ResolverTypeWrapper<Types.VisitorStayType>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Attachment: Types.Attachment;
  AttendanceType: Types.AttendanceType;
  AuditLogFilter: Types.AuditLogFilter;
  AuditLogType: Types.AuditLogType;
  Boolean: Types.Scalars['Boolean']['output'];
  CityFilter: Types.CityFilter;
  CityMehfilType: Types.CityMehfilType;
  CityType: Types.CityType;
  Currency: Types.Scalars['Currency']['output'];
  Date: Types.Scalars['Date']['output'];
  DateTime: Types.Scalars['DateTime']['output'];
  DutyLocationType: Types.DutyLocationType;
  DutyShiftType: Types.DutyShiftType;
  DutyType: Types.DutyType;
  EmailAddress: Types.Scalars['EmailAddress']['output'];
  FaceVectorRecord: Types.FaceVectorRecord;
  Float: Types.Scalars['Float']['output'];
  Int: Types.Scalars['Int']['output'];
  InventoryStatistics: Types.InventoryStatistics;
  IssuanceForm: Types.IssuanceForm;
  ItemCategory: Types.ItemCategory;
  ItemWithQuantity: Types.ItemWithQuantity;
  ItemWithQuantityAndPrice: Types.ItemWithQuantityAndPrice;
  ItemWithQuantityAndPriceInput: Types.ItemWithQuantityAndPriceInput;
  ItemWithQuantityInput: Types.ItemWithQuantityInput;
  JSON: Types.Scalars['JSON']['output'];
  JSONObject: Types.Scalars['JSONObject']['output'];
  JobDefinitionType: Types.JobDefinitionType;
  JobLogEntryType: Types.JobLogEntryType;
  JobLogsFilterType: Types.JobLogsFilterType;
  JobType: Types.JobType;
  KarkunDutyType: Types.KarkunDutyType;
  KarkunFilter: Types.KarkunFilter;
  Location: Types.Location;
  MehfilDutyType: Types.MehfilDutyType;
  MehfilKarkunType: Types.MehfilKarkunType;
  MehfilLangarDishType: Types.MehfilLangarDishType;
  MehfilLangarLocationType: Types.MehfilLangarLocationType;
  MehfilType: Types.MehfilType;
  Mutation: Record<PropertyKey, never>;
  PagedAttendanceType: Types.PagedAttendanceType;
  PagedAuditLogType: Types.PagedAuditLogType;
  PagedCityType: Types.PagedCityType;
  PagedIssuanceForm: Types.PagedIssuanceForm;
  PagedJobLogsType: Types.PagedJobLogsType;
  PagedKarkunType: Types.PagedKarkunType;
  PagedPeopleType: Types.PagedPeopleType;
  PagedPurchaseForm: Types.PagedPurchaseForm;
  PagedSalaryType: Types.PagedSalaryType;
  PagedScheduledJobsType: Types.PagedScheduledJobsType;
  PagedSecurityLogType: Types.PagedSecurityLogType;
  PagedStockAdjustment: Types.PagedStockAdjustment;
  PagedStockItem: Types.PagedStockItem;
  PagedUserGroupType: Types.PagedUserGroupType;
  PagedUserType: Types.PagedUserType;
  PagedVisitorStayType: Types.PagedVisitorStayType;
  PagedVisitorType: Types.PagedVisitorType;
  PeopleTagType: Types.PeopleTagType;
  PersonEmployeeDataType: Types.PersonEmployeeDataType;
  PersonFilter: Types.PersonFilter;
  PersonImageVectorDataType: Types.PersonImageVectorDataType;
  PersonKarkunDataType: Types.PersonKarkunDataType;
  PersonSharedDataType: Types.PersonSharedDataType;
  PersonType: Types.PersonType;
  PersonVisitorDataType: Types.PersonVisitorDataType;
  PhoneNumber: Types.Scalars['PhoneNumber']['output'];
  PhysicalStore: Types.PhysicalStore;
  PostalCode: Types.Scalars['PostalCode']['output'];
  PurchaseForm: Types.PurchaseForm;
  Query: Record<PropertyKey, never>;
  SalaryType: Types.SalaryType;
  ScheduledJobType: Types.ScheduledJobType;
  ScheduledJobsFilterType: Types.ScheduledJobsFilterType;
  SecurityLogFilter: Types.SecurityLogFilter;
  SecurityLogType: Types.SecurityLogType;
  StockAdjustment: Types.StockAdjustment;
  StockItem: Types.StockItem;
  String: Types.Scalars['String']['output'];
  Time: Types.Scalars['Time']['output'];
  Timestamp: Types.Scalars['Timestamp']['output'];
  URL: Types.Scalars['URL']['output'];
  UserFilter: Types.UserFilter;
  UserGroupType: Types.UserGroupType;
  UserType: Types.UserType;
  UtcOffset: Types.Scalars['UtcOffset']['output'];
  Vendor: Types.Vendor;
  VisitorFilter: Types.VisitorFilter;
  VisitorStayType: Types.VisitorStayType;
}>;

export type CheckInstanceAccessDirectiveArgs = {
  dataFieldName?: Types.Maybe<Types.Scalars['String']['input']>;
  instanceIdArgName?: Types.Maybe<Types.Scalars['String']['input']>;
  returnType?: Types.Maybe<Types.Scalars['String']['input']>;
};

export type CheckInstanceAccessDirectiveResolver<Result, Parent, ContextType = any, Args = CheckInstanceAccessDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type CheckPermissionsDirectiveArgs = {
  dataFieldName?: Types.Maybe<Types.Scalars['String']['input']>;
  permissions?: Types.Maybe<Array<Types.Maybe<Types.Scalars['String']['input']>>>;
};

export type CheckPermissionsDirectiveResolver<Result, Parent, ContextType = any, Args = CheckPermissionsDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type AttachmentResolvers<ContextType = any, ParentType extends ResolversParentTypes['Attachment'] = ResolversParentTypes['Attachment']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  data?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mimeType?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type AttendanceTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['AttendanceType'] = ResolversParentTypes['AttendanceType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  absentCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  attendanceDetails?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  duty?: Resolver<Types.Maybe<ResolversTypes['DutyType']>, ParentType, ContextType>;
  dutyId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  job?: Resolver<Types.Maybe<ResolversTypes['JobType']>, ParentType, ContextType>;
  jobId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  karkun?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType>;
  karkunId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  meetingCardBarcodeId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  month?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  percentage?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  presentCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  shift?: Resolver<Types.Maybe<ResolversTypes['DutyShiftType']>, ParentType, ContextType>;
  shiftId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type AuditLogTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['AuditLogType'] = ResolversParentTypes['AuditLogType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  auditValues?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  entityId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  entityType?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operationBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operationByImageId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operationByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operationTime?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operationType?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type CityMehfilTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['CityMehfilType'] = ResolversParentTypes['CityMehfilType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  address?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cityId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  karkunCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  lcdAvailability?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  mehfilStartYear?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  otherMehfilDetails?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tabAvailability?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  timingDetails?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type CityTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['CityType'] = ResolversParentTypes['CityType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  country?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  karkunCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  mehfils?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['CityMehfilType']>>>, ParentType, ContextType>;
  memberCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  peripheryOf?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  peripheryOfCity?: Resolver<Types.Maybe<ResolversTypes['CityType']>, ParentType, ContextType>;
  region?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export interface CurrencyScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Currency'], any> {
  name: 'Currency';
}

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type DutyLocationTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DutyLocationType'] = ResolversParentTypes['DutyLocationType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  usedCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type DutyShiftTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DutyShiftType'] = ResolversParentTypes['DutyShiftType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  attendanceSheet?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  canDelete?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  duty?: Resolver<Types.Maybe<ResolversTypes['DutyType']>, ParentType, ContextType>;
  dutyId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  endTime?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  startTime?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type DutyTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DutyType'] = ResolversParentTypes['DutyType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  attendanceSheet?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  canDelete?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isMehfilDuty?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  shifts?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DutyShiftType']>>>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  usedCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export interface EmailAddressScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['EmailAddress'], any> {
  name: 'EmailAddress';
}

export type FaceVectorRecordResolvers<ContextType = any, ParentType extends ResolversParentTypes['FaceVectorRecord'] = ResolversParentTypes['FaceVectorRecord']> = ResolversObject<{
  computedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  personId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  vector?: Resolver<Array<ResolversTypes['Float']>, ParentType, ContextType>;
}>;

export type InventoryStatisticsResolvers<ContextType = any, ParentType extends ResolversParentTypes['InventoryStatistics'] = ResolversParentTypes['InventoryStatistics']> = ResolversObject<{
  itemsVerifiedLessThanThreeMonthsAgo?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  itemsVerifiedMoreThanSixMonthsAgo?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  itemsVerifiedThreeToSixMonthsAgo?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  itemsWithImages?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  itemsWithLessThanMinStockLevel?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  itemsWithNegativeStockLevel?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  itemsWithPositiveStockLevel?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  itemsWithoutImages?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  physicalStoreId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type IssuanceFormResolvers<ContextType = any, ParentType extends ResolversParentTypes['IssuanceForm'] = ResolversParentTypes['IssuanceForm']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  approvedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  approvedOn?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  attachmentIds?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  attachments?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['Attachment']>>>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  handedOverTo?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  issueDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  issuedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  issuedTo?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  items?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['ItemWithQuantity']>>>, ParentType, ContextType>;
  locationId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  notes?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  physicalStoreId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  refIssuedBy?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType>;
  refIssuedTo?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType>;
  refLocation?: Resolver<Types.Maybe<ResolversTypes['Location']>, ParentType, ContextType>;
  refPhysicalStore?: Resolver<Types.Maybe<ResolversTypes['PhysicalStore']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type ItemCategoryResolvers<ContextType = any, ParentType extends ResolversParentTypes['ItemCategory'] = ResolversParentTypes['ItemCategory']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  physicalStoreId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stockItemCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type ItemWithQuantityResolvers<ContextType = any, ParentType extends ResolversParentTypes['ItemWithQuantity'] = ResolversParentTypes['ItemWithQuantity']> = ResolversObject<{
  isInflow?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  quantity?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  refStockItem?: Resolver<Types.Maybe<ResolversTypes['StockItem']>, ParentType, ContextType>;
  stockItemId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type ItemWithQuantityAndPriceResolvers<ContextType = any, ParentType extends ResolversParentTypes['ItemWithQuantityAndPrice'] = ResolversParentTypes['ItemWithQuantityAndPrice']> = ResolversObject<{
  isInflow?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  price?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  quantity?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  refStockItem?: Resolver<Types.Maybe<ResolversTypes['StockItem']>, ParentType, ContextType>;
  stockItemId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export interface JsonObjectScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSONObject'], any> {
  name: 'JSONObject';
}

export type JobDefinitionTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['JobDefinitionType'] = ResolversParentTypes['JobDefinitionType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  defaultSchedule?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  displayName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  enabled?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  schedule?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
}>;

export type JobLogEntryTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['JobLogEntryType'] = ResolversParentTypes['JobLogEntryType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  duration?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  error?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  event?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  failCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  jobId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  jobName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  level?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  message?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  retryAttempt?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  retryDelay?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  timestamp?: Resolver<Types.Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
}>;

export type JobTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['JobType'] = ResolversParentTypes['JobType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  usedCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type KarkunDutyTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['KarkunDutyType'] = ResolversParentTypes['KarkunDutyType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  daysOfWeek?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  duty?: Resolver<Types.Maybe<ResolversTypes['DutyType']>, ParentType, ContextType>;
  dutyId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dutyName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  karkunId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  location?: Resolver<Types.Maybe<ResolversTypes['DutyLocationType']>, ParentType, ContextType>;
  locationId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  locationName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  role?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  shift?: Resolver<Types.Maybe<ResolversTypes['DutyShiftType']>, ParentType, ContextType>;
  shiftId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  shiftName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type LocationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Location'] = ResolversParentTypes['Location']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isInUse?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  parentId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  physicalStoreId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  refParent?: Resolver<Types.Maybe<ResolversTypes['Location']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type MehfilDutyTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MehfilDutyType'] = ResolversParentTypes['MehfilDutyType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mehfilUsedCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  overallUsedCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  urduName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type MehfilKarkunTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MehfilKarkunType'] = ResolversParentTypes['MehfilKarkunType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  duty?: Resolver<Types.Maybe<ResolversTypes['MehfilDutyType']>, ParentType, ContextType>;
  dutyCardBarcodeId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dutyDetail?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dutyId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  karkun?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType>;
  karkunId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mehfil?: Resolver<Types.Maybe<ResolversTypes['MehfilType']>, ParentType, ContextType>;
  mehfilId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type MehfilLangarDishTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MehfilLangarDishType'] = ResolversParentTypes['MehfilLangarDishType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  overallUsedCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  urduName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type MehfilLangarLocationTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MehfilLangarLocationType'] = ResolversParentTypes['MehfilLangarLocationType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  overallUsedCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  urduName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type MehfilTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MehfilType'] = ResolversParentTypes['MehfilType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  karkunCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  mehfilDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mehfilKarkuns?: Resolver<Types.Maybe<ResolversTypes['MehfilKarkunType']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  addHrKarkunAttachment?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationAddHrKarkunAttachmentArgs, '_id' | 'attachmentId'>>;
  addIssuanceFormAttachment?: Resolver<Types.Maybe<ResolversTypes['IssuanceForm']>, ParentType, ContextType, RequireFields<Types.MutationAddIssuanceFormAttachmentArgs, '_id' | 'attachmentId' | 'physicalStoreId'>>;
  addMehfilKarkun?: Resolver<Types.Maybe<ResolversTypes['MehfilKarkunType']>, ParentType, ContextType, RequireFields<Types.MutationAddMehfilKarkunArgs, 'dutyId' | 'karkunId' | 'mehfilId'>>;
  addPurchaseFormAttachment?: Resolver<Types.Maybe<ResolversTypes['PurchaseForm']>, ParentType, ContextType, RequireFields<Types.MutationAddPurchaseFormAttachmentArgs, '_id' | 'attachmentId' | 'physicalStoreId'>>;
  approveIssuanceForms?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['IssuanceForm']>>>, ParentType, ContextType, RequireFields<Types.MutationApproveIssuanceFormsArgs, '_ids' | 'physicalStoreId'>>;
  approvePurchaseForms?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchaseForm']>>>, ParentType, ContextType, RequireFields<Types.MutationApprovePurchaseFormsArgs, '_ids' | 'physicalStoreId'>>;
  approveStockAdjustments?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['StockAdjustment']>>>, ParentType, ContextType, RequireFields<Types.MutationApproveStockAdjustmentsArgs, '_ids' | 'physicalStoreId'>>;
  cancelVisitorStay?: Resolver<Types.Maybe<ResolversTypes['VisitorStayType']>, ParentType, ContextType, RequireFields<Types.MutationCancelVisitorStayArgs, '_id'>>;
  clearJobDefinitionSchedule?: Resolver<Types.Maybe<ResolversTypes['JobDefinitionType']>, ParentType, ContextType, RequireFields<Types.MutationClearJobDefinitionScheduleArgs, '_id'>>;
  createAttachment?: Resolver<Types.Maybe<ResolversTypes['Attachment']>, ParentType, ContextType, RequireFields<Types.MutationCreateAttachmentArgs, 'data'>>;
  createAttendances?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationCreateAttendancesArgs, 'month'>>;
  createCity?: Resolver<Types.Maybe<ResolversTypes['CityType']>, ParentType, ContextType, RequireFields<Types.MutationCreateCityArgs, 'country' | 'name'>>;
  createCityMehfil?: Resolver<Types.Maybe<ResolversTypes['CityMehfilType']>, ParentType, ContextType, RequireFields<Types.MutationCreateCityMehfilArgs, 'cityId' | 'name'>>;
  createDuty?: Resolver<Types.Maybe<ResolversTypes['DutyType']>, ParentType, ContextType, RequireFields<Types.MutationCreateDutyArgs, 'isMehfilDuty' | 'name'>>;
  createDutyLocation?: Resolver<Types.Maybe<ResolversTypes['DutyLocationType']>, ParentType, ContextType, RequireFields<Types.MutationCreateDutyLocationArgs, 'name'>>;
  createDutyShift?: Resolver<Types.Maybe<ResolversTypes['DutyShiftType']>, ParentType, ContextType, RequireFields<Types.MutationCreateDutyShiftArgs, 'dutyId' | 'name'>>;
  createHrKarkun?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationCreateHrKarkunArgs, 'name'>>;
  createIssuanceForm?: Resolver<Types.Maybe<ResolversTypes['IssuanceForm']>, ParentType, ContextType, RequireFields<Types.MutationCreateIssuanceFormArgs, 'issueDate' | 'issuedBy' | 'issuedTo' | 'physicalStoreId'>>;
  createItemCategory?: Resolver<Types.Maybe<ResolversTypes['ItemCategory']>, ParentType, ContextType, RequireFields<Types.MutationCreateItemCategoryArgs, 'name' | 'physicalStoreId'>>;
  createJob?: Resolver<Types.Maybe<ResolversTypes['JobType']>, ParentType, ContextType, RequireFields<Types.MutationCreateJobArgs, 'name'>>;
  createKarkunDuty?: Resolver<Types.Maybe<ResolversTypes['KarkunDutyType']>, ParentType, ContextType, RequireFields<Types.MutationCreateKarkunDutyArgs, 'dutyId' | 'karkunId'>>;
  createLocation?: Resolver<Types.Maybe<ResolversTypes['Location']>, ParentType, ContextType, RequireFields<Types.MutationCreateLocationArgs, 'name' | 'physicalStoreId'>>;
  createMehfil?: Resolver<Types.Maybe<ResolversTypes['MehfilType']>, ParentType, ContextType, RequireFields<Types.MutationCreateMehfilArgs, 'mehfilDate' | 'name'>>;
  createPeopleTag?: Resolver<Types.Maybe<ResolversTypes['PeopleTagType']>, ParentType, ContextType, RequireFields<Types.MutationCreatePeopleTagArgs, 'color' | 'moduleNames' | 'name' | 'textColor'>>;
  createPhysicalStore?: Resolver<Types.Maybe<ResolversTypes['PhysicalStore']>, ParentType, ContextType, RequireFields<Types.MutationCreatePhysicalStoreArgs, 'name'>>;
  createPurchaseForm?: Resolver<Types.Maybe<ResolversTypes['PurchaseForm']>, ParentType, ContextType, RequireFields<Types.MutationCreatePurchaseFormArgs, 'physicalStoreId' | 'purchaseDate' | 'purchasedBy' | 'receivedBy'>>;
  createSalaries?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationCreateSalariesArgs, 'month'>>;
  createSecurityMehfilDuty?: Resolver<Types.Maybe<ResolversTypes['MehfilDutyType']>, ParentType, ContextType, RequireFields<Types.MutationCreateSecurityMehfilDutyArgs, 'name' | 'urduName'>>;
  createSecurityMehfilLangarDish?: Resolver<Types.Maybe<ResolversTypes['MehfilLangarDishType']>, ParentType, ContextType, RequireFields<Types.MutationCreateSecurityMehfilLangarDishArgs, 'name' | 'urduName'>>;
  createSecurityMehfilLangarLocation?: Resolver<Types.Maybe<ResolversTypes['MehfilLangarLocationType']>, ParentType, ContextType, RequireFields<Types.MutationCreateSecurityMehfilLangarLocationArgs, 'name' | 'urduName'>>;
  createSecurityVisitor?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationCreateSecurityVisitorArgs, 'ehadDate' | 'name' | 'parentName' | 'referenceName'>>;
  createStockAdjustment?: Resolver<Types.Maybe<ResolversTypes['StockAdjustment']>, ParentType, ContextType, RequireFields<Types.MutationCreateStockAdjustmentArgs, 'adjustedBy' | 'adjustmentDate' | 'isInflow' | 'physicalStoreId' | 'quantity' | 'stockItemId'>>;
  createStockItem?: Resolver<Types.Maybe<ResolversTypes['StockItem']>, ParentType, ContextType, RequireFields<Types.MutationCreateStockItemArgs, 'categoryId' | 'name' | 'physicalStoreId' | 'unitOfMeasurement'>>;
  createUser?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, Partial<Types.MutationCreateUserArgs>>;
  createUserGroup?: Resolver<Types.Maybe<ResolversTypes['UserGroupType']>, ParentType, ContextType, RequireFields<Types.MutationCreateUserGroupArgs, 'moduleName' | 'name'>>;
  createVendor?: Resolver<Types.Maybe<ResolversTypes['Vendor']>, ParentType, ContextType, RequireFields<Types.MutationCreateVendorArgs, 'name' | 'physicalStoreId'>>;
  createVisitorStay?: Resolver<Types.Maybe<ResolversTypes['VisitorStayType']>, ParentType, ContextType, RequireFields<Types.MutationCreateVisitorStayArgs, 'numOfDays' | 'visitorId'>>;
  deleteAllAttendances?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationDeleteAllAttendancesArgs, 'month'>>;
  deleteAllSalaries?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationDeleteAllSalariesArgs, 'month'>>;
  deleteAttendances?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationDeleteAttendancesArgs, 'ids' | 'month'>>;
  deleteHrKarkun?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationDeleteHrKarkunArgs, '_id'>>;
  deletePeopleTag?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationDeletePeopleTagArgs, '_id'>>;
  deleteSalaries?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationDeleteSalariesArgs, 'ids' | 'month'>>;
  deleteSecurityVisitor?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationDeleteSecurityVisitorArgs, '_id'>>;
  deleteUserGroup?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationDeleteUserGroupArgs, '_id'>>;
  deleteVisitorStay?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationDeleteVisitorStayArgs, '_id'>>;
  fixCitySpelling?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationFixCitySpellingArgs, 'existingSpelling' | 'newSpelling'>>;
  fixNameSpelling?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationFixNameSpellingArgs, 'existingSpelling' | 'newSpelling'>>;
  importAttendances?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationImportAttendancesArgs, 'dutyId' | 'month'>>;
  importSecurityVisitorsCsvData?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<Types.MutationImportSecurityVisitorsCsvDataArgs, 'csvData'>>;
  mergeStockItems?: Resolver<Types.Maybe<ResolversTypes['StockItem']>, ParentType, ContextType, RequireFields<Types.MutationMergeStockItemsArgs, '_idToKeep' | '_idsToMerge' | 'physicalStoreId'>>;
  recalculateStockLevels?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['StockItem']>>>, ParentType, ContextType, RequireFields<Types.MutationRecalculateStockLevelsArgs, '_ids' | 'physicalStoreId'>>;
  registerUser?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRegisterUserArgs, 'displayName' | 'email'>>;
  removeCity?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveCityArgs, '_id'>>;
  removeCityMehfil?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveCityMehfilArgs, '_id'>>;
  removeDuty?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveDutyArgs, '_id'>>;
  removeDutyLocation?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveDutyLocationArgs, '_id'>>;
  removeDutyShift?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveDutyShiftArgs, '_id'>>;
  removeHrKarkunAttachment?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationRemoveHrKarkunAttachmentArgs, '_id' | 'attachmentId'>>;
  removeIssuanceFormAttachment?: Resolver<Types.Maybe<ResolversTypes['IssuanceForm']>, ParentType, ContextType, RequireFields<Types.MutationRemoveIssuanceFormAttachmentArgs, '_id' | 'attachmentId' | 'physicalStoreId'>>;
  removeIssuanceForms?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveIssuanceFormsArgs, '_ids' | 'physicalStoreId'>>;
  removeItemCategory?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveItemCategoryArgs, '_id' | 'physicalStoreId'>>;
  removeJob?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveJobArgs, '_id'>>;
  removeKarkunDuty?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveKarkunDutyArgs, '_id'>>;
  removeLocation?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveLocationArgs, '_id' | 'physicalStoreId'>>;
  removeMehfil?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveMehfilArgs, '_id'>>;
  removeMehfilKarkun?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveMehfilKarkunArgs, '_id'>>;
  removePurchaseFormAttachment?: Resolver<Types.Maybe<ResolversTypes['PurchaseForm']>, ParentType, ContextType, RequireFields<Types.MutationRemovePurchaseFormAttachmentArgs, '_id' | 'attachmentId' | 'physicalStoreId'>>;
  removePurchaseForms?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemovePurchaseFormsArgs, '_ids' | 'physicalStoreId'>>;
  removeSecurityMehfilDuty?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveSecurityMehfilDutyArgs, '_id'>>;
  removeSecurityMehfilLangarDish?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveSecurityMehfilLangarDishArgs, '_id'>>;
  removeSecurityMehfilLangarLocation?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveSecurityMehfilLangarLocationArgs, '_id'>>;
  removeStockAdjustments?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveStockAdjustmentsArgs, '_ids' | 'physicalStoreId'>>;
  removeStockItem?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveStockItemArgs, '_id' | 'physicalStoreId'>>;
  removeVendor?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveVendorArgs, '_id' | 'physicalStoreId'>>;
  resetJobDefinitionSchedule?: Resolver<Types.Maybe<ResolversTypes['JobDefinitionType']>, ParentType, ContextType, RequireFields<Types.MutationResetJobDefinitionScheduleArgs, '_id'>>;
  resetPassword?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<Types.MutationResetPasswordArgs, 'userName'>>;
  retryFailedJob?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationRetryFailedJobArgs, '_id'>>;
  runScheduledJobNow?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationRunScheduledJobNowArgs, 'name'>>;
  setDutyDetail?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['MehfilKarkunType']>>>, ParentType, ContextType, RequireFields<Types.MutationSetDutyDetailArgs, 'ids'>>;
  setGroups?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<Types.MutationSetGroupsArgs, 'groups' | 'userId'>>;
  setHrKarkunEmploymentInfo?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationSetHrKarkunEmploymentInfoArgs, '_id' | 'isEmployee'>>;
  setHrKarkunProfileImage?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationSetHrKarkunProfileImageArgs, '_id' | 'imageId'>>;
  setHrKarkunWazaifAndRaabta?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationSetHrKarkunWazaifAndRaabtaArgs, '_id'>>;
  setInstanceAccess?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<Types.MutationSetInstanceAccessArgs, 'instances' | 'userId'>>;
  setJobDefinitionEnabled?: Resolver<Types.Maybe<ResolversTypes['JobDefinitionType']>, ParentType, ContextType, RequireFields<Types.MutationSetJobDefinitionEnabledArgs, '_id' | 'enabled'>>;
  setPermissions?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<Types.MutationSetPermissionsArgs, 'permissions' | 'userId'>>;
  setScheduledJobEnabled?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationSetScheduledJobEnabledArgs, '_id' | 'enabled'>>;
  setSecurityUserPermissions?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<Types.MutationSetSecurityUserPermissionsArgs, 'permissions' | 'userId'>>;
  setSecurityVisitorImage?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationSetSecurityVisitorImageArgs, '_id' | 'imageId'>>;
  setStockItemImage?: Resolver<Types.Maybe<ResolversTypes['StockItem']>, ParentType, ContextType, RequireFields<Types.MutationSetStockItemImageArgs, '_id' | 'imageId' | 'physicalStoreId'>>;
  setUserGroupInstanceAccess?: Resolver<Types.Maybe<ResolversTypes['UserGroupType']>, ParentType, ContextType, RequireFields<Types.MutationSetUserGroupInstanceAccessArgs, '_id' | 'instances'>>;
  setUserGroupPermissions?: Resolver<Types.Maybe<ResolversTypes['UserGroupType']>, ParentType, ContextType, RequireFields<Types.MutationSetUserGroupPermissionsArgs, '_id' | 'permissions'>>;
  updateAttachment?: Resolver<Types.Maybe<ResolversTypes['Attachment']>, ParentType, ContextType, RequireFields<Types.MutationUpdateAttachmentArgs, '_id'>>;
  updateAttendance?: Resolver<Types.Maybe<ResolversTypes['AttendanceType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateAttendanceArgs, '_id'>>;
  updateCity?: Resolver<Types.Maybe<ResolversTypes['CityType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateCityArgs, '_id' | 'country' | 'name'>>;
  updateCityMehfil?: Resolver<Types.Maybe<ResolversTypes['CityMehfilType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateCityMehfilArgs, '_id' | 'cityId' | 'name'>>;
  updateDuty?: Resolver<Types.Maybe<ResolversTypes['DutyType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateDutyArgs, 'id' | 'name'>>;
  updateDutyLocation?: Resolver<Types.Maybe<ResolversTypes['DutyLocationType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateDutyLocationArgs, 'id' | 'name'>>;
  updateDutyShift?: Resolver<Types.Maybe<ResolversTypes['DutyShiftType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateDutyShiftArgs, '_id' | 'dutyId' | 'name'>>;
  updateHrKarkun?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateHrKarkunArgs, '_id' | 'name'>>;
  updateIssuanceForm?: Resolver<Types.Maybe<ResolversTypes['IssuanceForm']>, ParentType, ContextType, RequireFields<Types.MutationUpdateIssuanceFormArgs, '_id' | 'issueDate' | 'issuedBy' | 'issuedTo' | 'physicalStoreId'>>;
  updateItemCategory?: Resolver<Types.Maybe<ResolversTypes['ItemCategory']>, ParentType, ContextType, RequireFields<Types.MutationUpdateItemCategoryArgs, '_id' | 'name' | 'physicalStoreId'>>;
  updateJob?: Resolver<Types.Maybe<ResolversTypes['JobType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateJobArgs, 'id' | 'name'>>;
  updateJobDefinitionSchedule?: Resolver<Types.Maybe<ResolversTypes['JobDefinitionType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateJobDefinitionScheduleArgs, '_id' | 'schedule'>>;
  updateKarkunDuty?: Resolver<Types.Maybe<ResolversTypes['KarkunDutyType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateKarkunDutyArgs, '_id' | 'dutyId' | 'karkunId'>>;
  updateLastActiveTime?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updateLocation?: Resolver<Types.Maybe<ResolversTypes['Location']>, ParentType, ContextType, RequireFields<Types.MutationUpdateLocationArgs, '_id' | 'name' | 'physicalStoreId'>>;
  updateLoginTime?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updateMehfil?: Resolver<Types.Maybe<ResolversTypes['MehfilType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateMehfilArgs, '_id' | 'name'>>;
  updatePeopleTag?: Resolver<Types.Maybe<ResolversTypes['PeopleTagType']>, ParentType, ContextType, RequireFields<Types.MutationUpdatePeopleTagArgs, '_id' | 'color' | 'moduleNames' | 'name' | 'textColor'>>;
  updatePhysicalStore?: Resolver<Types.Maybe<ResolversTypes['PhysicalStore']>, ParentType, ContextType, RequireFields<Types.MutationUpdatePhysicalStoreArgs, 'id' | 'name'>>;
  updatePurchaseForm?: Resolver<Types.Maybe<ResolversTypes['PurchaseForm']>, ParentType, ContextType, RequireFields<Types.MutationUpdatePurchaseFormArgs, '_id' | 'physicalStoreId' | 'purchaseDate' | 'purchasedBy' | 'receivedBy'>>;
  updateSalary?: Resolver<Types.Maybe<ResolversTypes['SalaryType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateSalaryArgs, '_id'>>;
  updateSecurityMehfilDuty?: Resolver<Types.Maybe<ResolversTypes['MehfilDutyType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateSecurityMehfilDutyArgs, 'id' | 'name' | 'urduName'>>;
  updateSecurityMehfilLangarDish?: Resolver<Types.Maybe<ResolversTypes['MehfilLangarDishType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateSecurityMehfilLangarDishArgs, 'id' | 'name' | 'urduName'>>;
  updateSecurityMehfilLangarLocation?: Resolver<Types.Maybe<ResolversTypes['MehfilLangarLocationType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateSecurityMehfilLangarLocationArgs, 'id' | 'name' | 'urduName'>>;
  updateSecurityVisitor?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateSecurityVisitorArgs, '_id' | 'ehadDate' | 'name' | 'parentName' | 'referenceName'>>;
  updateSecurityVisitorNotes?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateSecurityVisitorNotesArgs, '_id'>>;
  updateStockAdjustment?: Resolver<Types.Maybe<ResolversTypes['StockAdjustment']>, ParentType, ContextType, RequireFields<Types.MutationUpdateStockAdjustmentArgs, '_id' | 'adjustedBy' | 'adjustmentDate' | 'isInflow' | 'physicalStoreId' | 'quantity'>>;
  updateStockItem?: Resolver<Types.Maybe<ResolversTypes['StockItem']>, ParentType, ContextType, RequireFields<Types.MutationUpdateStockItemArgs, '_id' | 'categoryId' | 'name' | 'physicalStoreId' | 'unitOfMeasurement'>>;
  updateUser?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateUserArgs, 'userId'>>;
  updateUserGroup?: Resolver<Types.Maybe<ResolversTypes['UserGroupType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateUserGroupArgs, '_id'>>;
  updateVendor?: Resolver<Types.Maybe<ResolversTypes['Vendor']>, ParentType, ContextType, RequireFields<Types.MutationUpdateVendorArgs, '_id' | 'physicalStoreId'>>;
  updateVisitorStay?: Resolver<Types.Maybe<ResolversTypes['VisitorStayType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateVisitorStayArgs, '_id' | 'fromDate' | 'toDate'>>;
  verifyStockItemLevel?: Resolver<Types.Maybe<ResolversTypes['StockItem']>, ParentType, ContextType, RequireFields<Types.MutationVerifyStockItemLevelArgs, '_id' | 'physicalStoreId'>>;
}>;

export type PagedAttendanceTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedAttendanceType'] = ResolversParentTypes['PagedAttendanceType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['AttendanceType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedAuditLogTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedAuditLogType'] = ResolversParentTypes['PagedAuditLogType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['AuditLogType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedCityTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedCityType'] = ResolversParentTypes['PagedCityType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['CityType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedIssuanceFormResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedIssuanceForm'] = ResolversParentTypes['PagedIssuanceForm']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['IssuanceForm']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedJobLogsTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedJobLogsType'] = ResolversParentTypes['PagedJobLogsType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['JobLogEntryType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedKarkunTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedKarkunType'] = ResolversParentTypes['PagedKarkunType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PersonType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedPeopleTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedPeopleType'] = ResolversParentTypes['PagedPeopleType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PersonType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedPurchaseFormResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedPurchaseForm'] = ResolversParentTypes['PagedPurchaseForm']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchaseForm']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedSalaryTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedSalaryType'] = ResolversParentTypes['PagedSalaryType']> = ResolversObject<{
  salaries?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['SalaryType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedScheduledJobsTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedScheduledJobsType'] = ResolversParentTypes['PagedScheduledJobsType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['ScheduledJobType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedSecurityLogTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedSecurityLogType'] = ResolversParentTypes['PagedSecurityLogType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['SecurityLogType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedStockAdjustmentResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedStockAdjustment'] = ResolversParentTypes['PagedStockAdjustment']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['StockAdjustment']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedStockItemResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedStockItem'] = ResolversParentTypes['PagedStockItem']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['StockItem']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedUserGroupTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedUserGroupType'] = ResolversParentTypes['PagedUserGroupType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['UserGroupType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedUserTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedUserType'] = ResolversParentTypes['PagedUserType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['UserType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedVisitorStayTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedVisitorStayType'] = ResolversParentTypes['PagedVisitorStayType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['VisitorStayType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedVisitorTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedVisitorType'] = ResolversParentTypes['PagedVisitorType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PersonType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PeopleTagTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PeopleTagType'] = ResolversParentTypes['PeopleTagType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  color?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  moduleNames?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  textColor?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type PersonEmployeeDataTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PersonEmployeeDataType'] = ResolversParentTypes['PersonEmployeeDataType']> = ResolversObject<{
  bankAccountDetails?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  employmentEndDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  employmentStartDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  job?: Resolver<Types.Maybe<ResolversTypes['JobType']>, ParentType, ContextType>;
  jobId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type PersonImageVectorDataTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PersonImageVectorDataType'] = ResolversParentTypes['PersonImageVectorDataType']> = ResolversObject<{
  status?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type PersonKarkunDataTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PersonKarkunDataType'] = ResolversParentTypes['PersonKarkunDataType']> = ResolversObject<{
  attachmentIds?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  attachments?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['Attachment']>>>, ParentType, ContextType>;
  city?: Resolver<Types.Maybe<ResolversTypes['CityType']>, ParentType, ContextType>;
  cityId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cityMehfil?: Resolver<Types.Maybe<ResolversTypes['CityMehfilType']>, ParentType, ContextType>;
  cityMehfilId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  duties?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['KarkunDutyType']>>>, ParentType, ContextType>;
  ehadKarkun?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  ehadPermissionDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastTarteebDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mehfilRaabta?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  msLastVisitDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  msRaabta?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type PersonSharedDataTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PersonSharedDataType'] = ResolversParentTypes['PersonSharedDataType']> = ResolversObject<{
  birthDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  bloodGroup?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cnicNumber?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber1?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber2?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  currentAddress?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deathDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  educationalQualification?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ehadDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emailAddress?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  image?: Resolver<Types.Maybe<ResolversTypes['Attachment']>, ParentType, ContextType>;
  imageId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageVectorData?: Resolver<Types.Maybe<ResolversTypes['PersonImageVectorDataType']>, ParentType, ContextType>;
  meansOfEarning?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  parentName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  permanentAddress?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  referenceName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tagIds?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  tags?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PeopleTagType']>>>, ParentType, ContextType>;
}>;

export type PersonTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PersonType'] = ResolversParentTypes['PersonType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dataSource?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deletedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deletedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  employeeData?: Resolver<Types.Maybe<ResolversTypes['PersonEmployeeDataType']>, ParentType, ContextType>;
  isEmployee?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isKarkun?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isVisitor?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  karkunData?: Resolver<Types.Maybe<ResolversTypes['PersonKarkunDataType']>, ParentType, ContextType>;
  sharedData?: Resolver<Types.Maybe<ResolversTypes['PersonSharedDataType']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  visitorData?: Resolver<Types.Maybe<ResolversTypes['PersonVisitorDataType']>, ParentType, ContextType>;
}>;

export type PersonVisitorDataTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PersonVisitorDataType'] = ResolversParentTypes['PersonVisitorDataType']> = ResolversObject<{
  city?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  country?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  criminalRecord?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  otherNotes?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export interface PhoneNumberScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['PhoneNumber'], any> {
  name: 'PhoneNumber';
}

export type PhysicalStoreResolvers<ContextType = any, ParentType extends ResolversParentTypes['PhysicalStore'] = ResolversParentTypes['PhysicalStore']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  address?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export interface PostalCodeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['PostalCode'], any> {
  name: 'PostalCode';
}

export type PurchaseFormResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchaseForm'] = ResolversParentTypes['PurchaseForm']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  approvedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  approvedOn?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  attachmentIds?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  attachments?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['Attachment']>>>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  items?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['ItemWithQuantityAndPrice']>>>, ParentType, ContextType>;
  locationId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  notes?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  physicalStoreId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  purchaseDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  purchasedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  receivedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  refLocation?: Resolver<Types.Maybe<ResolversTypes['Location']>, ParentType, ContextType>;
  refPhysicalStore?: Resolver<Types.Maybe<ResolversTypes['PhysicalStore']>, ParentType, ContextType>;
  refPurchasedBy?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType>;
  refReceivedBy?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType>;
  refVendor?: Resolver<Types.Maybe<ResolversTypes['Vendor']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  vendorId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  allAccessiblePhysicalStores?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PhysicalStore']>>>, ParentType, ContextType>;
  allCities?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['CityType']>>>, ParentType, ContextType>;
  allCityMehfils?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['CityMehfilType']>>>, ParentType, ContextType>;
  allDutyLocations?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DutyLocationType']>>>, ParentType, ContextType>;
  allDutyShifts?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DutyShiftType']>>>, ParentType, ContextType>;
  allJobDefinitions?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['JobDefinitionType']>>>, ParentType, ContextType>;
  allJobs?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['JobType']>>>, ParentType, ContextType>;
  allMSDuties?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DutyType']>>>, ParentType, ContextType>;
  allMehfilDuties?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DutyType']>>>, ParentType, ContextType>;
  allMehfils?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['MehfilType']>>>, ParentType, ContextType>;
  allPeopleTags?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PeopleTagType']>>>, ParentType, ContextType>;
  allPhysicalStores?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PhysicalStore']>>>, ParentType, ContextType>;
  allSecurityMehfilDuties?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['MehfilDutyType']>>>, ParentType, ContextType, Partial<Types.QueryAllSecurityMehfilDutiesArgs>>;
  allSecurityMehfilLangarDishes?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['MehfilLangarDishType']>>>, ParentType, ContextType>;
  allSecurityMehfilLangarLocations?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['MehfilLangarLocationType']>>>, ParentType, ContextType>;
  attachmentsById?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['Attachment']>>>, ParentType, ContextType, RequireFields<Types.QueryAttachmentsByIdArgs, 'ids'>>;
  attendanceByBarcodeId?: Resolver<Types.Maybe<ResolversTypes['AttendanceType']>, ParentType, ContextType, RequireFields<Types.QueryAttendanceByBarcodeIdArgs, 'barcodeId'>>;
  attendanceByBarcodeIds?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['AttendanceType']>>>, ParentType, ContextType, RequireFields<Types.QueryAttendanceByBarcodeIdsArgs, 'barcodeIds'>>;
  attendanceById?: Resolver<Types.Maybe<ResolversTypes['AttendanceType']>, ParentType, ContextType, RequireFields<Types.QueryAttendanceByIdArgs, '_id'>>;
  attendanceByMonth?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['AttendanceType']>>>, ParentType, ContextType, RequireFields<Types.QueryAttendanceByMonthArgs, 'month'>>;
  cityById?: Resolver<Types.Maybe<ResolversTypes['CityType']>, ParentType, ContextType, RequireFields<Types.QueryCityByIdArgs, '_id'>>;
  cityMehfilById?: Resolver<Types.Maybe<ResolversTypes['CityMehfilType']>, ParentType, ContextType, RequireFields<Types.QueryCityMehfilByIdArgs, '_id'>>;
  cityMehfilsByCityId?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['CityMehfilType']>>>, ParentType, ContextType, RequireFields<Types.QueryCityMehfilsByCityIdArgs, 'cityId'>>;
  currentUser?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType>;
  deletedPersonById?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.QueryDeletedPersonByIdArgs, '_id'>>;
  distinctCities?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  distinctCountries?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  distinctRegions?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  distinctStayAllowedBy?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  dutyById?: Resolver<Types.Maybe<ResolversTypes['DutyType']>, ParentType, ContextType, RequireFields<Types.QueryDutyByIdArgs, 'id'>>;
  dutyLocationById?: Resolver<Types.Maybe<ResolversTypes['DutyLocationType']>, ParentType, ContextType, RequireFields<Types.QueryDutyLocationByIdArgs, 'id'>>;
  dutyShiftById?: Resolver<Types.Maybe<ResolversTypes['DutyShiftType']>, ParentType, ContextType, RequireFields<Types.QueryDutyShiftByIdArgs, 'id'>>;
  dutyShiftsByDutyId?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DutyShiftType']>>>, ParentType, ContextType, RequireFields<Types.QueryDutyShiftsByDutyIdArgs, 'dutyId'>>;
  faceVectors?: Resolver<Array<ResolversTypes['FaceVectorRecord']>, ParentType, ContextType, Partial<Types.QueryFaceVectorsArgs>>;
  hrKarkunById?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.QueryHrKarkunByIdArgs, '_id'>>;
  hrKarkunsById?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PersonType']>>>, ParentType, ContextType, RequireFields<Types.QueryHrKarkunsByIdArgs, '_ids'>>;
  inventoryStatistics?: Resolver<Types.Maybe<ResolversTypes['InventoryStatistics']>, ParentType, ContextType, RequireFields<Types.QueryInventoryStatisticsArgs, 'physicalStoreId'>>;
  isJobProcessorActive?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  issuanceFormById?: Resolver<Types.Maybe<ResolversTypes['IssuanceForm']>, ParentType, ContextType, RequireFields<Types.QueryIssuanceFormByIdArgs, '_id' | 'physicalStoreId'>>;
  issuanceFormsByMonth?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['IssuanceForm']>>>, ParentType, ContextType, RequireFields<Types.QueryIssuanceFormsByMonthArgs, 'month' | 'physicalStoreId'>>;
  issuanceFormsByStockItem?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['IssuanceForm']>>>, ParentType, ContextType, RequireFields<Types.QueryIssuanceFormsByStockItemArgs, 'physicalStoreId' | 'stockItemId'>>;
  itemCategoriesByPhysicalStoreId?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['ItemCategory']>>>, ParentType, ContextType, RequireFields<Types.QueryItemCategoriesByPhysicalStoreIdArgs, 'physicalStoreId'>>;
  itemCategoryById?: Resolver<Types.Maybe<ResolversTypes['ItemCategory']>, ParentType, ContextType, RequireFields<Types.QueryItemCategoryByIdArgs, '_id' | 'physicalStoreId'>>;
  jobById?: Resolver<Types.Maybe<ResolversTypes['JobType']>, ParentType, ContextType, RequireFields<Types.QueryJobByIdArgs, 'id'>>;
  karkunDutiesByKarkunId?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['KarkunDutyType']>>>, ParentType, ContextType, RequireFields<Types.QueryKarkunDutiesByKarkunIdArgs, 'karkunId'>>;
  karkunDutyById?: Resolver<Types.Maybe<ResolversTypes['KarkunDutyType']>, ParentType, ContextType, RequireFields<Types.QueryKarkunDutyByIdArgs, '_id'>>;
  locationById?: Resolver<Types.Maybe<ResolversTypes['Location']>, ParentType, ContextType, RequireFields<Types.QueryLocationByIdArgs, '_id' | 'physicalStoreId'>>;
  locationsByPhysicalStoreId?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['Location']>>>, ParentType, ContextType, RequireFields<Types.QueryLocationsByPhysicalStoreIdArgs, 'physicalStoreId'>>;
  mehfilById?: Resolver<Types.Maybe<ResolversTypes['MehfilType']>, ParentType, ContextType, RequireFields<Types.QueryMehfilByIdArgs, '_id'>>;
  mehfilKarkunByBarcodeId?: Resolver<Types.Maybe<ResolversTypes['MehfilKarkunType']>, ParentType, ContextType, RequireFields<Types.QueryMehfilKarkunByBarcodeIdArgs, 'barcode'>>;
  mehfilKarkunsByIds?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['MehfilKarkunType']>>>, ParentType, ContextType, RequireFields<Types.QueryMehfilKarkunsByIdsArgs, 'ids'>>;
  mehfilKarkunsByMehfilId?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['MehfilKarkunType']>>>, ParentType, ContextType, RequireFields<Types.QueryMehfilKarkunsByMehfilIdArgs, 'mehfilId'>>;
  pagedAttendanceByKarkun?: Resolver<Types.Maybe<ResolversTypes['PagedAttendanceType']>, ParentType, ContextType, Partial<Types.QueryPagedAttendanceByKarkunArgs>>;
  pagedCities?: Resolver<Types.Maybe<ResolversTypes['PagedCityType']>, ParentType, ContextType, Partial<Types.QueryPagedCitiesArgs>>;
  pagedDeletedPeople?: Resolver<Types.Maybe<ResolversTypes['PagedPeopleType']>, ParentType, ContextType, Partial<Types.QueryPagedDeletedPeopleArgs>>;
  pagedHrAuditLogs?: Resolver<Types.Maybe<ResolversTypes['PagedAuditLogType']>, ParentType, ContextType, Partial<Types.QueryPagedHrAuditLogsArgs>>;
  pagedHrKarkuns?: Resolver<Types.Maybe<ResolversTypes['PagedKarkunType']>, ParentType, ContextType, Partial<Types.QueryPagedHrKarkunsArgs>>;
  pagedIssuanceForms?: Resolver<Types.Maybe<ResolversTypes['PagedIssuanceForm']>, ParentType, ContextType, RequireFields<Types.QueryPagedIssuanceFormsArgs, 'physicalStoreId'>>;
  pagedJobLogs?: Resolver<Types.Maybe<ResolversTypes['PagedJobLogsType']>, ParentType, ContextType, Partial<Types.QueryPagedJobLogsArgs>>;
  pagedPeople?: Resolver<Types.Maybe<ResolversTypes['PagedPeopleType']>, ParentType, ContextType, Partial<Types.QueryPagedPeopleArgs>>;
  pagedPurchaseForms?: Resolver<Types.Maybe<ResolversTypes['PagedPurchaseForm']>, ParentType, ContextType, RequireFields<Types.QueryPagedPurchaseFormsArgs, 'physicalStoreId'>>;
  pagedSalariesByKarkun?: Resolver<Types.Maybe<ResolversTypes['PagedSalaryType']>, ParentType, ContextType, Partial<Types.QueryPagedSalariesByKarkunArgs>>;
  pagedScheduledJobs?: Resolver<Types.Maybe<ResolversTypes['PagedScheduledJobsType']>, ParentType, ContextType, Partial<Types.QueryPagedScheduledJobsArgs>>;
  pagedSecurityAuditLogs?: Resolver<Types.Maybe<ResolversTypes['PagedAuditLogType']>, ParentType, ContextType, Partial<Types.QueryPagedSecurityAuditLogsArgs>>;
  pagedSecurityUsers?: Resolver<Types.Maybe<ResolversTypes['PagedUserType']>, ParentType, ContextType, Partial<Types.QueryPagedSecurityUsersArgs>>;
  pagedSecurityVisitors?: Resolver<Types.Maybe<ResolversTypes['PagedVisitorType']>, ParentType, ContextType, Partial<Types.QueryPagedSecurityVisitorsArgs>>;
  pagedStockAdjustments?: Resolver<Types.Maybe<ResolversTypes['PagedStockAdjustment']>, ParentType, ContextType, RequireFields<Types.QueryPagedStockAdjustmentsArgs, 'physicalStoreId'>>;
  pagedStockItems?: Resolver<Types.Maybe<ResolversTypes['PagedStockItem']>, ParentType, ContextType, RequireFields<Types.QueryPagedStockItemsArgs, 'physicalStoreId'>>;
  pagedUserGroups?: Resolver<Types.Maybe<ResolversTypes['PagedUserGroupType']>, ParentType, ContextType, Partial<Types.QueryPagedUserGroupsArgs>>;
  pagedUsers?: Resolver<Types.Maybe<ResolversTypes['PagedUserType']>, ParentType, ContextType, Partial<Types.QueryPagedUsersArgs>>;
  pagedVisitorStays?: Resolver<Types.Maybe<ResolversTypes['PagedVisitorStayType']>, ParentType, ContextType, RequireFields<Types.QueryPagedVisitorStaysArgs, 'queryString'>>;
  pagedVisitorStaysByVisitorId?: Resolver<Types.Maybe<ResolversTypes['PagedVisitorStayType']>, ParentType, ContextType, RequireFields<Types.QueryPagedVisitorStaysByVisitorIdArgs, 'visitorId'>>;
  physicalStoreById?: Resolver<Types.Maybe<ResolversTypes['PhysicalStore']>, ParentType, ContextType, RequireFields<Types.QueryPhysicalStoreByIdArgs, 'id'>>;
  purchaseFormById?: Resolver<Types.Maybe<ResolversTypes['PurchaseForm']>, ParentType, ContextType, RequireFields<Types.QueryPurchaseFormByIdArgs, '_id' | 'physicalStoreId'>>;
  purchaseFormsByMonth?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchaseForm']>>>, ParentType, ContextType, RequireFields<Types.QueryPurchaseFormsByMonthArgs, 'month' | 'physicalStoreId'>>;
  purchaseFormsByStockItem?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchaseForm']>>>, ParentType, ContextType, RequireFields<Types.QueryPurchaseFormsByStockItemArgs, 'physicalStoreId' | 'stockItemId'>>;
  salariesByIds?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['SalaryType']>>>, ParentType, ContextType, RequireFields<Types.QuerySalariesByIdsArgs, 'ids'>>;
  salariesByMonth?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['SalaryType']>>>, ParentType, ContextType, RequireFields<Types.QuerySalariesByMonthArgs, 'month'>>;
  securityMehfilDutyById?: Resolver<Types.Maybe<ResolversTypes['MehfilDutyType']>, ParentType, ContextType, RequireFields<Types.QuerySecurityMehfilDutyByIdArgs, 'id'>>;
  securityMehfilLangarDishById?: Resolver<Types.Maybe<ResolversTypes['MehfilLangarDishType']>, ParentType, ContextType, RequireFields<Types.QuerySecurityMehfilLangarDishByIdArgs, 'id'>>;
  securityMehfilLangarLocationById?: Resolver<Types.Maybe<ResolversTypes['MehfilLangarLocationType']>, ParentType, ContextType, RequireFields<Types.QuerySecurityMehfilLangarLocationByIdArgs, 'id'>>;
  securityVisitorByCnic?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.QuerySecurityVisitorByCnicArgs, 'cnicNumbers'>>;
  securityVisitorByCnicOrContactNumber?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, Partial<Types.QuerySecurityVisitorByCnicOrContactNumberArgs>>;
  securityVisitorById?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.QuerySecurityVisitorByIdArgs, '_id'>>;
  stockAdjustmentById?: Resolver<Types.Maybe<ResolversTypes['StockAdjustment']>, ParentType, ContextType, RequireFields<Types.QueryStockAdjustmentByIdArgs, '_id' | 'physicalStoreId'>>;
  stockAdjustmentsByStockItem?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['StockAdjustment']>>>, ParentType, ContextType, RequireFields<Types.QueryStockAdjustmentsByStockItemArgs, 'physicalStoreId' | 'stockItemId'>>;
  stockItemById?: Resolver<Types.Maybe<ResolversTypes['StockItem']>, ParentType, ContextType, RequireFields<Types.QueryStockItemByIdArgs, '_id' | 'physicalStoreId'>>;
  stockItemsById?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['StockItem']>>>, ParentType, ContextType, RequireFields<Types.QueryStockItemsByIdArgs, '_ids' | 'physicalStoreId'>>;
  userById?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, Partial<Types.QueryUserByIdArgs>>;
  userGroupById?: Resolver<Types.Maybe<ResolversTypes['UserGroupType']>, ParentType, ContextType, RequireFields<Types.QueryUserGroupByIdArgs, '_id'>>;
  userNames?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType, Partial<Types.QueryUserNamesArgs>>;
  vendorById?: Resolver<Types.Maybe<ResolversTypes['Vendor']>, ParentType, ContextType, RequireFields<Types.QueryVendorByIdArgs, '_id' | 'physicalStoreId'>>;
  vendorsByPhysicalStoreId?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['Vendor']>>>, ParentType, ContextType, RequireFields<Types.QueryVendorsByPhysicalStoreIdArgs, 'physicalStoreId'>>;
  visitorStayById?: Resolver<Types.Maybe<ResolversTypes['VisitorStayType']>, ParentType, ContextType, RequireFields<Types.QueryVisitorStayByIdArgs, '_id'>>;
}>;

export type SalaryTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['SalaryType'] = ResolversParentTypes['SalaryType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  approvedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  approvedOn?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  approver?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType>;
  arrears?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  closingLoan?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  job?: Resolver<Types.Maybe<ResolversTypes['JobType']>, ParentType, ContextType>;
  jobId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  karkun?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType>;
  karkunId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  loanDeduction?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  month?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  netPayment?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  newLoan?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  openingLoan?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  otherDeduction?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  rashanMadad?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  salary?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type ScheduledJobTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['ScheduledJobType'] = ResolversParentTypes['ScheduledJobType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  disabled?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  failCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  failReason?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  failedAt?: Resolver<Types.Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  lastFinishedAt?: Resolver<Types.Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  lastRunAt?: Resolver<Types.Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  nextRunAt?: Resolver<Types.Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  progress?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  repeatInterval?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type SecurityLogTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['SecurityLogType'] = ResolversParentTypes['SecurityLogType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dataSource?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dataSourceDetail?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operationBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operationByImageId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operationByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operationDetails?: Resolver<Types.Maybe<ResolversTypes['JSONObject']>, ParentType, ContextType>;
  operationTime?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operationType?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userImageId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type StockAdjustmentResolvers<ContextType = any, ParentType extends ResolversParentTypes['StockAdjustment'] = ResolversParentTypes['StockAdjustment']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  adjustedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  adjustmentDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  adjustmentReason?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  approvedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  approvedOn?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isInflow?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  physicalStoreId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  quantity?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  refAdjustedBy?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType>;
  refPhysicalStore?: Resolver<Types.Maybe<ResolversTypes['PhysicalStore']>, ParentType, ContextType>;
  refStockItem?: Resolver<Types.Maybe<ResolversTypes['StockItem']>, ParentType, ContextType>;
  stockItemId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type StockItemResolvers<ContextType = any, ParentType extends ResolversParentTypes['StockItem'] = ResolversParentTypes['StockItem']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  categoryId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  categoryName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  company?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  currentStockLevel?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  details?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  formattedName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  issuanceFormsCount?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  minStockLevel?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  physicalStoreId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  purchaseFormsCount?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  refPhysicalStore?: Resolver<Types.Maybe<ResolversTypes['PhysicalStore']>, ParentType, ContextType>;
  startingStockLevel?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  stockAdjustmentsCount?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  totalStockLevel?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  unitOfMeasurement?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  verifiedOn?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export interface TimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Time'], any> {
  name: 'Time';
}

export interface TimestampScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Timestamp'], any> {
  name: 'Timestamp';
}

export interface UrlScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['URL'], any> {
  name: 'URL';
}

export type UserGroupTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserGroupType'] = ResolversParentTypes['UserGroupType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  instances?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  moduleName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  permissions?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
}>;

export type UserTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserType'] = ResolversParentTypes['UserType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  displayName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emailVerified?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  groups?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  instances?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  karkun?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType>;
  lastActiveAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastLoggedInAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  locked?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  permissions?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  person?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType>;
  personId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  username?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export interface UtcOffsetScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['UtcOffset'], any> {
  name: 'UtcOffset';
}

export type VendorResolvers<ContextType = any, ParentType extends ResolversParentTypes['Vendor'] = ResolversParentTypes['Vendor']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  address?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactPerson?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  notes?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  physicalStoreId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  usageCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type VisitorStayTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['VisitorStayType'] = ResolversParentTypes['VisitorStayType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cancelledDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dutyId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dutyName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dutyShiftName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fromDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isExpired?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isValid?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  numOfDays?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  refVisitor?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType>;
  shiftId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  shiftName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stayAllowedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stayReason?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  toDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  visitorId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  Attachment?: AttachmentResolvers<ContextType>;
  AttendanceType?: AttendanceTypeResolvers<ContextType>;
  AuditLogType?: AuditLogTypeResolvers<ContextType>;
  CityMehfilType?: CityMehfilTypeResolvers<ContextType>;
  CityType?: CityTypeResolvers<ContextType>;
  Currency?: GraphQLScalarType;
  Date?: GraphQLScalarType;
  DateTime?: GraphQLScalarType;
  DutyLocationType?: DutyLocationTypeResolvers<ContextType>;
  DutyShiftType?: DutyShiftTypeResolvers<ContextType>;
  DutyType?: DutyTypeResolvers<ContextType>;
  EmailAddress?: GraphQLScalarType;
  FaceVectorRecord?: FaceVectorRecordResolvers<ContextType>;
  InventoryStatistics?: InventoryStatisticsResolvers<ContextType>;
  IssuanceForm?: IssuanceFormResolvers<ContextType>;
  ItemCategory?: ItemCategoryResolvers<ContextType>;
  ItemWithQuantity?: ItemWithQuantityResolvers<ContextType>;
  ItemWithQuantityAndPrice?: ItemWithQuantityAndPriceResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  JSONObject?: GraphQLScalarType;
  JobDefinitionType?: JobDefinitionTypeResolvers<ContextType>;
  JobLogEntryType?: JobLogEntryTypeResolvers<ContextType>;
  JobType?: JobTypeResolvers<ContextType>;
  KarkunDutyType?: KarkunDutyTypeResolvers<ContextType>;
  Location?: LocationResolvers<ContextType>;
  MehfilDutyType?: MehfilDutyTypeResolvers<ContextType>;
  MehfilKarkunType?: MehfilKarkunTypeResolvers<ContextType>;
  MehfilLangarDishType?: MehfilLangarDishTypeResolvers<ContextType>;
  MehfilLangarLocationType?: MehfilLangarLocationTypeResolvers<ContextType>;
  MehfilType?: MehfilTypeResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  PagedAttendanceType?: PagedAttendanceTypeResolvers<ContextType>;
  PagedAuditLogType?: PagedAuditLogTypeResolvers<ContextType>;
  PagedCityType?: PagedCityTypeResolvers<ContextType>;
  PagedIssuanceForm?: PagedIssuanceFormResolvers<ContextType>;
  PagedJobLogsType?: PagedJobLogsTypeResolvers<ContextType>;
  PagedKarkunType?: PagedKarkunTypeResolvers<ContextType>;
  PagedPeopleType?: PagedPeopleTypeResolvers<ContextType>;
  PagedPurchaseForm?: PagedPurchaseFormResolvers<ContextType>;
  PagedSalaryType?: PagedSalaryTypeResolvers<ContextType>;
  PagedScheduledJobsType?: PagedScheduledJobsTypeResolvers<ContextType>;
  PagedSecurityLogType?: PagedSecurityLogTypeResolvers<ContextType>;
  PagedStockAdjustment?: PagedStockAdjustmentResolvers<ContextType>;
  PagedStockItem?: PagedStockItemResolvers<ContextType>;
  PagedUserGroupType?: PagedUserGroupTypeResolvers<ContextType>;
  PagedUserType?: PagedUserTypeResolvers<ContextType>;
  PagedVisitorStayType?: PagedVisitorStayTypeResolvers<ContextType>;
  PagedVisitorType?: PagedVisitorTypeResolvers<ContextType>;
  PeopleTagType?: PeopleTagTypeResolvers<ContextType>;
  PersonEmployeeDataType?: PersonEmployeeDataTypeResolvers<ContextType>;
  PersonImageVectorDataType?: PersonImageVectorDataTypeResolvers<ContextType>;
  PersonKarkunDataType?: PersonKarkunDataTypeResolvers<ContextType>;
  PersonSharedDataType?: PersonSharedDataTypeResolvers<ContextType>;
  PersonType?: PersonTypeResolvers<ContextType>;
  PersonVisitorDataType?: PersonVisitorDataTypeResolvers<ContextType>;
  PhoneNumber?: GraphQLScalarType;
  PhysicalStore?: PhysicalStoreResolvers<ContextType>;
  PostalCode?: GraphQLScalarType;
  PurchaseForm?: PurchaseFormResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  SalaryType?: SalaryTypeResolvers<ContextType>;
  ScheduledJobType?: ScheduledJobTypeResolvers<ContextType>;
  SecurityLogType?: SecurityLogTypeResolvers<ContextType>;
  StockAdjustment?: StockAdjustmentResolvers<ContextType>;
  StockItem?: StockItemResolvers<ContextType>;
  Time?: GraphQLScalarType;
  Timestamp?: GraphQLScalarType;
  URL?: GraphQLScalarType;
  UserGroupType?: UserGroupTypeResolvers<ContextType>;
  UserType?: UserTypeResolvers<ContextType>;
  UtcOffset?: GraphQLScalarType;
  Vendor?: VendorResolvers<ContextType>;
  VisitorStayType?: VisitorStayTypeResolvers<ContextType>;
}>;

export type DirectiveResolvers<ContextType = any> = ResolversObject<{
  checkInstanceAccess?: CheckInstanceAccessDirectiveResolver<any, any, ContextType>;
  checkPermissions?: CheckPermissionsDirectiveResolver<any, any, ContextType>;
}>;
