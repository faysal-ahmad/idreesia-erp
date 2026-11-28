export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Currency: { input: unknown; output: unknown; }
  Date: { input: unknown; output: unknown; }
  DateTime: { input: unknown; output: unknown; }
  EmailAddress: { input: unknown; output: unknown; }
  JSON: { input: unknown; output: unknown; }
  JSONObject: { input: unknown; output: unknown; }
  PhoneNumber: { input: unknown; output: unknown; }
  PostalCode: { input: unknown; output: unknown; }
  Time: { input: unknown; output: unknown; }
  Timestamp: { input: unknown; output: unknown; }
  URL: { input: unknown; output: unknown; }
  UtcOffset: { input: unknown; output: unknown; }
};

export type AdminKarkunLocationType = {
  __typename?: 'AdminKarkunLocationType';
  _id?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  parentId?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type Attachment = {
  __typename?: 'Attachment';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  data?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  mimeType?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type AuditLogFilter = {
  entityId?: InputMaybe<Scalars['String']['input']>;
  operationBy?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
};

export type AuditLogType = {
  __typename?: 'AuditLogType';
  _id?: Maybe<Scalars['String']['output']>;
  auditValues?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  entityId?: Maybe<Scalars['String']['output']>;
  entityType?: Maybe<Scalars['String']['output']>;
  operationBy?: Maybe<Scalars['String']['output']>;
  operationByImageThumbnailUrl?: Maybe<Scalars['String']['output']>;
  operationByImageUrl?: Maybe<Scalars['String']['output']>;
  operationByName?: Maybe<Scalars['String']['output']>;
  operationTime?: Maybe<Scalars['String']['output']>;
  operationType?: Maybe<Scalars['String']['output']>;
};

export type CityFilter = {
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  peripheryOf?: InputMaybe<Scalars['String']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
};

export type CityMehfilType = {
  __typename?: 'CityMehfilType';
  _id?: Maybe<Scalars['String']['output']>;
  address?: Maybe<Scalars['String']['output']>;
  cityId?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  karkunCount?: Maybe<Scalars['Int']['output']>;
  lcdAvailability?: Maybe<Scalars['Boolean']['output']>;
  mehfilStartYear?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  otherMehfilDetails?: Maybe<Scalars['String']['output']>;
  tabAvailability?: Maybe<Scalars['Boolean']['output']>;
  timingDetails?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type CityType = {
  __typename?: 'CityType';
  _id?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  karkunCount?: Maybe<Scalars['Int']['output']>;
  mehfils?: Maybe<Array<Maybe<CityMehfilType>>>;
  memberCount?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  peripheryOf?: Maybe<Scalars['String']['output']>;
  peripheryOfCity?: Maybe<CityType>;
  region?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type CommitteeBasicType = {
  __typename?: 'CommitteeBasicType';
  _id?: Maybe<Scalars['String']['output']>;
  color?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type CommitteeFeatureType = {
  __typename?: 'CommitteeFeatureType';
  category?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  key?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type CommitteeMemberType = {
  __typename?: 'CommitteeMemberType';
  hasChatAccount?: Maybe<Scalars['Boolean']['output']>;
  hasDiscussionAccess?: Maybe<Scalars['Boolean']['output']>;
  hasLoginAccount?: Maybe<Scalars['Boolean']['output']>;
  isCoordinator?: Maybe<Scalars['Boolean']['output']>;
  karkun?: Maybe<PersonBasicType>;
  karkunId?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Scalars['String']['output']>;
};

export type CommitteeMembersPageType = {
  __typename?: 'CommitteeMembersPageType';
  data?: Maybe<Array<Maybe<CommitteeMemberType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export enum CommitteeRole {
  Coordinator = 'COORDINATOR',
  Guest = 'GUEST',
  Member = 'MEMBER',
  Observer = 'OBSERVER'
}

export type CommitteeType = {
  __typename?: 'CommitteeType';
  _id?: Maybe<Scalars['String']['output']>;
  color?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  features?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  guestCount?: Maybe<Scalars['Int']['output']>;
  locationId?: Maybe<Scalars['String']['output']>;
  memberCount?: Maybe<Scalars['Int']['output']>;
  members?: Maybe<Array<Maybe<CommitteeMemberType>>>;
  name?: Maybe<Scalars['String']['output']>;
  observerCount?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type DaAccessType = {
  __typename?: 'DaAccessType';
  locationId: Scalars['String']['output'];
  permissions: Array<Scalars['String']['output']>;
};

export type DaAttendanceSheetRowType = {
  __typename?: 'DaAttendanceSheetRowType';
  _id: Scalars['String']['output'];
  absentCount: Scalars['Int']['output'];
  daysOnDuty: Scalars['Int']['output'];
  dutyId: Scalars['String']['output'];
  dutyName?: Maybe<Scalars['String']['output']>;
  karkunId: Scalars['String']['output'];
  lateCount: Scalars['Int']['output'];
  month: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  percentage: Scalars['Int']['output'];
  presentCount: Scalars['Int']['output'];
  unmarkedCount: Scalars['Int']['output'];
};

export type DaDutyMemberType = {
  __typename?: 'DaDutyMemberType';
  canMarkOwnAttendance?: Maybe<Scalars['Boolean']['output']>;
  daysOfWeek?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  isCoordinator?: Maybe<Scalars['Boolean']['output']>;
  karkun?: Maybe<PersonBasicType>;
  karkunId: Scalars['String']['output'];
};

export type DaDutyType = {
  __typename?: 'DaDutyType';
  _id: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  locationId: Scalars['String']['output'];
  mehfilDutyId?: Maybe<Scalars['String']['output']>;
  members: Array<Maybe<DaDutyMemberType>>;
  name: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type DaGeoLocationInput = {
  accuracy?: InputMaybe<Scalars['Float']['input']>;
  latitude: Scalars['Float']['input'];
  longitude: Scalars['Float']['input'];
};

export type DaMehfilDutyType = {
  __typename?: 'DaMehfilDutyType';
  _id: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type DaMyDutyType = {
  __typename?: 'DaMyDutyType';
  attendance?: Maybe<Scalars['String']['output']>;
  attendanceSource?: Maybe<Scalars['String']['output']>;
  canMarkOwnAttendance: Scalars['Boolean']['output'];
  date: Scalars['String']['output'];
  dutyId: Scalars['String']['output'];
  dutyName: Scalars['String']['output'];
  locationId: Scalars['String']['output'];
  locationName: Scalars['String']['output'];
};

export type DaMyLocationType = {
  __typename?: 'DaMyLocationType';
  hasWorkspace: Scalars['Boolean']['output'];
  locationId: Scalars['String']['output'];
  name: Scalars['String']['output'];
  parentId?: Maybe<Scalars['String']['output']>;
  permissions: Array<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type DaPlanDayType = {
  __typename?: 'DaPlanDayType';
  absentKarkunIds: Array<Maybe<Scalars['String']['output']>>;
  addedKarkunIds: Array<Maybe<Scalars['String']['output']>>;
  date: Scalars['String']['output'];
  dayOfWeek: Scalars['String']['output'];
  karkuns: Array<Maybe<DaPlanKarkunType>>;
  locked: Scalars['Boolean']['output'];
};

export type DaPlanDaysType = {
  __typename?: 'DaPlanDaysType';
  days: Array<Maybe<DaPlanDayType>>;
  startDate: Scalars['String']['output'];
};

export type DaPlanKarkunType = {
  __typename?: 'DaPlanKarkunType';
  addedForDay: Scalars['Boolean']['output'];
  attendance?: Maybe<Scalars['String']['output']>;
  contactNumber1?: Maybe<Scalars['String']['output']>;
  contactNumber2?: Maybe<Scalars['String']['output']>;
  imageThumbnailUrl?: Maybe<Scalars['String']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  karkunId: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  off: Scalars['Boolean']['output'];
};

export type DiscussionAttachmentType = {
  __typename?: 'DiscussionAttachmentType';
  kind?: Maybe<Scalars['String']['output']>;
  mimeType?: Maybe<Scalars['String']['output']>;
  size?: Maybe<Scalars['Int']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type DiscussionInfoType = {
  __typename?: 'DiscussionInfoType';
  canPin?: Maybe<Scalars['Boolean']['output']>;
  canPost?: Maybe<Scalars['Boolean']['output']>;
};

export type DiscussionMemberType = {
  __typename?: 'DiscussionMemberType';
  imageThumbnailUrl?: Maybe<Scalars['String']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  username?: Maybe<Scalars['String']['output']>;
};

export type DiscussionMessagePageType = {
  __typename?: 'DiscussionMessagePageType';
  hasMore?: Maybe<Scalars['Boolean']['output']>;
  messages?: Maybe<Array<Maybe<DiscussionMessageType>>>;
};

export type DiscussionMessageType = {
  __typename?: 'DiscussionMessageType';
  _id?: Maybe<Scalars['String']['output']>;
  attachments?: Maybe<Array<Maybe<DiscussionAttachmentType>>>;
  editedAt?: Maybe<Scalars['String']['output']>;
  isOwn?: Maybe<Scalars['Boolean']['output']>;
  isPinned?: Maybe<Scalars['Boolean']['output']>;
  isStarred?: Maybe<Scalars['Boolean']['output']>;
  isSystem?: Maybe<Scalars['Boolean']['output']>;
  reactions?: Maybe<Array<Maybe<DiscussionReactionType>>>;
  senderId?: Maybe<Scalars['String']['output']>;
  senderImageThumbnailUrl?: Maybe<Scalars['String']['output']>;
  senderImageUrl?: Maybe<Scalars['String']['output']>;
  senderName?: Maybe<Scalars['String']['output']>;
  sentAt?: Maybe<Scalars['String']['output']>;
  showInMainList?: Maybe<Scalars['Boolean']['output']>;
  text?: Maybe<Scalars['String']['output']>;
  threadId?: Maybe<Scalars['String']['output']>;
  threadLastReplyAt?: Maybe<Scalars['String']['output']>;
  threadReplyCount?: Maybe<Scalars['Int']['output']>;
};

export type DiscussionReactionType = {
  __typename?: 'DiscussionReactionType';
  count?: Maybe<Scalars['Int']['output']>;
  emoji?: Maybe<Scalars['String']['output']>;
  reactedByMe?: Maybe<Scalars['Boolean']['output']>;
  usernames?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type DiscussionSyncType = {
  __typename?: 'DiscussionSyncType';
  deletedIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  hasOlder?: Maybe<Scalars['Boolean']['output']>;
  messages?: Maybe<Array<Maybe<DiscussionMessageType>>>;
  syncedAt?: Maybe<Scalars['String']['output']>;
};

export type DiscussionVideoCallInfoType = {
  __typename?: 'DiscussionVideoCallInfoType';
  participantCount?: Maybe<Scalars['Int']['output']>;
};

export type DiscussionVideoCallType = {
  __typename?: 'DiscussionVideoCallType';
  url: Scalars['String']['output'];
};

export type DuplicatePersonGroupType = {
  __typename?: 'DuplicatePersonGroupType';
  count?: Maybe<Scalars['Int']['output']>;
  people?: Maybe<Array<Maybe<DuplicatePersonSummaryType>>>;
  value?: Maybe<Scalars['String']['output']>;
};

export type DuplicatePersonSummaryType = {
  __typename?: 'DuplicatePersonSummaryType';
  _id?: Maybe<Scalars['String']['output']>;
  cnicNumber?: Maybe<Scalars['String']['output']>;
  contactNumber1?: Maybe<Scalars['String']['output']>;
  contactNumber2?: Maybe<Scalars['String']['output']>;
  imageThumbnailUrl?: Maybe<Scalars['String']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export enum DutiesAttendancePermission {
  ManageAndPlanDuties = 'MANAGE_AND_PLAN_DUTIES',
  MarkAttendance = 'MARK_ATTENDANCE',
  View = 'VIEW'
}

export type DutyAttendanceCardType = {
  __typename?: 'DutyAttendanceCardType';
  _id?: Maybe<Scalars['String']['output']>;
  absentCount?: Maybe<Scalars['Int']['output']>;
  barcodeId?: Maybe<Scalars['String']['output']>;
  daysOnDuty?: Maybe<Scalars['Int']['output']>;
  duty?: Maybe<DutyType>;
  dutyId?: Maybe<Scalars['String']['output']>;
  karkun?: Maybe<PersonType>;
  karkunId?: Maybe<Scalars['String']['output']>;
  lateCount?: Maybe<Scalars['Int']['output']>;
  month?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  percentage?: Maybe<Scalars['Int']['output']>;
  presentCount?: Maybe<Scalars['Int']['output']>;
  shiftNames?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  unmarkedCount?: Maybe<Scalars['Int']['output']>;
};

export type DutyAttendanceSheetRowType = {
  __typename?: 'DutyAttendanceSheetRowType';
  _id?: Maybe<Scalars['String']['output']>;
  absentCount?: Maybe<Scalars['Int']['output']>;
  barcodeId?: Maybe<Scalars['String']['output']>;
  daysOnDuty?: Maybe<Scalars['Int']['output']>;
  duty?: Maybe<DutyType>;
  dutyId?: Maybe<Scalars['String']['output']>;
  karkun?: Maybe<PersonType>;
  karkunId?: Maybe<Scalars['String']['output']>;
  lateCount?: Maybe<Scalars['Int']['output']>;
  location?: Maybe<DutyLocationType>;
  locationId?: Maybe<Scalars['String']['output']>;
  month?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  percentage?: Maybe<Scalars['Int']['output']>;
  presentCount?: Maybe<Scalars['Int']['output']>;
  shiftId?: Maybe<Scalars['String']['output']>;
  shiftName?: Maybe<Scalars['String']['output']>;
  unmarkedCount?: Maybe<Scalars['Int']['output']>;
};

export type DutyLocationType = {
  __typename?: 'DutyLocationType';
  _id?: Maybe<Scalars['String']['output']>;
  canDelete?: Maybe<Scalars['Boolean']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  duty?: Maybe<DutyType>;
  dutyId?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type DutyPlanDaysDayType = {
  __typename?: 'DutyPlanDaysDayType';
  date?: Maybe<Scalars['String']['output']>;
  dayOfWeek?: Maybe<Scalars['String']['output']>;
  locked?: Maybe<Scalars['Boolean']['output']>;
  slots?: Maybe<Array<Maybe<DutyPlanDaysSlotType>>>;
};

export type DutyPlanDaysKarkunType = {
  __typename?: 'DutyPlanDaysKarkunType';
  attendance?: Maybe<Scalars['String']['output']>;
  imageThumbnailUrl?: Maybe<Scalars['String']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  karkunId?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  off?: Maybe<Scalars['Boolean']['output']>;
};

export type DutyPlanDaysSlotType = {
  __typename?: 'DutyPlanDaysSlotType';
  absentKarkunIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  addedKarkunIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  addedKarkuns?: Maybe<Array<Maybe<DutyPlanDaysKarkunType>>>;
  shiftId?: Maybe<Scalars['String']['output']>;
  shiftName?: Maybe<Scalars['String']['output']>;
  teamKarkuns?: Maybe<Array<Maybe<DutyPlanDaysKarkunType>>>;
  teamName?: Maybe<Scalars['String']['output']>;
};

export type DutyPlanDaysType = {
  __typename?: 'DutyPlanDaysType';
  days?: Maybe<Array<Maybe<DutyPlanDaysDayType>>>;
  startDate?: Maybe<Scalars['String']['output']>;
};

export type DutyPlanWeekSlotType = {
  __typename?: 'DutyPlanWeekSlotType';
  shiftId?: Maybe<Scalars['String']['output']>;
  startDate?: Maybe<Scalars['String']['output']>;
  teamColor?: Maybe<Scalars['String']['output']>;
  teamId?: Maybe<Scalars['String']['output']>;
  teamName?: Maybe<Scalars['String']['output']>;
};

export type DutyPlanWeekType = {
  __typename?: 'DutyPlanWeekType';
  shifts?: Maybe<Array<Maybe<DutyShiftType>>>;
  slots?: Maybe<Array<Maybe<DutyPlanWeekSlotType>>>;
};

export type DutyShiftType = {
  __typename?: 'DutyShiftType';
  _id?: Maybe<Scalars['String']['output']>;
  canDelete?: Maybe<Scalars['Boolean']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  duty?: Maybe<DutyType>;
  dutyId?: Maybe<Scalars['String']['output']>;
  endTime?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  startTime?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type DutyType = {
  __typename?: 'DutyType';
  _id?: Maybe<Scalars['String']['output']>;
  canDelete?: Maybe<Scalars['Boolean']['output']>;
  committee?: Maybe<CommitteeBasicType>;
  committeeId?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  isMehfilDuty?: Maybe<Scalars['Boolean']['output']>;
  locations?: Maybe<Array<Maybe<DutyLocationType>>>;
  name?: Maybe<Scalars['String']['output']>;
  shifts?: Maybe<Array<Maybe<DutyShiftType>>>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  usedCount?: Maybe<Scalars['Int']['output']>;
};

export type EmploymentEventType = {
  __typename?: 'EmploymentEventType';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  details?: Maybe<Scalars['JSON']['output']>;
  effectiveDate?: Maybe<Scalars['String']['output']>;
  eventType?: Maybe<Scalars['String']['output']>;
  exitReason?: Maybe<Scalars['String']['output']>;
  personId?: Maybe<Scalars['String']['output']>;
  remarks?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type EnrolledTrustedDeviceType = {
  __typename?: 'EnrolledTrustedDeviceType';
  deviceId: Scalars['String']['output'];
  deviceSecret: Scalars['String']['output'];
};

export type FaceRecognitionSettingsType = {
  __typename?: 'FaceRecognitionSettingsType';
  defaults?: Maybe<FaceRecognitionSettingsValuesType>;
  matchThreshold?: Maybe<Scalars['Float']['output']>;
  minDetectionScore?: Maybe<Scalars['Float']['output']>;
  minFacePixels?: Maybe<Scalars['Int']['output']>;
  minFacePose?: Maybe<Scalars['Int']['output']>;
  minMatchMargin?: Maybe<Scalars['Float']['output']>;
  minSharpness?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type FaceRecognitionSettingsValuesType = {
  __typename?: 'FaceRecognitionSettingsValuesType';
  matchThreshold?: Maybe<Scalars['Float']['output']>;
  minDetectionScore?: Maybe<Scalars['Float']['output']>;
  minFacePixels?: Maybe<Scalars['Int']['output']>;
  minFacePose?: Maybe<Scalars['Int']['output']>;
  minMatchMargin?: Maybe<Scalars['Float']['output']>;
  minSharpness?: Maybe<Scalars['Int']['output']>;
};

export type FaceVectorResultType = {
  __typename?: 'FaceVectorResultType';
  status?: Maybe<Scalars['String']['output']>;
  vector?: Maybe<Array<Scalars['Float']['output']>>;
};

export type FreeFormCityType = {
  __typename?: 'FreeFormCityType';
  count?: Maybe<Scalars['Int']['output']>;
  locationId?: Maybe<Scalars['String']['output']>;
  locationName?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type FreeFormValueType = {
  __typename?: 'FreeFormValueType';
  count?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type HrEmployeeFilter = {
  bloodGroup?: InputMaybe<Scalars['String']['input']>;
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  employmentStatus?: InputMaybe<Scalars['String']['input']>;
  jobId?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  probationEndingWithinDays?: InputMaybe<Scalars['String']['input']>;
};

export type HrEmployeeType = {
  __typename?: 'HrEmployeeType';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  dataSource?: Maybe<Scalars['String']['output']>;
  employeeData?: Maybe<PersonEmployeeDataType>;
  isEmployee?: Maybe<Scalars['Boolean']['output']>;
  isKarkun?: Maybe<Scalars['Boolean']['output']>;
  isVisitor?: Maybe<Scalars['Boolean']['output']>;
  karkunData?: Maybe<PersonKarkunDataType>;
  sharedData?: Maybe<PersonSharedDataType>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type HrEmploymentSettingsType = {
  __typename?: 'HrEmploymentSettingsType';
  defaultProbationMonths?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type HrGroupMember = {
  __typename?: 'HrGroupMember';
  displayName?: Maybe<Scalars['String']['output']>;
  personId?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
  username?: Maybe<Scalars['String']['output']>;
};

export type HrPermissionAssignment = {
  __typename?: 'HrPermissionAssignment';
  committees?: Maybe<Array<Maybe<HrPermissionCommitteeHolder>>>;
  description?: Maybe<Scalars['String']['output']>;
  groups?: Maybe<Array<Maybe<HrPermissionGroupHolder>>>;
  key: Scalars['String']['output'];
  name: Scalars['String']['output'];
  users?: Maybe<Array<Maybe<HrPermissionHolder>>>;
};

export type HrPermissionCommitteeHolder = {
  __typename?: 'HrPermissionCommitteeHolder';
  committeeId: Scalars['String']['output'];
  locationName?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type HrPermissionGroup = {
  __typename?: 'HrPermissionGroup';
  featureKey: Scalars['String']['output'];
  featureName: Scalars['String']['output'];
  permissions?: Maybe<Array<Maybe<HrPermissionAssignment>>>;
};

export type HrPermissionGroupHolder = {
  __typename?: 'HrPermissionGroupHolder';
  groupId: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type HrPermissionHolder = {
  __typename?: 'HrPermissionHolder';
  displayName?: Maybe<Scalars['String']['output']>;
  personId?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
  username?: Maybe<Scalars['String']['output']>;
};

export type HrUserGroup = {
  __typename?: 'HrUserGroup';
  _id: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  users?: Maybe<Array<Maybe<HrGroupMember>>>;
};

export type InboxAttachmentType = {
  __typename?: 'InboxAttachmentType';
  kind?: Maybe<Scalars['String']['output']>;
  mimeType?: Maybe<Scalars['String']['output']>;
  size?: Maybe<Scalars['Float']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type InboxConversationDetailType = {
  __typename?: 'InboxConversationDetailType';
  conversation?: Maybe<InboxConversationType>;
  messages?: Maybe<Array<Maybe<InboxMessageType>>>;
};

export type InboxConversationFilter = {
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  searchText?: InputMaybe<Scalars['String']['input']>;
};

export type InboxConversationType = {
  __typename?: 'InboxConversationType';
  _id?: Maybe<Scalars['String']['output']>;
  assignedTo?: Maybe<Scalars['String']['output']>;
  customerName?: Maybe<Scalars['String']['output']>;
  lastMessage?: Maybe<InboxMessageType>;
  lastMessageAt?: Maybe<Scalars['String']['output']>;
  mobileNumber?: Maybe<Scalars['String']['output']>;
  open?: Maybe<Scalars['Boolean']['output']>;
  startedAt?: Maybe<Scalars['String']['output']>;
  visitorId?: Maybe<Scalars['String']['output']>;
  waitingResponse?: Maybe<Scalars['Boolean']['output']>;
};

export type InboxMessageType = {
  __typename?: 'InboxMessageType';
  _id?: Maybe<Scalars['String']['output']>;
  attachments?: Maybe<Array<Maybe<InboxAttachmentType>>>;
  roomId?: Maybe<Scalars['String']['output']>;
  senderName?: Maybe<Scalars['String']['output']>;
  senderType?: Maybe<Scalars['String']['output']>;
  sentAt?: Maybe<Scalars['String']['output']>;
  text?: Maybe<Scalars['String']['output']>;
};

export type IssuanceForm = {
  __typename?: 'IssuanceForm';
  _id?: Maybe<Scalars['String']['output']>;
  approvedBy?: Maybe<Scalars['String']['output']>;
  approvedOn?: Maybe<Scalars['String']['output']>;
  attachmentIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  attachments?: Maybe<Array<Maybe<Attachment>>>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  handedOverTo?: Maybe<Scalars['String']['output']>;
  issueDate?: Maybe<Scalars['String']['output']>;
  issuedBy?: Maybe<Scalars['String']['output']>;
  issuedTo?: Maybe<Scalars['String']['output']>;
  items?: Maybe<Array<Maybe<ItemWithQuantity>>>;
  locationId?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  physicalStoreId?: Maybe<Scalars['String']['output']>;
  refIssuedBy?: Maybe<PersonType>;
  refIssuedTo?: Maybe<PersonType>;
  refLocation?: Maybe<Location>;
  refPhysicalStore?: Maybe<PhysicalStore>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type ItemCategory = {
  __typename?: 'ItemCategory';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  physicalStoreId?: Maybe<Scalars['String']['output']>;
  stockItemCount?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type ItemWithQuantity = {
  __typename?: 'ItemWithQuantity';
  isInflow?: Maybe<Scalars['Boolean']['output']>;
  quantity?: Maybe<Scalars['Float']['output']>;
  refStockItem?: Maybe<StockItem>;
  stockItemId?: Maybe<Scalars['String']['output']>;
};

export type ItemWithQuantityAndPrice = {
  __typename?: 'ItemWithQuantityAndPrice';
  isInflow?: Maybe<Scalars['Boolean']['output']>;
  price?: Maybe<Scalars['Float']['output']>;
  quantity?: Maybe<Scalars['Float']['output']>;
  refStockItem?: Maybe<StockItem>;
  stockItemId?: Maybe<Scalars['String']['output']>;
};

export type ItemWithQuantityAndPriceInput = {
  isInflow?: InputMaybe<Scalars['Boolean']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  quantity?: InputMaybe<Scalars['Float']['input']>;
  stockItemId?: InputMaybe<Scalars['String']['input']>;
};

export type ItemWithQuantityInput = {
  isInflow?: InputMaybe<Scalars['Boolean']['input']>;
  quantity?: InputMaybe<Scalars['Float']['input']>;
  stockItemId?: InputMaybe<Scalars['String']['input']>;
};

export type JobDefinitionType = {
  __typename?: 'JobDefinitionType';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  defaultSchedule?: Maybe<Scalars['String']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  enabled?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  schedule?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type JobLogEntryType = {
  __typename?: 'JobLogEntryType';
  _id?: Maybe<Scalars['String']['output']>;
  duration?: Maybe<Scalars['Int']['output']>;
  error?: Maybe<Scalars['String']['output']>;
  event?: Maybe<Scalars['String']['output']>;
  failCount?: Maybe<Scalars['Int']['output']>;
  jobId?: Maybe<Scalars['String']['output']>;
  jobName?: Maybe<Scalars['String']['output']>;
  level?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  retryAttempt?: Maybe<Scalars['Int']['output']>;
  retryDelay?: Maybe<Scalars['Int']['output']>;
  timestamp?: Maybe<Scalars['DateTime']['output']>;
};

export type JobLogsFilterType = {
  event?: InputMaybe<Scalars['String']['input']>;
  jobName?: InputMaybe<Scalars['String']['input']>;
  level?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
};

export type JobShiftType = {
  __typename?: 'JobShiftType';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  endTime?: Maybe<Scalars['String']['output']>;
  jobId?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  startTime?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  usedCount?: Maybe<Scalars['Int']['output']>;
};

export type JobType = {
  __typename?: 'JobType';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  shifts?: Maybe<Array<Maybe<JobShiftType>>>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  usedCount?: Maybe<Scalars['Int']['output']>;
};

export type KarkunFilter = {
  attendance?: InputMaybe<Scalars['String']['input']>;
  bloodGroup?: InputMaybe<Scalars['String']['input']>;
  cityLocationId?: InputMaybe<Scalars['String']['input']>;
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  dutyId?: InputMaybe<Scalars['String']['input']>;
  dutyShiftId?: InputMaybe<Scalars['String']['input']>;
  ehadKarkun?: InputMaybe<Scalars['String']['input']>;
  lastTarteeb?: InputMaybe<Scalars['String']['input']>;
  mehfilLocationId?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
  updatedBetween?: InputMaybe<Scalars['String']['input']>;
  userAccount?: InputMaybe<Scalars['String']['input']>;
};

export type LeaveAdjustmentType = {
  __typename?: 'LeaveAdjustmentType';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  days?: Maybe<Scalars['Float']['output']>;
  leaveType?: Maybe<LeaveTypeType>;
  leaveTypeId?: Maybe<Scalars['String']['output']>;
  personId?: Maybe<Scalars['String']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  year?: Maybe<Scalars['Int']['output']>;
};

export type LeaveBalanceType = {
  __typename?: 'LeaveBalanceType';
  adjustments?: Maybe<Scalars['Float']['output']>;
  carriedForward?: Maybe<Scalars['Float']['output']>;
  entitlement?: Maybe<Scalars['Float']['output']>;
  isPaid?: Maybe<Scalars['Boolean']['output']>;
  leaveTypeId?: Maybe<Scalars['String']['output']>;
  leaveTypeName?: Maybe<Scalars['String']['output']>;
  pending?: Maybe<Scalars['Float']['output']>;
  remaining?: Maybe<Scalars['Float']['output']>;
  used?: Maybe<Scalars['Float']['output']>;
  year?: Maybe<Scalars['Int']['output']>;
};

export type LeaveRequestType = {
  __typename?: 'LeaveRequestType';
  _id?: Maybe<Scalars['String']['output']>;
  approvedAt?: Maybe<Scalars['String']['output']>;
  approvedBy?: Maybe<Scalars['String']['output']>;
  balanceWarning?: Maybe<Scalars['String']['output']>;
  cancelledAt?: Maybe<Scalars['String']['output']>;
  cancelledBy?: Maybe<Scalars['String']['output']>;
  confirmationRemarks?: Maybe<Scalars['String']['output']>;
  confirmedOn?: Maybe<Scalars['String']['output']>;
  confirmedWith?: Maybe<PersonType>;
  confirmedWithPersonId?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  days?: Maybe<Scalars['Float']['output']>;
  fromDate?: Maybe<Scalars['String']['output']>;
  halfDay?: Maybe<Scalars['Boolean']['output']>;
  leaveType?: Maybe<LeaveTypeType>;
  leaveTypeId?: Maybe<Scalars['String']['output']>;
  person?: Maybe<HrEmployeeType>;
  personId?: Maybe<Scalars['String']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  rejectedAt?: Maybe<Scalars['String']['output']>;
  rejectedBy?: Maybe<Scalars['String']['output']>;
  rejectionReason?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  toDate?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['Int']['output']>;
};

export type LeaveTypeType = {
  __typename?: 'LeaveTypeType';
  _id?: Maybe<Scalars['String']['output']>;
  allowCarryForward?: Maybe<Scalars['Boolean']['output']>;
  annualEntitlementDays?: Maybe<Scalars['Float']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  isPaid?: Maybe<Scalars['Boolean']['output']>;
  maxCarryForwardDays?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  usedCount?: Maybe<Scalars['Int']['output']>;
};

export type Location = {
  __typename?: 'Location';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  isInUse?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  parentId?: Maybe<Scalars['String']['output']>;
  physicalStoreId?: Maybe<Scalars['String']['output']>;
  refParent?: Maybe<Location>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type MehfilDetailsAccessType = {
  __typename?: 'MehfilDetailsAccessType';
  locationId: Scalars['String']['output'];
  permissions: Array<Scalars['String']['output']>;
};

export enum MehfilDetailsPermission {
  Update = 'UPDATE',
  View = 'VIEW'
}

export type MehfilDutyType = {
  __typename?: 'MehfilDutyType';
  _id: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export enum MehfilKarkunsPermission {
  View = 'VIEW'
}

export type MehfilLocationKarkunType = {
  __typename?: 'MehfilLocationKarkunType';
  _id: Scalars['String']['output'];
  cnicNumber?: Maybe<Scalars['String']['output']>;
  contactNumber1?: Maybe<Scalars['String']['output']>;
  contactNumber2?: Maybe<Scalars['String']['output']>;
  imageThumbnailUrl?: Maybe<Scalars['String']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  parentName?: Maybe<Scalars['String']['output']>;
};

export enum MehfilPermissionsPermission {
  Manage = 'MANAGE',
  View = 'VIEW'
}

export type MehfilPermissionsType = {
  __typename?: 'MehfilPermissionsType';
  groups: Array<Maybe<MpGroupType>>;
  locationId: Scalars['String']['output'];
  permissions: Array<Scalars['String']['output']>;
};

export type MpGroupType = {
  __typename?: 'MpGroupType';
  featureKey: Scalars['String']['output'];
  featureName: Scalars['String']['output'];
  permissions: Array<Maybe<MpPermissionType>>;
};

export type MpPermissionType = {
  __typename?: 'MpPermissionType';
  description: Scalars['String']['output'];
  key: Scalars['String']['output'];
  name: Scalars['String']['output'];
  users: Array<Maybe<MpUserType>>;
};

export type MpUserType = {
  __typename?: 'MpUserType';
  displayName?: Maybe<Scalars['String']['output']>;
  personId?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
  username?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  abortPurchasingAttachmentUpload?: Maybe<Scalars['Boolean']['output']>;
  addCommitteeMember?: Maybe<CommitteeType>;
  addHrEmployeeAttachment?: Maybe<HrEmployeeType>;
  addHrEmployeesGroupMember?: Maybe<Scalars['Boolean']['output']>;
  addHrEmployeesPermissionCommittee?: Maybe<Scalars['Boolean']['output']>;
  addHrEmployeesPermissionGroup?: Maybe<Scalars['Boolean']['output']>;
  addHrEmployeesPermissionUser?: Maybe<Scalars['Boolean']['output']>;
  addHrKarkunAttachment?: Maybe<PersonType>;
  addHrKarkunsGroupMember?: Maybe<Scalars['Boolean']['output']>;
  addHrKarkunsPermissionCommittee?: Maybe<Scalars['Boolean']['output']>;
  addHrKarkunsPermissionGroup?: Maybe<Scalars['Boolean']['output']>;
  addHrKarkunsPermissionUser?: Maybe<Scalars['Boolean']['output']>;
  addIssuanceFormAttachment?: Maybe<IssuanceForm>;
  addOrgLocationFeatureUser?: Maybe<Scalars['Boolean']['output']>;
  addOrgLocationObserver?: Maybe<OrgLocationType>;
  addPhysicalStoreAccessGroup?: Maybe<Scalars['Boolean']['output']>;
  addPhysicalStoreAccessUser?: Maybe<Scalars['Boolean']['output']>;
  addPurchaseFormAttachment?: Maybe<PurchaseForm>;
  addPurchasingGroupMember?: Maybe<Scalars['Boolean']['output']>;
  addPurchasingPermissionCommittee?: Maybe<Scalars['Boolean']['output']>;
  addPurchasingPermissionGroup?: Maybe<Scalars['Boolean']['output']>;
  addPurchasingPermissionUser?: Maybe<Scalars['Boolean']['output']>;
  addSecurityEventKarkun?: Maybe<SecurityEventKarkunType>;
  addSecurityGroupMember?: Maybe<Scalars['Boolean']['output']>;
  addSecurityPermissionCommittee?: Maybe<Scalars['Boolean']['output']>;
  addSecurityPermissionGroup?: Maybe<Scalars['Boolean']['output']>;
  addSecurityPermissionUser?: Maybe<Scalars['Boolean']['output']>;
  addSecurityServerProfileImage?: Maybe<SecurityServerProfileType>;
  addStoreUserGroupMember?: Maybe<Scalars['Boolean']['output']>;
  addTeamCoordinator?: Maybe<TeamType>;
  addTeamMember?: Maybe<TeamType>;
  addWorkspaceMonitoringProfilePhoto?: Maybe<WorkspaceMonitoringProfileType>;
  approveIssuanceForms?: Maybe<Array<Maybe<IssuanceForm>>>;
  approveLeaveRequest?: Maybe<LeaveRequestType>;
  approvePurchaseForms?: Maybe<Array<Maybe<PurchaseForm>>>;
  approvePurchasingOrder?: Maybe<PurchasingOrder>;
  approvePurchasingPettyCashReplenishment?: Maybe<PurchasingPettyCashReplenishment>;
  approvePurchasingPettyCashVoucher?: Maybe<PurchasingPettyCashVoucher>;
  approvePurchasingRequisition?: Maybe<PurchasingRequisition>;
  approveStockAdjustments?: Maybe<Array<Maybe<StockAdjustment>>>;
  cancelLeaveRequest?: Maybe<LeaveRequestType>;
  cancelPurchasingOrder?: Maybe<PurchasingOrder>;
  cancelPurchasingRequisition?: Maybe<PurchasingRequisition>;
  cancelStoreRequisition?: Maybe<PurchasingRequisition>;
  cancelVisitorStay?: Maybe<VisitorStayType>;
  changeEmployeeJob?: Maybe<HrEmployeeType>;
  clearJobDefinitionSchedule?: Maybe<JobDefinitionType>;
  clearLoginBlocks?: Maybe<UserType>;
  closePurchasingOrder?: Maybe<PurchasingOrder>;
  closePurchasingRequisition?: Maybe<PurchasingRequisition>;
  completePurchasingAttachmentUpload?: Maybe<PurchasingAttachment>;
  confirmEmployee?: Maybe<HrEmployeeType>;
  createChatAccount?: Maybe<UserType>;
  createCity?: Maybe<CityType>;
  createCityMehfil?: Maybe<CityMehfilType>;
  createCommittee?: Maybe<CommitteeType>;
  createDuty?: Maybe<DutyType>;
  createDutyLocation?: Maybe<DutyLocationType>;
  createDutyShift?: Maybe<DutyShiftType>;
  createHrEmployeesUserGroup?: Maybe<HrUserGroup>;
  createHrKarkun?: Maybe<PersonType>;
  createHrKarkunsUserGroup?: Maybe<HrUserGroup>;
  createIssuanceForm?: Maybe<IssuanceForm>;
  createItemCategory?: Maybe<ItemCategory>;
  createJob?: Maybe<JobType>;
  createJobShift?: Maybe<JobShiftType>;
  createLeaveAdjustment?: Maybe<LeaveAdjustmentType>;
  createLeaveRequest?: Maybe<LeaveRequestType>;
  createLeaveType?: Maybe<LeaveTypeType>;
  createLocation?: Maybe<Location>;
  createMehfilDuty?: Maybe<MehfilDutyType>;
  createMissingSecurityServerAlertThumbnails?: Maybe<Scalars['Int']['output']>;
  createMissingSecurityServerProfileThumbnails?: Maybe<Scalars['Int']['output']>;
  createOrgLocation?: Maybe<OrgLocationType>;
  createOrgLocationUserChatAccount?: Maybe<UserType>;
  createPeopleTag?: Maybe<PeopleTagType>;
  createPhysicalStore?: Maybe<PhysicalStore>;
  createPurchaseForm?: Maybe<PurchaseForm>;
  createPurchasingAttachmentUpload?: Maybe<PurchasingAttachmentUpload>;
  createPurchasingCatalogItem?: Maybe<PurchasingCatalogItem>;
  createPurchasingInvoice?: Maybe<PurchasingInvoice>;
  createPurchasingOrderFromQuote?: Maybe<PurchasingOrder>;
  createPurchasingOrderFromRequisition?: Maybe<PurchasingOrder>;
  createPurchasingPettyCashExpenseHead?: Maybe<PurchasingPettyCashExpenseHead>;
  createPurchasingPettyCashFund?: Maybe<PurchasingPettyCashFund>;
  createPurchasingPettyCashVoucher?: Maybe<PurchasingPettyCashVoucher>;
  createPurchasingQuote?: Maybe<PurchasingQuote>;
  createPurchasingRequisition?: Maybe<PurchasingRequisition>;
  createPurchasingUserGroup?: Maybe<PurchasingUserGroup>;
  createPurchasingVendor?: Maybe<PurchasingVendor>;
  createSalaries?: Maybe<Scalars['Int']['output']>;
  createSecurityEvent?: Maybe<SecurityEventType>;
  createSecurityEventDuty?: Maybe<SecurityEventDutyType>;
  createSecurityEventLangarDish?: Maybe<SecurityEventLangarDishType>;
  createSecurityEventLangarLocation?: Maybe<SecurityEventLangarLocationType>;
  createSecurityServerChannel?: Maybe<SecurityServerChannelType>;
  createSecurityServerProfile?: Maybe<SecurityServerProfileType>;
  createSecurityUserGroup?: Maybe<SecurityUserGroup>;
  createSecurityVisitor?: Maybe<PersonType>;
  createServiceAccount?: Maybe<UserType>;
  createStockAdjustment?: Maybe<StockAdjustment>;
  createStockItem?: Maybe<StockItem>;
  createStoreRequisition?: Maybe<PurchasingRequisition>;
  createStoreUserGroup?: Maybe<StoreUserGroup>;
  createTeam?: Maybe<TeamType>;
  createUser?: Maybe<UserType>;
  createUserGroup?: Maybe<UserGroupType>;
  createVendor?: Maybe<Vendor>;
  createVisitorStay?: Maybe<VisitorStayType>;
  deleteAllSalaries?: Maybe<Scalars['Int']['output']>;
  deleteDuplicatePeople?: Maybe<Scalars['Int']['output']>;
  deleteHrEmployeesUserGroup?: Maybe<Scalars['Boolean']['output']>;
  deleteHrKarkun?: Maybe<Scalars['Int']['output']>;
  deleteHrKarkunsUserGroup?: Maybe<Scalars['Boolean']['output']>;
  deleteMehfilDuty?: Maybe<Scalars['Boolean']['output']>;
  deletePeopleTag?: Maybe<Scalars['Int']['output']>;
  deletePurchasingAttachment?: Maybe<Scalars['Boolean']['output']>;
  deletePurchasingOrder?: Maybe<Scalars['Boolean']['output']>;
  deletePurchasingPettyCashExpenseHead?: Maybe<Scalars['Boolean']['output']>;
  deletePurchasingPettyCashVoucher?: Maybe<Scalars['Boolean']['output']>;
  deletePurchasingQuote?: Maybe<Scalars['Boolean']['output']>;
  deletePurchasingRequisition?: Maybe<Scalars['Boolean']['output']>;
  deletePurchasingUserGroup?: Maybe<Scalars['Boolean']['output']>;
  deleteSalaries?: Maybe<Scalars['Int']['output']>;
  deleteSecurityServerChannel?: Maybe<Scalars['Int']['output']>;
  deleteSecurityServerProfile?: Maybe<Scalars['Int']['output']>;
  deleteSecurityUserGroup?: Maybe<Scalars['Boolean']['output']>;
  deleteSecurityVisitor?: Maybe<Scalars['Int']['output']>;
  deleteStoreRequisition?: Maybe<Scalars['Boolean']['output']>;
  deleteStoreUserGroup?: Maybe<Scalars['Boolean']['output']>;
  deleteUserGroup?: Maybe<Scalars['Int']['output']>;
  disableCommitteeFeature: Scalars['Boolean']['output'];
  disableTwoFactor?: Maybe<UserType>;
  enableCommitteeFeature: Scalars['Boolean']['output'];
  enableTwoFactor?: Maybe<UserType>;
  enrollTrustedDevice?: Maybe<EnrolledTrustedDeviceType>;
  exitEmployee?: Maybe<HrEmployeeType>;
  fixNameSpelling?: Maybe<Scalars['Int']['output']>;
  hardDeletePeople?: Maybe<Scalars['Int']['output']>;
  hireEmployee?: Maybe<HrEmployeeType>;
  importSecurityVisitorsCsvData?: Maybe<Scalars['String']['output']>;
  linkOrgLocationUser?: Maybe<UserType>;
  markNotificationsRead: Scalars['Boolean']['output'];
  markPurchasingOrderSent?: Maybe<PurchasingOrder>;
  mergeStockItems?: Maybe<StockItem>;
  moveCommittee?: Maybe<CommitteeType>;
  postPurchasingPayment?: Maybe<PurchasingPayment>;
  postPurchasingReceipt?: Maybe<PurchasingReceipt>;
  postStoreReceipt?: Maybe<StoreReceipt>;
  promoteHrKarkun?: Maybe<PersonType>;
  recalculateStockLevels?: Maybe<Array<Maybe<StockItem>>>;
  recordLeaveConfirmation?: Maybe<LeaveRequestType>;
  registerUser?: Maybe<Scalars['Int']['output']>;
  rejectLeaveRequest?: Maybe<LeaveRequestType>;
  rejectPurchasingOrder?: Maybe<PurchasingOrder>;
  rejectPurchasingPettyCashReplenishment?: Maybe<PurchasingPettyCashReplenishment>;
  rejectPurchasingPettyCashVoucher?: Maybe<PurchasingPettyCashVoucher>;
  rejectPurchasingQuote?: Maybe<PurchasingQuote>;
  rejectPurchasingRequisition?: Maybe<PurchasingRequisition>;
  rejoinEmployee?: Maybe<HrEmployeeType>;
  removeCity?: Maybe<Scalars['Int']['output']>;
  removeCityMehfil?: Maybe<Scalars['Int']['output']>;
  removeCommittee?: Maybe<Scalars['Int']['output']>;
  removeCommitteeMember?: Maybe<CommitteeType>;
  removeDuty?: Maybe<Scalars['Int']['output']>;
  removeDutyLocation?: Maybe<Scalars['Int']['output']>;
  removeDutyShift?: Maybe<Scalars['Int']['output']>;
  removeHrEmployeeAttachment?: Maybe<HrEmployeeType>;
  removeHrEmployeesGroupMember?: Maybe<Scalars['Boolean']['output']>;
  removeHrEmployeesPermissionCommittee?: Maybe<Scalars['Boolean']['output']>;
  removeHrEmployeesPermissionGroup?: Maybe<Scalars['Boolean']['output']>;
  removeHrEmployeesPermissionUser?: Maybe<Scalars['Boolean']['output']>;
  removeHrKarkunAttachment?: Maybe<PersonType>;
  removeHrKarkunsGroupMember?: Maybe<Scalars['Boolean']['output']>;
  removeHrKarkunsPermissionCommittee?: Maybe<Scalars['Boolean']['output']>;
  removeHrKarkunsPermissionGroup?: Maybe<Scalars['Boolean']['output']>;
  removeHrKarkunsPermissionUser?: Maybe<Scalars['Boolean']['output']>;
  removeIssuanceFormAttachment?: Maybe<IssuanceForm>;
  removeIssuanceForms?: Maybe<Scalars['Int']['output']>;
  removeItemCategory?: Maybe<Scalars['Int']['output']>;
  removeJob?: Maybe<Scalars['Int']['output']>;
  removeJobShift?: Maybe<Scalars['Int']['output']>;
  removeLeaveAdjustment?: Maybe<Scalars['Int']['output']>;
  removeLeaveType?: Maybe<Scalars['Int']['output']>;
  removeLocation?: Maybe<Scalars['Int']['output']>;
  removeOrgLocationFeatureUser?: Maybe<Scalars['Boolean']['output']>;
  removeOrgLocationObserver?: Maybe<OrgLocationType>;
  removePhysicalStoreAccessGroup?: Maybe<Scalars['Boolean']['output']>;
  removePhysicalStoreAccessUser?: Maybe<Scalars['Boolean']['output']>;
  removePurchaseFormAttachment?: Maybe<PurchaseForm>;
  removePurchaseForms?: Maybe<Scalars['Int']['output']>;
  removePurchasingCatalogItem?: Maybe<Scalars['Boolean']['output']>;
  removePurchasingCatalogItemImage?: Maybe<PurchasingCatalogItem>;
  removePurchasingGroupMember?: Maybe<Scalars['Boolean']['output']>;
  removePurchasingPermissionCommittee?: Maybe<Scalars['Boolean']['output']>;
  removePurchasingPermissionGroup?: Maybe<Scalars['Boolean']['output']>;
  removePurchasingPermissionUser?: Maybe<Scalars['Boolean']['output']>;
  removePurchasingVendor?: Maybe<Scalars['Boolean']['output']>;
  removeSecurityEvent?: Maybe<Scalars['Int']['output']>;
  removeSecurityEventDuty?: Maybe<Scalars['Int']['output']>;
  removeSecurityEventKarkun?: Maybe<Scalars['Int']['output']>;
  removeSecurityEventLangarDish?: Maybe<Scalars['Int']['output']>;
  removeSecurityEventLangarLocation?: Maybe<Scalars['Int']['output']>;
  removeSecurityGroupMember?: Maybe<Scalars['Boolean']['output']>;
  removeSecurityPermissionCommittee?: Maybe<Scalars['Boolean']['output']>;
  removeSecurityPermissionGroup?: Maybe<Scalars['Boolean']['output']>;
  removeSecurityPermissionUser?: Maybe<Scalars['Boolean']['output']>;
  removeSecurityServerProfileImage?: Maybe<SecurityServerProfileType>;
  removeStockAdjustments?: Maybe<Scalars['Int']['output']>;
  removeStockItem?: Maybe<Scalars['Int']['output']>;
  removeStoreUserGroupMember?: Maybe<Scalars['Boolean']['output']>;
  removeTeam?: Maybe<Scalars['Int']['output']>;
  removeTeamCoordinator?: Maybe<TeamType>;
  removeTeamMember?: Maybe<TeamType>;
  removeTrustedDevice?: Maybe<Scalars['Boolean']['output']>;
  removeVendor?: Maybe<Scalars['Int']['output']>;
  removeWorkspaceMonitoringProfilePhoto?: Maybe<WorkspaceMonitoringProfileType>;
  renameFreeFormCity?: Maybe<Scalars['Int']['output']>;
  renameFreeFormCountry?: Maybe<Scalars['Int']['output']>;
  reopenPurchasingRequisition?: Maybe<PurchasingRequisition>;
  reopenStoreRequisition?: Maybe<PurchasingRequisition>;
  requestPurchasingPettyCashReplenishment?: Maybe<PurchasingPettyCashReplenishment>;
  resetJobDefinitionSchedule?: Maybe<JobDefinitionType>;
  resetOrgLocationUserPassword?: Maybe<UserType>;
  resetTwoFactor?: Maybe<UserType>;
  resetUserPassword?: Maybe<UserType>;
  restorePerson?: Maybe<Scalars['Int']['output']>;
  retryFailedJob?: Maybe<Scalars['Boolean']['output']>;
  revokeUserTrustedDevices?: Maybe<Scalars['Int']['output']>;
  runScheduledJobNow?: Maybe<Scalars['Boolean']['output']>;
  selectPurchasingQuote?: Maybe<PurchasingQuote>;
  sendInboxMessage?: Maybe<InboxMessageType>;
  setCommitteeMemberDiscussionAccess?: Maybe<Scalars['Boolean']['output']>;
  setCommitteeMemberRole?: Maybe<CommitteeType>;
  setDutyAttendance?: Maybe<Scalars['Boolean']['output']>;
  setDutyDayOverride?: Maybe<Scalars['Boolean']['output']>;
  setDutyDetail?: Maybe<Array<Maybe<SecurityEventKarkunType>>>;
  setDutyShiftTeam?: Maybe<Scalars['Boolean']['output']>;
  setHrEmployeeEmploymentInfo?: Maybe<HrEmployeeType>;
  setHrEmployeeProfileImage?: Maybe<HrEmployeeType>;
  setHrKarkunProfileImage?: Maybe<PersonType>;
  setJobDefinitionEnabled?: Maybe<JobDefinitionType>;
  setOrgLocationUserLocked?: Maybe<UserType>;
  setPermissions?: Maybe<UserType>;
  setPurchasingCatalogItemActive?: Maybe<PurchasingCatalogItem>;
  setPurchasingCatalogItemImage?: Maybe<PurchasingCatalogItem>;
  setPurchasingInvoiceDisputed?: Maybe<PurchasingInvoice>;
  setPurchasingPettyCashExpenseHeadActive?: Maybe<PurchasingPettyCashExpenseHead>;
  setPurchasingPettyCashFundActive?: Maybe<PurchasingPettyCashFund>;
  setPurchasingVendorActive?: Maybe<PurchasingVendor>;
  setScheduledJobEnabled?: Maybe<Scalars['Boolean']['output']>;
  setSecurityServerAlertReview?: Maybe<SecurityServerAlertType>;
  setSecurityServerProfileDefaultImage?: Maybe<SecurityServerProfileType>;
  setSecurityVisitorImage?: Maybe<PersonType>;
  setStockItemImage?: Maybe<StockItem>;
  setSuperAdmin?: Maybe<UserType>;
  setUserGroupPermissions?: Maybe<UserGroupType>;
  startTwoFactorSetup?: Maybe<TwoFactorSetupType>;
  submitPurchasingOrder?: Maybe<PurchasingOrder>;
  submitPurchasingPettyCashVoucher?: Maybe<PurchasingPettyCashVoucher>;
  submitPurchasingRequisition?: Maybe<PurchasingRequisition>;
  submitStoreRequisition?: Maybe<PurchasingRequisition>;
  syncOrgLocationObservers?: Maybe<SyncOrgLocationObserversResult>;
  updateAdminFaceRecognitionSettings?: Maybe<FaceRecognitionSettingsType>;
  updateAdminPeopleRegistrationImageSettings?: Maybe<PeopleRegistrationImageSettingsType>;
  updateAdminPeopleSearchFaceSettings?: Maybe<PeopleSearchFaceSettingsType>;
  updateAttachment?: Maybe<Attachment>;
  updateCity?: Maybe<CityType>;
  updateCityLocationMappings?: Maybe<Scalars['Int']['output']>;
  updateCityMehfil?: Maybe<CityMehfilType>;
  updateCommittee?: Maybe<CommitteeType>;
  updateDuty?: Maybe<DutyType>;
  updateDutyLocation?: Maybe<DutyLocationType>;
  updateDutyShift?: Maybe<DutyShiftType>;
  updateHrEmployee?: Maybe<HrEmployeeType>;
  updateHrEmployeesUserGroup?: Maybe<HrUserGroup>;
  updateHrEmploymentSettings?: Maybe<HrEmploymentSettingsType>;
  updateHrKarkun?: Maybe<PersonType>;
  updateHrKarkunsUserGroup?: Maybe<HrUserGroup>;
  updateIssuanceForm?: Maybe<IssuanceForm>;
  updateItemCategory?: Maybe<ItemCategory>;
  updateJob?: Maybe<JobType>;
  updateJobDefinitionSchedule?: Maybe<JobDefinitionType>;
  updateJobShift?: Maybe<JobShiftType>;
  updateLastActiveTime?: Maybe<Scalars['Int']['output']>;
  updateLeaveType?: Maybe<LeaveTypeType>;
  updateLocation?: Maybe<Location>;
  updateLoginTime?: Maybe<Scalars['Int']['output']>;
  updateMehfilDuty?: Maybe<MehfilDutyType>;
  updateOrgLocation?: Maybe<OrgLocationType>;
  updatePeopleTag?: Maybe<PeopleTagType>;
  updatePhysicalStore?: Maybe<PhysicalStore>;
  updatePurchaseForm?: Maybe<PurchaseForm>;
  updatePurchasingCatalogItem?: Maybe<PurchasingCatalogItem>;
  updatePurchasingInvoice?: Maybe<PurchasingInvoice>;
  updatePurchasingOrder?: Maybe<PurchasingOrder>;
  updatePurchasingPettyCashExpenseHead?: Maybe<PurchasingPettyCashExpenseHead>;
  updatePurchasingPettyCashFund?: Maybe<PurchasingPettyCashFund>;
  updatePurchasingPettyCashVoucher?: Maybe<PurchasingPettyCashVoucher>;
  updatePurchasingQuote?: Maybe<PurchasingQuote>;
  updatePurchasingRequisition?: Maybe<PurchasingRequisition>;
  updatePurchasingUserGroup?: Maybe<PurchasingUserGroup>;
  updatePurchasingVendor?: Maybe<PurchasingVendor>;
  updateSalary?: Maybe<SalaryType>;
  updateSecurityEvent?: Maybe<SecurityEventType>;
  updateSecurityEventDuty?: Maybe<SecurityEventDutyType>;
  updateSecurityEventLangarDish?: Maybe<SecurityEventLangarDishType>;
  updateSecurityEventLangarLocation?: Maybe<SecurityEventLangarLocationType>;
  updateSecurityServerChannel?: Maybe<SecurityServerChannelType>;
  updateSecurityServerProfile?: Maybe<SecurityServerProfileType>;
  updateSecurityUserGroup?: Maybe<SecurityUserGroup>;
  updateSecurityVisitor?: Maybe<PersonType>;
  updateSecurityVisitorNotes?: Maybe<PersonType>;
  updateStockAdjustment?: Maybe<StockAdjustment>;
  updateStockItem?: Maybe<StockItem>;
  updateStoreRequisition?: Maybe<PurchasingRequisition>;
  updateStoreUserGroup?: Maybe<StoreUserGroup>;
  updateTeam?: Maybe<TeamType>;
  updateTeamMemberDays?: Maybe<TeamType>;
  updateUser?: Maybe<UserType>;
  updateUserGroup?: Maybe<UserGroupType>;
  updateVendor?: Maybe<Vendor>;
  updateVisitorStay?: Maybe<VisitorStayType>;
  updateWorkspaceMonitoringProfile?: Maybe<WorkspaceMonitoringProfileType>;
  verifyStockItemLevel?: Maybe<StockItem>;
  voidPurchasingInvoice?: Maybe<PurchasingInvoice>;
  voidPurchasingPayment?: Maybe<PurchasingPayment>;
  voidPurchasingPettyCashVoucher?: Maybe<PurchasingPettyCashVoucher>;
  voidPurchasingReceipt?: Maybe<PurchasingReceipt>;
  voidStoreReceipt?: Maybe<StoreReceipt>;
  workspaceAbortDocumentUpload?: Maybe<Scalars['Boolean']['output']>;
  workspaceAbortMeetingAttachmentUpload?: Maybe<Scalars['Boolean']['output']>;
  workspaceAddCommitteeMember?: Maybe<WorkspaceCommitteeType>;
  workspaceAddMeetingAgendaItem?: Maybe<WorkspaceMeetingType>;
  workspaceAddMehfilPermissionUser?: Maybe<Scalars['Boolean']['output']>;
  workspaceAddProjectParticipants?: Maybe<WorkspaceProjectType>;
  workspaceAddTaskComment?: Maybe<WorkspaceTaskCommentType>;
  workspaceCancelMeeting?: Maybe<WorkspaceMeetingType>;
  workspaceCancelPoll?: Maybe<WorkspacePollType>;
  workspaceCastPollVote?: Maybe<WorkspacePollType>;
  workspaceCheckInDocument?: Maybe<Scalars['Boolean']['output']>;
  workspaceCheckOutDocument?: Maybe<Scalars['Boolean']['output']>;
  workspaceClosePoll?: Maybe<WorkspacePollType>;
  workspaceCompleteDocumentUpload?: Maybe<WorkspaceDocumentType>;
  workspaceCompleteMeeting?: Maybe<WorkspaceMeetingType>;
  workspaceCompleteMeetingAttachmentUpload?: Maybe<WorkspaceMeetingAttachmentType>;
  workspaceCreateDocumentFolder?: Maybe<Scalars['Boolean']['output']>;
  workspaceCreateDocumentUpload?: Maybe<WorkspaceDocumentUploadType>;
  workspaceCreateMeeting?: Maybe<WorkspaceMeetingType>;
  workspaceCreateMeetingActionItem?: Maybe<WorkspaceMeetingActionItemType>;
  workspaceCreateMeetingAttachmentUpload?: Maybe<WorkspaceMeetingUploadType>;
  workspaceCreatePoll?: Maybe<WorkspacePollType>;
  workspaceCreateProject?: Maybe<WorkspaceProjectType>;
  workspaceCreateTask?: Maybe<WorkspaceTaskType>;
  workspaceDaAddDuties?: Maybe<Array<Maybe<DaDutyType>>>;
  workspaceDaAddDutyMember?: Maybe<DaDutyType>;
  workspaceDaRemoveDuty?: Maybe<Scalars['Boolean']['output']>;
  workspaceDaRemoveDutyMember?: Maybe<DaDutyType>;
  workspaceDaSetAttendance?: Maybe<Scalars['Boolean']['output']>;
  workspaceDaSetDayOverride?: Maybe<Scalars['Boolean']['output']>;
  workspaceDaUpdateDuty?: Maybe<DaDutyType>;
  workspaceDaUpdateDutyMember?: Maybe<DaDutyType>;
  workspaceDeleteDiscussionMessage: Scalars['Boolean']['output'];
  workspaceDeleteDocumentVersion?: Maybe<Scalars['Boolean']['output']>;
  workspaceDeleteMeeting?: Maybe<Scalars['Boolean']['output']>;
  workspaceDeleteMeetingActionItem?: Maybe<Scalars['Boolean']['output']>;
  workspaceDeleteMeetingAttachment?: Maybe<Scalars['Boolean']['output']>;
  workspaceDeletePoll?: Maybe<Scalars['Boolean']['output']>;
  workspaceDeleteProject?: Maybe<Scalars['Boolean']['output']>;
  workspaceDeleteTask?: Maybe<Scalars['Boolean']['output']>;
  workspaceDeleteTaskComment?: Maybe<Scalars['Boolean']['output']>;
  workspaceDocumentDownloadUrl?: Maybe<WorkspaceDocumentDownloadType>;
  workspaceEditDiscussionMessage: Scalars['Boolean']['output'];
  workspaceEmptyDocumentTrash?: Maybe<Scalars['Int']['output']>;
  workspaceForceUnlockDocument?: Maybe<Scalars['Boolean']['output']>;
  workspaceJoinDiscussionVideoCall?: Maybe<DiscussionVideoCallType>;
  workspaceJoinMeetingVideoCall?: Maybe<WorkspaceMeetingVideoCallType>;
  workspaceMarkMeetingAttendance?: Maybe<WorkspaceMeetingType>;
  workspaceMeetingAttachmentDownloadUrl?: Maybe<WorkspaceMeetingDownloadType>;
  workspaceMoveDocument?: Maybe<Scalars['Boolean']['output']>;
  workspaceMoveDocumentFolder?: Maybe<Scalars['Boolean']['output']>;
  workspaceOpenPoll?: Maybe<WorkspacePollType>;
  workspacePurgeDocumentTrashItem?: Maybe<Scalars['Boolean']['output']>;
  workspaceReactToDiscussionMessage: Scalars['Boolean']['output'];
  workspaceRemoveCommitteeMember?: Maybe<WorkspaceCommitteeType>;
  workspaceRemoveMeetingAgendaItem?: Maybe<WorkspaceMeetingType>;
  workspaceRemoveMehfilPermissionUser?: Maybe<Scalars['Boolean']['output']>;
  workspaceRemoveProjectParticipant?: Maybe<WorkspaceProjectType>;
  workspaceRenameDocumentFolder?: Maybe<Scalars['Boolean']['output']>;
  workspaceReopenMeeting?: Maybe<WorkspaceMeetingType>;
  workspaceReopenPoll?: Maybe<WorkspacePollType>;
  workspaceReorderMeetingAgenda?: Maybe<WorkspaceMeetingType>;
  workspaceRespondToMeeting?: Maybe<WorkspaceMeetingType>;
  workspaceRestoreDocumentTrashItem?: Maybe<Scalars['Boolean']['output']>;
  workspaceRestoreDocumentVersion?: Maybe<Scalars['Boolean']['output']>;
  workspaceSendDiscussionMessage: Scalars['Boolean']['output'];
  workspaceSetCommitteeMemberCoordinator?: Maybe<Scalars['Boolean']['output']>;
  workspaceSetCommitteeMemberDiscussionAccess?: Maybe<Scalars['Boolean']['output']>;
  workspaceSetDiscussionMessagePinned: Scalars['Boolean']['output'];
  workspaceSetDiscussionMessageStarred: Scalars['Boolean']['output'];
  workspaceSetMeetingActionItemStatus?: Maybe<WorkspaceMeetingActionItemType>;
  workspaceSetMeetingMinutes?: Maybe<WorkspaceMeetingType>;
  workspaceSetMeetingParticipantRole?: Maybe<WorkspaceMeetingType>;
  workspaceSetMeetingParticipants?: Maybe<WorkspaceMeetingType>;
  workspaceSetProjectStatus?: Maybe<WorkspaceProjectType>;
  workspaceSetTaskProgress?: Maybe<WorkspaceTaskType>;
  workspaceSetTaskStatus?: Maybe<WorkspaceTaskType>;
  workspaceTrashDocument?: Maybe<Scalars['Boolean']['output']>;
  workspaceTrashDocumentFolder?: Maybe<Scalars['Boolean']['output']>;
  workspaceUpdateDocument?: Maybe<Scalars['Boolean']['output']>;
  workspaceUpdateMeeting?: Maybe<WorkspaceMeetingType>;
  workspaceUpdateMeetingActionItem?: Maybe<WorkspaceMeetingActionItemType>;
  workspaceUpdateMeetingAgendaItem?: Maybe<WorkspaceMeetingType>;
  workspaceUpdateMehfilDetails?: Maybe<WorkspaceMehfilDetailsType>;
  workspaceUpdatePoll?: Maybe<WorkspacePollType>;
  workspaceUpdateProject?: Maybe<WorkspaceProjectType>;
  workspaceUpdateTask?: Maybe<WorkspaceTaskType>;
  workspaceWithdrawPollVote?: Maybe<WorkspacePollType>;
};


export type MutationAbortPurchasingAttachmentUploadArgs = {
  uploadId: Scalars['String']['input'];
};


export type MutationAddCommitteeMemberArgs = {
  committeeId: Scalars['String']['input'];
  karkunId: Scalars['String']['input'];
  role?: InputMaybe<Scalars['String']['input']>;
};


export type MutationAddHrEmployeeAttachmentArgs = {
  _id: Scalars['String']['input'];
  attachmentId: Scalars['String']['input'];
};


export type MutationAddHrEmployeesGroupMemberArgs = {
  groupId: Scalars['String']['input'];
  karkunId: Scalars['String']['input'];
};


export type MutationAddHrEmployeesPermissionCommitteeArgs = {
  committeeId: Scalars['String']['input'];
  permissionKey: Scalars['String']['input'];
};


export type MutationAddHrEmployeesPermissionGroupArgs = {
  groupId: Scalars['String']['input'];
  permissionKey: Scalars['String']['input'];
};


export type MutationAddHrEmployeesPermissionUserArgs = {
  karkunId: Scalars['String']['input'];
  permissionKey: Scalars['String']['input'];
};


export type MutationAddHrKarkunAttachmentArgs = {
  _id: Scalars['String']['input'];
  attachmentId: Scalars['String']['input'];
};


export type MutationAddHrKarkunsGroupMemberArgs = {
  groupId: Scalars['String']['input'];
  karkunId: Scalars['String']['input'];
};


export type MutationAddHrKarkunsPermissionCommitteeArgs = {
  committeeId: Scalars['String']['input'];
  permissionKey: Scalars['String']['input'];
};


export type MutationAddHrKarkunsPermissionGroupArgs = {
  groupId: Scalars['String']['input'];
  permissionKey: Scalars['String']['input'];
};


export type MutationAddHrKarkunsPermissionUserArgs = {
  karkunId: Scalars['String']['input'];
  permissionKey: Scalars['String']['input'];
};


export type MutationAddIssuanceFormAttachmentArgs = {
  _id: Scalars['String']['input'];
  attachmentId: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type MutationAddOrgLocationFeatureUserArgs = {
  featureKey: Scalars['String']['input'];
  karkunId: Scalars['String']['input'];
  locationId: Scalars['String']['input'];
  permissionKey: Scalars['String']['input'];
};


export type MutationAddOrgLocationObserverArgs = {
  karkunId: Scalars['String']['input'];
  locationId: Scalars['String']['input'];
};


export type MutationAddPhysicalStoreAccessGroupArgs = {
  groupId: Scalars['String']['input'];
  permission: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type MutationAddPhysicalStoreAccessUserArgs = {
  karkunId: Scalars['String']['input'];
  permission: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type MutationAddPurchaseFormAttachmentArgs = {
  _id: Scalars['String']['input'];
  attachmentId: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type MutationAddPurchasingGroupMemberArgs = {
  groupId: Scalars['String']['input'];
  karkunId: Scalars['String']['input'];
};


export type MutationAddPurchasingPermissionCommitteeArgs = {
  committeeId: Scalars['String']['input'];
  permissionKey: Scalars['String']['input'];
};


export type MutationAddPurchasingPermissionGroupArgs = {
  groupId: Scalars['String']['input'];
  permissionKey: Scalars['String']['input'];
};


export type MutationAddPurchasingPermissionUserArgs = {
  karkunId: Scalars['String']['input'];
  permissionKey: Scalars['String']['input'];
};


export type MutationAddSecurityEventKarkunArgs = {
  dutyId: Scalars['String']['input'];
  eventId: Scalars['String']['input'];
  karkunId: Scalars['String']['input'];
};


export type MutationAddSecurityGroupMemberArgs = {
  groupId: Scalars['String']['input'];
  karkunId: Scalars['String']['input'];
};


export type MutationAddSecurityPermissionCommitteeArgs = {
  committeeId: Scalars['String']['input'];
  permissionKey: Scalars['String']['input'];
};


export type MutationAddSecurityPermissionGroupArgs = {
  groupId: Scalars['String']['input'];
  permissionKey: Scalars['String']['input'];
};


export type MutationAddSecurityPermissionUserArgs = {
  karkunId: Scalars['String']['input'];
  permissionKey: Scalars['String']['input'];
};


export type MutationAddSecurityServerProfileImageArgs = {
  imageData: Scalars['String']['input'];
  profileId: Scalars['String']['input'];
};


export type MutationAddStoreUserGroupMemberArgs = {
  groupId: Scalars['String']['input'];
  karkunId: Scalars['String']['input'];
};


export type MutationAddTeamCoordinatorArgs = {
  karkunId: Scalars['String']['input'];
  teamId: Scalars['String']['input'];
};


export type MutationAddTeamMemberArgs = {
  daysOfWeek: Array<Scalars['String']['input']>;
  karkunId: Scalars['String']['input'];
  teamId: Scalars['String']['input'];
};


export type MutationAddWorkspaceMonitoringProfilePhotoArgs = {
  committeeId: Scalars['String']['input'];
  imageData: Scalars['String']['input'];
  profileId: Scalars['String']['input'];
};


export type MutationApproveIssuanceFormsArgs = {
  _ids: Array<InputMaybe<Scalars['String']['input']>>;
  physicalStoreId: Scalars['String']['input'];
};


export type MutationApproveLeaveRequestArgs = {
  _id: Scalars['String']['input'];
};


export type MutationApprovePurchaseFormsArgs = {
  _ids: Array<InputMaybe<Scalars['String']['input']>>;
  physicalStoreId: Scalars['String']['input'];
};


export type MutationApprovePurchasingOrderArgs = {
  _id: Scalars['String']['input'];
};


export type MutationApprovePurchasingPettyCashReplenishmentArgs = {
  _id: Scalars['String']['input'];
};


export type MutationApprovePurchasingPettyCashVoucherArgs = {
  _id: Scalars['String']['input'];
};


export type MutationApprovePurchasingRequisitionArgs = {
  _id: Scalars['String']['input'];
};


export type MutationApproveStockAdjustmentsArgs = {
  _ids: Array<InputMaybe<Scalars['String']['input']>>;
  physicalStoreId: Scalars['String']['input'];
};


export type MutationCancelLeaveRequestArgs = {
  _id: Scalars['String']['input'];
};


export type MutationCancelPurchasingOrderArgs = {
  _id: Scalars['String']['input'];
};


export type MutationCancelPurchasingRequisitionArgs = {
  _id: Scalars['String']['input'];
};


export type MutationCancelStoreRequisitionArgs = {
  _id: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type MutationCancelVisitorStayArgs = {
  _id: Scalars['String']['input'];
};


export type MutationChangeEmployeeJobArgs = {
  effectiveDate: Scalars['String']['input'];
  jobId: Scalars['String']['input'];
  jobShiftId?: InputMaybe<Scalars['String']['input']>;
  personId: Scalars['String']['input'];
  remarks?: InputMaybe<Scalars['String']['input']>;
};


export type MutationClearJobDefinitionScheduleArgs = {
  _id: Scalars['String']['input'];
};


export type MutationClearLoginBlocksArgs = {
  userId: Scalars['String']['input'];
};


export type MutationClosePurchasingOrderArgs = {
  _id: Scalars['String']['input'];
};


export type MutationClosePurchasingRequisitionArgs = {
  _id: Scalars['String']['input'];
};


export type MutationCompletePurchasingAttachmentUploadArgs = {
  uploadId: Scalars['String']['input'];
};


export type MutationConfirmEmployeeArgs = {
  confirmationDate: Scalars['String']['input'];
  personId: Scalars['String']['input'];
  remarks?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateChatAccountArgs = {
  userId: Scalars['String']['input'];
};


export type MutationCreateCityArgs = {
  country: Scalars['String']['input'];
  name: Scalars['String']['input'];
  peripheryOf?: InputMaybe<Scalars['String']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateCityMehfilArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  cityId: Scalars['String']['input'];
  lcdAvailability?: InputMaybe<Scalars['Boolean']['input']>;
  mehfilStartYear?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  otherMehfilDetails?: InputMaybe<Scalars['String']['input']>;
  tabAvailability?: InputMaybe<Scalars['Boolean']['input']>;
  timingDetails?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateCommitteeArgs = {
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  locationId: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type MutationCreateDutyArgs = {
  committeeId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isMehfilDuty: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
};


export type MutationCreateDutyLocationArgs = {
  dutyId: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type MutationCreateDutyShiftArgs = {
  dutyId: Scalars['String']['input'];
  endTime?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  startTime?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateHrEmployeesUserGroupArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


export type MutationCreateHrKarkunArgs = {
  birthDate?: InputMaybe<Scalars['String']['input']>;
  bloodGroup?: InputMaybe<Scalars['String']['input']>;
  cityLocationId?: InputMaybe<Scalars['String']['input']>;
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  contactNumber1?: InputMaybe<Scalars['String']['input']>;
  contactNumber2?: InputMaybe<Scalars['String']['input']>;
  currentAddress?: InputMaybe<Scalars['String']['input']>;
  educationalQualification?: InputMaybe<Scalars['String']['input']>;
  ehadDate?: InputMaybe<Scalars['String']['input']>;
  emailAddress?: InputMaybe<Scalars['String']['input']>;
  meansOfEarning?: InputMaybe<Scalars['String']['input']>;
  mehfilLocationId?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  parentName?: InputMaybe<Scalars['String']['input']>;
  permanentAddress?: InputMaybe<Scalars['String']['input']>;
  referenceName?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateHrKarkunsUserGroupArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


export type MutationCreateIssuanceFormArgs = {
  handedOverTo?: InputMaybe<Scalars['String']['input']>;
  issueDate: Scalars['String']['input'];
  issuedBy: Scalars['String']['input'];
  issuedTo: Scalars['String']['input'];
  items?: InputMaybe<Array<InputMaybe<ItemWithQuantityInput>>>;
  locationId?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  physicalStoreId: Scalars['String']['input'];
};


export type MutationCreateItemCategoryArgs = {
  name: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type MutationCreateJobArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


export type MutationCreateJobShiftArgs = {
  endTime?: InputMaybe<Scalars['String']['input']>;
  jobId: Scalars['String']['input'];
  name: Scalars['String']['input'];
  startTime?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateLeaveAdjustmentArgs = {
  days: Scalars['Float']['input'];
  leaveTypeId: Scalars['String']['input'];
  personId: Scalars['String']['input'];
  reason: Scalars['String']['input'];
  year: Scalars['Int']['input'];
};


export type MutationCreateLeaveRequestArgs = {
  fromDate: Scalars['String']['input'];
  halfDay?: InputMaybe<Scalars['Boolean']['input']>;
  leaveTypeId: Scalars['String']['input'];
  personId: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  toDate: Scalars['String']['input'];
};


export type MutationCreateLeaveTypeArgs = {
  allowCarryForward: Scalars['Boolean']['input'];
  annualEntitlementDays: Scalars['Float']['input'];
  isActive: Scalars['Boolean']['input'];
  isPaid: Scalars['Boolean']['input'];
  maxCarryForwardDays?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
};


export type MutationCreateLocationArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  parentId?: InputMaybe<Scalars['String']['input']>;
  physicalStoreId: Scalars['String']['input'];
};


export type MutationCreateMehfilDutyArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


export type MutationCreateOrgLocationArgs = {
  mehfilDetails?: InputMaybe<OrgLocationMehfilDetailsInput>;
  name: Scalars['String']['input'];
  parentId?: InputMaybe<Scalars['String']['input']>;
  type: Scalars['String']['input'];
};


export type MutationCreateOrgLocationUserChatAccountArgs = {
  locationId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationCreatePeopleTagArgs = {
  color: Scalars['String']['input'];
  moduleNames: Array<InputMaybe<Scalars['String']['input']>>;
  name: Scalars['String']['input'];
  textColor: Scalars['String']['input'];
};


export type MutationCreatePhysicalStoreArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


export type MutationCreatePurchaseFormArgs = {
  items?: InputMaybe<Array<InputMaybe<ItemWithQuantityAndPriceInput>>>;
  locationId?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  physicalStoreId: Scalars['String']['input'];
  purchaseDate: Scalars['String']['input'];
  purchasedBy: Scalars['String']['input'];
  receivedBy: Scalars['String']['input'];
  vendorId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreatePurchasingAttachmentUploadArgs = {
  fileName: Scalars['String']['input'];
  mimeType: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  ownerId: Scalars['String']['input'];
  ownerType: Scalars['String']['input'];
  size: Scalars['Int']['input'];
};


export type MutationCreatePurchasingCatalogItemArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  company?: InputMaybe<Scalars['String']['input']>;
  defaultUnitPrice?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  unit: Scalars['String']['input'];
};


export type MutationCreatePurchasingInvoiceArgs = {
  allowOverBilling?: InputMaybe<Scalars['Boolean']['input']>;
  dueDate?: InputMaybe<Scalars['String']['input']>;
  invoiceDate: Scalars['String']['input'];
  lines: Array<PurchasingPricedLineInput>;
  notes?: InputMaybe<Scalars['String']['input']>;
  vendorId: Scalars['String']['input'];
  vendorInvoiceNo: Scalars['String']['input'];
};


export type MutationCreatePurchasingOrderFromQuoteArgs = {
  quoteId: Scalars['String']['input'];
};


export type MutationCreatePurchasingOrderFromRequisitionArgs = {
  requisitionId: Scalars['String']['input'];
  vendorId: Scalars['String']['input'];
};


export type MutationCreatePurchasingPettyCashExpenseHeadArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


export type MutationCreatePurchasingPettyCashFundArgs = {
  custodianPersonId: Scalars['String']['input'];
  floatAmount: Scalars['Float']['input'];
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  perTransactionLimit?: InputMaybe<Scalars['Float']['input']>;
};


export type MutationCreatePurchasingPettyCashVoucherArgs = {
  expenseHeadId: Scalars['String']['input'];
  fundId: Scalars['String']['input'];
  lines: Array<PurchasingPettyCashVoucherLineInput>;
  payee?: InputMaybe<Scalars['String']['input']>;
  purpose?: InputMaybe<Scalars['String']['input']>;
  vendorId?: InputMaybe<Scalars['String']['input']>;
  voucherDate: Scalars['String']['input'];
};


export type MutationCreatePurchasingQuoteArgs = {
  lines: Array<PurchasingPricedLineInput>;
  notes?: InputMaybe<Scalars['String']['input']>;
  quoteDate: Scalars['String']['input'];
  reference?: InputMaybe<Scalars['String']['input']>;
  requisitionId: Scalars['String']['input'];
  validUntil?: InputMaybe<Scalars['String']['input']>;
  vendorId: Scalars['String']['input'];
};


export type MutationCreatePurchasingRequisitionArgs = {
  lines: Array<PurchasingRequisitionLineInput>;
  neededBy?: InputMaybe<Scalars['String']['input']>;
  purpose?: InputMaybe<Scalars['String']['input']>;
  requestedBy?: InputMaybe<Scalars['String']['input']>;
  requestedFor?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};


export type MutationCreatePurchasingUserGroupArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


export type MutationCreatePurchasingVendorArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  bankAccountNumber?: InputMaybe<Scalars['String']['input']>;
  bankAccountTitle?: InputMaybe<Scalars['String']['input']>;
  bankName?: InputMaybe<Scalars['String']['input']>;
  contactPerson?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  paymentTermsDays?: InputMaybe<Scalars['Int']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  taxId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateSalariesArgs = {
  month: Scalars['String']['input'];
};


export type MutationCreateSecurityEventArgs = {
  eventDate: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type MutationCreateSecurityEventDutyArgs = {
  name: Scalars['String']['input'];
  urduName: Scalars['String']['input'];
};


export type MutationCreateSecurityEventLangarDishArgs = {
  name: Scalars['String']['input'];
  urduName: Scalars['String']['input'];
};


export type MutationCreateSecurityEventLangarLocationArgs = {
  name: Scalars['String']['input'];
  urduName: Scalars['String']['input'];
};


export type MutationCreateSecurityServerChannelArgs = {
  connection: SecurityServerChannelConnectionInput;
  enabled: Scalars['Boolean']['input'];
  minFaceQuality?: InputMaybe<Scalars['Int']['input']>;
  minFaceSizePx?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  recognitionFps: Scalars['Float']['input'];
  similarityThreshold?: InputMaybe<Scalars['Float']['input']>;
};


export type MutationCreateSecurityServerProfileArgs = {
  isTest: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
};


export type MutationCreateSecurityUserGroupArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


export type MutationCreateSecurityVisitorArgs = {
  birthDate?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  contactNumber1?: InputMaybe<Scalars['String']['input']>;
  contactNumber2?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  currentAddress?: InputMaybe<Scalars['String']['input']>;
  educationalQualification?: InputMaybe<Scalars['String']['input']>;
  ehadDate: Scalars['String']['input'];
  imageData?: InputMaybe<Scalars['String']['input']>;
  meansOfEarning?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  parentName: Scalars['String']['input'];
  permanentAddress?: InputMaybe<Scalars['String']['input']>;
  referenceName: Scalars['String']['input'];
  tagIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type MutationCreateServiceAccountArgs = {
  displayName?: InputMaybe<Scalars['String']['input']>;
  userName: Scalars['String']['input'];
};


export type MutationCreateStockAdjustmentArgs = {
  adjustedBy: Scalars['String']['input'];
  adjustmentDate: Scalars['String']['input'];
  adjustmentReason?: InputMaybe<Scalars['String']['input']>;
  isInflow: Scalars['Boolean']['input'];
  physicalStoreId: Scalars['String']['input'];
  quantity: Scalars['Float']['input'];
  stockItemId: Scalars['String']['input'];
};


export type MutationCreateStockItemArgs = {
  categoryId: Scalars['String']['input'];
  company?: InputMaybe<Scalars['String']['input']>;
  currentStockLevel?: InputMaybe<Scalars['Float']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  minStockLevel?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
  unitOfMeasurement: Scalars['String']['input'];
};


export type MutationCreateStoreRequisitionArgs = {
  lines: Array<PurchasingRequisitionLineInput>;
  neededBy?: InputMaybe<Scalars['String']['input']>;
  physicalStoreId: Scalars['String']['input'];
  purpose?: InputMaybe<Scalars['String']['input']>;
  requestedBy?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};


export type MutationCreateStoreUserGroupArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


export type MutationCreateTeamArgs = {
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  dutyId: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type MutationCreateUserArgs = {
  displayName?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  personId?: InputMaybe<Scalars['String']['input']>;
  userName?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateUserGroupArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  moduleName?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


export type MutationCreateVendorArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  contactNumber?: InputMaybe<Scalars['String']['input']>;
  contactPerson?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  physicalStoreId: Scalars['String']['input'];
};


export type MutationCreateVisitorStayArgs = {
  dutyId?: InputMaybe<Scalars['String']['input']>;
  numOfDays: Scalars['Float']['input'];
  shiftId?: InputMaybe<Scalars['String']['input']>;
  stayAllowedBy?: InputMaybe<Scalars['String']['input']>;
  stayReason?: InputMaybe<Scalars['String']['input']>;
  visitorId: Scalars['String']['input'];
};


export type MutationDeleteAllSalariesArgs = {
  month: Scalars['String']['input'];
};


export type MutationDeleteDuplicatePeopleArgs = {
  _ids: Array<InputMaybe<Scalars['String']['input']>>;
};


export type MutationDeleteHrEmployeesUserGroupArgs = {
  _id: Scalars['String']['input'];
};


export type MutationDeleteHrKarkunArgs = {
  _id: Scalars['String']['input'];
};


export type MutationDeleteHrKarkunsUserGroupArgs = {
  _id: Scalars['String']['input'];
};


export type MutationDeleteMehfilDutyArgs = {
  _id: Scalars['String']['input'];
};


export type MutationDeletePeopleTagArgs = {
  _id: Scalars['String']['input'];
};


export type MutationDeletePurchasingAttachmentArgs = {
  _id: Scalars['String']['input'];
};


export type MutationDeletePurchasingOrderArgs = {
  _id: Scalars['String']['input'];
};


export type MutationDeletePurchasingPettyCashExpenseHeadArgs = {
  _id: Scalars['String']['input'];
};


export type MutationDeletePurchasingPettyCashVoucherArgs = {
  _id: Scalars['String']['input'];
};


export type MutationDeletePurchasingQuoteArgs = {
  _id: Scalars['String']['input'];
};


export type MutationDeletePurchasingRequisitionArgs = {
  _id: Scalars['String']['input'];
};


export type MutationDeletePurchasingUserGroupArgs = {
  _id: Scalars['String']['input'];
};


export type MutationDeleteSalariesArgs = {
  ids: Array<InputMaybe<Scalars['String']['input']>>;
  month: Scalars['String']['input'];
};


export type MutationDeleteSecurityServerChannelArgs = {
  _id: Scalars['String']['input'];
};


export type MutationDeleteSecurityServerProfileArgs = {
  _id: Scalars['String']['input'];
};


export type MutationDeleteSecurityUserGroupArgs = {
  _id: Scalars['String']['input'];
};


export type MutationDeleteSecurityVisitorArgs = {
  _id: Scalars['String']['input'];
};


export type MutationDeleteStoreRequisitionArgs = {
  _id: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type MutationDeleteStoreUserGroupArgs = {
  _id: Scalars['String']['input'];
};


export type MutationDeleteUserGroupArgs = {
  _id: Scalars['String']['input'];
};


export type MutationDisableCommitteeFeatureArgs = {
  committeeId: Scalars['String']['input'];
  featureKey: Scalars['String']['input'];
};


export type MutationDisableTwoFactorArgs = {
  code: Scalars['String']['input'];
};


export type MutationEnableCommitteeFeatureArgs = {
  committeeId: Scalars['String']['input'];
  featureKey: Scalars['String']['input'];
};


export type MutationEnableTwoFactorArgs = {
  code: Scalars['String']['input'];
};


export type MutationEnrollTrustedDeviceArgs = {
  code?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pin: Scalars['String']['input'];
  replaceDeviceId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationExitEmployeeArgs = {
  endDate: Scalars['String']['input'];
  exitReason: Scalars['String']['input'];
  personId: Scalars['String']['input'];
  remarks?: InputMaybe<Scalars['String']['input']>;
};


export type MutationFixNameSpellingArgs = {
  existingSpelling: Scalars['String']['input'];
  newSpelling: Scalars['String']['input'];
};


export type MutationHardDeletePeopleArgs = {
  _ids: Array<Scalars['String']['input']>;
};


export type MutationHireEmployeeArgs = {
  jobId: Scalars['String']['input'];
  jobShiftId?: InputMaybe<Scalars['String']['input']>;
  onProbation: Scalars['Boolean']['input'];
  personId: Scalars['String']['input'];
  probationEndDate?: InputMaybe<Scalars['String']['input']>;
  remarks?: InputMaybe<Scalars['String']['input']>;
  startDate: Scalars['String']['input'];
};


export type MutationImportSecurityVisitorsCsvDataArgs = {
  csvData: Scalars['String']['input'];
};


export type MutationLinkOrgLocationUserArgs = {
  karkunId: Scalars['String']['input'];
  locationId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationMarkNotificationsReadArgs = {
  ids: Array<InputMaybe<Scalars['String']['input']>>;
};


export type MutationMarkPurchasingOrderSentArgs = {
  _id: Scalars['String']['input'];
};


export type MutationMergeStockItemsArgs = {
  _idToKeep: Scalars['String']['input'];
  _idsToMerge: Array<InputMaybe<Scalars['String']['input']>>;
  physicalStoreId: Scalars['String']['input'];
};


export type MutationMoveCommitteeArgs = {
  committeeId: Scalars['String']['input'];
  locationId: Scalars['String']['input'];
};


export type MutationPostPurchasingPaymentArgs = {
  allocations: Array<PurchasingPaymentAllocationInput>;
  method: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  paymentDate: Scalars['String']['input'];
  reference?: InputMaybe<Scalars['String']['input']>;
  vendorId: Scalars['String']['input'];
};


export type MutationPostPurchasingReceiptArgs = {
  deliveryNoteNo?: InputMaybe<Scalars['String']['input']>;
  lines: Array<PurchasingReceiptLineInput>;
  notes?: InputMaybe<Scalars['String']['input']>;
  orderId: Scalars['String']['input'];
  receivedBy?: InputMaybe<Scalars['String']['input']>;
  receivedDate: Scalars['String']['input'];
};


export type MutationPostStoreReceiptArgs = {
  deliveryNoteNo?: InputMaybe<Scalars['String']['input']>;
  lines: Array<PurchasingReceiptLineInput>;
  notes?: InputMaybe<Scalars['String']['input']>;
  orderId: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
  receivedBy?: InputMaybe<Scalars['String']['input']>;
  receivedDate: Scalars['String']['input'];
};


export type MutationPromoteHrKarkunArgs = {
  _id: Scalars['String']['input'];
  cityLocationId: Scalars['String']['input'];
  mehfilLocationId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationRecalculateStockLevelsArgs = {
  _ids: Array<InputMaybe<Scalars['String']['input']>>;
  physicalStoreId: Scalars['String']['input'];
};


export type MutationRecordLeaveConfirmationArgs = {
  _id: Scalars['String']['input'];
  confirmationRemarks?: InputMaybe<Scalars['String']['input']>;
  confirmedOn?: InputMaybe<Scalars['String']['input']>;
  confirmedWithPersonId: Scalars['String']['input'];
  version: Scalars['Int']['input'];
};


export type MutationRegisterUserArgs = {
  displayName: Scalars['String']['input'];
  email: Scalars['String']['input'];
};


export type MutationRejectLeaveRequestArgs = {
  _id: Scalars['String']['input'];
  rejectionReason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationRejectPurchasingOrderArgs = {
  _id: Scalars['String']['input'];
  reason: Scalars['String']['input'];
};


export type MutationRejectPurchasingPettyCashReplenishmentArgs = {
  _id: Scalars['String']['input'];
  reason: Scalars['String']['input'];
};


export type MutationRejectPurchasingPettyCashVoucherArgs = {
  _id: Scalars['String']['input'];
  reason: Scalars['String']['input'];
};


export type MutationRejectPurchasingQuoteArgs = {
  _id: Scalars['String']['input'];
};


export type MutationRejectPurchasingRequisitionArgs = {
  _id: Scalars['String']['input'];
  reason: Scalars['String']['input'];
};


export type MutationRejoinEmployeeArgs = {
  jobId: Scalars['String']['input'];
  jobShiftId?: InputMaybe<Scalars['String']['input']>;
  onProbation: Scalars['Boolean']['input'];
  personId: Scalars['String']['input'];
  probationEndDate?: InputMaybe<Scalars['String']['input']>;
  remarks?: InputMaybe<Scalars['String']['input']>;
  startDate: Scalars['String']['input'];
};


export type MutationRemoveCityArgs = {
  _id: Scalars['String']['input'];
};


export type MutationRemoveCityMehfilArgs = {
  _id: Scalars['String']['input'];
};


export type MutationRemoveCommitteeArgs = {
  _id: Scalars['String']['input'];
};


export type MutationRemoveCommitteeMemberArgs = {
  committeeId: Scalars['String']['input'];
  karkunId: Scalars['String']['input'];
};


export type MutationRemoveDutyArgs = {
  _id: Scalars['String']['input'];
};


export type MutationRemoveDutyLocationArgs = {
  _id: Scalars['String']['input'];
};


export type MutationRemoveDutyShiftArgs = {
  _id: Scalars['String']['input'];
};


export type MutationRemoveHrEmployeeAttachmentArgs = {
  _id: Scalars['String']['input'];
  attachmentId: Scalars['String']['input'];
};


export type MutationRemoveHrEmployeesGroupMemberArgs = {
  groupId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationRemoveHrEmployeesPermissionCommitteeArgs = {
  committeeId: Scalars['String']['input'];
  permissionKey: Scalars['String']['input'];
};


export type MutationRemoveHrEmployeesPermissionGroupArgs = {
  groupId: Scalars['String']['input'];
  permissionKey: Scalars['String']['input'];
};


export type MutationRemoveHrEmployeesPermissionUserArgs = {
  permissionKey: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationRemoveHrKarkunAttachmentArgs = {
  _id: Scalars['String']['input'];
  attachmentId: Scalars['String']['input'];
};


export type MutationRemoveHrKarkunsGroupMemberArgs = {
  groupId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationRemoveHrKarkunsPermissionCommitteeArgs = {
  committeeId: Scalars['String']['input'];
  permissionKey: Scalars['String']['input'];
};


export type MutationRemoveHrKarkunsPermissionGroupArgs = {
  groupId: Scalars['String']['input'];
  permissionKey: Scalars['String']['input'];
};


export type MutationRemoveHrKarkunsPermissionUserArgs = {
  permissionKey: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationRemoveIssuanceFormAttachmentArgs = {
  _id: Scalars['String']['input'];
  attachmentId: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type MutationRemoveIssuanceFormsArgs = {
  _ids: Array<InputMaybe<Scalars['String']['input']>>;
  physicalStoreId: Scalars['String']['input'];
};


export type MutationRemoveItemCategoryArgs = {
  _id: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type MutationRemoveJobArgs = {
  _id: Scalars['String']['input'];
};


export type MutationRemoveJobShiftArgs = {
  _id: Scalars['String']['input'];
};


export type MutationRemoveLeaveAdjustmentArgs = {
  _id: Scalars['String']['input'];
};


export type MutationRemoveLeaveTypeArgs = {
  _id: Scalars['String']['input'];
};


export type MutationRemoveLocationArgs = {
  _id: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type MutationRemoveOrgLocationFeatureUserArgs = {
  featureKey: Scalars['String']['input'];
  locationId: Scalars['String']['input'];
  permissionKey: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationRemoveOrgLocationObserverArgs = {
  karkunId: Scalars['String']['input'];
  locationId: Scalars['String']['input'];
};


export type MutationRemovePhysicalStoreAccessGroupArgs = {
  groupId: Scalars['String']['input'];
  permission: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type MutationRemovePhysicalStoreAccessUserArgs = {
  permission: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationRemovePurchaseFormAttachmentArgs = {
  _id: Scalars['String']['input'];
  attachmentId: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type MutationRemovePurchaseFormsArgs = {
  _ids: Array<InputMaybe<Scalars['String']['input']>>;
  physicalStoreId: Scalars['String']['input'];
};


export type MutationRemovePurchasingCatalogItemArgs = {
  _id: Scalars['String']['input'];
};


export type MutationRemovePurchasingCatalogItemImageArgs = {
  _id: Scalars['String']['input'];
};


export type MutationRemovePurchasingGroupMemberArgs = {
  groupId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationRemovePurchasingPermissionCommitteeArgs = {
  committeeId: Scalars['String']['input'];
  permissionKey: Scalars['String']['input'];
};


export type MutationRemovePurchasingPermissionGroupArgs = {
  groupId: Scalars['String']['input'];
  permissionKey: Scalars['String']['input'];
};


export type MutationRemovePurchasingPermissionUserArgs = {
  permissionKey: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationRemovePurchasingVendorArgs = {
  _id: Scalars['String']['input'];
};


export type MutationRemoveSecurityEventArgs = {
  _id: Scalars['String']['input'];
};


export type MutationRemoveSecurityEventDutyArgs = {
  _id: Scalars['String']['input'];
};


export type MutationRemoveSecurityEventKarkunArgs = {
  _id: Scalars['String']['input'];
};


export type MutationRemoveSecurityEventLangarDishArgs = {
  _id: Scalars['String']['input'];
};


export type MutationRemoveSecurityEventLangarLocationArgs = {
  _id: Scalars['String']['input'];
};


export type MutationRemoveSecurityGroupMemberArgs = {
  groupId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationRemoveSecurityPermissionCommitteeArgs = {
  committeeId: Scalars['String']['input'];
  permissionKey: Scalars['String']['input'];
};


export type MutationRemoveSecurityPermissionGroupArgs = {
  groupId: Scalars['String']['input'];
  permissionKey: Scalars['String']['input'];
};


export type MutationRemoveSecurityPermissionUserArgs = {
  permissionKey: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationRemoveSecurityServerProfileImageArgs = {
  imageId: Scalars['String']['input'];
  profileId: Scalars['String']['input'];
};


export type MutationRemoveStockAdjustmentsArgs = {
  _ids: Array<InputMaybe<Scalars['String']['input']>>;
  physicalStoreId: Scalars['String']['input'];
};


export type MutationRemoveStockItemArgs = {
  _id: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type MutationRemoveStoreUserGroupMemberArgs = {
  groupId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationRemoveTeamArgs = {
  _id: Scalars['String']['input'];
};


export type MutationRemoveTeamCoordinatorArgs = {
  karkunId: Scalars['String']['input'];
  teamId: Scalars['String']['input'];
};


export type MutationRemoveTeamMemberArgs = {
  karkunId: Scalars['String']['input'];
  teamId: Scalars['String']['input'];
};


export type MutationRemoveTrustedDeviceArgs = {
  deviceId: Scalars['String']['input'];
};


export type MutationRemoveVendorArgs = {
  _id: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type MutationRemoveWorkspaceMonitoringProfilePhotoArgs = {
  committeeId: Scalars['String']['input'];
  photoId: Scalars['String']['input'];
  profileId: Scalars['String']['input'];
};


export type MutationRenameFreeFormCityArgs = {
  existingSpelling: Scalars['String']['input'];
  newSpelling: Scalars['String']['input'];
};


export type MutationRenameFreeFormCountryArgs = {
  existingSpelling: Scalars['String']['input'];
  newSpelling: Scalars['String']['input'];
};


export type MutationReopenPurchasingRequisitionArgs = {
  _id: Scalars['String']['input'];
};


export type MutationReopenStoreRequisitionArgs = {
  _id: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type MutationRequestPurchasingPettyCashReplenishmentArgs = {
  countedCash?: InputMaybe<Scalars['Float']['input']>;
  fundId: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  voucherIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type MutationResetJobDefinitionScheduleArgs = {
  _id: Scalars['String']['input'];
};


export type MutationResetOrgLocationUserPasswordArgs = {
  locationId: Scalars['String']['input'];
  password: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationResetTwoFactorArgs = {
  userId: Scalars['String']['input'];
};


export type MutationResetUserPasswordArgs = {
  password: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationRestorePersonArgs = {
  _id: Scalars['String']['input'];
};


export type MutationRetryFailedJobArgs = {
  _id: Scalars['String']['input'];
};


export type MutationRevokeUserTrustedDevicesArgs = {
  userId: Scalars['String']['input'];
};


export type MutationRunScheduledJobNowArgs = {
  name: Scalars['String']['input'];
};


export type MutationSelectPurchasingQuoteArgs = {
  _id: Scalars['String']['input'];
};


export type MutationSendInboxMessageArgs = {
  roomId: Scalars['String']['input'];
  text: Scalars['String']['input'];
};


export type MutationSetCommitteeMemberDiscussionAccessArgs = {
  committeeId: Scalars['String']['input'];
  hasAccess: Scalars['Boolean']['input'];
  karkunId: Scalars['String']['input'];
};


export type MutationSetCommitteeMemberRoleArgs = {
  committeeId: Scalars['String']['input'];
  karkunId: Scalars['String']['input'];
  role: Scalars['String']['input'];
};


export type MutationSetDutyAttendanceArgs = {
  date: Scalars['String']['input'];
  dutyId: Scalars['String']['input'];
  karkunId: Scalars['String']['input'];
  locationId: Scalars['String']['input'];
  shiftId: Scalars['String']['input'];
  status?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSetDutyDayOverrideArgs = {
  absentKarkunIds?: InputMaybe<Array<Scalars['String']['input']>>;
  addedKarkunIds?: InputMaybe<Array<Scalars['String']['input']>>;
  date: Scalars['String']['input'];
  dutyId: Scalars['String']['input'];
  locationId: Scalars['String']['input'];
  shiftId: Scalars['String']['input'];
};


export type MutationSetDutyDetailArgs = {
  dutyDetail?: InputMaybe<Scalars['String']['input']>;
  ids: Array<InputMaybe<Scalars['String']['input']>>;
};


export type MutationSetDutyShiftTeamArgs = {
  dutyId: Scalars['String']['input'];
  locationId: Scalars['String']['input'];
  shiftId: Scalars['String']['input'];
  teamId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSetHrEmployeeEmploymentInfoArgs = {
  _id: Scalars['String']['input'];
  bankAccountDetails?: InputMaybe<Scalars['String']['input']>;
  confirmationDate?: InputMaybe<Scalars['String']['input']>;
  employmentEndDate?: InputMaybe<Scalars['String']['input']>;
  employmentStartDate?: InputMaybe<Scalars['String']['input']>;
  jobShiftId?: InputMaybe<Scalars['String']['input']>;
  probationEndDate?: InputMaybe<Scalars['String']['input']>;
  reportsToPersonId?: InputMaybe<Scalars['String']['input']>;
  workingDays?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type MutationSetHrEmployeeProfileImageArgs = {
  _id: Scalars['String']['input'];
  imageData: Scalars['String']['input'];
};


export type MutationSetHrKarkunProfileImageArgs = {
  _id: Scalars['String']['input'];
  imageData: Scalars['String']['input'];
};


export type MutationSetJobDefinitionEnabledArgs = {
  _id: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
};


export type MutationSetOrgLocationUserLockedArgs = {
  locationId: Scalars['String']['input'];
  locked: Scalars['Boolean']['input'];
  userId: Scalars['String']['input'];
};


export type MutationSetPermissionsArgs = {
  permissions: Array<InputMaybe<Scalars['String']['input']>>;
  userId: Scalars['String']['input'];
};


export type MutationSetPurchasingCatalogItemActiveArgs = {
  _id: Scalars['String']['input'];
  isActive: Scalars['Boolean']['input'];
};


export type MutationSetPurchasingCatalogItemImageArgs = {
  _id: Scalars['String']['input'];
  imageData: Scalars['String']['input'];
};


export type MutationSetPurchasingInvoiceDisputedArgs = {
  _id: Scalars['String']['input'];
  isDisputed: Scalars['Boolean']['input'];
};


export type MutationSetPurchasingPettyCashExpenseHeadActiveArgs = {
  _id: Scalars['String']['input'];
  isActive: Scalars['Boolean']['input'];
};


export type MutationSetPurchasingPettyCashFundActiveArgs = {
  _id: Scalars['String']['input'];
  isActive: Scalars['Boolean']['input'];
};


export type MutationSetPurchasingVendorActiveArgs = {
  _id: Scalars['String']['input'];
  isActive: Scalars['Boolean']['input'];
};


export type MutationSetScheduledJobEnabledArgs = {
  _id: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
};


export type MutationSetSecurityServerAlertReviewArgs = {
  _id: Scalars['String']['input'];
  review?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSetSecurityServerProfileDefaultImageArgs = {
  imageId: Scalars['String']['input'];
  profileId: Scalars['String']['input'];
};


export type MutationSetSecurityVisitorImageArgs = {
  _id: Scalars['String']['input'];
  imageData: Scalars['String']['input'];
};


export type MutationSetStockItemImageArgs = {
  _id: Scalars['String']['input'];
  imageData: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type MutationSetSuperAdminArgs = {
  isSuperAdmin: Scalars['Boolean']['input'];
  userId: Scalars['String']['input'];
};


export type MutationSetUserGroupPermissionsArgs = {
  _id: Scalars['String']['input'];
  permissions: Array<InputMaybe<Scalars['String']['input']>>;
};


export type MutationSubmitPurchasingOrderArgs = {
  _id: Scalars['String']['input'];
};


export type MutationSubmitPurchasingPettyCashVoucherArgs = {
  _id: Scalars['String']['input'];
};


export type MutationSubmitPurchasingRequisitionArgs = {
  _id: Scalars['String']['input'];
};


export type MutationSubmitStoreRequisitionArgs = {
  _id: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type MutationSyncOrgLocationObserversArgs = {
  locationId: Scalars['String']['input'];
};


export type MutationUpdateAdminFaceRecognitionSettingsArgs = {
  matchThreshold: Scalars['Float']['input'];
  minDetectionScore: Scalars['Float']['input'];
  minFacePixels: Scalars['Int']['input'];
  minFacePose: Scalars['Int']['input'];
  minMatchMargin: Scalars['Float']['input'];
  minSharpness: Scalars['Int']['input'];
};


export type MutationUpdateAdminPeopleRegistrationImageSettingsArgs = {
  minDetectionScore: Scalars['Float']['input'];
  minFacePixels: Scalars['Int']['input'];
  minFacePose: Scalars['Int']['input'];
  minSharpness: Scalars['Int']['input'];
};


export type MutationUpdateAdminPeopleSearchFaceSettingsArgs = {
  matchThreshold: Scalars['Float']['input'];
  minDetectionScore: Scalars['Float']['input'];
  minFacePixels: Scalars['Int']['input'];
  minFacePose: Scalars['Int']['input'];
  minMatchMargin: Scalars['Float']['input'];
  minSharpness: Scalars['Int']['input'];
};


export type MutationUpdateAttachmentArgs = {
  _id: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateCityArgs = {
  _id: Scalars['String']['input'];
  country: Scalars['String']['input'];
  name: Scalars['String']['input'];
  peripheryOf?: InputMaybe<Scalars['String']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateCityMehfilArgs = {
  _id: Scalars['String']['input'];
  address?: InputMaybe<Scalars['String']['input']>;
  cityId: Scalars['String']['input'];
  lcdAvailability?: InputMaybe<Scalars['Boolean']['input']>;
  mehfilStartYear?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  otherMehfilDetails?: InputMaybe<Scalars['String']['input']>;
  tabAvailability?: InputMaybe<Scalars['Boolean']['input']>;
  timingDetails?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateCommitteeArgs = {
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type MutationUpdateDutyArgs = {
  committeeId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type MutationUpdateDutyLocationArgs = {
  dutyId: Scalars['String']['input'];
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type MutationUpdateDutyShiftArgs = {
  _id: Scalars['String']['input'];
  dutyId: Scalars['String']['input'];
  endTime?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  startTime?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateHrEmployeeArgs = {
  _id: Scalars['String']['input'];
  birthDate?: InputMaybe<Scalars['String']['input']>;
  bloodGroup?: InputMaybe<Scalars['String']['input']>;
  cityLocationId?: InputMaybe<Scalars['String']['input']>;
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  contactNumber1?: InputMaybe<Scalars['String']['input']>;
  contactNumber2?: InputMaybe<Scalars['String']['input']>;
  currentAddress?: InputMaybe<Scalars['String']['input']>;
  deathDate?: InputMaybe<Scalars['String']['input']>;
  educationalQualification?: InputMaybe<Scalars['String']['input']>;
  ehadDate?: InputMaybe<Scalars['String']['input']>;
  emailAddress?: InputMaybe<Scalars['String']['input']>;
  meansOfEarning?: InputMaybe<Scalars['String']['input']>;
  mehfilLocationId?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  parentName?: InputMaybe<Scalars['String']['input']>;
  permanentAddress?: InputMaybe<Scalars['String']['input']>;
  referenceName?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateHrEmployeesUserGroupArgs = {
  _id: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


export type MutationUpdateHrEmploymentSettingsArgs = {
  defaultProbationMonths: Scalars['Int']['input'];
};


export type MutationUpdateHrKarkunArgs = {
  _id: Scalars['String']['input'];
  birthDate?: InputMaybe<Scalars['String']['input']>;
  bloodGroup?: InputMaybe<Scalars['String']['input']>;
  cityLocationId?: InputMaybe<Scalars['String']['input']>;
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  contactNumber1?: InputMaybe<Scalars['String']['input']>;
  contactNumber2?: InputMaybe<Scalars['String']['input']>;
  currentAddress?: InputMaybe<Scalars['String']['input']>;
  deathDate?: InputMaybe<Scalars['String']['input']>;
  educationalQualification?: InputMaybe<Scalars['String']['input']>;
  ehadDate?: InputMaybe<Scalars['String']['input']>;
  emailAddress?: InputMaybe<Scalars['String']['input']>;
  meansOfEarning?: InputMaybe<Scalars['String']['input']>;
  mehfilLocationId?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  parentName?: InputMaybe<Scalars['String']['input']>;
  permanentAddress?: InputMaybe<Scalars['String']['input']>;
  referenceName?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateHrKarkunsUserGroupArgs = {
  _id: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


export type MutationUpdateIssuanceFormArgs = {
  _id: Scalars['String']['input'];
  handedOverTo?: InputMaybe<Scalars['String']['input']>;
  issueDate: Scalars['String']['input'];
  issuedBy: Scalars['String']['input'];
  issuedTo: Scalars['String']['input'];
  items?: InputMaybe<Array<InputMaybe<ItemWithQuantityInput>>>;
  locationId?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  physicalStoreId: Scalars['String']['input'];
};


export type MutationUpdateItemCategoryArgs = {
  _id: Scalars['String']['input'];
  name: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type MutationUpdateJobArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type MutationUpdateJobDefinitionScheduleArgs = {
  _id: Scalars['String']['input'];
  schedule: Scalars['String']['input'];
};


export type MutationUpdateJobShiftArgs = {
  _id: Scalars['String']['input'];
  endTime?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  startTime?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateLeaveTypeArgs = {
  _id: Scalars['String']['input'];
  allowCarryForward: Scalars['Boolean']['input'];
  annualEntitlementDays: Scalars['Float']['input'];
  isActive: Scalars['Boolean']['input'];
  isPaid: Scalars['Boolean']['input'];
  maxCarryForwardDays?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
};


export type MutationUpdateLocationArgs = {
  _id: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  parentId?: InputMaybe<Scalars['String']['input']>;
  physicalStoreId: Scalars['String']['input'];
};


export type MutationUpdateMehfilDutyArgs = {
  _id: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateOrgLocationArgs = {
  _id: Scalars['String']['input'];
  mehfilDetails?: InputMaybe<OrgLocationMehfilDetailsInput>;
  name: Scalars['String']['input'];
  parentId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdatePeopleTagArgs = {
  _id: Scalars['String']['input'];
  color: Scalars['String']['input'];
  moduleNames: Array<InputMaybe<Scalars['String']['input']>>;
  name: Scalars['String']['input'];
  textColor: Scalars['String']['input'];
};


export type MutationUpdatePhysicalStoreArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type MutationUpdatePurchaseFormArgs = {
  _id: Scalars['String']['input'];
  items?: InputMaybe<Array<InputMaybe<ItemWithQuantityAndPriceInput>>>;
  locationId?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  physicalStoreId: Scalars['String']['input'];
  purchaseDate: Scalars['String']['input'];
  purchasedBy: Scalars['String']['input'];
  receivedBy: Scalars['String']['input'];
  vendorId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdatePurchasingCatalogItemArgs = {
  _id: Scalars['String']['input'];
  category?: InputMaybe<Scalars['String']['input']>;
  company?: InputMaybe<Scalars['String']['input']>;
  defaultUnitPrice?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  unit: Scalars['String']['input'];
};


export type MutationUpdatePurchasingInvoiceArgs = {
  _id: Scalars['String']['input'];
  dueDate: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  vendorInvoiceNo: Scalars['String']['input'];
};


export type MutationUpdatePurchasingOrderArgs = {
  _id: Scalars['String']['input'];
  deliveryAddress?: InputMaybe<Scalars['String']['input']>;
  discount?: InputMaybe<Scalars['Float']['input']>;
  expectedDeliveryDate?: InputMaybe<Scalars['String']['input']>;
  lines: Array<PurchasingPricedLineInput>;
  notes?: InputMaybe<Scalars['String']['input']>;
  orderDate: Scalars['String']['input'];
  paymentTermsDays?: InputMaybe<Scalars['Int']['input']>;
  shipping?: InputMaybe<Scalars['Float']['input']>;
  vendorId: Scalars['String']['input'];
  version: Scalars['Int']['input'];
};


export type MutationUpdatePurchasingPettyCashExpenseHeadArgs = {
  _id: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


export type MutationUpdatePurchasingPettyCashFundArgs = {
  _id: Scalars['String']['input'];
  custodianPersonId: Scalars['String']['input'];
  floatAmount: Scalars['Float']['input'];
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  perTransactionLimit?: InputMaybe<Scalars['Float']['input']>;
};


export type MutationUpdatePurchasingPettyCashVoucherArgs = {
  _id: Scalars['String']['input'];
  expenseHeadId: Scalars['String']['input'];
  lines: Array<PurchasingPettyCashVoucherLineInput>;
  payee?: InputMaybe<Scalars['String']['input']>;
  purpose?: InputMaybe<Scalars['String']['input']>;
  vendorId?: InputMaybe<Scalars['String']['input']>;
  voucherDate: Scalars['String']['input'];
};


export type MutationUpdatePurchasingQuoteArgs = {
  _id: Scalars['String']['input'];
  lines: Array<PurchasingPricedLineInput>;
  notes?: InputMaybe<Scalars['String']['input']>;
  quoteDate: Scalars['String']['input'];
  reference?: InputMaybe<Scalars['String']['input']>;
  requisitionId: Scalars['String']['input'];
  validUntil?: InputMaybe<Scalars['String']['input']>;
  vendorId: Scalars['String']['input'];
  version: Scalars['Int']['input'];
};


export type MutationUpdatePurchasingRequisitionArgs = {
  _id: Scalars['String']['input'];
  lines: Array<PurchasingRequisitionLineInput>;
  neededBy?: InputMaybe<Scalars['String']['input']>;
  purpose?: InputMaybe<Scalars['String']['input']>;
  requestedBy?: InputMaybe<Scalars['String']['input']>;
  requestedFor?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
  version: Scalars['Int']['input'];
};


export type MutationUpdatePurchasingUserGroupArgs = {
  _id: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


export type MutationUpdatePurchasingVendorArgs = {
  _id: Scalars['String']['input'];
  address?: InputMaybe<Scalars['String']['input']>;
  bankAccountNumber?: InputMaybe<Scalars['String']['input']>;
  bankAccountTitle?: InputMaybe<Scalars['String']['input']>;
  bankName?: InputMaybe<Scalars['String']['input']>;
  contactPerson?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  paymentTermsDays?: InputMaybe<Scalars['Int']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  taxId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateSalaryArgs = {
  _id: Scalars['String']['input'];
  arrears?: InputMaybe<Scalars['Int']['input']>;
  loanDeduction?: InputMaybe<Scalars['Int']['input']>;
  newLoan?: InputMaybe<Scalars['Int']['input']>;
  openingLoan?: InputMaybe<Scalars['Int']['input']>;
  otherDeduction?: InputMaybe<Scalars['Int']['input']>;
  rashanMadad?: InputMaybe<Scalars['Int']['input']>;
  salary?: InputMaybe<Scalars['Int']['input']>;
};


export type MutationUpdateSecurityEventArgs = {
  _id: Scalars['String']['input'];
  eventDate?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


export type MutationUpdateSecurityEventDutyArgs = {
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
  urduName: Scalars['String']['input'];
};


export type MutationUpdateSecurityEventLangarDishArgs = {
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
  urduName: Scalars['String']['input'];
};


export type MutationUpdateSecurityEventLangarLocationArgs = {
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
  urduName: Scalars['String']['input'];
};


export type MutationUpdateSecurityServerChannelArgs = {
  _id: Scalars['String']['input'];
  connection: SecurityServerChannelConnectionInput;
  enabled: Scalars['Boolean']['input'];
  minFaceQuality?: InputMaybe<Scalars['Int']['input']>;
  minFaceSizePx?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  recognitionFps: Scalars['Float']['input'];
  similarityThreshold?: InputMaybe<Scalars['Float']['input']>;
};


export type MutationUpdateSecurityServerProfileArgs = {
  _id: Scalars['String']['input'];
  isTest: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
};


export type MutationUpdateSecurityUserGroupArgs = {
  _id: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


export type MutationUpdateSecurityVisitorArgs = {
  _id: Scalars['String']['input'];
  birthDate?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  contactNumber1?: InputMaybe<Scalars['String']['input']>;
  contactNumber2?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  currentAddress?: InputMaybe<Scalars['String']['input']>;
  educationalQualification?: InputMaybe<Scalars['String']['input']>;
  ehadDate: Scalars['String']['input'];
  meansOfEarning?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  parentName: Scalars['String']['input'];
  permanentAddress?: InputMaybe<Scalars['String']['input']>;
  referenceName: Scalars['String']['input'];
  tagIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type MutationUpdateSecurityVisitorNotesArgs = {
  _id: Scalars['String']['input'];
  criminalRecord?: InputMaybe<Scalars['String']['input']>;
  otherNotes?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateStockAdjustmentArgs = {
  _id: Scalars['String']['input'];
  adjustedBy: Scalars['String']['input'];
  adjustmentDate: Scalars['String']['input'];
  adjustmentReason?: InputMaybe<Scalars['String']['input']>;
  isInflow: Scalars['Boolean']['input'];
  physicalStoreId: Scalars['String']['input'];
  quantity: Scalars['Float']['input'];
};


export type MutationUpdateStockItemArgs = {
  _id: Scalars['String']['input'];
  categoryId: Scalars['String']['input'];
  company?: InputMaybe<Scalars['String']['input']>;
  details?: InputMaybe<Scalars['String']['input']>;
  minStockLevel?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
  unitOfMeasurement: Scalars['String']['input'];
};


export type MutationUpdateStoreRequisitionArgs = {
  _id: Scalars['String']['input'];
  lines: Array<PurchasingRequisitionLineInput>;
  neededBy?: InputMaybe<Scalars['String']['input']>;
  physicalStoreId: Scalars['String']['input'];
  purpose?: InputMaybe<Scalars['String']['input']>;
  requestedBy?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
  version: Scalars['Int']['input'];
};


export type MutationUpdateStoreUserGroupArgs = {
  _id: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};


export type MutationUpdateTeamArgs = {
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  dutyId: Scalars['String']['input'];
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type MutationUpdateTeamMemberDaysArgs = {
  daysOfWeek: Array<Scalars['String']['input']>;
  karkunId: Scalars['String']['input'];
  teamId: Scalars['String']['input'];
};


export type MutationUpdateUserArgs = {
  displayName?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  locked?: InputMaybe<Scalars['Boolean']['input']>;
  userId: Scalars['String']['input'];
  userName?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateUserGroupArgs = {
  _id: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  moduleName?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateVendorArgs = {
  _id: Scalars['String']['input'];
  address?: InputMaybe<Scalars['String']['input']>;
  contactNumber?: InputMaybe<Scalars['String']['input']>;
  contactPerson?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  physicalStoreId: Scalars['String']['input'];
};


export type MutationUpdateVisitorStayArgs = {
  _id: Scalars['String']['input'];
  dutyId?: InputMaybe<Scalars['String']['input']>;
  fromDate: Scalars['String']['input'];
  shiftId?: InputMaybe<Scalars['String']['input']>;
  stayAllowedBy?: InputMaybe<Scalars['String']['input']>;
  stayReason?: InputMaybe<Scalars['String']['input']>;
  toDate: Scalars['String']['input'];
};


export type MutationUpdateWorkspaceMonitoringProfileArgs = {
  committeeId: Scalars['String']['input'];
  isTest: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
  profileId: Scalars['String']['input'];
};


export type MutationVerifyStockItemLevelArgs = {
  _id: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type MutationVoidPurchasingInvoiceArgs = {
  _id: Scalars['String']['input'];
};


export type MutationVoidPurchasingPaymentArgs = {
  _id: Scalars['String']['input'];
  reason: Scalars['String']['input'];
};


export type MutationVoidPurchasingPettyCashVoucherArgs = {
  _id: Scalars['String']['input'];
  reason: Scalars['String']['input'];
};


export type MutationVoidPurchasingReceiptArgs = {
  _id: Scalars['String']['input'];
  reason: Scalars['String']['input'];
};


export type MutationVoidStoreReceiptArgs = {
  _id: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
  reason: Scalars['String']['input'];
};


export type MutationWorkspaceAbortDocumentUploadArgs = {
  committeeId: Scalars['String']['input'];
  uploadId: Scalars['String']['input'];
};


export type MutationWorkspaceAbortMeetingAttachmentUploadArgs = {
  committeeId: Scalars['String']['input'];
  uploadId: Scalars['String']['input'];
};


export type MutationWorkspaceAddCommitteeMemberArgs = {
  committeeId: Scalars['String']['input'];
  karkunId: Scalars['String']['input'];
  role?: InputMaybe<Scalars['String']['input']>;
};


export type MutationWorkspaceAddMeetingAgendaItemArgs = {
  committeeId: Scalars['String']['input'];
  input: WorkspaceMeetingAgendaItemInput;
  meetingId: Scalars['String']['input'];
};


export type MutationWorkspaceAddMehfilPermissionUserArgs = {
  featureKey: Scalars['String']['input'];
  karkunId: Scalars['String']['input'];
  locationId: Scalars['String']['input'];
  permissionKey: Scalars['String']['input'];
};


export type MutationWorkspaceAddProjectParticipantsArgs = {
  committeeId: Scalars['String']['input'];
  personIds: Array<InputMaybe<Scalars['String']['input']>>;
  projectId: Scalars['String']['input'];
};


export type MutationWorkspaceAddTaskCommentArgs = {
  committeeId: Scalars['String']['input'];
  taskId: Scalars['String']['input'];
  text: Scalars['String']['input'];
};


export type MutationWorkspaceCancelMeetingArgs = {
  committeeId: Scalars['String']['input'];
  meetingId: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationWorkspaceCancelPollArgs = {
  committeeId: Scalars['String']['input'];
  pollId: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationWorkspaceCastPollVoteArgs = {
  answers: Array<InputMaybe<WorkspacePollAnswerInput>>;
  committeeId: Scalars['String']['input'];
  pollId: Scalars['String']['input'];
};


export type MutationWorkspaceCheckInDocumentArgs = {
  committeeId: Scalars['String']['input'];
  documentId: Scalars['String']['input'];
};


export type MutationWorkspaceCheckOutDocumentArgs = {
  committeeId: Scalars['String']['input'];
  documentId: Scalars['String']['input'];
  durationMinutes: Scalars['Int']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
};


export type MutationWorkspaceClosePollArgs = {
  committeeId: Scalars['String']['input'];
  pollId: Scalars['String']['input'];
};


export type MutationWorkspaceCompleteDocumentUploadArgs = {
  committeeId: Scalars['String']['input'];
  uploadId: Scalars['String']['input'];
};


export type MutationWorkspaceCompleteMeetingArgs = {
  committeeId: Scalars['String']['input'];
  meetingId: Scalars['String']['input'];
};


export type MutationWorkspaceCompleteMeetingAttachmentUploadArgs = {
  committeeId: Scalars['String']['input'];
  uploadId: Scalars['String']['input'];
};


export type MutationWorkspaceCreateDocumentFolderArgs = {
  committeeId: Scalars['String']['input'];
  name: Scalars['String']['input'];
  parentId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationWorkspaceCreateDocumentUploadArgs = {
  comment?: InputMaybe<Scalars['String']['input']>;
  committeeId: Scalars['String']['input'];
  documentId?: InputMaybe<Scalars['String']['input']>;
  fileName: Scalars['String']['input'];
  folderId?: InputMaybe<Scalars['String']['input']>;
  mimeType?: InputMaybe<Scalars['String']['input']>;
  size: Scalars['Float']['input'];
};


export type MutationWorkspaceCreateMeetingArgs = {
  committeeId: Scalars['String']['input'];
  input: WorkspaceMeetingInput;
  participantIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type MutationWorkspaceCreateMeetingActionItemArgs = {
  committeeId: Scalars['String']['input'];
  input: WorkspaceMeetingActionItemInput;
  meetingId: Scalars['String']['input'];
};


export type MutationWorkspaceCreateMeetingAttachmentUploadArgs = {
  committeeId: Scalars['String']['input'];
  fileName: Scalars['String']['input'];
  meetingId: Scalars['String']['input'];
  mimeType?: InputMaybe<Scalars['String']['input']>;
  size: Scalars['Float']['input'];
};


export type MutationWorkspaceCreatePollArgs = {
  committeeId: Scalars['String']['input'];
  input: WorkspacePollInput;
};


export type MutationWorkspaceCreateProjectArgs = {
  committeeId: Scalars['String']['input'];
  input: WorkspaceProjectInput;
};


export type MutationWorkspaceCreateTaskArgs = {
  committeeId: Scalars['String']['input'];
  input: WorkspaceTaskInput;
};


export type MutationWorkspaceDaAddDutiesArgs = {
  locationId: Scalars['String']['input'];
  mehfilDutyIds: Array<Scalars['String']['input']>;
};


export type MutationWorkspaceDaAddDutyMemberArgs = {
  canMarkOwnAttendance?: InputMaybe<Scalars['Boolean']['input']>;
  daysOfWeek?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  dutyId: Scalars['String']['input'];
  isCoordinator?: InputMaybe<Scalars['Boolean']['input']>;
  karkunId: Scalars['String']['input'];
  locationId: Scalars['String']['input'];
};


export type MutationWorkspaceDaRemoveDutyArgs = {
  dutyId: Scalars['String']['input'];
  locationId: Scalars['String']['input'];
};


export type MutationWorkspaceDaRemoveDutyMemberArgs = {
  dutyId: Scalars['String']['input'];
  karkunId: Scalars['String']['input'];
  locationId: Scalars['String']['input'];
};


export type MutationWorkspaceDaSetAttendanceArgs = {
  date: Scalars['String']['input'];
  dutyId: Scalars['String']['input'];
  geo?: InputMaybe<DaGeoLocationInput>;
  karkunId: Scalars['String']['input'];
  locationId: Scalars['String']['input'];
  source?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};


export type MutationWorkspaceDaSetDayOverrideArgs = {
  absentKarkunIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  addedKarkunIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  date: Scalars['String']['input'];
  dutyId: Scalars['String']['input'];
  locationId: Scalars['String']['input'];
};


export type MutationWorkspaceDaUpdateDutyArgs = {
  dutyId: Scalars['String']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  locationId: Scalars['String']['input'];
};


export type MutationWorkspaceDaUpdateDutyMemberArgs = {
  canMarkOwnAttendance?: InputMaybe<Scalars['Boolean']['input']>;
  daysOfWeek?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  dutyId: Scalars['String']['input'];
  isCoordinator?: InputMaybe<Scalars['Boolean']['input']>;
  karkunId: Scalars['String']['input'];
  locationId: Scalars['String']['input'];
};


export type MutationWorkspaceDeleteDiscussionMessageArgs = {
  committeeId: Scalars['String']['input'];
  messageId: Scalars['String']['input'];
};


export type MutationWorkspaceDeleteDocumentVersionArgs = {
  committeeId: Scalars['String']['input'];
  documentId: Scalars['String']['input'];
  versionId: Scalars['String']['input'];
};


export type MutationWorkspaceDeleteMeetingArgs = {
  committeeId: Scalars['String']['input'];
  meetingId: Scalars['String']['input'];
};


export type MutationWorkspaceDeleteMeetingActionItemArgs = {
  actionItemId: Scalars['String']['input'];
  committeeId: Scalars['String']['input'];
};


export type MutationWorkspaceDeleteMeetingAttachmentArgs = {
  attachmentId: Scalars['String']['input'];
  committeeId: Scalars['String']['input'];
};


export type MutationWorkspaceDeletePollArgs = {
  committeeId: Scalars['String']['input'];
  pollId: Scalars['String']['input'];
};


export type MutationWorkspaceDeleteProjectArgs = {
  committeeId: Scalars['String']['input'];
  deleteTasks?: InputMaybe<Scalars['Boolean']['input']>;
  projectId: Scalars['String']['input'];
};


export type MutationWorkspaceDeleteTaskArgs = {
  committeeId: Scalars['String']['input'];
  taskId: Scalars['String']['input'];
};


export type MutationWorkspaceDeleteTaskCommentArgs = {
  commentId: Scalars['String']['input'];
  committeeId: Scalars['String']['input'];
};


export type MutationWorkspaceDocumentDownloadUrlArgs = {
  committeeId: Scalars['String']['input'];
  documentId: Scalars['String']['input'];
  inline?: InputMaybe<Scalars['Boolean']['input']>;
  versionId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationWorkspaceEditDiscussionMessageArgs = {
  committeeId: Scalars['String']['input'];
  messageId: Scalars['String']['input'];
  text: Scalars['String']['input'];
};


export type MutationWorkspaceEmptyDocumentTrashArgs = {
  committeeId: Scalars['String']['input'];
};


export type MutationWorkspaceForceUnlockDocumentArgs = {
  committeeId: Scalars['String']['input'];
  documentId: Scalars['String']['input'];
};


export type MutationWorkspaceJoinDiscussionVideoCallArgs = {
  committeeId: Scalars['String']['input'];
};


export type MutationWorkspaceJoinMeetingVideoCallArgs = {
  committeeId: Scalars['String']['input'];
  meetingId: Scalars['String']['input'];
};


export type MutationWorkspaceMarkMeetingAttendanceArgs = {
  committeeId: Scalars['String']['input'];
  entries: Array<InputMaybe<WorkspaceMeetingAttendanceInput>>;
  meetingId: Scalars['String']['input'];
};


export type MutationWorkspaceMeetingAttachmentDownloadUrlArgs = {
  attachmentId: Scalars['String']['input'];
  committeeId: Scalars['String']['input'];
  inline?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationWorkspaceMoveDocumentArgs = {
  committeeId: Scalars['String']['input'];
  documentId: Scalars['String']['input'];
  folderId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationWorkspaceMoveDocumentFolderArgs = {
  committeeId: Scalars['String']['input'];
  folderId: Scalars['String']['input'];
  parentId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationWorkspaceOpenPollArgs = {
  closesAt?: InputMaybe<Scalars['String']['input']>;
  committeeId: Scalars['String']['input'];
  pollId: Scalars['String']['input'];
};


export type MutationWorkspacePurgeDocumentTrashItemArgs = {
  committeeId: Scalars['String']['input'];
  itemId: Scalars['String']['input'];
};


export type MutationWorkspaceReactToDiscussionMessageArgs = {
  committeeId: Scalars['String']['input'];
  emoji: Scalars['String']['input'];
  messageId: Scalars['String']['input'];
  shouldReact: Scalars['Boolean']['input'];
};


export type MutationWorkspaceRemoveCommitteeMemberArgs = {
  committeeId: Scalars['String']['input'];
  karkunId: Scalars['String']['input'];
};


export type MutationWorkspaceRemoveMeetingAgendaItemArgs = {
  agendaItemId: Scalars['String']['input'];
  committeeId: Scalars['String']['input'];
  meetingId: Scalars['String']['input'];
};


export type MutationWorkspaceRemoveMehfilPermissionUserArgs = {
  featureKey: Scalars['String']['input'];
  locationId: Scalars['String']['input'];
  permissionKey: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationWorkspaceRemoveProjectParticipantArgs = {
  committeeId: Scalars['String']['input'];
  personId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
  unassignTasks?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationWorkspaceRenameDocumentFolderArgs = {
  committeeId: Scalars['String']['input'];
  folderId: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type MutationWorkspaceReopenMeetingArgs = {
  committeeId: Scalars['String']['input'];
  meetingId: Scalars['String']['input'];
};


export type MutationWorkspaceReopenPollArgs = {
  closesAt: Scalars['String']['input'];
  committeeId: Scalars['String']['input'];
  pollId: Scalars['String']['input'];
};


export type MutationWorkspaceReorderMeetingAgendaArgs = {
  agendaItemIds: Array<InputMaybe<Scalars['String']['input']>>;
  committeeId: Scalars['String']['input'];
  meetingId: Scalars['String']['input'];
};


export type MutationWorkspaceRespondToMeetingArgs = {
  comment?: InputMaybe<Scalars['String']['input']>;
  committeeId: Scalars['String']['input'];
  meetingId: Scalars['String']['input'];
  participantId?: InputMaybe<Scalars['String']['input']>;
  status: Scalars['String']['input'];
};


export type MutationWorkspaceRestoreDocumentTrashItemArgs = {
  committeeId: Scalars['String']['input'];
  itemId: Scalars['String']['input'];
  newName?: InputMaybe<Scalars['String']['input']>;
  toRoot?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationWorkspaceRestoreDocumentVersionArgs = {
  committeeId: Scalars['String']['input'];
  documentId: Scalars['String']['input'];
  versionId: Scalars['String']['input'];
};


export type MutationWorkspaceSendDiscussionMessageArgs = {
  committeeId: Scalars['String']['input'];
  text: Scalars['String']['input'];
  threadId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationWorkspaceSetCommitteeMemberCoordinatorArgs = {
  committeeId: Scalars['String']['input'];
  isCoordinator: Scalars['Boolean']['input'];
  karkunId: Scalars['String']['input'];
};


export type MutationWorkspaceSetCommitteeMemberDiscussionAccessArgs = {
  committeeId: Scalars['String']['input'];
  hasAccess: Scalars['Boolean']['input'];
  karkunId: Scalars['String']['input'];
};


export type MutationWorkspaceSetDiscussionMessagePinnedArgs = {
  committeeId: Scalars['String']['input'];
  messageId: Scalars['String']['input'];
  pinned: Scalars['Boolean']['input'];
};


export type MutationWorkspaceSetDiscussionMessageStarredArgs = {
  committeeId: Scalars['String']['input'];
  messageId: Scalars['String']['input'];
  starred: Scalars['Boolean']['input'];
};


export type MutationWorkspaceSetMeetingActionItemStatusArgs = {
  actionItemId: Scalars['String']['input'];
  committeeId: Scalars['String']['input'];
  status: Scalars['String']['input'];
};


export type MutationWorkspaceSetMeetingMinutesArgs = {
  committeeId: Scalars['String']['input'];
  meetingId: Scalars['String']['input'];
  text?: InputMaybe<Scalars['String']['input']>;
};


export type MutationWorkspaceSetMeetingParticipantRoleArgs = {
  committeeId: Scalars['String']['input'];
  meetingId: Scalars['String']['input'];
  participantId: Scalars['String']['input'];
  role: Scalars['String']['input'];
};


export type MutationWorkspaceSetMeetingParticipantsArgs = {
  committeeId: Scalars['String']['input'];
  meetingId: Scalars['String']['input'];
  participantIds: Array<InputMaybe<Scalars['String']['input']>>;
};


export type MutationWorkspaceSetProjectStatusArgs = {
  committeeId: Scalars['String']['input'];
  force?: InputMaybe<Scalars['Boolean']['input']>;
  projectId: Scalars['String']['input'];
  status: Scalars['String']['input'];
};


export type MutationWorkspaceSetTaskProgressArgs = {
  committeeId: Scalars['String']['input'];
  progress: Scalars['Int']['input'];
  taskId: Scalars['String']['input'];
};


export type MutationWorkspaceSetTaskStatusArgs = {
  committeeId: Scalars['String']['input'];
  status: Scalars['String']['input'];
  taskId: Scalars['String']['input'];
};


export type MutationWorkspaceTrashDocumentArgs = {
  committeeId: Scalars['String']['input'];
  documentId: Scalars['String']['input'];
};


export type MutationWorkspaceTrashDocumentFolderArgs = {
  committeeId: Scalars['String']['input'];
  folderId: Scalars['String']['input'];
};


export type MutationWorkspaceUpdateDocumentArgs = {
  committeeId: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  documentId: Scalars['String']['input'];
  name: Scalars['String']['input'];
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type MutationWorkspaceUpdateMeetingArgs = {
  committeeId: Scalars['String']['input'];
  input: WorkspaceMeetingInput;
  meetingId: Scalars['String']['input'];
};


export type MutationWorkspaceUpdateMeetingActionItemArgs = {
  actionItemId: Scalars['String']['input'];
  committeeId: Scalars['String']['input'];
  input: WorkspaceMeetingActionItemInput;
};


export type MutationWorkspaceUpdateMeetingAgendaItemArgs = {
  agendaItemId: Scalars['String']['input'];
  committeeId: Scalars['String']['input'];
  input: WorkspaceMeetingAgendaItemInput;
  meetingId: Scalars['String']['input'];
};


export type MutationWorkspaceUpdateMehfilDetailsArgs = {
  locationId: Scalars['String']['input'];
  mehfilDetails: OrgLocationMehfilDetailsInput;
};


export type MutationWorkspaceUpdatePollArgs = {
  committeeId: Scalars['String']['input'];
  input: WorkspacePollInput;
  pollId: Scalars['String']['input'];
};


export type MutationWorkspaceUpdateProjectArgs = {
  committeeId: Scalars['String']['input'];
  input: WorkspaceProjectInput;
  projectId: Scalars['String']['input'];
};


export type MutationWorkspaceUpdateTaskArgs = {
  committeeId: Scalars['String']['input'];
  input: WorkspaceTaskInput;
  taskId: Scalars['String']['input'];
};


export type MutationWorkspaceWithdrawPollVoteArgs = {
  committeeId: Scalars['String']['input'];
  pollId: Scalars['String']['input'];
};

export type MyMehfilDetailsLocationType = {
  __typename?: 'MyMehfilDetailsLocationType';
  hasWorkspace: Scalars['Boolean']['output'];
  locationId: Scalars['String']['output'];
  name: Scalars['String']['output'];
  parentId?: Maybe<Scalars['String']['output']>;
  permissions: Array<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type MyMehfilKarkunsLocationType = {
  __typename?: 'MyMehfilKarkunsLocationType';
  hasWorkspace: Scalars['Boolean']['output'];
  locationId: Scalars['String']['output'];
  name: Scalars['String']['output'];
  parentId?: Maybe<Scalars['String']['output']>;
  permissions: Array<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type MyMehfilPermissionsLocationType = {
  __typename?: 'MyMehfilPermissionsLocationType';
  hasWorkspace: Scalars['Boolean']['output'];
  locationId: Scalars['String']['output'];
  name: Scalars['String']['output'];
  parentId?: Maybe<Scalars['String']['output']>;
  permissions: Array<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type NotificationCountType = {
  __typename?: 'NotificationCountType';
  committeeId?: Maybe<Scalars['String']['output']>;
  module?: Maybe<Scalars['String']['output']>;
  unreadCount?: Maybe<Scalars['Int']['output']>;
};

export type NotificationType = {
  __typename?: 'NotificationType';
  _id?: Maybe<Scalars['String']['output']>;
  actorUserId?: Maybe<Scalars['String']['output']>;
  committeeId?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  data?: Maybe<Scalars['String']['output']>;
  entityId?: Maybe<Scalars['String']['output']>;
  entityType?: Maybe<Scalars['String']['output']>;
  eventDetails?: Maybe<Scalars['String']['output']>;
  eventType?: Maybe<Scalars['String']['output']>;
  isRead?: Maybe<Scalars['Boolean']['output']>;
  module?: Maybe<Scalars['String']['output']>;
  recipientUserId?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type OrgLocationFeaturePermissionType = {
  __typename?: 'OrgLocationFeaturePermissionType';
  description: Scalars['String']['output'];
  key: Scalars['String']['output'];
  name: Scalars['String']['output'];
  users: Array<Maybe<OrgLocationFeaturePermissionUserType>>;
};

export type OrgLocationFeaturePermissionUserType = {
  __typename?: 'OrgLocationFeaturePermissionUserType';
  displayName?: Maybe<Scalars['String']['output']>;
  personId?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
  username?: Maybe<Scalars['String']['output']>;
};

export type OrgLocationFeaturePermissionsType = {
  __typename?: 'OrgLocationFeaturePermissionsType';
  featureKey: Scalars['String']['output'];
  featureName: Scalars['String']['output'];
  permissions: Array<Maybe<OrgLocationFeaturePermissionType>>;
};

export type OrgLocationMehfilDetailsInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  attendanceGeofenceMeters?: InputMaybe<Scalars['Int']['input']>;
  latitude?: InputMaybe<Scalars['Float']['input']>;
  lcdAvailability?: InputMaybe<Scalars['Boolean']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
  mehfilStartYear?: InputMaybe<Scalars['String']['input']>;
  otherMehfilDetails?: InputMaybe<Scalars['String']['input']>;
  tabAvailability?: InputMaybe<Scalars['Boolean']['input']>;
  timingDetails?: InputMaybe<Scalars['String']['input']>;
};

export type OrgLocationMehfilDetailsType = {
  __typename?: 'OrgLocationMehfilDetailsType';
  address?: Maybe<Scalars['String']['output']>;
  attendanceGeofenceMeters?: Maybe<Scalars['Int']['output']>;
  latitude?: Maybe<Scalars['Float']['output']>;
  lcdAvailability?: Maybe<Scalars['Boolean']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  mehfilStartYear?: Maybe<Scalars['String']['output']>;
  otherMehfilDetails?: Maybe<Scalars['String']['output']>;
  tabAvailability?: Maybe<Scalars['Boolean']['output']>;
  timingDetails?: Maybe<Scalars['String']['output']>;
};

export type OrgLocationObserverStatType = {
  __typename?: 'OrgLocationObserverStatType';
  karkunId?: Maybe<Scalars['String']['output']>;
  observedCommitteeCount?: Maybe<Scalars['Int']['output']>;
  observedCommitteeIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type OrgLocationType = {
  __typename?: 'OrgLocationType';
  _id?: Maybe<Scalars['String']['output']>;
  allParentIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  committees?: Maybe<Array<Maybe<CommitteeBasicType>>>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  mehfilDetails?: Maybe<OrgLocationMehfilDetailsType>;
  name?: Maybe<Scalars['String']['output']>;
  observerKarkunIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  observerStats?: Maybe<Array<Maybe<OrgLocationObserverStatType>>>;
  observers?: Maybe<Array<Maybe<PersonType>>>;
  parent?: Maybe<OrgLocationType>;
  parentId?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type PagedAuditLogType = {
  __typename?: 'PagedAuditLogType';
  data?: Maybe<Array<Maybe<AuditLogType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedCityType = {
  __typename?: 'PagedCityType';
  data?: Maybe<Array<Maybe<CityType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedFreeFormCity = {
  __typename?: 'PagedFreeFormCity';
  data?: Maybe<Array<Maybe<FreeFormCityType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedFreeFormValue = {
  __typename?: 'PagedFreeFormValue';
  data?: Maybe<Array<Maybe<FreeFormValueType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedHrEmployeeType = {
  __typename?: 'PagedHrEmployeeType';
  data?: Maybe<Array<Maybe<HrEmployeeType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedInboxConversationType = {
  __typename?: 'PagedInboxConversationType';
  data?: Maybe<Array<Maybe<InboxConversationType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedIssuanceForm = {
  __typename?: 'PagedIssuanceForm';
  data?: Maybe<Array<Maybe<IssuanceForm>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedJobLogsType = {
  __typename?: 'PagedJobLogsType';
  data?: Maybe<Array<Maybe<JobLogEntryType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedKarkunType = {
  __typename?: 'PagedKarkunType';
  data?: Maybe<Array<Maybe<PersonType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedLeaveRequestType = {
  __typename?: 'PagedLeaveRequestType';
  data?: Maybe<Array<Maybe<LeaveRequestType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedMehfilLocationKarkunType = {
  __typename?: 'PagedMehfilLocationKarkunType';
  data: Array<MehfilLocationKarkunType>;
  totalResults: Scalars['Int']['output'];
};

export type PagedPeopleType = {
  __typename?: 'PagedPeopleType';
  data?: Maybe<Array<Maybe<PersonType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedPickerPersonType = {
  __typename?: 'PagedPickerPersonType';
  data?: Maybe<Array<Maybe<PickerPersonType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedPurchaseForm = {
  __typename?: 'PagedPurchaseForm';
  data?: Maybe<Array<Maybe<PurchaseForm>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedPurchasingCatalogItems = {
  __typename?: 'PagedPurchasingCatalogItems';
  data?: Maybe<Array<Maybe<PurchasingCatalogItem>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedPurchasingInvoices = {
  __typename?: 'PagedPurchasingInvoices';
  data?: Maybe<Array<Maybe<PurchasingInvoice>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedPurchasingOrders = {
  __typename?: 'PagedPurchasingOrders';
  data?: Maybe<Array<Maybe<PurchasingOrder>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedPurchasingPayments = {
  __typename?: 'PagedPurchasingPayments';
  data?: Maybe<Array<Maybe<PurchasingPayment>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedPurchasingPettyCashExpenseHeads = {
  __typename?: 'PagedPurchasingPettyCashExpenseHeads';
  data?: Maybe<Array<Maybe<PurchasingPettyCashExpenseHead>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedPurchasingPettyCashFunds = {
  __typename?: 'PagedPurchasingPettyCashFunds';
  data?: Maybe<Array<Maybe<PurchasingPettyCashFund>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedPurchasingPettyCashReplenishments = {
  __typename?: 'PagedPurchasingPettyCashReplenishments';
  data?: Maybe<Array<Maybe<PurchasingPettyCashReplenishment>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedPurchasingPettyCashVouchers = {
  __typename?: 'PagedPurchasingPettyCashVouchers';
  data?: Maybe<Array<Maybe<PurchasingPettyCashVoucher>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedPurchasingQuotes = {
  __typename?: 'PagedPurchasingQuotes';
  data?: Maybe<Array<Maybe<PurchasingQuote>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedPurchasingReceipts = {
  __typename?: 'PagedPurchasingReceipts';
  data?: Maybe<Array<Maybe<PurchasingReceipt>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedPurchasingRequisitions = {
  __typename?: 'PagedPurchasingRequisitions';
  data?: Maybe<Array<Maybe<PurchasingRequisition>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedPurchasingVendors = {
  __typename?: 'PagedPurchasingVendors';
  data?: Maybe<Array<Maybe<PurchasingVendor>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedSalaryType = {
  __typename?: 'PagedSalaryType';
  salaries?: Maybe<Array<Maybe<SalaryType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedScheduledJobsType = {
  __typename?: 'PagedScheduledJobsType';
  data?: Maybe<Array<Maybe<ScheduledJobType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedSecurityLogType = {
  __typename?: 'PagedSecurityLogType';
  data?: Maybe<Array<Maybe<SecurityLogType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedSecurityServerAlertGroupType = {
  __typename?: 'PagedSecurityServerAlertGroupType';
  data?: Maybe<Array<Maybe<SecurityServerAlertGroupType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedSecurityServerAlertType = {
  __typename?: 'PagedSecurityServerAlertType';
  data?: Maybe<Array<Maybe<SecurityServerAlertType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedSecurityServerProfileType = {
  __typename?: 'PagedSecurityServerProfileType';
  data?: Maybe<Array<Maybe<SecurityServerProfileType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedStockAdjustment = {
  __typename?: 'PagedStockAdjustment';
  data?: Maybe<Array<Maybe<StockAdjustment>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedStockItem = {
  __typename?: 'PagedStockItem';
  data?: Maybe<Array<Maybe<StockItem>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedStoreOrders = {
  __typename?: 'PagedStoreOrders';
  data?: Maybe<Array<Maybe<StoreOrder>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedStoreReceipts = {
  __typename?: 'PagedStoreReceipts';
  data?: Maybe<Array<Maybe<StoreReceipt>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedUserGroupType = {
  __typename?: 'PagedUserGroupType';
  data?: Maybe<Array<Maybe<UserGroupType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedUserType = {
  __typename?: 'PagedUserType';
  data?: Maybe<Array<Maybe<UserType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedVisitorStayType = {
  __typename?: 'PagedVisitorStayType';
  data?: Maybe<Array<Maybe<VisitorStayType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedVisitorType = {
  __typename?: 'PagedVisitorType';
  data?: Maybe<Array<Maybe<PersonType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedWorkspaceDocumentType = {
  __typename?: 'PagedWorkspaceDocumentType';
  data?: Maybe<Array<Maybe<WorkspaceDocumentType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedWorkspaceMeetingActionItemType = {
  __typename?: 'PagedWorkspaceMeetingActionItemType';
  data?: Maybe<Array<Maybe<WorkspaceMeetingActionItemType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedWorkspaceMeetingType = {
  __typename?: 'PagedWorkspaceMeetingType';
  data?: Maybe<Array<Maybe<WorkspaceMeetingType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedWorkspaceMonitoringAlertType = {
  __typename?: 'PagedWorkspaceMonitoringAlertType';
  data?: Maybe<Array<Maybe<WorkspaceMonitoringAlertType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedWorkspaceMonitoringProfileType = {
  __typename?: 'PagedWorkspaceMonitoringProfileType';
  data?: Maybe<Array<Maybe<WorkspaceMonitoringProfileType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedWorkspaceNightStayType = {
  __typename?: 'PagedWorkspaceNightStayType';
  data?: Maybe<Array<Maybe<WorkspaceNightStayType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedWorkspacePollType = {
  __typename?: 'PagedWorkspacePollType';
  data?: Maybe<Array<Maybe<WorkspacePollType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedWorkspaceProjectType = {
  __typename?: 'PagedWorkspaceProjectType';
  data?: Maybe<Array<Maybe<WorkspaceProjectType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedWorkspaceTaskCommentType = {
  __typename?: 'PagedWorkspaceTaskCommentType';
  data?: Maybe<Array<Maybe<WorkspaceTaskCommentType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedWorkspaceTaskType = {
  __typename?: 'PagedWorkspaceTaskType';
  data?: Maybe<Array<Maybe<WorkspaceTaskType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PeopleRegistrationImageSettingsType = {
  __typename?: 'PeopleRegistrationImageSettingsType';
  defaults?: Maybe<PeopleRegistrationImageSettingsValuesType>;
  minDetectionScore?: Maybe<Scalars['Float']['output']>;
  minFacePixels?: Maybe<Scalars['Int']['output']>;
  minFacePose?: Maybe<Scalars['Int']['output']>;
  minSharpness?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type PeopleRegistrationImageSettingsValuesType = {
  __typename?: 'PeopleRegistrationImageSettingsValuesType';
  minDetectionScore?: Maybe<Scalars['Float']['output']>;
  minFacePixels?: Maybe<Scalars['Int']['output']>;
  minFacePose?: Maybe<Scalars['Int']['output']>;
  minSharpness?: Maybe<Scalars['Int']['output']>;
};

export type PeopleSearchFaceSettingsType = {
  __typename?: 'PeopleSearchFaceSettingsType';
  defaults?: Maybe<PeopleSearchFaceSettingsValuesType>;
  matchThreshold?: Maybe<Scalars['Float']['output']>;
  minDetectionScore?: Maybe<Scalars['Float']['output']>;
  minFacePixels?: Maybe<Scalars['Int']['output']>;
  minFacePose?: Maybe<Scalars['Int']['output']>;
  minMatchMargin?: Maybe<Scalars['Float']['output']>;
  minSharpness?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type PeopleSearchFaceSettingsValuesType = {
  __typename?: 'PeopleSearchFaceSettingsValuesType';
  matchThreshold?: Maybe<Scalars['Float']['output']>;
  minDetectionScore?: Maybe<Scalars['Float']['output']>;
  minFacePixels?: Maybe<Scalars['Int']['output']>;
  minFacePose?: Maybe<Scalars['Int']['output']>;
  minMatchMargin?: Maybe<Scalars['Float']['output']>;
  minSharpness?: Maybe<Scalars['Int']['output']>;
};

export type PeopleTagType = {
  __typename?: 'PeopleTagType';
  _id?: Maybe<Scalars['String']['output']>;
  color?: Maybe<Scalars['String']['output']>;
  moduleNames?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  name?: Maybe<Scalars['String']['output']>;
  textColor?: Maybe<Scalars['String']['output']>;
};

export enum Permission {
  AdminManageCities = 'ADMIN_MANAGE_CITIES',
  AdminManageCommittees = 'ADMIN_MANAGE_COMMITTEES',
  AdminManageDeletedPeople = 'ADMIN_MANAGE_DELETED_PEOPLE',
  AdminManageDuplicatePeople = 'ADMIN_MANAGE_DUPLICATE_PEOPLE',
  AdminManageFreeFormData = 'ADMIN_MANAGE_FREE_FORM_DATA',
  AdminManageOrgLocations = 'ADMIN_MANAGE_ORG_LOCATIONS',
  AdminManagePeopleTags = 'ADMIN_MANAGE_PEOPLE_TAGS',
  AdminManageScheduledJobs = 'ADMIN_MANAGE_SCHEDULED_JOBS',
  AdminManageUsersAndGroups = 'ADMIN_MANAGE_USERS_AND_GROUPS',
  AdminViewCommittees = 'ADMIN_VIEW_COMMITTEES',
  AdminViewOrgLocations = 'ADMIN_VIEW_ORG_LOCATIONS',
  AdminViewSecurityLogs = 'ADMIN_VIEW_SECURITY_LOGS',
  AdminViewUsersAndGroups = 'ADMIN_VIEW_USERS_AND_GROUPS',
  CorrespondenceInboxReplyToMessages = 'CORRESPONDENCE_INBOX_REPLY_TO_MESSAGES',
  CorrespondenceInboxViewMessages = 'CORRESPONDENCE_INBOX_VIEW_MESSAGES',
  HrApproveLeaves = 'HR_APPROVE_LEAVES',
  HrEmployeesManagePermissions = 'HR_EMPLOYEES_MANAGE_PERMISSIONS',
  HrEmployeesViewAuditLogs = 'HR_EMPLOYEES_VIEW_AUDIT_LOGS',
  HrKarkunsManagePermissions = 'HR_KARKUNS_MANAGE_PERMISSIONS',
  HrKarkunsViewAuditLogs = 'HR_KARKUNS_VIEW_AUDIT_LOGS',
  HrManageEmployees = 'HR_MANAGE_EMPLOYEES',
  HrManageEmployeesSetupData = 'HR_MANAGE_EMPLOYEES_SETUP_DATA',
  HrManageKarkuns = 'HR_MANAGE_KARKUNS',
  HrManageKarkunsSetupData = 'HR_MANAGE_KARKUNS_SETUP_DATA',
  HrManageLeaves = 'HR_MANAGE_LEAVES',
  HrViewEmployees = 'HR_VIEW_EMPLOYEES',
  HrViewKarkuns = 'HR_VIEW_KARKUNS',
  HrViewLeaves = 'HR_VIEW_LEAVES',
  InApproveIssuanceForms = 'IN_APPROVE_ISSUANCE_FORMS',
  InApprovePurchaseForms = 'IN_APPROVE_PURCHASE_FORMS',
  InApproveStockAdjustments = 'IN_APPROVE_STOCK_ADJUSTMENTS',
  InManageIssuanceForms = 'IN_MANAGE_ISSUANCE_FORMS',
  InManagePhysicalStores = 'IN_MANAGE_PHYSICAL_STORES',
  InManagePhysicalStorePermissions = 'IN_MANAGE_PHYSICAL_STORE_PERMISSIONS',
  InManagePurchaseForms = 'IN_MANAGE_PURCHASE_FORMS',
  InManageReceipts = 'IN_MANAGE_RECEIPTS',
  InManageRequisitions = 'IN_MANAGE_REQUISITIONS',
  InManageSetupData = 'IN_MANAGE_SETUP_DATA',
  InManageStockAdjustments = 'IN_MANAGE_STOCK_ADJUSTMENTS',
  InManageStockItems = 'IN_MANAGE_STOCK_ITEMS',
  InViewIssuanceForms = 'IN_VIEW_ISSUANCE_FORMS',
  InViewPurchaseForms = 'IN_VIEW_PURCHASE_FORMS',
  InViewReceipts = 'IN_VIEW_RECEIPTS',
  InViewRequisitions = 'IN_VIEW_REQUISITIONS',
  InViewStockAdjustments = 'IN_VIEW_STOCK_ADJUSTMENTS',
  PurchasingApproveOrders = 'PURCHASING_APPROVE_ORDERS',
  PurchasingApprovePettyCashReplenishments = 'PURCHASING_APPROVE_PETTY_CASH_REPLENISHMENTS',
  PurchasingApprovePettyCashVouchers = 'PURCHASING_APPROVE_PETTY_CASH_VOUCHERS',
  PurchasingApproveRequisitions = 'PURCHASING_APPROVE_REQUISITIONS',
  PurchasingManageCatalog = 'PURCHASING_MANAGE_CATALOG',
  PurchasingManageInvoices = 'PURCHASING_MANAGE_INVOICES',
  PurchasingManageOrders = 'PURCHASING_MANAGE_ORDERS',
  PurchasingManagePayments = 'PURCHASING_MANAGE_PAYMENTS',
  PurchasingManagePermissions = 'PURCHASING_MANAGE_PERMISSIONS',
  PurchasingManagePettyCashFunds = 'PURCHASING_MANAGE_PETTY_CASH_FUNDS',
  PurchasingManagePettyCashVouchers = 'PURCHASING_MANAGE_PETTY_CASH_VOUCHERS',
  PurchasingManageReceipts = 'PURCHASING_MANAGE_RECEIPTS',
  PurchasingManageRequisitions = 'PURCHASING_MANAGE_REQUISITIONS',
  PurchasingManageVendors = 'PURCHASING_MANAGE_VENDORS',
  PurchasingViewAuditLogs = 'PURCHASING_VIEW_AUDIT_LOGS',
  PurchasingViewInvoices = 'PURCHASING_VIEW_INVOICES',
  PurchasingViewOrders = 'PURCHASING_VIEW_ORDERS',
  PurchasingViewPayments = 'PURCHASING_VIEW_PAYMENTS',
  PurchasingViewPettyCash = 'PURCHASING_VIEW_PETTY_CASH',
  PurchasingViewReceipts = 'PURCHASING_VIEW_RECEIPTS',
  PurchasingViewReports = 'PURCHASING_VIEW_REPORTS',
  PurchasingViewRequisitions = 'PURCHASING_VIEW_REQUISITIONS',
  PurchasingViewVendors = 'PURCHASING_VIEW_VENDORS',
  SecurityManageEvents = 'SECURITY_MANAGE_EVENTS',
  SecurityManagePermissions = 'SECURITY_MANAGE_PERMISSIONS',
  SecurityManageSecurityServerData = 'SECURITY_MANAGE_SECURITY_SERVER_DATA',
  SecurityManageSetupData = 'SECURITY_MANAGE_SETUP_DATA',
  SecurityManageVisitors = 'SECURITY_MANAGE_VISITORS',
  SecuritySyncSecurityServerData = 'SECURITY_SYNC_SECURITY_SERVER_DATA',
  SecurityViewAuditLogs = 'SECURITY_VIEW_AUDIT_LOGS',
  SecurityViewEvents = 'SECURITY_VIEW_EVENTS',
  SecurityViewSecurityServerData = 'SECURITY_VIEW_SECURITY_SERVER_DATA',
  SecurityViewVisitors = 'SECURITY_VIEW_VISITORS'
}

export type PersonBasicSharedDataType = {
  __typename?: 'PersonBasicSharedDataType';
  cnicNumber?: Maybe<Scalars['String']['output']>;
  contactNumber1?: Maybe<Scalars['String']['output']>;
  contactNumber2?: Maybe<Scalars['String']['output']>;
  imageThumbnailUrl?: Maybe<Scalars['String']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type PersonBasicType = {
  __typename?: 'PersonBasicType';
  _id?: Maybe<Scalars['String']['output']>;
  sharedData?: Maybe<PersonBasicSharedDataType>;
};

export type PersonEmployeeDataType = {
  __typename?: 'PersonEmployeeDataType';
  bankAccountDetails?: Maybe<Scalars['String']['output']>;
  confirmationDate?: Maybe<Scalars['String']['output']>;
  employmentEndDate?: Maybe<Scalars['String']['output']>;
  employmentStartDate?: Maybe<Scalars['String']['output']>;
  employmentStatus?: Maybe<Scalars['String']['output']>;
  job?: Maybe<JobType>;
  jobId?: Maybe<Scalars['String']['output']>;
  jobShift?: Maybe<JobShiftType>;
  jobShiftId?: Maybe<Scalars['String']['output']>;
  probationEndDate?: Maybe<Scalars['String']['output']>;
  reportsTo?: Maybe<PersonType>;
  reportsToPersonId?: Maybe<Scalars['String']['output']>;
  workingDays?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type PersonFilter = {
  additionalInfo?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  dataSource?: InputMaybe<Scalars['String']['input']>;
  ehadDate?: InputMaybe<Scalars['String']['input']>;
  ehadDuration?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  tagId?: InputMaybe<Scalars['String']['input']>;
  updatedBetween?: InputMaybe<Scalars['String']['input']>;
};

export type PersonImageVectorDataType = {
  __typename?: 'PersonImageVectorDataType';
  status?: Maybe<Scalars['String']['output']>;
};

export type PersonKarkunDataType = {
  __typename?: 'PersonKarkunDataType';
  attachmentIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  attachments?: Maybe<Array<Maybe<Attachment>>>;
  cityLocation?: Maybe<ReferenceOrgLocationType>;
  cityLocationId?: Maybe<Scalars['String']['output']>;
  ehadKarkun?: Maybe<Scalars['Boolean']['output']>;
  ehadPermissionDate?: Maybe<Scalars['String']['output']>;
  lastTarteebDate?: Maybe<Scalars['String']['output']>;
  mehfilLocation?: Maybe<ReferenceOrgLocationType>;
  mehfilLocationId?: Maybe<Scalars['String']['output']>;
  mehfilRaabta?: Maybe<Scalars['String']['output']>;
  msLastVisitDate?: Maybe<Scalars['String']['output']>;
  msRaabta?: Maybe<Scalars['String']['output']>;
  teams?: Maybe<Array<Maybe<TeamType>>>;
};

export type PersonRelationCountType = {
  __typename?: 'PersonRelationCountType';
  count: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type PersonRelationCounts = {
  __typename?: 'PersonRelationCounts';
  counts: Array<PersonRelationCountType>;
  personId: Scalars['String']['output'];
  total: Scalars['Int']['output'];
};

export type PersonSharedDataType = {
  __typename?: 'PersonSharedDataType';
  birthDate?: Maybe<Scalars['String']['output']>;
  bloodGroup?: Maybe<Scalars['String']['output']>;
  cnicNumber?: Maybe<Scalars['String']['output']>;
  contactNumber1?: Maybe<Scalars['String']['output']>;
  contactNumber2?: Maybe<Scalars['String']['output']>;
  currentAddress?: Maybe<Scalars['String']['output']>;
  deathDate?: Maybe<Scalars['String']['output']>;
  educationalQualification?: Maybe<Scalars['String']['output']>;
  ehadDate?: Maybe<Scalars['String']['output']>;
  emailAddress?: Maybe<Scalars['String']['output']>;
  imageThumbnailUrl?: Maybe<Scalars['String']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  imageVectorData?: Maybe<PersonImageVectorDataType>;
  meansOfEarning?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  parentName?: Maybe<Scalars['String']['output']>;
  permanentAddress?: Maybe<Scalars['String']['output']>;
  referenceName?: Maybe<Scalars['String']['output']>;
  tagIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  tags?: Maybe<Array<Maybe<PeopleTagType>>>;
};

export type PersonType = {
  __typename?: 'PersonType';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  dataSource?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  deletedBy?: Maybe<Scalars['String']['output']>;
  isEmployee?: Maybe<Scalars['Boolean']['output']>;
  isKarkun?: Maybe<Scalars['Boolean']['output']>;
  isVisitor?: Maybe<Scalars['Boolean']['output']>;
  karkunData?: Maybe<PersonKarkunDataType>;
  sharedData?: Maybe<PersonSharedDataType>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
  visitorData?: Maybe<PersonVisitorDataType>;
};

export type PersonVisitorDataType = {
  __typename?: 'PersonVisitorDataType';
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  criminalRecord?: Maybe<Scalars['String']['output']>;
  otherNotes?: Maybe<Scalars['String']['output']>;
};

export type PhysicalStore = {
  __typename?: 'PhysicalStore';
  _id?: Maybe<Scalars['String']['output']>;
  address?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  permissions?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type PickerPersonType = {
  __typename?: 'PickerPersonType';
  _id: Scalars['String']['output'];
  cnicNumber?: Maybe<Scalars['String']['output']>;
  contactNumber1?: Maybe<Scalars['String']['output']>;
  hasUserAccount?: Maybe<Scalars['Boolean']['output']>;
  imageThumbnailUrl?: Maybe<Scalars['String']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  parentName?: Maybe<Scalars['String']['output']>;
};

export type PurchaseForm = {
  __typename?: 'PurchaseForm';
  _id?: Maybe<Scalars['String']['output']>;
  approvedBy?: Maybe<Scalars['String']['output']>;
  approvedOn?: Maybe<Scalars['String']['output']>;
  attachmentIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  attachments?: Maybe<Array<Maybe<Attachment>>>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  items?: Maybe<Array<Maybe<ItemWithQuantityAndPrice>>>;
  locationId?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  physicalStoreId?: Maybe<Scalars['String']['output']>;
  purchaseDate?: Maybe<Scalars['String']['output']>;
  purchasedBy?: Maybe<Scalars['String']['output']>;
  receivedBy?: Maybe<Scalars['String']['output']>;
  refLocation?: Maybe<Location>;
  refPhysicalStore?: Maybe<PhysicalStore>;
  refPurchasedBy?: Maybe<PersonType>;
  refReceivedBy?: Maybe<PersonType>;
  refVendor?: Maybe<Vendor>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  vendorId?: Maybe<Scalars['String']['output']>;
};

export type PurchasingAttachment = {
  __typename?: 'PurchasingAttachment';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  fileName?: Maybe<Scalars['String']['output']>;
  mimeType?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  ownerId?: Maybe<Scalars['String']['output']>;
  ownerType?: Maybe<Scalars['String']['output']>;
  size?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type PurchasingAttachmentDownload = {
  __typename?: 'PurchasingAttachmentDownload';
  fileName?: Maybe<Scalars['String']['output']>;
  mimeType?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type PurchasingAttachmentUpload = {
  __typename?: 'PurchasingAttachmentUpload';
  contentType?: Maybe<Scalars['String']['output']>;
  uploadId?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type PurchasingAuditLogFilter = {
  entityId?: InputMaybe<Scalars['String']['input']>;
  entityTypes?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  fromDate?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  toDate?: InputMaybe<Scalars['String']['input']>;
};

export type PurchasingCatalogItem = {
  __typename?: 'PurchasingCatalogItem';
  _id?: Maybe<Scalars['String']['output']>;
  category?: Maybe<Scalars['String']['output']>;
  company?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  defaultUnitPrice?: Maybe<Scalars['Float']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  lastUnitPrice?: Maybe<Scalars['Float']['output']>;
  lastVendorId?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  unit?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type PurchasingDashboard = {
  __typename?: 'PurchasingDashboard';
  openOrders?: Maybe<Scalars['Int']['output']>;
  ordersAwaitingApproval?: Maybe<Scalars['Int']['output']>;
  overdueAmount?: Maybe<Scalars['Float']['output']>;
  overdueInvoices?: Maybe<Scalars['Int']['output']>;
  requisitionsAwaitingApproval?: Maybe<Scalars['Int']['output']>;
  totalPayable?: Maybe<Scalars['Float']['output']>;
};

export type PurchasingGroupMember = {
  __typename?: 'PurchasingGroupMember';
  displayName?: Maybe<Scalars['String']['output']>;
  personId?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
  username?: Maybe<Scalars['String']['output']>;
};

export type PurchasingInvoice = {
  __typename?: 'PurchasingInvoice';
  _id?: Maybe<Scalars['String']['output']>;
  balance?: Maybe<Scalars['Float']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  dueDate?: Maybe<Scalars['String']['output']>;
  invoiceDate?: Maybe<Scalars['String']['output']>;
  isDisputed?: Maybe<Scalars['Boolean']['output']>;
  lines?: Maybe<Array<Maybe<PurchasingInvoiceLine>>>;
  notes?: Maybe<Scalars['String']['output']>;
  number?: Maybe<Scalars['String']['output']>;
  orderId?: Maybe<Scalars['String']['output']>;
  orderIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  orders?: Maybe<Array<Maybe<PurchasingOrder>>>;
  paidAmount?: Maybe<Scalars['Float']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  subtotal?: Maybe<Scalars['Float']['output']>;
  taxTotal?: Maybe<Scalars['Float']['output']>;
  total?: Maybe<Scalars['Float']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  vendor?: Maybe<PurchasingVendor>;
  vendorId?: Maybe<Scalars['String']['output']>;
  vendorInvoiceNo?: Maybe<Scalars['String']['output']>;
  voidedAt?: Maybe<Scalars['String']['output']>;
  voidedBy?: Maybe<Scalars['String']['output']>;
};

export type PurchasingInvoiceLine = {
  __typename?: 'PurchasingInvoiceLine';
  _id?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  externalCatalogId?: Maybe<Scalars['String']['output']>;
  internalCatalogId?: Maybe<Scalars['String']['output']>;
  orderId?: Maybe<Scalars['String']['output']>;
  orderLineId?: Maybe<Scalars['String']['output']>;
  quantity?: Maybe<Scalars['Float']['output']>;
  taxRate?: Maybe<Scalars['Float']['output']>;
  unit?: Maybe<Scalars['String']['output']>;
  unitPrice?: Maybe<Scalars['Float']['output']>;
};

export type PurchasingLedgerEntry = {
  __typename?: 'PurchasingLedgerEntry';
  amount?: Maybe<Scalars['Float']['output']>;
  balance?: Maybe<Scalars['Float']['output']>;
  date?: Maybe<Scalars['String']['output']>;
  documentId?: Maybe<Scalars['String']['output']>;
  number?: Maybe<Scalars['String']['output']>;
  reference?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type PurchasingMonthlySpending = {
  __typename?: 'PurchasingMonthlySpending';
  invoiceCount?: Maybe<Scalars['Int']['output']>;
  month?: Maybe<Scalars['String']['output']>;
  total?: Maybe<Scalars['Float']['output']>;
};

export type PurchasingOpenOrder = {
  __typename?: 'PurchasingOpenOrder';
  expectedDeliveryDate?: Maybe<Scalars['String']['output']>;
  isOverdue?: Maybe<Scalars['Boolean']['output']>;
  number?: Maybe<Scalars['String']['output']>;
  orderDate?: Maybe<Scalars['String']['output']>;
  orderId?: Maybe<Scalars['String']['output']>;
  outstandingValue?: Maybe<Scalars['Float']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  total?: Maybe<Scalars['Float']['output']>;
  vendor?: Maybe<PurchasingVendor>;
  vendorId?: Maybe<Scalars['String']['output']>;
};

export type PurchasingOrder = {
  __typename?: 'PurchasingOrder';
  _id?: Maybe<Scalars['String']['output']>;
  approvedAt?: Maybe<Scalars['String']['output']>;
  approvedBy?: Maybe<Scalars['String']['output']>;
  cancelledAt?: Maybe<Scalars['String']['output']>;
  cancelledBy?: Maybe<Scalars['String']['output']>;
  closedAt?: Maybe<Scalars['String']['output']>;
  closedBy?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  deliveryAddress?: Maybe<Scalars['String']['output']>;
  discount?: Maybe<Scalars['Float']['output']>;
  expectedDeliveryDate?: Maybe<Scalars['String']['output']>;
  externalSourceId?: Maybe<Scalars['String']['output']>;
  lines?: Maybe<Array<Maybe<PurchasingOrderLine>>>;
  notes?: Maybe<Scalars['String']['output']>;
  number?: Maybe<Scalars['String']['output']>;
  orderDate?: Maybe<Scalars['String']['output']>;
  paymentTermsDays?: Maybe<Scalars['Int']['output']>;
  quoteId?: Maybe<Scalars['String']['output']>;
  rejectionReason?: Maybe<Scalars['String']['output']>;
  requisitionId?: Maybe<Scalars['String']['output']>;
  sentAt?: Maybe<Scalars['String']['output']>;
  sentBy?: Maybe<Scalars['String']['output']>;
  shipping?: Maybe<Scalars['Float']['output']>;
  source?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  submittedAt?: Maybe<Scalars['String']['output']>;
  submittedBy?: Maybe<Scalars['String']['output']>;
  subtotal?: Maybe<Scalars['Float']['output']>;
  taxTotal?: Maybe<Scalars['Float']['output']>;
  total?: Maybe<Scalars['Float']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  vendor?: Maybe<PurchasingVendor>;
  vendorId?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['Int']['output']>;
};

export type PurchasingOrderLine = {
  __typename?: 'PurchasingOrderLine';
  _id?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  externalCatalogId?: Maybe<Scalars['String']['output']>;
  internalCatalogId?: Maybe<Scalars['String']['output']>;
  invoicedQuantity?: Maybe<Scalars['Float']['output']>;
  quantity?: Maybe<Scalars['Float']['output']>;
  receivedQuantity?: Maybe<Scalars['Float']['output']>;
  requisitionLineId?: Maybe<Scalars['String']['output']>;
  taxRate?: Maybe<Scalars['Float']['output']>;
  unit?: Maybe<Scalars['String']['output']>;
  unitPrice?: Maybe<Scalars['Float']['output']>;
};

export type PurchasingPayablesAgingRow = {
  __typename?: 'PurchasingPayablesAgingRow';
  current?: Maybe<Scalars['Float']['output']>;
  days1To30?: Maybe<Scalars['Float']['output']>;
  days31To60?: Maybe<Scalars['Float']['output']>;
  days61Plus?: Maybe<Scalars['Float']['output']>;
  total?: Maybe<Scalars['Float']['output']>;
  vendor?: Maybe<PurchasingVendor>;
  vendorId?: Maybe<Scalars['String']['output']>;
};

export type PurchasingPayment = {
  __typename?: 'PurchasingPayment';
  _id?: Maybe<Scalars['String']['output']>;
  allocations?: Maybe<Array<Maybe<PurchasingPaymentAllocation>>>;
  amount?: Maybe<Scalars['Float']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  method?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  number?: Maybe<Scalars['String']['output']>;
  paymentDate?: Maybe<Scalars['String']['output']>;
  reference?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  vendor?: Maybe<PurchasingVendor>;
  vendorId?: Maybe<Scalars['String']['output']>;
  voidReason?: Maybe<Scalars['String']['output']>;
  voidedAt?: Maybe<Scalars['String']['output']>;
  voidedBy?: Maybe<Scalars['String']['output']>;
};

export type PurchasingPaymentAllocation = {
  __typename?: 'PurchasingPaymentAllocation';
  amount?: Maybe<Scalars['Float']['output']>;
  invoice?: Maybe<PurchasingInvoice>;
  invoiceId?: Maybe<Scalars['String']['output']>;
};

export type PurchasingPaymentAllocationInput = {
  amount: Scalars['Float']['input'];
  invoiceId: Scalars['String']['input'];
};

export type PurchasingPermissionAssignment = {
  __typename?: 'PurchasingPermissionAssignment';
  committees?: Maybe<Array<Maybe<PurchasingPermissionCommitteeHolder>>>;
  description?: Maybe<Scalars['String']['output']>;
  groups?: Maybe<Array<Maybe<PurchasingPermissionGroupHolder>>>;
  key: Scalars['String']['output'];
  name: Scalars['String']['output'];
  users?: Maybe<Array<Maybe<PurchasingPermissionHolder>>>;
};

export type PurchasingPermissionCommitteeHolder = {
  __typename?: 'PurchasingPermissionCommitteeHolder';
  committeeId: Scalars['String']['output'];
  locationName?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type PurchasingPermissionGroup = {
  __typename?: 'PurchasingPermissionGroup';
  featureKey: Scalars['String']['output'];
  featureName: Scalars['String']['output'];
  permissions?: Maybe<Array<Maybe<PurchasingPermissionAssignment>>>;
};

export type PurchasingPermissionGroupHolder = {
  __typename?: 'PurchasingPermissionGroupHolder';
  groupId: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type PurchasingPermissionHolder = {
  __typename?: 'PurchasingPermissionHolder';
  displayName?: Maybe<Scalars['String']['output']>;
  personId?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
  username?: Maybe<Scalars['String']['output']>;
};

export type PurchasingPettyCashExpenseHead = {
  __typename?: 'PurchasingPettyCashExpenseHead';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  inUse?: Maybe<Scalars['Boolean']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['Int']['output']>;
};

export type PurchasingPettyCashFund = {
  __typename?: 'PurchasingPettyCashFund';
  _id?: Maybe<Scalars['String']['output']>;
  balance?: Maybe<Scalars['Float']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  custodian?: Maybe<PersonBasicType>;
  custodianPersonId?: Maybe<Scalars['String']['output']>;
  floatAmount?: Maybe<Scalars['Float']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  perTransactionLimit?: Maybe<Scalars['Float']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['Int']['output']>;
};

export type PurchasingPettyCashLedger = {
  __typename?: 'PurchasingPettyCashLedger';
  closingBalance?: Maybe<Scalars['Float']['output']>;
  heads?: Maybe<Array<Maybe<PurchasingPettyCashLedgerHead>>>;
  openingBalance?: Maybe<Scalars['Float']['output']>;
  replenishmentTotal?: Maybe<Scalars['Float']['output']>;
  voucherTotal?: Maybe<Scalars['Float']['output']>;
};

export type PurchasingPettyCashLedgerHead = {
  __typename?: 'PurchasingPettyCashLedgerHead';
  _id?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  total?: Maybe<Scalars['Float']['output']>;
};

export type PurchasingPettyCashReplenishment = {
  __typename?: 'PurchasingPettyCashReplenishment';
  _id?: Maybe<Scalars['String']['output']>;
  amount?: Maybe<Scalars['Float']['output']>;
  approvedAt?: Maybe<Scalars['String']['output']>;
  approvedBy?: Maybe<Scalars['String']['output']>;
  countedCash?: Maybe<Scalars['Float']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  fund?: Maybe<PurchasingPettyCashFund>;
  fundId?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  number?: Maybe<Scalars['String']['output']>;
  rejectedAt?: Maybe<Scalars['String']['output']>;
  rejectedBy?: Maybe<Scalars['String']['output']>;
  rejectionReason?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  variance?: Maybe<Scalars['Float']['output']>;
  version?: Maybe<Scalars['Int']['output']>;
  voucherIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type PurchasingPettyCashVoucher = {
  __typename?: 'PurchasingPettyCashVoucher';
  _id?: Maybe<Scalars['String']['output']>;
  approvedAt?: Maybe<Scalars['String']['output']>;
  approvedBy?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  expenseHead?: Maybe<PurchasingPettyCashExpenseHead>;
  expenseHeadId?: Maybe<Scalars['String']['output']>;
  fund?: Maybe<PurchasingPettyCashFund>;
  fundId?: Maybe<Scalars['String']['output']>;
  lines?: Maybe<Array<Maybe<PurchasingPettyCashVoucherLine>>>;
  number?: Maybe<Scalars['String']['output']>;
  payee?: Maybe<Scalars['String']['output']>;
  purpose?: Maybe<Scalars['String']['output']>;
  rejectedAt?: Maybe<Scalars['String']['output']>;
  rejectedBy?: Maybe<Scalars['String']['output']>;
  rejectionReason?: Maybe<Scalars['String']['output']>;
  replenishmentId?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  submittedAt?: Maybe<Scalars['String']['output']>;
  submittedBy?: Maybe<Scalars['String']['output']>;
  total?: Maybe<Scalars['Float']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  vendor?: Maybe<PurchasingVendor>;
  vendorId?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['Int']['output']>;
  voidReason?: Maybe<Scalars['String']['output']>;
  voidedAt?: Maybe<Scalars['String']['output']>;
  voidedBy?: Maybe<Scalars['String']['output']>;
  voucherDate?: Maybe<Scalars['String']['output']>;
};

export type PurchasingPettyCashVoucherLine = {
  __typename?: 'PurchasingPettyCashVoucherLine';
  _id?: Maybe<Scalars['String']['output']>;
  amount?: Maybe<Scalars['Float']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  externalCatalogId?: Maybe<Scalars['String']['output']>;
  physicalStoreId?: Maybe<Scalars['String']['output']>;
  physicalStoreName?: Maybe<Scalars['String']['output']>;
  quantity?: Maybe<Scalars['Float']['output']>;
  stockItemName?: Maybe<Scalars['String']['output']>;
  unit?: Maybe<Scalars['String']['output']>;
  unitPrice?: Maybe<Scalars['Float']['output']>;
};

export type PurchasingPettyCashVoucherLineInput = {
  _id?: InputMaybe<Scalars['String']['input']>;
  description: Scalars['String']['input'];
  externalCatalogId?: InputMaybe<Scalars['String']['input']>;
  physicalStoreId?: InputMaybe<Scalars['String']['input']>;
  quantity: Scalars['Float']['input'];
  unit?: InputMaybe<Scalars['String']['input']>;
  unitPrice: Scalars['Float']['input'];
};

export type PurchasingPricedLineInput = {
  _id?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  internalCatalogId?: InputMaybe<Scalars['String']['input']>;
  orderId?: InputMaybe<Scalars['String']['input']>;
  orderLineId?: InputMaybe<Scalars['String']['input']>;
  quantity: Scalars['Float']['input'];
  requisitionLineId?: InputMaybe<Scalars['String']['input']>;
  taxRate?: InputMaybe<Scalars['Float']['input']>;
  unit?: InputMaybe<Scalars['String']['input']>;
  unitPrice: Scalars['Float']['input'];
};

export type PurchasingQuote = {
  __typename?: 'PurchasingQuote';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  lines?: Maybe<Array<Maybe<PurchasingQuoteLine>>>;
  notes?: Maybe<Scalars['String']['output']>;
  quoteDate?: Maybe<Scalars['String']['output']>;
  reference?: Maybe<Scalars['String']['output']>;
  requisitionId?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  total?: Maybe<Scalars['Float']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  validUntil?: Maybe<Scalars['String']['output']>;
  vendor?: Maybe<PurchasingVendor>;
  vendorId?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['Int']['output']>;
};

export type PurchasingQuoteLine = {
  __typename?: 'PurchasingQuoteLine';
  _id?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  externalCatalogId?: Maybe<Scalars['String']['output']>;
  internalCatalogId?: Maybe<Scalars['String']['output']>;
  quantity?: Maybe<Scalars['Float']['output']>;
  requisitionLineId?: Maybe<Scalars['String']['output']>;
  unit?: Maybe<Scalars['String']['output']>;
  unitPrice?: Maybe<Scalars['Float']['output']>;
};

export type PurchasingReceipt = {
  __typename?: 'PurchasingReceipt';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  deliveryNoteNo?: Maybe<Scalars['String']['output']>;
  externalSourceId?: Maybe<Scalars['String']['output']>;
  lines?: Maybe<Array<Maybe<PurchasingReceiptLine>>>;
  notes?: Maybe<Scalars['String']['output']>;
  number?: Maybe<Scalars['String']['output']>;
  order?: Maybe<PurchasingOrder>;
  orderId?: Maybe<Scalars['String']['output']>;
  receivedBy?: Maybe<Scalars['String']['output']>;
  receivedByPerson?: Maybe<PersonBasicType>;
  receivedDate?: Maybe<Scalars['String']['output']>;
  source?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  vendor?: Maybe<PurchasingVendor>;
  vendorId?: Maybe<Scalars['String']['output']>;
  voidReason?: Maybe<Scalars['String']['output']>;
  voidedAt?: Maybe<Scalars['String']['output']>;
  voidedBy?: Maybe<Scalars['String']['output']>;
};

export type PurchasingReceiptLine = {
  __typename?: 'PurchasingReceiptLine';
  _id?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  externalCatalogId?: Maybe<Scalars['String']['output']>;
  orderLineId?: Maybe<Scalars['String']['output']>;
  receivedQuantity?: Maybe<Scalars['Float']['output']>;
  rejectedQuantity?: Maybe<Scalars['Float']['output']>;
  remarks?: Maybe<Scalars['String']['output']>;
  unit?: Maybe<Scalars['String']['output']>;
};

export type PurchasingReceiptLineInput = {
  orderLineId: Scalars['String']['input'];
  receivedQuantity: Scalars['Float']['input'];
  rejectedQuantity?: InputMaybe<Scalars['Float']['input']>;
  remarks?: InputMaybe<Scalars['String']['input']>;
};

export type PurchasingRequisition = {
  __typename?: 'PurchasingRequisition';
  _id?: Maybe<Scalars['String']['output']>;
  approvedAt?: Maybe<Scalars['String']['output']>;
  approvedBy?: Maybe<Scalars['String']['output']>;
  cancelledAt?: Maybe<Scalars['String']['output']>;
  cancelledBy?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  estimatedTotal?: Maybe<Scalars['Float']['output']>;
  externalSourceId?: Maybe<Scalars['String']['output']>;
  lines?: Maybe<Array<Maybe<PurchasingRequisitionLine>>>;
  neededBy?: Maybe<Scalars['String']['output']>;
  number?: Maybe<Scalars['String']['output']>;
  purpose?: Maybe<Scalars['String']['output']>;
  rejectedAt?: Maybe<Scalars['String']['output']>;
  rejectedBy?: Maybe<Scalars['String']['output']>;
  rejectionReason?: Maybe<Scalars['String']['output']>;
  requestedBy?: Maybe<Scalars['String']['output']>;
  requestedByPerson?: Maybe<PersonBasicType>;
  requestedFor?: Maybe<Scalars['String']['output']>;
  source?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  submittedAt?: Maybe<Scalars['String']['output']>;
  submittedBy?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['Int']['output']>;
};

export type PurchasingRequisitionLine = {
  __typename?: 'PurchasingRequisitionLine';
  _id?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  estimatedUnitPrice?: Maybe<Scalars['Float']['output']>;
  externalCatalogId?: Maybe<Scalars['String']['output']>;
  internalCatalogId?: Maybe<Scalars['String']['output']>;
  quantity?: Maybe<Scalars['Float']['output']>;
  unit?: Maybe<Scalars['String']['output']>;
};

export type PurchasingRequisitionLineInput = {
  _id?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  estimatedUnitPrice?: InputMaybe<Scalars['Float']['input']>;
  internalCatalogId?: InputMaybe<Scalars['String']['input']>;
  quantity: Scalars['Float']['input'];
  unit?: InputMaybe<Scalars['String']['input']>;
};

export type PurchasingUserGroup = {
  __typename?: 'PurchasingUserGroup';
  _id: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  users?: Maybe<Array<Maybe<PurchasingGroupMember>>>;
};

export type PurchasingVendor = {
  __typename?: 'PurchasingVendor';
  _id?: Maybe<Scalars['String']['output']>;
  address?: Maybe<Scalars['String']['output']>;
  bankAccountNumber?: Maybe<Scalars['String']['output']>;
  bankAccountTitle?: Maybe<Scalars['String']['output']>;
  bankName?: Maybe<Scalars['String']['output']>;
  contactPerson?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  isActive?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  paymentTermsDays?: Maybe<Scalars['Int']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  taxId?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type PurchasingVendorLedger = {
  __typename?: 'PurchasingVendorLedger';
  closingBalance?: Maybe<Scalars['Float']['output']>;
  entries?: Maybe<Array<Maybe<PurchasingLedgerEntry>>>;
  openingBalance?: Maybe<Scalars['Float']['output']>;
};

export type PurchasingVendorSpending = {
  __typename?: 'PurchasingVendorSpending';
  invoiceCount?: Maybe<Scalars['Int']['output']>;
  paidAmount?: Maybe<Scalars['Float']['output']>;
  total?: Maybe<Scalars['Float']['output']>;
  vendor?: Maybe<PurchasingVendor>;
  vendorId?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  adminFaceRecognitionSettings?: Maybe<FaceRecognitionSettingsType>;
  adminKarkunLocations?: Maybe<Array<Maybe<AdminKarkunLocationType>>>;
  adminPeopleRegistrationImageSettings?: Maybe<PeopleRegistrationImageSettingsType>;
  adminPeopleSearchFaceSettings?: Maybe<PeopleSearchFaceSettingsType>;
  allAccessiblePhysicalStores?: Maybe<Array<Maybe<PhysicalStore>>>;
  allCities?: Maybe<Array<Maybe<CityType>>>;
  allCityMehfils?: Maybe<Array<Maybe<CityMehfilType>>>;
  allCommitteeFeatures?: Maybe<Array<Maybe<CommitteeFeatureType>>>;
  allDutyLocations?: Maybe<Array<Maybe<DutyLocationType>>>;
  allDutyShifts?: Maybe<Array<Maybe<DutyShiftType>>>;
  allJobDefinitions?: Maybe<Array<Maybe<JobDefinitionType>>>;
  allJobs?: Maybe<Array<Maybe<JobType>>>;
  allLeaveTypes?: Maybe<Array<Maybe<LeaveTypeType>>>;
  allMSDuties?: Maybe<Array<Maybe<DutyType>>>;
  allMehfilDuties?: Maybe<Array<Maybe<MehfilDutyType>>>;
  allOrgLocations?: Maybe<Array<Maybe<OrgLocationType>>>;
  allPeopleTags?: Maybe<Array<Maybe<PeopleTagType>>>;
  allSecurityEventDuties?: Maybe<Array<Maybe<SecurityEventDutyType>>>;
  allSecurityEventLangarDishes?: Maybe<Array<Maybe<SecurityEventLangarDishType>>>;
  allSecurityEventLangarLocations?: Maybe<Array<Maybe<SecurityEventLangarLocationType>>>;
  allSecurityEvents?: Maybe<Array<Maybe<SecurityEventType>>>;
  allSecurityServerChannels?: Maybe<Array<Maybe<SecurityServerChannelType>>>;
  allTeams?: Maybe<Array<Maybe<TeamType>>>;
  cityById?: Maybe<CityType>;
  cityMehfilsByCityId?: Maybe<Array<Maybe<CityMehfilType>>>;
  committeeById?: Maybe<CommitteeType>;
  committeeMembers?: Maybe<CommitteeMembersPageType>;
  committeesByLocationId?: Maybe<Array<Maybe<CommitteeType>>>;
  currentUser?: Maybe<UserType>;
  deletedPersonById?: Maybe<PersonType>;
  deletedPersonRelationCounts?: Maybe<Array<PersonRelationCounts>>;
  distinctCities?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  distinctCountries?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  distinctPurchasingRequisitionRequestedFor?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  distinctRegions?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  distinctStayAllowedBy?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  duplicateCnics?: Maybe<Array<Maybe<DuplicatePersonGroupType>>>;
  duplicatePersonById?: Maybe<PersonType>;
  duplicatePersonRelationCounts?: Maybe<Array<PersonRelationCounts>>;
  duplicatePhoneNumbers?: Maybe<Array<Maybe<DuplicatePersonGroupType>>>;
  dutyAttendanceCards?: Maybe<Array<Maybe<DutyAttendanceCardType>>>;
  dutyAttendanceSheet?: Maybe<Array<Maybe<DutyAttendanceSheetRowType>>>;
  dutyPlanDays?: Maybe<DutyPlanDaysType>;
  dutyPlanWeek?: Maybe<DutyPlanWeekType>;
  employmentEventsByPersonId?: Maybe<Array<Maybe<EmploymentEventType>>>;
  hrCommitteeOptions?: Maybe<Array<Maybe<CommitteeType>>>;
  hrEmployeeById?: Maybe<HrEmployeeType>;
  hrEmployeesById?: Maybe<Array<Maybe<HrEmployeeType>>>;
  hrEmployeesPermissionAssignments?: Maybe<Array<Maybe<HrPermissionGroup>>>;
  hrEmployeesUserGroups?: Maybe<Array<Maybe<HrUserGroup>>>;
  hrEmploymentSettings?: Maybe<HrEmploymentSettingsType>;
  hrKarkunById?: Maybe<PersonType>;
  hrKarkunsById?: Maybe<Array<Maybe<PersonType>>>;
  hrKarkunsPermissionAssignments?: Maybe<Array<Maybe<HrPermissionGroup>>>;
  hrKarkunsUserGroups?: Maybe<Array<Maybe<HrUserGroup>>>;
  inboxConversation?: Maybe<InboxConversationDetailType>;
  isJobProcessorActive?: Maybe<Scalars['Boolean']['output']>;
  issuanceFormById?: Maybe<IssuanceForm>;
  issuanceFormsByMonth?: Maybe<Array<Maybe<IssuanceForm>>>;
  issuanceFormsByStockItem?: Maybe<Array<Maybe<IssuanceForm>>>;
  itemCategoriesByPhysicalStoreId?: Maybe<Array<Maybe<ItemCategory>>>;
  itemCategoryById?: Maybe<ItemCategory>;
  jobById?: Maybe<JobType>;
  karkunDutyAttendanceSheet?: Maybe<Array<Maybe<DutyAttendanceSheetRowType>>>;
  leaveAdjustmentsByPersonId?: Maybe<Array<Maybe<LeaveAdjustmentType>>>;
  leaveBalances?: Maybe<Array<Maybe<LeaveBalanceType>>>;
  leaveDaysCount?: Maybe<Scalars['Float']['output']>;
  leaveRequestById?: Maybe<LeaveRequestType>;
  leaveTypeById?: Maybe<LeaveTypeType>;
  locationById?: Maybe<Location>;
  locationsByPhysicalStoreId?: Maybe<Array<Maybe<Location>>>;
  managedPhysicalStoreById?: Maybe<PhysicalStore>;
  managedPhysicalStores?: Maybe<Array<Maybe<PhysicalStore>>>;
  myCommitteeLocations?: Maybe<Array<Maybe<WorkspaceLocationType>>>;
  myCommittees?: Maybe<Array<Maybe<WorkspaceCommitteeType>>>;
  myDuties: Array<Maybe<DaMyDutyType>>;
  myDutiesAttendanceLocations: Array<Maybe<DaMyLocationType>>;
  myMehfilDetailsLocations: Array<Maybe<MyMehfilDetailsLocationType>>;
  myMehfilKarkunsLocations: Array<Maybe<MyMehfilKarkunsLocationType>>;
  myMehfilPermissionsLocations: Array<Maybe<MyMehfilPermissionsLocationType>>;
  myNotificationCounts?: Maybe<Array<Maybe<NotificationCountType>>>;
  myNotifications?: Maybe<Array<Maybe<NotificationType>>>;
  myTrustedDevices?: Maybe<Array<Maybe<TrustedDeviceType>>>;
  orgLocationById?: Maybe<OrgLocationType>;
  orgLocationFeaturePermissions?: Maybe<Array<Maybe<OrgLocationFeaturePermissionsType>>>;
  pagedAdminUserKarkuns?: Maybe<PagedPickerPersonType>;
  pagedCities?: Maybe<PagedCityType>;
  pagedDeletedPeople?: Maybe<PagedPeopleType>;
  pagedFreeFormCities?: Maybe<PagedFreeFormCity>;
  pagedFreeFormCountries?: Maybe<PagedFreeFormValue>;
  pagedHrEmployeeCandidateKarkuns?: Maybe<PagedPickerPersonType>;
  pagedHrEmployees?: Maybe<PagedHrEmployeeType>;
  pagedHrEmployeesAuditLogs?: Maybe<PagedAuditLogType>;
  pagedHrEmployeesPermissionKarkuns?: Maybe<PagedPickerPersonType>;
  pagedHrKarkunCandidatePeople?: Maybe<PagedPickerPersonType>;
  pagedHrKarkuns?: Maybe<PagedKarkunType>;
  pagedHrKarkunsAuditLogs?: Maybe<PagedAuditLogType>;
  pagedHrKarkunsPermissionKarkuns?: Maybe<PagedPickerPersonType>;
  pagedHrLeaveConfirmationKarkuns?: Maybe<PagedPickerPersonType>;
  pagedHrLeaveEmployees?: Maybe<PagedPickerPersonType>;
  pagedHrPickerKarkuns?: Maybe<PagedPickerPersonType>;
  pagedHrReportsToKarkuns?: Maybe<PagedPickerPersonType>;
  pagedInboxConversations?: Maybe<PagedInboxConversationType>;
  pagedIssuanceForms?: Maybe<PagedIssuanceForm>;
  pagedJobLogs?: Maybe<PagedJobLogsType>;
  pagedLeaveRequests?: Maybe<PagedLeaveRequestType>;
  pagedLinkableUsers?: Maybe<PagedUserType>;
  pagedMehfilKarkuns: PagedMehfilLocationKarkunType;
  pagedOrgLocationKarkuns?: Maybe<PagedPickerPersonType>;
  pagedOrgLocationObserverKarkuns?: Maybe<PagedPickerPersonType>;
  pagedOrgLocationUsers?: Maybe<PagedUserType>;
  pagedPurchaseForms?: Maybe<PagedPurchaseForm>;
  pagedPurchasingAuditLogs?: Maybe<PagedAuditLogType>;
  pagedPurchasingCatalogItems?: Maybe<PagedPurchasingCatalogItems>;
  pagedPurchasingCustodianKarkuns?: Maybe<PagedPickerPersonType>;
  pagedPurchasingInvoices?: Maybe<PagedPurchasingInvoices>;
  pagedPurchasingKarkuns?: Maybe<PagedPickerPersonType>;
  pagedPurchasingOrders?: Maybe<PagedPurchasingOrders>;
  pagedPurchasingPayments?: Maybe<PagedPurchasingPayments>;
  pagedPurchasingPermissionKarkuns?: Maybe<PagedPickerPersonType>;
  pagedPurchasingPettyCashExpenseHeads?: Maybe<PagedPurchasingPettyCashExpenseHeads>;
  pagedPurchasingPettyCashFunds?: Maybe<PagedPurchasingPettyCashFunds>;
  pagedPurchasingPettyCashReplenishments?: Maybe<PagedPurchasingPettyCashReplenishments>;
  pagedPurchasingPettyCashVouchers?: Maybe<PagedPurchasingPettyCashVouchers>;
  pagedPurchasingQuotes?: Maybe<PagedPurchasingQuotes>;
  pagedPurchasingReceipts?: Maybe<PagedPurchasingReceipts>;
  pagedPurchasingRequisitions?: Maybe<PagedPurchasingRequisitions>;
  pagedPurchasingVendors?: Maybe<PagedPurchasingVendors>;
  pagedSalariesByKarkun?: Maybe<PagedSalaryType>;
  pagedScheduledJobs?: Maybe<PagedScheduledJobsType>;
  pagedSecurityAuditLogs?: Maybe<PagedAuditLogType>;
  pagedSecurityEventPeople?: Maybe<PagedPickerPersonType>;
  pagedSecurityLogs?: Maybe<PagedSecurityLogType>;
  pagedSecurityPermissionKarkuns?: Maybe<PagedPickerPersonType>;
  pagedSecurityServerAlertGroups?: Maybe<PagedSecurityServerAlertGroupType>;
  pagedSecurityServerAlerts?: Maybe<PagedSecurityServerAlertType>;
  pagedSecurityServerProfiles?: Maybe<PagedSecurityServerProfileType>;
  pagedSecurityVisitors?: Maybe<PagedVisitorType>;
  pagedStockAdjustments?: Maybe<PagedStockAdjustment>;
  pagedStockItems?: Maybe<PagedStockItem>;
  pagedStoreKarkuns?: Maybe<PagedPickerPersonType>;
  pagedStoreOrders?: Maybe<PagedStoreOrders>;
  pagedStorePermissionKarkuns?: Maybe<PagedPickerPersonType>;
  pagedStoreReceipts?: Maybe<PagedStoreReceipts>;
  pagedStoreRequisitions?: Maybe<PagedPurchasingRequisitions>;
  pagedUserGroups?: Maybe<PagedUserGroupType>;
  pagedUsers?: Maybe<PagedUserType>;
  pagedVisitorStays?: Maybe<PagedVisitorStayType>;
  pagedVisitorStaysByVisitorId?: Maybe<PagedVisitorStayType>;
  pagedWorkspaceCommitteeKarkuns?: Maybe<PagedPickerPersonType>;
  pagedWorkspaceDaKarkuns?: Maybe<PagedPickerPersonType>;
  pagedWorkspaceMehfilPermissionsKarkuns?: Maybe<PagedPickerPersonType>;
  physicalStoreAccess?: Maybe<Array<Maybe<StorePermissionHolders>>>;
  physicalStoreById?: Maybe<PhysicalStore>;
  purchaseFormById?: Maybe<PurchaseForm>;
  purchaseFormsByMonth?: Maybe<Array<Maybe<PurchaseForm>>>;
  purchaseFormsByStockItem?: Maybe<Array<Maybe<PurchaseForm>>>;
  purchasingAttachmentDownload?: Maybe<PurchasingAttachmentDownload>;
  purchasingAttachments?: Maybe<Array<Maybe<PurchasingAttachment>>>;
  purchasingCatalogItemById?: Maybe<PurchasingCatalogItem>;
  purchasingDashboard?: Maybe<PurchasingDashboard>;
  purchasingInvoiceById?: Maybe<PurchasingInvoice>;
  purchasingOpenOrders?: Maybe<Array<Maybe<PurchasingOpenOrder>>>;
  purchasingOrderById?: Maybe<PurchasingOrder>;
  purchasingPayablesAging?: Maybe<Array<Maybe<PurchasingPayablesAgingRow>>>;
  purchasingPaymentById?: Maybe<PurchasingPayment>;
  purchasingPermissionAssignments?: Maybe<Array<Maybe<PurchasingPermissionGroup>>>;
  purchasingPettyCashExpenseHeadById?: Maybe<PurchasingPettyCashExpenseHead>;
  purchasingPettyCashFundById?: Maybe<PurchasingPettyCashFund>;
  purchasingPettyCashLedger?: Maybe<PurchasingPettyCashLedger>;
  purchasingPettyCashReplenishmentById?: Maybe<PurchasingPettyCashReplenishment>;
  purchasingPettyCashVoucherById?: Maybe<PurchasingPettyCashVoucher>;
  purchasingQuoteById?: Maybe<PurchasingQuote>;
  purchasingReceiptById?: Maybe<PurchasingReceipt>;
  purchasingRequisitionById?: Maybe<PurchasingRequisition>;
  purchasingSpendingByMonth?: Maybe<Array<Maybe<PurchasingMonthlySpending>>>;
  purchasingSpendingByVendor?: Maybe<Array<Maybe<PurchasingVendorSpending>>>;
  purchasingUserGroups?: Maybe<Array<Maybe<PurchasingUserGroup>>>;
  purchasingVendorById?: Maybe<PurchasingVendor>;
  purchasingVendorLedger?: Maybe<PurchasingVendorLedger>;
  referenceCityMehfilLocations?: Maybe<Array<Maybe<ReferenceOrgLocationType>>>;
  referenceCommitteesByLocation?: Maybe<Array<Maybe<ReferenceCommitteeType>>>;
  referenceDutyShifts?: Maybe<Array<Maybe<ReferenceDutyShiftType>>>;
  referenceMsDuties?: Maybe<Array<Maybe<ReferenceDutyType>>>;
  referenceOrgLocations?: Maybe<Array<Maybe<ReferenceOrgLocationType>>>;
  referencePhysicalStores?: Maybe<Array<Maybe<ReferencePhysicalStoreType>>>;
  referenceStockItems?: Maybe<Array<Maybe<ReferenceStockItemType>>>;
  salariesByIds?: Maybe<Array<Maybe<SalaryType>>>;
  salariesByMonth?: Maybe<Array<Maybe<SalaryType>>>;
  securityEventById?: Maybe<SecurityEventType>;
  securityEventDutyById?: Maybe<SecurityEventDutyType>;
  securityEventKarkunByBarcodeId?: Maybe<SecurityEventKarkunType>;
  securityEventKarkunsByEventId?: Maybe<Array<Maybe<SecurityEventKarkunType>>>;
  securityEventKarkunsByIds?: Maybe<Array<Maybe<SecurityEventKarkunType>>>;
  securityEventLangarDishById?: Maybe<SecurityEventLangarDishType>;
  securityEventLangarLocationById?: Maybe<SecurityEventLangarLocationType>;
  securityFaceVectorFromImage?: Maybe<FaceVectorResultType>;
  securityLogUsers: Array<SecurityLogUserOption>;
  securityPermissionAssignments?: Maybe<Array<Maybe<SecurityPermissionGroup>>>;
  securityServerAlertById?: Maybe<SecurityServerAlertType>;
  securityServerAlertSyncStatus?: Maybe<SecurityServerAlertSyncStatusType>;
  securityServerChannelById?: Maybe<SecurityServerChannelType>;
  securityServerProfileById?: Maybe<SecurityServerProfileType>;
  securityServerUsageStats?: Maybe<SecurityServerUsageSummaryType>;
  securityUserGroups?: Maybe<Array<Maybe<SecurityUserGroup>>>;
  securityVisitorByCnic?: Maybe<PersonType>;
  securityVisitorById?: Maybe<PersonType>;
  securityVisitorsByFaceVector?: Maybe<Array<Maybe<VisitorFaceMatchType>>>;
  stockAdjustmentById?: Maybe<StockAdjustment>;
  stockAdjustmentsByStockItem?: Maybe<Array<Maybe<StockAdjustment>>>;
  stockItemById?: Maybe<StockItem>;
  stockItemsById?: Maybe<Array<Maybe<StockItem>>>;
  storeOrderById?: Maybe<StoreOrder>;
  storeReceiptById?: Maybe<StoreReceipt>;
  storeRequisitionById?: Maybe<PurchasingRequisition>;
  storeUserGroups?: Maybe<Array<Maybe<StoreUserGroup>>>;
  userAccountAvailability: UserAccountAvailabilityType;
  userById?: Maybe<UserType>;
  userGroupById?: Maybe<UserGroupType>;
  userNames?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  userTrustedDevices?: Maybe<Array<Maybe<TrustedDeviceType>>>;
  vendorById?: Maybe<Vendor>;
  vendorsByPhysicalStoreId?: Maybe<Array<Maybe<Vendor>>>;
  visitorStayById?: Maybe<VisitorStayType>;
  workspaceCommitteeById?: Maybe<WorkspaceCommitteeType>;
  workspaceDaAccess?: Maybe<DaAccessType>;
  workspaceDaAttendanceSheet?: Maybe<Array<Maybe<DaAttendanceSheetRowType>>>;
  workspaceDaDuties?: Maybe<Array<Maybe<DaDutyType>>>;
  workspaceDaDutyById?: Maybe<DaDutyType>;
  workspaceDaMehfilDuties?: Maybe<Array<Maybe<DaMehfilDutyType>>>;
  workspaceDaPlanDays?: Maybe<DaPlanDaysType>;
  workspaceDiscussionInfo?: Maybe<DiscussionInfoType>;
  workspaceDiscussionMembers?: Maybe<Array<Maybe<DiscussionMemberType>>>;
  workspaceDiscussionOlderMessages?: Maybe<DiscussionMessagePageType>;
  workspaceDiscussionPinnedMessages?: Maybe<Array<Maybe<DiscussionMessageType>>>;
  workspaceDiscussionSearchMessages?: Maybe<DiscussionMessagePageType>;
  workspaceDiscussionStarredMessages?: Maybe<Array<Maybe<DiscussionMessageType>>>;
  workspaceDiscussionSync?: Maybe<DiscussionSyncType>;
  workspaceDiscussionThreadMessages?: Maybe<Array<Maybe<DiscussionMessageType>>>;
  workspaceDiscussionVideoCallInfo?: Maybe<DiscussionVideoCallInfoType>;
  workspaceDocumentActivity?: Maybe<Array<Maybe<WorkspaceDocumentActivityType>>>;
  workspaceDocumentById?: Maybe<WorkspaceDocumentType>;
  workspaceDocumentFolderContents?: Maybe<WorkspaceDocumentFolderContentsType>;
  workspaceDocumentFolders?: Maybe<Array<Maybe<WorkspaceDocumentFolderType>>>;
  workspaceDocumentSearch?: Maybe<PagedWorkspaceDocumentType>;
  workspaceDocumentTrash?: Maybe<WorkspaceDocumentTrashType>;
  workspaceDocumentVersions?: Maybe<Array<Maybe<WorkspaceDocumentVersionType>>>;
  workspaceDocumentsInfo?: Maybe<WorkspaceDocumentsInfoType>;
  workspaceMeetingActionItems?: Maybe<PagedWorkspaceMeetingActionItemType>;
  workspaceMeetingActivity?: Maybe<Array<Maybe<WorkspaceMeetingActivityType>>>;
  workspaceMeetingAttachments?: Maybe<Array<Maybe<WorkspaceMeetingAttachmentType>>>;
  workspaceMeetingById?: Maybe<WorkspaceMeetingType>;
  workspaceMeetingMembers?: Maybe<Array<Maybe<WorkspaceMeetingMemberType>>>;
  workspaceMeetingVideoCallInfo?: Maybe<WorkspaceMeetingVideoCallInfoType>;
  workspaceMeetings?: Maybe<PagedWorkspaceMeetingType>;
  workspaceMeetingsInfo?: Maybe<WorkspaceMeetingsInfoType>;
  workspaceMehfilDetails?: Maybe<WorkspaceMehfilDetailsType>;
  workspaceMehfilPermissions?: Maybe<MehfilPermissionsType>;
  workspaceMonitoringAlerts?: Maybe<PagedWorkspaceMonitoringAlertType>;
  workspaceMonitoringProfileById?: Maybe<WorkspaceMonitoringProfileType>;
  workspaceMonitoringProfiles?: Maybe<PagedWorkspaceMonitoringProfileType>;
  workspaceNightStayById?: Maybe<WorkspaceNightStayType>;
  workspaceNightStays?: Maybe<PagedWorkspaceNightStayType>;
  workspacePollActivity?: Maybe<Array<Maybe<WorkspacePollActivityType>>>;
  workspacePollById?: Maybe<WorkspacePollType>;
  workspacePollResults?: Maybe<WorkspacePollResultsType>;
  workspacePolls?: Maybe<PagedWorkspacePollType>;
  workspacePollsInfo?: Maybe<WorkspacePollsInfoType>;
  workspaceProjectById?: Maybe<WorkspaceProjectType>;
  workspaceProjectMembers?: Maybe<Array<Maybe<WorkspaceProjectMemberType>>>;
  workspaceProjects?: Maybe<PagedWorkspaceProjectType>;
  workspaceProjectsActivity?: Maybe<Array<Maybe<WorkspaceProjectsActivityType>>>;
  workspaceProjectsInfo?: Maybe<WorkspaceProjectsInfoType>;
  workspaceTaskById?: Maybe<WorkspaceTaskType>;
  workspaceTaskComments?: Maybe<PagedWorkspaceTaskCommentType>;
  workspaceTasks?: Maybe<PagedWorkspaceTaskType>;
};


export type QueryAllSecurityEventDutiesArgs = {
  eventId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryAllSecurityServerChannelsArgs = {
  includeDeleted?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryCityByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryCityMehfilsByCityIdArgs = {
  cityId: Scalars['String']['input'];
};


export type QueryCommitteeByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryCommitteeMembersArgs = {
  committeeId: Scalars['String']['input'];
  pageIndex: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
  roles: Array<Scalars['String']['input']>;
};


export type QueryCommitteesByLocationIdArgs = {
  locationId: Scalars['String']['input'];
};


export type QueryDeletedPersonByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryDeletedPersonRelationCountsArgs = {
  ids: Array<Scalars['String']['input']>;
};


export type QueryDuplicatePersonByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryDuplicatePersonRelationCountsArgs = {
  ids: Array<Scalars['String']['input']>;
};


export type QueryDutyAttendanceCardsArgs = {
  dutyId: Scalars['String']['input'];
  karkunIds: Array<Scalars['String']['input']>;
  locationId?: InputMaybe<Scalars['String']['input']>;
  month: Scalars['String']['input'];
  shiftId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryDutyAttendanceSheetArgs = {
  dutyId: Scalars['String']['input'];
  locationId?: InputMaybe<Scalars['String']['input']>;
  month: Scalars['String']['input'];
  shiftId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryDutyPlanDaysArgs = {
  dutyId: Scalars['String']['input'];
  locationId: Scalars['String']['input'];
  startDate: Scalars['String']['input'];
};


export type QueryDutyPlanWeekArgs = {
  dutyId: Scalars['String']['input'];
  locationId: Scalars['String']['input'];
};


export type QueryEmploymentEventsByPersonIdArgs = {
  personId: Scalars['String']['input'];
};


export type QueryHrEmployeeByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryHrEmployeesByIdArgs = {
  _ids: Scalars['String']['input'];
};


export type QueryHrKarkunByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryHrKarkunsByIdArgs = {
  _ids: Scalars['String']['input'];
};


export type QueryInboxConversationArgs = {
  roomId: Scalars['String']['input'];
};


export type QueryIssuanceFormByIdArgs = {
  _id: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type QueryIssuanceFormsByMonthArgs = {
  month: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type QueryIssuanceFormsByStockItemArgs = {
  physicalStoreId: Scalars['String']['input'];
  stockItemId: Scalars['String']['input'];
};


export type QueryItemCategoriesByPhysicalStoreIdArgs = {
  physicalStoreId: Scalars['String']['input'];
};


export type QueryItemCategoryByIdArgs = {
  _id: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type QueryJobByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryKarkunDutyAttendanceSheetArgs = {
  karkunId: Scalars['String']['input'];
};


export type QueryLeaveAdjustmentsByPersonIdArgs = {
  personId: Scalars['String']['input'];
  year?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryLeaveBalancesArgs = {
  personId: Scalars['String']['input'];
  year: Scalars['Int']['input'];
};


export type QueryLeaveDaysCountArgs = {
  fromDate: Scalars['String']['input'];
  halfDay?: InputMaybe<Scalars['Boolean']['input']>;
  personId: Scalars['String']['input'];
  toDate: Scalars['String']['input'];
};


export type QueryLeaveRequestByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryLeaveTypeByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryLocationByIdArgs = {
  _id: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type QueryLocationsByPhysicalStoreIdArgs = {
  physicalStoreId: Scalars['String']['input'];
};


export type QueryManagedPhysicalStoreByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryMyDutiesArgs = {
  date: Scalars['String']['input'];
};


export type QueryMyNotificationsArgs = {
  committeeId?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  module?: InputMaybe<Scalars['String']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryOrgLocationByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryOrgLocationFeaturePermissionsArgs = {
  locationId: Scalars['String']['input'];
};


export type QueryPagedAdminUserKarkunsArgs = {
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedCitiesArgs = {
  filter?: InputMaybe<CityFilter>;
};


export type QueryPagedDeletedPeopleArgs = {
  filter?: InputMaybe<PersonFilter>;
};


export type QueryPagedFreeFormCitiesArgs = {
  pageIndex: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
};


export type QueryPagedFreeFormCountriesArgs = {
  pageIndex: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
};


export type QueryPagedHrEmployeeCandidateKarkunsArgs = {
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedHrEmployeesArgs = {
  filter?: InputMaybe<HrEmployeeFilter>;
};


export type QueryPagedHrEmployeesAuditLogsArgs = {
  filter?: InputMaybe<AuditLogFilter>;
};


export type QueryPagedHrEmployeesPermissionKarkunsArgs = {
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedHrKarkunCandidatePeopleArgs = {
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedHrKarkunsArgs = {
  filter?: InputMaybe<KarkunFilter>;
};


export type QueryPagedHrKarkunsAuditLogsArgs = {
  filter?: InputMaybe<AuditLogFilter>;
};


export type QueryPagedHrKarkunsPermissionKarkunsArgs = {
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedHrLeaveConfirmationKarkunsArgs = {
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedHrLeaveEmployeesArgs = {
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedHrPickerKarkunsArgs = {
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedHrReportsToKarkunsArgs = {
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedInboxConversationsArgs = {
  filter?: InputMaybe<InboxConversationFilter>;
};


export type QueryPagedIssuanceFormsArgs = {
  physicalStoreId: Scalars['String']['input'];
  queryString?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedJobLogsArgs = {
  filter?: InputMaybe<JobLogsFilterType>;
};


export type QueryPagedLeaveRequestsArgs = {
  fromDate?: InputMaybe<Scalars['String']['input']>;
  leaveTypeId?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  personId?: InputMaybe<Scalars['String']['input']>;
  statuses?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  toDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedLinkableUsersArgs = {
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedMehfilKarkunsArgs = {
  locationId: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedOrgLocationKarkunsArgs = {
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  includeChildLocations?: InputMaybe<Scalars['Boolean']['input']>;
  locationId: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  withUserAccount?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryPagedOrgLocationObserverKarkunsArgs = {
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedOrgLocationUsersArgs = {
  locationId: Scalars['String']['input'];
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedPurchaseFormsArgs = {
  physicalStoreId: Scalars['String']['input'];
  queryString?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedPurchasingAuditLogsArgs = {
  filter?: InputMaybe<PurchasingAuditLogFilter>;
};


export type QueryPagedPurchasingCatalogItemsArgs = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  pageIndex?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedPurchasingCustodianKarkunsArgs = {
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedPurchasingInvoicesArgs = {
  fromDate?: InputMaybe<Scalars['String']['input']>;
  isDisputed?: InputMaybe<Scalars['Boolean']['input']>;
  orderId?: InputMaybe<Scalars['String']['input']>;
  overdue?: InputMaybe<Scalars['Boolean']['input']>;
  pageIndex?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  toDate?: InputMaybe<Scalars['String']['input']>;
  vendorId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedPurchasingKarkunsArgs = {
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  withUserAccount?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryPagedPurchasingOrdersArgs = {
  fromDate?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  requisitionId?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  statuses?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  toDate?: InputMaybe<Scalars['String']['input']>;
  vendorId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedPurchasingPaymentsArgs = {
  fromDate?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  toDate?: InputMaybe<Scalars['String']['input']>;
  vendorId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedPurchasingPermissionKarkunsArgs = {
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedPurchasingPettyCashExpenseHeadsArgs = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  pageIndex?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedPurchasingPettyCashFundsArgs = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  pageIndex?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedPurchasingPettyCashReplenishmentsArgs = {
  fundId?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedPurchasingPettyCashVouchersArgs = {
  expenseHeadId?: InputMaybe<Scalars['String']['input']>;
  fundId?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  replenishmentId?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  unreplenishedOnly?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryPagedPurchasingQuotesArgs = {
  pageIndex?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  requisitionId?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  vendorId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedPurchasingReceiptsArgs = {
  orderId?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  vendorId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedPurchasingRequisitionsArgs = {
  pageIndex?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  requestedBy?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedPurchasingVendorsArgs = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  pageIndex?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedSalariesByKarkunArgs = {
  queryString?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedScheduledJobsArgs = {
  filter?: InputMaybe<ScheduledJobsFilterType>;
};


export type QueryPagedSecurityAuditLogsArgs = {
  filter?: InputMaybe<AuditLogFilter>;
};


export type QueryPagedSecurityEventPeopleArgs = {
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedSecurityLogsArgs = {
  filter?: InputMaybe<SecurityLogFilter>;
};


export type QueryPagedSecurityPermissionKarkunsArgs = {
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedSecurityServerAlertGroupsArgs = {
  filter?: InputMaybe<SecurityServerAlertFilter>;
};


export type QueryPagedSecurityServerAlertsArgs = {
  filter?: InputMaybe<SecurityServerAlertFilter>;
};


export type QueryPagedSecurityServerProfilesArgs = {
  filter?: InputMaybe<SecurityServerProfileFilter>;
};


export type QueryPagedSecurityVisitorsArgs = {
  filter?: InputMaybe<VisitorFilter>;
};


export type QueryPagedStockAdjustmentsArgs = {
  physicalStoreId: Scalars['String']['input'];
  queryString?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedStockItemsArgs = {
  physicalStoreId: Scalars['String']['input'];
  queryString?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedStoreKarkunsArgs = {
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  predefinedFilterName?: InputMaybe<Scalars['String']['input']>;
  predefinedFilterStoreId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedStoreOrdersArgs = {
  pageIndex?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  physicalStoreId: Scalars['String']['input'];
  requisitionId?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  statuses?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryPagedStorePermissionKarkunsArgs = {
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedStoreReceiptsArgs = {
  orderId?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  physicalStoreId: Scalars['String']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedStoreRequisitionsArgs = {
  pageIndex?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  physicalStoreId: Scalars['String']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedUserGroupsArgs = {
  queryString?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedUsersArgs = {
  filter?: InputMaybe<UserFilter>;
};


export type QueryPagedVisitorStaysArgs = {
  queryString: Scalars['String']['input'];
};


export type QueryPagedVisitorStaysByVisitorIdArgs = {
  visitorId: Scalars['String']['input'];
};


export type QueryPagedWorkspaceCommitteeKarkunsArgs = {
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  committeeId: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedWorkspaceDaKarkunsArgs = {
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  locationId: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedWorkspaceMehfilPermissionsKarkunsArgs = {
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  locationId: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPhysicalStoreAccessArgs = {
  physicalStoreId: Scalars['String']['input'];
};


export type QueryPhysicalStoreByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryPurchaseFormByIdArgs = {
  _id: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type QueryPurchaseFormsByMonthArgs = {
  month: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type QueryPurchaseFormsByStockItemArgs = {
  physicalStoreId: Scalars['String']['input'];
  stockItemId: Scalars['String']['input'];
};


export type QueryPurchasingAttachmentDownloadArgs = {
  _id: Scalars['String']['input'];
  inline?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryPurchasingAttachmentsArgs = {
  ownerId: Scalars['String']['input'];
  ownerType: Scalars['String']['input'];
};


export type QueryPurchasingCatalogItemByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryPurchasingInvoiceByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryPurchasingOrderByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryPurchasingPaymentByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryPurchasingPettyCashExpenseHeadByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryPurchasingPettyCashFundByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryPurchasingPettyCashLedgerArgs = {
  fromDate?: InputMaybe<Scalars['String']['input']>;
  fundId: Scalars['String']['input'];
  toDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPurchasingPettyCashReplenishmentByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryPurchasingPettyCashVoucherByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryPurchasingQuoteByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryPurchasingReceiptByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryPurchasingRequisitionByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryPurchasingSpendingByMonthArgs = {
  fromDate?: InputMaybe<Scalars['String']['input']>;
  toDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPurchasingSpendingByVendorArgs = {
  fromDate?: InputMaybe<Scalars['String']['input']>;
  toDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPurchasingVendorByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryPurchasingVendorLedgerArgs = {
  fromDate?: InputMaybe<Scalars['String']['input']>;
  toDate?: InputMaybe<Scalars['String']['input']>;
  vendorId: Scalars['String']['input'];
};


export type QueryReferenceCommitteesByLocationArgs = {
  locationId: Scalars['String']['input'];
};


export type QueryReferenceOrgLocationsArgs = {
  types?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type QueryReferenceStockItemsArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
  physicalStoreId: Scalars['String']['input'];
};


export type QuerySalariesByIdsArgs = {
  ids: Scalars['String']['input'];
};


export type QuerySalariesByMonthArgs = {
  jobId?: InputMaybe<Scalars['String']['input']>;
  month: Scalars['String']['input'];
};


export type QuerySecurityEventByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QuerySecurityEventDutyByIdArgs = {
  id: Scalars['String']['input'];
};


export type QuerySecurityEventKarkunByBarcodeIdArgs = {
  barcode: Scalars['String']['input'];
};


export type QuerySecurityEventKarkunsByEventIdArgs = {
  dutyId?: InputMaybe<Scalars['String']['input']>;
  eventId: Scalars['String']['input'];
};


export type QuerySecurityEventKarkunsByIdsArgs = {
  ids: Scalars['String']['input'];
};


export type QuerySecurityEventLangarDishByIdArgs = {
  id: Scalars['String']['input'];
};


export type QuerySecurityEventLangarLocationByIdArgs = {
  id: Scalars['String']['input'];
};


export type QuerySecurityFaceVectorFromImageArgs = {
  imageData: Scalars['String']['input'];
};


export type QuerySecurityLogUsersArgs = {
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySecurityServerAlertByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QuerySecurityServerChannelByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QuerySecurityServerProfileByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QuerySecurityServerUsageStatsArgs = {
  minutes: Scalars['Int']['input'];
};


export type QuerySecurityVisitorByCnicArgs = {
  cnicNumbers: Array<InputMaybe<Scalars['String']['input']>>;
};


export type QuerySecurityVisitorByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QuerySecurityVisitorsByFaceVectorArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  vector: Array<Scalars['Float']['input']>;
};


export type QueryStockAdjustmentByIdArgs = {
  _id: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type QueryStockAdjustmentsByStockItemArgs = {
  physicalStoreId: Scalars['String']['input'];
  stockItemId: Scalars['String']['input'];
};


export type QueryStockItemByIdArgs = {
  _id: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type QueryStockItemsByIdArgs = {
  _ids: Array<InputMaybe<Scalars['String']['input']>>;
  physicalStoreId: Scalars['String']['input'];
};


export type QueryStoreOrderByIdArgs = {
  _id: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type QueryStoreReceiptByIdArgs = {
  _id: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type QueryStoreRequisitionByIdArgs = {
  _id: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type QueryUserAccountAvailabilityArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
  userName?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUserByIdArgs = {
  _id?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUserGroupByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryUserNamesArgs = {
  ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryUserTrustedDevicesArgs = {
  userId: Scalars['String']['input'];
};


export type QueryVendorByIdArgs = {
  _id: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type QueryVendorsByPhysicalStoreIdArgs = {
  physicalStoreId: Scalars['String']['input'];
};


export type QueryVisitorStayByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryWorkspaceCommitteeByIdArgs = {
  committeeId: Scalars['String']['input'];
};


export type QueryWorkspaceDaAccessArgs = {
  locationId: Scalars['String']['input'];
};


export type QueryWorkspaceDaAttendanceSheetArgs = {
  dutyId?: InputMaybe<Scalars['String']['input']>;
  locationId: Scalars['String']['input'];
  month: Scalars['String']['input'];
};


export type QueryWorkspaceDaDutiesArgs = {
  locationId: Scalars['String']['input'];
};


export type QueryWorkspaceDaDutyByIdArgs = {
  dutyId: Scalars['String']['input'];
  locationId: Scalars['String']['input'];
};


export type QueryWorkspaceDaMehfilDutiesArgs = {
  locationId: Scalars['String']['input'];
};


export type QueryWorkspaceDaPlanDaysArgs = {
  dutyId: Scalars['String']['input'];
  locationId: Scalars['String']['input'];
  startDate: Scalars['String']['input'];
};


export type QueryWorkspaceDiscussionInfoArgs = {
  committeeId: Scalars['String']['input'];
};


export type QueryWorkspaceDiscussionMembersArgs = {
  committeeId: Scalars['String']['input'];
};


export type QueryWorkspaceDiscussionOlderMessagesArgs = {
  before: Scalars['String']['input'];
  committeeId: Scalars['String']['input'];
};


export type QueryWorkspaceDiscussionPinnedMessagesArgs = {
  committeeId: Scalars['String']['input'];
};


export type QueryWorkspaceDiscussionSearchMessagesArgs = {
  committeeId: Scalars['String']['input'];
  offset?: InputMaybe<Scalars['Int']['input']>;
  searchText: Scalars['String']['input'];
};


export type QueryWorkspaceDiscussionStarredMessagesArgs = {
  committeeId: Scalars['String']['input'];
};


export type QueryWorkspaceDiscussionSyncArgs = {
  committeeId: Scalars['String']['input'];
  since?: InputMaybe<Scalars['String']['input']>;
};


export type QueryWorkspaceDiscussionThreadMessagesArgs = {
  committeeId: Scalars['String']['input'];
  threadId: Scalars['String']['input'];
};


export type QueryWorkspaceDiscussionVideoCallInfoArgs = {
  committeeId: Scalars['String']['input'];
};


export type QueryWorkspaceDocumentActivityArgs = {
  before?: InputMaybe<Scalars['String']['input']>;
  committeeId: Scalars['String']['input'];
  documentId?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryWorkspaceDocumentByIdArgs = {
  committeeId: Scalars['String']['input'];
  documentId: Scalars['String']['input'];
};


export type QueryWorkspaceDocumentFolderContentsArgs = {
  committeeId: Scalars['String']['input'];
  folderId?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryWorkspaceDocumentFoldersArgs = {
  committeeId: Scalars['String']['input'];
};


export type QueryWorkspaceDocumentSearchArgs = {
  committeeId: Scalars['String']['input'];
  pageIndex?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  text: Scalars['String']['input'];
};


export type QueryWorkspaceDocumentTrashArgs = {
  committeeId: Scalars['String']['input'];
};


export type QueryWorkspaceDocumentVersionsArgs = {
  committeeId: Scalars['String']['input'];
  documentId: Scalars['String']['input'];
};


export type QueryWorkspaceDocumentsInfoArgs = {
  committeeId: Scalars['String']['input'];
};


export type QueryWorkspaceMeetingActionItemsArgs = {
  assigneeId?: InputMaybe<Scalars['String']['input']>;
  committeeId: Scalars['String']['input'];
  meetingId?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryWorkspaceMeetingActivityArgs = {
  before?: InputMaybe<Scalars['String']['input']>;
  committeeId: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  meetingId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryWorkspaceMeetingAttachmentsArgs = {
  committeeId: Scalars['String']['input'];
  meetingId: Scalars['String']['input'];
};


export type QueryWorkspaceMeetingByIdArgs = {
  committeeId: Scalars['String']['input'];
  meetingId: Scalars['String']['input'];
};


export type QueryWorkspaceMeetingMembersArgs = {
  committeeId: Scalars['String']['input'];
};


export type QueryWorkspaceMeetingVideoCallInfoArgs = {
  committeeId: Scalars['String']['input'];
  meetingId: Scalars['String']['input'];
};


export type QueryWorkspaceMeetingsArgs = {
  committeeId: Scalars['String']['input'];
  from?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
  to?: InputMaybe<Scalars['String']['input']>;
  view?: InputMaybe<Scalars['String']['input']>;
};


export type QueryWorkspaceMeetingsInfoArgs = {
  committeeId: Scalars['String']['input'];
};


export type QueryWorkspaceMehfilDetailsArgs = {
  locationId: Scalars['String']['input'];
};


export type QueryWorkspaceMehfilPermissionsArgs = {
  locationId: Scalars['String']['input'];
};


export type QueryWorkspaceMonitoringAlertsArgs = {
  committeeId: Scalars['String']['input'];
  date: Scalars['String']['input'];
  includeTest?: InputMaybe<Scalars['Boolean']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
};


export type QueryWorkspaceMonitoringProfileByIdArgs = {
  committeeId: Scalars['String']['input'];
  profileId: Scalars['String']['input'];
};


export type QueryWorkspaceMonitoringProfilesArgs = {
  committeeId: Scalars['String']['input'];
  includeTest?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
};


export type QueryWorkspaceNightStayByIdArgs = {
  committeeId: Scalars['String']['input'];
  stayId: Scalars['String']['input'];
};


export type QueryWorkspaceNightStaysArgs = {
  city?: InputMaybe<Scalars['String']['input']>;
  committeeId: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['String']['input']>;
  stayDate: Scalars['String']['input'];
  stayReason?: InputMaybe<Scalars['String']['input']>;
};


export type QueryWorkspacePollActivityArgs = {
  before?: InputMaybe<Scalars['String']['input']>;
  committeeId: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  pollId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryWorkspacePollByIdArgs = {
  committeeId: Scalars['String']['input'];
  pollId: Scalars['String']['input'];
};


export type QueryWorkspacePollResultsArgs = {
  committeeId: Scalars['String']['input'];
  pollId: Scalars['String']['input'];
};


export type QueryWorkspacePollsArgs = {
  committeeId: Scalars['String']['input'];
  pageIndex?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
  view?: InputMaybe<Scalars['String']['input']>;
};


export type QueryWorkspacePollsInfoArgs = {
  committeeId: Scalars['String']['input'];
};


export type QueryWorkspaceProjectByIdArgs = {
  committeeId: Scalars['String']['input'];
  projectId: Scalars['String']['input'];
};


export type QueryWorkspaceProjectMembersArgs = {
  committeeId: Scalars['String']['input'];
};


export type QueryWorkspaceProjectsArgs = {
  committeeId: Scalars['String']['input'];
  pageIndex?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
  view?: InputMaybe<Scalars['String']['input']>;
};


export type QueryWorkspaceProjectsActivityArgs = {
  before?: InputMaybe<Scalars['String']['input']>;
  committeeId: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  projectId?: InputMaybe<Scalars['String']['input']>;
  taskId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryWorkspaceProjectsInfoArgs = {
  committeeId: Scalars['String']['input'];
};


export type QueryWorkspaceTaskByIdArgs = {
  committeeId: Scalars['String']['input'];
  taskId: Scalars['String']['input'];
};


export type QueryWorkspaceTaskCommentsArgs = {
  committeeId: Scalars['String']['input'];
  pageIndex?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  taskId: Scalars['String']['input'];
};


export type QueryWorkspaceTasksArgs = {
  assigneeId?: InputMaybe<Scalars['String']['input']>;
  committeeId: Scalars['String']['input'];
  pageIndex?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  priority?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['String']['input']>;
  standalone?: InputMaybe<Scalars['Boolean']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
  view?: InputMaybe<Scalars['String']['input']>;
};

export type ReferenceCommitteeType = {
  __typename?: 'ReferenceCommitteeType';
  _id: Scalars['String']['output'];
  color?: Maybe<Scalars['String']['output']>;
  memberCount: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type ReferenceDutyShiftType = {
  __typename?: 'ReferenceDutyShiftType';
  _id?: Maybe<Scalars['String']['output']>;
  dutyId?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type ReferenceDutyType = {
  __typename?: 'ReferenceDutyType';
  _id?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type ReferenceOrgLocationType = {
  __typename?: 'ReferenceOrgLocationType';
  _id?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  parentId?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type ReferencePhysicalStoreType = {
  __typename?: 'ReferencePhysicalStoreType';
  _id?: Maybe<Scalars['String']['output']>;
  address?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type ReferenceStockItemType = {
  __typename?: 'ReferenceStockItemType';
  _id?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  physicalStoreId?: Maybe<Scalars['String']['output']>;
  unitOfMeasurement?: Maybe<Scalars['String']['output']>;
};

export type SalaryType = {
  __typename?: 'SalaryType';
  _id?: Maybe<Scalars['String']['output']>;
  approvedBy?: Maybe<Scalars['String']['output']>;
  approvedOn?: Maybe<Scalars['String']['output']>;
  approver?: Maybe<PersonType>;
  arrears?: Maybe<Scalars['Int']['output']>;
  closingLoan?: Maybe<Scalars['Int']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  job?: Maybe<JobType>;
  jobId?: Maybe<Scalars['String']['output']>;
  karkun?: Maybe<HrEmployeeType>;
  karkunId?: Maybe<Scalars['String']['output']>;
  loanDeduction?: Maybe<Scalars['Int']['output']>;
  month?: Maybe<Scalars['String']['output']>;
  netPayment?: Maybe<Scalars['Int']['output']>;
  newLoan?: Maybe<Scalars['Int']['output']>;
  openingLoan?: Maybe<Scalars['Int']['output']>;
  otherDeduction?: Maybe<Scalars['Int']['output']>;
  rashanMadad?: Maybe<Scalars['Int']['output']>;
  salary?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type ScheduledJobType = {
  __typename?: 'ScheduledJobType';
  _id?: Maybe<Scalars['String']['output']>;
  disabled?: Maybe<Scalars['Boolean']['output']>;
  failCount?: Maybe<Scalars['Int']['output']>;
  failReason?: Maybe<Scalars['String']['output']>;
  failedAt?: Maybe<Scalars['DateTime']['output']>;
  lastFinishedAt?: Maybe<Scalars['DateTime']['output']>;
  lastRunAt?: Maybe<Scalars['DateTime']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  nextRunAt?: Maybe<Scalars['DateTime']['output']>;
  progress?: Maybe<Scalars['Int']['output']>;
  repeatInterval?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
};

export type ScheduledJobsFilterType = {
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type SecurityEventDutyType = {
  __typename?: 'SecurityEventDutyType';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  eventUsedCount?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  overallUsedCount?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  urduName?: Maybe<Scalars['String']['output']>;
};

export type SecurityEventKarkunType = {
  __typename?: 'SecurityEventKarkunType';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  duty?: Maybe<SecurityEventDutyType>;
  dutyCardBarcodeId?: Maybe<Scalars['String']['output']>;
  dutyDetail?: Maybe<Scalars['String']['output']>;
  dutyId?: Maybe<Scalars['String']['output']>;
  event?: Maybe<SecurityEventType>;
  eventId?: Maybe<Scalars['String']['output']>;
  karkun?: Maybe<PersonType>;
  karkunId?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type SecurityEventLangarDishType = {
  __typename?: 'SecurityEventLangarDishType';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  overallUsedCount?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  urduName?: Maybe<Scalars['String']['output']>;
};

export type SecurityEventLangarLocationType = {
  __typename?: 'SecurityEventLangarLocationType';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  overallUsedCount?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  urduName?: Maybe<Scalars['String']['output']>;
};

export type SecurityEventType = {
  __typename?: 'SecurityEventType';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  eventDate?: Maybe<Scalars['String']['output']>;
  eventKarkuns?: Maybe<SecurityEventKarkunType>;
  karkunCount?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type SecurityGroupMember = {
  __typename?: 'SecurityGroupMember';
  displayName?: Maybe<Scalars['String']['output']>;
  personId?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
  username?: Maybe<Scalars['String']['output']>;
};

export type SecurityLogFilter = {
  dataSource?: InputMaybe<Scalars['String']['input']>;
  endTime?: InputMaybe<Scalars['String']['input']>;
  operationType?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  startTime?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type SecurityLogType = {
  __typename?: 'SecurityLogType';
  _id?: Maybe<Scalars['String']['output']>;
  dataSource?: Maybe<Scalars['String']['output']>;
  dataSourceDetail?: Maybe<Scalars['String']['output']>;
  operationBy?: Maybe<Scalars['String']['output']>;
  operationByImageThumbnailUrl?: Maybe<Scalars['String']['output']>;
  operationByImageUrl?: Maybe<Scalars['String']['output']>;
  operationByName?: Maybe<Scalars['String']['output']>;
  operationDetails?: Maybe<Scalars['JSONObject']['output']>;
  operationTime?: Maybe<Scalars['String']['output']>;
  operationType?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
  userImageThumbnailUrl?: Maybe<Scalars['String']['output']>;
  userImageUrl?: Maybe<Scalars['String']['output']>;
  userName?: Maybe<Scalars['String']['output']>;
};

export type SecurityLogUserOption = {
  __typename?: 'SecurityLogUserOption';
  _id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type SecurityPermissionAssignment = {
  __typename?: 'SecurityPermissionAssignment';
  committees?: Maybe<Array<Maybe<SecurityPermissionCommitteeHolder>>>;
  description?: Maybe<Scalars['String']['output']>;
  groups?: Maybe<Array<Maybe<SecurityPermissionGroupHolder>>>;
  key: Scalars['String']['output'];
  name: Scalars['String']['output'];
  users?: Maybe<Array<Maybe<SecurityPermissionHolder>>>;
};

export type SecurityPermissionCommitteeHolder = {
  __typename?: 'SecurityPermissionCommitteeHolder';
  committeeId: Scalars['String']['output'];
  locationName?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type SecurityPermissionGroup = {
  __typename?: 'SecurityPermissionGroup';
  featureKey: Scalars['String']['output'];
  featureName: Scalars['String']['output'];
  permissions?: Maybe<Array<Maybe<SecurityPermissionAssignment>>>;
};

export type SecurityPermissionGroupHolder = {
  __typename?: 'SecurityPermissionGroupHolder';
  groupId: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type SecurityPermissionHolder = {
  __typename?: 'SecurityPermissionHolder';
  displayName?: Maybe<Scalars['String']['output']>;
  personId?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
  username?: Maybe<Scalars['String']['output']>;
};

export type SecurityServerAlertFilter = {
  channelId?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  includeTest?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  profileId?: InputMaybe<Scalars['String']['input']>;
  review?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};

export type SecurityServerAlertGroupType = {
  __typename?: 'SecurityServerAlertGroupType';
  alertCount?: Maybe<Scalars['Int']['output']>;
  firstTimestamp?: Maybe<Scalars['String']['output']>;
  lastTimestamp?: Maybe<Scalars['String']['output']>;
  latestImageUrl?: Maybe<Scalars['String']['output']>;
  latestThumbnailUrl?: Maybe<Scalars['String']['output']>;
  notReviewedCount?: Maybe<Scalars['Int']['output']>;
  profileId?: Maybe<Scalars['String']['output']>;
  profileIsTest?: Maybe<Scalars['Boolean']['output']>;
  profileName?: Maybe<Scalars['String']['output']>;
};

export type SecurityServerAlertSyncStatusType = {
  __typename?: 'SecurityServerAlertSyncStatusType';
  lastSyncedAt?: Maybe<Scalars['String']['output']>;
};

export type SecurityServerAlertType = {
  __typename?: 'SecurityServerAlertType';
  _id?: Maybe<Scalars['String']['output']>;
  channelId?: Maybe<Scalars['String']['output']>;
  channelName?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  externalId?: Maybe<Scalars['String']['output']>;
  faceQualityReasons?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  faceQualityScore?: Maybe<Scalars['Float']['output']>;
  faceSizePx?: Maybe<Scalars['Int']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  profileId?: Maybe<Scalars['String']['output']>;
  profileIsTest?: Maybe<Scalars['Boolean']['output']>;
  profileName?: Maybe<Scalars['String']['output']>;
  review?: Maybe<Scalars['String']['output']>;
  reviewedAt?: Maybe<Scalars['String']['output']>;
  similarityScore?: Maybe<Scalars['Float']['output']>;
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  timestamp?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type SecurityServerChannelConnectionInput = {
  host: Scalars['String']['input'];
  password?: InputMaybe<Scalars['String']['input']>;
  path?: InputMaybe<Scalars['String']['input']>;
  port?: InputMaybe<Scalars['Int']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type SecurityServerChannelConnectionType = {
  __typename?: 'SecurityServerChannelConnectionType';
  hasPassword?: Maybe<Scalars['Boolean']['output']>;
  host?: Maybe<Scalars['String']['output']>;
  path?: Maybe<Scalars['String']['output']>;
  port?: Maybe<Scalars['Int']['output']>;
  username?: Maybe<Scalars['String']['output']>;
};

export type SecurityServerChannelType = {
  __typename?: 'SecurityServerChannelType';
  _id?: Maybe<Scalars['String']['output']>;
  alertsCount?: Maybe<Scalars['Int']['output']>;
  connection?: Maybe<SecurityServerChannelConnectionType>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  enabled?: Maybe<Scalars['Boolean']['output']>;
  minFaceQuality?: Maybe<Scalars['Int']['output']>;
  minFaceSizePx?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  recognitionFps?: Maybe<Scalars['Float']['output']>;
  similarityThreshold?: Maybe<Scalars['Float']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type SecurityServerProfileFilter = {
  includeDeleted?: InputMaybe<Scalars['String']['input']>;
  includeTest?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
};

export type SecurityServerProfileImageType = {
  __typename?: 'SecurityServerProfileImageType';
  _id?: Maybe<Scalars['String']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  uploadedAt?: Maybe<Scalars['String']['output']>;
};

export type SecurityServerProfileType = {
  __typename?: 'SecurityServerProfileType';
  _id?: Maybe<Scalars['String']['output']>;
  alertsCount?: Maybe<Scalars['Int']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  defaultImageId?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  images?: Maybe<Array<Maybe<SecurityServerProfileImageType>>>;
  isTest?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type SecurityServerUsageChannelType = {
  __typename?: 'SecurityServerUsageChannelType';
  busySkipPct?: Maybe<Scalars['Float']['output']>;
  channelId?: Maybe<Scalars['String']['output']>;
  faceSkipPct?: Maybe<Scalars['Float']['output']>;
  faces?: Maybe<Scalars['Int']['output']>;
  frameHeight?: Maybe<Scalars['Int']['output']>;
  frameWidth?: Maybe<Scalars['Int']['output']>;
  inferenceSharePct?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  processedFps?: Maybe<Scalars['Float']['output']>;
  readFailures?: Maybe<Scalars['Int']['output']>;
  readFps?: Maybe<Scalars['Float']['output']>;
  recognitionFps?: Maybe<Scalars['Float']['output']>;
  reconnects?: Maybe<Scalars['Int']['output']>;
  skippedFaceQuality?: Maybe<Scalars['Int']['output']>;
  skippedFaceSize?: Maybe<Scalars['Int']['output']>;
};

export type SecurityServerUsageServerType = {
  __typename?: 'SecurityServerUsageServerType';
  activeChannels?: Maybe<Scalars['Int']['output']>;
  cpuAvgPct?: Maybe<Scalars['Float']['output']>;
  cpuCores?: Maybe<Scalars['Int']['output']>;
  dnnTarget?: Maybe<Scalars['String']['output']>;
  eventLoopLagMaxMs?: Maybe<Scalars['Float']['output']>;
  eventLoopLagP95Ms?: Maybe<Scalars['Float']['output']>;
  gpuMemTotalMb?: Maybe<Scalars['Float']['output']>;
  gpuMemUsedMb?: Maybe<Scalars['Float']['output']>;
  gpuUtilAvgPct?: Maybe<Scalars['Float']['output']>;
  gpuUtilMaxPct?: Maybe<Scalars['Float']['output']>;
  inferenceBusyAvgPct?: Maybe<Scalars['Float']['output']>;
  inferenceBusyMaxPct?: Maybe<Scalars['Float']['output']>;
  windowCount?: Maybe<Scalars['Int']['output']>;
};

export type SecurityServerUsageSummaryType = {
  __typename?: 'SecurityServerUsageSummaryType';
  channels?: Maybe<Array<Maybe<SecurityServerUsageChannelType>>>;
  coveredSeconds?: Maybe<Scalars['Int']['output']>;
  lastBucketAt?: Maybe<Scalars['String']['output']>;
  minutes?: Maybe<Scalars['Int']['output']>;
  server?: Maybe<SecurityServerUsageServerType>;
};

export type SecurityUserGroup = {
  __typename?: 'SecurityUserGroup';
  _id: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  users?: Maybe<Array<Maybe<SecurityGroupMember>>>;
};

export type StockAdjustment = {
  __typename?: 'StockAdjustment';
  _id?: Maybe<Scalars['String']['output']>;
  adjustedBy?: Maybe<Scalars['String']['output']>;
  adjustmentDate?: Maybe<Scalars['String']['output']>;
  adjustmentReason?: Maybe<Scalars['String']['output']>;
  approvedBy?: Maybe<Scalars['String']['output']>;
  approvedOn?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  isInflow?: Maybe<Scalars['Boolean']['output']>;
  physicalStoreId?: Maybe<Scalars['String']['output']>;
  quantity?: Maybe<Scalars['Float']['output']>;
  refAdjustedBy?: Maybe<PersonType>;
  refPhysicalStore?: Maybe<PhysicalStore>;
  refStockItem?: Maybe<StockItem>;
  stockItemId?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type StockItem = {
  __typename?: 'StockItem';
  _id?: Maybe<Scalars['String']['output']>;
  categoryId?: Maybe<Scalars['String']['output']>;
  categoryName?: Maybe<Scalars['String']['output']>;
  company?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  currentStockLevel?: Maybe<Scalars['Float']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  formattedName?: Maybe<Scalars['String']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  issuanceFormsCount?: Maybe<Scalars['Float']['output']>;
  minStockLevel?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  physicalStoreId?: Maybe<Scalars['String']['output']>;
  purchaseFormsCount?: Maybe<Scalars['Float']['output']>;
  refPhysicalStore?: Maybe<PhysicalStore>;
  startingStockLevel?: Maybe<Scalars['Float']['output']>;
  stockAdjustmentsCount?: Maybe<Scalars['Float']['output']>;
  totalStockLevel?: Maybe<Scalars['Float']['output']>;
  unitOfMeasurement?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  verifiedOn?: Maybe<Scalars['String']['output']>;
};

export type StoreOrder = {
  __typename?: 'StoreOrder';
  _id?: Maybe<Scalars['String']['output']>;
  expectedDeliveryDate?: Maybe<Scalars['String']['output']>;
  lines?: Maybe<Array<Maybe<StoreOrderLine>>>;
  number?: Maybe<Scalars['String']['output']>;
  orderDate?: Maybe<Scalars['String']['output']>;
  requisitionId?: Maybe<Scalars['String']['output']>;
  requisitionNumber?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  vendorName?: Maybe<Scalars['String']['output']>;
};

export type StoreOrderLine = {
  __typename?: 'StoreOrderLine';
  _id?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  externalCatalogId?: Maybe<Scalars['String']['output']>;
  quantity?: Maybe<Scalars['Float']['output']>;
  receivedQuantity?: Maybe<Scalars['Float']['output']>;
  unit?: Maybe<Scalars['String']['output']>;
};

export type StorePermissionGroupHolder = {
  __typename?: 'StorePermissionGroupHolder';
  groupId?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type StorePermissionHolders = {
  __typename?: 'StorePermissionHolders';
  groupName?: Maybe<Scalars['String']['output']>;
  groups?: Maybe<Array<Maybe<StorePermissionGroupHolder>>>;
  key?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  users?: Maybe<Array<Maybe<StorePermissionUserHolder>>>;
};

export type StorePermissionUserHolder = {
  __typename?: 'StorePermissionUserHolder';
  displayName?: Maybe<Scalars['String']['output']>;
  personId?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
  username?: Maybe<Scalars['String']['output']>;
};

export type StoreReceipt = {
  __typename?: 'StoreReceipt';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  deliveryNoteNo?: Maybe<Scalars['String']['output']>;
  lines?: Maybe<Array<Maybe<StoreReceiptLine>>>;
  notes?: Maybe<Scalars['String']['output']>;
  number?: Maybe<Scalars['String']['output']>;
  orderId?: Maybe<Scalars['String']['output']>;
  orderNumber?: Maybe<Scalars['String']['output']>;
  receivedBy?: Maybe<Scalars['String']['output']>;
  receivedByPerson?: Maybe<PersonBasicType>;
  receivedDate?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  voidReason?: Maybe<Scalars['String']['output']>;
  voidedAt?: Maybe<Scalars['String']['output']>;
};

export type StoreReceiptLine = {
  __typename?: 'StoreReceiptLine';
  _id?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  externalCatalogId?: Maybe<Scalars['String']['output']>;
  orderLineId?: Maybe<Scalars['String']['output']>;
  receivedQuantity?: Maybe<Scalars['Float']['output']>;
  rejectedQuantity?: Maybe<Scalars['Float']['output']>;
  remarks?: Maybe<Scalars['String']['output']>;
  unit?: Maybe<Scalars['String']['output']>;
};

export type StoreUserGroup = {
  __typename?: 'StoreUserGroup';
  _id: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  users?: Maybe<Array<Maybe<StoreUserGroupMember>>>;
};

export type StoreUserGroupMember = {
  __typename?: 'StoreUserGroupMember';
  displayName?: Maybe<Scalars['String']['output']>;
  personId?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
  username?: Maybe<Scalars['String']['output']>;
};

export type SyncOrgLocationObserversResult = {
  __typename?: 'SyncOrgLocationObserversResult';
  addedCount?: Maybe<Scalars['Int']['output']>;
  committeesChecked?: Maybe<Scalars['Int']['output']>;
  removedCount?: Maybe<Scalars['Int']['output']>;
};

export type TeamMemberType = {
  __typename?: 'TeamMemberType';
  daysOfWeek?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  isCoordinator?: Maybe<Scalars['Boolean']['output']>;
  karkun?: Maybe<PersonBasicType>;
  karkunId?: Maybe<Scalars['String']['output']>;
};

export type TeamType = {
  __typename?: 'TeamType';
  _id?: Maybe<Scalars['String']['output']>;
  color?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  duty?: Maybe<DutyType>;
  dutyId?: Maybe<Scalars['String']['output']>;
  members?: Maybe<Array<Maybe<TeamMemberType>>>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type TrustedDeviceType = {
  __typename?: 'TrustedDeviceType';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  expiresAt?: Maybe<Scalars['String']['output']>;
  lastUsedAt?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type TwoFactorSetupType = {
  __typename?: 'TwoFactorSetupType';
  qrCodeSvg?: Maybe<Scalars['String']['output']>;
  secret?: Maybe<Scalars['String']['output']>;
  uri?: Maybe<Scalars['String']['output']>;
};

export type UserAccountAvailabilityType = {
  __typename?: 'UserAccountAvailabilityType';
  emailMessage?: Maybe<Scalars['String']['output']>;
  userNameMessage?: Maybe<Scalars['String']['output']>;
};

export type UserFilter = {
  cityLocationId?: InputMaybe<Scalars['String']['input']>;
  mehfilLocationId?: InputMaybe<Scalars['String']['input']>;
  moduleAccess?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  serviceAccounts?: InputMaybe<Scalars['String']['input']>;
  showActive?: InputMaybe<Scalars['String']['input']>;
  showInactive?: InputMaybe<Scalars['String']['input']>;
  showLocked?: InputMaybe<Scalars['String']['input']>;
  showUnlocked?: InputMaybe<Scalars['String']['input']>;
};

export type UserGroupMemberType = {
  __typename?: 'UserGroupMemberType';
  displayName?: Maybe<Scalars['String']['output']>;
  karkun?: Maybe<PersonType>;
  personId?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
  username?: Maybe<Scalars['String']['output']>;
};

export type UserGroupType = {
  __typename?: 'UserGroupType';
  _id?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  moduleName?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  permissions?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  users?: Maybe<Array<Maybe<UserGroupMemberType>>>;
};

export type UserType = {
  __typename?: 'UserType';
  _id?: Maybe<Scalars['String']['output']>;
  chatUserId?: Maybe<Scalars['String']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  emailVerified?: Maybe<Scalars['Boolean']['output']>;
  groups?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  hasChatAccount?: Maybe<Scalars['Boolean']['output']>;
  hasStoreAccess?: Maybe<Scalars['Boolean']['output']>;
  isServiceAccount?: Maybe<Scalars['Boolean']['output']>;
  isSuperAdmin?: Maybe<Scalars['Boolean']['output']>;
  karkun?: Maybe<PersonType>;
  lastActiveAt?: Maybe<Scalars['String']['output']>;
  lastLoggedInAt?: Maybe<Scalars['String']['output']>;
  locked?: Maybe<Scalars['Boolean']['output']>;
  loginBlockedAddresses?: Maybe<Scalars['Int']['output']>;
  permissions?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  person?: Maybe<PersonType>;
  personId?: Maybe<Scalars['String']['output']>;
  twoFactorEnabled?: Maybe<Scalars['Boolean']['output']>;
  untrustedLoginAddressesBlocked?: Maybe<Scalars['Boolean']['output']>;
  username?: Maybe<Scalars['String']['output']>;
};

export type Vendor = {
  __typename?: 'Vendor';
  _id?: Maybe<Scalars['String']['output']>;
  address?: Maybe<Scalars['String']['output']>;
  contactNumber?: Maybe<Scalars['String']['output']>;
  contactPerson?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  physicalStoreId?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  usageCount?: Maybe<Scalars['Int']['output']>;
};

export type VisitorFaceMatchType = {
  __typename?: 'VisitorFaceMatchType';
  person?: Maybe<PersonType>;
  score?: Maybe<Scalars['Float']['output']>;
};

export type VisitorFilter = {
  additionalInfo?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  dataSource?: InputMaybe<Scalars['String']['input']>;
  ehadDate?: InputMaybe<Scalars['String']['input']>;
  ehadDuration?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  tagId?: InputMaybe<Scalars['String']['input']>;
  updatedBetween?: InputMaybe<Scalars['String']['input']>;
};

export type VisitorStayType = {
  __typename?: 'VisitorStayType';
  _id?: Maybe<Scalars['String']['output']>;
  cancelledDate?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  dutyId?: Maybe<Scalars['String']['output']>;
  dutyName?: Maybe<Scalars['String']['output']>;
  dutyShiftName?: Maybe<Scalars['String']['output']>;
  fromDate?: Maybe<Scalars['String']['output']>;
  isExpired?: Maybe<Scalars['Boolean']['output']>;
  isValid?: Maybe<Scalars['Boolean']['output']>;
  numOfDays?: Maybe<Scalars['Float']['output']>;
  refVisitor?: Maybe<PersonType>;
  shiftId?: Maybe<Scalars['String']['output']>;
  shiftName?: Maybe<Scalars['String']['output']>;
  stayAllowedBy?: Maybe<Scalars['String']['output']>;
  stayReason?: Maybe<Scalars['String']['output']>;
  toDate?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  visitorId?: Maybe<Scalars['String']['output']>;
};

export type WorkspaceCommitteeMemberType = {
  __typename?: 'WorkspaceCommitteeMemberType';
  contactNumber1?: Maybe<Scalars['String']['output']>;
  contactNumber2?: Maybe<Scalars['String']['output']>;
  hasChatAccount?: Maybe<Scalars['Boolean']['output']>;
  hasDiscussionAccess?: Maybe<Scalars['Boolean']['output']>;
  hasLoginAccount?: Maybe<Scalars['Boolean']['output']>;
  imageThumbnailUrl?: Maybe<Scalars['String']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  isCoordinator?: Maybe<Scalars['Boolean']['output']>;
  karkunId?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Scalars['String']['output']>;
};

export type WorkspaceCommitteeType = {
  __typename?: 'WorkspaceCommitteeType';
  _id?: Maybe<Scalars['String']['output']>;
  canManageMembers?: Maybe<Scalars['Boolean']['output']>;
  color?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  features?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  guestCount?: Maybe<Scalars['Int']['output']>;
  locationId?: Maybe<Scalars['String']['output']>;
  memberCount?: Maybe<Scalars['Int']['output']>;
  members?: Maybe<Array<Maybe<WorkspaceCommitteeMemberType>>>;
  name?: Maybe<Scalars['String']['output']>;
  observerCount?: Maybe<Scalars['Int']['output']>;
};

export type WorkspaceDocumentActivityType = {
  __typename?: 'WorkspaceDocumentActivityType';
  _id?: Maybe<Scalars['String']['output']>;
  action?: Maybe<Scalars['String']['output']>;
  at?: Maybe<Scalars['String']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  documentId?: Maybe<Scalars['String']['output']>;
  entityId?: Maybe<Scalars['String']['output']>;
  entityType?: Maybe<Scalars['String']['output']>;
  userName?: Maybe<Scalars['String']['output']>;
};

export type WorkspaceDocumentDownloadType = {
  __typename?: 'WorkspaceDocumentDownloadType';
  fileName?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type WorkspaceDocumentFolderContentsType = {
  __typename?: 'WorkspaceDocumentFolderContentsType';
  documents?: Maybe<PagedWorkspaceDocumentType>;
  folders?: Maybe<Array<Maybe<WorkspaceDocumentFolderType>>>;
  path?: Maybe<Array<Maybe<WorkspaceDocumentFolderType>>>;
};

export type WorkspaceDocumentFolderType = {
  __typename?: 'WorkspaceDocumentFolderType';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdByName?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  deletedByName?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  parentId?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedByName?: Maybe<Scalars['String']['output']>;
};

export type WorkspaceDocumentLockType = {
  __typename?: 'WorkspaceDocumentLockType';
  expiresAt?: Maybe<Scalars['String']['output']>;
  isMine?: Maybe<Scalars['Boolean']['output']>;
  lockedAt?: Maybe<Scalars['String']['output']>;
  note?: Maybe<Scalars['String']['output']>;
  userName?: Maybe<Scalars['String']['output']>;
};

export type WorkspaceDocumentTrashType = {
  __typename?: 'WorkspaceDocumentTrashType';
  documents?: Maybe<Array<Maybe<WorkspaceDocumentType>>>;
  folders?: Maybe<Array<Maybe<WorkspaceDocumentFolderType>>>;
};

export type WorkspaceDocumentType = {
  __typename?: 'WorkspaceDocumentType';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdByName?: Maybe<Scalars['String']['output']>;
  currentVersionNumber?: Maybe<Scalars['Int']['output']>;
  deletedAt?: Maybe<Scalars['String']['output']>;
  deletedByName?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  fileName?: Maybe<Scalars['String']['output']>;
  folderId?: Maybe<Scalars['String']['output']>;
  folderName?: Maybe<Scalars['String']['output']>;
  lock?: Maybe<WorkspaceDocumentLockType>;
  mimeType?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  size?: Maybe<Scalars['Float']['output']>;
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedByName?: Maybe<Scalars['String']['output']>;
};

export type WorkspaceDocumentUploadType = {
  __typename?: 'WorkspaceDocumentUploadType';
  contentType?: Maybe<Scalars['String']['output']>;
  documentId?: Maybe<Scalars['String']['output']>;
  expiresAt?: Maybe<Scalars['String']['output']>;
  uploadId?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type WorkspaceDocumentVersionType = {
  __typename?: 'WorkspaceDocumentVersionType';
  _id?: Maybe<Scalars['String']['output']>;
  comment?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdByName?: Maybe<Scalars['String']['output']>;
  fileName?: Maybe<Scalars['String']['output']>;
  isCurrent?: Maybe<Scalars['Boolean']['output']>;
  mimeType?: Maybe<Scalars['String']['output']>;
  size?: Maybe<Scalars['Float']['output']>;
  versionNumber?: Maybe<Scalars['Int']['output']>;
};

export type WorkspaceDocumentsInfoType = {
  __typename?: 'WorkspaceDocumentsInfoType';
  canManage?: Maybe<Scalars['Boolean']['output']>;
  maxFileSize?: Maybe<Scalars['Float']['output']>;
};

export type WorkspaceLocationType = {
  __typename?: 'WorkspaceLocationType';
  _id?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  parentId?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type WorkspaceMeetingActionItemInput = {
  agendaItemId?: InputMaybe<Scalars['String']['input']>;
  assigneeId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type WorkspaceMeetingActionItemType = {
  __typename?: 'WorkspaceMeetingActionItemType';
  _id?: Maybe<Scalars['String']['output']>;
  agendaItemId?: Maybe<Scalars['String']['output']>;
  assigneeId?: Maybe<Scalars['String']['output']>;
  assigneeName?: Maybe<Scalars['String']['output']>;
  canChangeStatus?: Maybe<Scalars['Boolean']['output']>;
  completedAt?: Maybe<Scalars['String']['output']>;
  completedByName?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdByName?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  dueDate?: Maybe<Scalars['String']['output']>;
  meetingEndsAt?: Maybe<Scalars['String']['output']>;
  meetingId?: Maybe<Scalars['String']['output']>;
  meetingTitle?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type WorkspaceMeetingActivityType = {
  __typename?: 'WorkspaceMeetingActivityType';
  _id?: Maybe<Scalars['String']['output']>;
  action?: Maybe<Scalars['String']['output']>;
  at?: Maybe<Scalars['String']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  entityId?: Maybe<Scalars['String']['output']>;
  entityType?: Maybe<Scalars['String']['output']>;
  meetingId?: Maybe<Scalars['String']['output']>;
  userName?: Maybe<Scalars['String']['output']>;
};

export type WorkspaceMeetingAgendaItemInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  durationMinutes?: InputMaybe<Scalars['Int']['input']>;
  presenterId?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type WorkspaceMeetingAgendaItemType = {
  __typename?: 'WorkspaceMeetingAgendaItemType';
  _id?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  durationMinutes?: Maybe<Scalars['Int']['output']>;
  presenterId?: Maybe<Scalars['String']['output']>;
  presenterName?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type WorkspaceMeetingAttachmentType = {
  __typename?: 'WorkspaceMeetingAttachmentType';
  _id?: Maybe<Scalars['String']['output']>;
  canDelete?: Maybe<Scalars['Boolean']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdByName?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  fileName?: Maybe<Scalars['String']['output']>;
  mimeType?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  size?: Maybe<Scalars['Float']['output']>;
};

export type WorkspaceMeetingAttendanceInput = {
  note?: InputMaybe<Scalars['String']['input']>;
  participantId: Scalars['String']['input'];
  status?: InputMaybe<Scalars['String']['input']>;
};

export type WorkspaceMeetingDownloadType = {
  __typename?: 'WorkspaceMeetingDownloadType';
  fileName?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type WorkspaceMeetingInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  endsAt: Scalars['String']['input'];
  location?: InputMaybe<Scalars['String']['input']>;
  startsAt: Scalars['String']['input'];
  title: Scalars['String']['input'];
  videoCall?: InputMaybe<Scalars['Boolean']['input']>;
};

export type WorkspaceMeetingMemberType = {
  __typename?: 'WorkspaceMeetingMemberType';
  isCoordinator?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  participantId?: Maybe<Scalars['String']['output']>;
};

export type WorkspaceMeetingParticipantType = {
  __typename?: 'WorkspaceMeetingParticipantType';
  attendanceMarkedAt?: Maybe<Scalars['String']['output']>;
  attendanceMarkedByName?: Maybe<Scalars['String']['output']>;
  attendanceNote?: Maybe<Scalars['String']['output']>;
  attendanceStatus?: Maybe<Scalars['String']['output']>;
  isMe?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  participantId?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Scalars['String']['output']>;
  rsvpComment?: Maybe<Scalars['String']['output']>;
  rsvpRespondedAt?: Maybe<Scalars['String']['output']>;
  rsvpStatus?: Maybe<Scalars['String']['output']>;
};

export type WorkspaceMeetingType = {
  __typename?: 'WorkspaceMeetingType';
  _id?: Maybe<Scalars['String']['output']>;
  agenda?: Maybe<Array<Maybe<WorkspaceMeetingAgendaItemType>>>;
  attachmentCount?: Maybe<Scalars['Int']['output']>;
  cancellationReason?: Maybe<Scalars['String']['output']>;
  cancelledAt?: Maybe<Scalars['String']['output']>;
  cancelledByName?: Maybe<Scalars['String']['output']>;
  completedAt?: Maybe<Scalars['String']['output']>;
  completedByName?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdByName?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  endsAt?: Maybe<Scalars['String']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  minutes?: Maybe<Scalars['String']['output']>;
  minutesUpdatedAt?: Maybe<Scalars['String']['output']>;
  minutesUpdatedByName?: Maybe<Scalars['String']['output']>;
  myRsvpStatus?: Maybe<Scalars['String']['output']>;
  openActionItemCount?: Maybe<Scalars['Int']['output']>;
  participants?: Maybe<Array<Maybe<WorkspaceMeetingParticipantType>>>;
  startsAt?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  timeZone?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedByName?: Maybe<Scalars['String']['output']>;
  videoCall?: Maybe<Scalars['Boolean']['output']>;
};

export type WorkspaceMeetingUploadType = {
  __typename?: 'WorkspaceMeetingUploadType';
  contentType?: Maybe<Scalars['String']['output']>;
  expiresAt?: Maybe<Scalars['String']['output']>;
  uploadId?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type WorkspaceMeetingVideoCallInfoType = {
  __typename?: 'WorkspaceMeetingVideoCallInfoType';
  participantCount?: Maybe<Scalars['Int']['output']>;
};

export type WorkspaceMeetingVideoCallType = {
  __typename?: 'WorkspaceMeetingVideoCallType';
  url: Scalars['String']['output'];
};

export type WorkspaceMeetingsInfoType = {
  __typename?: 'WorkspaceMeetingsInfoType';
  canJoinVideoCall?: Maybe<Scalars['Boolean']['output']>;
  canManage?: Maybe<Scalars['Boolean']['output']>;
  maxFileSize?: Maybe<Scalars['Float']['output']>;
  myParticipantId?: Maybe<Scalars['String']['output']>;
  timeZone?: Maybe<Scalars['String']['output']>;
};

export type WorkspaceMehfilDetailsType = {
  __typename?: 'WorkspaceMehfilDetailsType';
  locationId: Scalars['String']['output'];
  mehfilDetails?: Maybe<OrgLocationMehfilDetailsType>;
  name: Scalars['String']['output'];
  permissions: Array<Scalars['String']['output']>;
};

export type WorkspaceMonitoringAlertType = {
  __typename?: 'WorkspaceMonitoringAlertType';
  _id?: Maybe<Scalars['String']['output']>;
  channelName?: Maybe<Scalars['String']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  profileIsTest?: Maybe<Scalars['Boolean']['output']>;
  profileName?: Maybe<Scalars['String']['output']>;
  review?: Maybe<Scalars['String']['output']>;
  similarityScore?: Maybe<Scalars['Float']['output']>;
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  timestamp?: Maybe<Scalars['String']['output']>;
};

export type WorkspaceMonitoringProfilePhotoType = {
  __typename?: 'WorkspaceMonitoringProfilePhotoType';
  _id?: Maybe<Scalars['String']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
};

export type WorkspaceMonitoringProfileType = {
  __typename?: 'WorkspaceMonitoringProfileType';
  _id?: Maybe<Scalars['String']['output']>;
  alertsCount?: Maybe<Scalars['Int']['output']>;
  isTest?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  photos?: Maybe<Array<Maybe<WorkspaceMonitoringProfilePhotoType>>>;
};

export type WorkspaceNightStayType = {
  __typename?: 'WorkspaceNightStayType';
  _id?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  fromDate?: Maybe<Scalars['String']['output']>;
  numOfDays?: Maybe<Scalars['Float']['output']>;
  stayAllowedBy?: Maybe<Scalars['String']['output']>;
  stayHistory?: Maybe<Array<Maybe<WorkspaceStayHistoryItemType>>>;
  stayReason?: Maybe<Scalars['String']['output']>;
  toDate?: Maybe<Scalars['String']['output']>;
  visitorId?: Maybe<Scalars['String']['output']>;
  visitorImageThumbnailUrl?: Maybe<Scalars['String']['output']>;
  visitorImageUrl?: Maybe<Scalars['String']['output']>;
  visitorName?: Maybe<Scalars['String']['output']>;
};

export type WorkspacePollActivityType = {
  __typename?: 'WorkspacePollActivityType';
  _id?: Maybe<Scalars['String']['output']>;
  action?: Maybe<Scalars['String']['output']>;
  at?: Maybe<Scalars['String']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  entityId?: Maybe<Scalars['String']['output']>;
  entityType?: Maybe<Scalars['String']['output']>;
  pollId?: Maybe<Scalars['String']['output']>;
  userName?: Maybe<Scalars['String']['output']>;
};

export type WorkspacePollAnswerInput = {
  optionIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  questionId: Scalars['String']['input'];
};

export type WorkspacePollAnswerType = {
  __typename?: 'WorkspacePollAnswerType';
  optionIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  questionId?: Maybe<Scalars['String']['output']>;
};

export type WorkspacePollInput = {
  anonymous?: InputMaybe<Scalars['Boolean']['input']>;
  closesAt: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  questions?: InputMaybe<Array<InputMaybe<WorkspacePollQuestionInput>>>;
  title: Scalars['String']['input'];
};

export type WorkspacePollOptionInput = {
  _id?: InputMaybe<Scalars['String']['input']>;
  text: Scalars['String']['input'];
};

export type WorkspacePollOptionResultType = {
  __typename?: 'WorkspacePollOptionResultType';
  count?: Maybe<Scalars['Int']['output']>;
  optionId?: Maybe<Scalars['String']['output']>;
  percentage?: Maybe<Scalars['Float']['output']>;
  text?: Maybe<Scalars['String']['output']>;
  voters?: Maybe<Array<Maybe<WorkspacePollVoterType>>>;
};

export type WorkspacePollOptionType = {
  __typename?: 'WorkspacePollOptionType';
  _id?: Maybe<Scalars['String']['output']>;
  text?: Maybe<Scalars['String']['output']>;
};

export type WorkspacePollQuestionInput = {
  _id?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  maxChoices?: InputMaybe<Scalars['Int']['input']>;
  minChoices?: InputMaybe<Scalars['Int']['input']>;
  options: Array<InputMaybe<WorkspacePollOptionInput>>;
  required?: InputMaybe<Scalars['Boolean']['input']>;
  text: Scalars['String']['input'];
  type?: InputMaybe<Scalars['String']['input']>;
};

export type WorkspacePollQuestionResultType = {
  __typename?: 'WorkspacePollQuestionResultType';
  answeredCount?: Maybe<Scalars['Int']['output']>;
  options?: Maybe<Array<Maybe<WorkspacePollOptionResultType>>>;
  questionId?: Maybe<Scalars['String']['output']>;
  text?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type WorkspacePollQuestionType = {
  __typename?: 'WorkspacePollQuestionType';
  _id?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  maxChoices?: Maybe<Scalars['Int']['output']>;
  minChoices?: Maybe<Scalars['Int']['output']>;
  options?: Maybe<Array<Maybe<WorkspacePollOptionType>>>;
  required?: Maybe<Scalars['Boolean']['output']>;
  text?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type WorkspacePollResultsType = {
  __typename?: 'WorkspacePollResultsType';
  anonymous?: Maybe<Scalars['Boolean']['output']>;
  closedAt?: Maybe<Scalars['String']['output']>;
  pollId?: Maybe<Scalars['String']['output']>;
  questions?: Maybe<Array<Maybe<WorkspacePollQuestionResultType>>>;
  status?: Maybe<Scalars['String']['output']>;
  totalVoters?: Maybe<Scalars['Int']['output']>;
};

export type WorkspacePollType = {
  __typename?: 'WorkspacePollType';
  _id?: Maybe<Scalars['String']['output']>;
  anonymous?: Maybe<Scalars['Boolean']['output']>;
  canSeeResults?: Maybe<Scalars['Boolean']['output']>;
  cancellationReason?: Maybe<Scalars['String']['output']>;
  cancelledAt?: Maybe<Scalars['String']['output']>;
  cancelledByName?: Maybe<Scalars['String']['output']>;
  closedAt?: Maybe<Scalars['String']['output']>;
  closedByName?: Maybe<Scalars['String']['output']>;
  closesAt?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdByName?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  hasVoted?: Maybe<Scalars['Boolean']['output']>;
  isEligible?: Maybe<Scalars['Boolean']['output']>;
  myAnswers?: Maybe<Array<Maybe<WorkspacePollAnswerType>>>;
  openedAt?: Maybe<Scalars['String']['output']>;
  questions?: Maybe<Array<Maybe<WorkspacePollQuestionType>>>;
  status?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedByName?: Maybe<Scalars['String']['output']>;
  voteCount?: Maybe<Scalars['Int']['output']>;
};

export type WorkspacePollVoterType = {
  __typename?: 'WorkspacePollVoterType';
  hasVoted?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  voterId?: Maybe<Scalars['String']['output']>;
};

export type WorkspacePollsInfoType = {
  __typename?: 'WorkspacePollsInfoType';
  canManage?: Maybe<Scalars['Boolean']['output']>;
  myVoterId?: Maybe<Scalars['String']['output']>;
};

export type WorkspaceProjectInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  objective?: InputMaybe<Scalars['String']['input']>;
  participantIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  targetDate?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type WorkspaceProjectMemberType = {
  __typename?: 'WorkspaceProjectMemberType';
  isCoordinator?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  personId?: Maybe<Scalars['String']['output']>;
};

export type WorkspaceProjectParticipantType = {
  __typename?: 'WorkspaceProjectParticipantType';
  name?: Maybe<Scalars['String']['output']>;
  personId?: Maybe<Scalars['String']['output']>;
};

export type WorkspaceProjectType = {
  __typename?: 'WorkspaceProjectType';
  _id?: Maybe<Scalars['String']['output']>;
  canManage?: Maybe<Scalars['Boolean']['output']>;
  completedAt?: Maybe<Scalars['String']['output']>;
  completedByName?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdByName?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  doneCount?: Maybe<Scalars['Int']['output']>;
  isOverdue?: Maybe<Scalars['Boolean']['output']>;
  isParticipant?: Maybe<Scalars['Boolean']['output']>;
  objective?: Maybe<Scalars['String']['output']>;
  openTaskCount?: Maybe<Scalars['Int']['output']>;
  participantCount?: Maybe<Scalars['Int']['output']>;
  participants?: Maybe<Array<Maybe<WorkspaceProjectParticipantType>>>;
  progress?: Maybe<Scalars['Int']['output']>;
  startDate?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  targetDate?: Maybe<Scalars['String']['output']>;
  taskCount?: Maybe<Scalars['Int']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedByName?: Maybe<Scalars['String']['output']>;
};

export type WorkspaceProjectsActivityType = {
  __typename?: 'WorkspaceProjectsActivityType';
  _id?: Maybe<Scalars['String']['output']>;
  action?: Maybe<Scalars['String']['output']>;
  at?: Maybe<Scalars['String']['output']>;
  details?: Maybe<Scalars['String']['output']>;
  entityId?: Maybe<Scalars['String']['output']>;
  entityType?: Maybe<Scalars['String']['output']>;
  projectId?: Maybe<Scalars['String']['output']>;
  taskId?: Maybe<Scalars['String']['output']>;
  userName?: Maybe<Scalars['String']['output']>;
};

export type WorkspaceProjectsInfoType = {
  __typename?: 'WorkspaceProjectsInfoType';
  canManage?: Maybe<Scalars['Boolean']['output']>;
  myPersonId?: Maybe<Scalars['String']['output']>;
};

export type WorkspaceStayHistoryItemType = {
  __typename?: 'WorkspaceStayHistoryItemType';
  _id?: Maybe<Scalars['String']['output']>;
  fromDate?: Maybe<Scalars['String']['output']>;
  numOfDays?: Maybe<Scalars['Float']['output']>;
  stayReason?: Maybe<Scalars['String']['output']>;
  toDate?: Maybe<Scalars['String']['output']>;
};

export type WorkspaceTaskCommentType = {
  __typename?: 'WorkspaceTaskCommentType';
  _id?: Maybe<Scalars['String']['output']>;
  authorName?: Maybe<Scalars['String']['output']>;
  canDelete?: Maybe<Scalars['Boolean']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  isOwn?: Maybe<Scalars['Boolean']['output']>;
  taskId?: Maybe<Scalars['String']['output']>;
  text?: Maybe<Scalars['String']['output']>;
};

export type WorkspaceTaskInput = {
  assigneeId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['String']['input']>;
  priority?: InputMaybe<Scalars['String']['input']>;
  projectId?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title: Scalars['String']['input'];
};

export type WorkspaceTaskType = {
  __typename?: 'WorkspaceTaskType';
  _id?: Maybe<Scalars['String']['output']>;
  assigneeId?: Maybe<Scalars['String']['output']>;
  assigneeName?: Maybe<Scalars['String']['output']>;
  canManage?: Maybe<Scalars['Boolean']['output']>;
  canUpdate?: Maybe<Scalars['Boolean']['output']>;
  commentCount?: Maybe<Scalars['Int']['output']>;
  completedAt?: Maybe<Scalars['String']['output']>;
  completedByName?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdByName?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  dueDate?: Maybe<Scalars['String']['output']>;
  isOverdue?: Maybe<Scalars['Boolean']['output']>;
  priority?: Maybe<Scalars['String']['output']>;
  progress?: Maybe<Scalars['Int']['output']>;
  projectId?: Maybe<Scalars['String']['output']>;
  projectTitle?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedByName?: Maybe<Scalars['String']['output']>;
};
