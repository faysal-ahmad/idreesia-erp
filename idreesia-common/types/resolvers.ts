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
  AuditLogFilter: Types.AuditLogFilter;
  AuditLogType: ResolverTypeWrapper<Types.AuditLogType>;
  Boolean: ResolverTypeWrapper<Types.Scalars['Boolean']['output']>;
  CityFilter: Types.CityFilter;
  CityMehfilType: ResolverTypeWrapper<Types.CityMehfilType>;
  CityType: ResolverTypeWrapper<Types.CityType>;
  CommitteeBasicType: ResolverTypeWrapper<Types.CommitteeBasicType>;
  CommitteeFeatureType: ResolverTypeWrapper<Types.CommitteeFeatureType>;
  CommitteeMemberType: ResolverTypeWrapper<Types.CommitteeMemberType>;
  CommitteeMembersPageType: ResolverTypeWrapper<Types.CommitteeMembersPageType>;
  CommitteeRole: Types.CommitteeRole;
  CommitteeType: ResolverTypeWrapper<Types.CommitteeType>;
  Currency: ResolverTypeWrapper<Types.Scalars['Currency']['output']>;
  DaAccessType: ResolverTypeWrapper<Types.DaAccessType>;
  DaAttendanceSheetRowType: ResolverTypeWrapper<Types.DaAttendanceSheetRowType>;
  DaDutyMemberType: ResolverTypeWrapper<Types.DaDutyMemberType>;
  DaDutyType: ResolverTypeWrapper<Types.DaDutyType>;
  DaGeoLocationInput: Types.DaGeoLocationInput;
  DaMehfilDutyType: ResolverTypeWrapper<Types.DaMehfilDutyType>;
  DaMyDutyType: ResolverTypeWrapper<Types.DaMyDutyType>;
  DaMyLocationType: ResolverTypeWrapper<Types.DaMyLocationType>;
  DaPlanDayType: ResolverTypeWrapper<Types.DaPlanDayType>;
  DaPlanDaysType: ResolverTypeWrapper<Types.DaPlanDaysType>;
  DaPlanKarkunType: ResolverTypeWrapper<Types.DaPlanKarkunType>;
  Date: ResolverTypeWrapper<Types.Scalars['Date']['output']>;
  DateTime: ResolverTypeWrapper<Types.Scalars['DateTime']['output']>;
  DiscussionAttachmentType: ResolverTypeWrapper<Types.DiscussionAttachmentType>;
  DiscussionInfoType: ResolverTypeWrapper<Types.DiscussionInfoType>;
  DiscussionMemberType: ResolverTypeWrapper<Types.DiscussionMemberType>;
  DiscussionMessagePageType: ResolverTypeWrapper<Types.DiscussionMessagePageType>;
  DiscussionMessageType: ResolverTypeWrapper<Types.DiscussionMessageType>;
  DiscussionReactionType: ResolverTypeWrapper<Types.DiscussionReactionType>;
  DiscussionSyncType: ResolverTypeWrapper<Types.DiscussionSyncType>;
  DiscussionVideoCallInfoType: ResolverTypeWrapper<Types.DiscussionVideoCallInfoType>;
  DiscussionVideoCallType: ResolverTypeWrapper<Types.DiscussionVideoCallType>;
  DuplicatePersonGroupType: ResolverTypeWrapper<Types.DuplicatePersonGroupType>;
  DuplicatePersonSummaryType: ResolverTypeWrapper<Types.DuplicatePersonSummaryType>;
  DutiesAttendancePermission: Types.DutiesAttendancePermission;
  DutyAttendanceCardType: ResolverTypeWrapper<Types.DutyAttendanceCardType>;
  DutyAttendanceSheetRowType: ResolverTypeWrapper<Types.DutyAttendanceSheetRowType>;
  DutyLocationType: ResolverTypeWrapper<Types.DutyLocationType>;
  DutyPlanDaysDayType: ResolverTypeWrapper<Types.DutyPlanDaysDayType>;
  DutyPlanDaysKarkunType: ResolverTypeWrapper<Types.DutyPlanDaysKarkunType>;
  DutyPlanDaysSlotType: ResolverTypeWrapper<Types.DutyPlanDaysSlotType>;
  DutyPlanDaysType: ResolverTypeWrapper<Types.DutyPlanDaysType>;
  DutyPlanWeekSlotType: ResolverTypeWrapper<Types.DutyPlanWeekSlotType>;
  DutyPlanWeekType: ResolverTypeWrapper<Types.DutyPlanWeekType>;
  DutyShiftType: ResolverTypeWrapper<Types.DutyShiftType>;
  DutyType: ResolverTypeWrapper<Types.DutyType>;
  EmailAddress: ResolverTypeWrapper<Types.Scalars['EmailAddress']['output']>;
  EnrolledTrustedDeviceType: ResolverTypeWrapper<Types.EnrolledTrustedDeviceType>;
  FaceVectorResultType: ResolverTypeWrapper<Types.FaceVectorResultType>;
  Float: ResolverTypeWrapper<Types.Scalars['Float']['output']>;
  FreeFormCityType: ResolverTypeWrapper<Types.FreeFormCityType>;
  FreeFormValueType: ResolverTypeWrapper<Types.FreeFormValueType>;
  HrGroupMember: ResolverTypeWrapper<Types.HrGroupMember>;
  HrPermissionAssignment: ResolverTypeWrapper<Types.HrPermissionAssignment>;
  HrPermissionGroup: ResolverTypeWrapper<Types.HrPermissionGroup>;
  HrPermissionGroupHolder: ResolverTypeWrapper<Types.HrPermissionGroupHolder>;
  HrPermissionHolder: ResolverTypeWrapper<Types.HrPermissionHolder>;
  HrPermissionKarkunType: ResolverTypeWrapper<Types.HrPermissionKarkunType>;
  HrUserGroup: ResolverTypeWrapper<Types.HrUserGroup>;
  InboxAttachmentType: ResolverTypeWrapper<Types.InboxAttachmentType>;
  InboxConversationDetailType: ResolverTypeWrapper<Types.InboxConversationDetailType>;
  InboxConversationFilter: Types.InboxConversationFilter;
  InboxConversationType: ResolverTypeWrapper<Types.InboxConversationType>;
  InboxMessageType: ResolverTypeWrapper<Types.InboxMessageType>;
  Int: ResolverTypeWrapper<Types.Scalars['Int']['output']>;
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
  KarkunFilter: Types.KarkunFilter;
  Location: ResolverTypeWrapper<Types.Location>;
  MehfilDetailsAccessType: ResolverTypeWrapper<Types.MehfilDetailsAccessType>;
  MehfilDetailsPermission: Types.MehfilDetailsPermission;
  MehfilDutyType: ResolverTypeWrapper<Types.MehfilDutyType>;
  MehfilKarkunType: ResolverTypeWrapper<Types.MehfilKarkunType>;
  MehfilKarkunsPermission: Types.MehfilKarkunsPermission;
  MehfilLangarDishType: ResolverTypeWrapper<Types.MehfilLangarDishType>;
  MehfilLangarLocationType: ResolverTypeWrapper<Types.MehfilLangarLocationType>;
  MehfilLocationKarkunType: ResolverTypeWrapper<Types.MehfilLocationKarkunType>;
  MehfilPermissionsPermission: Types.MehfilPermissionsPermission;
  MehfilPermissionsType: ResolverTypeWrapper<Types.MehfilPermissionsType>;
  MehfilType: ResolverTypeWrapper<Types.MehfilType>;
  MpGroupType: ResolverTypeWrapper<Types.MpGroupType>;
  MpKarkunType: ResolverTypeWrapper<Types.MpKarkunType>;
  MpPermissionType: ResolverTypeWrapper<Types.MpPermissionType>;
  MpUserType: ResolverTypeWrapper<Types.MpUserType>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  MyMehfilDetailsLocationType: ResolverTypeWrapper<Types.MyMehfilDetailsLocationType>;
  MyMehfilKarkunsLocationType: ResolverTypeWrapper<Types.MyMehfilKarkunsLocationType>;
  MyMehfilPermissionsLocationType: ResolverTypeWrapper<Types.MyMehfilPermissionsLocationType>;
  NotificationCountType: ResolverTypeWrapper<Types.NotificationCountType>;
  NotificationType: ResolverTypeWrapper<Types.NotificationType>;
  OrgLocationFeaturePermissionType: ResolverTypeWrapper<Types.OrgLocationFeaturePermissionType>;
  OrgLocationFeaturePermissionUserType: ResolverTypeWrapper<Types.OrgLocationFeaturePermissionUserType>;
  OrgLocationFeaturePermissionsType: ResolverTypeWrapper<Types.OrgLocationFeaturePermissionsType>;
  OrgLocationKarkunType: ResolverTypeWrapper<Types.OrgLocationKarkunType>;
  OrgLocationMehfilDetailsInput: Types.OrgLocationMehfilDetailsInput;
  OrgLocationMehfilDetailsType: ResolverTypeWrapper<Types.OrgLocationMehfilDetailsType>;
  OrgLocationObserverStatType: ResolverTypeWrapper<Types.OrgLocationObserverStatType>;
  OrgLocationType: ResolverTypeWrapper<Types.OrgLocationType>;
  PagedAuditLogType: ResolverTypeWrapper<Types.PagedAuditLogType>;
  PagedCityType: ResolverTypeWrapper<Types.PagedCityType>;
  PagedFreeFormCity: ResolverTypeWrapper<Types.PagedFreeFormCity>;
  PagedFreeFormValue: ResolverTypeWrapper<Types.PagedFreeFormValue>;
  PagedHrPermissionKarkunType: ResolverTypeWrapper<Types.PagedHrPermissionKarkunType>;
  PagedInboxConversationType: ResolverTypeWrapper<Types.PagedInboxConversationType>;
  PagedIssuanceForm: ResolverTypeWrapper<Types.PagedIssuanceForm>;
  PagedJobLogsType: ResolverTypeWrapper<Types.PagedJobLogsType>;
  PagedKarkunType: ResolverTypeWrapper<Types.PagedKarkunType>;
  PagedMehfilLocationKarkunType: ResolverTypeWrapper<Types.PagedMehfilLocationKarkunType>;
  PagedMpKarkunType: ResolverTypeWrapper<Types.PagedMpKarkunType>;
  PagedOrgLocationKarkunType: ResolverTypeWrapper<Types.PagedOrgLocationKarkunType>;
  PagedPeopleType: ResolverTypeWrapper<Types.PagedPeopleType>;
  PagedPurchaseForm: ResolverTypeWrapper<Types.PagedPurchaseForm>;
  PagedPurchasingCatalogItems: ResolverTypeWrapper<Types.PagedPurchasingCatalogItems>;
  PagedPurchasingInvoices: ResolverTypeWrapper<Types.PagedPurchasingInvoices>;
  PagedPurchasingKarkunType: ResolverTypeWrapper<Types.PagedPurchasingKarkunType>;
  PagedPurchasingOrders: ResolverTypeWrapper<Types.PagedPurchasingOrders>;
  PagedPurchasingPayments: ResolverTypeWrapper<Types.PagedPurchasingPayments>;
  PagedPurchasingQuotes: ResolverTypeWrapper<Types.PagedPurchasingQuotes>;
  PagedPurchasingReceipts: ResolverTypeWrapper<Types.PagedPurchasingReceipts>;
  PagedPurchasingRequisitions: ResolverTypeWrapper<Types.PagedPurchasingRequisitions>;
  PagedPurchasingVendors: ResolverTypeWrapper<Types.PagedPurchasingVendors>;
  PagedSalaryType: ResolverTypeWrapper<Types.PagedSalaryType>;
  PagedScheduledJobsType: ResolverTypeWrapper<Types.PagedScheduledJobsType>;
  PagedSecurityLogType: ResolverTypeWrapper<Types.PagedSecurityLogType>;
  PagedSecurityPermissionKarkunType: ResolverTypeWrapper<Types.PagedSecurityPermissionKarkunType>;
  PagedSecurityServerAlertGroupType: ResolverTypeWrapper<Types.PagedSecurityServerAlertGroupType>;
  PagedSecurityServerAlertType: ResolverTypeWrapper<Types.PagedSecurityServerAlertType>;
  PagedSecurityServerProfileType: ResolverTypeWrapper<Types.PagedSecurityServerProfileType>;
  PagedStockAdjustment: ResolverTypeWrapper<Types.PagedStockAdjustment>;
  PagedStockItem: ResolverTypeWrapper<Types.PagedStockItem>;
  PagedUserGroupType: ResolverTypeWrapper<Types.PagedUserGroupType>;
  PagedUserType: ResolverTypeWrapper<Types.PagedUserType>;
  PagedVisitorStayType: ResolverTypeWrapper<Types.PagedVisitorStayType>;
  PagedVisitorType: ResolverTypeWrapper<Types.PagedVisitorType>;
  PagedWorkspaceDocumentType: ResolverTypeWrapper<Types.PagedWorkspaceDocumentType>;
  PagedWorkspaceKarkunType: ResolverTypeWrapper<Types.PagedWorkspaceKarkunType>;
  PagedWorkspaceMeetingActionItemType: ResolverTypeWrapper<Types.PagedWorkspaceMeetingActionItemType>;
  PagedWorkspaceMeetingType: ResolverTypeWrapper<Types.PagedWorkspaceMeetingType>;
  PagedWorkspaceMonitoringAlertType: ResolverTypeWrapper<Types.PagedWorkspaceMonitoringAlertType>;
  PagedWorkspaceMonitoringProfileType: ResolverTypeWrapper<Types.PagedWorkspaceMonitoringProfileType>;
  PagedWorkspaceNightStayType: ResolverTypeWrapper<Types.PagedWorkspaceNightStayType>;
  PagedWorkspacePollType: ResolverTypeWrapper<Types.PagedWorkspacePollType>;
  PagedWorkspaceProjectType: ResolverTypeWrapper<Types.PagedWorkspaceProjectType>;
  PagedWorkspaceTaskCommentType: ResolverTypeWrapper<Types.PagedWorkspaceTaskCommentType>;
  PagedWorkspaceTaskType: ResolverTypeWrapper<Types.PagedWorkspaceTaskType>;
  PeopleTagType: ResolverTypeWrapper<Types.PeopleTagType>;
  Permission: Types.Permission;
  PersonBasicSharedDataType: ResolverTypeWrapper<Types.PersonBasicSharedDataType>;
  PersonBasicType: ResolverTypeWrapper<Types.PersonBasicType>;
  PersonEmployeeDataType: ResolverTypeWrapper<Types.PersonEmployeeDataType>;
  PersonFilter: Types.PersonFilter;
  PersonImageVectorDataType: ResolverTypeWrapper<Types.PersonImageVectorDataType>;
  PersonKarkunDataType: ResolverTypeWrapper<Types.PersonKarkunDataType>;
  PersonRelationCountType: ResolverTypeWrapper<Types.PersonRelationCountType>;
  PersonRelationCounts: ResolverTypeWrapper<Types.PersonRelationCounts>;
  PersonSharedDataType: ResolverTypeWrapper<Types.PersonSharedDataType>;
  PersonType: ResolverTypeWrapper<Types.PersonType>;
  PersonVisitorDataType: ResolverTypeWrapper<Types.PersonVisitorDataType>;
  PhoneNumber: ResolverTypeWrapper<Types.Scalars['PhoneNumber']['output']>;
  PhysicalStore: ResolverTypeWrapper<Types.PhysicalStore>;
  PostalCode: ResolverTypeWrapper<Types.Scalars['PostalCode']['output']>;
  PurchaseForm: ResolverTypeWrapper<Types.PurchaseForm>;
  PurchasingAttachment: ResolverTypeWrapper<Types.PurchasingAttachment>;
  PurchasingAttachmentDownload: ResolverTypeWrapper<Types.PurchasingAttachmentDownload>;
  PurchasingAttachmentUpload: ResolverTypeWrapper<Types.PurchasingAttachmentUpload>;
  PurchasingAuditLogFilter: Types.PurchasingAuditLogFilter;
  PurchasingCatalogItem: ResolverTypeWrapper<Types.PurchasingCatalogItem>;
  PurchasingDashboard: ResolverTypeWrapper<Types.PurchasingDashboard>;
  PurchasingGroupMember: ResolverTypeWrapper<Types.PurchasingGroupMember>;
  PurchasingInvoice: ResolverTypeWrapper<Types.PurchasingInvoice>;
  PurchasingInvoiceLine: ResolverTypeWrapper<Types.PurchasingInvoiceLine>;
  PurchasingKarkunType: ResolverTypeWrapper<Types.PurchasingKarkunType>;
  PurchasingLedgerEntry: ResolverTypeWrapper<Types.PurchasingLedgerEntry>;
  PurchasingMonthlySpending: ResolverTypeWrapper<Types.PurchasingMonthlySpending>;
  PurchasingOpenOrder: ResolverTypeWrapper<Types.PurchasingOpenOrder>;
  PurchasingOrder: ResolverTypeWrapper<Types.PurchasingOrder>;
  PurchasingOrderLine: ResolverTypeWrapper<Types.PurchasingOrderLine>;
  PurchasingPayablesAgingRow: ResolverTypeWrapper<Types.PurchasingPayablesAgingRow>;
  PurchasingPayment: ResolverTypeWrapper<Types.PurchasingPayment>;
  PurchasingPaymentAllocation: ResolverTypeWrapper<Types.PurchasingPaymentAllocation>;
  PurchasingPaymentAllocationInput: Types.PurchasingPaymentAllocationInput;
  PurchasingPermissionAssignment: ResolverTypeWrapper<Types.PurchasingPermissionAssignment>;
  PurchasingPermissionGroup: ResolverTypeWrapper<Types.PurchasingPermissionGroup>;
  PurchasingPermissionGroupHolder: ResolverTypeWrapper<Types.PurchasingPermissionGroupHolder>;
  PurchasingPermissionHolder: ResolverTypeWrapper<Types.PurchasingPermissionHolder>;
  PurchasingPricedLineInput: Types.PurchasingPricedLineInput;
  PurchasingQuote: ResolverTypeWrapper<Types.PurchasingQuote>;
  PurchasingQuoteLine: ResolverTypeWrapper<Types.PurchasingQuoteLine>;
  PurchasingReceipt: ResolverTypeWrapper<Types.PurchasingReceipt>;
  PurchasingReceiptLine: ResolverTypeWrapper<Types.PurchasingReceiptLine>;
  PurchasingReceiptLineInput: Types.PurchasingReceiptLineInput;
  PurchasingRequisition: ResolverTypeWrapper<Types.PurchasingRequisition>;
  PurchasingRequisitionLine: ResolverTypeWrapper<Types.PurchasingRequisitionLine>;
  PurchasingRequisitionLineInput: Types.PurchasingRequisitionLineInput;
  PurchasingUserGroup: ResolverTypeWrapper<Types.PurchasingUserGroup>;
  PurchasingVendor: ResolverTypeWrapper<Types.PurchasingVendor>;
  PurchasingVendorLedger: ResolverTypeWrapper<Types.PurchasingVendorLedger>;
  PurchasingVendorSpending: ResolverTypeWrapper<Types.PurchasingVendorSpending>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  ReferenceDutyShiftType: ResolverTypeWrapper<Types.ReferenceDutyShiftType>;
  ReferenceDutyType: ResolverTypeWrapper<Types.ReferenceDutyType>;
  ReferenceOrgLocationType: ResolverTypeWrapper<Types.ReferenceOrgLocationType>;
  ReferencePhysicalStoreType: ResolverTypeWrapper<Types.ReferencePhysicalStoreType>;
  SalaryType: ResolverTypeWrapper<Types.SalaryType>;
  ScheduledJobType: ResolverTypeWrapper<Types.ScheduledJobType>;
  ScheduledJobsFilterType: Types.ScheduledJobsFilterType;
  SecurityGroupMember: ResolverTypeWrapper<Types.SecurityGroupMember>;
  SecurityLogFilter: Types.SecurityLogFilter;
  SecurityLogType: ResolverTypeWrapper<Types.SecurityLogType>;
  SecurityLogUserOption: ResolverTypeWrapper<Types.SecurityLogUserOption>;
  SecurityPermissionAssignment: ResolverTypeWrapper<Types.SecurityPermissionAssignment>;
  SecurityPermissionGroup: ResolverTypeWrapper<Types.SecurityPermissionGroup>;
  SecurityPermissionGroupHolder: ResolverTypeWrapper<Types.SecurityPermissionGroupHolder>;
  SecurityPermissionHolder: ResolverTypeWrapper<Types.SecurityPermissionHolder>;
  SecurityPermissionKarkunType: ResolverTypeWrapper<Types.SecurityPermissionKarkunType>;
  SecurityServerAlertFilter: Types.SecurityServerAlertFilter;
  SecurityServerAlertGroupType: ResolverTypeWrapper<Types.SecurityServerAlertGroupType>;
  SecurityServerAlertSyncStatusType: ResolverTypeWrapper<Types.SecurityServerAlertSyncStatusType>;
  SecurityServerAlertType: ResolverTypeWrapper<Types.SecurityServerAlertType>;
  SecurityServerChannelConnectionInput: Types.SecurityServerChannelConnectionInput;
  SecurityServerChannelConnectionType: ResolverTypeWrapper<Types.SecurityServerChannelConnectionType>;
  SecurityServerChannelType: ResolverTypeWrapper<Types.SecurityServerChannelType>;
  SecurityServerProfileFilter: Types.SecurityServerProfileFilter;
  SecurityServerProfileImageType: ResolverTypeWrapper<Types.SecurityServerProfileImageType>;
  SecurityServerProfileType: ResolverTypeWrapper<Types.SecurityServerProfileType>;
  SecurityServerUsageChannelType: ResolverTypeWrapper<Types.SecurityServerUsageChannelType>;
  SecurityServerUsageServerType: ResolverTypeWrapper<Types.SecurityServerUsageServerType>;
  SecurityServerUsageSummaryType: ResolverTypeWrapper<Types.SecurityServerUsageSummaryType>;
  SecurityUserGroup: ResolverTypeWrapper<Types.SecurityUserGroup>;
  StockAdjustment: ResolverTypeWrapper<Types.StockAdjustment>;
  StockItem: ResolverTypeWrapper<Types.StockItem>;
  String: ResolverTypeWrapper<Types.Scalars['String']['output']>;
  SyncOrgLocationObserversResult: ResolverTypeWrapper<Types.SyncOrgLocationObserversResult>;
  TeamMemberType: ResolverTypeWrapper<Types.TeamMemberType>;
  TeamType: ResolverTypeWrapper<Types.TeamType>;
  Time: ResolverTypeWrapper<Types.Scalars['Time']['output']>;
  Timestamp: ResolverTypeWrapper<Types.Scalars['Timestamp']['output']>;
  TrustedDeviceType: ResolverTypeWrapper<Types.TrustedDeviceType>;
  TwoFactorSetupType: ResolverTypeWrapper<Types.TwoFactorSetupType>;
  URL: ResolverTypeWrapper<Types.Scalars['URL']['output']>;
  UserAccountAvailabilityType: ResolverTypeWrapper<Types.UserAccountAvailabilityType>;
  UserFilter: Types.UserFilter;
  UserGroupMemberType: ResolverTypeWrapper<Types.UserGroupMemberType>;
  UserGroupType: ResolverTypeWrapper<Types.UserGroupType>;
  UserType: ResolverTypeWrapper<Types.UserType>;
  UtcOffset: ResolverTypeWrapper<Types.Scalars['UtcOffset']['output']>;
  Vendor: ResolverTypeWrapper<Types.Vendor>;
  VisitorFaceMatchType: ResolverTypeWrapper<Types.VisitorFaceMatchType>;
  VisitorFilter: Types.VisitorFilter;
  VisitorStayType: ResolverTypeWrapper<Types.VisitorStayType>;
  WorkspaceCommitteeMemberType: ResolverTypeWrapper<Types.WorkspaceCommitteeMemberType>;
  WorkspaceCommitteeType: ResolverTypeWrapper<Types.WorkspaceCommitteeType>;
  WorkspaceDocumentActivityType: ResolverTypeWrapper<Types.WorkspaceDocumentActivityType>;
  WorkspaceDocumentDownloadType: ResolverTypeWrapper<Types.WorkspaceDocumentDownloadType>;
  WorkspaceDocumentFolderContentsType: ResolverTypeWrapper<Types.WorkspaceDocumentFolderContentsType>;
  WorkspaceDocumentFolderType: ResolverTypeWrapper<Types.WorkspaceDocumentFolderType>;
  WorkspaceDocumentLockType: ResolverTypeWrapper<Types.WorkspaceDocumentLockType>;
  WorkspaceDocumentTrashType: ResolverTypeWrapper<Types.WorkspaceDocumentTrashType>;
  WorkspaceDocumentType: ResolverTypeWrapper<Types.WorkspaceDocumentType>;
  WorkspaceDocumentUploadType: ResolverTypeWrapper<Types.WorkspaceDocumentUploadType>;
  WorkspaceDocumentVersionType: ResolverTypeWrapper<Types.WorkspaceDocumentVersionType>;
  WorkspaceDocumentsInfoType: ResolverTypeWrapper<Types.WorkspaceDocumentsInfoType>;
  WorkspaceKarkunType: ResolverTypeWrapper<Types.WorkspaceKarkunType>;
  WorkspaceLocationType: ResolverTypeWrapper<Types.WorkspaceLocationType>;
  WorkspaceMeetingActionItemInput: Types.WorkspaceMeetingActionItemInput;
  WorkspaceMeetingActionItemType: ResolverTypeWrapper<Types.WorkspaceMeetingActionItemType>;
  WorkspaceMeetingActivityType: ResolverTypeWrapper<Types.WorkspaceMeetingActivityType>;
  WorkspaceMeetingAgendaItemInput: Types.WorkspaceMeetingAgendaItemInput;
  WorkspaceMeetingAgendaItemType: ResolverTypeWrapper<Types.WorkspaceMeetingAgendaItemType>;
  WorkspaceMeetingAttachmentType: ResolverTypeWrapper<Types.WorkspaceMeetingAttachmentType>;
  WorkspaceMeetingAttendanceInput: Types.WorkspaceMeetingAttendanceInput;
  WorkspaceMeetingDownloadType: ResolverTypeWrapper<Types.WorkspaceMeetingDownloadType>;
  WorkspaceMeetingInput: Types.WorkspaceMeetingInput;
  WorkspaceMeetingMemberType: ResolverTypeWrapper<Types.WorkspaceMeetingMemberType>;
  WorkspaceMeetingParticipantType: ResolverTypeWrapper<Types.WorkspaceMeetingParticipantType>;
  WorkspaceMeetingType: ResolverTypeWrapper<Types.WorkspaceMeetingType>;
  WorkspaceMeetingUploadType: ResolverTypeWrapper<Types.WorkspaceMeetingUploadType>;
  WorkspaceMeetingVideoCallInfoType: ResolverTypeWrapper<Types.WorkspaceMeetingVideoCallInfoType>;
  WorkspaceMeetingVideoCallType: ResolverTypeWrapper<Types.WorkspaceMeetingVideoCallType>;
  WorkspaceMeetingsInfoType: ResolverTypeWrapper<Types.WorkspaceMeetingsInfoType>;
  WorkspaceMehfilDetailsType: ResolverTypeWrapper<Types.WorkspaceMehfilDetailsType>;
  WorkspaceMonitoringAlertType: ResolverTypeWrapper<Types.WorkspaceMonitoringAlertType>;
  WorkspaceMonitoringProfilePhotoType: ResolverTypeWrapper<Types.WorkspaceMonitoringProfilePhotoType>;
  WorkspaceMonitoringProfileType: ResolverTypeWrapper<Types.WorkspaceMonitoringProfileType>;
  WorkspaceNightStayType: ResolverTypeWrapper<Types.WorkspaceNightStayType>;
  WorkspacePollActivityType: ResolverTypeWrapper<Types.WorkspacePollActivityType>;
  WorkspacePollAnswerInput: Types.WorkspacePollAnswerInput;
  WorkspacePollAnswerType: ResolverTypeWrapper<Types.WorkspacePollAnswerType>;
  WorkspacePollInput: Types.WorkspacePollInput;
  WorkspacePollOptionInput: Types.WorkspacePollOptionInput;
  WorkspacePollOptionResultType: ResolverTypeWrapper<Types.WorkspacePollOptionResultType>;
  WorkspacePollOptionType: ResolverTypeWrapper<Types.WorkspacePollOptionType>;
  WorkspacePollQuestionInput: Types.WorkspacePollQuestionInput;
  WorkspacePollQuestionResultType: ResolverTypeWrapper<Types.WorkspacePollQuestionResultType>;
  WorkspacePollQuestionType: ResolverTypeWrapper<Types.WorkspacePollQuestionType>;
  WorkspacePollResultsType: ResolverTypeWrapper<Types.WorkspacePollResultsType>;
  WorkspacePollType: ResolverTypeWrapper<Types.WorkspacePollType>;
  WorkspacePollVoterType: ResolverTypeWrapper<Types.WorkspacePollVoterType>;
  WorkspacePollsInfoType: ResolverTypeWrapper<Types.WorkspacePollsInfoType>;
  WorkspaceProjectInput: Types.WorkspaceProjectInput;
  WorkspaceProjectMemberType: ResolverTypeWrapper<Types.WorkspaceProjectMemberType>;
  WorkspaceProjectParticipantType: ResolverTypeWrapper<Types.WorkspaceProjectParticipantType>;
  WorkspaceProjectType: ResolverTypeWrapper<Types.WorkspaceProjectType>;
  WorkspaceProjectsActivityType: ResolverTypeWrapper<Types.WorkspaceProjectsActivityType>;
  WorkspaceProjectsInfoType: ResolverTypeWrapper<Types.WorkspaceProjectsInfoType>;
  WorkspaceStayHistoryItemType: ResolverTypeWrapper<Types.WorkspaceStayHistoryItemType>;
  WorkspaceTaskCommentType: ResolverTypeWrapper<Types.WorkspaceTaskCommentType>;
  WorkspaceTaskInput: Types.WorkspaceTaskInput;
  WorkspaceTaskType: ResolverTypeWrapper<Types.WorkspaceTaskType>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Attachment: Types.Attachment;
  AuditLogFilter: Types.AuditLogFilter;
  AuditLogType: Types.AuditLogType;
  Boolean: Types.Scalars['Boolean']['output'];
  CityFilter: Types.CityFilter;
  CityMehfilType: Types.CityMehfilType;
  CityType: Types.CityType;
  CommitteeBasicType: Types.CommitteeBasicType;
  CommitteeFeatureType: Types.CommitteeFeatureType;
  CommitteeMemberType: Types.CommitteeMemberType;
  CommitteeMembersPageType: Types.CommitteeMembersPageType;
  CommitteeType: Types.CommitteeType;
  Currency: Types.Scalars['Currency']['output'];
  DaAccessType: Types.DaAccessType;
  DaAttendanceSheetRowType: Types.DaAttendanceSheetRowType;
  DaDutyMemberType: Types.DaDutyMemberType;
  DaDutyType: Types.DaDutyType;
  DaGeoLocationInput: Types.DaGeoLocationInput;
  DaMehfilDutyType: Types.DaMehfilDutyType;
  DaMyDutyType: Types.DaMyDutyType;
  DaMyLocationType: Types.DaMyLocationType;
  DaPlanDayType: Types.DaPlanDayType;
  DaPlanDaysType: Types.DaPlanDaysType;
  DaPlanKarkunType: Types.DaPlanKarkunType;
  Date: Types.Scalars['Date']['output'];
  DateTime: Types.Scalars['DateTime']['output'];
  DiscussionAttachmentType: Types.DiscussionAttachmentType;
  DiscussionInfoType: Types.DiscussionInfoType;
  DiscussionMemberType: Types.DiscussionMemberType;
  DiscussionMessagePageType: Types.DiscussionMessagePageType;
  DiscussionMessageType: Types.DiscussionMessageType;
  DiscussionReactionType: Types.DiscussionReactionType;
  DiscussionSyncType: Types.DiscussionSyncType;
  DiscussionVideoCallInfoType: Types.DiscussionVideoCallInfoType;
  DiscussionVideoCallType: Types.DiscussionVideoCallType;
  DuplicatePersonGroupType: Types.DuplicatePersonGroupType;
  DuplicatePersonSummaryType: Types.DuplicatePersonSummaryType;
  DutyAttendanceCardType: Types.DutyAttendanceCardType;
  DutyAttendanceSheetRowType: Types.DutyAttendanceSheetRowType;
  DutyLocationType: Types.DutyLocationType;
  DutyPlanDaysDayType: Types.DutyPlanDaysDayType;
  DutyPlanDaysKarkunType: Types.DutyPlanDaysKarkunType;
  DutyPlanDaysSlotType: Types.DutyPlanDaysSlotType;
  DutyPlanDaysType: Types.DutyPlanDaysType;
  DutyPlanWeekSlotType: Types.DutyPlanWeekSlotType;
  DutyPlanWeekType: Types.DutyPlanWeekType;
  DutyShiftType: Types.DutyShiftType;
  DutyType: Types.DutyType;
  EmailAddress: Types.Scalars['EmailAddress']['output'];
  EnrolledTrustedDeviceType: Types.EnrolledTrustedDeviceType;
  FaceVectorResultType: Types.FaceVectorResultType;
  Float: Types.Scalars['Float']['output'];
  FreeFormCityType: Types.FreeFormCityType;
  FreeFormValueType: Types.FreeFormValueType;
  HrGroupMember: Types.HrGroupMember;
  HrPermissionAssignment: Types.HrPermissionAssignment;
  HrPermissionGroup: Types.HrPermissionGroup;
  HrPermissionGroupHolder: Types.HrPermissionGroupHolder;
  HrPermissionHolder: Types.HrPermissionHolder;
  HrPermissionKarkunType: Types.HrPermissionKarkunType;
  HrUserGroup: Types.HrUserGroup;
  InboxAttachmentType: Types.InboxAttachmentType;
  InboxConversationDetailType: Types.InboxConversationDetailType;
  InboxConversationFilter: Types.InboxConversationFilter;
  InboxConversationType: Types.InboxConversationType;
  InboxMessageType: Types.InboxMessageType;
  Int: Types.Scalars['Int']['output'];
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
  KarkunFilter: Types.KarkunFilter;
  Location: Types.Location;
  MehfilDetailsAccessType: Types.MehfilDetailsAccessType;
  MehfilDutyType: Types.MehfilDutyType;
  MehfilKarkunType: Types.MehfilKarkunType;
  MehfilLangarDishType: Types.MehfilLangarDishType;
  MehfilLangarLocationType: Types.MehfilLangarLocationType;
  MehfilLocationKarkunType: Types.MehfilLocationKarkunType;
  MehfilPermissionsType: Types.MehfilPermissionsType;
  MehfilType: Types.MehfilType;
  MpGroupType: Types.MpGroupType;
  MpKarkunType: Types.MpKarkunType;
  MpPermissionType: Types.MpPermissionType;
  MpUserType: Types.MpUserType;
  Mutation: Record<PropertyKey, never>;
  MyMehfilDetailsLocationType: Types.MyMehfilDetailsLocationType;
  MyMehfilKarkunsLocationType: Types.MyMehfilKarkunsLocationType;
  MyMehfilPermissionsLocationType: Types.MyMehfilPermissionsLocationType;
  NotificationCountType: Types.NotificationCountType;
  NotificationType: Types.NotificationType;
  OrgLocationFeaturePermissionType: Types.OrgLocationFeaturePermissionType;
  OrgLocationFeaturePermissionUserType: Types.OrgLocationFeaturePermissionUserType;
  OrgLocationFeaturePermissionsType: Types.OrgLocationFeaturePermissionsType;
  OrgLocationKarkunType: Types.OrgLocationKarkunType;
  OrgLocationMehfilDetailsInput: Types.OrgLocationMehfilDetailsInput;
  OrgLocationMehfilDetailsType: Types.OrgLocationMehfilDetailsType;
  OrgLocationObserverStatType: Types.OrgLocationObserverStatType;
  OrgLocationType: Types.OrgLocationType;
  PagedAuditLogType: Types.PagedAuditLogType;
  PagedCityType: Types.PagedCityType;
  PagedFreeFormCity: Types.PagedFreeFormCity;
  PagedFreeFormValue: Types.PagedFreeFormValue;
  PagedHrPermissionKarkunType: Types.PagedHrPermissionKarkunType;
  PagedInboxConversationType: Types.PagedInboxConversationType;
  PagedIssuanceForm: Types.PagedIssuanceForm;
  PagedJobLogsType: Types.PagedJobLogsType;
  PagedKarkunType: Types.PagedKarkunType;
  PagedMehfilLocationKarkunType: Types.PagedMehfilLocationKarkunType;
  PagedMpKarkunType: Types.PagedMpKarkunType;
  PagedOrgLocationKarkunType: Types.PagedOrgLocationKarkunType;
  PagedPeopleType: Types.PagedPeopleType;
  PagedPurchaseForm: Types.PagedPurchaseForm;
  PagedPurchasingCatalogItems: Types.PagedPurchasingCatalogItems;
  PagedPurchasingInvoices: Types.PagedPurchasingInvoices;
  PagedPurchasingKarkunType: Types.PagedPurchasingKarkunType;
  PagedPurchasingOrders: Types.PagedPurchasingOrders;
  PagedPurchasingPayments: Types.PagedPurchasingPayments;
  PagedPurchasingQuotes: Types.PagedPurchasingQuotes;
  PagedPurchasingReceipts: Types.PagedPurchasingReceipts;
  PagedPurchasingRequisitions: Types.PagedPurchasingRequisitions;
  PagedPurchasingVendors: Types.PagedPurchasingVendors;
  PagedSalaryType: Types.PagedSalaryType;
  PagedScheduledJobsType: Types.PagedScheduledJobsType;
  PagedSecurityLogType: Types.PagedSecurityLogType;
  PagedSecurityPermissionKarkunType: Types.PagedSecurityPermissionKarkunType;
  PagedSecurityServerAlertGroupType: Types.PagedSecurityServerAlertGroupType;
  PagedSecurityServerAlertType: Types.PagedSecurityServerAlertType;
  PagedSecurityServerProfileType: Types.PagedSecurityServerProfileType;
  PagedStockAdjustment: Types.PagedStockAdjustment;
  PagedStockItem: Types.PagedStockItem;
  PagedUserGroupType: Types.PagedUserGroupType;
  PagedUserType: Types.PagedUserType;
  PagedVisitorStayType: Types.PagedVisitorStayType;
  PagedVisitorType: Types.PagedVisitorType;
  PagedWorkspaceDocumentType: Types.PagedWorkspaceDocumentType;
  PagedWorkspaceKarkunType: Types.PagedWorkspaceKarkunType;
  PagedWorkspaceMeetingActionItemType: Types.PagedWorkspaceMeetingActionItemType;
  PagedWorkspaceMeetingType: Types.PagedWorkspaceMeetingType;
  PagedWorkspaceMonitoringAlertType: Types.PagedWorkspaceMonitoringAlertType;
  PagedWorkspaceMonitoringProfileType: Types.PagedWorkspaceMonitoringProfileType;
  PagedWorkspaceNightStayType: Types.PagedWorkspaceNightStayType;
  PagedWorkspacePollType: Types.PagedWorkspacePollType;
  PagedWorkspaceProjectType: Types.PagedWorkspaceProjectType;
  PagedWorkspaceTaskCommentType: Types.PagedWorkspaceTaskCommentType;
  PagedWorkspaceTaskType: Types.PagedWorkspaceTaskType;
  PeopleTagType: Types.PeopleTagType;
  PersonBasicSharedDataType: Types.PersonBasicSharedDataType;
  PersonBasicType: Types.PersonBasicType;
  PersonEmployeeDataType: Types.PersonEmployeeDataType;
  PersonFilter: Types.PersonFilter;
  PersonImageVectorDataType: Types.PersonImageVectorDataType;
  PersonKarkunDataType: Types.PersonKarkunDataType;
  PersonRelationCountType: Types.PersonRelationCountType;
  PersonRelationCounts: Types.PersonRelationCounts;
  PersonSharedDataType: Types.PersonSharedDataType;
  PersonType: Types.PersonType;
  PersonVisitorDataType: Types.PersonVisitorDataType;
  PhoneNumber: Types.Scalars['PhoneNumber']['output'];
  PhysicalStore: Types.PhysicalStore;
  PostalCode: Types.Scalars['PostalCode']['output'];
  PurchaseForm: Types.PurchaseForm;
  PurchasingAttachment: Types.PurchasingAttachment;
  PurchasingAttachmentDownload: Types.PurchasingAttachmentDownload;
  PurchasingAttachmentUpload: Types.PurchasingAttachmentUpload;
  PurchasingAuditLogFilter: Types.PurchasingAuditLogFilter;
  PurchasingCatalogItem: Types.PurchasingCatalogItem;
  PurchasingDashboard: Types.PurchasingDashboard;
  PurchasingGroupMember: Types.PurchasingGroupMember;
  PurchasingInvoice: Types.PurchasingInvoice;
  PurchasingInvoiceLine: Types.PurchasingInvoiceLine;
  PurchasingKarkunType: Types.PurchasingKarkunType;
  PurchasingLedgerEntry: Types.PurchasingLedgerEntry;
  PurchasingMonthlySpending: Types.PurchasingMonthlySpending;
  PurchasingOpenOrder: Types.PurchasingOpenOrder;
  PurchasingOrder: Types.PurchasingOrder;
  PurchasingOrderLine: Types.PurchasingOrderLine;
  PurchasingPayablesAgingRow: Types.PurchasingPayablesAgingRow;
  PurchasingPayment: Types.PurchasingPayment;
  PurchasingPaymentAllocation: Types.PurchasingPaymentAllocation;
  PurchasingPaymentAllocationInput: Types.PurchasingPaymentAllocationInput;
  PurchasingPermissionAssignment: Types.PurchasingPermissionAssignment;
  PurchasingPermissionGroup: Types.PurchasingPermissionGroup;
  PurchasingPermissionGroupHolder: Types.PurchasingPermissionGroupHolder;
  PurchasingPermissionHolder: Types.PurchasingPermissionHolder;
  PurchasingPricedLineInput: Types.PurchasingPricedLineInput;
  PurchasingQuote: Types.PurchasingQuote;
  PurchasingQuoteLine: Types.PurchasingQuoteLine;
  PurchasingReceipt: Types.PurchasingReceipt;
  PurchasingReceiptLine: Types.PurchasingReceiptLine;
  PurchasingReceiptLineInput: Types.PurchasingReceiptLineInput;
  PurchasingRequisition: Types.PurchasingRequisition;
  PurchasingRequisitionLine: Types.PurchasingRequisitionLine;
  PurchasingRequisitionLineInput: Types.PurchasingRequisitionLineInput;
  PurchasingUserGroup: Types.PurchasingUserGroup;
  PurchasingVendor: Types.PurchasingVendor;
  PurchasingVendorLedger: Types.PurchasingVendorLedger;
  PurchasingVendorSpending: Types.PurchasingVendorSpending;
  Query: Record<PropertyKey, never>;
  ReferenceDutyShiftType: Types.ReferenceDutyShiftType;
  ReferenceDutyType: Types.ReferenceDutyType;
  ReferenceOrgLocationType: Types.ReferenceOrgLocationType;
  ReferencePhysicalStoreType: Types.ReferencePhysicalStoreType;
  SalaryType: Types.SalaryType;
  ScheduledJobType: Types.ScheduledJobType;
  ScheduledJobsFilterType: Types.ScheduledJobsFilterType;
  SecurityGroupMember: Types.SecurityGroupMember;
  SecurityLogFilter: Types.SecurityLogFilter;
  SecurityLogType: Types.SecurityLogType;
  SecurityLogUserOption: Types.SecurityLogUserOption;
  SecurityPermissionAssignment: Types.SecurityPermissionAssignment;
  SecurityPermissionGroup: Types.SecurityPermissionGroup;
  SecurityPermissionGroupHolder: Types.SecurityPermissionGroupHolder;
  SecurityPermissionHolder: Types.SecurityPermissionHolder;
  SecurityPermissionKarkunType: Types.SecurityPermissionKarkunType;
  SecurityServerAlertFilter: Types.SecurityServerAlertFilter;
  SecurityServerAlertGroupType: Types.SecurityServerAlertGroupType;
  SecurityServerAlertSyncStatusType: Types.SecurityServerAlertSyncStatusType;
  SecurityServerAlertType: Types.SecurityServerAlertType;
  SecurityServerChannelConnectionInput: Types.SecurityServerChannelConnectionInput;
  SecurityServerChannelConnectionType: Types.SecurityServerChannelConnectionType;
  SecurityServerChannelType: Types.SecurityServerChannelType;
  SecurityServerProfileFilter: Types.SecurityServerProfileFilter;
  SecurityServerProfileImageType: Types.SecurityServerProfileImageType;
  SecurityServerProfileType: Types.SecurityServerProfileType;
  SecurityServerUsageChannelType: Types.SecurityServerUsageChannelType;
  SecurityServerUsageServerType: Types.SecurityServerUsageServerType;
  SecurityServerUsageSummaryType: Types.SecurityServerUsageSummaryType;
  SecurityUserGroup: Types.SecurityUserGroup;
  StockAdjustment: Types.StockAdjustment;
  StockItem: Types.StockItem;
  String: Types.Scalars['String']['output'];
  SyncOrgLocationObserversResult: Types.SyncOrgLocationObserversResult;
  TeamMemberType: Types.TeamMemberType;
  TeamType: Types.TeamType;
  Time: Types.Scalars['Time']['output'];
  Timestamp: Types.Scalars['Timestamp']['output'];
  TrustedDeviceType: Types.TrustedDeviceType;
  TwoFactorSetupType: Types.TwoFactorSetupType;
  URL: Types.Scalars['URL']['output'];
  UserAccountAvailabilityType: Types.UserAccountAvailabilityType;
  UserFilter: Types.UserFilter;
  UserGroupMemberType: Types.UserGroupMemberType;
  UserGroupType: Types.UserGroupType;
  UserType: Types.UserType;
  UtcOffset: Types.Scalars['UtcOffset']['output'];
  Vendor: Types.Vendor;
  VisitorFaceMatchType: Types.VisitorFaceMatchType;
  VisitorFilter: Types.VisitorFilter;
  VisitorStayType: Types.VisitorStayType;
  WorkspaceCommitteeMemberType: Types.WorkspaceCommitteeMemberType;
  WorkspaceCommitteeType: Types.WorkspaceCommitteeType;
  WorkspaceDocumentActivityType: Types.WorkspaceDocumentActivityType;
  WorkspaceDocumentDownloadType: Types.WorkspaceDocumentDownloadType;
  WorkspaceDocumentFolderContentsType: Types.WorkspaceDocumentFolderContentsType;
  WorkspaceDocumentFolderType: Types.WorkspaceDocumentFolderType;
  WorkspaceDocumentLockType: Types.WorkspaceDocumentLockType;
  WorkspaceDocumentTrashType: Types.WorkspaceDocumentTrashType;
  WorkspaceDocumentType: Types.WorkspaceDocumentType;
  WorkspaceDocumentUploadType: Types.WorkspaceDocumentUploadType;
  WorkspaceDocumentVersionType: Types.WorkspaceDocumentVersionType;
  WorkspaceDocumentsInfoType: Types.WorkspaceDocumentsInfoType;
  WorkspaceKarkunType: Types.WorkspaceKarkunType;
  WorkspaceLocationType: Types.WorkspaceLocationType;
  WorkspaceMeetingActionItemInput: Types.WorkspaceMeetingActionItemInput;
  WorkspaceMeetingActionItemType: Types.WorkspaceMeetingActionItemType;
  WorkspaceMeetingActivityType: Types.WorkspaceMeetingActivityType;
  WorkspaceMeetingAgendaItemInput: Types.WorkspaceMeetingAgendaItemInput;
  WorkspaceMeetingAgendaItemType: Types.WorkspaceMeetingAgendaItemType;
  WorkspaceMeetingAttachmentType: Types.WorkspaceMeetingAttachmentType;
  WorkspaceMeetingAttendanceInput: Types.WorkspaceMeetingAttendanceInput;
  WorkspaceMeetingDownloadType: Types.WorkspaceMeetingDownloadType;
  WorkspaceMeetingInput: Types.WorkspaceMeetingInput;
  WorkspaceMeetingMemberType: Types.WorkspaceMeetingMemberType;
  WorkspaceMeetingParticipantType: Types.WorkspaceMeetingParticipantType;
  WorkspaceMeetingType: Types.WorkspaceMeetingType;
  WorkspaceMeetingUploadType: Types.WorkspaceMeetingUploadType;
  WorkspaceMeetingVideoCallInfoType: Types.WorkspaceMeetingVideoCallInfoType;
  WorkspaceMeetingVideoCallType: Types.WorkspaceMeetingVideoCallType;
  WorkspaceMeetingsInfoType: Types.WorkspaceMeetingsInfoType;
  WorkspaceMehfilDetailsType: Types.WorkspaceMehfilDetailsType;
  WorkspaceMonitoringAlertType: Types.WorkspaceMonitoringAlertType;
  WorkspaceMonitoringProfilePhotoType: Types.WorkspaceMonitoringProfilePhotoType;
  WorkspaceMonitoringProfileType: Types.WorkspaceMonitoringProfileType;
  WorkspaceNightStayType: Types.WorkspaceNightStayType;
  WorkspacePollActivityType: Types.WorkspacePollActivityType;
  WorkspacePollAnswerInput: Types.WorkspacePollAnswerInput;
  WorkspacePollAnswerType: Types.WorkspacePollAnswerType;
  WorkspacePollInput: Types.WorkspacePollInput;
  WorkspacePollOptionInput: Types.WorkspacePollOptionInput;
  WorkspacePollOptionResultType: Types.WorkspacePollOptionResultType;
  WorkspacePollOptionType: Types.WorkspacePollOptionType;
  WorkspacePollQuestionInput: Types.WorkspacePollQuestionInput;
  WorkspacePollQuestionResultType: Types.WorkspacePollQuestionResultType;
  WorkspacePollQuestionType: Types.WorkspacePollQuestionType;
  WorkspacePollResultsType: Types.WorkspacePollResultsType;
  WorkspacePollType: Types.WorkspacePollType;
  WorkspacePollVoterType: Types.WorkspacePollVoterType;
  WorkspacePollsInfoType: Types.WorkspacePollsInfoType;
  WorkspaceProjectInput: Types.WorkspaceProjectInput;
  WorkspaceProjectMemberType: Types.WorkspaceProjectMemberType;
  WorkspaceProjectParticipantType: Types.WorkspaceProjectParticipantType;
  WorkspaceProjectType: Types.WorkspaceProjectType;
  WorkspaceProjectsActivityType: Types.WorkspaceProjectsActivityType;
  WorkspaceProjectsInfoType: Types.WorkspaceProjectsInfoType;
  WorkspaceStayHistoryItemType: Types.WorkspaceStayHistoryItemType;
  WorkspaceTaskCommentType: Types.WorkspaceTaskCommentType;
  WorkspaceTaskInput: Types.WorkspaceTaskInput;
  WorkspaceTaskType: Types.WorkspaceTaskType;
}>;

export type CheckCommitteeAccessDirectiveArgs = {
  committeeIdArgName?: Types.Maybe<Types.Scalars['String']['input']>;
  roles: Array<Types.CommitteeRole>;
};

export type CheckCommitteeAccessDirectiveResolver<Result, Parent, ContextType = any, Args = CheckCommitteeAccessDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type CheckDutiesAttendanceAccessDirectiveArgs = {
  locationIdArgName?: Types.Maybe<Types.Scalars['String']['input']>;
  permission: Types.DutiesAttendancePermission;
};

export type CheckDutiesAttendanceAccessDirectiveResolver<Result, Parent, ContextType = any, Args = CheckDutiesAttendanceAccessDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type CheckInstanceAccessDirectiveArgs = {
  dataFieldName?: Types.Maybe<Types.Scalars['String']['input']>;
  instanceIdArgName?: Types.Maybe<Types.Scalars['String']['input']>;
  returnType?: Types.Maybe<Types.Scalars['String']['input']>;
};

export type CheckInstanceAccessDirectiveResolver<Result, Parent, ContextType = any, Args = CheckInstanceAccessDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type CheckMehfilDetailsAccessDirectiveArgs = {
  locationIdArgName?: Types.Maybe<Types.Scalars['String']['input']>;
  permission: Types.MehfilDetailsPermission;
};

export type CheckMehfilDetailsAccessDirectiveResolver<Result, Parent, ContextType = any, Args = CheckMehfilDetailsAccessDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type CheckMehfilKarkunsAccessDirectiveArgs = {
  locationIdArgName?: Types.Maybe<Types.Scalars['String']['input']>;
  permission: Types.MehfilKarkunsPermission;
};

export type CheckMehfilKarkunsAccessDirectiveResolver<Result, Parent, ContextType = any, Args = CheckMehfilKarkunsAccessDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type CheckMehfilPermissionsAccessDirectiveArgs = {
  locationIdArgName?: Types.Maybe<Types.Scalars['String']['input']>;
  permission: Types.MehfilPermissionsPermission;
};

export type CheckMehfilPermissionsAccessDirectiveResolver<Result, Parent, ContextType = any, Args = CheckMehfilPermissionsAccessDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type CheckPermissionsDirectiveArgs = {
  dataFieldName?: Types.Maybe<Types.Scalars['String']['input']>;
  permissions?: Types.Maybe<Array<Types.Maybe<Types.Scalars['String']['input']>>>;
};

export type CheckPermissionsDirectiveResolver<Result, Parent, ContextType = any, Args = CheckPermissionsDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type SuperAdminOnlyDirectiveArgs = { };

export type SuperAdminOnlyDirectiveResolver<Result, Parent, ContextType = any, Args = SuperAdminOnlyDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

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

export type AuditLogTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['AuditLogType'] = ResolversParentTypes['AuditLogType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  auditValues?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  entityId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  entityType?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operationBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operationByImageThumbnailUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operationByImageUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type CommitteeBasicTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['CommitteeBasicType'] = ResolversParentTypes['CommitteeBasicType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  color?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type CommitteeFeatureTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['CommitteeFeatureType'] = ResolversParentTypes['CommitteeFeatureType']> = ResolversObject<{
  category?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  key?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type CommitteeMemberTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['CommitteeMemberType'] = ResolversParentTypes['CommitteeMemberType']> = ResolversObject<{
  hasChatAccount?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasDiscussionAccess?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasLoginAccount?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isCoordinator?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  karkun?: Resolver<Types.Maybe<ResolversTypes['PersonBasicType']>, ParentType, ContextType>;
  karkunId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  role?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type CommitteeMembersPageTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['CommitteeMembersPageType'] = ResolversParentTypes['CommitteeMembersPageType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['CommitteeMemberType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type CommitteeTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['CommitteeType'] = ResolversParentTypes['CommitteeType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  color?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  features?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  guestCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  locationId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  memberCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  members?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['CommitteeMemberType']>>>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  observerCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export interface CurrencyScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Currency'], any> {
  name: 'Currency';
}

export type DaAccessTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DaAccessType'] = ResolversParentTypes['DaAccessType']> = ResolversObject<{
  locationId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  permissions?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type DaAttendanceSheetRowTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DaAttendanceSheetRowType'] = ResolversParentTypes['DaAttendanceSheetRowType']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  absentCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  daysOnDuty?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  dutyId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  dutyName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  karkunId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lateCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  month?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  percentage?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  presentCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  unmarkedCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type DaDutyMemberTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DaDutyMemberType'] = ResolversParentTypes['DaDutyMemberType']> = ResolversObject<{
  canMarkOwnAttendance?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  daysOfWeek?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  isCoordinator?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  karkun?: Resolver<Types.Maybe<ResolversTypes['PersonBasicType']>, ParentType, ContextType>;
  karkunId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type DaDutyTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DaDutyType'] = ResolversParentTypes['DaDutyType']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  locationId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  mehfilDutyId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  members?: Resolver<Array<Types.Maybe<ResolversTypes['DaDutyMemberType']>>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type DaMehfilDutyTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DaMehfilDutyType'] = ResolversParentTypes['DaMehfilDutyType']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type DaMyDutyTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DaMyDutyType'] = ResolversParentTypes['DaMyDutyType']> = ResolversObject<{
  attendance?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  attendanceSource?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  canMarkOwnAttendance?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  dutyId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  dutyName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  locationId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  locationName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type DaMyLocationTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DaMyLocationType'] = ResolversParentTypes['DaMyLocationType']> = ResolversObject<{
  hasWorkspace?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  locationId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parentId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  permissions?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type DaPlanDayTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DaPlanDayType'] = ResolversParentTypes['DaPlanDayType']> = ResolversObject<{
  absentKarkunIds?: Resolver<Array<Types.Maybe<ResolversTypes['String']>>, ParentType, ContextType>;
  addedKarkunIds?: Resolver<Array<Types.Maybe<ResolversTypes['String']>>, ParentType, ContextType>;
  date?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  dayOfWeek?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  karkuns?: Resolver<Array<Types.Maybe<ResolversTypes['DaPlanKarkunType']>>, ParentType, ContextType>;
  locked?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
}>;

export type DaPlanDaysTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DaPlanDaysType'] = ResolversParentTypes['DaPlanDaysType']> = ResolversObject<{
  days?: Resolver<Array<Types.Maybe<ResolversTypes['DaPlanDayType']>>, ParentType, ContextType>;
  startDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type DaPlanKarkunTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DaPlanKarkunType'] = ResolversParentTypes['DaPlanKarkunType']> = ResolversObject<{
  addedForDay?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  attendance?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber1?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber2?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageThumbnailUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  karkunId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  off?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
}>;

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type DiscussionAttachmentTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DiscussionAttachmentType'] = ResolversParentTypes['DiscussionAttachmentType']> = ResolversObject<{
  kind?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mimeType?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  size?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  title?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type DiscussionInfoTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DiscussionInfoType'] = ResolversParentTypes['DiscussionInfoType']> = ResolversObject<{
  canPin?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  canPost?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
}>;

export type DiscussionMemberTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DiscussionMemberType'] = ResolversParentTypes['DiscussionMemberType']> = ResolversObject<{
  imageThumbnailUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  username?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type DiscussionMessagePageTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DiscussionMessagePageType'] = ResolversParentTypes['DiscussionMessagePageType']> = ResolversObject<{
  hasMore?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  messages?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DiscussionMessageType']>>>, ParentType, ContextType>;
}>;

export type DiscussionMessageTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DiscussionMessageType'] = ResolversParentTypes['DiscussionMessageType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  attachments?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DiscussionAttachmentType']>>>, ParentType, ContextType>;
  editedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isOwn?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isPinned?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isStarred?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isSystem?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  reactions?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DiscussionReactionType']>>>, ParentType, ContextType>;
  senderId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  senderImageThumbnailUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  senderImageUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  senderName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sentAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  showInMainList?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  text?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  threadId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  threadLastReplyAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  threadReplyCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type DiscussionReactionTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DiscussionReactionType'] = ResolversParentTypes['DiscussionReactionType']> = ResolversObject<{
  count?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  emoji?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  reactedByMe?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  usernames?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
}>;

export type DiscussionSyncTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DiscussionSyncType'] = ResolversParentTypes['DiscussionSyncType']> = ResolversObject<{
  deletedIds?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  hasOlder?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  messages?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DiscussionMessageType']>>>, ParentType, ContextType>;
  syncedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type DiscussionVideoCallInfoTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DiscussionVideoCallInfoType'] = ResolversParentTypes['DiscussionVideoCallInfoType']> = ResolversObject<{
  participantCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type DiscussionVideoCallTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DiscussionVideoCallType'] = ResolversParentTypes['DiscussionVideoCallType']> = ResolversObject<{
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type DuplicatePersonGroupTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DuplicatePersonGroupType'] = ResolversParentTypes['DuplicatePersonGroupType']> = ResolversObject<{
  count?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  people?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DuplicatePersonSummaryType']>>>, ParentType, ContextType>;
  value?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type DuplicatePersonSummaryTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DuplicatePersonSummaryType'] = ResolversParentTypes['DuplicatePersonSummaryType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cnicNumber?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber1?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber2?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageThumbnailUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type DutyAttendanceCardTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DutyAttendanceCardType'] = ResolversParentTypes['DutyAttendanceCardType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  absentCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  barcodeId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  daysOnDuty?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  duty?: Resolver<Types.Maybe<ResolversTypes['DutyType']>, ParentType, ContextType>;
  dutyId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  karkun?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType>;
  karkunId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lateCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  month?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  percentage?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  presentCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  shiftNames?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  unmarkedCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type DutyAttendanceSheetRowTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DutyAttendanceSheetRowType'] = ResolversParentTypes['DutyAttendanceSheetRowType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  absentCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  barcodeId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  daysOnDuty?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  duty?: Resolver<Types.Maybe<ResolversTypes['DutyType']>, ParentType, ContextType>;
  dutyId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  karkun?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType>;
  karkunId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lateCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  location?: Resolver<Types.Maybe<ResolversTypes['DutyLocationType']>, ParentType, ContextType>;
  locationId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  month?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  percentage?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  presentCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  shiftId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  shiftName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  unmarkedCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type DutyLocationTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DutyLocationType'] = ResolversParentTypes['DutyLocationType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  canDelete?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  duty?: Resolver<Types.Maybe<ResolversTypes['DutyType']>, ParentType, ContextType>;
  dutyId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type DutyPlanDaysDayTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DutyPlanDaysDayType'] = ResolversParentTypes['DutyPlanDaysDayType']> = ResolversObject<{
  date?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dayOfWeek?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  locked?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  slots?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DutyPlanDaysSlotType']>>>, ParentType, ContextType>;
}>;

export type DutyPlanDaysKarkunTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DutyPlanDaysKarkunType'] = ResolversParentTypes['DutyPlanDaysKarkunType']> = ResolversObject<{
  attendance?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageThumbnailUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  karkunId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  off?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
}>;

export type DutyPlanDaysSlotTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DutyPlanDaysSlotType'] = ResolversParentTypes['DutyPlanDaysSlotType']> = ResolversObject<{
  absentKarkunIds?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  addedKarkunIds?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  addedKarkuns?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DutyPlanDaysKarkunType']>>>, ParentType, ContextType>;
  shiftId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  shiftName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  teamKarkuns?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DutyPlanDaysKarkunType']>>>, ParentType, ContextType>;
  teamName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type DutyPlanDaysTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DutyPlanDaysType'] = ResolversParentTypes['DutyPlanDaysType']> = ResolversObject<{
  days?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DutyPlanDaysDayType']>>>, ParentType, ContextType>;
  startDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type DutyPlanWeekSlotTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DutyPlanWeekSlotType'] = ResolversParentTypes['DutyPlanWeekSlotType']> = ResolversObject<{
  shiftId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  startDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  teamColor?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  teamId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  teamName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type DutyPlanWeekTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DutyPlanWeekType'] = ResolversParentTypes['DutyPlanWeekType']> = ResolversObject<{
  shifts?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DutyShiftType']>>>, ParentType, ContextType>;
  slots?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DutyPlanWeekSlotType']>>>, ParentType, ContextType>;
}>;

export type DutyShiftTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DutyShiftType'] = ResolversParentTypes['DutyShiftType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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
  canDelete?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  committee?: Resolver<Types.Maybe<ResolversTypes['CommitteeBasicType']>, ParentType, ContextType>;
  committeeId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isMehfilDuty?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  locations?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DutyLocationType']>>>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  shifts?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DutyShiftType']>>>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  usedCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export interface EmailAddressScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['EmailAddress'], any> {
  name: 'EmailAddress';
}

export type EnrolledTrustedDeviceTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['EnrolledTrustedDeviceType'] = ResolversParentTypes['EnrolledTrustedDeviceType']> = ResolversObject<{
  deviceId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  deviceSecret?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type FaceVectorResultTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['FaceVectorResultType'] = ResolversParentTypes['FaceVectorResultType']> = ResolversObject<{
  status?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  vector?: Resolver<Types.Maybe<Array<ResolversTypes['Float']>>, ParentType, ContextType>;
}>;

export type FreeFormCityTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['FreeFormCityType'] = ResolversParentTypes['FreeFormCityType']> = ResolversObject<{
  count?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  locationId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  locationName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type FreeFormValueTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['FreeFormValueType'] = ResolversParentTypes['FreeFormValueType']> = ResolversObject<{
  count?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type HrGroupMemberResolvers<ContextType = any, ParentType extends ResolversParentTypes['HrGroupMember'] = ResolversParentTypes['HrGroupMember']> = ResolversObject<{
  displayName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  personId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  username?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type HrPermissionAssignmentResolvers<ContextType = any, ParentType extends ResolversParentTypes['HrPermissionAssignment'] = ResolversParentTypes['HrPermissionAssignment']> = ResolversObject<{
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  groups?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['HrPermissionGroupHolder']>>>, ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  users?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['HrPermissionHolder']>>>, ParentType, ContextType>;
}>;

export type HrPermissionGroupResolvers<ContextType = any, ParentType extends ResolversParentTypes['HrPermissionGroup'] = ResolversParentTypes['HrPermissionGroup']> = ResolversObject<{
  featureKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  featureName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  permissions?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['HrPermissionAssignment']>>>, ParentType, ContextType>;
}>;

export type HrPermissionGroupHolderResolvers<ContextType = any, ParentType extends ResolversParentTypes['HrPermissionGroupHolder'] = ResolversParentTypes['HrPermissionGroupHolder']> = ResolversObject<{
  groupId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type HrPermissionHolderResolvers<ContextType = any, ParentType extends ResolversParentTypes['HrPermissionHolder'] = ResolversParentTypes['HrPermissionHolder']> = ResolversObject<{
  displayName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  personId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  username?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type HrPermissionKarkunTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['HrPermissionKarkunType'] = ResolversParentTypes['HrPermissionKarkunType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cnicNumber?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber1?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageThumbnailUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  parentName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type HrUserGroupResolvers<ContextType = any, ParentType extends ResolversParentTypes['HrUserGroup'] = ResolversParentTypes['HrUserGroup']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  users?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['HrGroupMember']>>>, ParentType, ContextType>;
}>;

export type InboxAttachmentTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['InboxAttachmentType'] = ResolversParentTypes['InboxAttachmentType']> = ResolversObject<{
  kind?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mimeType?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  size?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  title?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type InboxConversationDetailTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['InboxConversationDetailType'] = ResolversParentTypes['InboxConversationDetailType']> = ResolversObject<{
  conversation?: Resolver<Types.Maybe<ResolversTypes['InboxConversationType']>, ParentType, ContextType>;
  messages?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['InboxMessageType']>>>, ParentType, ContextType>;
}>;

export type InboxConversationTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['InboxConversationType'] = ResolversParentTypes['InboxConversationType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  assignedTo?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  customerName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastMessage?: Resolver<Types.Maybe<ResolversTypes['InboxMessageType']>, ParentType, ContextType>;
  lastMessageAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mobileNumber?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  open?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  startedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  visitorId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  waitingResponse?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
}>;

export type InboxMessageTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['InboxMessageType'] = ResolversParentTypes['InboxMessageType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  attachments?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['InboxAttachmentType']>>>, ParentType, ContextType>;
  roomId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  senderName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  senderType?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sentAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  text?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type MehfilDetailsAccessTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MehfilDetailsAccessType'] = ResolversParentTypes['MehfilDetailsAccessType']> = ResolversObject<{
  locationId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  permissions?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type MehfilDutyTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MehfilDutyType'] = ResolversParentTypes['MehfilDutyType']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mehfilUsedCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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

export type MehfilLocationKarkunTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MehfilLocationKarkunType'] = ResolversParentTypes['MehfilLocationKarkunType']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  cnicNumber?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber1?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber2?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageThumbnailUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  parentName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type MehfilPermissionsTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MehfilPermissionsType'] = ResolversParentTypes['MehfilPermissionsType']> = ResolversObject<{
  groups?: Resolver<Array<Types.Maybe<ResolversTypes['MpGroupType']>>, ParentType, ContextType>;
  locationId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  permissions?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
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

export type MpGroupTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MpGroupType'] = ResolversParentTypes['MpGroupType']> = ResolversObject<{
  featureKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  featureName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  permissions?: Resolver<Array<Types.Maybe<ResolversTypes['MpPermissionType']>>, ParentType, ContextType>;
}>;

export type MpKarkunTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MpKarkunType'] = ResolversParentTypes['MpKarkunType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cnicNumber?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber1?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageThumbnailUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  parentName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type MpPermissionTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MpPermissionType'] = ResolversParentTypes['MpPermissionType']> = ResolversObject<{
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  users?: Resolver<Array<Types.Maybe<ResolversTypes['MpUserType']>>, ParentType, ContextType>;
}>;

export type MpUserTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MpUserType'] = ResolversParentTypes['MpUserType']> = ResolversObject<{
  displayName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  personId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  username?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  abortPurchasingAttachmentUpload?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationAbortPurchasingAttachmentUploadArgs, 'uploadId'>>;
  addCommitteeMember?: Resolver<Types.Maybe<ResolversTypes['CommitteeType']>, ParentType, ContextType, RequireFields<Types.MutationAddCommitteeMemberArgs, 'committeeId' | 'karkunId'>>;
  addHrGroupMember?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationAddHrGroupMemberArgs, 'groupId' | 'karkunId'>>;
  addHrKarkunAttachment?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationAddHrKarkunAttachmentArgs, '_id' | 'attachmentId'>>;
  addHrPermissionGroup?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationAddHrPermissionGroupArgs, 'groupId' | 'permissionKey'>>;
  addHrPermissionUser?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationAddHrPermissionUserArgs, 'karkunId' | 'permissionKey'>>;
  addIssuanceFormAttachment?: Resolver<Types.Maybe<ResolversTypes['IssuanceForm']>, ParentType, ContextType, RequireFields<Types.MutationAddIssuanceFormAttachmentArgs, '_id' | 'attachmentId' | 'physicalStoreId'>>;
  addMehfilKarkun?: Resolver<Types.Maybe<ResolversTypes['MehfilKarkunType']>, ParentType, ContextType, RequireFields<Types.MutationAddMehfilKarkunArgs, 'dutyId' | 'karkunId' | 'mehfilId'>>;
  addOrgLocationFeatureUser?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationAddOrgLocationFeatureUserArgs, 'featureKey' | 'karkunId' | 'locationId' | 'permissionKey'>>;
  addOrgLocationObserver?: Resolver<Types.Maybe<ResolversTypes['OrgLocationType']>, ParentType, ContextType, RequireFields<Types.MutationAddOrgLocationObserverArgs, 'karkunId' | 'locationId'>>;
  addPurchaseFormAttachment?: Resolver<Types.Maybe<ResolversTypes['PurchaseForm']>, ParentType, ContextType, RequireFields<Types.MutationAddPurchaseFormAttachmentArgs, '_id' | 'attachmentId' | 'physicalStoreId'>>;
  addPurchasingGroupMember?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationAddPurchasingGroupMemberArgs, 'groupId' | 'karkunId'>>;
  addPurchasingPermissionGroup?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationAddPurchasingPermissionGroupArgs, 'groupId' | 'permissionKey'>>;
  addPurchasingPermissionUser?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationAddPurchasingPermissionUserArgs, 'karkunId' | 'permissionKey'>>;
  addSecurityGroupMember?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationAddSecurityGroupMemberArgs, 'groupId' | 'karkunId'>>;
  addSecurityPermissionGroup?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationAddSecurityPermissionGroupArgs, 'groupId' | 'permissionKey'>>;
  addSecurityPermissionUser?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationAddSecurityPermissionUserArgs, 'karkunId' | 'permissionKey'>>;
  addSecurityServerProfileImage?: Resolver<Types.Maybe<ResolversTypes['SecurityServerProfileType']>, ParentType, ContextType, RequireFields<Types.MutationAddSecurityServerProfileImageArgs, 'imageData' | 'profileId'>>;
  addTeamCoordinator?: Resolver<Types.Maybe<ResolversTypes['TeamType']>, ParentType, ContextType, RequireFields<Types.MutationAddTeamCoordinatorArgs, 'karkunId' | 'teamId'>>;
  addTeamMember?: Resolver<Types.Maybe<ResolversTypes['TeamType']>, ParentType, ContextType, RequireFields<Types.MutationAddTeamMemberArgs, 'daysOfWeek' | 'karkunId' | 'teamId'>>;
  addWorkspaceMonitoringProfilePhoto?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMonitoringProfileType']>, ParentType, ContextType, RequireFields<Types.MutationAddWorkspaceMonitoringProfilePhotoArgs, 'committeeId' | 'imageData' | 'profileId'>>;
  approveIssuanceForms?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['IssuanceForm']>>>, ParentType, ContextType, RequireFields<Types.MutationApproveIssuanceFormsArgs, '_ids' | 'physicalStoreId'>>;
  approvePurchaseForms?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchaseForm']>>>, ParentType, ContextType, RequireFields<Types.MutationApprovePurchaseFormsArgs, '_ids' | 'physicalStoreId'>>;
  approvePurchasingOrder?: Resolver<Types.Maybe<ResolversTypes['PurchasingOrder']>, ParentType, ContextType, RequireFields<Types.MutationApprovePurchasingOrderArgs, '_id'>>;
  approvePurchasingRequisition?: Resolver<Types.Maybe<ResolversTypes['PurchasingRequisition']>, ParentType, ContextType, RequireFields<Types.MutationApprovePurchasingRequisitionArgs, '_id'>>;
  approveStockAdjustments?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['StockAdjustment']>>>, ParentType, ContextType, RequireFields<Types.MutationApproveStockAdjustmentsArgs, '_ids' | 'physicalStoreId'>>;
  cancelPurchasingOrder?: Resolver<Types.Maybe<ResolversTypes['PurchasingOrder']>, ParentType, ContextType, RequireFields<Types.MutationCancelPurchasingOrderArgs, '_id'>>;
  cancelPurchasingRequisition?: Resolver<Types.Maybe<ResolversTypes['PurchasingRequisition']>, ParentType, ContextType, RequireFields<Types.MutationCancelPurchasingRequisitionArgs, '_id'>>;
  cancelVisitorStay?: Resolver<Types.Maybe<ResolversTypes['VisitorStayType']>, ParentType, ContextType, RequireFields<Types.MutationCancelVisitorStayArgs, '_id'>>;
  clearJobDefinitionSchedule?: Resolver<Types.Maybe<ResolversTypes['JobDefinitionType']>, ParentType, ContextType, RequireFields<Types.MutationClearJobDefinitionScheduleArgs, '_id'>>;
  clearLoginBlocks?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<Types.MutationClearLoginBlocksArgs, 'userId'>>;
  closePurchasingOrder?: Resolver<Types.Maybe<ResolversTypes['PurchasingOrder']>, ParentType, ContextType, RequireFields<Types.MutationClosePurchasingOrderArgs, '_id'>>;
  completePurchasingAttachmentUpload?: Resolver<Types.Maybe<ResolversTypes['PurchasingAttachment']>, ParentType, ContextType, RequireFields<Types.MutationCompletePurchasingAttachmentUploadArgs, 'uploadId'>>;
  createChatAccount?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<Types.MutationCreateChatAccountArgs, 'userId'>>;
  createCity?: Resolver<Types.Maybe<ResolversTypes['CityType']>, ParentType, ContextType, RequireFields<Types.MutationCreateCityArgs, 'country' | 'name'>>;
  createCityMehfil?: Resolver<Types.Maybe<ResolversTypes['CityMehfilType']>, ParentType, ContextType, RequireFields<Types.MutationCreateCityMehfilArgs, 'cityId' | 'name'>>;
  createCommittee?: Resolver<Types.Maybe<ResolversTypes['CommitteeType']>, ParentType, ContextType, RequireFields<Types.MutationCreateCommitteeArgs, 'locationId' | 'name'>>;
  createDuty?: Resolver<Types.Maybe<ResolversTypes['DutyType']>, ParentType, ContextType, RequireFields<Types.MutationCreateDutyArgs, 'isMehfilDuty' | 'name'>>;
  createDutyLocation?: Resolver<Types.Maybe<ResolversTypes['DutyLocationType']>, ParentType, ContextType, RequireFields<Types.MutationCreateDutyLocationArgs, 'dutyId' | 'name'>>;
  createDutyShift?: Resolver<Types.Maybe<ResolversTypes['DutyShiftType']>, ParentType, ContextType, RequireFields<Types.MutationCreateDutyShiftArgs, 'dutyId' | 'name'>>;
  createHrKarkun?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationCreateHrKarkunArgs, 'name'>>;
  createHrUserGroup?: Resolver<Types.Maybe<ResolversTypes['HrUserGroup']>, ParentType, ContextType, RequireFields<Types.MutationCreateHrUserGroupArgs, 'name'>>;
  createIssuanceForm?: Resolver<Types.Maybe<ResolversTypes['IssuanceForm']>, ParentType, ContextType, RequireFields<Types.MutationCreateIssuanceFormArgs, 'issueDate' | 'issuedBy' | 'issuedTo' | 'physicalStoreId'>>;
  createItemCategory?: Resolver<Types.Maybe<ResolversTypes['ItemCategory']>, ParentType, ContextType, RequireFields<Types.MutationCreateItemCategoryArgs, 'name' | 'physicalStoreId'>>;
  createJob?: Resolver<Types.Maybe<ResolversTypes['JobType']>, ParentType, ContextType, RequireFields<Types.MutationCreateJobArgs, 'name'>>;
  createLocation?: Resolver<Types.Maybe<ResolversTypes['Location']>, ParentType, ContextType, RequireFields<Types.MutationCreateLocationArgs, 'name' | 'physicalStoreId'>>;
  createMehfil?: Resolver<Types.Maybe<ResolversTypes['MehfilType']>, ParentType, ContextType, RequireFields<Types.MutationCreateMehfilArgs, 'mehfilDate' | 'name'>>;
  createMehfilDuty?: Resolver<Types.Maybe<ResolversTypes['MehfilDutyType']>, ParentType, ContextType, RequireFields<Types.MutationCreateMehfilDutyArgs, 'name'>>;
  createMissingSecurityServerAlertThumbnails?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  createMissingSecurityServerProfileThumbnails?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  createOrgLocation?: Resolver<Types.Maybe<ResolversTypes['OrgLocationType']>, ParentType, ContextType, RequireFields<Types.MutationCreateOrgLocationArgs, 'name' | 'type'>>;
  createOrgLocationUserChatAccount?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<Types.MutationCreateOrgLocationUserChatAccountArgs, 'locationId' | 'userId'>>;
  createPeopleTag?: Resolver<Types.Maybe<ResolversTypes['PeopleTagType']>, ParentType, ContextType, RequireFields<Types.MutationCreatePeopleTagArgs, 'color' | 'moduleNames' | 'name' | 'textColor'>>;
  createPhysicalStore?: Resolver<Types.Maybe<ResolversTypes['PhysicalStore']>, ParentType, ContextType, RequireFields<Types.MutationCreatePhysicalStoreArgs, 'name'>>;
  createPurchaseForm?: Resolver<Types.Maybe<ResolversTypes['PurchaseForm']>, ParentType, ContextType, RequireFields<Types.MutationCreatePurchaseFormArgs, 'physicalStoreId' | 'purchaseDate' | 'purchasedBy' | 'receivedBy'>>;
  createPurchasingAttachmentUpload?: Resolver<Types.Maybe<ResolversTypes['PurchasingAttachmentUpload']>, ParentType, ContextType, RequireFields<Types.MutationCreatePurchasingAttachmentUploadArgs, 'fileName' | 'mimeType' | 'ownerId' | 'ownerType' | 'size'>>;
  createPurchasingCatalogItem?: Resolver<Types.Maybe<ResolversTypes['PurchasingCatalogItem']>, ParentType, ContextType, RequireFields<Types.MutationCreatePurchasingCatalogItemArgs, 'name' | 'unit'>>;
  createPurchasingInvoice?: Resolver<Types.Maybe<ResolversTypes['PurchasingInvoice']>, ParentType, ContextType, RequireFields<Types.MutationCreatePurchasingInvoiceArgs, 'invoiceDate' | 'lines' | 'vendorId' | 'vendorInvoiceNo'>>;
  createPurchasingOrder?: Resolver<Types.Maybe<ResolversTypes['PurchasingOrder']>, ParentType, ContextType, RequireFields<Types.MutationCreatePurchasingOrderArgs, 'lines' | 'orderDate' | 'vendorId'>>;
  createPurchasingOrderFromQuote?: Resolver<Types.Maybe<ResolversTypes['PurchasingOrder']>, ParentType, ContextType, RequireFields<Types.MutationCreatePurchasingOrderFromQuoteArgs, 'quoteId'>>;
  createPurchasingOrderFromRequisition?: Resolver<Types.Maybe<ResolversTypes['PurchasingOrder']>, ParentType, ContextType, RequireFields<Types.MutationCreatePurchasingOrderFromRequisitionArgs, 'requisitionId' | 'vendorId'>>;
  createPurchasingQuote?: Resolver<Types.Maybe<ResolversTypes['PurchasingQuote']>, ParentType, ContextType, RequireFields<Types.MutationCreatePurchasingQuoteArgs, 'lines' | 'quoteDate' | 'vendorId'>>;
  createPurchasingRequisition?: Resolver<Types.Maybe<ResolversTypes['PurchasingRequisition']>, ParentType, ContextType, RequireFields<Types.MutationCreatePurchasingRequisitionArgs, 'lines' | 'title'>>;
  createPurchasingUserGroup?: Resolver<Types.Maybe<ResolversTypes['PurchasingUserGroup']>, ParentType, ContextType, RequireFields<Types.MutationCreatePurchasingUserGroupArgs, 'name'>>;
  createPurchasingVendor?: Resolver<Types.Maybe<ResolversTypes['PurchasingVendor']>, ParentType, ContextType, RequireFields<Types.MutationCreatePurchasingVendorArgs, 'name'>>;
  createSalaries?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationCreateSalariesArgs, 'month'>>;
  createSecurityMehfilDuty?: Resolver<Types.Maybe<ResolversTypes['MehfilDutyType']>, ParentType, ContextType, RequireFields<Types.MutationCreateSecurityMehfilDutyArgs, 'name' | 'urduName'>>;
  createSecurityMehfilLangarDish?: Resolver<Types.Maybe<ResolversTypes['MehfilLangarDishType']>, ParentType, ContextType, RequireFields<Types.MutationCreateSecurityMehfilLangarDishArgs, 'name' | 'urduName'>>;
  createSecurityMehfilLangarLocation?: Resolver<Types.Maybe<ResolversTypes['MehfilLangarLocationType']>, ParentType, ContextType, RequireFields<Types.MutationCreateSecurityMehfilLangarLocationArgs, 'name' | 'urduName'>>;
  createSecurityServerChannel?: Resolver<Types.Maybe<ResolversTypes['SecurityServerChannelType']>, ParentType, ContextType, RequireFields<Types.MutationCreateSecurityServerChannelArgs, 'connection' | 'enabled' | 'name' | 'recognitionFps'>>;
  createSecurityServerProfile?: Resolver<Types.Maybe<ResolversTypes['SecurityServerProfileType']>, ParentType, ContextType, RequireFields<Types.MutationCreateSecurityServerProfileArgs, 'isTest' | 'name'>>;
  createSecurityUserGroup?: Resolver<Types.Maybe<ResolversTypes['SecurityUserGroup']>, ParentType, ContextType, RequireFields<Types.MutationCreateSecurityUserGroupArgs, 'name'>>;
  createSecurityVisitor?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationCreateSecurityVisitorArgs, 'ehadDate' | 'name' | 'parentName' | 'referenceName'>>;
  createServiceAccount?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<Types.MutationCreateServiceAccountArgs, 'userName'>>;
  createStockAdjustment?: Resolver<Types.Maybe<ResolversTypes['StockAdjustment']>, ParentType, ContextType, RequireFields<Types.MutationCreateStockAdjustmentArgs, 'adjustedBy' | 'adjustmentDate' | 'isInflow' | 'physicalStoreId' | 'quantity' | 'stockItemId'>>;
  createStockItem?: Resolver<Types.Maybe<ResolversTypes['StockItem']>, ParentType, ContextType, RequireFields<Types.MutationCreateStockItemArgs, 'categoryId' | 'name' | 'physicalStoreId' | 'unitOfMeasurement'>>;
  createTeam?: Resolver<Types.Maybe<ResolversTypes['TeamType']>, ParentType, ContextType, RequireFields<Types.MutationCreateTeamArgs, 'dutyId' | 'name'>>;
  createUser?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, Partial<Types.MutationCreateUserArgs>>;
  createUserGroup?: Resolver<Types.Maybe<ResolversTypes['UserGroupType']>, ParentType, ContextType, RequireFields<Types.MutationCreateUserGroupArgs, 'name'>>;
  createVendor?: Resolver<Types.Maybe<ResolversTypes['Vendor']>, ParentType, ContextType, RequireFields<Types.MutationCreateVendorArgs, 'name' | 'physicalStoreId'>>;
  createVisitorStay?: Resolver<Types.Maybe<ResolversTypes['VisitorStayType']>, ParentType, ContextType, RequireFields<Types.MutationCreateVisitorStayArgs, 'numOfDays' | 'visitorId'>>;
  deleteAllSalaries?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationDeleteAllSalariesArgs, 'month'>>;
  deleteDuplicatePeople?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationDeleteDuplicatePeopleArgs, '_ids'>>;
  deleteHrKarkun?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationDeleteHrKarkunArgs, '_id'>>;
  deleteHrUserGroup?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationDeleteHrUserGroupArgs, '_id'>>;
  deleteMehfilDuty?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationDeleteMehfilDutyArgs, '_id'>>;
  deletePeopleTag?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationDeletePeopleTagArgs, '_id'>>;
  deletePurchasingAttachment?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationDeletePurchasingAttachmentArgs, '_id'>>;
  deletePurchasingOrder?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationDeletePurchasingOrderArgs, '_id'>>;
  deletePurchasingQuote?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationDeletePurchasingQuoteArgs, '_id'>>;
  deletePurchasingRequisition?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationDeletePurchasingRequisitionArgs, '_id'>>;
  deletePurchasingUserGroup?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationDeletePurchasingUserGroupArgs, '_id'>>;
  deleteSalaries?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationDeleteSalariesArgs, 'ids' | 'month'>>;
  deleteSecurityServerChannel?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationDeleteSecurityServerChannelArgs, '_id'>>;
  deleteSecurityServerProfile?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationDeleteSecurityServerProfileArgs, '_id'>>;
  deleteSecurityUserGroup?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationDeleteSecurityUserGroupArgs, '_id'>>;
  deleteSecurityVisitor?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationDeleteSecurityVisitorArgs, '_id'>>;
  deleteUserGroup?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationDeleteUserGroupArgs, '_id'>>;
  disableCommitteeFeature?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Types.MutationDisableCommitteeFeatureArgs, 'committeeId' | 'featureKey'>>;
  disableTwoFactor?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<Types.MutationDisableTwoFactorArgs, 'code'>>;
  enableCommitteeFeature?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Types.MutationEnableCommitteeFeatureArgs, 'committeeId' | 'featureKey'>>;
  enableTwoFactor?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<Types.MutationEnableTwoFactorArgs, 'code'>>;
  enrollTrustedDevice?: Resolver<Types.Maybe<ResolversTypes['EnrolledTrustedDeviceType']>, ParentType, ContextType, RequireFields<Types.MutationEnrollTrustedDeviceArgs, 'pin'>>;
  fixNameSpelling?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationFixNameSpellingArgs, 'existingSpelling' | 'newSpelling'>>;
  hardDeletePeople?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationHardDeletePeopleArgs, '_ids'>>;
  importSecurityVisitorsCsvData?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<Types.MutationImportSecurityVisitorsCsvDataArgs, 'csvData'>>;
  linkOrgLocationUser?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<Types.MutationLinkOrgLocationUserArgs, 'karkunId' | 'locationId' | 'userId'>>;
  markNotificationsRead?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Types.MutationMarkNotificationsReadArgs, 'ids'>>;
  markPurchasingOrderSent?: Resolver<Types.Maybe<ResolversTypes['PurchasingOrder']>, ParentType, ContextType, RequireFields<Types.MutationMarkPurchasingOrderSentArgs, '_id'>>;
  mergeStockItems?: Resolver<Types.Maybe<ResolversTypes['StockItem']>, ParentType, ContextType, RequireFields<Types.MutationMergeStockItemsArgs, '_idToKeep' | '_idsToMerge' | 'physicalStoreId'>>;
  moveCommittee?: Resolver<Types.Maybe<ResolversTypes['CommitteeType']>, ParentType, ContextType, RequireFields<Types.MutationMoveCommitteeArgs, 'committeeId' | 'locationId'>>;
  postPurchasingPayment?: Resolver<Types.Maybe<ResolversTypes['PurchasingPayment']>, ParentType, ContextType, RequireFields<Types.MutationPostPurchasingPaymentArgs, 'allocations' | 'method' | 'paymentDate' | 'vendorId'>>;
  postPurchasingReceipt?: Resolver<Types.Maybe<ResolversTypes['PurchasingReceipt']>, ParentType, ContextType, RequireFields<Types.MutationPostPurchasingReceiptArgs, 'lines' | 'orderId' | 'receivedDate'>>;
  promoteHrKarkun?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationPromoteHrKarkunArgs, '_id'>>;
  recalculateStockLevels?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['StockItem']>>>, ParentType, ContextType, RequireFields<Types.MutationRecalculateStockLevelsArgs, '_ids' | 'physicalStoreId'>>;
  registerUser?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRegisterUserArgs, 'displayName' | 'email'>>;
  rejectPurchasingOrder?: Resolver<Types.Maybe<ResolversTypes['PurchasingOrder']>, ParentType, ContextType, RequireFields<Types.MutationRejectPurchasingOrderArgs, '_id' | 'reason'>>;
  rejectPurchasingQuote?: Resolver<Types.Maybe<ResolversTypes['PurchasingQuote']>, ParentType, ContextType, RequireFields<Types.MutationRejectPurchasingQuoteArgs, '_id'>>;
  rejectPurchasingRequisition?: Resolver<Types.Maybe<ResolversTypes['PurchasingRequisition']>, ParentType, ContextType, RequireFields<Types.MutationRejectPurchasingRequisitionArgs, '_id' | 'reason'>>;
  removeCity?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveCityArgs, '_id'>>;
  removeCityMehfil?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveCityMehfilArgs, '_id'>>;
  removeCommittee?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveCommitteeArgs, '_id'>>;
  removeCommitteeMember?: Resolver<Types.Maybe<ResolversTypes['CommitteeType']>, ParentType, ContextType, RequireFields<Types.MutationRemoveCommitteeMemberArgs, 'committeeId' | 'karkunId'>>;
  removeDuty?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveDutyArgs, '_id'>>;
  removeDutyLocation?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveDutyLocationArgs, '_id'>>;
  removeDutyShift?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveDutyShiftArgs, '_id'>>;
  removeHrGroupMember?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationRemoveHrGroupMemberArgs, 'groupId' | 'userId'>>;
  removeHrKarkunAttachment?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationRemoveHrKarkunAttachmentArgs, '_id' | 'attachmentId'>>;
  removeHrPermissionGroup?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationRemoveHrPermissionGroupArgs, 'groupId' | 'permissionKey'>>;
  removeHrPermissionUser?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationRemoveHrPermissionUserArgs, 'permissionKey' | 'userId'>>;
  removeIssuanceFormAttachment?: Resolver<Types.Maybe<ResolversTypes['IssuanceForm']>, ParentType, ContextType, RequireFields<Types.MutationRemoveIssuanceFormAttachmentArgs, '_id' | 'attachmentId' | 'physicalStoreId'>>;
  removeIssuanceForms?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveIssuanceFormsArgs, '_ids' | 'physicalStoreId'>>;
  removeItemCategory?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveItemCategoryArgs, '_id' | 'physicalStoreId'>>;
  removeJob?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveJobArgs, '_id'>>;
  removeLocation?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveLocationArgs, '_id' | 'physicalStoreId'>>;
  removeMehfil?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveMehfilArgs, '_id'>>;
  removeMehfilKarkun?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveMehfilKarkunArgs, '_id'>>;
  removeOrgLocationFeatureUser?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationRemoveOrgLocationFeatureUserArgs, 'featureKey' | 'locationId' | 'permissionKey' | 'userId'>>;
  removeOrgLocationObserver?: Resolver<Types.Maybe<ResolversTypes['OrgLocationType']>, ParentType, ContextType, RequireFields<Types.MutationRemoveOrgLocationObserverArgs, 'karkunId' | 'locationId'>>;
  removePurchaseFormAttachment?: Resolver<Types.Maybe<ResolversTypes['PurchaseForm']>, ParentType, ContextType, RequireFields<Types.MutationRemovePurchaseFormAttachmentArgs, '_id' | 'attachmentId' | 'physicalStoreId'>>;
  removePurchaseForms?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemovePurchaseFormsArgs, '_ids' | 'physicalStoreId'>>;
  removePurchasingCatalogItem?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationRemovePurchasingCatalogItemArgs, '_id'>>;
  removePurchasingCatalogItemImage?: Resolver<Types.Maybe<ResolversTypes['PurchasingCatalogItem']>, ParentType, ContextType, RequireFields<Types.MutationRemovePurchasingCatalogItemImageArgs, '_id'>>;
  removePurchasingGroupMember?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationRemovePurchasingGroupMemberArgs, 'groupId' | 'userId'>>;
  removePurchasingPermissionGroup?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationRemovePurchasingPermissionGroupArgs, 'groupId' | 'permissionKey'>>;
  removePurchasingPermissionUser?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationRemovePurchasingPermissionUserArgs, 'permissionKey' | 'userId'>>;
  removePurchasingVendor?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationRemovePurchasingVendorArgs, '_id'>>;
  removeSecurityGroupMember?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationRemoveSecurityGroupMemberArgs, 'groupId' | 'userId'>>;
  removeSecurityMehfilDuty?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveSecurityMehfilDutyArgs, '_id'>>;
  removeSecurityMehfilLangarDish?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveSecurityMehfilLangarDishArgs, '_id'>>;
  removeSecurityMehfilLangarLocation?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveSecurityMehfilLangarLocationArgs, '_id'>>;
  removeSecurityPermissionGroup?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationRemoveSecurityPermissionGroupArgs, 'groupId' | 'permissionKey'>>;
  removeSecurityPermissionUser?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationRemoveSecurityPermissionUserArgs, 'permissionKey' | 'userId'>>;
  removeSecurityServerProfileImage?: Resolver<Types.Maybe<ResolversTypes['SecurityServerProfileType']>, ParentType, ContextType, RequireFields<Types.MutationRemoveSecurityServerProfileImageArgs, 'imageId' | 'profileId'>>;
  removeStockAdjustments?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveStockAdjustmentsArgs, '_ids' | 'physicalStoreId'>>;
  removeStockItem?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveStockItemArgs, '_id' | 'physicalStoreId'>>;
  removeTeam?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveTeamArgs, '_id'>>;
  removeTeamCoordinator?: Resolver<Types.Maybe<ResolversTypes['TeamType']>, ParentType, ContextType, RequireFields<Types.MutationRemoveTeamCoordinatorArgs, 'karkunId' | 'teamId'>>;
  removeTeamMember?: Resolver<Types.Maybe<ResolversTypes['TeamType']>, ParentType, ContextType, RequireFields<Types.MutationRemoveTeamMemberArgs, 'karkunId' | 'teamId'>>;
  removeTrustedDevice?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationRemoveTrustedDeviceArgs, 'deviceId'>>;
  removeVendor?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveVendorArgs, '_id' | 'physicalStoreId'>>;
  removeWorkspaceMonitoringProfilePhoto?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMonitoringProfileType']>, ParentType, ContextType, RequireFields<Types.MutationRemoveWorkspaceMonitoringProfilePhotoArgs, 'committeeId' | 'photoId' | 'profileId'>>;
  renameFreeFormCity?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRenameFreeFormCityArgs, 'existingSpelling' | 'newSpelling'>>;
  renameFreeFormCountry?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRenameFreeFormCountryArgs, 'existingSpelling' | 'newSpelling'>>;
  reopenPurchasingRequisition?: Resolver<Types.Maybe<ResolversTypes['PurchasingRequisition']>, ParentType, ContextType, RequireFields<Types.MutationReopenPurchasingRequisitionArgs, '_id'>>;
  resetJobDefinitionSchedule?: Resolver<Types.Maybe<ResolversTypes['JobDefinitionType']>, ParentType, ContextType, RequireFields<Types.MutationResetJobDefinitionScheduleArgs, '_id'>>;
  resetOrgLocationUserPassword?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<Types.MutationResetOrgLocationUserPasswordArgs, 'locationId' | 'password' | 'userId'>>;
  resetTwoFactor?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<Types.MutationResetTwoFactorArgs, 'userId'>>;
  resetUserPassword?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<Types.MutationResetUserPasswordArgs, 'password' | 'userId'>>;
  restorePerson?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRestorePersonArgs, '_id'>>;
  retryFailedJob?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationRetryFailedJobArgs, '_id'>>;
  revokeUserTrustedDevices?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRevokeUserTrustedDevicesArgs, 'userId'>>;
  runScheduledJobNow?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationRunScheduledJobNowArgs, 'name'>>;
  selectPurchasingQuote?: Resolver<Types.Maybe<ResolversTypes['PurchasingQuote']>, ParentType, ContextType, RequireFields<Types.MutationSelectPurchasingQuoteArgs, '_id'>>;
  sendInboxMessage?: Resolver<Types.Maybe<ResolversTypes['InboxMessageType']>, ParentType, ContextType, RequireFields<Types.MutationSendInboxMessageArgs, 'roomId' | 'text'>>;
  setCommitteeMemberDiscussionAccess?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationSetCommitteeMemberDiscussionAccessArgs, 'committeeId' | 'hasAccess' | 'karkunId'>>;
  setCommitteeMemberRole?: Resolver<Types.Maybe<ResolversTypes['CommitteeType']>, ParentType, ContextType, RequireFields<Types.MutationSetCommitteeMemberRoleArgs, 'committeeId' | 'karkunId' | 'role'>>;
  setDutyAttendance?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationSetDutyAttendanceArgs, 'date' | 'dutyId' | 'karkunId' | 'locationId' | 'shiftId'>>;
  setDutyDayOverride?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationSetDutyDayOverrideArgs, 'date' | 'dutyId' | 'locationId' | 'shiftId'>>;
  setDutyDetail?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['MehfilKarkunType']>>>, ParentType, ContextType, RequireFields<Types.MutationSetDutyDetailArgs, 'ids'>>;
  setDutyShiftTeam?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationSetDutyShiftTeamArgs, 'dutyId' | 'locationId' | 'shiftId'>>;
  setHrKarkunEmploymentInfo?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationSetHrKarkunEmploymentInfoArgs, '_id' | 'isEmployee'>>;
  setHrKarkunProfileImage?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationSetHrKarkunProfileImageArgs, '_id' | 'imageData'>>;
  setInstanceAccess?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<Types.MutationSetInstanceAccessArgs, 'instances' | 'userId'>>;
  setJobDefinitionEnabled?: Resolver<Types.Maybe<ResolversTypes['JobDefinitionType']>, ParentType, ContextType, RequireFields<Types.MutationSetJobDefinitionEnabledArgs, '_id' | 'enabled'>>;
  setOrgLocationUserLocked?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<Types.MutationSetOrgLocationUserLockedArgs, 'locationId' | 'locked' | 'userId'>>;
  setPermissions?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<Types.MutationSetPermissionsArgs, 'permissions' | 'userId'>>;
  setPurchasingCatalogItemActive?: Resolver<Types.Maybe<ResolversTypes['PurchasingCatalogItem']>, ParentType, ContextType, RequireFields<Types.MutationSetPurchasingCatalogItemActiveArgs, '_id' | 'isActive'>>;
  setPurchasingCatalogItemImage?: Resolver<Types.Maybe<ResolversTypes['PurchasingCatalogItem']>, ParentType, ContextType, RequireFields<Types.MutationSetPurchasingCatalogItemImageArgs, '_id' | 'imageData'>>;
  setPurchasingInvoiceDisputed?: Resolver<Types.Maybe<ResolversTypes['PurchasingInvoice']>, ParentType, ContextType, RequireFields<Types.MutationSetPurchasingInvoiceDisputedArgs, '_id' | 'isDisputed'>>;
  setPurchasingVendorActive?: Resolver<Types.Maybe<ResolversTypes['PurchasingVendor']>, ParentType, ContextType, RequireFields<Types.MutationSetPurchasingVendorActiveArgs, '_id' | 'isActive'>>;
  setScheduledJobEnabled?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationSetScheduledJobEnabledArgs, '_id' | 'enabled'>>;
  setSecurityServerAlertReview?: Resolver<Types.Maybe<ResolversTypes['SecurityServerAlertType']>, ParentType, ContextType, RequireFields<Types.MutationSetSecurityServerAlertReviewArgs, '_id'>>;
  setSecurityServerProfileDefaultImage?: Resolver<Types.Maybe<ResolversTypes['SecurityServerProfileType']>, ParentType, ContextType, RequireFields<Types.MutationSetSecurityServerProfileDefaultImageArgs, 'imageId' | 'profileId'>>;
  setSecurityVisitorImage?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationSetSecurityVisitorImageArgs, '_id' | 'imageData'>>;
  setStockItemImage?: Resolver<Types.Maybe<ResolversTypes['StockItem']>, ParentType, ContextType, RequireFields<Types.MutationSetStockItemImageArgs, '_id' | 'imageData' | 'physicalStoreId'>>;
  setSuperAdmin?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<Types.MutationSetSuperAdminArgs, 'isSuperAdmin' | 'userId'>>;
  setUserGroupInstanceAccess?: Resolver<Types.Maybe<ResolversTypes['UserGroupType']>, ParentType, ContextType, RequireFields<Types.MutationSetUserGroupInstanceAccessArgs, '_id' | 'instances'>>;
  setUserGroupPermissions?: Resolver<Types.Maybe<ResolversTypes['UserGroupType']>, ParentType, ContextType, RequireFields<Types.MutationSetUserGroupPermissionsArgs, '_id' | 'permissions'>>;
  startTwoFactorSetup?: Resolver<Types.Maybe<ResolversTypes['TwoFactorSetupType']>, ParentType, ContextType>;
  submitPurchasingOrder?: Resolver<Types.Maybe<ResolversTypes['PurchasingOrder']>, ParentType, ContextType, RequireFields<Types.MutationSubmitPurchasingOrderArgs, '_id'>>;
  submitPurchasingRequisition?: Resolver<Types.Maybe<ResolversTypes['PurchasingRequisition']>, ParentType, ContextType, RequireFields<Types.MutationSubmitPurchasingRequisitionArgs, '_id'>>;
  syncOrgLocationObservers?: Resolver<Types.Maybe<ResolversTypes['SyncOrgLocationObserversResult']>, ParentType, ContextType, RequireFields<Types.MutationSyncOrgLocationObserversArgs, 'locationId'>>;
  updateAttachment?: Resolver<Types.Maybe<ResolversTypes['Attachment']>, ParentType, ContextType, RequireFields<Types.MutationUpdateAttachmentArgs, '_id'>>;
  updateCity?: Resolver<Types.Maybe<ResolversTypes['CityType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateCityArgs, '_id' | 'country' | 'name'>>;
  updateCityLocationMappings?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updateCityMehfil?: Resolver<Types.Maybe<ResolversTypes['CityMehfilType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateCityMehfilArgs, '_id' | 'cityId' | 'name'>>;
  updateCommittee?: Resolver<Types.Maybe<ResolversTypes['CommitteeType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateCommitteeArgs, 'id' | 'name'>>;
  updateDuty?: Resolver<Types.Maybe<ResolversTypes['DutyType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateDutyArgs, 'id' | 'name'>>;
  updateDutyLocation?: Resolver<Types.Maybe<ResolversTypes['DutyLocationType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateDutyLocationArgs, 'dutyId' | 'id' | 'name'>>;
  updateDutyShift?: Resolver<Types.Maybe<ResolversTypes['DutyShiftType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateDutyShiftArgs, '_id' | 'dutyId' | 'name'>>;
  updateHrKarkun?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateHrKarkunArgs, '_id' | 'name'>>;
  updateHrUserGroup?: Resolver<Types.Maybe<ResolversTypes['HrUserGroup']>, ParentType, ContextType, RequireFields<Types.MutationUpdateHrUserGroupArgs, '_id' | 'name'>>;
  updateIssuanceForm?: Resolver<Types.Maybe<ResolversTypes['IssuanceForm']>, ParentType, ContextType, RequireFields<Types.MutationUpdateIssuanceFormArgs, '_id' | 'issueDate' | 'issuedBy' | 'issuedTo' | 'physicalStoreId'>>;
  updateItemCategory?: Resolver<Types.Maybe<ResolversTypes['ItemCategory']>, ParentType, ContextType, RequireFields<Types.MutationUpdateItemCategoryArgs, '_id' | 'name' | 'physicalStoreId'>>;
  updateJob?: Resolver<Types.Maybe<ResolversTypes['JobType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateJobArgs, 'id' | 'name'>>;
  updateJobDefinitionSchedule?: Resolver<Types.Maybe<ResolversTypes['JobDefinitionType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateJobDefinitionScheduleArgs, '_id' | 'schedule'>>;
  updateLastActiveTime?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updateLocation?: Resolver<Types.Maybe<ResolversTypes['Location']>, ParentType, ContextType, RequireFields<Types.MutationUpdateLocationArgs, '_id' | 'name' | 'physicalStoreId'>>;
  updateLoginTime?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updateMehfil?: Resolver<Types.Maybe<ResolversTypes['MehfilType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateMehfilArgs, '_id' | 'name'>>;
  updateMehfilDuty?: Resolver<Types.Maybe<ResolversTypes['MehfilDutyType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateMehfilDutyArgs, '_id'>>;
  updateOrgLocation?: Resolver<Types.Maybe<ResolversTypes['OrgLocationType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateOrgLocationArgs, '_id' | 'name'>>;
  updatePeopleTag?: Resolver<Types.Maybe<ResolversTypes['PeopleTagType']>, ParentType, ContextType, RequireFields<Types.MutationUpdatePeopleTagArgs, '_id' | 'color' | 'moduleNames' | 'name' | 'textColor'>>;
  updatePhysicalStore?: Resolver<Types.Maybe<ResolversTypes['PhysicalStore']>, ParentType, ContextType, RequireFields<Types.MutationUpdatePhysicalStoreArgs, 'id' | 'name'>>;
  updatePurchaseForm?: Resolver<Types.Maybe<ResolversTypes['PurchaseForm']>, ParentType, ContextType, RequireFields<Types.MutationUpdatePurchaseFormArgs, '_id' | 'physicalStoreId' | 'purchaseDate' | 'purchasedBy' | 'receivedBy'>>;
  updatePurchasingCatalogItem?: Resolver<Types.Maybe<ResolversTypes['PurchasingCatalogItem']>, ParentType, ContextType, RequireFields<Types.MutationUpdatePurchasingCatalogItemArgs, '_id' | 'name' | 'unit'>>;
  updatePurchasingInvoice?: Resolver<Types.Maybe<ResolversTypes['PurchasingInvoice']>, ParentType, ContextType, RequireFields<Types.MutationUpdatePurchasingInvoiceArgs, '_id' | 'dueDate' | 'vendorInvoiceNo'>>;
  updatePurchasingOrder?: Resolver<Types.Maybe<ResolversTypes['PurchasingOrder']>, ParentType, ContextType, RequireFields<Types.MutationUpdatePurchasingOrderArgs, '_id' | 'lines' | 'orderDate' | 'vendorId' | 'version'>>;
  updatePurchasingQuote?: Resolver<Types.Maybe<ResolversTypes['PurchasingQuote']>, ParentType, ContextType, RequireFields<Types.MutationUpdatePurchasingQuoteArgs, '_id' | 'lines' | 'quoteDate' | 'vendorId' | 'version'>>;
  updatePurchasingRequisition?: Resolver<Types.Maybe<ResolversTypes['PurchasingRequisition']>, ParentType, ContextType, RequireFields<Types.MutationUpdatePurchasingRequisitionArgs, '_id' | 'lines' | 'title' | 'version'>>;
  updatePurchasingUserGroup?: Resolver<Types.Maybe<ResolversTypes['PurchasingUserGroup']>, ParentType, ContextType, RequireFields<Types.MutationUpdatePurchasingUserGroupArgs, '_id' | 'name'>>;
  updatePurchasingVendor?: Resolver<Types.Maybe<ResolversTypes['PurchasingVendor']>, ParentType, ContextType, RequireFields<Types.MutationUpdatePurchasingVendorArgs, '_id' | 'name'>>;
  updateSalary?: Resolver<Types.Maybe<ResolversTypes['SalaryType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateSalaryArgs, '_id'>>;
  updateSecurityMehfilDuty?: Resolver<Types.Maybe<ResolversTypes['MehfilDutyType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateSecurityMehfilDutyArgs, 'id' | 'name' | 'urduName'>>;
  updateSecurityMehfilLangarDish?: Resolver<Types.Maybe<ResolversTypes['MehfilLangarDishType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateSecurityMehfilLangarDishArgs, 'id' | 'name' | 'urduName'>>;
  updateSecurityMehfilLangarLocation?: Resolver<Types.Maybe<ResolversTypes['MehfilLangarLocationType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateSecurityMehfilLangarLocationArgs, 'id' | 'name' | 'urduName'>>;
  updateSecurityServerChannel?: Resolver<Types.Maybe<ResolversTypes['SecurityServerChannelType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateSecurityServerChannelArgs, '_id' | 'connection' | 'enabled' | 'name' | 'recognitionFps'>>;
  updateSecurityServerProfile?: Resolver<Types.Maybe<ResolversTypes['SecurityServerProfileType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateSecurityServerProfileArgs, '_id' | 'isTest' | 'name'>>;
  updateSecurityUserGroup?: Resolver<Types.Maybe<ResolversTypes['SecurityUserGroup']>, ParentType, ContextType, RequireFields<Types.MutationUpdateSecurityUserGroupArgs, '_id' | 'name'>>;
  updateSecurityVisitor?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateSecurityVisitorArgs, '_id' | 'ehadDate' | 'name' | 'parentName' | 'referenceName'>>;
  updateSecurityVisitorNotes?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateSecurityVisitorNotesArgs, '_id'>>;
  updateStockAdjustment?: Resolver<Types.Maybe<ResolversTypes['StockAdjustment']>, ParentType, ContextType, RequireFields<Types.MutationUpdateStockAdjustmentArgs, '_id' | 'adjustedBy' | 'adjustmentDate' | 'isInflow' | 'physicalStoreId' | 'quantity'>>;
  updateStockItem?: Resolver<Types.Maybe<ResolversTypes['StockItem']>, ParentType, ContextType, RequireFields<Types.MutationUpdateStockItemArgs, '_id' | 'categoryId' | 'name' | 'physicalStoreId' | 'unitOfMeasurement'>>;
  updateTeam?: Resolver<Types.Maybe<ResolversTypes['TeamType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateTeamArgs, 'dutyId' | 'id' | 'name'>>;
  updateTeamMemberDays?: Resolver<Types.Maybe<ResolversTypes['TeamType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateTeamMemberDaysArgs, 'daysOfWeek' | 'karkunId' | 'teamId'>>;
  updateUser?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateUserArgs, 'userId'>>;
  updateUserGroup?: Resolver<Types.Maybe<ResolversTypes['UserGroupType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateUserGroupArgs, '_id'>>;
  updateVendor?: Resolver<Types.Maybe<ResolversTypes['Vendor']>, ParentType, ContextType, RequireFields<Types.MutationUpdateVendorArgs, '_id' | 'physicalStoreId'>>;
  updateVisitorStay?: Resolver<Types.Maybe<ResolversTypes['VisitorStayType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateVisitorStayArgs, '_id' | 'fromDate' | 'toDate'>>;
  updateWorkspaceMonitoringProfile?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMonitoringProfileType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateWorkspaceMonitoringProfileArgs, 'committeeId' | 'isTest' | 'name' | 'profileId'>>;
  verifyStockItemLevel?: Resolver<Types.Maybe<ResolversTypes['StockItem']>, ParentType, ContextType, RequireFields<Types.MutationVerifyStockItemLevelArgs, '_id' | 'physicalStoreId'>>;
  voidPurchasingInvoice?: Resolver<Types.Maybe<ResolversTypes['PurchasingInvoice']>, ParentType, ContextType, RequireFields<Types.MutationVoidPurchasingInvoiceArgs, '_id'>>;
  voidPurchasingPayment?: Resolver<Types.Maybe<ResolversTypes['PurchasingPayment']>, ParentType, ContextType, RequireFields<Types.MutationVoidPurchasingPaymentArgs, '_id' | 'reason'>>;
  voidPurchasingReceipt?: Resolver<Types.Maybe<ResolversTypes['PurchasingReceipt']>, ParentType, ContextType, RequireFields<Types.MutationVoidPurchasingReceiptArgs, '_id' | 'reason'>>;
  workspaceAbortDocumentUpload?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceAbortDocumentUploadArgs, 'committeeId' | 'uploadId'>>;
  workspaceAbortMeetingAttachmentUpload?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceAbortMeetingAttachmentUploadArgs, 'committeeId' | 'uploadId'>>;
  workspaceAddCommitteeMember?: Resolver<Types.Maybe<ResolversTypes['WorkspaceCommitteeType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceAddCommitteeMemberArgs, 'committeeId' | 'karkunId'>>;
  workspaceAddMeetingAgendaItem?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceAddMeetingAgendaItemArgs, 'committeeId' | 'input' | 'meetingId'>>;
  workspaceAddMehfilPermissionUser?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceAddMehfilPermissionUserArgs, 'featureKey' | 'karkunId' | 'locationId' | 'permissionKey'>>;
  workspaceAddProjectParticipants?: Resolver<Types.Maybe<ResolversTypes['WorkspaceProjectType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceAddProjectParticipantsArgs, 'committeeId' | 'personIds' | 'projectId'>>;
  workspaceAddTaskComment?: Resolver<Types.Maybe<ResolversTypes['WorkspaceTaskCommentType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceAddTaskCommentArgs, 'committeeId' | 'taskId' | 'text'>>;
  workspaceCancelMeeting?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceCancelMeetingArgs, 'committeeId' | 'meetingId'>>;
  workspaceCancelPoll?: Resolver<Types.Maybe<ResolversTypes['WorkspacePollType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceCancelPollArgs, 'committeeId' | 'pollId'>>;
  workspaceCastPollVote?: Resolver<Types.Maybe<ResolversTypes['WorkspacePollType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceCastPollVoteArgs, 'answers' | 'committeeId' | 'pollId'>>;
  workspaceCheckInDocument?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceCheckInDocumentArgs, 'committeeId' | 'documentId'>>;
  workspaceCheckOutDocument?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceCheckOutDocumentArgs, 'committeeId' | 'documentId' | 'durationMinutes'>>;
  workspaceClosePoll?: Resolver<Types.Maybe<ResolversTypes['WorkspacePollType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceClosePollArgs, 'committeeId' | 'pollId'>>;
  workspaceCompleteDocumentUpload?: Resolver<Types.Maybe<ResolversTypes['WorkspaceDocumentType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceCompleteDocumentUploadArgs, 'committeeId' | 'uploadId'>>;
  workspaceCompleteMeeting?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceCompleteMeetingArgs, 'committeeId' | 'meetingId'>>;
  workspaceCompleteMeetingAttachmentUpload?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingAttachmentType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceCompleteMeetingAttachmentUploadArgs, 'committeeId' | 'uploadId'>>;
  workspaceCreateDocumentFolder?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceCreateDocumentFolderArgs, 'committeeId' | 'name'>>;
  workspaceCreateDocumentUpload?: Resolver<Types.Maybe<ResolversTypes['WorkspaceDocumentUploadType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceCreateDocumentUploadArgs, 'committeeId' | 'fileName' | 'size'>>;
  workspaceCreateMeeting?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceCreateMeetingArgs, 'committeeId' | 'input'>>;
  workspaceCreateMeetingActionItem?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingActionItemType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceCreateMeetingActionItemArgs, 'committeeId' | 'input' | 'meetingId'>>;
  workspaceCreateMeetingAttachmentUpload?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingUploadType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceCreateMeetingAttachmentUploadArgs, 'committeeId' | 'fileName' | 'meetingId' | 'size'>>;
  workspaceCreatePoll?: Resolver<Types.Maybe<ResolversTypes['WorkspacePollType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceCreatePollArgs, 'committeeId' | 'input'>>;
  workspaceCreateProject?: Resolver<Types.Maybe<ResolversTypes['WorkspaceProjectType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceCreateProjectArgs, 'committeeId' | 'input'>>;
  workspaceCreateTask?: Resolver<Types.Maybe<ResolversTypes['WorkspaceTaskType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceCreateTaskArgs, 'committeeId' | 'input'>>;
  workspaceDaAddDuties?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DaDutyType']>>>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceDaAddDutiesArgs, 'locationId' | 'mehfilDutyIds'>>;
  workspaceDaAddDutyMember?: Resolver<Types.Maybe<ResolversTypes['DaDutyType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceDaAddDutyMemberArgs, 'dutyId' | 'karkunId' | 'locationId'>>;
  workspaceDaRemoveDuty?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceDaRemoveDutyArgs, 'dutyId' | 'locationId'>>;
  workspaceDaRemoveDutyMember?: Resolver<Types.Maybe<ResolversTypes['DaDutyType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceDaRemoveDutyMemberArgs, 'dutyId' | 'karkunId' | 'locationId'>>;
  workspaceDaSetAttendance?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceDaSetAttendanceArgs, 'date' | 'dutyId' | 'karkunId' | 'locationId'>>;
  workspaceDaSetDayOverride?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceDaSetDayOverrideArgs, 'date' | 'dutyId' | 'locationId'>>;
  workspaceDaUpdateDuty?: Resolver<Types.Maybe<ResolversTypes['DaDutyType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceDaUpdateDutyArgs, 'dutyId' | 'locationId'>>;
  workspaceDaUpdateDutyMember?: Resolver<Types.Maybe<ResolversTypes['DaDutyType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceDaUpdateDutyMemberArgs, 'dutyId' | 'karkunId' | 'locationId'>>;
  workspaceDeleteDiscussionMessage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Types.MutationWorkspaceDeleteDiscussionMessageArgs, 'committeeId' | 'messageId'>>;
  workspaceDeleteDocumentVersion?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceDeleteDocumentVersionArgs, 'committeeId' | 'documentId' | 'versionId'>>;
  workspaceDeleteMeeting?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceDeleteMeetingArgs, 'committeeId' | 'meetingId'>>;
  workspaceDeleteMeetingActionItem?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceDeleteMeetingActionItemArgs, 'actionItemId' | 'committeeId'>>;
  workspaceDeleteMeetingAttachment?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceDeleteMeetingAttachmentArgs, 'attachmentId' | 'committeeId'>>;
  workspaceDeletePoll?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceDeletePollArgs, 'committeeId' | 'pollId'>>;
  workspaceDeleteProject?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceDeleteProjectArgs, 'committeeId' | 'projectId'>>;
  workspaceDeleteTask?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceDeleteTaskArgs, 'committeeId' | 'taskId'>>;
  workspaceDeleteTaskComment?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceDeleteTaskCommentArgs, 'commentId' | 'committeeId'>>;
  workspaceDocumentDownloadUrl?: Resolver<Types.Maybe<ResolversTypes['WorkspaceDocumentDownloadType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceDocumentDownloadUrlArgs, 'committeeId' | 'documentId'>>;
  workspaceEditDiscussionMessage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Types.MutationWorkspaceEditDiscussionMessageArgs, 'committeeId' | 'messageId' | 'text'>>;
  workspaceEmptyDocumentTrash?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceEmptyDocumentTrashArgs, 'committeeId'>>;
  workspaceForceUnlockDocument?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceForceUnlockDocumentArgs, 'committeeId' | 'documentId'>>;
  workspaceJoinDiscussionVideoCall?: Resolver<Types.Maybe<ResolversTypes['DiscussionVideoCallType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceJoinDiscussionVideoCallArgs, 'committeeId'>>;
  workspaceJoinMeetingVideoCall?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingVideoCallType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceJoinMeetingVideoCallArgs, 'committeeId' | 'meetingId'>>;
  workspaceMarkMeetingAttendance?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceMarkMeetingAttendanceArgs, 'committeeId' | 'entries' | 'meetingId'>>;
  workspaceMeetingAttachmentDownloadUrl?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingDownloadType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceMeetingAttachmentDownloadUrlArgs, 'attachmentId' | 'committeeId'>>;
  workspaceMoveDocument?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceMoveDocumentArgs, 'committeeId' | 'documentId'>>;
  workspaceMoveDocumentFolder?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceMoveDocumentFolderArgs, 'committeeId' | 'folderId'>>;
  workspaceOpenPoll?: Resolver<Types.Maybe<ResolversTypes['WorkspacePollType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceOpenPollArgs, 'committeeId' | 'pollId'>>;
  workspacePurgeDocumentTrashItem?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspacePurgeDocumentTrashItemArgs, 'committeeId' | 'itemId'>>;
  workspaceReactToDiscussionMessage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Types.MutationWorkspaceReactToDiscussionMessageArgs, 'committeeId' | 'emoji' | 'messageId' | 'shouldReact'>>;
  workspaceRemoveCommitteeMember?: Resolver<Types.Maybe<ResolversTypes['WorkspaceCommitteeType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceRemoveCommitteeMemberArgs, 'committeeId' | 'karkunId'>>;
  workspaceRemoveMeetingAgendaItem?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceRemoveMeetingAgendaItemArgs, 'agendaItemId' | 'committeeId' | 'meetingId'>>;
  workspaceRemoveMehfilPermissionUser?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceRemoveMehfilPermissionUserArgs, 'featureKey' | 'locationId' | 'permissionKey' | 'userId'>>;
  workspaceRemoveProjectParticipant?: Resolver<Types.Maybe<ResolversTypes['WorkspaceProjectType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceRemoveProjectParticipantArgs, 'committeeId' | 'personId' | 'projectId'>>;
  workspaceRenameDocumentFolder?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceRenameDocumentFolderArgs, 'committeeId' | 'folderId' | 'name'>>;
  workspaceReopenMeeting?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceReopenMeetingArgs, 'committeeId' | 'meetingId'>>;
  workspaceReopenPoll?: Resolver<Types.Maybe<ResolversTypes['WorkspacePollType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceReopenPollArgs, 'closesAt' | 'committeeId' | 'pollId'>>;
  workspaceReorderMeetingAgenda?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceReorderMeetingAgendaArgs, 'agendaItemIds' | 'committeeId' | 'meetingId'>>;
  workspaceRespondToMeeting?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceRespondToMeetingArgs, 'committeeId' | 'meetingId' | 'status'>>;
  workspaceRestoreDocumentTrashItem?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceRestoreDocumentTrashItemArgs, 'committeeId' | 'itemId'>>;
  workspaceRestoreDocumentVersion?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceRestoreDocumentVersionArgs, 'committeeId' | 'documentId' | 'versionId'>>;
  workspaceSendDiscussionMessage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Types.MutationWorkspaceSendDiscussionMessageArgs, 'committeeId' | 'text'>>;
  workspaceSetCommitteeMemberCoordinator?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceSetCommitteeMemberCoordinatorArgs, 'committeeId' | 'isCoordinator' | 'karkunId'>>;
  workspaceSetCommitteeMemberDiscussionAccess?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceSetCommitteeMemberDiscussionAccessArgs, 'committeeId' | 'hasAccess' | 'karkunId'>>;
  workspaceSetDiscussionMessagePinned?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Types.MutationWorkspaceSetDiscussionMessagePinnedArgs, 'committeeId' | 'messageId' | 'pinned'>>;
  workspaceSetDiscussionMessageStarred?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Types.MutationWorkspaceSetDiscussionMessageStarredArgs, 'committeeId' | 'messageId' | 'starred'>>;
  workspaceSetMeetingActionItemStatus?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingActionItemType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceSetMeetingActionItemStatusArgs, 'actionItemId' | 'committeeId' | 'status'>>;
  workspaceSetMeetingMinutes?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceSetMeetingMinutesArgs, 'committeeId' | 'meetingId'>>;
  workspaceSetMeetingParticipantRole?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceSetMeetingParticipantRoleArgs, 'committeeId' | 'meetingId' | 'participantId' | 'role'>>;
  workspaceSetMeetingParticipants?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceSetMeetingParticipantsArgs, 'committeeId' | 'meetingId' | 'participantIds'>>;
  workspaceSetProjectStatus?: Resolver<Types.Maybe<ResolversTypes['WorkspaceProjectType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceSetProjectStatusArgs, 'committeeId' | 'projectId' | 'status'>>;
  workspaceSetTaskProgress?: Resolver<Types.Maybe<ResolversTypes['WorkspaceTaskType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceSetTaskProgressArgs, 'committeeId' | 'progress' | 'taskId'>>;
  workspaceSetTaskStatus?: Resolver<Types.Maybe<ResolversTypes['WorkspaceTaskType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceSetTaskStatusArgs, 'committeeId' | 'status' | 'taskId'>>;
  workspaceTrashDocument?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceTrashDocumentArgs, 'committeeId' | 'documentId'>>;
  workspaceTrashDocumentFolder?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceTrashDocumentFolderArgs, 'committeeId' | 'folderId'>>;
  workspaceUpdateDocument?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceUpdateDocumentArgs, 'committeeId' | 'documentId' | 'name'>>;
  workspaceUpdateMeeting?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceUpdateMeetingArgs, 'committeeId' | 'input' | 'meetingId'>>;
  workspaceUpdateMeetingActionItem?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingActionItemType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceUpdateMeetingActionItemArgs, 'actionItemId' | 'committeeId' | 'input'>>;
  workspaceUpdateMeetingAgendaItem?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceUpdateMeetingAgendaItemArgs, 'agendaItemId' | 'committeeId' | 'input' | 'meetingId'>>;
  workspaceUpdateMehfilDetails?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMehfilDetailsType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceUpdateMehfilDetailsArgs, 'locationId' | 'mehfilDetails'>>;
  workspaceUpdatePoll?: Resolver<Types.Maybe<ResolversTypes['WorkspacePollType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceUpdatePollArgs, 'committeeId' | 'input' | 'pollId'>>;
  workspaceUpdateProject?: Resolver<Types.Maybe<ResolversTypes['WorkspaceProjectType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceUpdateProjectArgs, 'committeeId' | 'input' | 'projectId'>>;
  workspaceUpdateTask?: Resolver<Types.Maybe<ResolversTypes['WorkspaceTaskType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceUpdateTaskArgs, 'committeeId' | 'input' | 'taskId'>>;
  workspaceWithdrawPollVote?: Resolver<Types.Maybe<ResolversTypes['WorkspacePollType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceWithdrawPollVoteArgs, 'committeeId' | 'pollId'>>;
}>;

export type MyMehfilDetailsLocationTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyMehfilDetailsLocationType'] = ResolversParentTypes['MyMehfilDetailsLocationType']> = ResolversObject<{
  hasWorkspace?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  locationId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parentId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  permissions?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type MyMehfilKarkunsLocationTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyMehfilKarkunsLocationType'] = ResolversParentTypes['MyMehfilKarkunsLocationType']> = ResolversObject<{
  hasWorkspace?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  locationId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parentId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  permissions?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type MyMehfilPermissionsLocationTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyMehfilPermissionsLocationType'] = ResolversParentTypes['MyMehfilPermissionsLocationType']> = ResolversObject<{
  hasWorkspace?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  locationId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parentId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  permissions?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type NotificationCountTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['NotificationCountType'] = ResolversParentTypes['NotificationCountType']> = ResolversObject<{
  committeeId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  module?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  unreadCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type NotificationTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['NotificationType'] = ResolversParentTypes['NotificationType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  actorUserId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  committeeId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  data?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  entityId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  entityType?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  eventDetails?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  eventType?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isRead?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  module?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  recipientUserId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type OrgLocationFeaturePermissionTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['OrgLocationFeaturePermissionType'] = ResolversParentTypes['OrgLocationFeaturePermissionType']> = ResolversObject<{
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  users?: Resolver<Array<Types.Maybe<ResolversTypes['OrgLocationFeaturePermissionUserType']>>, ParentType, ContextType>;
}>;

export type OrgLocationFeaturePermissionUserTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['OrgLocationFeaturePermissionUserType'] = ResolversParentTypes['OrgLocationFeaturePermissionUserType']> = ResolversObject<{
  displayName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  personId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  username?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type OrgLocationFeaturePermissionsTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['OrgLocationFeaturePermissionsType'] = ResolversParentTypes['OrgLocationFeaturePermissionsType']> = ResolversObject<{
  featureKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  featureName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  permissions?: Resolver<Array<Types.Maybe<ResolversTypes['OrgLocationFeaturePermissionType']>>, ParentType, ContextType>;
}>;

export type OrgLocationKarkunTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['OrgLocationKarkunType'] = ResolversParentTypes['OrgLocationKarkunType']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  cnicNumber?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber1?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber2?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasUserAccount?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  imageThumbnailUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  parentName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type OrgLocationMehfilDetailsTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['OrgLocationMehfilDetailsType'] = ResolversParentTypes['OrgLocationMehfilDetailsType']> = ResolversObject<{
  address?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  attendanceGeofenceMeters?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  latitude?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lcdAvailability?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  longitude?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  mehfilStartYear?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  otherMehfilDetails?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tabAvailability?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  timingDetails?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type OrgLocationObserverStatTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['OrgLocationObserverStatType'] = ResolversParentTypes['OrgLocationObserverStatType']> = ResolversObject<{
  karkunId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  observedCommitteeCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  observedCommitteeIds?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
}>;

export type OrgLocationTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['OrgLocationType'] = ResolversParentTypes['OrgLocationType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  allParentIds?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  committees?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['CommitteeBasicType']>>>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mehfilDetails?: Resolver<Types.Maybe<ResolversTypes['OrgLocationMehfilDetailsType']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  observerKarkunIds?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  observerStats?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['OrgLocationObserverStatType']>>>, ParentType, ContextType>;
  observers?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PersonType']>>>, ParentType, ContextType>;
  parent?: Resolver<Types.Maybe<ResolversTypes['OrgLocationType']>, ParentType, ContextType>;
  parentId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type PagedAuditLogTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedAuditLogType'] = ResolversParentTypes['PagedAuditLogType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['AuditLogType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedCityTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedCityType'] = ResolversParentTypes['PagedCityType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['CityType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedFreeFormCityResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedFreeFormCity'] = ResolversParentTypes['PagedFreeFormCity']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['FreeFormCityType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedFreeFormValueResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedFreeFormValue'] = ResolversParentTypes['PagedFreeFormValue']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['FreeFormValueType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedHrPermissionKarkunTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedHrPermissionKarkunType'] = ResolversParentTypes['PagedHrPermissionKarkunType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['HrPermissionKarkunType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedInboxConversationTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedInboxConversationType'] = ResolversParentTypes['PagedInboxConversationType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['InboxConversationType']>>>, ParentType, ContextType>;
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

export type PagedMehfilLocationKarkunTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedMehfilLocationKarkunType'] = ResolversParentTypes['PagedMehfilLocationKarkunType']> = ResolversObject<{
  data?: Resolver<Array<ResolversTypes['MehfilLocationKarkunType']>, ParentType, ContextType>;
  totalResults?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type PagedMpKarkunTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedMpKarkunType'] = ResolversParentTypes['PagedMpKarkunType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['MpKarkunType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedOrgLocationKarkunTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedOrgLocationKarkunType'] = ResolversParentTypes['PagedOrgLocationKarkunType']> = ResolversObject<{
  data?: Resolver<Array<ResolversTypes['OrgLocationKarkunType']>, ParentType, ContextType>;
  totalResults?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
}>;

export type PagedPeopleTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedPeopleType'] = ResolversParentTypes['PagedPeopleType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PersonType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedPurchaseFormResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedPurchaseForm'] = ResolversParentTypes['PagedPurchaseForm']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchaseForm']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedPurchasingCatalogItemsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedPurchasingCatalogItems'] = ResolversParentTypes['PagedPurchasingCatalogItems']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchasingCatalogItem']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedPurchasingInvoicesResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedPurchasingInvoices'] = ResolversParentTypes['PagedPurchasingInvoices']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchasingInvoice']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedPurchasingKarkunTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedPurchasingKarkunType'] = ResolversParentTypes['PagedPurchasingKarkunType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchasingKarkunType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedPurchasingOrdersResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedPurchasingOrders'] = ResolversParentTypes['PagedPurchasingOrders']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchasingOrder']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedPurchasingPaymentsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedPurchasingPayments'] = ResolversParentTypes['PagedPurchasingPayments']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchasingPayment']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedPurchasingQuotesResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedPurchasingQuotes'] = ResolversParentTypes['PagedPurchasingQuotes']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchasingQuote']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedPurchasingReceiptsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedPurchasingReceipts'] = ResolversParentTypes['PagedPurchasingReceipts']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchasingReceipt']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedPurchasingRequisitionsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedPurchasingRequisitions'] = ResolversParentTypes['PagedPurchasingRequisitions']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchasingRequisition']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedPurchasingVendorsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedPurchasingVendors'] = ResolversParentTypes['PagedPurchasingVendors']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchasingVendor']>>>, ParentType, ContextType>;
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

export type PagedSecurityPermissionKarkunTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedSecurityPermissionKarkunType'] = ResolversParentTypes['PagedSecurityPermissionKarkunType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['SecurityPermissionKarkunType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedSecurityServerAlertGroupTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedSecurityServerAlertGroupType'] = ResolversParentTypes['PagedSecurityServerAlertGroupType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['SecurityServerAlertGroupType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedSecurityServerAlertTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedSecurityServerAlertType'] = ResolversParentTypes['PagedSecurityServerAlertType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['SecurityServerAlertType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedSecurityServerProfileTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedSecurityServerProfileType'] = ResolversParentTypes['PagedSecurityServerProfileType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['SecurityServerProfileType']>>>, ParentType, ContextType>;
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

export type PagedWorkspaceDocumentTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedWorkspaceDocumentType'] = ResolversParentTypes['PagedWorkspaceDocumentType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceDocumentType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedWorkspaceKarkunTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedWorkspaceKarkunType'] = ResolversParentTypes['PagedWorkspaceKarkunType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceKarkunType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedWorkspaceMeetingActionItemTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedWorkspaceMeetingActionItemType'] = ResolversParentTypes['PagedWorkspaceMeetingActionItemType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceMeetingActionItemType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedWorkspaceMeetingTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedWorkspaceMeetingType'] = ResolversParentTypes['PagedWorkspaceMeetingType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceMeetingType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedWorkspaceMonitoringAlertTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedWorkspaceMonitoringAlertType'] = ResolversParentTypes['PagedWorkspaceMonitoringAlertType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceMonitoringAlertType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedWorkspaceMonitoringProfileTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedWorkspaceMonitoringProfileType'] = ResolversParentTypes['PagedWorkspaceMonitoringProfileType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceMonitoringProfileType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedWorkspaceNightStayTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedWorkspaceNightStayType'] = ResolversParentTypes['PagedWorkspaceNightStayType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceNightStayType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedWorkspacePollTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedWorkspacePollType'] = ResolversParentTypes['PagedWorkspacePollType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspacePollType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedWorkspaceProjectTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedWorkspaceProjectType'] = ResolversParentTypes['PagedWorkspaceProjectType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceProjectType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedWorkspaceTaskCommentTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedWorkspaceTaskCommentType'] = ResolversParentTypes['PagedWorkspaceTaskCommentType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceTaskCommentType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedWorkspaceTaskTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedWorkspaceTaskType'] = ResolversParentTypes['PagedWorkspaceTaskType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceTaskType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PeopleTagTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PeopleTagType'] = ResolversParentTypes['PeopleTagType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  color?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  moduleNames?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  textColor?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type PersonBasicSharedDataTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PersonBasicSharedDataType'] = ResolversParentTypes['PersonBasicSharedDataType']> = ResolversObject<{
  cnicNumber?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber1?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber2?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageThumbnailUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type PersonBasicTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PersonBasicType'] = ResolversParentTypes['PersonBasicType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sharedData?: Resolver<Types.Maybe<ResolversTypes['PersonBasicSharedDataType']>, ParentType, ContextType>;
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
  cityLocation?: Resolver<Types.Maybe<ResolversTypes['ReferenceOrgLocationType']>, ParentType, ContextType>;
  cityLocationId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ehadKarkun?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  ehadPermissionDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastTarteebDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mehfilLocation?: Resolver<Types.Maybe<ResolversTypes['ReferenceOrgLocationType']>, ParentType, ContextType>;
  mehfilLocationId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mehfilRaabta?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  msLastVisitDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  msRaabta?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  teams?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['TeamType']>>>, ParentType, ContextType>;
}>;

export type PersonRelationCountTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PersonRelationCountType'] = ResolversParentTypes['PersonRelationCountType']> = ResolversObject<{
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type PersonRelationCountsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PersonRelationCounts'] = ResolversParentTypes['PersonRelationCounts']> = ResolversObject<{
  counts?: Resolver<Array<ResolversTypes['PersonRelationCountType']>, ParentType, ContextType>;
  personId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
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
  imageThumbnailUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type PurchasingAttachmentResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingAttachment'] = ResolversParentTypes['PurchasingAttachment']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fileName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mimeType?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ownerId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ownerType?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  size?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type PurchasingAttachmentDownloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingAttachmentDownload'] = ResolversParentTypes['PurchasingAttachmentDownload']> = ResolversObject<{
  fileName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mimeType?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type PurchasingAttachmentUploadResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingAttachmentUpload'] = ResolversParentTypes['PurchasingAttachmentUpload']> = ResolversObject<{
  contentType?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uploadId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type PurchasingCatalogItemResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingCatalogItem'] = ResolversParentTypes['PurchasingCatalogItem']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  category?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  company?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  defaultUnitPrice?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isActive?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  lastUnitPrice?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lastVendorId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  unit?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type PurchasingDashboardResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingDashboard'] = ResolversParentTypes['PurchasingDashboard']> = ResolversObject<{
  openOrders?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  ordersAwaitingApproval?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  overdueAmount?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  overdueInvoices?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  requisitionsAwaitingApproval?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  totalPayable?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
}>;

export type PurchasingGroupMemberResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingGroupMember'] = ResolversParentTypes['PurchasingGroupMember']> = ResolversObject<{
  displayName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  personId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  username?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type PurchasingInvoiceResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingInvoice'] = ResolversParentTypes['PurchasingInvoice']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  balance?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dueDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  invoiceDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isDisputed?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  lines?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchasingInvoiceLine']>>>, ParentType, ContextType>;
  notes?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  number?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  order?: Resolver<Types.Maybe<ResolversTypes['PurchasingOrder']>, ParentType, ContextType>;
  orderId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  paidAmount?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  status?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subtotal?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  taxTotal?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  total?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  vendor?: Resolver<Types.Maybe<ResolversTypes['PurchasingVendor']>, ParentType, ContextType>;
  vendorId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  vendorInvoiceNo?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  voidedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  voidedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type PurchasingInvoiceLineResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingInvoiceLine'] = ResolversParentTypes['PurchasingInvoiceLine']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  catalogItemId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  orderLineId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  quantity?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  taxRate?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  unit?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  unitPrice?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
}>;

export type PurchasingKarkunTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingKarkunType'] = ResolversParentTypes['PurchasingKarkunType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cnicNumber?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber1?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageThumbnailUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  parentName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type PurchasingLedgerEntryResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingLedgerEntry'] = ResolversParentTypes['PurchasingLedgerEntry']> = ResolversObject<{
  amount?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  balance?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  date?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  documentId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  number?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  reference?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type PurchasingMonthlySpendingResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingMonthlySpending'] = ResolversParentTypes['PurchasingMonthlySpending']> = ResolversObject<{
  invoiceCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  month?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  total?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
}>;

export type PurchasingOpenOrderResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingOpenOrder'] = ResolversParentTypes['PurchasingOpenOrder']> = ResolversObject<{
  expectedDeliveryDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isOverdue?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  number?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  orderDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  orderId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  outstandingValue?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  status?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  total?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  vendor?: Resolver<Types.Maybe<ResolversTypes['PurchasingVendor']>, ParentType, ContextType>;
  vendorId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type PurchasingOrderResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingOrder'] = ResolversParentTypes['PurchasingOrder']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  approvedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  approvedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cancelledAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cancelledBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  closedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  closedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deliveryAddress?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  discount?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  expectedDeliveryDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lines?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchasingOrderLine']>>>, ParentType, ContextType>;
  notes?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  number?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  orderDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  paymentTermsDays?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  quoteId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  rejectionReason?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  requisitionId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sentAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sentBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  shipping?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  status?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  submittedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  submittedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subtotal?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  taxTotal?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  total?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  vendor?: Resolver<Types.Maybe<ResolversTypes['PurchasingVendor']>, ParentType, ContextType>;
  vendorId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  version?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PurchasingOrderLineResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingOrderLine'] = ResolversParentTypes['PurchasingOrderLine']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  catalogItemId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  invoicedQuantity?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  quantity?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  receivedQuantity?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  taxRate?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  unit?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  unitPrice?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
}>;

export type PurchasingPayablesAgingRowResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingPayablesAgingRow'] = ResolversParentTypes['PurchasingPayablesAgingRow']> = ResolversObject<{
  current?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  days1To30?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  days31To60?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  days61Plus?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  total?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  vendor?: Resolver<Types.Maybe<ResolversTypes['PurchasingVendor']>, ParentType, ContextType>;
  vendorId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type PurchasingPaymentResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingPayment'] = ResolversParentTypes['PurchasingPayment']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  allocations?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchasingPaymentAllocation']>>>, ParentType, ContextType>;
  amount?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  method?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  notes?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  number?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  paymentDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  reference?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  vendor?: Resolver<Types.Maybe<ResolversTypes['PurchasingVendor']>, ParentType, ContextType>;
  vendorId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  voidReason?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  voidedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  voidedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type PurchasingPaymentAllocationResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingPaymentAllocation'] = ResolversParentTypes['PurchasingPaymentAllocation']> = ResolversObject<{
  amount?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  invoice?: Resolver<Types.Maybe<ResolversTypes['PurchasingInvoice']>, ParentType, ContextType>;
  invoiceId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type PurchasingPermissionAssignmentResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingPermissionAssignment'] = ResolversParentTypes['PurchasingPermissionAssignment']> = ResolversObject<{
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  groups?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchasingPermissionGroupHolder']>>>, ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  users?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchasingPermissionHolder']>>>, ParentType, ContextType>;
}>;

export type PurchasingPermissionGroupResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingPermissionGroup'] = ResolversParentTypes['PurchasingPermissionGroup']> = ResolversObject<{
  featureKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  featureName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  permissions?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchasingPermissionAssignment']>>>, ParentType, ContextType>;
}>;

export type PurchasingPermissionGroupHolderResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingPermissionGroupHolder'] = ResolversParentTypes['PurchasingPermissionGroupHolder']> = ResolversObject<{
  groupId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type PurchasingPermissionHolderResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingPermissionHolder'] = ResolversParentTypes['PurchasingPermissionHolder']> = ResolversObject<{
  displayName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  personId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  username?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type PurchasingQuoteResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingQuote'] = ResolversParentTypes['PurchasingQuote']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lines?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchasingQuoteLine']>>>, ParentType, ContextType>;
  notes?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  quoteDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  reference?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  requisitionId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  total?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  validUntil?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  vendor?: Resolver<Types.Maybe<ResolversTypes['PurchasingVendor']>, ParentType, ContextType>;
  vendorId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  version?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PurchasingQuoteLineResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingQuoteLine'] = ResolversParentTypes['PurchasingQuoteLine']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  catalogItemId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  quantity?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  unit?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  unitPrice?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
}>;

export type PurchasingReceiptResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingReceipt'] = ResolversParentTypes['PurchasingReceipt']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deliveryNoteNo?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lines?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchasingReceiptLine']>>>, ParentType, ContextType>;
  notes?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  number?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  order?: Resolver<Types.Maybe<ResolversTypes['PurchasingOrder']>, ParentType, ContextType>;
  orderId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  receivedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  receivedByPerson?: Resolver<Types.Maybe<ResolversTypes['PersonBasicType']>, ParentType, ContextType>;
  receivedDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  vendor?: Resolver<Types.Maybe<ResolversTypes['PurchasingVendor']>, ParentType, ContextType>;
  vendorId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  voidReason?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  voidedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  voidedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type PurchasingReceiptLineResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingReceiptLine'] = ResolversParentTypes['PurchasingReceiptLine']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  orderLineId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  receivedQuantity?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  rejectedQuantity?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  remarks?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  unit?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type PurchasingRequisitionResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingRequisition'] = ResolversParentTypes['PurchasingRequisition']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  approvedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  approvedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cancelledAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cancelledBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  estimatedTotal?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lines?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchasingRequisitionLine']>>>, ParentType, ContextType>;
  neededBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  number?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  purpose?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  rejectedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  rejectedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  rejectionReason?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  requestedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  requestedByPerson?: Resolver<Types.Maybe<ResolversTypes['PersonBasicType']>, ParentType, ContextType>;
  status?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  submittedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  submittedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  version?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PurchasingRequisitionLineResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingRequisitionLine'] = ResolversParentTypes['PurchasingRequisitionLine']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  catalogItemId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  estimatedUnitPrice?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  quantity?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  unit?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type PurchasingUserGroupResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingUserGroup'] = ResolversParentTypes['PurchasingUserGroup']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  users?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchasingGroupMember']>>>, ParentType, ContextType>;
}>;

export type PurchasingVendorResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingVendor'] = ResolversParentTypes['PurchasingVendor']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  address?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  bankAccountNumber?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  bankAccountTitle?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  bankName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactPerson?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isActive?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  notes?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  paymentTermsDays?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  phone?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  taxId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type PurchasingVendorLedgerResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingVendorLedger'] = ResolversParentTypes['PurchasingVendorLedger']> = ResolversObject<{
  closingBalance?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  entries?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchasingLedgerEntry']>>>, ParentType, ContextType>;
  openingBalance?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
}>;

export type PurchasingVendorSpendingResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchasingVendorSpending'] = ResolversParentTypes['PurchasingVendorSpending']> = ResolversObject<{
  invoiceCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  paidAmount?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  total?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  vendor?: Resolver<Types.Maybe<ResolversTypes['PurchasingVendor']>, ParentType, ContextType>;
  vendorId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  allAccessiblePhysicalStores?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PhysicalStore']>>>, ParentType, ContextType>;
  allCities?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['CityType']>>>, ParentType, ContextType>;
  allCityMehfils?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['CityMehfilType']>>>, ParentType, ContextType>;
  allCommitteeFeatures?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['CommitteeFeatureType']>>>, ParentType, ContextType>;
  allDutyLocations?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DutyLocationType']>>>, ParentType, ContextType>;
  allDutyShifts?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DutyShiftType']>>>, ParentType, ContextType>;
  allJobDefinitions?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['JobDefinitionType']>>>, ParentType, ContextType>;
  allJobs?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['JobType']>>>, ParentType, ContextType>;
  allMSDuties?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DutyType']>>>, ParentType, ContextType>;
  allMehfilDuties?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['MehfilDutyType']>>>, ParentType, ContextType>;
  allMehfils?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['MehfilType']>>>, ParentType, ContextType>;
  allOrgLocations?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['OrgLocationType']>>>, ParentType, ContextType>;
  allPeopleTags?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PeopleTagType']>>>, ParentType, ContextType>;
  allSecurityMehfilDuties?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['MehfilDutyType']>>>, ParentType, ContextType, Partial<Types.QueryAllSecurityMehfilDutiesArgs>>;
  allSecurityMehfilLangarDishes?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['MehfilLangarDishType']>>>, ParentType, ContextType>;
  allSecurityMehfilLangarLocations?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['MehfilLangarLocationType']>>>, ParentType, ContextType>;
  allSecurityServerChannels?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['SecurityServerChannelType']>>>, ParentType, ContextType, Partial<Types.QueryAllSecurityServerChannelsArgs>>;
  allTeams?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['TeamType']>>>, ParentType, ContextType>;
  cityById?: Resolver<Types.Maybe<ResolversTypes['CityType']>, ParentType, ContextType, RequireFields<Types.QueryCityByIdArgs, '_id'>>;
  cityMehfilsByCityId?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['CityMehfilType']>>>, ParentType, ContextType, RequireFields<Types.QueryCityMehfilsByCityIdArgs, 'cityId'>>;
  committeeById?: Resolver<Types.Maybe<ResolversTypes['CommitteeType']>, ParentType, ContextType, RequireFields<Types.QueryCommitteeByIdArgs, 'id'>>;
  committeeMembers?: Resolver<Types.Maybe<ResolversTypes['CommitteeMembersPageType']>, ParentType, ContextType, RequireFields<Types.QueryCommitteeMembersArgs, 'committeeId' | 'pageIndex' | 'pageSize' | 'roles'>>;
  committeesByLocationId?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['CommitteeType']>>>, ParentType, ContextType, RequireFields<Types.QueryCommitteesByLocationIdArgs, 'locationId'>>;
  currentUser?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType>;
  deletedPersonById?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.QueryDeletedPersonByIdArgs, '_id'>>;
  deletedPersonRelationCounts?: Resolver<Types.Maybe<Array<ResolversTypes['PersonRelationCounts']>>, ParentType, ContextType, RequireFields<Types.QueryDeletedPersonRelationCountsArgs, 'ids'>>;
  distinctCities?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  distinctCountries?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  distinctRegions?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  distinctStayAllowedBy?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  duplicateCnics?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DuplicatePersonGroupType']>>>, ParentType, ContextType>;
  duplicatePersonById?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.QueryDuplicatePersonByIdArgs, '_id'>>;
  duplicatePersonRelationCounts?: Resolver<Types.Maybe<Array<ResolversTypes['PersonRelationCounts']>>, ParentType, ContextType, RequireFields<Types.QueryDuplicatePersonRelationCountsArgs, 'ids'>>;
  duplicatePhoneNumbers?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DuplicatePersonGroupType']>>>, ParentType, ContextType>;
  dutyAttendanceCards?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DutyAttendanceCardType']>>>, ParentType, ContextType, RequireFields<Types.QueryDutyAttendanceCardsArgs, 'dutyId' | 'karkunIds' | 'month'>>;
  dutyAttendanceSheet?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DutyAttendanceSheetRowType']>>>, ParentType, ContextType, RequireFields<Types.QueryDutyAttendanceSheetArgs, 'dutyId' | 'month'>>;
  dutyPlanDays?: Resolver<Types.Maybe<ResolversTypes['DutyPlanDaysType']>, ParentType, ContextType, RequireFields<Types.QueryDutyPlanDaysArgs, 'dutyId' | 'locationId' | 'startDate'>>;
  dutyPlanWeek?: Resolver<Types.Maybe<ResolversTypes['DutyPlanWeekType']>, ParentType, ContextType, RequireFields<Types.QueryDutyPlanWeekArgs, 'dutyId' | 'locationId'>>;
  hrCommitteeOptions?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['CommitteeType']>>>, ParentType, ContextType>;
  hrKarkunById?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.QueryHrKarkunByIdArgs, '_id'>>;
  hrKarkunsById?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PersonType']>>>, ParentType, ContextType, RequireFields<Types.QueryHrKarkunsByIdArgs, '_ids'>>;
  hrPermissionAssignments?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['HrPermissionGroup']>>>, ParentType, ContextType>;
  hrPermissionKarkunSearch?: Resolver<Types.Maybe<ResolversTypes['PagedHrPermissionKarkunType']>, ParentType, ContextType, Partial<Types.QueryHrPermissionKarkunSearchArgs>>;
  hrUserGroups?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['HrUserGroup']>>>, ParentType, ContextType>;
  inboxConversation?: Resolver<Types.Maybe<ResolversTypes['InboxConversationDetailType']>, ParentType, ContextType, RequireFields<Types.QueryInboxConversationArgs, 'roomId'>>;
  isJobProcessorActive?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  issuanceFormById?: Resolver<Types.Maybe<ResolversTypes['IssuanceForm']>, ParentType, ContextType, RequireFields<Types.QueryIssuanceFormByIdArgs, '_id' | 'physicalStoreId'>>;
  issuanceFormsByMonth?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['IssuanceForm']>>>, ParentType, ContextType, RequireFields<Types.QueryIssuanceFormsByMonthArgs, 'month' | 'physicalStoreId'>>;
  issuanceFormsByStockItem?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['IssuanceForm']>>>, ParentType, ContextType, RequireFields<Types.QueryIssuanceFormsByStockItemArgs, 'physicalStoreId' | 'stockItemId'>>;
  itemCategoriesByPhysicalStoreId?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['ItemCategory']>>>, ParentType, ContextType, RequireFields<Types.QueryItemCategoriesByPhysicalStoreIdArgs, 'physicalStoreId'>>;
  itemCategoryById?: Resolver<Types.Maybe<ResolversTypes['ItemCategory']>, ParentType, ContextType, RequireFields<Types.QueryItemCategoryByIdArgs, '_id' | 'physicalStoreId'>>;
  jobById?: Resolver<Types.Maybe<ResolversTypes['JobType']>, ParentType, ContextType, RequireFields<Types.QueryJobByIdArgs, 'id'>>;
  karkunDutyAttendanceSheet?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DutyAttendanceSheetRowType']>>>, ParentType, ContextType, RequireFields<Types.QueryKarkunDutyAttendanceSheetArgs, 'karkunId'>>;
  locationById?: Resolver<Types.Maybe<ResolversTypes['Location']>, ParentType, ContextType, RequireFields<Types.QueryLocationByIdArgs, '_id' | 'physicalStoreId'>>;
  locationsByPhysicalStoreId?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['Location']>>>, ParentType, ContextType, RequireFields<Types.QueryLocationsByPhysicalStoreIdArgs, 'physicalStoreId'>>;
  mehfilById?: Resolver<Types.Maybe<ResolversTypes['MehfilType']>, ParentType, ContextType, RequireFields<Types.QueryMehfilByIdArgs, '_id'>>;
  mehfilKarkunByBarcodeId?: Resolver<Types.Maybe<ResolversTypes['MehfilKarkunType']>, ParentType, ContextType, RequireFields<Types.QueryMehfilKarkunByBarcodeIdArgs, 'barcode'>>;
  mehfilKarkunsByIds?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['MehfilKarkunType']>>>, ParentType, ContextType, RequireFields<Types.QueryMehfilKarkunsByIdsArgs, 'ids'>>;
  mehfilKarkunsByMehfilId?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['MehfilKarkunType']>>>, ParentType, ContextType, RequireFields<Types.QueryMehfilKarkunsByMehfilIdArgs, 'mehfilId'>>;
  myCommitteeLocations?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceLocationType']>>>, ParentType, ContextType>;
  myCommittees?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceCommitteeType']>>>, ParentType, ContextType>;
  myDuties?: Resolver<Array<Types.Maybe<ResolversTypes['DaMyDutyType']>>, ParentType, ContextType, RequireFields<Types.QueryMyDutiesArgs, 'date'>>;
  myDutiesAttendanceLocations?: Resolver<Array<Types.Maybe<ResolversTypes['DaMyLocationType']>>, ParentType, ContextType>;
  myMehfilDetailsLocations?: Resolver<Array<Types.Maybe<ResolversTypes['MyMehfilDetailsLocationType']>>, ParentType, ContextType>;
  myMehfilKarkunsLocations?: Resolver<Array<Types.Maybe<ResolversTypes['MyMehfilKarkunsLocationType']>>, ParentType, ContextType>;
  myMehfilPermissionsLocations?: Resolver<Array<Types.Maybe<ResolversTypes['MyMehfilPermissionsLocationType']>>, ParentType, ContextType>;
  myNotificationCounts?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['NotificationCountType']>>>, ParentType, ContextType>;
  myNotifications?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['NotificationType']>>>, ParentType, ContextType, Partial<Types.QueryMyNotificationsArgs>>;
  myTrustedDevices?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['TrustedDeviceType']>>>, ParentType, ContextType>;
  orgLocationById?: Resolver<Types.Maybe<ResolversTypes['OrgLocationType']>, ParentType, ContextType, RequireFields<Types.QueryOrgLocationByIdArgs, '_id'>>;
  orgLocationFeaturePermissions?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['OrgLocationFeaturePermissionsType']>>>, ParentType, ContextType, RequireFields<Types.QueryOrgLocationFeaturePermissionsArgs, 'locationId'>>;
  pagedCities?: Resolver<Types.Maybe<ResolversTypes['PagedCityType']>, ParentType, ContextType, Partial<Types.QueryPagedCitiesArgs>>;
  pagedDeletedPeople?: Resolver<Types.Maybe<ResolversTypes['PagedPeopleType']>, ParentType, ContextType, Partial<Types.QueryPagedDeletedPeopleArgs>>;
  pagedFreeFormCities?: Resolver<Types.Maybe<ResolversTypes['PagedFreeFormCity']>, ParentType, ContextType, RequireFields<Types.QueryPagedFreeFormCitiesArgs, 'pageIndex' | 'pageSize'>>;
  pagedFreeFormCountries?: Resolver<Types.Maybe<ResolversTypes['PagedFreeFormValue']>, ParentType, ContextType, RequireFields<Types.QueryPagedFreeFormCountriesArgs, 'pageIndex' | 'pageSize'>>;
  pagedHrAuditLogs?: Resolver<Types.Maybe<ResolversTypes['PagedAuditLogType']>, ParentType, ContextType, Partial<Types.QueryPagedHrAuditLogsArgs>>;
  pagedHrKarkuns?: Resolver<Types.Maybe<ResolversTypes['PagedKarkunType']>, ParentType, ContextType, Partial<Types.QueryPagedHrKarkunsArgs>>;
  pagedInboxConversations?: Resolver<Types.Maybe<ResolversTypes['PagedInboxConversationType']>, ParentType, ContextType, Partial<Types.QueryPagedInboxConversationsArgs>>;
  pagedIssuanceForms?: Resolver<Types.Maybe<ResolversTypes['PagedIssuanceForm']>, ParentType, ContextType, RequireFields<Types.QueryPagedIssuanceFormsArgs, 'physicalStoreId'>>;
  pagedJobLogs?: Resolver<Types.Maybe<ResolversTypes['PagedJobLogsType']>, ParentType, ContextType, Partial<Types.QueryPagedJobLogsArgs>>;
  pagedLinkableUsers?: Resolver<Types.Maybe<ResolversTypes['PagedUserType']>, ParentType, ContextType, Partial<Types.QueryPagedLinkableUsersArgs>>;
  pagedMehfilKarkuns?: Resolver<ResolversTypes['PagedMehfilLocationKarkunType'], ParentType, ContextType, RequireFields<Types.QueryPagedMehfilKarkunsArgs, 'locationId'>>;
  pagedOrgLocationKarkuns?: Resolver<ResolversTypes['PagedOrgLocationKarkunType'], ParentType, ContextType, RequireFields<Types.QueryPagedOrgLocationKarkunsArgs, 'locationId'>>;
  pagedOrgLocationUsers?: Resolver<Types.Maybe<ResolversTypes['PagedUserType']>, ParentType, ContextType, RequireFields<Types.QueryPagedOrgLocationUsersArgs, 'locationId'>>;
  pagedPurchaseForms?: Resolver<Types.Maybe<ResolversTypes['PagedPurchaseForm']>, ParentType, ContextType, RequireFields<Types.QueryPagedPurchaseFormsArgs, 'physicalStoreId'>>;
  pagedPurchasingAuditLogs?: Resolver<Types.Maybe<ResolversTypes['PagedAuditLogType']>, ParentType, ContextType, Partial<Types.QueryPagedPurchasingAuditLogsArgs>>;
  pagedPurchasingCatalogItems?: Resolver<Types.Maybe<ResolversTypes['PagedPurchasingCatalogItems']>, ParentType, ContextType, Partial<Types.QueryPagedPurchasingCatalogItemsArgs>>;
  pagedPurchasingInvoices?: Resolver<Types.Maybe<ResolversTypes['PagedPurchasingInvoices']>, ParentType, ContextType, Partial<Types.QueryPagedPurchasingInvoicesArgs>>;
  pagedPurchasingOrders?: Resolver<Types.Maybe<ResolversTypes['PagedPurchasingOrders']>, ParentType, ContextType, Partial<Types.QueryPagedPurchasingOrdersArgs>>;
  pagedPurchasingPayments?: Resolver<Types.Maybe<ResolversTypes['PagedPurchasingPayments']>, ParentType, ContextType, Partial<Types.QueryPagedPurchasingPaymentsArgs>>;
  pagedPurchasingQuotes?: Resolver<Types.Maybe<ResolversTypes['PagedPurchasingQuotes']>, ParentType, ContextType, Partial<Types.QueryPagedPurchasingQuotesArgs>>;
  pagedPurchasingReceipts?: Resolver<Types.Maybe<ResolversTypes['PagedPurchasingReceipts']>, ParentType, ContextType, Partial<Types.QueryPagedPurchasingReceiptsArgs>>;
  pagedPurchasingRequisitions?: Resolver<Types.Maybe<ResolversTypes['PagedPurchasingRequisitions']>, ParentType, ContextType, Partial<Types.QueryPagedPurchasingRequisitionsArgs>>;
  pagedPurchasingVendors?: Resolver<Types.Maybe<ResolversTypes['PagedPurchasingVendors']>, ParentType, ContextType, Partial<Types.QueryPagedPurchasingVendorsArgs>>;
  pagedSalariesByKarkun?: Resolver<Types.Maybe<ResolversTypes['PagedSalaryType']>, ParentType, ContextType, Partial<Types.QueryPagedSalariesByKarkunArgs>>;
  pagedScheduledJobs?: Resolver<Types.Maybe<ResolversTypes['PagedScheduledJobsType']>, ParentType, ContextType, Partial<Types.QueryPagedScheduledJobsArgs>>;
  pagedSecurityAuditLogs?: Resolver<Types.Maybe<ResolversTypes['PagedAuditLogType']>, ParentType, ContextType, Partial<Types.QueryPagedSecurityAuditLogsArgs>>;
  pagedSecurityLogs?: Resolver<Types.Maybe<ResolversTypes['PagedSecurityLogType']>, ParentType, ContextType, Partial<Types.QueryPagedSecurityLogsArgs>>;
  pagedSecurityPeople?: Resolver<Types.Maybe<ResolversTypes['PagedPeopleType']>, ParentType, ContextType, Partial<Types.QueryPagedSecurityPeopleArgs>>;
  pagedSecurityServerAlertGroups?: Resolver<Types.Maybe<ResolversTypes['PagedSecurityServerAlertGroupType']>, ParentType, ContextType, Partial<Types.QueryPagedSecurityServerAlertGroupsArgs>>;
  pagedSecurityServerAlerts?: Resolver<Types.Maybe<ResolversTypes['PagedSecurityServerAlertType']>, ParentType, ContextType, Partial<Types.QueryPagedSecurityServerAlertsArgs>>;
  pagedSecurityServerProfiles?: Resolver<Types.Maybe<ResolversTypes['PagedSecurityServerProfileType']>, ParentType, ContextType, Partial<Types.QueryPagedSecurityServerProfilesArgs>>;
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
  purchasingAttachmentDownload?: Resolver<Types.Maybe<ResolversTypes['PurchasingAttachmentDownload']>, ParentType, ContextType, RequireFields<Types.QueryPurchasingAttachmentDownloadArgs, '_id'>>;
  purchasingAttachments?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchasingAttachment']>>>, ParentType, ContextType, RequireFields<Types.QueryPurchasingAttachmentsArgs, 'ownerId' | 'ownerType'>>;
  purchasingCatalogItemById?: Resolver<Types.Maybe<ResolversTypes['PurchasingCatalogItem']>, ParentType, ContextType, RequireFields<Types.QueryPurchasingCatalogItemByIdArgs, '_id'>>;
  purchasingDashboard?: Resolver<Types.Maybe<ResolversTypes['PurchasingDashboard']>, ParentType, ContextType>;
  purchasingInvoiceById?: Resolver<Types.Maybe<ResolversTypes['PurchasingInvoice']>, ParentType, ContextType, RequireFields<Types.QueryPurchasingInvoiceByIdArgs, '_id'>>;
  purchasingKarkunSearch?: Resolver<Types.Maybe<ResolversTypes['PagedPurchasingKarkunType']>, ParentType, ContextType, Partial<Types.QueryPurchasingKarkunSearchArgs>>;
  purchasingOpenOrders?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchasingOpenOrder']>>>, ParentType, ContextType>;
  purchasingOrderById?: Resolver<Types.Maybe<ResolversTypes['PurchasingOrder']>, ParentType, ContextType, RequireFields<Types.QueryPurchasingOrderByIdArgs, '_id'>>;
  purchasingPayablesAging?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchasingPayablesAgingRow']>>>, ParentType, ContextType>;
  purchasingPaymentById?: Resolver<Types.Maybe<ResolversTypes['PurchasingPayment']>, ParentType, ContextType, RequireFields<Types.QueryPurchasingPaymentByIdArgs, '_id'>>;
  purchasingPermissionAssignments?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchasingPermissionGroup']>>>, ParentType, ContextType>;
  purchasingQuoteById?: Resolver<Types.Maybe<ResolversTypes['PurchasingQuote']>, ParentType, ContextType, RequireFields<Types.QueryPurchasingQuoteByIdArgs, '_id'>>;
  purchasingReceiptById?: Resolver<Types.Maybe<ResolversTypes['PurchasingReceipt']>, ParentType, ContextType, RequireFields<Types.QueryPurchasingReceiptByIdArgs, '_id'>>;
  purchasingRequisitionById?: Resolver<Types.Maybe<ResolversTypes['PurchasingRequisition']>, ParentType, ContextType, RequireFields<Types.QueryPurchasingRequisitionByIdArgs, '_id'>>;
  purchasingSpendingByMonth?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchasingMonthlySpending']>>>, ParentType, ContextType, Partial<Types.QueryPurchasingSpendingByMonthArgs>>;
  purchasingSpendingByVendor?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchasingVendorSpending']>>>, ParentType, ContextType, Partial<Types.QueryPurchasingSpendingByVendorArgs>>;
  purchasingUserGroups?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchasingUserGroup']>>>, ParentType, ContextType>;
  purchasingVendorById?: Resolver<Types.Maybe<ResolversTypes['PurchasingVendor']>, ParentType, ContextType, RequireFields<Types.QueryPurchasingVendorByIdArgs, '_id'>>;
  purchasingVendorLedger?: Resolver<Types.Maybe<ResolversTypes['PurchasingVendorLedger']>, ParentType, ContextType, RequireFields<Types.QueryPurchasingVendorLedgerArgs, 'vendorId'>>;
  referenceCityMehfilLocations?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['ReferenceOrgLocationType']>>>, ParentType, ContextType>;
  referenceDutyShifts?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['ReferenceDutyShiftType']>>>, ParentType, ContextType>;
  referenceMsDuties?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['ReferenceDutyType']>>>, ParentType, ContextType>;
  referencePhysicalStoreById?: Resolver<Types.Maybe<ResolversTypes['ReferencePhysicalStoreType']>, ParentType, ContextType, RequireFields<Types.QueryReferencePhysicalStoreByIdArgs, 'id'>>;
  referencePhysicalStores?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['ReferencePhysicalStoreType']>>>, ParentType, ContextType>;
  salariesByIds?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['SalaryType']>>>, ParentType, ContextType, RequireFields<Types.QuerySalariesByIdsArgs, 'ids'>>;
  salariesByMonth?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['SalaryType']>>>, ParentType, ContextType, RequireFields<Types.QuerySalariesByMonthArgs, 'month'>>;
  securityFaceVectorFromImage?: Resolver<Types.Maybe<ResolversTypes['FaceVectorResultType']>, ParentType, ContextType, RequireFields<Types.QuerySecurityFaceVectorFromImageArgs, 'imageData'>>;
  securityLogUsers?: Resolver<Array<ResolversTypes['SecurityLogUserOption']>, ParentType, ContextType, Partial<Types.QuerySecurityLogUsersArgs>>;
  securityMehfilDutyById?: Resolver<Types.Maybe<ResolversTypes['MehfilDutyType']>, ParentType, ContextType, RequireFields<Types.QuerySecurityMehfilDutyByIdArgs, 'id'>>;
  securityMehfilLangarDishById?: Resolver<Types.Maybe<ResolversTypes['MehfilLangarDishType']>, ParentType, ContextType, RequireFields<Types.QuerySecurityMehfilLangarDishByIdArgs, 'id'>>;
  securityMehfilLangarLocationById?: Resolver<Types.Maybe<ResolversTypes['MehfilLangarLocationType']>, ParentType, ContextType, RequireFields<Types.QuerySecurityMehfilLangarLocationByIdArgs, 'id'>>;
  securityPermissionAssignments?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['SecurityPermissionGroup']>>>, ParentType, ContextType>;
  securityPermissionKarkunSearch?: Resolver<Types.Maybe<ResolversTypes['PagedSecurityPermissionKarkunType']>, ParentType, ContextType, Partial<Types.QuerySecurityPermissionKarkunSearchArgs>>;
  securityServerAlertById?: Resolver<Types.Maybe<ResolversTypes['SecurityServerAlertType']>, ParentType, ContextType, RequireFields<Types.QuerySecurityServerAlertByIdArgs, '_id'>>;
  securityServerAlertSyncStatus?: Resolver<Types.Maybe<ResolversTypes['SecurityServerAlertSyncStatusType']>, ParentType, ContextType>;
  securityServerChannelById?: Resolver<Types.Maybe<ResolversTypes['SecurityServerChannelType']>, ParentType, ContextType, RequireFields<Types.QuerySecurityServerChannelByIdArgs, '_id'>>;
  securityServerProfileById?: Resolver<Types.Maybe<ResolversTypes['SecurityServerProfileType']>, ParentType, ContextType, RequireFields<Types.QuerySecurityServerProfileByIdArgs, '_id'>>;
  securityServerUsageStats?: Resolver<Types.Maybe<ResolversTypes['SecurityServerUsageSummaryType']>, ParentType, ContextType, RequireFields<Types.QuerySecurityServerUsageStatsArgs, 'minutes'>>;
  securityUserGroups?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['SecurityUserGroup']>>>, ParentType, ContextType>;
  securityVisitorByCnic?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.QuerySecurityVisitorByCnicArgs, 'cnicNumbers'>>;
  securityVisitorById?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.QuerySecurityVisitorByIdArgs, '_id'>>;
  securityVisitorsByFaceVector?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['VisitorFaceMatchType']>>>, ParentType, ContextType, RequireFields<Types.QuerySecurityVisitorsByFaceVectorArgs, 'vector'>>;
  stockAdjustmentById?: Resolver<Types.Maybe<ResolversTypes['StockAdjustment']>, ParentType, ContextType, RequireFields<Types.QueryStockAdjustmentByIdArgs, '_id' | 'physicalStoreId'>>;
  stockAdjustmentsByStockItem?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['StockAdjustment']>>>, ParentType, ContextType, RequireFields<Types.QueryStockAdjustmentsByStockItemArgs, 'physicalStoreId' | 'stockItemId'>>;
  stockItemById?: Resolver<Types.Maybe<ResolversTypes['StockItem']>, ParentType, ContextType, RequireFields<Types.QueryStockItemByIdArgs, '_id' | 'physicalStoreId'>>;
  stockItemsById?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['StockItem']>>>, ParentType, ContextType, RequireFields<Types.QueryStockItemsByIdArgs, '_ids' | 'physicalStoreId'>>;
  userAccountAvailability?: Resolver<ResolversTypes['UserAccountAvailabilityType'], ParentType, ContextType, Partial<Types.QueryUserAccountAvailabilityArgs>>;
  userById?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, Partial<Types.QueryUserByIdArgs>>;
  userGroupById?: Resolver<Types.Maybe<ResolversTypes['UserGroupType']>, ParentType, ContextType, RequireFields<Types.QueryUserGroupByIdArgs, '_id'>>;
  userNames?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType, Partial<Types.QueryUserNamesArgs>>;
  userTrustedDevices?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['TrustedDeviceType']>>>, ParentType, ContextType, RequireFields<Types.QueryUserTrustedDevicesArgs, 'userId'>>;
  vendorById?: Resolver<Types.Maybe<ResolversTypes['Vendor']>, ParentType, ContextType, RequireFields<Types.QueryVendorByIdArgs, '_id' | 'physicalStoreId'>>;
  vendorsByPhysicalStoreId?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['Vendor']>>>, ParentType, ContextType, RequireFields<Types.QueryVendorsByPhysicalStoreIdArgs, 'physicalStoreId'>>;
  visitorStayById?: Resolver<Types.Maybe<ResolversTypes['VisitorStayType']>, ParentType, ContextType, RequireFields<Types.QueryVisitorStayByIdArgs, '_id'>>;
  workspaceCommitteeById?: Resolver<Types.Maybe<ResolversTypes['WorkspaceCommitteeType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceCommitteeByIdArgs, 'committeeId'>>;
  workspaceCommitteeKarkunSearch?: Resolver<Types.Maybe<ResolversTypes['PagedWorkspaceKarkunType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceCommitteeKarkunSearchArgs, 'committeeId'>>;
  workspaceDaAccess?: Resolver<Types.Maybe<ResolversTypes['DaAccessType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDaAccessArgs, 'locationId'>>;
  workspaceDaAttendanceSheet?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DaAttendanceSheetRowType']>>>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDaAttendanceSheetArgs, 'locationId' | 'month'>>;
  workspaceDaDuties?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DaDutyType']>>>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDaDutiesArgs, 'locationId'>>;
  workspaceDaDutyById?: Resolver<Types.Maybe<ResolversTypes['DaDutyType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDaDutyByIdArgs, 'dutyId' | 'locationId'>>;
  workspaceDaKarkunSearch?: Resolver<Types.Maybe<ResolversTypes['PagedWorkspaceKarkunType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDaKarkunSearchArgs, 'locationId'>>;
  workspaceDaMehfilDuties?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DaMehfilDutyType']>>>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDaMehfilDutiesArgs, 'locationId'>>;
  workspaceDaPlanDays?: Resolver<Types.Maybe<ResolversTypes['DaPlanDaysType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDaPlanDaysArgs, 'dutyId' | 'locationId' | 'startDate'>>;
  workspaceDiscussionInfo?: Resolver<Types.Maybe<ResolversTypes['DiscussionInfoType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDiscussionInfoArgs, 'committeeId'>>;
  workspaceDiscussionMembers?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DiscussionMemberType']>>>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDiscussionMembersArgs, 'committeeId'>>;
  workspaceDiscussionOlderMessages?: Resolver<Types.Maybe<ResolversTypes['DiscussionMessagePageType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDiscussionOlderMessagesArgs, 'before' | 'committeeId'>>;
  workspaceDiscussionPinnedMessages?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DiscussionMessageType']>>>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDiscussionPinnedMessagesArgs, 'committeeId'>>;
  workspaceDiscussionSearchMessages?: Resolver<Types.Maybe<ResolversTypes['DiscussionMessagePageType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDiscussionSearchMessagesArgs, 'committeeId' | 'searchText'>>;
  workspaceDiscussionStarredMessages?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DiscussionMessageType']>>>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDiscussionStarredMessagesArgs, 'committeeId'>>;
  workspaceDiscussionSync?: Resolver<Types.Maybe<ResolversTypes['DiscussionSyncType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDiscussionSyncArgs, 'committeeId'>>;
  workspaceDiscussionThreadMessages?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DiscussionMessageType']>>>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDiscussionThreadMessagesArgs, 'committeeId' | 'threadId'>>;
  workspaceDiscussionVideoCallInfo?: Resolver<Types.Maybe<ResolversTypes['DiscussionVideoCallInfoType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDiscussionVideoCallInfoArgs, 'committeeId'>>;
  workspaceDocumentActivity?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceDocumentActivityType']>>>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDocumentActivityArgs, 'committeeId'>>;
  workspaceDocumentById?: Resolver<Types.Maybe<ResolversTypes['WorkspaceDocumentType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDocumentByIdArgs, 'committeeId' | 'documentId'>>;
  workspaceDocumentFolderContents?: Resolver<Types.Maybe<ResolversTypes['WorkspaceDocumentFolderContentsType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDocumentFolderContentsArgs, 'committeeId'>>;
  workspaceDocumentFolders?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceDocumentFolderType']>>>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDocumentFoldersArgs, 'committeeId'>>;
  workspaceDocumentSearch?: Resolver<Types.Maybe<ResolversTypes['PagedWorkspaceDocumentType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDocumentSearchArgs, 'committeeId' | 'text'>>;
  workspaceDocumentTrash?: Resolver<Types.Maybe<ResolversTypes['WorkspaceDocumentTrashType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDocumentTrashArgs, 'committeeId'>>;
  workspaceDocumentVersions?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceDocumentVersionType']>>>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDocumentVersionsArgs, 'committeeId' | 'documentId'>>;
  workspaceDocumentsInfo?: Resolver<Types.Maybe<ResolversTypes['WorkspaceDocumentsInfoType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDocumentsInfoArgs, 'committeeId'>>;
  workspaceMeetingActionItems?: Resolver<Types.Maybe<ResolversTypes['PagedWorkspaceMeetingActionItemType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceMeetingActionItemsArgs, 'committeeId'>>;
  workspaceMeetingActivity?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceMeetingActivityType']>>>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceMeetingActivityArgs, 'committeeId'>>;
  workspaceMeetingAttachments?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceMeetingAttachmentType']>>>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceMeetingAttachmentsArgs, 'committeeId' | 'meetingId'>>;
  workspaceMeetingById?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceMeetingByIdArgs, 'committeeId' | 'meetingId'>>;
  workspaceMeetingMembers?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceMeetingMemberType']>>>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceMeetingMembersArgs, 'committeeId'>>;
  workspaceMeetingVideoCallInfo?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingVideoCallInfoType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceMeetingVideoCallInfoArgs, 'committeeId' | 'meetingId'>>;
  workspaceMeetings?: Resolver<Types.Maybe<ResolversTypes['PagedWorkspaceMeetingType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceMeetingsArgs, 'committeeId'>>;
  workspaceMeetingsInfo?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingsInfoType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceMeetingsInfoArgs, 'committeeId'>>;
  workspaceMehfilDetails?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMehfilDetailsType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceMehfilDetailsArgs, 'locationId'>>;
  workspaceMehfilPermissions?: Resolver<Types.Maybe<ResolversTypes['MehfilPermissionsType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceMehfilPermissionsArgs, 'locationId'>>;
  workspaceMehfilPermissionsKarkunSearch?: Resolver<Types.Maybe<ResolversTypes['PagedMpKarkunType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceMehfilPermissionsKarkunSearchArgs, 'locationId'>>;
  workspaceMonitoringAlerts?: Resolver<Types.Maybe<ResolversTypes['PagedWorkspaceMonitoringAlertType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceMonitoringAlertsArgs, 'committeeId' | 'date'>>;
  workspaceMonitoringProfileById?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMonitoringProfileType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceMonitoringProfileByIdArgs, 'committeeId' | 'profileId'>>;
  workspaceMonitoringProfiles?: Resolver<Types.Maybe<ResolversTypes['PagedWorkspaceMonitoringProfileType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceMonitoringProfilesArgs, 'committeeId'>>;
  workspaceNightStayById?: Resolver<Types.Maybe<ResolversTypes['WorkspaceNightStayType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceNightStayByIdArgs, 'committeeId' | 'stayId'>>;
  workspaceNightStays?: Resolver<Types.Maybe<ResolversTypes['PagedWorkspaceNightStayType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceNightStaysArgs, 'committeeId' | 'stayDate'>>;
  workspacePollActivity?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspacePollActivityType']>>>, ParentType, ContextType, RequireFields<Types.QueryWorkspacePollActivityArgs, 'committeeId'>>;
  workspacePollById?: Resolver<Types.Maybe<ResolversTypes['WorkspacePollType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspacePollByIdArgs, 'committeeId' | 'pollId'>>;
  workspacePollResults?: Resolver<Types.Maybe<ResolversTypes['WorkspacePollResultsType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspacePollResultsArgs, 'committeeId' | 'pollId'>>;
  workspacePolls?: Resolver<Types.Maybe<ResolversTypes['PagedWorkspacePollType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspacePollsArgs, 'committeeId'>>;
  workspacePollsInfo?: Resolver<Types.Maybe<ResolversTypes['WorkspacePollsInfoType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspacePollsInfoArgs, 'committeeId'>>;
  workspaceProjectById?: Resolver<Types.Maybe<ResolversTypes['WorkspaceProjectType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceProjectByIdArgs, 'committeeId' | 'projectId'>>;
  workspaceProjectMembers?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceProjectMemberType']>>>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceProjectMembersArgs, 'committeeId'>>;
  workspaceProjects?: Resolver<Types.Maybe<ResolversTypes['PagedWorkspaceProjectType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceProjectsArgs, 'committeeId'>>;
  workspaceProjectsActivity?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceProjectsActivityType']>>>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceProjectsActivityArgs, 'committeeId'>>;
  workspaceProjectsInfo?: Resolver<Types.Maybe<ResolversTypes['WorkspaceProjectsInfoType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceProjectsInfoArgs, 'committeeId'>>;
  workspaceTaskById?: Resolver<Types.Maybe<ResolversTypes['WorkspaceTaskType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceTaskByIdArgs, 'committeeId' | 'taskId'>>;
  workspaceTaskComments?: Resolver<Types.Maybe<ResolversTypes['PagedWorkspaceTaskCommentType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceTaskCommentsArgs, 'committeeId' | 'taskId'>>;
  workspaceTasks?: Resolver<Types.Maybe<ResolversTypes['PagedWorkspaceTaskType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceTasksArgs, 'committeeId'>>;
}>;

export type ReferenceDutyShiftTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['ReferenceDutyShiftType'] = ResolversParentTypes['ReferenceDutyShiftType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dutyId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type ReferenceDutyTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['ReferenceDutyType'] = ResolversParentTypes['ReferenceDutyType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type ReferenceOrgLocationTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['ReferenceOrgLocationType'] = ResolversParentTypes['ReferenceOrgLocationType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  parentId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type ReferencePhysicalStoreTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['ReferencePhysicalStoreType'] = ResolversParentTypes['ReferencePhysicalStoreType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  address?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type SecurityGroupMemberResolvers<ContextType = any, ParentType extends ResolversParentTypes['SecurityGroupMember'] = ResolversParentTypes['SecurityGroupMember']> = ResolversObject<{
  displayName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  personId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  username?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type SecurityLogTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['SecurityLogType'] = ResolversParentTypes['SecurityLogType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dataSource?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dataSourceDetail?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operationBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operationByImageThumbnailUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operationByImageUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operationByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operationDetails?: Resolver<Types.Maybe<ResolversTypes['JSONObject']>, ParentType, ContextType>;
  operationTime?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operationType?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userImageThumbnailUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userImageUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type SecurityLogUserOptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['SecurityLogUserOption'] = ResolversParentTypes['SecurityLogUserOption']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type SecurityPermissionAssignmentResolvers<ContextType = any, ParentType extends ResolversParentTypes['SecurityPermissionAssignment'] = ResolversParentTypes['SecurityPermissionAssignment']> = ResolversObject<{
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  groups?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['SecurityPermissionGroupHolder']>>>, ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  users?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['SecurityPermissionHolder']>>>, ParentType, ContextType>;
}>;

export type SecurityPermissionGroupResolvers<ContextType = any, ParentType extends ResolversParentTypes['SecurityPermissionGroup'] = ResolversParentTypes['SecurityPermissionGroup']> = ResolversObject<{
  featureKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  featureName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  permissions?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['SecurityPermissionAssignment']>>>, ParentType, ContextType>;
}>;

export type SecurityPermissionGroupHolderResolvers<ContextType = any, ParentType extends ResolversParentTypes['SecurityPermissionGroupHolder'] = ResolversParentTypes['SecurityPermissionGroupHolder']> = ResolversObject<{
  groupId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type SecurityPermissionHolderResolvers<ContextType = any, ParentType extends ResolversParentTypes['SecurityPermissionHolder'] = ResolversParentTypes['SecurityPermissionHolder']> = ResolversObject<{
  displayName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  personId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  username?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type SecurityPermissionKarkunTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['SecurityPermissionKarkunType'] = ResolversParentTypes['SecurityPermissionKarkunType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cnicNumber?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber1?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageThumbnailUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  parentName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type SecurityServerAlertGroupTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['SecurityServerAlertGroupType'] = ResolversParentTypes['SecurityServerAlertGroupType']> = ResolversObject<{
  alertCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  firstTimestamp?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastTimestamp?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  latestImageUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  latestThumbnailUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  notReviewedCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  profileId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  profileIsTest?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  profileName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type SecurityServerAlertSyncStatusTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['SecurityServerAlertSyncStatusType'] = ResolversParentTypes['SecurityServerAlertSyncStatusType']> = ResolversObject<{
  lastSyncedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type SecurityServerAlertTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['SecurityServerAlertType'] = ResolversParentTypes['SecurityServerAlertType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  channelId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  channelName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  externalId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  faceQualityReasons?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  faceQualityScore?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  faceSizePx?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  imageUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  profileId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  profileIsTest?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  profileName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  review?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  reviewedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  similarityScore?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  thumbnailUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  timestamp?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type SecurityServerChannelConnectionTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['SecurityServerChannelConnectionType'] = ResolversParentTypes['SecurityServerChannelConnectionType']> = ResolversObject<{
  hasPassword?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  host?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  path?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  port?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  username?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type SecurityServerChannelTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['SecurityServerChannelType'] = ResolversParentTypes['SecurityServerChannelType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  alertsCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  connection?: Resolver<Types.Maybe<ResolversTypes['SecurityServerChannelConnectionType']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deletedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  enabled?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  minFaceQuality?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  minFaceSizePx?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  recognitionFps?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  similarityThreshold?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type SecurityServerProfileImageTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['SecurityServerProfileImageType'] = ResolversParentTypes['SecurityServerProfileImageType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  thumbnailUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uploadedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type SecurityServerProfileTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['SecurityServerProfileType'] = ResolversParentTypes['SecurityServerProfileType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  alertsCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  defaultImageId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deletedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  images?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['SecurityServerProfileImageType']>>>, ParentType, ContextType>;
  isTest?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type SecurityServerUsageChannelTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['SecurityServerUsageChannelType'] = ResolversParentTypes['SecurityServerUsageChannelType']> = ResolversObject<{
  busySkipPct?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  channelId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  faceSkipPct?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  faces?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  frameHeight?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  frameWidth?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  inferenceSharePct?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  processedFps?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  readFailures?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  readFps?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  recognitionFps?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  reconnects?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  skippedFaceQuality?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  skippedFaceSize?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type SecurityServerUsageServerTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['SecurityServerUsageServerType'] = ResolversParentTypes['SecurityServerUsageServerType']> = ResolversObject<{
  activeChannels?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  cpuAvgPct?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  cpuCores?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  dnnTarget?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  eventLoopLagMaxMs?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  eventLoopLagP95Ms?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  gpuMemTotalMb?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  gpuMemUsedMb?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  gpuUtilAvgPct?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  gpuUtilMaxPct?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  inferenceBusyAvgPct?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  inferenceBusyMaxPct?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  windowCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type SecurityServerUsageSummaryTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['SecurityServerUsageSummaryType'] = ResolversParentTypes['SecurityServerUsageSummaryType']> = ResolversObject<{
  channels?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['SecurityServerUsageChannelType']>>>, ParentType, ContextType>;
  coveredSeconds?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  lastBucketAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  minutes?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  server?: Resolver<Types.Maybe<ResolversTypes['SecurityServerUsageServerType']>, ParentType, ContextType>;
}>;

export type SecurityUserGroupResolvers<ContextType = any, ParentType extends ResolversParentTypes['SecurityUserGroup'] = ResolversParentTypes['SecurityUserGroup']> = ResolversObject<{
  _id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  users?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['SecurityGroupMember']>>>, ParentType, ContextType>;
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
  imageUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type SyncOrgLocationObserversResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['SyncOrgLocationObserversResult'] = ResolversParentTypes['SyncOrgLocationObserversResult']> = ResolversObject<{
  addedCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  committeesChecked?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  removedCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type TeamMemberTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['TeamMemberType'] = ResolversParentTypes['TeamMemberType']> = ResolversObject<{
  daysOfWeek?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  isCoordinator?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  karkun?: Resolver<Types.Maybe<ResolversTypes['PersonBasicType']>, ParentType, ContextType>;
  karkunId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type TeamTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['TeamType'] = ResolversParentTypes['TeamType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  color?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  duty?: Resolver<Types.Maybe<ResolversTypes['DutyType']>, ParentType, ContextType>;
  dutyId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  members?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['TeamMemberType']>>>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export interface TimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Time'], any> {
  name: 'Time';
}

export interface TimestampScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Timestamp'], any> {
  name: 'Timestamp';
}

export type TrustedDeviceTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['TrustedDeviceType'] = ResolversParentTypes['TrustedDeviceType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expiresAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastUsedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type TwoFactorSetupTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['TwoFactorSetupType'] = ResolversParentTypes['TwoFactorSetupType']> = ResolversObject<{
  qrCodeSvg?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  secret?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uri?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export interface UrlScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['URL'], any> {
  name: 'URL';
}

export type UserAccountAvailabilityTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserAccountAvailabilityType'] = ResolversParentTypes['UserAccountAvailabilityType']> = ResolversObject<{
  emailMessage?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userNameMessage?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type UserGroupMemberTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserGroupMemberType'] = ResolversParentTypes['UserGroupMemberType']> = ResolversObject<{
  displayName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  karkun?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType>;
  personId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  username?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type UserGroupTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserGroupType'] = ResolversParentTypes['UserGroupType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  instances?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  moduleName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  permissions?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  users?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['UserGroupMemberType']>>>, ParentType, ContextType>;
}>;

export type UserTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserType'] = ResolversParentTypes['UserType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  chatUserId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  displayName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emailVerified?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  groups?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  hasChatAccount?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  instances?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  isServiceAccount?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isSuperAdmin?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  karkun?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType>;
  lastActiveAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastLoggedInAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  locked?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  loginBlockedAddresses?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  permissions?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  person?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType>;
  personId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  twoFactorEnabled?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  untrustedLoginAddressesBlocked?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
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

export type VisitorFaceMatchTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['VisitorFaceMatchType'] = ResolversParentTypes['VisitorFaceMatchType']> = ResolversObject<{
  person?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType>;
  score?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
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

export type WorkspaceCommitteeMemberTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceCommitteeMemberType'] = ResolversParentTypes['WorkspaceCommitteeMemberType']> = ResolversObject<{
  contactNumber1?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber2?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasChatAccount?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasDiscussionAccess?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasLoginAccount?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  imageThumbnailUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isCoordinator?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  karkunId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  role?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceCommitteeTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceCommitteeType'] = ResolversParentTypes['WorkspaceCommitteeType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  canManageMembers?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  color?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  features?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  guestCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  locationId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  memberCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  members?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceCommitteeMemberType']>>>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  observerCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type WorkspaceDocumentActivityTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceDocumentActivityType'] = ResolversParentTypes['WorkspaceDocumentActivityType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  action?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  at?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  details?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  documentId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  entityId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  entityType?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceDocumentDownloadTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceDocumentDownloadType'] = ResolversParentTypes['WorkspaceDocumentDownloadType']> = ResolversObject<{
  fileName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceDocumentFolderContentsTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceDocumentFolderContentsType'] = ResolversParentTypes['WorkspaceDocumentFolderContentsType']> = ResolversObject<{
  documents?: Resolver<Types.Maybe<ResolversTypes['PagedWorkspaceDocumentType']>, ParentType, ContextType>;
  folders?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceDocumentFolderType']>>>, ParentType, ContextType>;
  path?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceDocumentFolderType']>>>, ParentType, ContextType>;
}>;

export type WorkspaceDocumentFolderTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceDocumentFolderType'] = ResolversParentTypes['WorkspaceDocumentFolderType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deletedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deletedByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  parentId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceDocumentLockTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceDocumentLockType'] = ResolversParentTypes['WorkspaceDocumentLockType']> = ResolversObject<{
  expiresAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isMine?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  lockedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  note?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceDocumentTrashTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceDocumentTrashType'] = ResolversParentTypes['WorkspaceDocumentTrashType']> = ResolversObject<{
  documents?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceDocumentType']>>>, ParentType, ContextType>;
  folders?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceDocumentFolderType']>>>, ParentType, ContextType>;
}>;

export type WorkspaceDocumentTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceDocumentType'] = ResolversParentTypes['WorkspaceDocumentType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  currentVersionNumber?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  deletedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deletedByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fileName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  folderId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  folderName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lock?: Resolver<Types.Maybe<ResolversTypes['WorkspaceDocumentLockType']>, ParentType, ContextType>;
  mimeType?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  size?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  tags?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceDocumentUploadTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceDocumentUploadType'] = ResolversParentTypes['WorkspaceDocumentUploadType']> = ResolversObject<{
  contentType?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  documentId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expiresAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uploadId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceDocumentVersionTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceDocumentVersionType'] = ResolversParentTypes['WorkspaceDocumentVersionType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  comment?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fileName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isCurrent?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  mimeType?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  size?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  versionNumber?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type WorkspaceDocumentsInfoTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceDocumentsInfoType'] = ResolversParentTypes['WorkspaceDocumentsInfoType']> = ResolversObject<{
  canManage?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  maxFileSize?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
}>;

export type WorkspaceKarkunTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceKarkunType'] = ResolversParentTypes['WorkspaceKarkunType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cnicNumber?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber1?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageThumbnailUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  parentName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceLocationTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceLocationType'] = ResolversParentTypes['WorkspaceLocationType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  parentId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceMeetingActionItemTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceMeetingActionItemType'] = ResolversParentTypes['WorkspaceMeetingActionItemType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  agendaItemId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  assigneeId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  assigneeName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  canChangeStatus?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  completedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  completedByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dueDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  meetingEndsAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  meetingId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  meetingTitle?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceMeetingActivityTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceMeetingActivityType'] = ResolversParentTypes['WorkspaceMeetingActivityType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  action?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  at?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  details?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  entityId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  entityType?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  meetingId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceMeetingAgendaItemTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceMeetingAgendaItemType'] = ResolversParentTypes['WorkspaceMeetingAgendaItemType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  durationMinutes?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  presenterId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  presenterName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceMeetingAttachmentTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceMeetingAttachmentType'] = ResolversParentTypes['WorkspaceMeetingAttachmentType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  canDelete?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fileName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mimeType?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  size?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
}>;

export type WorkspaceMeetingDownloadTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceMeetingDownloadType'] = ResolversParentTypes['WorkspaceMeetingDownloadType']> = ResolversObject<{
  fileName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceMeetingMemberTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceMeetingMemberType'] = ResolversParentTypes['WorkspaceMeetingMemberType']> = ResolversObject<{
  isCoordinator?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  participantId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceMeetingParticipantTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceMeetingParticipantType'] = ResolversParentTypes['WorkspaceMeetingParticipantType']> = ResolversObject<{
  attendanceMarkedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  attendanceMarkedByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  attendanceNote?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  attendanceStatus?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isMe?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  participantId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  role?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  rsvpComment?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  rsvpRespondedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  rsvpStatus?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceMeetingTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceMeetingType'] = ResolversParentTypes['WorkspaceMeetingType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  agenda?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceMeetingAgendaItemType']>>>, ParentType, ContextType>;
  attachmentCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  cancellationReason?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cancelledAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cancelledByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  completedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  completedByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  endsAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  location?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  minutes?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  minutesUpdatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  minutesUpdatedByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  myRsvpStatus?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  openActionItemCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  participants?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceMeetingParticipantType']>>>, ParentType, ContextType>;
  startsAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  timeZone?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  videoCall?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
}>;

export type WorkspaceMeetingUploadTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceMeetingUploadType'] = ResolversParentTypes['WorkspaceMeetingUploadType']> = ResolversObject<{
  contentType?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expiresAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uploadId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceMeetingVideoCallInfoTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceMeetingVideoCallInfoType'] = ResolversParentTypes['WorkspaceMeetingVideoCallInfoType']> = ResolversObject<{
  participantCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type WorkspaceMeetingVideoCallTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceMeetingVideoCallType'] = ResolversParentTypes['WorkspaceMeetingVideoCallType']> = ResolversObject<{
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
}>;

export type WorkspaceMeetingsInfoTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceMeetingsInfoType'] = ResolversParentTypes['WorkspaceMeetingsInfoType']> = ResolversObject<{
  canJoinVideoCall?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  canManage?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  maxFileSize?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  myParticipantId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  timeZone?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceMehfilDetailsTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceMehfilDetailsType'] = ResolversParentTypes['WorkspaceMehfilDetailsType']> = ResolversObject<{
  locationId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  mehfilDetails?: Resolver<Types.Maybe<ResolversTypes['OrgLocationMehfilDetailsType']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  permissions?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceMonitoringAlertTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceMonitoringAlertType'] = ResolversParentTypes['WorkspaceMonitoringAlertType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  channelName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  profileIsTest?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  profileName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  review?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  similarityScore?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  thumbnailUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  timestamp?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceMonitoringProfilePhotoTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceMonitoringProfilePhotoType'] = ResolversParentTypes['WorkspaceMonitoringProfilePhotoType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  thumbnailUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceMonitoringProfileTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceMonitoringProfileType'] = ResolversParentTypes['WorkspaceMonitoringProfileType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  alertsCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isTest?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  photos?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceMonitoringProfilePhotoType']>>>, ParentType, ContextType>;
}>;

export type WorkspaceNightStayTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceNightStayType'] = ResolversParentTypes['WorkspaceNightStayType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  city?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  country?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fromDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  numOfDays?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  stayAllowedBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stayHistory?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceStayHistoryItemType']>>>, ParentType, ContextType>;
  stayReason?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  toDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  visitorId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  visitorImageThumbnailUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  visitorImageUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  visitorName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspacePollActivityTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspacePollActivityType'] = ResolversParentTypes['WorkspacePollActivityType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  action?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  at?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  details?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  entityId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  entityType?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  pollId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspacePollAnswerTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspacePollAnswerType'] = ResolversParentTypes['WorkspacePollAnswerType']> = ResolversObject<{
  optionIds?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  questionId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspacePollOptionResultTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspacePollOptionResultType'] = ResolversParentTypes['WorkspacePollOptionResultType']> = ResolversObject<{
  count?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  optionId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  percentage?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  text?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  voters?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspacePollVoterType']>>>, ParentType, ContextType>;
}>;

export type WorkspacePollOptionTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspacePollOptionType'] = ResolversParentTypes['WorkspacePollOptionType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  text?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspacePollQuestionResultTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspacePollQuestionResultType'] = ResolversParentTypes['WorkspacePollQuestionResultType']> = ResolversObject<{
  answeredCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  options?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspacePollOptionResultType']>>>, ParentType, ContextType>;
  questionId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  text?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspacePollQuestionTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspacePollQuestionType'] = ResolversParentTypes['WorkspacePollQuestionType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  maxChoices?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  minChoices?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  options?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspacePollOptionType']>>>, ParentType, ContextType>;
  required?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  text?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspacePollResultsTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspacePollResultsType'] = ResolversParentTypes['WorkspacePollResultsType']> = ResolversObject<{
  anonymous?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  closedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  pollId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  questions?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspacePollQuestionResultType']>>>, ParentType, ContextType>;
  status?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  totalVoters?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type WorkspacePollTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspacePollType'] = ResolversParentTypes['WorkspacePollType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  anonymous?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  canSeeResults?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  cancellationReason?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cancelledAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cancelledByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  closedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  closedByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  closesAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasVoted?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isEligible?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  myAnswers?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspacePollAnswerType']>>>, ParentType, ContextType>;
  openedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  questions?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspacePollQuestionType']>>>, ParentType, ContextType>;
  status?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  voteCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type WorkspacePollVoterTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspacePollVoterType'] = ResolversParentTypes['WorkspacePollVoterType']> = ResolversObject<{
  hasVoted?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  voterId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspacePollsInfoTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspacePollsInfoType'] = ResolversParentTypes['WorkspacePollsInfoType']> = ResolversObject<{
  canManage?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  myVoterId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceProjectMemberTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceProjectMemberType'] = ResolversParentTypes['WorkspaceProjectMemberType']> = ResolversObject<{
  isCoordinator?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  personId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceProjectParticipantTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceProjectParticipantType'] = ResolversParentTypes['WorkspaceProjectParticipantType']> = ResolversObject<{
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  personId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceProjectTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceProjectType'] = ResolversParentTypes['WorkspaceProjectType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  canManage?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  completedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  completedByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  doneCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isOverdue?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isParticipant?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  objective?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  openTaskCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  participantCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  participants?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceProjectParticipantType']>>>, ParentType, ContextType>;
  progress?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  startDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tags?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  targetDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  taskCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  title?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceProjectsActivityTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceProjectsActivityType'] = ResolversParentTypes['WorkspaceProjectsActivityType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  action?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  at?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  details?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  entityId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  entityType?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  projectId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  taskId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceProjectsInfoTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceProjectsInfoType'] = ResolversParentTypes['WorkspaceProjectsInfoType']> = ResolversObject<{
  canManage?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  myPersonId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceStayHistoryItemTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceStayHistoryItemType'] = ResolversParentTypes['WorkspaceStayHistoryItemType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fromDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  numOfDays?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  stayReason?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  toDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceTaskCommentTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceTaskCommentType'] = ResolversParentTypes['WorkspaceTaskCommentType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  authorName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  canDelete?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isOwn?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  taskId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  text?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceTaskTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceTaskType'] = ResolversParentTypes['WorkspaceTaskType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  assigneeId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  assigneeName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  canManage?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  canUpdate?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  commentCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  completedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  completedByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dueDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isOverdue?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  priority?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  progress?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  projectId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  projectTitle?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tags?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  title?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  Attachment?: AttachmentResolvers<ContextType>;
  AuditLogType?: AuditLogTypeResolvers<ContextType>;
  CityMehfilType?: CityMehfilTypeResolvers<ContextType>;
  CityType?: CityTypeResolvers<ContextType>;
  CommitteeBasicType?: CommitteeBasicTypeResolvers<ContextType>;
  CommitteeFeatureType?: CommitteeFeatureTypeResolvers<ContextType>;
  CommitteeMemberType?: CommitteeMemberTypeResolvers<ContextType>;
  CommitteeMembersPageType?: CommitteeMembersPageTypeResolvers<ContextType>;
  CommitteeType?: CommitteeTypeResolvers<ContextType>;
  Currency?: GraphQLScalarType;
  DaAccessType?: DaAccessTypeResolvers<ContextType>;
  DaAttendanceSheetRowType?: DaAttendanceSheetRowTypeResolvers<ContextType>;
  DaDutyMemberType?: DaDutyMemberTypeResolvers<ContextType>;
  DaDutyType?: DaDutyTypeResolvers<ContextType>;
  DaMehfilDutyType?: DaMehfilDutyTypeResolvers<ContextType>;
  DaMyDutyType?: DaMyDutyTypeResolvers<ContextType>;
  DaMyLocationType?: DaMyLocationTypeResolvers<ContextType>;
  DaPlanDayType?: DaPlanDayTypeResolvers<ContextType>;
  DaPlanDaysType?: DaPlanDaysTypeResolvers<ContextType>;
  DaPlanKarkunType?: DaPlanKarkunTypeResolvers<ContextType>;
  Date?: GraphQLScalarType;
  DateTime?: GraphQLScalarType;
  DiscussionAttachmentType?: DiscussionAttachmentTypeResolvers<ContextType>;
  DiscussionInfoType?: DiscussionInfoTypeResolvers<ContextType>;
  DiscussionMemberType?: DiscussionMemberTypeResolvers<ContextType>;
  DiscussionMessagePageType?: DiscussionMessagePageTypeResolvers<ContextType>;
  DiscussionMessageType?: DiscussionMessageTypeResolvers<ContextType>;
  DiscussionReactionType?: DiscussionReactionTypeResolvers<ContextType>;
  DiscussionSyncType?: DiscussionSyncTypeResolvers<ContextType>;
  DiscussionVideoCallInfoType?: DiscussionVideoCallInfoTypeResolvers<ContextType>;
  DiscussionVideoCallType?: DiscussionVideoCallTypeResolvers<ContextType>;
  DuplicatePersonGroupType?: DuplicatePersonGroupTypeResolvers<ContextType>;
  DuplicatePersonSummaryType?: DuplicatePersonSummaryTypeResolvers<ContextType>;
  DutyAttendanceCardType?: DutyAttendanceCardTypeResolvers<ContextType>;
  DutyAttendanceSheetRowType?: DutyAttendanceSheetRowTypeResolvers<ContextType>;
  DutyLocationType?: DutyLocationTypeResolvers<ContextType>;
  DutyPlanDaysDayType?: DutyPlanDaysDayTypeResolvers<ContextType>;
  DutyPlanDaysKarkunType?: DutyPlanDaysKarkunTypeResolvers<ContextType>;
  DutyPlanDaysSlotType?: DutyPlanDaysSlotTypeResolvers<ContextType>;
  DutyPlanDaysType?: DutyPlanDaysTypeResolvers<ContextType>;
  DutyPlanWeekSlotType?: DutyPlanWeekSlotTypeResolvers<ContextType>;
  DutyPlanWeekType?: DutyPlanWeekTypeResolvers<ContextType>;
  DutyShiftType?: DutyShiftTypeResolvers<ContextType>;
  DutyType?: DutyTypeResolvers<ContextType>;
  EmailAddress?: GraphQLScalarType;
  EnrolledTrustedDeviceType?: EnrolledTrustedDeviceTypeResolvers<ContextType>;
  FaceVectorResultType?: FaceVectorResultTypeResolvers<ContextType>;
  FreeFormCityType?: FreeFormCityTypeResolvers<ContextType>;
  FreeFormValueType?: FreeFormValueTypeResolvers<ContextType>;
  HrGroupMember?: HrGroupMemberResolvers<ContextType>;
  HrPermissionAssignment?: HrPermissionAssignmentResolvers<ContextType>;
  HrPermissionGroup?: HrPermissionGroupResolvers<ContextType>;
  HrPermissionGroupHolder?: HrPermissionGroupHolderResolvers<ContextType>;
  HrPermissionHolder?: HrPermissionHolderResolvers<ContextType>;
  HrPermissionKarkunType?: HrPermissionKarkunTypeResolvers<ContextType>;
  HrUserGroup?: HrUserGroupResolvers<ContextType>;
  InboxAttachmentType?: InboxAttachmentTypeResolvers<ContextType>;
  InboxConversationDetailType?: InboxConversationDetailTypeResolvers<ContextType>;
  InboxConversationType?: InboxConversationTypeResolvers<ContextType>;
  InboxMessageType?: InboxMessageTypeResolvers<ContextType>;
  IssuanceForm?: IssuanceFormResolvers<ContextType>;
  ItemCategory?: ItemCategoryResolvers<ContextType>;
  ItemWithQuantity?: ItemWithQuantityResolvers<ContextType>;
  ItemWithQuantityAndPrice?: ItemWithQuantityAndPriceResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  JSONObject?: GraphQLScalarType;
  JobDefinitionType?: JobDefinitionTypeResolvers<ContextType>;
  JobLogEntryType?: JobLogEntryTypeResolvers<ContextType>;
  JobType?: JobTypeResolvers<ContextType>;
  Location?: LocationResolvers<ContextType>;
  MehfilDetailsAccessType?: MehfilDetailsAccessTypeResolvers<ContextType>;
  MehfilDutyType?: MehfilDutyTypeResolvers<ContextType>;
  MehfilKarkunType?: MehfilKarkunTypeResolvers<ContextType>;
  MehfilLangarDishType?: MehfilLangarDishTypeResolvers<ContextType>;
  MehfilLangarLocationType?: MehfilLangarLocationTypeResolvers<ContextType>;
  MehfilLocationKarkunType?: MehfilLocationKarkunTypeResolvers<ContextType>;
  MehfilPermissionsType?: MehfilPermissionsTypeResolvers<ContextType>;
  MehfilType?: MehfilTypeResolvers<ContextType>;
  MpGroupType?: MpGroupTypeResolvers<ContextType>;
  MpKarkunType?: MpKarkunTypeResolvers<ContextType>;
  MpPermissionType?: MpPermissionTypeResolvers<ContextType>;
  MpUserType?: MpUserTypeResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  MyMehfilDetailsLocationType?: MyMehfilDetailsLocationTypeResolvers<ContextType>;
  MyMehfilKarkunsLocationType?: MyMehfilKarkunsLocationTypeResolvers<ContextType>;
  MyMehfilPermissionsLocationType?: MyMehfilPermissionsLocationTypeResolvers<ContextType>;
  NotificationCountType?: NotificationCountTypeResolvers<ContextType>;
  NotificationType?: NotificationTypeResolvers<ContextType>;
  OrgLocationFeaturePermissionType?: OrgLocationFeaturePermissionTypeResolvers<ContextType>;
  OrgLocationFeaturePermissionUserType?: OrgLocationFeaturePermissionUserTypeResolvers<ContextType>;
  OrgLocationFeaturePermissionsType?: OrgLocationFeaturePermissionsTypeResolvers<ContextType>;
  OrgLocationKarkunType?: OrgLocationKarkunTypeResolvers<ContextType>;
  OrgLocationMehfilDetailsType?: OrgLocationMehfilDetailsTypeResolvers<ContextType>;
  OrgLocationObserverStatType?: OrgLocationObserverStatTypeResolvers<ContextType>;
  OrgLocationType?: OrgLocationTypeResolvers<ContextType>;
  PagedAuditLogType?: PagedAuditLogTypeResolvers<ContextType>;
  PagedCityType?: PagedCityTypeResolvers<ContextType>;
  PagedFreeFormCity?: PagedFreeFormCityResolvers<ContextType>;
  PagedFreeFormValue?: PagedFreeFormValueResolvers<ContextType>;
  PagedHrPermissionKarkunType?: PagedHrPermissionKarkunTypeResolvers<ContextType>;
  PagedInboxConversationType?: PagedInboxConversationTypeResolvers<ContextType>;
  PagedIssuanceForm?: PagedIssuanceFormResolvers<ContextType>;
  PagedJobLogsType?: PagedJobLogsTypeResolvers<ContextType>;
  PagedKarkunType?: PagedKarkunTypeResolvers<ContextType>;
  PagedMehfilLocationKarkunType?: PagedMehfilLocationKarkunTypeResolvers<ContextType>;
  PagedMpKarkunType?: PagedMpKarkunTypeResolvers<ContextType>;
  PagedOrgLocationKarkunType?: PagedOrgLocationKarkunTypeResolvers<ContextType>;
  PagedPeopleType?: PagedPeopleTypeResolvers<ContextType>;
  PagedPurchaseForm?: PagedPurchaseFormResolvers<ContextType>;
  PagedPurchasingCatalogItems?: PagedPurchasingCatalogItemsResolvers<ContextType>;
  PagedPurchasingInvoices?: PagedPurchasingInvoicesResolvers<ContextType>;
  PagedPurchasingKarkunType?: PagedPurchasingKarkunTypeResolvers<ContextType>;
  PagedPurchasingOrders?: PagedPurchasingOrdersResolvers<ContextType>;
  PagedPurchasingPayments?: PagedPurchasingPaymentsResolvers<ContextType>;
  PagedPurchasingQuotes?: PagedPurchasingQuotesResolvers<ContextType>;
  PagedPurchasingReceipts?: PagedPurchasingReceiptsResolvers<ContextType>;
  PagedPurchasingRequisitions?: PagedPurchasingRequisitionsResolvers<ContextType>;
  PagedPurchasingVendors?: PagedPurchasingVendorsResolvers<ContextType>;
  PagedSalaryType?: PagedSalaryTypeResolvers<ContextType>;
  PagedScheduledJobsType?: PagedScheduledJobsTypeResolvers<ContextType>;
  PagedSecurityLogType?: PagedSecurityLogTypeResolvers<ContextType>;
  PagedSecurityPermissionKarkunType?: PagedSecurityPermissionKarkunTypeResolvers<ContextType>;
  PagedSecurityServerAlertGroupType?: PagedSecurityServerAlertGroupTypeResolvers<ContextType>;
  PagedSecurityServerAlertType?: PagedSecurityServerAlertTypeResolvers<ContextType>;
  PagedSecurityServerProfileType?: PagedSecurityServerProfileTypeResolvers<ContextType>;
  PagedStockAdjustment?: PagedStockAdjustmentResolvers<ContextType>;
  PagedStockItem?: PagedStockItemResolvers<ContextType>;
  PagedUserGroupType?: PagedUserGroupTypeResolvers<ContextType>;
  PagedUserType?: PagedUserTypeResolvers<ContextType>;
  PagedVisitorStayType?: PagedVisitorStayTypeResolvers<ContextType>;
  PagedVisitorType?: PagedVisitorTypeResolvers<ContextType>;
  PagedWorkspaceDocumentType?: PagedWorkspaceDocumentTypeResolvers<ContextType>;
  PagedWorkspaceKarkunType?: PagedWorkspaceKarkunTypeResolvers<ContextType>;
  PagedWorkspaceMeetingActionItemType?: PagedWorkspaceMeetingActionItemTypeResolvers<ContextType>;
  PagedWorkspaceMeetingType?: PagedWorkspaceMeetingTypeResolvers<ContextType>;
  PagedWorkspaceMonitoringAlertType?: PagedWorkspaceMonitoringAlertTypeResolvers<ContextType>;
  PagedWorkspaceMonitoringProfileType?: PagedWorkspaceMonitoringProfileTypeResolvers<ContextType>;
  PagedWorkspaceNightStayType?: PagedWorkspaceNightStayTypeResolvers<ContextType>;
  PagedWorkspacePollType?: PagedWorkspacePollTypeResolvers<ContextType>;
  PagedWorkspaceProjectType?: PagedWorkspaceProjectTypeResolvers<ContextType>;
  PagedWorkspaceTaskCommentType?: PagedWorkspaceTaskCommentTypeResolvers<ContextType>;
  PagedWorkspaceTaskType?: PagedWorkspaceTaskTypeResolvers<ContextType>;
  PeopleTagType?: PeopleTagTypeResolvers<ContextType>;
  PersonBasicSharedDataType?: PersonBasicSharedDataTypeResolvers<ContextType>;
  PersonBasicType?: PersonBasicTypeResolvers<ContextType>;
  PersonEmployeeDataType?: PersonEmployeeDataTypeResolvers<ContextType>;
  PersonImageVectorDataType?: PersonImageVectorDataTypeResolvers<ContextType>;
  PersonKarkunDataType?: PersonKarkunDataTypeResolvers<ContextType>;
  PersonRelationCountType?: PersonRelationCountTypeResolvers<ContextType>;
  PersonRelationCounts?: PersonRelationCountsResolvers<ContextType>;
  PersonSharedDataType?: PersonSharedDataTypeResolvers<ContextType>;
  PersonType?: PersonTypeResolvers<ContextType>;
  PersonVisitorDataType?: PersonVisitorDataTypeResolvers<ContextType>;
  PhoneNumber?: GraphQLScalarType;
  PhysicalStore?: PhysicalStoreResolvers<ContextType>;
  PostalCode?: GraphQLScalarType;
  PurchaseForm?: PurchaseFormResolvers<ContextType>;
  PurchasingAttachment?: PurchasingAttachmentResolvers<ContextType>;
  PurchasingAttachmentDownload?: PurchasingAttachmentDownloadResolvers<ContextType>;
  PurchasingAttachmentUpload?: PurchasingAttachmentUploadResolvers<ContextType>;
  PurchasingCatalogItem?: PurchasingCatalogItemResolvers<ContextType>;
  PurchasingDashboard?: PurchasingDashboardResolvers<ContextType>;
  PurchasingGroupMember?: PurchasingGroupMemberResolvers<ContextType>;
  PurchasingInvoice?: PurchasingInvoiceResolvers<ContextType>;
  PurchasingInvoiceLine?: PurchasingInvoiceLineResolvers<ContextType>;
  PurchasingKarkunType?: PurchasingKarkunTypeResolvers<ContextType>;
  PurchasingLedgerEntry?: PurchasingLedgerEntryResolvers<ContextType>;
  PurchasingMonthlySpending?: PurchasingMonthlySpendingResolvers<ContextType>;
  PurchasingOpenOrder?: PurchasingOpenOrderResolvers<ContextType>;
  PurchasingOrder?: PurchasingOrderResolvers<ContextType>;
  PurchasingOrderLine?: PurchasingOrderLineResolvers<ContextType>;
  PurchasingPayablesAgingRow?: PurchasingPayablesAgingRowResolvers<ContextType>;
  PurchasingPayment?: PurchasingPaymentResolvers<ContextType>;
  PurchasingPaymentAllocation?: PurchasingPaymentAllocationResolvers<ContextType>;
  PurchasingPermissionAssignment?: PurchasingPermissionAssignmentResolvers<ContextType>;
  PurchasingPermissionGroup?: PurchasingPermissionGroupResolvers<ContextType>;
  PurchasingPermissionGroupHolder?: PurchasingPermissionGroupHolderResolvers<ContextType>;
  PurchasingPermissionHolder?: PurchasingPermissionHolderResolvers<ContextType>;
  PurchasingQuote?: PurchasingQuoteResolvers<ContextType>;
  PurchasingQuoteLine?: PurchasingQuoteLineResolvers<ContextType>;
  PurchasingReceipt?: PurchasingReceiptResolvers<ContextType>;
  PurchasingReceiptLine?: PurchasingReceiptLineResolvers<ContextType>;
  PurchasingRequisition?: PurchasingRequisitionResolvers<ContextType>;
  PurchasingRequisitionLine?: PurchasingRequisitionLineResolvers<ContextType>;
  PurchasingUserGroup?: PurchasingUserGroupResolvers<ContextType>;
  PurchasingVendor?: PurchasingVendorResolvers<ContextType>;
  PurchasingVendorLedger?: PurchasingVendorLedgerResolvers<ContextType>;
  PurchasingVendorSpending?: PurchasingVendorSpendingResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  ReferenceDutyShiftType?: ReferenceDutyShiftTypeResolvers<ContextType>;
  ReferenceDutyType?: ReferenceDutyTypeResolvers<ContextType>;
  ReferenceOrgLocationType?: ReferenceOrgLocationTypeResolvers<ContextType>;
  ReferencePhysicalStoreType?: ReferencePhysicalStoreTypeResolvers<ContextType>;
  SalaryType?: SalaryTypeResolvers<ContextType>;
  ScheduledJobType?: ScheduledJobTypeResolvers<ContextType>;
  SecurityGroupMember?: SecurityGroupMemberResolvers<ContextType>;
  SecurityLogType?: SecurityLogTypeResolvers<ContextType>;
  SecurityLogUserOption?: SecurityLogUserOptionResolvers<ContextType>;
  SecurityPermissionAssignment?: SecurityPermissionAssignmentResolvers<ContextType>;
  SecurityPermissionGroup?: SecurityPermissionGroupResolvers<ContextType>;
  SecurityPermissionGroupHolder?: SecurityPermissionGroupHolderResolvers<ContextType>;
  SecurityPermissionHolder?: SecurityPermissionHolderResolvers<ContextType>;
  SecurityPermissionKarkunType?: SecurityPermissionKarkunTypeResolvers<ContextType>;
  SecurityServerAlertGroupType?: SecurityServerAlertGroupTypeResolvers<ContextType>;
  SecurityServerAlertSyncStatusType?: SecurityServerAlertSyncStatusTypeResolvers<ContextType>;
  SecurityServerAlertType?: SecurityServerAlertTypeResolvers<ContextType>;
  SecurityServerChannelConnectionType?: SecurityServerChannelConnectionTypeResolvers<ContextType>;
  SecurityServerChannelType?: SecurityServerChannelTypeResolvers<ContextType>;
  SecurityServerProfileImageType?: SecurityServerProfileImageTypeResolvers<ContextType>;
  SecurityServerProfileType?: SecurityServerProfileTypeResolvers<ContextType>;
  SecurityServerUsageChannelType?: SecurityServerUsageChannelTypeResolvers<ContextType>;
  SecurityServerUsageServerType?: SecurityServerUsageServerTypeResolvers<ContextType>;
  SecurityServerUsageSummaryType?: SecurityServerUsageSummaryTypeResolvers<ContextType>;
  SecurityUserGroup?: SecurityUserGroupResolvers<ContextType>;
  StockAdjustment?: StockAdjustmentResolvers<ContextType>;
  StockItem?: StockItemResolvers<ContextType>;
  SyncOrgLocationObserversResult?: SyncOrgLocationObserversResultResolvers<ContextType>;
  TeamMemberType?: TeamMemberTypeResolvers<ContextType>;
  TeamType?: TeamTypeResolvers<ContextType>;
  Time?: GraphQLScalarType;
  Timestamp?: GraphQLScalarType;
  TrustedDeviceType?: TrustedDeviceTypeResolvers<ContextType>;
  TwoFactorSetupType?: TwoFactorSetupTypeResolvers<ContextType>;
  URL?: GraphQLScalarType;
  UserAccountAvailabilityType?: UserAccountAvailabilityTypeResolvers<ContextType>;
  UserGroupMemberType?: UserGroupMemberTypeResolvers<ContextType>;
  UserGroupType?: UserGroupTypeResolvers<ContextType>;
  UserType?: UserTypeResolvers<ContextType>;
  UtcOffset?: GraphQLScalarType;
  Vendor?: VendorResolvers<ContextType>;
  VisitorFaceMatchType?: VisitorFaceMatchTypeResolvers<ContextType>;
  VisitorStayType?: VisitorStayTypeResolvers<ContextType>;
  WorkspaceCommitteeMemberType?: WorkspaceCommitteeMemberTypeResolvers<ContextType>;
  WorkspaceCommitteeType?: WorkspaceCommitteeTypeResolvers<ContextType>;
  WorkspaceDocumentActivityType?: WorkspaceDocumentActivityTypeResolvers<ContextType>;
  WorkspaceDocumentDownloadType?: WorkspaceDocumentDownloadTypeResolvers<ContextType>;
  WorkspaceDocumentFolderContentsType?: WorkspaceDocumentFolderContentsTypeResolvers<ContextType>;
  WorkspaceDocumentFolderType?: WorkspaceDocumentFolderTypeResolvers<ContextType>;
  WorkspaceDocumentLockType?: WorkspaceDocumentLockTypeResolvers<ContextType>;
  WorkspaceDocumentTrashType?: WorkspaceDocumentTrashTypeResolvers<ContextType>;
  WorkspaceDocumentType?: WorkspaceDocumentTypeResolvers<ContextType>;
  WorkspaceDocumentUploadType?: WorkspaceDocumentUploadTypeResolvers<ContextType>;
  WorkspaceDocumentVersionType?: WorkspaceDocumentVersionTypeResolvers<ContextType>;
  WorkspaceDocumentsInfoType?: WorkspaceDocumentsInfoTypeResolvers<ContextType>;
  WorkspaceKarkunType?: WorkspaceKarkunTypeResolvers<ContextType>;
  WorkspaceLocationType?: WorkspaceLocationTypeResolvers<ContextType>;
  WorkspaceMeetingActionItemType?: WorkspaceMeetingActionItemTypeResolvers<ContextType>;
  WorkspaceMeetingActivityType?: WorkspaceMeetingActivityTypeResolvers<ContextType>;
  WorkspaceMeetingAgendaItemType?: WorkspaceMeetingAgendaItemTypeResolvers<ContextType>;
  WorkspaceMeetingAttachmentType?: WorkspaceMeetingAttachmentTypeResolvers<ContextType>;
  WorkspaceMeetingDownloadType?: WorkspaceMeetingDownloadTypeResolvers<ContextType>;
  WorkspaceMeetingMemberType?: WorkspaceMeetingMemberTypeResolvers<ContextType>;
  WorkspaceMeetingParticipantType?: WorkspaceMeetingParticipantTypeResolvers<ContextType>;
  WorkspaceMeetingType?: WorkspaceMeetingTypeResolvers<ContextType>;
  WorkspaceMeetingUploadType?: WorkspaceMeetingUploadTypeResolvers<ContextType>;
  WorkspaceMeetingVideoCallInfoType?: WorkspaceMeetingVideoCallInfoTypeResolvers<ContextType>;
  WorkspaceMeetingVideoCallType?: WorkspaceMeetingVideoCallTypeResolvers<ContextType>;
  WorkspaceMeetingsInfoType?: WorkspaceMeetingsInfoTypeResolvers<ContextType>;
  WorkspaceMehfilDetailsType?: WorkspaceMehfilDetailsTypeResolvers<ContextType>;
  WorkspaceMonitoringAlertType?: WorkspaceMonitoringAlertTypeResolvers<ContextType>;
  WorkspaceMonitoringProfilePhotoType?: WorkspaceMonitoringProfilePhotoTypeResolvers<ContextType>;
  WorkspaceMonitoringProfileType?: WorkspaceMonitoringProfileTypeResolvers<ContextType>;
  WorkspaceNightStayType?: WorkspaceNightStayTypeResolvers<ContextType>;
  WorkspacePollActivityType?: WorkspacePollActivityTypeResolvers<ContextType>;
  WorkspacePollAnswerType?: WorkspacePollAnswerTypeResolvers<ContextType>;
  WorkspacePollOptionResultType?: WorkspacePollOptionResultTypeResolvers<ContextType>;
  WorkspacePollOptionType?: WorkspacePollOptionTypeResolvers<ContextType>;
  WorkspacePollQuestionResultType?: WorkspacePollQuestionResultTypeResolvers<ContextType>;
  WorkspacePollQuestionType?: WorkspacePollQuestionTypeResolvers<ContextType>;
  WorkspacePollResultsType?: WorkspacePollResultsTypeResolvers<ContextType>;
  WorkspacePollType?: WorkspacePollTypeResolvers<ContextType>;
  WorkspacePollVoterType?: WorkspacePollVoterTypeResolvers<ContextType>;
  WorkspacePollsInfoType?: WorkspacePollsInfoTypeResolvers<ContextType>;
  WorkspaceProjectMemberType?: WorkspaceProjectMemberTypeResolvers<ContextType>;
  WorkspaceProjectParticipantType?: WorkspaceProjectParticipantTypeResolvers<ContextType>;
  WorkspaceProjectType?: WorkspaceProjectTypeResolvers<ContextType>;
  WorkspaceProjectsActivityType?: WorkspaceProjectsActivityTypeResolvers<ContextType>;
  WorkspaceProjectsInfoType?: WorkspaceProjectsInfoTypeResolvers<ContextType>;
  WorkspaceStayHistoryItemType?: WorkspaceStayHistoryItemTypeResolvers<ContextType>;
  WorkspaceTaskCommentType?: WorkspaceTaskCommentTypeResolvers<ContextType>;
  WorkspaceTaskType?: WorkspaceTaskTypeResolvers<ContextType>;
}>;

export type DirectiveResolvers<ContextType = any> = ResolversObject<{
  checkCommitteeAccess?: CheckCommitteeAccessDirectiveResolver<any, any, ContextType>;
  checkDutiesAttendanceAccess?: CheckDutiesAttendanceAccessDirectiveResolver<any, any, ContextType>;
  checkInstanceAccess?: CheckInstanceAccessDirectiveResolver<any, any, ContextType>;
  checkMehfilDetailsAccess?: CheckMehfilDetailsAccessDirectiveResolver<any, any, ContextType>;
  checkMehfilKarkunsAccess?: CheckMehfilKarkunsAccessDirectiveResolver<any, any, ContextType>;
  checkMehfilPermissionsAccess?: CheckMehfilPermissionsAccessDirectiveResolver<any, any, ContextType>;
  checkPermissions?: CheckPermissionsDirectiveResolver<any, any, ContextType>;
  superAdminOnly?: SuperAdminOnlyDirectiveResolver<any, any, ContextType>;
}>;
