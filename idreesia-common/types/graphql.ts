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

export type AttendanceType = {
  __typename?: 'AttendanceType';
  _id?: Maybe<Scalars['String']['output']>;
  absentCount?: Maybe<Scalars['Int']['output']>;
  attendanceDetails?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  createdByName?: Maybe<Scalars['String']['output']>;
  duty?: Maybe<DutyType>;
  dutyId?: Maybe<Scalars['String']['output']>;
  job?: Maybe<JobType>;
  jobId?: Maybe<Scalars['String']['output']>;
  karkun?: Maybe<PersonType>;
  karkunId?: Maybe<Scalars['String']['output']>;
  meetingCardBarcodeId?: Maybe<Scalars['String']['output']>;
  month?: Maybe<Scalars['String']['output']>;
  percentage?: Maybe<Scalars['Float']['output']>;
  presentCount?: Maybe<Scalars['Int']['output']>;
  shift?: Maybe<DutyShiftType>;
  shiftId?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  updatedByName?: Maybe<Scalars['String']['output']>;
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
  operationByImageId?: Maybe<Scalars['String']['output']>;
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

export type DutyLocationType = {
  __typename?: 'DutyLocationType';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  usedCount?: Maybe<Scalars['Int']['output']>;
};

export type DutyShiftType = {
  __typename?: 'DutyShiftType';
  _id?: Maybe<Scalars['String']['output']>;
  attendanceSheet?: Maybe<Scalars['String']['output']>;
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
  attendanceSheet?: Maybe<Scalars['String']['output']>;
  canDelete?: Maybe<Scalars['Boolean']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  isMehfilDuty?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  shifts?: Maybe<Array<Maybe<DutyShiftType>>>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  usedCount?: Maybe<Scalars['Int']['output']>;
};

export type FaceVectorRecord = {
  __typename?: 'FaceVectorRecord';
  computedAt: Scalars['DateTime']['output'];
  personId: Scalars['String']['output'];
  vector: Array<Scalars['Float']['output']>;
};

export type InventoryStatistics = {
  __typename?: 'InventoryStatistics';
  itemsVerifiedLessThanThreeMonthsAgo?: Maybe<Scalars['Int']['output']>;
  itemsVerifiedMoreThanSixMonthsAgo?: Maybe<Scalars['Int']['output']>;
  itemsVerifiedThreeToSixMonthsAgo?: Maybe<Scalars['Int']['output']>;
  itemsWithImages?: Maybe<Scalars['Int']['output']>;
  itemsWithLessThanMinStockLevel?: Maybe<Scalars['Int']['output']>;
  itemsWithNegativeStockLevel?: Maybe<Scalars['Int']['output']>;
  itemsWithPositiveStockLevel?: Maybe<Scalars['Int']['output']>;
  itemsWithoutImages?: Maybe<Scalars['Int']['output']>;
  physicalStoreId?: Maybe<Scalars['String']['output']>;
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

export type JobType = {
  __typename?: 'JobType';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  usedCount?: Maybe<Scalars['Int']['output']>;
};

export type KarkunDutyType = {
  __typename?: 'KarkunDutyType';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  daysOfWeek?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  duty?: Maybe<DutyType>;
  dutyId?: Maybe<Scalars['String']['output']>;
  dutyName?: Maybe<Scalars['String']['output']>;
  karkunId?: Maybe<Scalars['String']['output']>;
  location?: Maybe<DutyLocationType>;
  locationId?: Maybe<Scalars['String']['output']>;
  locationName?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Scalars['String']['output']>;
  shift?: Maybe<DutyShiftType>;
  shiftId?: Maybe<Scalars['String']['output']>;
  shiftName?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type KarkunFilter = {
  attendance?: InputMaybe<Scalars['String']['input']>;
  bloodGroup?: InputMaybe<Scalars['String']['input']>;
  cityId?: InputMaybe<Scalars['String']['input']>;
  cityMehfilId?: InputMaybe<Scalars['String']['input']>;
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  dutyId?: InputMaybe<Scalars['String']['input']>;
  dutyShiftId?: InputMaybe<Scalars['String']['input']>;
  ehadKarkun?: InputMaybe<Scalars['String']['input']>;
  isEmployee?: InputMaybe<Scalars['Boolean']['input']>;
  isKarkun?: InputMaybe<Scalars['Boolean']['input']>;
  isVisitor?: InputMaybe<Scalars['Boolean']['input']>;
  jobId?: InputMaybe<Scalars['String']['input']>;
  lastTarteeb?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  predefinedFilterName?: InputMaybe<Scalars['String']['input']>;
  predefinedFilterStoreId?: InputMaybe<Scalars['String']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
  updatedBetween?: InputMaybe<Scalars['String']['input']>;
  userAccount?: InputMaybe<Scalars['String']['input']>;
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

export type MehfilDutyType = {
  __typename?: 'MehfilDutyType';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  mehfilUsedCount?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  overallUsedCount?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  urduName?: Maybe<Scalars['String']['output']>;
};

export type MehfilKarkunType = {
  __typename?: 'MehfilKarkunType';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  duty?: Maybe<MehfilDutyType>;
  dutyCardBarcodeId?: Maybe<Scalars['String']['output']>;
  dutyDetail?: Maybe<Scalars['String']['output']>;
  dutyId?: Maybe<Scalars['String']['output']>;
  karkun?: Maybe<PersonType>;
  karkunId?: Maybe<Scalars['String']['output']>;
  mehfil?: Maybe<MehfilType>;
  mehfilId?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type MehfilLangarDishType = {
  __typename?: 'MehfilLangarDishType';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  overallUsedCount?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  urduName?: Maybe<Scalars['String']['output']>;
};

export type MehfilLangarLocationType = {
  __typename?: 'MehfilLangarLocationType';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  overallUsedCount?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  urduName?: Maybe<Scalars['String']['output']>;
};

export type MehfilType = {
  __typename?: 'MehfilType';
  _id?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  karkunCount?: Maybe<Scalars['Int']['output']>;
  mehfilDate?: Maybe<Scalars['String']['output']>;
  mehfilKarkuns?: Maybe<MehfilKarkunType>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addHrKarkunAttachment?: Maybe<PersonType>;
  addIssuanceFormAttachment?: Maybe<IssuanceForm>;
  addMehfilKarkun?: Maybe<MehfilKarkunType>;
  addPurchaseFormAttachment?: Maybe<PurchaseForm>;
  approveIssuanceForms?: Maybe<Array<Maybe<IssuanceForm>>>;
  approvePurchaseForms?: Maybe<Array<Maybe<PurchaseForm>>>;
  approveStockAdjustments?: Maybe<Array<Maybe<StockAdjustment>>>;
  cancelVisitorStay?: Maybe<VisitorStayType>;
  clearJobDefinitionSchedule?: Maybe<JobDefinitionType>;
  createAttachment?: Maybe<Attachment>;
  createAttendances?: Maybe<Scalars['Int']['output']>;
  createCity?: Maybe<CityType>;
  createCityMehfil?: Maybe<CityMehfilType>;
  createDuty?: Maybe<DutyType>;
  createDutyLocation?: Maybe<DutyLocationType>;
  createDutyShift?: Maybe<DutyShiftType>;
  createHrKarkun?: Maybe<PersonType>;
  createIssuanceForm?: Maybe<IssuanceForm>;
  createItemCategory?: Maybe<ItemCategory>;
  createJob?: Maybe<JobType>;
  createKarkunDuty?: Maybe<KarkunDutyType>;
  createLocation?: Maybe<Location>;
  createMehfil?: Maybe<MehfilType>;
  createPeopleTag?: Maybe<PeopleTagType>;
  createPhysicalStore?: Maybe<PhysicalStore>;
  createPurchaseForm?: Maybe<PurchaseForm>;
  createSalaries?: Maybe<Scalars['Int']['output']>;
  createSecurityMehfilDuty?: Maybe<MehfilDutyType>;
  createSecurityMehfilLangarDish?: Maybe<MehfilLangarDishType>;
  createSecurityMehfilLangarLocation?: Maybe<MehfilLangarLocationType>;
  createSecurityVisitor?: Maybe<PersonType>;
  createStockAdjustment?: Maybe<StockAdjustment>;
  createStockItem?: Maybe<StockItem>;
  createUser?: Maybe<UserType>;
  createUserGroup?: Maybe<UserGroupType>;
  createVendor?: Maybe<Vendor>;
  createVisitorStay?: Maybe<VisitorStayType>;
  deleteAllAttendances?: Maybe<Scalars['Int']['output']>;
  deleteAllSalaries?: Maybe<Scalars['Int']['output']>;
  deleteAttendances?: Maybe<Scalars['Int']['output']>;
  deleteHrKarkun?: Maybe<Scalars['Int']['output']>;
  deletePeopleTag?: Maybe<Scalars['Int']['output']>;
  deleteSalaries?: Maybe<Scalars['Int']['output']>;
  deleteSecurityVisitor?: Maybe<Scalars['Int']['output']>;
  deleteUserGroup?: Maybe<Scalars['Int']['output']>;
  deleteVisitorStay?: Maybe<Scalars['Int']['output']>;
  fixCitySpelling?: Maybe<Scalars['Int']['output']>;
  fixNameSpelling?: Maybe<Scalars['Int']['output']>;
  importAttendances?: Maybe<Scalars['Int']['output']>;
  importSecurityVisitorsCsvData?: Maybe<Scalars['String']['output']>;
  mergeStockItems?: Maybe<StockItem>;
  recalculateStockLevels?: Maybe<Array<Maybe<StockItem>>>;
  registerUser?: Maybe<Scalars['Int']['output']>;
  removeCity?: Maybe<Scalars['Int']['output']>;
  removeCityMehfil?: Maybe<Scalars['Int']['output']>;
  removeDuty?: Maybe<Scalars['Int']['output']>;
  removeDutyLocation?: Maybe<Scalars['Int']['output']>;
  removeDutyShift?: Maybe<Scalars['Int']['output']>;
  removeHrKarkunAttachment?: Maybe<PersonType>;
  removeIssuanceFormAttachment?: Maybe<IssuanceForm>;
  removeIssuanceForms?: Maybe<Scalars['Int']['output']>;
  removeItemCategory?: Maybe<Scalars['Int']['output']>;
  removeJob?: Maybe<Scalars['Int']['output']>;
  removeKarkunDuty?: Maybe<Scalars['Int']['output']>;
  removeLocation?: Maybe<Scalars['Int']['output']>;
  removeMehfil?: Maybe<Scalars['Int']['output']>;
  removeMehfilKarkun?: Maybe<Scalars['Int']['output']>;
  removePurchaseFormAttachment?: Maybe<PurchaseForm>;
  removePurchaseForms?: Maybe<Scalars['Int']['output']>;
  removeSecurityMehfilDuty?: Maybe<Scalars['Int']['output']>;
  removeSecurityMehfilLangarDish?: Maybe<Scalars['Int']['output']>;
  removeSecurityMehfilLangarLocation?: Maybe<Scalars['Int']['output']>;
  removeStockAdjustments?: Maybe<Scalars['Int']['output']>;
  removeStockItem?: Maybe<Scalars['Int']['output']>;
  removeVendor?: Maybe<Scalars['Int']['output']>;
  resetJobDefinitionSchedule?: Maybe<JobDefinitionType>;
  resetPassword?: Maybe<UserType>;
  retryFailedJob?: Maybe<Scalars['Boolean']['output']>;
  runScheduledJobNow?: Maybe<Scalars['Boolean']['output']>;
  setDutyDetail?: Maybe<Array<Maybe<MehfilKarkunType>>>;
  setGroups?: Maybe<UserType>;
  setHrKarkunEmploymentInfo?: Maybe<PersonType>;
  setHrKarkunProfileImage?: Maybe<PersonType>;
  setHrKarkunWazaifAndRaabta?: Maybe<PersonType>;
  setInstanceAccess?: Maybe<UserType>;
  setJobDefinitionEnabled?: Maybe<JobDefinitionType>;
  setPermissions?: Maybe<UserType>;
  setScheduledJobEnabled?: Maybe<Scalars['Boolean']['output']>;
  setSecurityUserPermissions?: Maybe<UserType>;
  setSecurityVisitorImage?: Maybe<PersonType>;
  setStockItemImage?: Maybe<StockItem>;
  setUserGroupInstanceAccess?: Maybe<UserGroupType>;
  setUserGroupPermissions?: Maybe<UserGroupType>;
  updateAttachment?: Maybe<Attachment>;
  updateAttendance?: Maybe<AttendanceType>;
  updateCity?: Maybe<CityType>;
  updateCityMehfil?: Maybe<CityMehfilType>;
  updateDuty?: Maybe<DutyType>;
  updateDutyLocation?: Maybe<DutyLocationType>;
  updateDutyShift?: Maybe<DutyShiftType>;
  updateHrKarkun?: Maybe<PersonType>;
  updateIssuanceForm?: Maybe<IssuanceForm>;
  updateItemCategory?: Maybe<ItemCategory>;
  updateJob?: Maybe<JobType>;
  updateJobDefinitionSchedule?: Maybe<JobDefinitionType>;
  updateKarkunDuty?: Maybe<KarkunDutyType>;
  updateLastActiveTime?: Maybe<Scalars['Int']['output']>;
  updateLocation?: Maybe<Location>;
  updateLoginTime?: Maybe<Scalars['Int']['output']>;
  updateMehfil?: Maybe<MehfilType>;
  updatePeopleTag?: Maybe<PeopleTagType>;
  updatePhysicalStore?: Maybe<PhysicalStore>;
  updatePurchaseForm?: Maybe<PurchaseForm>;
  updateSalary?: Maybe<SalaryType>;
  updateSecurityMehfilDuty?: Maybe<MehfilDutyType>;
  updateSecurityMehfilLangarDish?: Maybe<MehfilLangarDishType>;
  updateSecurityMehfilLangarLocation?: Maybe<MehfilLangarLocationType>;
  updateSecurityVisitor?: Maybe<PersonType>;
  updateSecurityVisitorNotes?: Maybe<PersonType>;
  updateStockAdjustment?: Maybe<StockAdjustment>;
  updateStockItem?: Maybe<StockItem>;
  updateUser?: Maybe<UserType>;
  updateUserGroup?: Maybe<UserGroupType>;
  updateVendor?: Maybe<Vendor>;
  updateVisitorStay?: Maybe<VisitorStayType>;
  verifyStockItemLevel?: Maybe<StockItem>;
};


export type MutationAddHrKarkunAttachmentArgs = {
  _id: Scalars['String']['input'];
  attachmentId: Scalars['String']['input'];
};


export type MutationAddIssuanceFormAttachmentArgs = {
  _id: Scalars['String']['input'];
  attachmentId: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type MutationAddMehfilKarkunArgs = {
  dutyId: Scalars['String']['input'];
  karkunId: Scalars['String']['input'];
  mehfilId: Scalars['String']['input'];
};


export type MutationAddPurchaseFormAttachmentArgs = {
  _id: Scalars['String']['input'];
  attachmentId: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type MutationApproveIssuanceFormsArgs = {
  _ids: Array<InputMaybe<Scalars['String']['input']>>;
  physicalStoreId: Scalars['String']['input'];
};


export type MutationApprovePurchaseFormsArgs = {
  _ids: Array<InputMaybe<Scalars['String']['input']>>;
  physicalStoreId: Scalars['String']['input'];
};


export type MutationApproveStockAdjustmentsArgs = {
  _ids: Array<InputMaybe<Scalars['String']['input']>>;
  physicalStoreId: Scalars['String']['input'];
};


export type MutationCancelVisitorStayArgs = {
  _id: Scalars['String']['input'];
};


export type MutationClearJobDefinitionScheduleArgs = {
  _id: Scalars['String']['input'];
};


export type MutationCreateAttachmentArgs = {
  data: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  mimeType?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateAttendancesArgs = {
  month: Scalars['String']['input'];
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


export type MutationCreateDutyArgs = {
  attendanceSheet?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isMehfilDuty: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
};


export type MutationCreateDutyLocationArgs = {
  name: Scalars['String']['input'];
};


export type MutationCreateDutyShiftArgs = {
  attendanceSheet?: InputMaybe<Scalars['String']['input']>;
  dutyId: Scalars['String']['input'];
  endTime?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  startTime?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateHrKarkunArgs = {
  birthDate?: InputMaybe<Scalars['String']['input']>;
  bloodGroup?: InputMaybe<Scalars['String']['input']>;
  cityId?: InputMaybe<Scalars['String']['input']>;
  cityMehfilId?: InputMaybe<Scalars['String']['input']>;
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  contactNumber1?: InputMaybe<Scalars['String']['input']>;
  contactNumber2?: InputMaybe<Scalars['String']['input']>;
  currentAddress?: InputMaybe<Scalars['String']['input']>;
  educationalQualification?: InputMaybe<Scalars['String']['input']>;
  ehadDate?: InputMaybe<Scalars['String']['input']>;
  emailAddress?: InputMaybe<Scalars['String']['input']>;
  meansOfEarning?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  parentName?: InputMaybe<Scalars['String']['input']>;
  permanentAddress?: InputMaybe<Scalars['String']['input']>;
  referenceName?: InputMaybe<Scalars['String']['input']>;
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


export type MutationCreateKarkunDutyArgs = {
  daysOfWeek?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  dutyId: Scalars['String']['input'];
  karkunId: Scalars['String']['input'];
  locationId?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  shiftId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateLocationArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  parentId?: InputMaybe<Scalars['String']['input']>;
  physicalStoreId: Scalars['String']['input'];
};


export type MutationCreateMehfilArgs = {
  mehfilDate: Scalars['String']['input'];
  name: Scalars['String']['input'];
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


export type MutationCreateSalariesArgs = {
  month: Scalars['String']['input'];
};


export type MutationCreateSecurityMehfilDutyArgs = {
  name: Scalars['String']['input'];
  urduName: Scalars['String']['input'];
};


export type MutationCreateSecurityMehfilLangarDishArgs = {
  name: Scalars['String']['input'];
  urduName: Scalars['String']['input'];
};


export type MutationCreateSecurityMehfilLangarLocationArgs = {
  name: Scalars['String']['input'];
  urduName: Scalars['String']['input'];
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


export type MutationCreateUserArgs = {
  displayName?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  personId?: InputMaybe<Scalars['String']['input']>;
  userName?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateUserGroupArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  moduleName: Scalars['String']['input'];
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


export type MutationDeleteAllAttendancesArgs = {
  categoryId?: InputMaybe<Scalars['String']['input']>;
  month: Scalars['String']['input'];
  subCategoryId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeleteAllSalariesArgs = {
  month: Scalars['String']['input'];
};


export type MutationDeleteAttendancesArgs = {
  ids: Array<InputMaybe<Scalars['String']['input']>>;
  month: Scalars['String']['input'];
};


export type MutationDeleteHrKarkunArgs = {
  _id: Scalars['String']['input'];
};


export type MutationDeletePeopleTagArgs = {
  _id: Scalars['String']['input'];
};


export type MutationDeleteSalariesArgs = {
  ids: Array<InputMaybe<Scalars['String']['input']>>;
  month: Scalars['String']['input'];
};


export type MutationDeleteSecurityVisitorArgs = {
  _id: Scalars['String']['input'];
};


export type MutationDeleteUserGroupArgs = {
  _id: Scalars['String']['input'];
};


export type MutationDeleteVisitorStayArgs = {
  _id: Scalars['String']['input'];
};


export type MutationFixCitySpellingArgs = {
  existingSpelling: Scalars['String']['input'];
  newSpelling: Scalars['String']['input'];
};


export type MutationFixNameSpellingArgs = {
  existingSpelling: Scalars['String']['input'];
  newSpelling: Scalars['String']['input'];
};


export type MutationImportAttendancesArgs = {
  dutyId: Scalars['String']['input'];
  month: Scalars['String']['input'];
  shiftId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationImportSecurityVisitorsCsvDataArgs = {
  csvData: Scalars['String']['input'];
};


export type MutationMergeStockItemsArgs = {
  _idToKeep: Scalars['String']['input'];
  _idsToMerge: Array<InputMaybe<Scalars['String']['input']>>;
  physicalStoreId: Scalars['String']['input'];
};


export type MutationRecalculateStockLevelsArgs = {
  _ids: Array<InputMaybe<Scalars['String']['input']>>;
  physicalStoreId: Scalars['String']['input'];
};


export type MutationRegisterUserArgs = {
  displayName: Scalars['String']['input'];
  email: Scalars['String']['input'];
};


export type MutationRemoveCityArgs = {
  _id: Scalars['String']['input'];
};


export type MutationRemoveCityMehfilArgs = {
  _id: Scalars['String']['input'];
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


export type MutationRemoveHrKarkunAttachmentArgs = {
  _id: Scalars['String']['input'];
  attachmentId: Scalars['String']['input'];
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


export type MutationRemoveKarkunDutyArgs = {
  _id: Scalars['String']['input'];
};


export type MutationRemoveLocationArgs = {
  _id: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type MutationRemoveMehfilArgs = {
  _id: Scalars['String']['input'];
};


export type MutationRemoveMehfilKarkunArgs = {
  _id: Scalars['String']['input'];
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


export type MutationRemoveSecurityMehfilDutyArgs = {
  _id: Scalars['String']['input'];
};


export type MutationRemoveSecurityMehfilLangarDishArgs = {
  _id: Scalars['String']['input'];
};


export type MutationRemoveSecurityMehfilLangarLocationArgs = {
  _id: Scalars['String']['input'];
};


export type MutationRemoveStockAdjustmentsArgs = {
  _ids: Array<InputMaybe<Scalars['String']['input']>>;
  physicalStoreId: Scalars['String']['input'];
};


export type MutationRemoveStockItemArgs = {
  _id: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type MutationRemoveVendorArgs = {
  _id: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type MutationResetJobDefinitionScheduleArgs = {
  _id: Scalars['String']['input'];
};


export type MutationResetPasswordArgs = {
  userName: Scalars['String']['input'];
};


export type MutationRetryFailedJobArgs = {
  _id: Scalars['String']['input'];
};


export type MutationRunScheduledJobNowArgs = {
  name: Scalars['String']['input'];
};


export type MutationSetDutyDetailArgs = {
  dutyDetail?: InputMaybe<Scalars['String']['input']>;
  ids: Array<InputMaybe<Scalars['String']['input']>>;
};


export type MutationSetGroupsArgs = {
  groups: Array<InputMaybe<Scalars['String']['input']>>;
  userId: Scalars['String']['input'];
};


export type MutationSetHrKarkunEmploymentInfoArgs = {
  _id: Scalars['String']['input'];
  bankAccountDetails?: InputMaybe<Scalars['String']['input']>;
  employmentEndDate?: InputMaybe<Scalars['String']['input']>;
  employmentStartDate?: InputMaybe<Scalars['String']['input']>;
  isEmployee: Scalars['Boolean']['input'];
  jobId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSetHrKarkunProfileImageArgs = {
  _id: Scalars['String']['input'];
  imageId: Scalars['String']['input'];
};


export type MutationSetHrKarkunWazaifAndRaabtaArgs = {
  _id: Scalars['String']['input'];
  lastTarteebDate?: InputMaybe<Scalars['String']['input']>;
  mehfilRaabta?: InputMaybe<Scalars['String']['input']>;
  msRaabta?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSetInstanceAccessArgs = {
  instances: Array<InputMaybe<Scalars['String']['input']>>;
  userId: Scalars['String']['input'];
};


export type MutationSetJobDefinitionEnabledArgs = {
  _id: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
};


export type MutationSetPermissionsArgs = {
  permissions: Array<InputMaybe<Scalars['String']['input']>>;
  userId: Scalars['String']['input'];
};


export type MutationSetScheduledJobEnabledArgs = {
  _id: Scalars['String']['input'];
  enabled: Scalars['Boolean']['input'];
};


export type MutationSetSecurityUserPermissionsArgs = {
  permissions: Array<InputMaybe<Scalars['String']['input']>>;
  userId: Scalars['String']['input'];
};


export type MutationSetSecurityVisitorImageArgs = {
  _id: Scalars['String']['input'];
  imageId: Scalars['String']['input'];
};


export type MutationSetStockItemImageArgs = {
  _id: Scalars['String']['input'];
  imageId: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type MutationSetUserGroupInstanceAccessArgs = {
  _id: Scalars['String']['input'];
  instances: Array<InputMaybe<Scalars['String']['input']>>;
};


export type MutationSetUserGroupPermissionsArgs = {
  _id: Scalars['String']['input'];
  permissions: Array<InputMaybe<Scalars['String']['input']>>;
};


export type MutationUpdateAttachmentArgs = {
  _id: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateAttendanceArgs = {
  _id: Scalars['String']['input'];
  absentCount?: InputMaybe<Scalars['Int']['input']>;
  attendanceDetails?: InputMaybe<Scalars['String']['input']>;
  percentage?: InputMaybe<Scalars['Int']['input']>;
  presentCount?: InputMaybe<Scalars['Int']['input']>;
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


export type MutationUpdateDutyArgs = {
  attendanceSheet?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type MutationUpdateDutyLocationArgs = {
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type MutationUpdateDutyShiftArgs = {
  _id: Scalars['String']['input'];
  attendanceSheet?: InputMaybe<Scalars['String']['input']>;
  dutyId: Scalars['String']['input'];
  endTime?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  startTime?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateHrKarkunArgs = {
  _id: Scalars['String']['input'];
  birthDate?: InputMaybe<Scalars['String']['input']>;
  bloodGroup?: InputMaybe<Scalars['String']['input']>;
  cityId?: InputMaybe<Scalars['String']['input']>;
  cityMehfilId?: InputMaybe<Scalars['String']['input']>;
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  contactNumber1?: InputMaybe<Scalars['String']['input']>;
  contactNumber2?: InputMaybe<Scalars['String']['input']>;
  currentAddress?: InputMaybe<Scalars['String']['input']>;
  deathDate?: InputMaybe<Scalars['String']['input']>;
  educationalQualification?: InputMaybe<Scalars['String']['input']>;
  ehadDate?: InputMaybe<Scalars['String']['input']>;
  emailAddress?: InputMaybe<Scalars['String']['input']>;
  meansOfEarning?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  parentName?: InputMaybe<Scalars['String']['input']>;
  permanentAddress?: InputMaybe<Scalars['String']['input']>;
  referenceName?: InputMaybe<Scalars['String']['input']>;
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


export type MutationUpdateKarkunDutyArgs = {
  _id: Scalars['String']['input'];
  daysOfWeek?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  dutyId: Scalars['String']['input'];
  karkunId: Scalars['String']['input'];
  locationId?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  shiftId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateLocationArgs = {
  _id: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  parentId?: InputMaybe<Scalars['String']['input']>;
  physicalStoreId: Scalars['String']['input'];
};


export type MutationUpdateMehfilArgs = {
  _id: Scalars['String']['input'];
  mehfilDate?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
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


export type MutationUpdateSecurityMehfilDutyArgs = {
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
  urduName: Scalars['String']['input'];
};


export type MutationUpdateSecurityMehfilLangarDishArgs = {
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
  urduName: Scalars['String']['input'];
};


export type MutationUpdateSecurityMehfilLangarLocationArgs = {
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
  urduName: Scalars['String']['input'];
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


export type MutationUpdateUserArgs = {
  displayName?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  locked?: InputMaybe<Scalars['Boolean']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['String']['input'];
};


export type MutationUpdateUserGroupArgs = {
  _id: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
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


export type MutationVerifyStockItemLevelArgs = {
  _id: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};

export type PagedAttendanceType = {
  __typename?: 'PagedAttendanceType';
  data?: Maybe<Array<Maybe<AttendanceType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
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

export type PagedPeopleType = {
  __typename?: 'PagedPeopleType';
  data?: Maybe<Array<Maybe<PersonType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedPurchaseForm = {
  __typename?: 'PagedPurchaseForm';
  data?: Maybe<Array<Maybe<PurchaseForm>>>;
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
  AdminManageDeletedData = 'ADMIN_MANAGE_DELETED_DATA',
  AdminManageJobs = 'ADMIN_MANAGE_JOBS',
  AdminManagePeopleTags = 'ADMIN_MANAGE_PEOPLE_TAGS',
  AdminManagePhysicalStores = 'ADMIN_MANAGE_PHYSICAL_STORES',
  AdminManageUsersAndGroups = 'ADMIN_MANAGE_USERS_AND_GROUPS',
  AdminViewJobs = 'ADMIN_VIEW_JOBS',
  AdminViewUsersAndGroups = 'ADMIN_VIEW_USERS_AND_GROUPS',
  HrDeleteData = 'HR_DELETE_DATA',
  HrManageEmployees = 'HR_MANAGE_EMPLOYEES',
  HrManageKarkuns = 'HR_MANAGE_KARKUNS',
  HrManageSetupData = 'HR_MANAGE_SETUP_DATA',
  HrViewAuditLogs = 'HR_VIEW_AUDIT_LOGS',
  HrViewEmployees = 'HR_VIEW_EMPLOYEES',
  HrViewKarkuns = 'HR_VIEW_KARKUNS',
  InApproveIssuanceForms = 'IN_APPROVE_ISSUANCE_FORMS',
  InApprovePurchaseForms = 'IN_APPROVE_PURCHASE_FORMS',
  InApproveStockAdjustments = 'IN_APPROVE_STOCK_ADJUSTMENTS',
  InManageIssuanceForms = 'IN_MANAGE_ISSUANCE_FORMS',
  InManagePurchaseForms = 'IN_MANAGE_PURCHASE_FORMS',
  InManageSetupData = 'IN_MANAGE_SETUP_DATA',
  InManageStockAdjustments = 'IN_MANAGE_STOCK_ADJUSTMENTS',
  InManageStockItems = 'IN_MANAGE_STOCK_ITEMS',
  InViewIssuanceForms = 'IN_VIEW_ISSUANCE_FORMS',
  InViewPurchaseForms = 'IN_VIEW_PURCHASE_FORMS',
  InViewStockAdjustments = 'IN_VIEW_STOCK_ADJUSTMENTS',
  SecurityDeleteData = 'SECURITY_DELETE_DATA',
  SecurityManageMehfils = 'SECURITY_MANAGE_MEHFILS',
  SecurityManageSetupData = 'SECURITY_MANAGE_SETUP_DATA',
  SecurityManageUsers = 'SECURITY_MANAGE_USERS',
  SecurityManageVisitors = 'SECURITY_MANAGE_VISITORS',
  SecurityViewAuditLogs = 'SECURITY_VIEW_AUDIT_LOGS',
  SecurityViewKarkunVerification = 'SECURITY_VIEW_KARKUN_VERIFICATION',
  SecurityViewMehfils = 'SECURITY_VIEW_MEHFILS',
  SecurityViewUsers = 'SECURITY_VIEW_USERS',
  SecurityViewVisitors = 'SECURITY_VIEW_VISITORS'
}

export type PersonEmployeeDataType = {
  __typename?: 'PersonEmployeeDataType';
  bankAccountDetails?: Maybe<Scalars['String']['output']>;
  employmentEndDate?: Maybe<Scalars['String']['output']>;
  employmentStartDate?: Maybe<Scalars['String']['output']>;
  job?: Maybe<JobType>;
  jobId?: Maybe<Scalars['String']['output']>;
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

export type PersonKarkunDataType = {
  __typename?: 'PersonKarkunDataType';
  attachmentIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  attachments?: Maybe<Array<Maybe<Attachment>>>;
  city?: Maybe<CityType>;
  cityId?: Maybe<Scalars['String']['output']>;
  cityMehfil?: Maybe<CityMehfilType>;
  cityMehfilId?: Maybe<Scalars['String']['output']>;
  duties?: Maybe<Array<Maybe<KarkunDutyType>>>;
  ehadKarkun?: Maybe<Scalars['Boolean']['output']>;
  ehadPermissionDate?: Maybe<Scalars['String']['output']>;
  lastTarteebDate?: Maybe<Scalars['String']['output']>;
  mehfilRaabta?: Maybe<Scalars['String']['output']>;
  msLastVisitDate?: Maybe<Scalars['String']['output']>;
  msRaabta?: Maybe<Scalars['String']['output']>;
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
  image?: Maybe<Attachment>;
  imageId?: Maybe<Scalars['String']['output']>;
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
  employeeData?: Maybe<PersonEmployeeDataType>;
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
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
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

export type Query = {
  __typename?: 'Query';
  allAccessiblePhysicalStores?: Maybe<Array<Maybe<PhysicalStore>>>;
  allCities?: Maybe<Array<Maybe<CityType>>>;
  allCityMehfils?: Maybe<Array<Maybe<CityMehfilType>>>;
  allDutyLocations?: Maybe<Array<Maybe<DutyLocationType>>>;
  allDutyShifts?: Maybe<Array<Maybe<DutyShiftType>>>;
  allJobDefinitions?: Maybe<Array<Maybe<JobDefinitionType>>>;
  allJobs?: Maybe<Array<Maybe<JobType>>>;
  allMSDuties?: Maybe<Array<Maybe<DutyType>>>;
  allMehfilDuties?: Maybe<Array<Maybe<DutyType>>>;
  allMehfils?: Maybe<Array<Maybe<MehfilType>>>;
  allPeopleTags?: Maybe<Array<Maybe<PeopleTagType>>>;
  allPhysicalStores?: Maybe<Array<Maybe<PhysicalStore>>>;
  allSecurityMehfilDuties?: Maybe<Array<Maybe<MehfilDutyType>>>;
  allSecurityMehfilLangarDishes?: Maybe<Array<Maybe<MehfilLangarDishType>>>;
  allSecurityMehfilLangarLocations?: Maybe<Array<Maybe<MehfilLangarLocationType>>>;
  attachmentsById?: Maybe<Array<Maybe<Attachment>>>;
  attendanceByBarcodeId?: Maybe<AttendanceType>;
  attendanceByBarcodeIds?: Maybe<Array<Maybe<AttendanceType>>>;
  attendanceById?: Maybe<AttendanceType>;
  attendanceByMonth?: Maybe<Array<Maybe<AttendanceType>>>;
  cityById?: Maybe<CityType>;
  cityMehfilById?: Maybe<CityMehfilType>;
  cityMehfilsByCityId?: Maybe<Array<Maybe<CityMehfilType>>>;
  currentUser?: Maybe<UserType>;
  deletedPersonById?: Maybe<PersonType>;
  distinctCities?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  distinctCountries?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  distinctRegions?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  distinctStayAllowedBy?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  dutyById?: Maybe<DutyType>;
  dutyLocationById?: Maybe<DutyLocationType>;
  dutyShiftById?: Maybe<DutyShiftType>;
  dutyShiftsByDutyId?: Maybe<Array<Maybe<DutyShiftType>>>;
  faceVectors: Array<FaceVectorRecord>;
  hrKarkunById?: Maybe<PersonType>;
  hrKarkunsById?: Maybe<Array<Maybe<PersonType>>>;
  inventoryStatistics?: Maybe<InventoryStatistics>;
  isJobProcessorActive?: Maybe<Scalars['Boolean']['output']>;
  issuanceFormById?: Maybe<IssuanceForm>;
  issuanceFormsByMonth?: Maybe<Array<Maybe<IssuanceForm>>>;
  issuanceFormsByStockItem?: Maybe<Array<Maybe<IssuanceForm>>>;
  itemCategoriesByPhysicalStoreId?: Maybe<Array<Maybe<ItemCategory>>>;
  itemCategoryById?: Maybe<ItemCategory>;
  jobById?: Maybe<JobType>;
  karkunDutiesByKarkunId?: Maybe<Array<Maybe<KarkunDutyType>>>;
  karkunDutyById?: Maybe<KarkunDutyType>;
  locationById?: Maybe<Location>;
  locationsByPhysicalStoreId?: Maybe<Array<Maybe<Location>>>;
  mehfilById?: Maybe<MehfilType>;
  mehfilKarkunByBarcodeId?: Maybe<MehfilKarkunType>;
  mehfilKarkunsByIds?: Maybe<Array<Maybe<MehfilKarkunType>>>;
  mehfilKarkunsByMehfilId?: Maybe<Array<Maybe<MehfilKarkunType>>>;
  pagedAttendanceByKarkun?: Maybe<PagedAttendanceType>;
  pagedCities?: Maybe<PagedCityType>;
  pagedDeletedPeople?: Maybe<PagedPeopleType>;
  pagedHrAuditLogs?: Maybe<PagedAuditLogType>;
  pagedHrKarkuns?: Maybe<PagedKarkunType>;
  pagedIssuanceForms?: Maybe<PagedIssuanceForm>;
  pagedJobLogs?: Maybe<PagedJobLogsType>;
  pagedPeople?: Maybe<PagedPeopleType>;
  pagedPurchaseForms?: Maybe<PagedPurchaseForm>;
  pagedSalariesByKarkun?: Maybe<PagedSalaryType>;
  pagedScheduledJobs?: Maybe<PagedScheduledJobsType>;
  pagedSecurityAuditLogs?: Maybe<PagedAuditLogType>;
  pagedSecurityUsers?: Maybe<PagedUserType>;
  pagedSecurityVisitors?: Maybe<PagedVisitorType>;
  pagedStockAdjustments?: Maybe<PagedStockAdjustment>;
  pagedStockItems?: Maybe<PagedStockItem>;
  pagedUserGroups?: Maybe<PagedUserGroupType>;
  pagedUsers?: Maybe<PagedUserType>;
  pagedVisitorStays?: Maybe<PagedVisitorStayType>;
  pagedVisitorStaysByVisitorId?: Maybe<PagedVisitorStayType>;
  physicalStoreById?: Maybe<PhysicalStore>;
  purchaseFormById?: Maybe<PurchaseForm>;
  purchaseFormsByMonth?: Maybe<Array<Maybe<PurchaseForm>>>;
  purchaseFormsByStockItem?: Maybe<Array<Maybe<PurchaseForm>>>;
  salariesByIds?: Maybe<Array<Maybe<SalaryType>>>;
  salariesByMonth?: Maybe<Array<Maybe<SalaryType>>>;
  securityMehfilDutyById?: Maybe<MehfilDutyType>;
  securityMehfilLangarDishById?: Maybe<MehfilLangarDishType>;
  securityMehfilLangarLocationById?: Maybe<MehfilLangarLocationType>;
  securityVisitorByCnic?: Maybe<PersonType>;
  securityVisitorByCnicOrContactNumber?: Maybe<PersonType>;
  securityVisitorById?: Maybe<PersonType>;
  stockAdjustmentById?: Maybe<StockAdjustment>;
  stockAdjustmentsByStockItem?: Maybe<Array<Maybe<StockAdjustment>>>;
  stockItemById?: Maybe<StockItem>;
  stockItemsById?: Maybe<Array<Maybe<StockItem>>>;
  userById?: Maybe<UserType>;
  userGroupById?: Maybe<UserGroupType>;
  userNames?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  vendorById?: Maybe<Vendor>;
  vendorsByPhysicalStoreId?: Maybe<Array<Maybe<Vendor>>>;
  visitorStayById?: Maybe<VisitorStayType>;
};


export type QueryAllSecurityMehfilDutiesArgs = {
  mehfilId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryAttachmentsByIdArgs = {
  ids: Array<InputMaybe<Scalars['String']['input']>>;
};


export type QueryAttendanceByBarcodeIdArgs = {
  barcodeId: Scalars['String']['input'];
};


export type QueryAttendanceByBarcodeIdsArgs = {
  barcodeIds: Scalars['String']['input'];
};


export type QueryAttendanceByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryAttendanceByMonthArgs = {
  categoryId?: InputMaybe<Scalars['String']['input']>;
  month: Scalars['String']['input'];
  subCategoryId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCityByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryCityMehfilByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryCityMehfilsByCityIdArgs = {
  cityId: Scalars['String']['input'];
};


export type QueryDeletedPersonByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryDutyByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryDutyLocationByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryDutyShiftByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryDutyShiftsByDutyIdArgs = {
  dutyId: Scalars['String']['input'];
};


export type QueryFaceVectorsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  since?: InputMaybe<Scalars['DateTime']['input']>;
};


export type QueryHrKarkunByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryHrKarkunsByIdArgs = {
  _ids: Scalars['String']['input'];
};


export type QueryInventoryStatisticsArgs = {
  physicalStoreId: Scalars['String']['input'];
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


export type QueryKarkunDutiesByKarkunIdArgs = {
  karkunId: Scalars['String']['input'];
};


export type QueryKarkunDutyByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryLocationByIdArgs = {
  _id: Scalars['String']['input'];
  physicalStoreId: Scalars['String']['input'];
};


export type QueryLocationsByPhysicalStoreIdArgs = {
  physicalStoreId: Scalars['String']['input'];
};


export type QueryMehfilByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryMehfilKarkunByBarcodeIdArgs = {
  barcode: Scalars['String']['input'];
};


export type QueryMehfilKarkunsByIdsArgs = {
  ids: Scalars['String']['input'];
};


export type QueryMehfilKarkunsByMehfilIdArgs = {
  dutyId?: InputMaybe<Scalars['String']['input']>;
  mehfilId: Scalars['String']['input'];
};


export type QueryPagedAttendanceByKarkunArgs = {
  queryString?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedCitiesArgs = {
  filter?: InputMaybe<CityFilter>;
};


export type QueryPagedDeletedPeopleArgs = {
  filter?: InputMaybe<PersonFilter>;
};


export type QueryPagedHrAuditLogsArgs = {
  filter?: InputMaybe<AuditLogFilter>;
};


export type QueryPagedHrKarkunsArgs = {
  filter?: InputMaybe<KarkunFilter>;
};


export type QueryPagedIssuanceFormsArgs = {
  physicalStoreId: Scalars['String']['input'];
  queryString?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPagedJobLogsArgs = {
  filter?: InputMaybe<JobLogsFilterType>;
};


export type QueryPagedPeopleArgs = {
  filter?: InputMaybe<PersonFilter>;
};


export type QueryPagedPurchaseFormsArgs = {
  physicalStoreId: Scalars['String']['input'];
  queryString?: InputMaybe<Scalars['String']['input']>;
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


export type QueryPagedSecurityUsersArgs = {
  filter?: InputMaybe<UserFilter>;
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


export type QuerySalariesByIdsArgs = {
  ids: Scalars['String']['input'];
};


export type QuerySalariesByMonthArgs = {
  jobId?: InputMaybe<Scalars['String']['input']>;
  month: Scalars['String']['input'];
};


export type QuerySecurityMehfilDutyByIdArgs = {
  id: Scalars['String']['input'];
};


export type QuerySecurityMehfilLangarDishByIdArgs = {
  id: Scalars['String']['input'];
};


export type QuerySecurityMehfilLangarLocationByIdArgs = {
  id: Scalars['String']['input'];
};


export type QuerySecurityVisitorByCnicArgs = {
  cnicNumbers: Array<InputMaybe<Scalars['String']['input']>>;
};


export type QuerySecurityVisitorByCnicOrContactNumberArgs = {
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  contactNumber?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySecurityVisitorByIdArgs = {
  _id: Scalars['String']['input'];
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


export type QueryUserByIdArgs = {
  _id?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUserGroupByIdArgs = {
  _id: Scalars['String']['input'];
};


export type QueryUserNamesArgs = {
  ids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
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
  karkun?: Maybe<PersonType>;
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
  repeatInterval?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
};

export type ScheduledJobsFilterType = {
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type SecurityLogFilter = {
  dataSource?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
};

export type SecurityLogType = {
  __typename?: 'SecurityLogType';
  _id?: Maybe<Scalars['String']['output']>;
  dataSource?: Maybe<Scalars['String']['output']>;
  dataSourceDetail?: Maybe<Scalars['String']['output']>;
  operationBy?: Maybe<Scalars['String']['output']>;
  operationByImageId?: Maybe<Scalars['String']['output']>;
  operationByName?: Maybe<Scalars['String']['output']>;
  operationDetails?: Maybe<Scalars['JSONObject']['output']>;
  operationTime?: Maybe<Scalars['String']['output']>;
  operationType?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
  userImageId?: Maybe<Scalars['String']['output']>;
  userName?: Maybe<Scalars['String']['output']>;
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
  imageId?: Maybe<Scalars['String']['output']>;
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

export type UserFilter = {
  moduleAccess?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  showActive?: InputMaybe<Scalars['String']['input']>;
  showInactive?: InputMaybe<Scalars['String']['input']>;
  showLocked?: InputMaybe<Scalars['String']['input']>;
  showUnlocked?: InputMaybe<Scalars['String']['input']>;
};

export type UserGroupType = {
  __typename?: 'UserGroupType';
  _id?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  instances?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  moduleName?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  permissions?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type UserType = {
  __typename?: 'UserType';
  _id?: Maybe<Scalars['String']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  emailVerified?: Maybe<Scalars['Boolean']['output']>;
  groups?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  instances?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  karkun?: Maybe<PersonType>;
  lastActiveAt?: Maybe<Scalars['String']['output']>;
  lastLoggedInAt?: Maybe<Scalars['String']['output']>;
  locked?: Maybe<Scalars['Boolean']['output']>;
  permissions?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  person?: Maybe<PersonType>;
  personId?: Maybe<Scalars['String']['output']>;
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
