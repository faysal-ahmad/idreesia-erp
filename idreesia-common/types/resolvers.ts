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
  CommitteeFeatureType: ResolverTypeWrapper<Types.CommitteeFeatureType>;
  CommitteeMemberType: ResolverTypeWrapper<Types.CommitteeMemberType>;
  CommitteeType: ResolverTypeWrapper<Types.CommitteeType>;
  Currency: ResolverTypeWrapper<Types.Scalars['Currency']['output']>;
  Date: ResolverTypeWrapper<Types.Scalars['Date']['output']>;
  DateTime: ResolverTypeWrapper<Types.Scalars['DateTime']['output']>;
  DiscussionAttachmentType: ResolverTypeWrapper<Types.DiscussionAttachmentType>;
  DiscussionInfoType: ResolverTypeWrapper<Types.DiscussionInfoType>;
  DiscussionMemberType: ResolverTypeWrapper<Types.DiscussionMemberType>;
  DiscussionMessagePageType: ResolverTypeWrapper<Types.DiscussionMessagePageType>;
  DiscussionMessageType: ResolverTypeWrapper<Types.DiscussionMessageType>;
  DiscussionReactionType: ResolverTypeWrapper<Types.DiscussionReactionType>;
  DiscussionSyncType: ResolverTypeWrapper<Types.DiscussionSyncType>;
  DuplicatePersonGroupType: ResolverTypeWrapper<Types.DuplicatePersonGroupType>;
  DuplicatePersonSummaryType: ResolverTypeWrapper<Types.DuplicatePersonSummaryType>;
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
  FaceVectorRecord: ResolverTypeWrapper<Types.FaceVectorRecord>;
  FaceVectorResultType: ResolverTypeWrapper<Types.FaceVectorResultType>;
  Float: ResolverTypeWrapper<Types.Scalars['Float']['output']>;
  InboxAttachmentType: ResolverTypeWrapper<Types.InboxAttachmentType>;
  InboxConversationDetailType: ResolverTypeWrapper<Types.InboxConversationDetailType>;
  InboxConversationFilter: Types.InboxConversationFilter;
  InboxConversationType: ResolverTypeWrapper<Types.InboxConversationType>;
  InboxMessageType: ResolverTypeWrapper<Types.InboxMessageType>;
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
  KarkunFilter: Types.KarkunFilter;
  Location: ResolverTypeWrapper<Types.Location>;
  MehfilDutyType: ResolverTypeWrapper<Types.MehfilDutyType>;
  MehfilKarkunType: ResolverTypeWrapper<Types.MehfilKarkunType>;
  MehfilLangarDishType: ResolverTypeWrapper<Types.MehfilLangarDishType>;
  MehfilLangarLocationType: ResolverTypeWrapper<Types.MehfilLangarLocationType>;
  MehfilType: ResolverTypeWrapper<Types.MehfilType>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  PagedAuditLogType: ResolverTypeWrapper<Types.PagedAuditLogType>;
  PagedCityType: ResolverTypeWrapper<Types.PagedCityType>;
  PagedInboxConversationType: ResolverTypeWrapper<Types.PagedInboxConversationType>;
  PagedIssuanceForm: ResolverTypeWrapper<Types.PagedIssuanceForm>;
  PagedJobLogsType: ResolverTypeWrapper<Types.PagedJobLogsType>;
  PagedKarkunType: ResolverTypeWrapper<Types.PagedKarkunType>;
  PagedPeopleType: ResolverTypeWrapper<Types.PagedPeopleType>;
  PagedPurchaseForm: ResolverTypeWrapper<Types.PagedPurchaseForm>;
  PagedSalaryType: ResolverTypeWrapper<Types.PagedSalaryType>;
  PagedScheduledJobsType: ResolverTypeWrapper<Types.PagedScheduledJobsType>;
  PagedSecurityLogType: ResolverTypeWrapper<Types.PagedSecurityLogType>;
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
  PeopleTagType: ResolverTypeWrapper<Types.PeopleTagType>;
  Permission: Types.Permission;
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
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  SalaryType: ResolverTypeWrapper<Types.SalaryType>;
  ScheduledJobType: ResolverTypeWrapper<Types.ScheduledJobType>;
  ScheduledJobsFilterType: Types.ScheduledJobsFilterType;
  SecurityLogFilter: Types.SecurityLogFilter;
  SecurityLogType: ResolverTypeWrapper<Types.SecurityLogType>;
  SecurityLogUserOption: ResolverTypeWrapper<Types.SecurityLogUserOption>;
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
  StockAdjustment: ResolverTypeWrapper<Types.StockAdjustment>;
  StockItem: ResolverTypeWrapper<Types.StockItem>;
  String: ResolverTypeWrapper<Types.Scalars['String']['output']>;
  TeamMemberType: ResolverTypeWrapper<Types.TeamMemberType>;
  TeamType: ResolverTypeWrapper<Types.TeamType>;
  Time: ResolverTypeWrapper<Types.Scalars['Time']['output']>;
  Timestamp: ResolverTypeWrapper<Types.Scalars['Timestamp']['output']>;
  URL: ResolverTypeWrapper<Types.Scalars['URL']['output']>;
  UserFilter: Types.UserFilter;
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
  WorkspaceMeetingsInfoType: ResolverTypeWrapper<Types.WorkspaceMeetingsInfoType>;
  WorkspaceMonitoringAlertType: ResolverTypeWrapper<Types.WorkspaceMonitoringAlertType>;
  WorkspaceMonitoringProfilePhotoType: ResolverTypeWrapper<Types.WorkspaceMonitoringProfilePhotoType>;
  WorkspaceMonitoringProfileType: ResolverTypeWrapper<Types.WorkspaceMonitoringProfileType>;
  WorkspaceNightStayType: ResolverTypeWrapper<Types.WorkspaceNightStayType>;
  WorkspacePollActivityType: ResolverTypeWrapper<Types.WorkspacePollActivityType>;
  WorkspacePollAnswerInput: Types.WorkspacePollAnswerInput;
  WorkspacePollAnswerType: ResolverTypeWrapper<Types.WorkspacePollAnswerType>;
  WorkspacePollInput: Types.WorkspacePollInput;
  WorkspacePollMemberType: ResolverTypeWrapper<Types.WorkspacePollMemberType>;
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
  WorkspaceStayHistoryItemType: ResolverTypeWrapper<Types.WorkspaceStayHistoryItemType>;
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
  CommitteeFeatureType: Types.CommitteeFeatureType;
  CommitteeMemberType: Types.CommitteeMemberType;
  CommitteeType: Types.CommitteeType;
  Currency: Types.Scalars['Currency']['output'];
  Date: Types.Scalars['Date']['output'];
  DateTime: Types.Scalars['DateTime']['output'];
  DiscussionAttachmentType: Types.DiscussionAttachmentType;
  DiscussionInfoType: Types.DiscussionInfoType;
  DiscussionMemberType: Types.DiscussionMemberType;
  DiscussionMessagePageType: Types.DiscussionMessagePageType;
  DiscussionMessageType: Types.DiscussionMessageType;
  DiscussionReactionType: Types.DiscussionReactionType;
  DiscussionSyncType: Types.DiscussionSyncType;
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
  FaceVectorRecord: Types.FaceVectorRecord;
  FaceVectorResultType: Types.FaceVectorResultType;
  Float: Types.Scalars['Float']['output'];
  InboxAttachmentType: Types.InboxAttachmentType;
  InboxConversationDetailType: Types.InboxConversationDetailType;
  InboxConversationFilter: Types.InboxConversationFilter;
  InboxConversationType: Types.InboxConversationType;
  InboxMessageType: Types.InboxMessageType;
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
  KarkunFilter: Types.KarkunFilter;
  Location: Types.Location;
  MehfilDutyType: Types.MehfilDutyType;
  MehfilKarkunType: Types.MehfilKarkunType;
  MehfilLangarDishType: Types.MehfilLangarDishType;
  MehfilLangarLocationType: Types.MehfilLangarLocationType;
  MehfilType: Types.MehfilType;
  Mutation: Record<PropertyKey, never>;
  PagedAuditLogType: Types.PagedAuditLogType;
  PagedCityType: Types.PagedCityType;
  PagedInboxConversationType: Types.PagedInboxConversationType;
  PagedIssuanceForm: Types.PagedIssuanceForm;
  PagedJobLogsType: Types.PagedJobLogsType;
  PagedKarkunType: Types.PagedKarkunType;
  PagedPeopleType: Types.PagedPeopleType;
  PagedPurchaseForm: Types.PagedPurchaseForm;
  PagedSalaryType: Types.PagedSalaryType;
  PagedScheduledJobsType: Types.PagedScheduledJobsType;
  PagedSecurityLogType: Types.PagedSecurityLogType;
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
  PeopleTagType: Types.PeopleTagType;
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
  Query: Record<PropertyKey, never>;
  SalaryType: Types.SalaryType;
  ScheduledJobType: Types.ScheduledJobType;
  ScheduledJobsFilterType: Types.ScheduledJobsFilterType;
  SecurityLogFilter: Types.SecurityLogFilter;
  SecurityLogType: Types.SecurityLogType;
  SecurityLogUserOption: Types.SecurityLogUserOption;
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
  StockAdjustment: Types.StockAdjustment;
  StockItem: Types.StockItem;
  String: Types.Scalars['String']['output'];
  TeamMemberType: Types.TeamMemberType;
  TeamType: Types.TeamType;
  Time: Types.Scalars['Time']['output'];
  Timestamp: Types.Scalars['Timestamp']['output'];
  URL: Types.Scalars['URL']['output'];
  UserFilter: Types.UserFilter;
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
  WorkspaceMeetingsInfoType: Types.WorkspaceMeetingsInfoType;
  WorkspaceMonitoringAlertType: Types.WorkspaceMonitoringAlertType;
  WorkspaceMonitoringProfilePhotoType: Types.WorkspaceMonitoringProfilePhotoType;
  WorkspaceMonitoringProfileType: Types.WorkspaceMonitoringProfileType;
  WorkspaceNightStayType: Types.WorkspaceNightStayType;
  WorkspacePollActivityType: Types.WorkspacePollActivityType;
  WorkspacePollAnswerInput: Types.WorkspacePollAnswerInput;
  WorkspacePollAnswerType: Types.WorkspacePollAnswerType;
  WorkspacePollInput: Types.WorkspacePollInput;
  WorkspacePollMemberType: Types.WorkspacePollMemberType;
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
  WorkspaceStayHistoryItemType: Types.WorkspaceStayHistoryItemType;
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
  karkun?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType>;
  karkunId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type CommitteeTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['CommitteeType'] = ResolversParentTypes['CommitteeType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  color?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  features?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  members?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['CommitteeMemberType']>>>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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
  committee?: Resolver<Types.Maybe<ResolversTypes['CommitteeType']>, ParentType, ContextType>;
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

export type FaceVectorRecordResolvers<ContextType = any, ParentType extends ResolversParentTypes['FaceVectorRecord'] = ResolversParentTypes['FaceVectorRecord']> = ResolversObject<{
  computedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  personId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  vector?: Resolver<Array<ResolversTypes['Float']>, ParentType, ContextType>;
}>;

export type FaceVectorResultTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['FaceVectorResultType'] = ResolversParentTypes['FaceVectorResultType']> = ResolversObject<{
  status?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  vector?: Resolver<Types.Maybe<Array<ResolversTypes['Float']>>, ParentType, ContextType>;
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
  addCommitteeCoordinator?: Resolver<Types.Maybe<ResolversTypes['CommitteeType']>, ParentType, ContextType, RequireFields<Types.MutationAddCommitteeCoordinatorArgs, 'committeeId' | 'karkunId'>>;
  addCommitteeMember?: Resolver<Types.Maybe<ResolversTypes['CommitteeType']>, ParentType, ContextType, RequireFields<Types.MutationAddCommitteeMemberArgs, 'committeeId' | 'karkunId'>>;
  addHrKarkunAttachment?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationAddHrKarkunAttachmentArgs, '_id' | 'attachmentId'>>;
  addIssuanceFormAttachment?: Resolver<Types.Maybe<ResolversTypes['IssuanceForm']>, ParentType, ContextType, RequireFields<Types.MutationAddIssuanceFormAttachmentArgs, '_id' | 'attachmentId' | 'physicalStoreId'>>;
  addMehfilKarkun?: Resolver<Types.Maybe<ResolversTypes['MehfilKarkunType']>, ParentType, ContextType, RequireFields<Types.MutationAddMehfilKarkunArgs, 'dutyId' | 'karkunId' | 'mehfilId'>>;
  addPurchaseFormAttachment?: Resolver<Types.Maybe<ResolversTypes['PurchaseForm']>, ParentType, ContextType, RequireFields<Types.MutationAddPurchaseFormAttachmentArgs, '_id' | 'attachmentId' | 'physicalStoreId'>>;
  addSecurityServerProfileImage?: Resolver<Types.Maybe<ResolversTypes['SecurityServerProfileType']>, ParentType, ContextType, RequireFields<Types.MutationAddSecurityServerProfileImageArgs, 'imageData' | 'profileId'>>;
  addTeamCoordinator?: Resolver<Types.Maybe<ResolversTypes['TeamType']>, ParentType, ContextType, RequireFields<Types.MutationAddTeamCoordinatorArgs, 'karkunId' | 'teamId'>>;
  addTeamMember?: Resolver<Types.Maybe<ResolversTypes['TeamType']>, ParentType, ContextType, RequireFields<Types.MutationAddTeamMemberArgs, 'daysOfWeek' | 'karkunId' | 'teamId'>>;
  addWorkspaceMonitoringProfilePhoto?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMonitoringProfileType']>, ParentType, ContextType, RequireFields<Types.MutationAddWorkspaceMonitoringProfilePhotoArgs, 'committeeId' | 'imageData' | 'profileId'>>;
  approveIssuanceForms?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['IssuanceForm']>>>, ParentType, ContextType, RequireFields<Types.MutationApproveIssuanceFormsArgs, '_ids' | 'physicalStoreId'>>;
  approvePurchaseForms?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PurchaseForm']>>>, ParentType, ContextType, RequireFields<Types.MutationApprovePurchaseFormsArgs, '_ids' | 'physicalStoreId'>>;
  approveStockAdjustments?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['StockAdjustment']>>>, ParentType, ContextType, RequireFields<Types.MutationApproveStockAdjustmentsArgs, '_ids' | 'physicalStoreId'>>;
  cancelVisitorStay?: Resolver<Types.Maybe<ResolversTypes['VisitorStayType']>, ParentType, ContextType, RequireFields<Types.MutationCancelVisitorStayArgs, '_id'>>;
  clearJobDefinitionSchedule?: Resolver<Types.Maybe<ResolversTypes['JobDefinitionType']>, ParentType, ContextType, RequireFields<Types.MutationClearJobDefinitionScheduleArgs, '_id'>>;
  createChatAccount?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<Types.MutationCreateChatAccountArgs, 'userId'>>;
  createCity?: Resolver<Types.Maybe<ResolversTypes['CityType']>, ParentType, ContextType, RequireFields<Types.MutationCreateCityArgs, 'country' | 'name'>>;
  createCityMehfil?: Resolver<Types.Maybe<ResolversTypes['CityMehfilType']>, ParentType, ContextType, RequireFields<Types.MutationCreateCityMehfilArgs, 'cityId' | 'name'>>;
  createCommittee?: Resolver<Types.Maybe<ResolversTypes['CommitteeType']>, ParentType, ContextType, RequireFields<Types.MutationCreateCommitteeArgs, 'name'>>;
  createDuty?: Resolver<Types.Maybe<ResolversTypes['DutyType']>, ParentType, ContextType, RequireFields<Types.MutationCreateDutyArgs, 'isMehfilDuty' | 'name'>>;
  createDutyLocation?: Resolver<Types.Maybe<ResolversTypes['DutyLocationType']>, ParentType, ContextType, RequireFields<Types.MutationCreateDutyLocationArgs, 'dutyId' | 'name'>>;
  createDutyShift?: Resolver<Types.Maybe<ResolversTypes['DutyShiftType']>, ParentType, ContextType, RequireFields<Types.MutationCreateDutyShiftArgs, 'dutyId' | 'name'>>;
  createHrKarkun?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationCreateHrKarkunArgs, 'name'>>;
  createIssuanceForm?: Resolver<Types.Maybe<ResolversTypes['IssuanceForm']>, ParentType, ContextType, RequireFields<Types.MutationCreateIssuanceFormArgs, 'issueDate' | 'issuedBy' | 'issuedTo' | 'physicalStoreId'>>;
  createItemCategory?: Resolver<Types.Maybe<ResolversTypes['ItemCategory']>, ParentType, ContextType, RequireFields<Types.MutationCreateItemCategoryArgs, 'name' | 'physicalStoreId'>>;
  createJob?: Resolver<Types.Maybe<ResolversTypes['JobType']>, ParentType, ContextType, RequireFields<Types.MutationCreateJobArgs, 'name'>>;
  createLocation?: Resolver<Types.Maybe<ResolversTypes['Location']>, ParentType, ContextType, RequireFields<Types.MutationCreateLocationArgs, 'name' | 'physicalStoreId'>>;
  createMehfil?: Resolver<Types.Maybe<ResolversTypes['MehfilType']>, ParentType, ContextType, RequireFields<Types.MutationCreateMehfilArgs, 'mehfilDate' | 'name'>>;
  createMissingSecurityServerAlertThumbnails?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  createMissingSecurityServerProfileThumbnails?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  createPeopleTag?: Resolver<Types.Maybe<ResolversTypes['PeopleTagType']>, ParentType, ContextType, RequireFields<Types.MutationCreatePeopleTagArgs, 'color' | 'moduleNames' | 'name' | 'textColor'>>;
  createPhysicalStore?: Resolver<Types.Maybe<ResolversTypes['PhysicalStore']>, ParentType, ContextType, RequireFields<Types.MutationCreatePhysicalStoreArgs, 'name'>>;
  createPurchaseForm?: Resolver<Types.Maybe<ResolversTypes['PurchaseForm']>, ParentType, ContextType, RequireFields<Types.MutationCreatePurchaseFormArgs, 'physicalStoreId' | 'purchaseDate' | 'purchasedBy' | 'receivedBy'>>;
  createSalaries?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationCreateSalariesArgs, 'month'>>;
  createSecurityMehfilDuty?: Resolver<Types.Maybe<ResolversTypes['MehfilDutyType']>, ParentType, ContextType, RequireFields<Types.MutationCreateSecurityMehfilDutyArgs, 'name' | 'urduName'>>;
  createSecurityMehfilLangarDish?: Resolver<Types.Maybe<ResolversTypes['MehfilLangarDishType']>, ParentType, ContextType, RequireFields<Types.MutationCreateSecurityMehfilLangarDishArgs, 'name' | 'urduName'>>;
  createSecurityMehfilLangarLocation?: Resolver<Types.Maybe<ResolversTypes['MehfilLangarLocationType']>, ParentType, ContextType, RequireFields<Types.MutationCreateSecurityMehfilLangarLocationArgs, 'name' | 'urduName'>>;
  createSecurityServerChannel?: Resolver<Types.Maybe<ResolversTypes['SecurityServerChannelType']>, ParentType, ContextType, RequireFields<Types.MutationCreateSecurityServerChannelArgs, 'connection' | 'enabled' | 'name' | 'recognitionFps'>>;
  createSecurityServerProfile?: Resolver<Types.Maybe<ResolversTypes['SecurityServerProfileType']>, ParentType, ContextType, RequireFields<Types.MutationCreateSecurityServerProfileArgs, 'isTest' | 'name'>>;
  createSecurityVisitor?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationCreateSecurityVisitorArgs, 'ehadDate' | 'name' | 'parentName' | 'referenceName'>>;
  createStockAdjustment?: Resolver<Types.Maybe<ResolversTypes['StockAdjustment']>, ParentType, ContextType, RequireFields<Types.MutationCreateStockAdjustmentArgs, 'adjustedBy' | 'adjustmentDate' | 'isInflow' | 'physicalStoreId' | 'quantity' | 'stockItemId'>>;
  createStockItem?: Resolver<Types.Maybe<ResolversTypes['StockItem']>, ParentType, ContextType, RequireFields<Types.MutationCreateStockItemArgs, 'categoryId' | 'name' | 'physicalStoreId' | 'unitOfMeasurement'>>;
  createTeam?: Resolver<Types.Maybe<ResolversTypes['TeamType']>, ParentType, ContextType, RequireFields<Types.MutationCreateTeamArgs, 'dutyId' | 'name'>>;
  createUser?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, Partial<Types.MutationCreateUserArgs>>;
  createUserGroup?: Resolver<Types.Maybe<ResolversTypes['UserGroupType']>, ParentType, ContextType, RequireFields<Types.MutationCreateUserGroupArgs, 'moduleName' | 'name'>>;
  createVendor?: Resolver<Types.Maybe<ResolversTypes['Vendor']>, ParentType, ContextType, RequireFields<Types.MutationCreateVendorArgs, 'name' | 'physicalStoreId'>>;
  createVisitorStay?: Resolver<Types.Maybe<ResolversTypes['VisitorStayType']>, ParentType, ContextType, RequireFields<Types.MutationCreateVisitorStayArgs, 'numOfDays' | 'visitorId'>>;
  deleteAllSalaries?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationDeleteAllSalariesArgs, 'month'>>;
  deleteDuplicatePeople?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationDeleteDuplicatePeopleArgs, '_ids'>>;
  deleteHrKarkun?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationDeleteHrKarkunArgs, '_id'>>;
  deletePeopleTag?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationDeletePeopleTagArgs, '_id'>>;
  deleteSalaries?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationDeleteSalariesArgs, 'ids' | 'month'>>;
  deleteSecurityServerChannel?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationDeleteSecurityServerChannelArgs, '_id'>>;
  deleteSecurityServerProfile?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationDeleteSecurityServerProfileArgs, '_id'>>;
  deleteSecurityVisitor?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationDeleteSecurityVisitorArgs, '_id'>>;
  deleteUserGroup?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationDeleteUserGroupArgs, '_id'>>;
  deleteVisitorStay?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationDeleteVisitorStayArgs, '_id'>>;
  disableCommitteeFeature?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Types.MutationDisableCommitteeFeatureArgs, 'committeeId' | 'featureKey'>>;
  enableCommitteeFeature?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Types.MutationEnableCommitteeFeatureArgs, 'committeeId' | 'featureKey'>>;
  fixCitySpelling?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationFixCitySpellingArgs, 'existingSpelling' | 'newSpelling'>>;
  fixNameSpelling?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationFixNameSpellingArgs, 'existingSpelling' | 'newSpelling'>>;
  hardDeletePeople?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationHardDeletePeopleArgs, '_ids'>>;
  importSecurityVisitorsCsvData?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<Types.MutationImportSecurityVisitorsCsvDataArgs, 'csvData'>>;
  mergeStockItems?: Resolver<Types.Maybe<ResolversTypes['StockItem']>, ParentType, ContextType, RequireFields<Types.MutationMergeStockItemsArgs, '_idToKeep' | '_idsToMerge' | 'physicalStoreId'>>;
  promoteHrKarkun?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationPromoteHrKarkunArgs, '_id'>>;
  recalculateStockLevels?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['StockItem']>>>, ParentType, ContextType, RequireFields<Types.MutationRecalculateStockLevelsArgs, '_ids' | 'physicalStoreId'>>;
  registerUser?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRegisterUserArgs, 'displayName' | 'email'>>;
  removeCity?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveCityArgs, '_id'>>;
  removeCityMehfil?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveCityMehfilArgs, '_id'>>;
  removeCommittee?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveCommitteeArgs, '_id'>>;
  removeCommitteeCoordinator?: Resolver<Types.Maybe<ResolversTypes['CommitteeType']>, ParentType, ContextType, RequireFields<Types.MutationRemoveCommitteeCoordinatorArgs, 'committeeId' | 'karkunId'>>;
  removeCommitteeMember?: Resolver<Types.Maybe<ResolversTypes['CommitteeType']>, ParentType, ContextType, RequireFields<Types.MutationRemoveCommitteeMemberArgs, 'committeeId' | 'karkunId'>>;
  removeDuty?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveDutyArgs, '_id'>>;
  removeDutyLocation?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveDutyLocationArgs, '_id'>>;
  removeDutyShift?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveDutyShiftArgs, '_id'>>;
  removeHrKarkunAttachment?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationRemoveHrKarkunAttachmentArgs, '_id' | 'attachmentId'>>;
  removeIssuanceFormAttachment?: Resolver<Types.Maybe<ResolversTypes['IssuanceForm']>, ParentType, ContextType, RequireFields<Types.MutationRemoveIssuanceFormAttachmentArgs, '_id' | 'attachmentId' | 'physicalStoreId'>>;
  removeIssuanceForms?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveIssuanceFormsArgs, '_ids' | 'physicalStoreId'>>;
  removeItemCategory?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveItemCategoryArgs, '_id' | 'physicalStoreId'>>;
  removeJob?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveJobArgs, '_id'>>;
  removeLocation?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveLocationArgs, '_id' | 'physicalStoreId'>>;
  removeMehfil?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveMehfilArgs, '_id'>>;
  removeMehfilKarkun?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveMehfilKarkunArgs, '_id'>>;
  removePurchaseFormAttachment?: Resolver<Types.Maybe<ResolversTypes['PurchaseForm']>, ParentType, ContextType, RequireFields<Types.MutationRemovePurchaseFormAttachmentArgs, '_id' | 'attachmentId' | 'physicalStoreId'>>;
  removePurchaseForms?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemovePurchaseFormsArgs, '_ids' | 'physicalStoreId'>>;
  removeSecurityMehfilDuty?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveSecurityMehfilDutyArgs, '_id'>>;
  removeSecurityMehfilLangarDish?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveSecurityMehfilLangarDishArgs, '_id'>>;
  removeSecurityMehfilLangarLocation?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveSecurityMehfilLangarLocationArgs, '_id'>>;
  removeSecurityServerProfileImage?: Resolver<Types.Maybe<ResolversTypes['SecurityServerProfileType']>, ParentType, ContextType, RequireFields<Types.MutationRemoveSecurityServerProfileImageArgs, 'imageId' | 'profileId'>>;
  removeStockAdjustments?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveStockAdjustmentsArgs, '_ids' | 'physicalStoreId'>>;
  removeStockItem?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveStockItemArgs, '_id' | 'physicalStoreId'>>;
  removeTeam?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveTeamArgs, '_id'>>;
  removeTeamCoordinator?: Resolver<Types.Maybe<ResolversTypes['TeamType']>, ParentType, ContextType, RequireFields<Types.MutationRemoveTeamCoordinatorArgs, 'karkunId' | 'teamId'>>;
  removeTeamMember?: Resolver<Types.Maybe<ResolversTypes['TeamType']>, ParentType, ContextType, RequireFields<Types.MutationRemoveTeamMemberArgs, 'karkunId' | 'teamId'>>;
  removeVendor?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRemoveVendorArgs, '_id' | 'physicalStoreId'>>;
  removeWorkspaceMonitoringProfilePhoto?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMonitoringProfileType']>, ParentType, ContextType, RequireFields<Types.MutationRemoveWorkspaceMonitoringProfilePhotoArgs, 'committeeId' | 'photoId' | 'profileId'>>;
  resetJobDefinitionSchedule?: Resolver<Types.Maybe<ResolversTypes['JobDefinitionType']>, ParentType, ContextType, RequireFields<Types.MutationResetJobDefinitionScheduleArgs, '_id'>>;
  resetPassword?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<Types.MutationResetPasswordArgs, 'userName'>>;
  restorePerson?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationRestorePersonArgs, '_id'>>;
  retryFailedJob?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationRetryFailedJobArgs, '_id'>>;
  runScheduledJobNow?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationRunScheduledJobNowArgs, 'name'>>;
  sendInboxMessage?: Resolver<Types.Maybe<ResolversTypes['InboxMessageType']>, ParentType, ContextType, RequireFields<Types.MutationSendInboxMessageArgs, 'roomId' | 'text'>>;
  setCommitteeMemberDiscussionAccess?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationSetCommitteeMemberDiscussionAccessArgs, 'committeeId' | 'hasAccess' | 'karkunId'>>;
  setDutyAttendance?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationSetDutyAttendanceArgs, 'date' | 'dutyId' | 'karkunId' | 'locationId' | 'shiftId'>>;
  setDutyDayOverride?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationSetDutyDayOverrideArgs, 'date' | 'dutyId' | 'locationId' | 'shiftId'>>;
  setDutyDetail?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['MehfilKarkunType']>>>, ParentType, ContextType, RequireFields<Types.MutationSetDutyDetailArgs, 'ids'>>;
  setDutyShiftTeam?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationSetDutyShiftTeamArgs, 'dutyId' | 'locationId' | 'shiftId'>>;
  setGroups?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<Types.MutationSetGroupsArgs, 'groups' | 'userId'>>;
  setHrKarkunEmploymentInfo?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationSetHrKarkunEmploymentInfoArgs, '_id' | 'isEmployee'>>;
  setHrKarkunProfileImage?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationSetHrKarkunProfileImageArgs, '_id' | 'imageData'>>;
  setHrKarkunWazaifAndRaabta?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationSetHrKarkunWazaifAndRaabtaArgs, '_id'>>;
  setInstanceAccess?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<Types.MutationSetInstanceAccessArgs, 'instances' | 'userId'>>;
  setJobDefinitionEnabled?: Resolver<Types.Maybe<ResolversTypes['JobDefinitionType']>, ParentType, ContextType, RequireFields<Types.MutationSetJobDefinitionEnabledArgs, '_id' | 'enabled'>>;
  setPermissions?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<Types.MutationSetPermissionsArgs, 'permissions' | 'userId'>>;
  setScheduledJobEnabled?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationSetScheduledJobEnabledArgs, '_id' | 'enabled'>>;
  setSecurityServerAlertReview?: Resolver<Types.Maybe<ResolversTypes['SecurityServerAlertType']>, ParentType, ContextType, RequireFields<Types.MutationSetSecurityServerAlertReviewArgs, '_id'>>;
  setSecurityServerProfileDefaultImage?: Resolver<Types.Maybe<ResolversTypes['SecurityServerProfileType']>, ParentType, ContextType, RequireFields<Types.MutationSetSecurityServerProfileDefaultImageArgs, 'imageId' | 'profileId'>>;
  setSecurityUserPermissions?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<Types.MutationSetSecurityUserPermissionsArgs, 'permissions' | 'userId'>>;
  setSecurityVisitorImage?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationSetSecurityVisitorImageArgs, '_id' | 'imageData'>>;
  setStockItemImage?: Resolver<Types.Maybe<ResolversTypes['StockItem']>, ParentType, ContextType, RequireFields<Types.MutationSetStockItemImageArgs, '_id' | 'imageData' | 'physicalStoreId'>>;
  setUserGroupInstanceAccess?: Resolver<Types.Maybe<ResolversTypes['UserGroupType']>, ParentType, ContextType, RequireFields<Types.MutationSetUserGroupInstanceAccessArgs, '_id' | 'instances'>>;
  setUserGroupPermissions?: Resolver<Types.Maybe<ResolversTypes['UserGroupType']>, ParentType, ContextType, RequireFields<Types.MutationSetUserGroupPermissionsArgs, '_id' | 'permissions'>>;
  updateAttachment?: Resolver<Types.Maybe<ResolversTypes['Attachment']>, ParentType, ContextType, RequireFields<Types.MutationUpdateAttachmentArgs, '_id'>>;
  updateCity?: Resolver<Types.Maybe<ResolversTypes['CityType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateCityArgs, '_id' | 'country' | 'name'>>;
  updateCityMehfil?: Resolver<Types.Maybe<ResolversTypes['CityMehfilType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateCityMehfilArgs, '_id' | 'cityId' | 'name'>>;
  updateCommittee?: Resolver<Types.Maybe<ResolversTypes['CommitteeType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateCommitteeArgs, 'id' | 'name'>>;
  updateDuty?: Resolver<Types.Maybe<ResolversTypes['DutyType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateDutyArgs, 'id' | 'name'>>;
  updateDutyLocation?: Resolver<Types.Maybe<ResolversTypes['DutyLocationType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateDutyLocationArgs, 'dutyId' | 'id' | 'name'>>;
  updateDutyShift?: Resolver<Types.Maybe<ResolversTypes['DutyShiftType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateDutyShiftArgs, '_id' | 'dutyId' | 'name'>>;
  updateHrKarkun?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateHrKarkunArgs, '_id' | 'name'>>;
  updateIssuanceForm?: Resolver<Types.Maybe<ResolversTypes['IssuanceForm']>, ParentType, ContextType, RequireFields<Types.MutationUpdateIssuanceFormArgs, '_id' | 'issueDate' | 'issuedBy' | 'issuedTo' | 'physicalStoreId'>>;
  updateItemCategory?: Resolver<Types.Maybe<ResolversTypes['ItemCategory']>, ParentType, ContextType, RequireFields<Types.MutationUpdateItemCategoryArgs, '_id' | 'name' | 'physicalStoreId'>>;
  updateJob?: Resolver<Types.Maybe<ResolversTypes['JobType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateJobArgs, 'id' | 'name'>>;
  updateJobDefinitionSchedule?: Resolver<Types.Maybe<ResolversTypes['JobDefinitionType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateJobDefinitionScheduleArgs, '_id' | 'schedule'>>;
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
  updateSecurityServerChannel?: Resolver<Types.Maybe<ResolversTypes['SecurityServerChannelType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateSecurityServerChannelArgs, '_id' | 'connection' | 'enabled' | 'name' | 'recognitionFps'>>;
  updateSecurityServerProfile?: Resolver<Types.Maybe<ResolversTypes['SecurityServerProfileType']>, ParentType, ContextType, RequireFields<Types.MutationUpdateSecurityServerProfileArgs, '_id' | 'isTest' | 'name'>>;
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
  workspaceAbortDocumentUpload?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceAbortDocumentUploadArgs, 'committeeId' | 'uploadId'>>;
  workspaceAbortMeetingAttachmentUpload?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceAbortMeetingAttachmentUploadArgs, 'committeeId' | 'uploadId'>>;
  workspaceAddCommitteeMember?: Resolver<Types.Maybe<ResolversTypes['WorkspaceCommitteeType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceAddCommitteeMemberArgs, 'committeeId' | 'karkunId'>>;
  workspaceAddMeetingAgendaItem?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceAddMeetingAgendaItemArgs, 'committeeId' | 'input' | 'meetingId'>>;
  workspaceAddPollVoters?: Resolver<Types.Maybe<ResolversTypes['WorkspacePollType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceAddPollVotersArgs, 'committeeId' | 'pollId' | 'voterIds'>>;
  workspaceCancelMeeting?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceCancelMeetingArgs, 'committeeId' | 'meetingId'>>;
  workspaceCancelPoll?: Resolver<Types.Maybe<ResolversTypes['WorkspacePollType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceCancelPollArgs, 'committeeId' | 'pollId'>>;
  workspaceCastPollVote?: Resolver<Types.Maybe<ResolversTypes['WorkspacePollType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceCastPollVoteArgs, 'answers' | 'committeeId' | 'pollId'>>;
  workspaceCheckInDocument?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceCheckInDocumentArgs, 'committeeId' | 'documentId'>>;
  workspaceCheckOutDocument?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceCheckOutDocumentArgs, 'committeeId' | 'documentId'>>;
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
  workspaceDeleteDiscussionMessage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Types.MutationWorkspaceDeleteDiscussionMessageArgs, 'committeeId' | 'messageId'>>;
  workspaceDeleteDocumentVersion?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceDeleteDocumentVersionArgs, 'committeeId' | 'documentId' | 'versionId'>>;
  workspaceDeleteMeeting?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceDeleteMeetingArgs, 'committeeId' | 'meetingId'>>;
  workspaceDeleteMeetingActionItem?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceDeleteMeetingActionItemArgs, 'actionItemId' | 'committeeId'>>;
  workspaceDeleteMeetingAttachment?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceDeleteMeetingAttachmentArgs, 'attachmentId' | 'committeeId'>>;
  workspaceDeletePoll?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceDeletePollArgs, 'committeeId' | 'pollId'>>;
  workspaceDocumentDownloadUrl?: Resolver<Types.Maybe<ResolversTypes['WorkspaceDocumentDownloadType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceDocumentDownloadUrlArgs, 'committeeId' | 'documentId'>>;
  workspaceEditDiscussionMessage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Types.MutationWorkspaceEditDiscussionMessageArgs, 'committeeId' | 'messageId' | 'text'>>;
  workspaceEmptyDocumentTrash?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceEmptyDocumentTrashArgs, 'committeeId'>>;
  workspaceForceUnlockDocument?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceForceUnlockDocumentArgs, 'committeeId' | 'documentId'>>;
  workspaceMarkMeetingAttendance?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceMarkMeetingAttendanceArgs, 'committeeId' | 'entries' | 'meetingId'>>;
  workspaceMeetingAttachmentDownloadUrl?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingDownloadType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceMeetingAttachmentDownloadUrlArgs, 'attachmentId' | 'committeeId'>>;
  workspaceMoveDocument?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceMoveDocumentArgs, 'committeeId' | 'documentId'>>;
  workspaceMoveDocumentFolder?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceMoveDocumentFolderArgs, 'committeeId' | 'folderId'>>;
  workspaceOpenPoll?: Resolver<Types.Maybe<ResolversTypes['WorkspacePollType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceOpenPollArgs, 'committeeId' | 'pollId'>>;
  workspacePurgeDocumentTrashItem?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspacePurgeDocumentTrashItemArgs, 'committeeId' | 'itemId'>>;
  workspaceReactToDiscussionMessage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Types.MutationWorkspaceReactToDiscussionMessageArgs, 'committeeId' | 'emoji' | 'messageId' | 'shouldReact'>>;
  workspaceRemoveCommitteeMember?: Resolver<Types.Maybe<ResolversTypes['WorkspaceCommitteeType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceRemoveCommitteeMemberArgs, 'committeeId' | 'karkunId'>>;
  workspaceRemoveMeetingAgendaItem?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceRemoveMeetingAgendaItemArgs, 'agendaItemId' | 'committeeId' | 'meetingId'>>;
  workspaceRenameDocumentFolder?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceRenameDocumentFolderArgs, 'committeeId' | 'folderId' | 'name'>>;
  workspaceReopenMeeting?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceReopenMeetingArgs, 'committeeId' | 'meetingId'>>;
  workspaceReopenPoll?: Resolver<Types.Maybe<ResolversTypes['WorkspacePollType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceReopenPollArgs, 'closesAt' | 'committeeId' | 'pollId'>>;
  workspaceReorderMeetingAgenda?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceReorderMeetingAgendaArgs, 'agendaItemIds' | 'committeeId' | 'meetingId'>>;
  workspaceRespondToMeeting?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceRespondToMeetingArgs, 'committeeId' | 'meetingId' | 'status'>>;
  workspaceRestoreDocumentTrashItem?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceRestoreDocumentTrashItemArgs, 'committeeId' | 'itemId'>>;
  workspaceRestoreDocumentVersion?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceRestoreDocumentVersionArgs, 'committeeId' | 'documentId' | 'versionId'>>;
  workspaceSendDiscussionMessage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Types.MutationWorkspaceSendDiscussionMessageArgs, 'committeeId' | 'text'>>;
  workspaceSetCommitteeMemberDiscussionAccess?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceSetCommitteeMemberDiscussionAccessArgs, 'committeeId' | 'hasAccess' | 'karkunId'>>;
  workspaceSetDiscussionMessagePinned?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Types.MutationWorkspaceSetDiscussionMessagePinnedArgs, 'committeeId' | 'messageId' | 'pinned'>>;
  workspaceSetDiscussionMessageStarred?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<Types.MutationWorkspaceSetDiscussionMessageStarredArgs, 'committeeId' | 'messageId' | 'starred'>>;
  workspaceSetMeetingActionItemStatus?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingActionItemType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceSetMeetingActionItemStatusArgs, 'actionItemId' | 'committeeId' | 'status'>>;
  workspaceSetMeetingMinutes?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceSetMeetingMinutesArgs, 'committeeId' | 'meetingId'>>;
  workspaceSetMeetingParticipantRole?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceSetMeetingParticipantRoleArgs, 'committeeId' | 'meetingId' | 'participantId' | 'role'>>;
  workspaceSetMeetingParticipants?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceSetMeetingParticipantsArgs, 'committeeId' | 'meetingId' | 'participantIds'>>;
  workspaceTrashDocument?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceTrashDocumentArgs, 'committeeId' | 'documentId'>>;
  workspaceTrashDocumentFolder?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceTrashDocumentFolderArgs, 'committeeId' | 'folderId'>>;
  workspaceUpdateDocument?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceUpdateDocumentArgs, 'committeeId' | 'documentId' | 'name'>>;
  workspaceUpdateMeeting?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceUpdateMeetingArgs, 'committeeId' | 'input' | 'meetingId'>>;
  workspaceUpdateMeetingActionItem?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingActionItemType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceUpdateMeetingActionItemArgs, 'actionItemId' | 'committeeId' | 'input'>>;
  workspaceUpdateMeetingAgendaItem?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceUpdateMeetingAgendaItemArgs, 'agendaItemId' | 'committeeId' | 'input' | 'meetingId'>>;
  workspaceUpdatePoll?: Resolver<Types.Maybe<ResolversTypes['WorkspacePollType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceUpdatePollArgs, 'committeeId' | 'input' | 'pollId'>>;
  workspaceWithdrawPollVote?: Resolver<Types.Maybe<ResolversTypes['WorkspacePollType']>, ParentType, ContextType, RequireFields<Types.MutationWorkspaceWithdrawPollVoteArgs, 'committeeId' | 'pollId'>>;
}>;

export type PagedAuditLogTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedAuditLogType'] = ResolversParentTypes['PagedAuditLogType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['AuditLogType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedCityTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedCityType'] = ResolversParentTypes['PagedCityType']> = ResolversObject<{
  data?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['CityType']>>>, ParentType, ContextType>;
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
  ehadKarkun?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  ehadPermissionDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastTarteebDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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
  image?: Resolver<Types.Maybe<ResolversTypes['Attachment']>, ParentType, ContextType>;
  imageId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageThumbnail?: Resolver<Types.Maybe<ResolversTypes['Attachment']>, ParentType, ContextType>;
  imageThumbnailId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  allAccessiblePhysicalStores?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PhysicalStore']>>>, ParentType, ContextType>;
  allCities?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['CityType']>>>, ParentType, ContextType>;
  allCityMehfils?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['CityMehfilType']>>>, ParentType, ContextType>;
  allCommitteeFeatures?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['CommitteeFeatureType']>>>, ParentType, ContextType>;
  allCommittees?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['CommitteeType']>>>, ParentType, ContextType>;
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
  allSecurityServerChannels?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['SecurityServerChannelType']>>>, ParentType, ContextType, Partial<Types.QueryAllSecurityServerChannelsArgs>>;
  allTeams?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['TeamType']>>>, ParentType, ContextType>;
  attachmentsById?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['Attachment']>>>, ParentType, ContextType, RequireFields<Types.QueryAttachmentsByIdArgs, 'ids'>>;
  cityById?: Resolver<Types.Maybe<ResolversTypes['CityType']>, ParentType, ContextType, RequireFields<Types.QueryCityByIdArgs, '_id'>>;
  cityMehfilById?: Resolver<Types.Maybe<ResolversTypes['CityMehfilType']>, ParentType, ContextType, RequireFields<Types.QueryCityMehfilByIdArgs, '_id'>>;
  cityMehfilsByCityId?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['CityMehfilType']>>>, ParentType, ContextType, RequireFields<Types.QueryCityMehfilsByCityIdArgs, 'cityId'>>;
  committeeById?: Resolver<Types.Maybe<ResolversTypes['CommitteeType']>, ParentType, ContextType, RequireFields<Types.QueryCommitteeByIdArgs, 'id'>>;
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
  dutyLocationById?: Resolver<Types.Maybe<ResolversTypes['DutyLocationType']>, ParentType, ContextType, RequireFields<Types.QueryDutyLocationByIdArgs, 'id'>>;
  dutyLocationsByDutyId?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DutyLocationType']>>>, ParentType, ContextType, RequireFields<Types.QueryDutyLocationsByDutyIdArgs, 'dutyId'>>;
  dutyPlanDays?: Resolver<Types.Maybe<ResolversTypes['DutyPlanDaysType']>, ParentType, ContextType, RequireFields<Types.QueryDutyPlanDaysArgs, 'dutyId' | 'locationId' | 'startDate'>>;
  dutyPlanWeek?: Resolver<Types.Maybe<ResolversTypes['DutyPlanWeekType']>, ParentType, ContextType, RequireFields<Types.QueryDutyPlanWeekArgs, 'dutyId' | 'locationId'>>;
  dutyShiftById?: Resolver<Types.Maybe<ResolversTypes['DutyShiftType']>, ParentType, ContextType, RequireFields<Types.QueryDutyShiftByIdArgs, 'id'>>;
  faceVectors?: Resolver<Array<ResolversTypes['FaceVectorRecord']>, ParentType, ContextType, Partial<Types.QueryFaceVectorsArgs>>;
  hrCommitteeOptions?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['CommitteeType']>>>, ParentType, ContextType>;
  hrKarkunById?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.QueryHrKarkunByIdArgs, '_id'>>;
  hrKarkunsById?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['PersonType']>>>, ParentType, ContextType, RequireFields<Types.QueryHrKarkunsByIdArgs, '_ids'>>;
  inboxConversation?: Resolver<Types.Maybe<ResolversTypes['InboxConversationDetailType']>, ParentType, ContextType, RequireFields<Types.QueryInboxConversationArgs, 'roomId'>>;
  inventoryStatistics?: Resolver<Types.Maybe<ResolversTypes['InventoryStatistics']>, ParentType, ContextType, RequireFields<Types.QueryInventoryStatisticsArgs, 'physicalStoreId'>>;
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
  myCommittees?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceCommitteeType']>>>, ParentType, ContextType>;
  pagedCities?: Resolver<Types.Maybe<ResolversTypes['PagedCityType']>, ParentType, ContextType, Partial<Types.QueryPagedCitiesArgs>>;
  pagedDeletedPeople?: Resolver<Types.Maybe<ResolversTypes['PagedPeopleType']>, ParentType, ContextType, Partial<Types.QueryPagedDeletedPeopleArgs>>;
  pagedHrAuditLogs?: Resolver<Types.Maybe<ResolversTypes['PagedAuditLogType']>, ParentType, ContextType, Partial<Types.QueryPagedHrAuditLogsArgs>>;
  pagedHrKarkuns?: Resolver<Types.Maybe<ResolversTypes['PagedKarkunType']>, ParentType, ContextType, Partial<Types.QueryPagedHrKarkunsArgs>>;
  pagedInboxConversations?: Resolver<Types.Maybe<ResolversTypes['PagedInboxConversationType']>, ParentType, ContextType, Partial<Types.QueryPagedInboxConversationsArgs>>;
  pagedIssuanceForms?: Resolver<Types.Maybe<ResolversTypes['PagedIssuanceForm']>, ParentType, ContextType, RequireFields<Types.QueryPagedIssuanceFormsArgs, 'physicalStoreId'>>;
  pagedJobLogs?: Resolver<Types.Maybe<ResolversTypes['PagedJobLogsType']>, ParentType, ContextType, Partial<Types.QueryPagedJobLogsArgs>>;
  pagedPeople?: Resolver<Types.Maybe<ResolversTypes['PagedPeopleType']>, ParentType, ContextType, Partial<Types.QueryPagedPeopleArgs>>;
  pagedPurchaseForms?: Resolver<Types.Maybe<ResolversTypes['PagedPurchaseForm']>, ParentType, ContextType, RequireFields<Types.QueryPagedPurchaseFormsArgs, 'physicalStoreId'>>;
  pagedSalariesByKarkun?: Resolver<Types.Maybe<ResolversTypes['PagedSalaryType']>, ParentType, ContextType, Partial<Types.QueryPagedSalariesByKarkunArgs>>;
  pagedScheduledJobs?: Resolver<Types.Maybe<ResolversTypes['PagedScheduledJobsType']>, ParentType, ContextType, Partial<Types.QueryPagedScheduledJobsArgs>>;
  pagedSecurityAuditLogs?: Resolver<Types.Maybe<ResolversTypes['PagedAuditLogType']>, ParentType, ContextType, Partial<Types.QueryPagedSecurityAuditLogsArgs>>;
  pagedSecurityLogs?: Resolver<Types.Maybe<ResolversTypes['PagedSecurityLogType']>, ParentType, ContextType, Partial<Types.QueryPagedSecurityLogsArgs>>;
  pagedSecurityServerAlertGroups?: Resolver<Types.Maybe<ResolversTypes['PagedSecurityServerAlertGroupType']>, ParentType, ContextType, Partial<Types.QueryPagedSecurityServerAlertGroupsArgs>>;
  pagedSecurityServerAlerts?: Resolver<Types.Maybe<ResolversTypes['PagedSecurityServerAlertType']>, ParentType, ContextType, Partial<Types.QueryPagedSecurityServerAlertsArgs>>;
  pagedSecurityServerProfiles?: Resolver<Types.Maybe<ResolversTypes['PagedSecurityServerProfileType']>, ParentType, ContextType, Partial<Types.QueryPagedSecurityServerProfilesArgs>>;
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
  securityFaceVectorFromImage?: Resolver<Types.Maybe<ResolversTypes['FaceVectorResultType']>, ParentType, ContextType, RequireFields<Types.QuerySecurityFaceVectorFromImageArgs, 'imageData'>>;
  securityLogUsers?: Resolver<Array<ResolversTypes['SecurityLogUserOption']>, ParentType, ContextType, Partial<Types.QuerySecurityLogUsersArgs>>;
  securityMehfilDutyById?: Resolver<Types.Maybe<ResolversTypes['MehfilDutyType']>, ParentType, ContextType, RequireFields<Types.QuerySecurityMehfilDutyByIdArgs, 'id'>>;
  securityMehfilLangarDishById?: Resolver<Types.Maybe<ResolversTypes['MehfilLangarDishType']>, ParentType, ContextType, RequireFields<Types.QuerySecurityMehfilLangarDishByIdArgs, 'id'>>;
  securityMehfilLangarLocationById?: Resolver<Types.Maybe<ResolversTypes['MehfilLangarLocationType']>, ParentType, ContextType, RequireFields<Types.QuerySecurityMehfilLangarLocationByIdArgs, 'id'>>;
  securityServerAlertById?: Resolver<Types.Maybe<ResolversTypes['SecurityServerAlertType']>, ParentType, ContextType, RequireFields<Types.QuerySecurityServerAlertByIdArgs, '_id'>>;
  securityServerAlertSyncStatus?: Resolver<Types.Maybe<ResolversTypes['SecurityServerAlertSyncStatusType']>, ParentType, ContextType>;
  securityServerChannelById?: Resolver<Types.Maybe<ResolversTypes['SecurityServerChannelType']>, ParentType, ContextType, RequireFields<Types.QuerySecurityServerChannelByIdArgs, '_id'>>;
  securityServerProfileById?: Resolver<Types.Maybe<ResolversTypes['SecurityServerProfileType']>, ParentType, ContextType, RequireFields<Types.QuerySecurityServerProfileByIdArgs, '_id'>>;
  securityServerUsageStats?: Resolver<Types.Maybe<ResolversTypes['SecurityServerUsageSummaryType']>, ParentType, ContextType, RequireFields<Types.QuerySecurityServerUsageStatsArgs, 'minutes'>>;
  securityVisitorByCnic?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.QuerySecurityVisitorByCnicArgs, 'cnicNumbers'>>;
  securityVisitorByCnicOrContactNumber?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, Partial<Types.QuerySecurityVisitorByCnicOrContactNumberArgs>>;
  securityVisitorById?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType, RequireFields<Types.QuerySecurityVisitorByIdArgs, '_id'>>;
  securityVisitorsByFaceVector?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['VisitorFaceMatchType']>>>, ParentType, ContextType, RequireFields<Types.QuerySecurityVisitorsByFaceVectorArgs, 'vector'>>;
  stockAdjustmentById?: Resolver<Types.Maybe<ResolversTypes['StockAdjustment']>, ParentType, ContextType, RequireFields<Types.QueryStockAdjustmentByIdArgs, '_id' | 'physicalStoreId'>>;
  stockAdjustmentsByStockItem?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['StockAdjustment']>>>, ParentType, ContextType, RequireFields<Types.QueryStockAdjustmentsByStockItemArgs, 'physicalStoreId' | 'stockItemId'>>;
  stockItemById?: Resolver<Types.Maybe<ResolversTypes['StockItem']>, ParentType, ContextType, RequireFields<Types.QueryStockItemByIdArgs, '_id' | 'physicalStoreId'>>;
  stockItemsById?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['StockItem']>>>, ParentType, ContextType, RequireFields<Types.QueryStockItemsByIdArgs, '_ids' | 'physicalStoreId'>>;
  teamById?: Resolver<Types.Maybe<ResolversTypes['TeamType']>, ParentType, ContextType, RequireFields<Types.QueryTeamByIdArgs, 'id'>>;
  userById?: Resolver<Types.Maybe<ResolversTypes['UserType']>, ParentType, ContextType, Partial<Types.QueryUserByIdArgs>>;
  userGroupById?: Resolver<Types.Maybe<ResolversTypes['UserGroupType']>, ParentType, ContextType, RequireFields<Types.QueryUserGroupByIdArgs, '_id'>>;
  userNames?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType, Partial<Types.QueryUserNamesArgs>>;
  vendorById?: Resolver<Types.Maybe<ResolversTypes['Vendor']>, ParentType, ContextType, RequireFields<Types.QueryVendorByIdArgs, '_id' | 'physicalStoreId'>>;
  vendorsByPhysicalStoreId?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['Vendor']>>>, ParentType, ContextType, RequireFields<Types.QueryVendorsByPhysicalStoreIdArgs, 'physicalStoreId'>>;
  visitorStayById?: Resolver<Types.Maybe<ResolversTypes['VisitorStayType']>, ParentType, ContextType, RequireFields<Types.QueryVisitorStayByIdArgs, '_id'>>;
  workspaceCommitteeById?: Resolver<Types.Maybe<ResolversTypes['WorkspaceCommitteeType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceCommitteeByIdArgs, 'committeeId'>>;
  workspaceCommitteeKarkunSearch?: Resolver<Types.Maybe<ResolversTypes['PagedWorkspaceKarkunType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceCommitteeKarkunSearchArgs, 'committeeId'>>;
  workspaceDiscussionInfo?: Resolver<Types.Maybe<ResolversTypes['DiscussionInfoType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDiscussionInfoArgs, 'committeeId'>>;
  workspaceDiscussionMembers?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DiscussionMemberType']>>>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDiscussionMembersArgs, 'committeeId'>>;
  workspaceDiscussionOlderMessages?: Resolver<Types.Maybe<ResolversTypes['DiscussionMessagePageType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDiscussionOlderMessagesArgs, 'before' | 'committeeId'>>;
  workspaceDiscussionPinnedMessages?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DiscussionMessageType']>>>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDiscussionPinnedMessagesArgs, 'committeeId'>>;
  workspaceDiscussionSearchMessages?: Resolver<Types.Maybe<ResolversTypes['DiscussionMessagePageType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDiscussionSearchMessagesArgs, 'committeeId' | 'searchText'>>;
  workspaceDiscussionStarredMessages?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DiscussionMessageType']>>>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDiscussionStarredMessagesArgs, 'committeeId'>>;
  workspaceDiscussionSync?: Resolver<Types.Maybe<ResolversTypes['DiscussionSyncType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDiscussionSyncArgs, 'committeeId'>>;
  workspaceDiscussionThreadMessages?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['DiscussionMessageType']>>>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceDiscussionThreadMessagesArgs, 'committeeId' | 'threadId'>>;
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
  workspaceMeetings?: Resolver<Types.Maybe<ResolversTypes['PagedWorkspaceMeetingType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceMeetingsArgs, 'committeeId'>>;
  workspaceMeetingsInfo?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMeetingsInfoType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceMeetingsInfoArgs, 'committeeId'>>;
  workspaceMonitoringAlerts?: Resolver<Types.Maybe<ResolversTypes['PagedWorkspaceMonitoringAlertType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceMonitoringAlertsArgs, 'committeeId' | 'date'>>;
  workspaceMonitoringProfileById?: Resolver<Types.Maybe<ResolversTypes['WorkspaceMonitoringProfileType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceMonitoringProfileByIdArgs, 'committeeId' | 'profileId'>>;
  workspaceMonitoringProfiles?: Resolver<Types.Maybe<ResolversTypes['PagedWorkspaceMonitoringProfileType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceMonitoringProfilesArgs, 'committeeId'>>;
  workspaceNightStayById?: Resolver<Types.Maybe<ResolversTypes['WorkspaceNightStayType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceNightStayByIdArgs, 'committeeId' | 'stayId'>>;
  workspaceNightStays?: Resolver<Types.Maybe<ResolversTypes['PagedWorkspaceNightStayType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspaceNightStaysArgs, 'committeeId' | 'stayDate'>>;
  workspacePollActivity?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspacePollActivityType']>>>, ParentType, ContextType, RequireFields<Types.QueryWorkspacePollActivityArgs, 'committeeId'>>;
  workspacePollById?: Resolver<Types.Maybe<ResolversTypes['WorkspacePollType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspacePollByIdArgs, 'committeeId' | 'pollId'>>;
  workspacePollMembers?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspacePollMemberType']>>>, ParentType, ContextType, RequireFields<Types.QueryWorkspacePollMembersArgs, 'committeeId'>>;
  workspacePollResults?: Resolver<Types.Maybe<ResolversTypes['WorkspacePollResultsType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspacePollResultsArgs, 'committeeId' | 'pollId'>>;
  workspacePollVoters?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspacePollVoterType']>>>, ParentType, ContextType, RequireFields<Types.QueryWorkspacePollVotersArgs, 'committeeId' | 'pollId'>>;
  workspacePolls?: Resolver<Types.Maybe<ResolversTypes['PagedWorkspacePollType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspacePollsArgs, 'committeeId'>>;
  workspacePollsInfo?: Resolver<Types.Maybe<ResolversTypes['WorkspacePollsInfoType']>, ParentType, ContextType, RequireFields<Types.QueryWorkspacePollsInfoArgs, 'committeeId'>>;
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

export type TeamMemberTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['TeamMemberType'] = ResolversParentTypes['TeamMemberType']> = ResolversObject<{
  daysOfWeek?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  isCoordinator?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  karkun?: Resolver<Types.Maybe<ResolversTypes['PersonType']>, ParentType, ContextType>;
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
  hasChatAccount?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
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
}>;

export type WorkspaceCommitteeTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceCommitteeType'] = ResolversParentTypes['WorkspaceCommitteeType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  canManageMembers?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  color?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  features?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  members?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceCommitteeMemberType']>>>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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
  onlineUrl?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  openActionItemCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  participants?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspaceMeetingParticipantType']>>>, ParentType, ContextType>;
  startsAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  timeZone?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedByName?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceMeetingUploadTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceMeetingUploadType'] = ResolversParentTypes['WorkspaceMeetingUploadType']> = ResolversObject<{
  contentType?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expiresAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uploadId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type WorkspaceMeetingsInfoTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceMeetingsInfoType'] = ResolversParentTypes['WorkspaceMeetingsInfoType']> = ResolversObject<{
  canManage?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  maxFileSize?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  myParticipantId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  timeZone?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type WorkspacePollMemberTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspacePollMemberType'] = ResolversParentTypes['WorkspacePollMemberType']> = ResolversObject<{
  isCoordinator?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  voterId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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
  eligibleCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  nonVoters?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspacePollVoterType']>>>, ParentType, ContextType>;
  pollId?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  questions?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspacePollQuestionResultType']>>>, ParentType, ContextType>;
  status?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  totalVoters?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  turnout?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
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
  eligibleCount?: Resolver<Types.Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  eligibleVoterIds?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  hasVoted?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isEligible?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  myAnswers?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspacePollAnswerType']>>>, ParentType, ContextType>;
  openedAt?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  questions?: Resolver<Types.Maybe<Array<Types.Maybe<ResolversTypes['WorkspacePollQuestionType']>>>, ParentType, ContextType>;
  showResultsWhileOpen?: Resolver<Types.Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
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

export type WorkspaceStayHistoryItemTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceStayHistoryItemType'] = ResolversParentTypes['WorkspaceStayHistoryItemType']> = ResolversObject<{
  _id?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fromDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  numOfDays?: Resolver<Types.Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  stayReason?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  toDate?: Resolver<Types.Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  Attachment?: AttachmentResolvers<ContextType>;
  AuditLogType?: AuditLogTypeResolvers<ContextType>;
  CityMehfilType?: CityMehfilTypeResolvers<ContextType>;
  CityType?: CityTypeResolvers<ContextType>;
  CommitteeFeatureType?: CommitteeFeatureTypeResolvers<ContextType>;
  CommitteeMemberType?: CommitteeMemberTypeResolvers<ContextType>;
  CommitteeType?: CommitteeTypeResolvers<ContextType>;
  Currency?: GraphQLScalarType;
  Date?: GraphQLScalarType;
  DateTime?: GraphQLScalarType;
  DiscussionAttachmentType?: DiscussionAttachmentTypeResolvers<ContextType>;
  DiscussionInfoType?: DiscussionInfoTypeResolvers<ContextType>;
  DiscussionMemberType?: DiscussionMemberTypeResolvers<ContextType>;
  DiscussionMessagePageType?: DiscussionMessagePageTypeResolvers<ContextType>;
  DiscussionMessageType?: DiscussionMessageTypeResolvers<ContextType>;
  DiscussionReactionType?: DiscussionReactionTypeResolvers<ContextType>;
  DiscussionSyncType?: DiscussionSyncTypeResolvers<ContextType>;
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
  FaceVectorRecord?: FaceVectorRecordResolvers<ContextType>;
  FaceVectorResultType?: FaceVectorResultTypeResolvers<ContextType>;
  InboxAttachmentType?: InboxAttachmentTypeResolvers<ContextType>;
  InboxConversationDetailType?: InboxConversationDetailTypeResolvers<ContextType>;
  InboxConversationType?: InboxConversationTypeResolvers<ContextType>;
  InboxMessageType?: InboxMessageTypeResolvers<ContextType>;
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
  Location?: LocationResolvers<ContextType>;
  MehfilDutyType?: MehfilDutyTypeResolvers<ContextType>;
  MehfilKarkunType?: MehfilKarkunTypeResolvers<ContextType>;
  MehfilLangarDishType?: MehfilLangarDishTypeResolvers<ContextType>;
  MehfilLangarLocationType?: MehfilLangarLocationTypeResolvers<ContextType>;
  MehfilType?: MehfilTypeResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  PagedAuditLogType?: PagedAuditLogTypeResolvers<ContextType>;
  PagedCityType?: PagedCityTypeResolvers<ContextType>;
  PagedInboxConversationType?: PagedInboxConversationTypeResolvers<ContextType>;
  PagedIssuanceForm?: PagedIssuanceFormResolvers<ContextType>;
  PagedJobLogsType?: PagedJobLogsTypeResolvers<ContextType>;
  PagedKarkunType?: PagedKarkunTypeResolvers<ContextType>;
  PagedPeopleType?: PagedPeopleTypeResolvers<ContextType>;
  PagedPurchaseForm?: PagedPurchaseFormResolvers<ContextType>;
  PagedSalaryType?: PagedSalaryTypeResolvers<ContextType>;
  PagedScheduledJobsType?: PagedScheduledJobsTypeResolvers<ContextType>;
  PagedSecurityLogType?: PagedSecurityLogTypeResolvers<ContextType>;
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
  PeopleTagType?: PeopleTagTypeResolvers<ContextType>;
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
  Query?: QueryResolvers<ContextType>;
  SalaryType?: SalaryTypeResolvers<ContextType>;
  ScheduledJobType?: ScheduledJobTypeResolvers<ContextType>;
  SecurityLogType?: SecurityLogTypeResolvers<ContextType>;
  SecurityLogUserOption?: SecurityLogUserOptionResolvers<ContextType>;
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
  StockAdjustment?: StockAdjustmentResolvers<ContextType>;
  StockItem?: StockItemResolvers<ContextType>;
  TeamMemberType?: TeamMemberTypeResolvers<ContextType>;
  TeamType?: TeamTypeResolvers<ContextType>;
  Time?: GraphQLScalarType;
  Timestamp?: GraphQLScalarType;
  URL?: GraphQLScalarType;
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
  WorkspaceMeetingActionItemType?: WorkspaceMeetingActionItemTypeResolvers<ContextType>;
  WorkspaceMeetingActivityType?: WorkspaceMeetingActivityTypeResolvers<ContextType>;
  WorkspaceMeetingAgendaItemType?: WorkspaceMeetingAgendaItemTypeResolvers<ContextType>;
  WorkspaceMeetingAttachmentType?: WorkspaceMeetingAttachmentTypeResolvers<ContextType>;
  WorkspaceMeetingDownloadType?: WorkspaceMeetingDownloadTypeResolvers<ContextType>;
  WorkspaceMeetingMemberType?: WorkspaceMeetingMemberTypeResolvers<ContextType>;
  WorkspaceMeetingParticipantType?: WorkspaceMeetingParticipantTypeResolvers<ContextType>;
  WorkspaceMeetingType?: WorkspaceMeetingTypeResolvers<ContextType>;
  WorkspaceMeetingUploadType?: WorkspaceMeetingUploadTypeResolvers<ContextType>;
  WorkspaceMeetingsInfoType?: WorkspaceMeetingsInfoTypeResolvers<ContextType>;
  WorkspaceMonitoringAlertType?: WorkspaceMonitoringAlertTypeResolvers<ContextType>;
  WorkspaceMonitoringProfilePhotoType?: WorkspaceMonitoringProfilePhotoTypeResolvers<ContextType>;
  WorkspaceMonitoringProfileType?: WorkspaceMonitoringProfileTypeResolvers<ContextType>;
  WorkspaceNightStayType?: WorkspaceNightStayTypeResolvers<ContextType>;
  WorkspacePollActivityType?: WorkspacePollActivityTypeResolvers<ContextType>;
  WorkspacePollAnswerType?: WorkspacePollAnswerTypeResolvers<ContextType>;
  WorkspacePollMemberType?: WorkspacePollMemberTypeResolvers<ContextType>;
  WorkspacePollOptionResultType?: WorkspacePollOptionResultTypeResolvers<ContextType>;
  WorkspacePollOptionType?: WorkspacePollOptionTypeResolvers<ContextType>;
  WorkspacePollQuestionResultType?: WorkspacePollQuestionResultTypeResolvers<ContextType>;
  WorkspacePollQuestionType?: WorkspacePollQuestionTypeResolvers<ContextType>;
  WorkspacePollResultsType?: WorkspacePollResultsTypeResolvers<ContextType>;
  WorkspacePollType?: WorkspacePollTypeResolvers<ContextType>;
  WorkspacePollVoterType?: WorkspacePollVoterTypeResolvers<ContextType>;
  WorkspacePollsInfoType?: WorkspacePollsInfoTypeResolvers<ContextType>;
  WorkspaceStayHistoryItemType?: WorkspaceStayHistoryItemTypeResolvers<ContextType>;
}>;

export type DirectiveResolvers<ContextType = any> = ResolversObject<{
  checkInstanceAccess?: CheckInstanceAccessDirectiveResolver<any, any, ContextType>;
  checkPermissions?: CheckPermissionsDirectiveResolver<any, any, ContextType>;
}>;
