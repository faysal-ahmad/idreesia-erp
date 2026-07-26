import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
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

export type ApprovedImdadType = {
  __typename?: 'ApprovedImdadType';
  fixedRecurringFuel?: Maybe<Scalars['Int']['output']>;
  fixedRecurringHouseRent?: Maybe<Scalars['Int']['output']>;
  fixedRecurringMedical?: Maybe<Scalars['Int']['output']>;
  fixedRecurringMilk?: Maybe<Scalars['Int']['output']>;
  fixedRecurringMonthlyPayment?: Maybe<Scalars['Int']['output']>;
  fixedRecurringSchoolFee?: Maybe<Scalars['Int']['output']>;
  fixedRecurringWeeklyPayment?: Maybe<Scalars['Int']['output']>;
  fromMonth?: Maybe<Scalars['String']['output']>;
  oneOffHouseConstruction?: Maybe<Scalars['Int']['output']>;
  oneOffMarriageExpense?: Maybe<Scalars['Int']['output']>;
  oneOffMedical?: Maybe<Scalars['Int']['output']>;
  oneOffMiscPayment?: Maybe<Scalars['Int']['output']>;
  ration?: Maybe<Scalars['String']['output']>;
  toMonth?: Maybe<Scalars['String']['output']>;
  variableRecurringMedical?: Maybe<Scalars['Int']['output']>;
  variableRecurringUtilityBills?: Maybe<Scalars['Int']['output']>;
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
  karkun?: Maybe<KarkunType>;
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

export type ImdadRequestFilter = {
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  requestDate?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  updatedBetween?: InputMaybe<Scalars['String']['input']>;
  visitorId?: InputMaybe<Scalars['String']['input']>;
};

export type ImdadRequestType = {
  __typename?: 'ImdadRequestType';
  _id?: Maybe<Scalars['String']['output']>;
  approvedImdad?: Maybe<ApprovedImdadType>;
  attachmentIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  attachments?: Maybe<Array<Maybe<Attachment>>>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  dataSource?: Maybe<Scalars['String']['output']>;
  imdadReasonId?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  requestDate?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  visitor?: Maybe<VisitorType>;
  visitorId?: Maybe<Scalars['String']['output']>;
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
  refIssuedBy?: Maybe<KarkunType>;
  refIssuedTo?: Maybe<KarkunType>;
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
  jobId?: InputMaybe<Scalars['String']['input']>;
  lastTarteeb?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  predefinedFilterName?: InputMaybe<Scalars['String']['input']>;
  predefinedFilterStoreId?: InputMaybe<Scalars['String']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
  showEmployees?: InputMaybe<Scalars['String']['input']>;
  showVolunteers?: InputMaybe<Scalars['String']['input']>;
  updatedBetween?: InputMaybe<Scalars['String']['input']>;
  userAccount?: InputMaybe<Scalars['String']['input']>;
};

export type KarkunType = {
  __typename?: 'KarkunType';
  _id?: Maybe<Scalars['String']['output']>;
  attachmentIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  attachments?: Maybe<Array<Maybe<Attachment>>>;
  bankAccountDetails?: Maybe<Scalars['String']['output']>;
  birthDate?: Maybe<Scalars['String']['output']>;
  bloodGroup?: Maybe<Scalars['String']['output']>;
  city?: Maybe<CityType>;
  cityId?: Maybe<Scalars['String']['output']>;
  cityMehfil?: Maybe<CityMehfilType>;
  cityMehfilId?: Maybe<Scalars['String']['output']>;
  cnicNumber?: Maybe<Scalars['String']['output']>;
  contactNumber1?: Maybe<Scalars['String']['output']>;
  contactNumber1Subscribed?: Maybe<Scalars['Boolean']['output']>;
  contactNumber2?: Maybe<Scalars['String']['output']>;
  contactNumber2Subscribed?: Maybe<Scalars['Boolean']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  currentAddress?: Maybe<Scalars['String']['output']>;
  deathDate?: Maybe<Scalars['String']['output']>;
  duties?: Maybe<Array<Maybe<KarkunDutyType>>>;
  educationalQualification?: Maybe<Scalars['String']['output']>;
  ehadDate?: Maybe<Scalars['String']['output']>;
  ehadKarkun?: Maybe<Scalars['Boolean']['output']>;
  ehadPermissionDate?: Maybe<Scalars['String']['output']>;
  emailAddress?: Maybe<Scalars['String']['output']>;
  employmentEndDate?: Maybe<Scalars['String']['output']>;
  employmentStartDate?: Maybe<Scalars['String']['output']>;
  image?: Maybe<Attachment>;
  imageId?: Maybe<Scalars['String']['output']>;
  isEmployee?: Maybe<Scalars['Boolean']['output']>;
  job?: Maybe<JobType>;
  jobId?: Maybe<Scalars['String']['output']>;
  lastTarteebDate?: Maybe<Scalars['String']['output']>;
  meansOfEarning?: Maybe<Scalars['String']['output']>;
  mehfilRaabta?: Maybe<Scalars['String']['output']>;
  msLastVisitDate?: Maybe<Scalars['String']['output']>;
  msRaabta?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  parentName?: Maybe<Scalars['String']['output']>;
  permanentAddress?: Maybe<Scalars['String']['output']>;
  referenceName?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  user?: Maybe<KarkunUserType>;
};

export type KarkunUserType = {
  __typename?: 'KarkunUserType';
  _id?: Maybe<Scalars['String']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  emailVerified?: Maybe<Scalars['Boolean']['output']>;
  groups?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  instances?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  lastActiveAt?: Maybe<Scalars['String']['output']>;
  lastLoggedInAt?: Maybe<Scalars['String']['output']>;
  locked?: Maybe<Scalars['Boolean']['output']>;
  permissions?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  username?: Maybe<Scalars['String']['output']>;
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
  addHrKarkunAttachment?: Maybe<KarkunType>;
  addIssuanceFormAttachment?: Maybe<IssuanceForm>;
  addMehfilKarkun?: Maybe<MehfilKarkunType>;
  addPurchaseFormAttachment?: Maybe<PurchaseForm>;
  approveAllSalaries?: Maybe<Scalars['Int']['output']>;
  approveIssuanceForms?: Maybe<Array<Maybe<IssuanceForm>>>;
  approvePurchaseForms?: Maybe<Array<Maybe<PurchaseForm>>>;
  approveSalaries?: Maybe<Scalars['Int']['output']>;
  approveStockAdjustments?: Maybe<Array<Maybe<StockAdjustment>>>;
  cancelVisitorStay?: Maybe<VisitorStayType>;
  createAttachment?: Maybe<Attachment>;
  createAttendances?: Maybe<Scalars['Int']['output']>;
  createCity?: Maybe<CityType>;
  createCityMehfil?: Maybe<CityMehfilType>;
  createDuty?: Maybe<DutyType>;
  createDutyLocation?: Maybe<DutyLocationType>;
  createDutyShift?: Maybe<DutyShiftType>;
  createHrKarkun?: Maybe<KarkunType>;
  createIssuanceForm?: Maybe<IssuanceForm>;
  createItemCategory?: Maybe<ItemCategory>;
  createJob?: Maybe<JobType>;
  createKarkunDuty?: Maybe<KarkunDutyType>;
  createLocation?: Maybe<Location>;
  createMehfil?: Maybe<MehfilType>;
  createPhysicalStore?: Maybe<PhysicalStore>;
  createPurchaseForm?: Maybe<PurchaseForm>;
  createSalaries?: Maybe<Scalars['Int']['output']>;
  createSecurityMehfilDuty?: Maybe<MehfilDutyType>;
  createSecurityMehfilLangarDish?: Maybe<MehfilLangarDishType>;
  createSecurityMehfilLangarLocation?: Maybe<MehfilLangarLocationType>;
  createSecurityVisitor?: Maybe<VisitorType>;
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
  removeHrKarkunAttachment?: Maybe<KarkunType>;
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
  resetPassword?: Maybe<UserType>;
  setDutyDetail?: Maybe<Array<Maybe<MehfilKarkunType>>>;
  setGroups?: Maybe<UserType>;
  setHrKarkunEmploymentInfo?: Maybe<KarkunType>;
  setHrKarkunProfileImage?: Maybe<KarkunType>;
  setHrKarkunWazaifAndRaabta?: Maybe<KarkunType>;
  setInstanceAccess?: Maybe<UserType>;
  setPermissions?: Maybe<UserType>;
  setSecurityUserPermissions?: Maybe<UserType>;
  setSecurityVisitorImage?: Maybe<VisitorType>;
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
  updateHrKarkun?: Maybe<KarkunType>;
  updateIssuanceForm?: Maybe<IssuanceForm>;
  updateItemCategory?: Maybe<ItemCategory>;
  updateJob?: Maybe<JobType>;
  updateKarkunDuty?: Maybe<KarkunDutyType>;
  updateLastActiveTime?: Maybe<Scalars['Int']['output']>;
  updateLocation?: Maybe<Location>;
  updateLoginTime?: Maybe<Scalars['Int']['output']>;
  updateMehfil?: Maybe<MehfilType>;
  updatePhysicalStore?: Maybe<PhysicalStore>;
  updatePurchaseForm?: Maybe<PurchaseForm>;
  updateSalary?: Maybe<SalaryType>;
  updateSecurityMehfilDuty?: Maybe<MehfilDutyType>;
  updateSecurityMehfilLangarDish?: Maybe<MehfilLangarDishType>;
  updateSecurityMehfilLangarLocation?: Maybe<MehfilLangarLocationType>;
  updateSecurityVisitor?: Maybe<VisitorType>;
  updateSecurityVisitorNotes?: Maybe<VisitorType>;
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


export type MutationApproveAllSalariesArgs = {
  month: Scalars['String']['input'];
};


export type MutationApproveIssuanceFormsArgs = {
  _ids: Array<InputMaybe<Scalars['String']['input']>>;
  physicalStoreId: Scalars['String']['input'];
};


export type MutationApprovePurchaseFormsArgs = {
  _ids: Array<InputMaybe<Scalars['String']['input']>>;
  physicalStoreId: Scalars['String']['input'];
};


export type MutationApproveSalariesArgs = {
  ids: Array<InputMaybe<Scalars['String']['input']>>;
  month: Scalars['String']['input'];
};


export type MutationApproveStockAdjustmentsArgs = {
  _ids: Array<InputMaybe<Scalars['String']['input']>>;
  physicalStoreId: Scalars['String']['input'];
};


export type MutationCancelVisitorStayArgs = {
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


export type MutationResetPasswordArgs = {
  userName: Scalars['String']['input'];
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


export type MutationSetPermissionsArgs = {
  permissions: Array<InputMaybe<Scalars['String']['input']>>;
  userId: Scalars['String']['input'];
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

export type PagedImdadRequestType = {
  __typename?: 'PagedImdadRequestType';
  data?: Maybe<Array<Maybe<ImdadRequestType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedIssuanceForm = {
  __typename?: 'PagedIssuanceForm';
  data?: Maybe<Array<Maybe<IssuanceForm>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export type PagedKarkunType = {
  __typename?: 'PagedKarkunType';
  karkuns?: Maybe<Array<Maybe<KarkunType>>>;
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
  data?: Maybe<Array<Maybe<VisitorType>>>;
  totalResults?: Maybe<Scalars['Int']['output']>;
};

export enum Permission {
  AdminManageCities = 'ADMIN_MANAGE_CITIES',
  AdminManagePhysicalStores = 'ADMIN_MANAGE_PHYSICAL_STORES',
  AdminManageUsersAndGroups = 'ADMIN_MANAGE_USERS_AND_GROUPS',
  AdminViewUsersAndGroups = 'ADMIN_VIEW_USERS_AND_GROUPS',
  HrApproveSalaries = 'HR_APPROVE_SALARIES',
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
  city?: InputMaybe<Scalars['String']['input']>;
  cnicNumber?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pageIndex?: InputMaybe<Scalars['String']['input']>;
  pageSize?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
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
  contactNumber1Subscribed?: Maybe<Scalars['Boolean']['output']>;
  contactNumber2?: Maybe<Scalars['String']['output']>;
  contactNumber2Subscribed?: Maybe<Scalars['Boolean']['output']>;
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
};

export type PersonType = {
  __typename?: 'PersonType';
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
  refPurchasedBy?: Maybe<KarkunType>;
  refReceivedBy?: Maybe<KarkunType>;
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
  allJobs?: Maybe<Array<Maybe<JobType>>>;
  allMSDuties?: Maybe<Array<Maybe<DutyType>>>;
  allMehfilDuties?: Maybe<Array<Maybe<DutyType>>>;
  allMehfils?: Maybe<Array<Maybe<MehfilType>>>;
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
  distinctCities?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  distinctCountries?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  distinctRegions?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  distinctStayAllowedBy?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  dutyById?: Maybe<DutyType>;
  dutyLocationById?: Maybe<DutyLocationType>;
  dutyShiftById?: Maybe<DutyShiftType>;
  dutyShiftsByDutyId?: Maybe<Array<Maybe<DutyShiftType>>>;
  hrKarkunById?: Maybe<KarkunType>;
  hrKarkunsById?: Maybe<Array<Maybe<KarkunType>>>;
  inventoryStatistics?: Maybe<InventoryStatistics>;
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
  pagedHrAuditLogs?: Maybe<PagedAuditLogType>;
  pagedHrKarkuns?: Maybe<PagedKarkunType>;
  pagedIssuanceForms?: Maybe<PagedIssuanceForm>;
  pagedPeople?: Maybe<PagedPeopleType>;
  pagedPurchaseForms?: Maybe<PagedPurchaseForm>;
  pagedSalariesByKarkun?: Maybe<PagedSalaryType>;
  pagedSecurityAuditLogs?: Maybe<PagedAuditLogType>;
  pagedSecurityUsers?: Maybe<PagedUserType>;
  pagedSecurityVisitors?: Maybe<PagedVisitorType>;
  pagedStockAdjustments?: Maybe<PagedStockAdjustment>;
  pagedStockItems?: Maybe<PagedStockItem>;
  pagedUserGroups?: Maybe<PagedUserGroupType>;
  pagedUsers?: Maybe<PagedUserType>;
  pagedVisitorStays?: Maybe<PagedVisitorStayType>;
  pagedVisitorStaysByVisitorId?: Maybe<PagedVisitorStayType>;
  pagedVisitors?: Maybe<PagedVisitorType>;
  physicalStoreById?: Maybe<PhysicalStore>;
  purchaseFormById?: Maybe<PurchaseForm>;
  purchaseFormsByMonth?: Maybe<Array<Maybe<PurchaseForm>>>;
  purchaseFormsByStockItem?: Maybe<Array<Maybe<PurchaseForm>>>;
  salariesByIds?: Maybe<Array<Maybe<SalaryType>>>;
  salariesByMonth?: Maybe<Array<Maybe<SalaryType>>>;
  securityMehfilDutyById?: Maybe<MehfilDutyType>;
  securityMehfilLangarDishById?: Maybe<MehfilLangarDishType>;
  securityMehfilLangarLocationById?: Maybe<MehfilLangarLocationType>;
  securityVisitorByCnic?: Maybe<VisitorType>;
  securityVisitorByCnicOrContactNumber?: Maybe<VisitorType>;
  securityVisitorById?: Maybe<VisitorType>;
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


export type QueryPagedVisitorsArgs = {
  filter?: InputMaybe<VisitorFilter>;
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
  approver?: Maybe<KarkunType>;
  arrears?: Maybe<Scalars['Int']['output']>;
  closingLoan?: Maybe<Scalars['Int']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  job?: Maybe<JobType>;
  jobId?: Maybe<Scalars['String']['output']>;
  karkun?: Maybe<KarkunType>;
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
  refAdjustedBy?: Maybe<KarkunType>;
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
  karkun?: Maybe<KarkunType>;
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
  refVisitor?: Maybe<VisitorType>;
  shiftId?: Maybe<Scalars['String']['output']>;
  shiftName?: Maybe<Scalars['String']['output']>;
  stayAllowedBy?: Maybe<Scalars['String']['output']>;
  stayReason?: Maybe<Scalars['String']['output']>;
  toDate?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
  visitorId?: Maybe<Scalars['String']['output']>;
};

export type VisitorType = {
  __typename?: 'VisitorType';
  _id?: Maybe<Scalars['String']['output']>;
  birthDate?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  cnicNumber?: Maybe<Scalars['String']['output']>;
  contactNumber1?: Maybe<Scalars['String']['output']>;
  contactNumber1Subscribed?: Maybe<Scalars['Boolean']['output']>;
  contactNumber2?: Maybe<Scalars['String']['output']>;
  contactNumber2Subscribed?: Maybe<Scalars['Boolean']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<Scalars['String']['output']>;
  criminalRecord?: Maybe<Scalars['String']['output']>;
  currentAddress?: Maybe<Scalars['String']['output']>;
  dataSource?: Maybe<Scalars['String']['output']>;
  educationalQualification?: Maybe<Scalars['String']['output']>;
  ehadDate?: Maybe<Scalars['String']['output']>;
  image?: Maybe<Attachment>;
  imageId?: Maybe<Scalars['String']['output']>;
  isKarkun?: Maybe<Scalars['Boolean']['output']>;
  karkunId?: Maybe<Scalars['String']['output']>;
  meansOfEarning?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  otherNotes?: Maybe<Scalars['String']['output']>;
  parentName?: Maybe<Scalars['String']['output']>;
  permanentAddress?: Maybe<Scalars['String']['output']>;
  referenceName?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<Scalars['String']['output']>;
};

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
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

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
  ApprovedImdadType: ResolverTypeWrapper<ApprovedImdadType>;
  Attachment: ResolverTypeWrapper<Attachment>;
  AttendanceType: ResolverTypeWrapper<AttendanceType>;
  AuditLogFilter: AuditLogFilter;
  AuditLogType: ResolverTypeWrapper<AuditLogType>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CityFilter: CityFilter;
  CityMehfilType: ResolverTypeWrapper<CityMehfilType>;
  CityType: ResolverTypeWrapper<CityType>;
  Currency: ResolverTypeWrapper<Scalars['Currency']['output']>;
  Date: ResolverTypeWrapper<Scalars['Date']['output']>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  DutyLocationType: ResolverTypeWrapper<DutyLocationType>;
  DutyShiftType: ResolverTypeWrapper<DutyShiftType>;
  DutyType: ResolverTypeWrapper<DutyType>;
  EmailAddress: ResolverTypeWrapper<Scalars['EmailAddress']['output']>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ImdadRequestFilter: ImdadRequestFilter;
  ImdadRequestType: ResolverTypeWrapper<ImdadRequestType>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  InventoryStatistics: ResolverTypeWrapper<InventoryStatistics>;
  IssuanceForm: ResolverTypeWrapper<IssuanceForm>;
  ItemCategory: ResolverTypeWrapper<ItemCategory>;
  ItemWithQuantity: ResolverTypeWrapper<ItemWithQuantity>;
  ItemWithQuantityAndPrice: ResolverTypeWrapper<ItemWithQuantityAndPrice>;
  ItemWithQuantityAndPriceInput: ItemWithQuantityAndPriceInput;
  ItemWithQuantityInput: ItemWithQuantityInput;
  JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
  JSONObject: ResolverTypeWrapper<Scalars['JSONObject']['output']>;
  JobType: ResolverTypeWrapper<JobType>;
  KarkunDutyType: ResolverTypeWrapper<KarkunDutyType>;
  KarkunFilter: KarkunFilter;
  KarkunType: ResolverTypeWrapper<KarkunType>;
  KarkunUserType: ResolverTypeWrapper<KarkunUserType>;
  Location: ResolverTypeWrapper<Location>;
  MehfilDutyType: ResolverTypeWrapper<MehfilDutyType>;
  MehfilKarkunType: ResolverTypeWrapper<MehfilKarkunType>;
  MehfilLangarDishType: ResolverTypeWrapper<MehfilLangarDishType>;
  MehfilLangarLocationType: ResolverTypeWrapper<MehfilLangarLocationType>;
  MehfilType: ResolverTypeWrapper<MehfilType>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  PagedAttendanceType: ResolverTypeWrapper<PagedAttendanceType>;
  PagedAuditLogType: ResolverTypeWrapper<PagedAuditLogType>;
  PagedCityType: ResolverTypeWrapper<PagedCityType>;
  PagedImdadRequestType: ResolverTypeWrapper<PagedImdadRequestType>;
  PagedIssuanceForm: ResolverTypeWrapper<PagedIssuanceForm>;
  PagedKarkunType: ResolverTypeWrapper<PagedKarkunType>;
  PagedPeopleType: ResolverTypeWrapper<PagedPeopleType>;
  PagedPurchaseForm: ResolverTypeWrapper<PagedPurchaseForm>;
  PagedSalaryType: ResolverTypeWrapper<PagedSalaryType>;
  PagedSecurityLogType: ResolverTypeWrapper<PagedSecurityLogType>;
  PagedStockAdjustment: ResolverTypeWrapper<PagedStockAdjustment>;
  PagedStockItem: ResolverTypeWrapper<PagedStockItem>;
  PagedUserGroupType: ResolverTypeWrapper<PagedUserGroupType>;
  PagedUserType: ResolverTypeWrapper<PagedUserType>;
  PagedVisitorStayType: ResolverTypeWrapper<PagedVisitorStayType>;
  PagedVisitorType: ResolverTypeWrapper<PagedVisitorType>;
  Permission: Permission;
  PersonEmployeeDataType: ResolverTypeWrapper<PersonEmployeeDataType>;
  PersonFilter: PersonFilter;
  PersonKarkunDataType: ResolverTypeWrapper<PersonKarkunDataType>;
  PersonSharedDataType: ResolverTypeWrapper<PersonSharedDataType>;
  PersonType: ResolverTypeWrapper<PersonType>;
  PersonVisitorDataType: ResolverTypeWrapper<PersonVisitorDataType>;
  PhoneNumber: ResolverTypeWrapper<Scalars['PhoneNumber']['output']>;
  PhysicalStore: ResolverTypeWrapper<PhysicalStore>;
  PostalCode: ResolverTypeWrapper<Scalars['PostalCode']['output']>;
  PurchaseForm: ResolverTypeWrapper<PurchaseForm>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  SalaryType: ResolverTypeWrapper<SalaryType>;
  SecurityLogFilter: SecurityLogFilter;
  SecurityLogType: ResolverTypeWrapper<SecurityLogType>;
  StockAdjustment: ResolverTypeWrapper<StockAdjustment>;
  StockItem: ResolverTypeWrapper<StockItem>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Time: ResolverTypeWrapper<Scalars['Time']['output']>;
  Timestamp: ResolverTypeWrapper<Scalars['Timestamp']['output']>;
  URL: ResolverTypeWrapper<Scalars['URL']['output']>;
  UserFilter: UserFilter;
  UserGroupType: ResolverTypeWrapper<UserGroupType>;
  UserType: ResolverTypeWrapper<UserType>;
  UtcOffset: ResolverTypeWrapper<Scalars['UtcOffset']['output']>;
  Vendor: ResolverTypeWrapper<Vendor>;
  VisitorFilter: VisitorFilter;
  VisitorStayType: ResolverTypeWrapper<VisitorStayType>;
  VisitorType: ResolverTypeWrapper<VisitorType>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  ApprovedImdadType: ApprovedImdadType;
  Attachment: Attachment;
  AttendanceType: AttendanceType;
  AuditLogFilter: AuditLogFilter;
  AuditLogType: AuditLogType;
  Boolean: Scalars['Boolean']['output'];
  CityFilter: CityFilter;
  CityMehfilType: CityMehfilType;
  CityType: CityType;
  Currency: Scalars['Currency']['output'];
  Date: Scalars['Date']['output'];
  DateTime: Scalars['DateTime']['output'];
  DutyLocationType: DutyLocationType;
  DutyShiftType: DutyShiftType;
  DutyType: DutyType;
  EmailAddress: Scalars['EmailAddress']['output'];
  Float: Scalars['Float']['output'];
  ImdadRequestFilter: ImdadRequestFilter;
  ImdadRequestType: ImdadRequestType;
  Int: Scalars['Int']['output'];
  InventoryStatistics: InventoryStatistics;
  IssuanceForm: IssuanceForm;
  ItemCategory: ItemCategory;
  ItemWithQuantity: ItemWithQuantity;
  ItemWithQuantityAndPrice: ItemWithQuantityAndPrice;
  ItemWithQuantityAndPriceInput: ItemWithQuantityAndPriceInput;
  ItemWithQuantityInput: ItemWithQuantityInput;
  JSON: Scalars['JSON']['output'];
  JSONObject: Scalars['JSONObject']['output'];
  JobType: JobType;
  KarkunDutyType: KarkunDutyType;
  KarkunFilter: KarkunFilter;
  KarkunType: KarkunType;
  KarkunUserType: KarkunUserType;
  Location: Location;
  MehfilDutyType: MehfilDutyType;
  MehfilKarkunType: MehfilKarkunType;
  MehfilLangarDishType: MehfilLangarDishType;
  MehfilLangarLocationType: MehfilLangarLocationType;
  MehfilType: MehfilType;
  Mutation: Record<PropertyKey, never>;
  PagedAttendanceType: PagedAttendanceType;
  PagedAuditLogType: PagedAuditLogType;
  PagedCityType: PagedCityType;
  PagedImdadRequestType: PagedImdadRequestType;
  PagedIssuanceForm: PagedIssuanceForm;
  PagedKarkunType: PagedKarkunType;
  PagedPeopleType: PagedPeopleType;
  PagedPurchaseForm: PagedPurchaseForm;
  PagedSalaryType: PagedSalaryType;
  PagedSecurityLogType: PagedSecurityLogType;
  PagedStockAdjustment: PagedStockAdjustment;
  PagedStockItem: PagedStockItem;
  PagedUserGroupType: PagedUserGroupType;
  PagedUserType: PagedUserType;
  PagedVisitorStayType: PagedVisitorStayType;
  PagedVisitorType: PagedVisitorType;
  PersonEmployeeDataType: PersonEmployeeDataType;
  PersonFilter: PersonFilter;
  PersonKarkunDataType: PersonKarkunDataType;
  PersonSharedDataType: PersonSharedDataType;
  PersonType: PersonType;
  PersonVisitorDataType: PersonVisitorDataType;
  PhoneNumber: Scalars['PhoneNumber']['output'];
  PhysicalStore: PhysicalStore;
  PostalCode: Scalars['PostalCode']['output'];
  PurchaseForm: PurchaseForm;
  Query: Record<PropertyKey, never>;
  SalaryType: SalaryType;
  SecurityLogFilter: SecurityLogFilter;
  SecurityLogType: SecurityLogType;
  StockAdjustment: StockAdjustment;
  StockItem: StockItem;
  String: Scalars['String']['output'];
  Time: Scalars['Time']['output'];
  Timestamp: Scalars['Timestamp']['output'];
  URL: Scalars['URL']['output'];
  UserFilter: UserFilter;
  UserGroupType: UserGroupType;
  UserType: UserType;
  UtcOffset: Scalars['UtcOffset']['output'];
  Vendor: Vendor;
  VisitorFilter: VisitorFilter;
  VisitorStayType: VisitorStayType;
  VisitorType: VisitorType;
}>;

export type CheckInstanceAccessDirectiveArgs = {
  dataFieldName?: Maybe<Scalars['String']['input']>;
  instanceIdArgName?: Maybe<Scalars['String']['input']>;
  returnType?: Maybe<Scalars['String']['input']>;
};

export type CheckInstanceAccessDirectiveResolver<Result, Parent, ContextType = any, Args = CheckInstanceAccessDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type CheckPermissionsDirectiveArgs = {
  dataFieldName?: Maybe<Scalars['String']['input']>;
  permissions?: Maybe<Array<Maybe<Scalars['String']['input']>>>;
};

export type CheckPermissionsDirectiveResolver<Result, Parent, ContextType = any, Args = CheckPermissionsDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type ApprovedImdadTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['ApprovedImdadType'] = ResolversParentTypes['ApprovedImdadType']> = ResolversObject<{
  fixedRecurringFuel?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fixedRecurringHouseRent?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fixedRecurringMedical?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fixedRecurringMilk?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fixedRecurringMonthlyPayment?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fixedRecurringSchoolFee?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fixedRecurringWeeklyPayment?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fromMonth?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  oneOffHouseConstruction?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  oneOffMarriageExpense?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  oneOffMedical?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  oneOffMiscPayment?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  ration?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  toMonth?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  variableRecurringMedical?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  variableRecurringUtilityBills?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type AttachmentResolvers<ContextType = any, ParentType extends ResolversParentTypes['Attachment'] = ResolversParentTypes['Attachment']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  data?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mimeType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type AttendanceTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['AttendanceType'] = ResolversParentTypes['AttendanceType']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  absentCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  attendanceDetails?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdByName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  duty?: Resolver<Maybe<ResolversTypes['DutyType']>, ParentType, ContextType>;
  dutyId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  job?: Resolver<Maybe<ResolversTypes['JobType']>, ParentType, ContextType>;
  jobId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  karkun?: Resolver<Maybe<ResolversTypes['KarkunType']>, ParentType, ContextType>;
  karkunId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  meetingCardBarcodeId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  month?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  percentage?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  presentCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  shift?: Resolver<Maybe<ResolversTypes['DutyShiftType']>, ParentType, ContextType>;
  shiftId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedByName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type AuditLogTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['AuditLogType'] = ResolversParentTypes['AuditLogType']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  auditValues?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  entityId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  entityType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operationBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operationByImageId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operationByName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operationTime?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operationType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type CityMehfilTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['CityMehfilType'] = ResolversParentTypes['CityMehfilType']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cityId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  karkunCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  lcdAvailability?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  mehfilStartYear?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  otherMehfilDetails?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tabAvailability?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  timingDetails?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type CityTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['CityType'] = ResolversParentTypes['CityType']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  country?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  karkunCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  mehfils?: Resolver<Maybe<Array<Maybe<ResolversTypes['CityMehfilType']>>>, ParentType, ContextType>;
  memberCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  peripheryOf?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  peripheryOfCity?: Resolver<Maybe<ResolversTypes['CityType']>, ParentType, ContextType>;
  region?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  usedCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type DutyShiftTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DutyShiftType'] = ResolversParentTypes['DutyShiftType']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  attendanceSheet?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  canDelete?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  duty?: Resolver<Maybe<ResolversTypes['DutyType']>, ParentType, ContextType>;
  dutyId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  endTime?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  startTime?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type DutyTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['DutyType'] = ResolversParentTypes['DutyType']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  attendanceSheet?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  canDelete?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isMehfilDuty?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  shifts?: Resolver<Maybe<Array<Maybe<ResolversTypes['DutyShiftType']>>>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  usedCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export interface EmailAddressScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['EmailAddress'], any> {
  name: 'EmailAddress';
}

export type ImdadRequestTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['ImdadRequestType'] = ResolversParentTypes['ImdadRequestType']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  approvedImdad?: Resolver<Maybe<ResolversTypes['ApprovedImdadType']>, ParentType, ContextType>;
  attachmentIds?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  attachments?: Resolver<Maybe<Array<Maybe<ResolversTypes['Attachment']>>>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dataSource?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imdadReasonId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  requestDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  visitor?: Resolver<Maybe<ResolversTypes['VisitorType']>, ParentType, ContextType>;
  visitorId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type InventoryStatisticsResolvers<ContextType = any, ParentType extends ResolversParentTypes['InventoryStatistics'] = ResolversParentTypes['InventoryStatistics']> = ResolversObject<{
  itemsVerifiedLessThanThreeMonthsAgo?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  itemsVerifiedMoreThanSixMonthsAgo?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  itemsVerifiedThreeToSixMonthsAgo?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  itemsWithImages?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  itemsWithLessThanMinStockLevel?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  itemsWithNegativeStockLevel?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  itemsWithPositiveStockLevel?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  itemsWithoutImages?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  physicalStoreId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type IssuanceFormResolvers<ContextType = any, ParentType extends ResolversParentTypes['IssuanceForm'] = ResolversParentTypes['IssuanceForm']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  approvedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  approvedOn?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  attachmentIds?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  attachments?: Resolver<Maybe<Array<Maybe<ResolversTypes['Attachment']>>>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  handedOverTo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  issueDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  issuedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  issuedTo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  items?: Resolver<Maybe<Array<Maybe<ResolversTypes['ItemWithQuantity']>>>, ParentType, ContextType>;
  locationId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  physicalStoreId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  refIssuedBy?: Resolver<Maybe<ResolversTypes['KarkunType']>, ParentType, ContextType>;
  refIssuedTo?: Resolver<Maybe<ResolversTypes['KarkunType']>, ParentType, ContextType>;
  refLocation?: Resolver<Maybe<ResolversTypes['Location']>, ParentType, ContextType>;
  refPhysicalStore?: Resolver<Maybe<ResolversTypes['PhysicalStore']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type ItemCategoryResolvers<ContextType = any, ParentType extends ResolversParentTypes['ItemCategory'] = ResolversParentTypes['ItemCategory']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  physicalStoreId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stockItemCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type ItemWithQuantityResolvers<ContextType = any, ParentType extends ResolversParentTypes['ItemWithQuantity'] = ResolversParentTypes['ItemWithQuantity']> = ResolversObject<{
  isInflow?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  quantity?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  refStockItem?: Resolver<Maybe<ResolversTypes['StockItem']>, ParentType, ContextType>;
  stockItemId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type ItemWithQuantityAndPriceResolvers<ContextType = any, ParentType extends ResolversParentTypes['ItemWithQuantityAndPrice'] = ResolversParentTypes['ItemWithQuantityAndPrice']> = ResolversObject<{
  isInflow?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  price?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  quantity?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  refStockItem?: Resolver<Maybe<ResolversTypes['StockItem']>, ParentType, ContextType>;
  stockItemId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export interface JsonObjectScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSONObject'], any> {
  name: 'JSONObject';
}

export type JobTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['JobType'] = ResolversParentTypes['JobType']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  usedCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type KarkunDutyTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['KarkunDutyType'] = ResolversParentTypes['KarkunDutyType']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  daysOfWeek?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  duty?: Resolver<Maybe<ResolversTypes['DutyType']>, ParentType, ContextType>;
  dutyId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dutyName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  karkunId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  location?: Resolver<Maybe<ResolversTypes['DutyLocationType']>, ParentType, ContextType>;
  locationId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  locationName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  role?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  shift?: Resolver<Maybe<ResolversTypes['DutyShiftType']>, ParentType, ContextType>;
  shiftId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  shiftName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type KarkunTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['KarkunType'] = ResolversParentTypes['KarkunType']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  attachmentIds?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  attachments?: Resolver<Maybe<Array<Maybe<ResolversTypes['Attachment']>>>, ParentType, ContextType>;
  bankAccountDetails?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  birthDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  bloodGroup?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  city?: Resolver<Maybe<ResolversTypes['CityType']>, ParentType, ContextType>;
  cityId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cityMehfil?: Resolver<Maybe<ResolversTypes['CityMehfilType']>, ParentType, ContextType>;
  cityMehfilId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cnicNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber1?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber1Subscribed?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  contactNumber2?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber2Subscribed?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  currentAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deathDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  duties?: Resolver<Maybe<Array<Maybe<ResolversTypes['KarkunDutyType']>>>, ParentType, ContextType>;
  educationalQualification?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ehadDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ehadKarkun?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  ehadPermissionDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emailAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  employmentEndDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  employmentStartDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['Attachment']>, ParentType, ContextType>;
  imageId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isEmployee?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  job?: Resolver<Maybe<ResolversTypes['JobType']>, ParentType, ContextType>;
  jobId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastTarteebDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  meansOfEarning?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mehfilRaabta?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  msLastVisitDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  msRaabta?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  parentName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  permanentAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  referenceName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['KarkunUserType']>, ParentType, ContextType>;
}>;

export type KarkunUserTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['KarkunUserType'] = ResolversParentTypes['KarkunUserType']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  displayName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emailVerified?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  groups?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  instances?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  lastActiveAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastLoggedInAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  locked?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  permissions?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  username?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type LocationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Location'] = ResolversParentTypes['Location']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isInUse?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  parentId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  physicalStoreId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  refParent?: Resolver<Maybe<ResolversTypes['Location']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type MehfilDutyTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MehfilDutyType'] = ResolversParentTypes['MehfilDutyType']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mehfilUsedCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  overallUsedCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  urduName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type MehfilKarkunTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MehfilKarkunType'] = ResolversParentTypes['MehfilKarkunType']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  duty?: Resolver<Maybe<ResolversTypes['MehfilDutyType']>, ParentType, ContextType>;
  dutyCardBarcodeId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dutyDetail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dutyId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  karkun?: Resolver<Maybe<ResolversTypes['PersonType']>, ParentType, ContextType>;
  karkunId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mehfil?: Resolver<Maybe<ResolversTypes['MehfilType']>, ParentType, ContextType>;
  mehfilId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type MehfilLangarDishTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MehfilLangarDishType'] = ResolversParentTypes['MehfilLangarDishType']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  overallUsedCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  urduName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type MehfilLangarLocationTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MehfilLangarLocationType'] = ResolversParentTypes['MehfilLangarLocationType']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  overallUsedCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  urduName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type MehfilTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MehfilType'] = ResolversParentTypes['MehfilType']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  karkunCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  mehfilDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mehfilKarkuns?: Resolver<Maybe<ResolversTypes['MehfilKarkunType']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  addHrKarkunAttachment?: Resolver<Maybe<ResolversTypes['KarkunType']>, ParentType, ContextType, RequireFields<MutationAddHrKarkunAttachmentArgs, '_id' | 'attachmentId'>>;
  addIssuanceFormAttachment?: Resolver<Maybe<ResolversTypes['IssuanceForm']>, ParentType, ContextType, RequireFields<MutationAddIssuanceFormAttachmentArgs, '_id' | 'attachmentId' | 'physicalStoreId'>>;
  addMehfilKarkun?: Resolver<Maybe<ResolversTypes['MehfilKarkunType']>, ParentType, ContextType, RequireFields<MutationAddMehfilKarkunArgs, 'dutyId' | 'karkunId' | 'mehfilId'>>;
  addPurchaseFormAttachment?: Resolver<Maybe<ResolversTypes['PurchaseForm']>, ParentType, ContextType, RequireFields<MutationAddPurchaseFormAttachmentArgs, '_id' | 'attachmentId' | 'physicalStoreId'>>;
  approveAllSalaries?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationApproveAllSalariesArgs, 'month'>>;
  approveIssuanceForms?: Resolver<Maybe<Array<Maybe<ResolversTypes['IssuanceForm']>>>, ParentType, ContextType, RequireFields<MutationApproveIssuanceFormsArgs, '_ids' | 'physicalStoreId'>>;
  approvePurchaseForms?: Resolver<Maybe<Array<Maybe<ResolversTypes['PurchaseForm']>>>, ParentType, ContextType, RequireFields<MutationApprovePurchaseFormsArgs, '_ids' | 'physicalStoreId'>>;
  approveSalaries?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationApproveSalariesArgs, 'ids' | 'month'>>;
  approveStockAdjustments?: Resolver<Maybe<Array<Maybe<ResolversTypes['StockAdjustment']>>>, ParentType, ContextType, RequireFields<MutationApproveStockAdjustmentsArgs, '_ids' | 'physicalStoreId'>>;
  cancelVisitorStay?: Resolver<Maybe<ResolversTypes['VisitorStayType']>, ParentType, ContextType, RequireFields<MutationCancelVisitorStayArgs, '_id'>>;
  createAttachment?: Resolver<Maybe<ResolversTypes['Attachment']>, ParentType, ContextType, RequireFields<MutationCreateAttachmentArgs, 'data'>>;
  createAttendances?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationCreateAttendancesArgs, 'month'>>;
  createCity?: Resolver<Maybe<ResolversTypes['CityType']>, ParentType, ContextType, RequireFields<MutationCreateCityArgs, 'country' | 'name'>>;
  createCityMehfil?: Resolver<Maybe<ResolversTypes['CityMehfilType']>, ParentType, ContextType, RequireFields<MutationCreateCityMehfilArgs, 'cityId' | 'name'>>;
  createDuty?: Resolver<Maybe<ResolversTypes['DutyType']>, ParentType, ContextType, RequireFields<MutationCreateDutyArgs, 'isMehfilDuty' | 'name'>>;
  createDutyLocation?: Resolver<Maybe<ResolversTypes['DutyLocationType']>, ParentType, ContextType, RequireFields<MutationCreateDutyLocationArgs, 'name'>>;
  createDutyShift?: Resolver<Maybe<ResolversTypes['DutyShiftType']>, ParentType, ContextType, RequireFields<MutationCreateDutyShiftArgs, 'dutyId' | 'name'>>;
  createHrKarkun?: Resolver<Maybe<ResolversTypes['KarkunType']>, ParentType, ContextType, RequireFields<MutationCreateHrKarkunArgs, 'name'>>;
  createIssuanceForm?: Resolver<Maybe<ResolversTypes['IssuanceForm']>, ParentType, ContextType, RequireFields<MutationCreateIssuanceFormArgs, 'issueDate' | 'issuedBy' | 'issuedTo' | 'physicalStoreId'>>;
  createItemCategory?: Resolver<Maybe<ResolversTypes['ItemCategory']>, ParentType, ContextType, RequireFields<MutationCreateItemCategoryArgs, 'name' | 'physicalStoreId'>>;
  createJob?: Resolver<Maybe<ResolversTypes['JobType']>, ParentType, ContextType, RequireFields<MutationCreateJobArgs, 'name'>>;
  createKarkunDuty?: Resolver<Maybe<ResolversTypes['KarkunDutyType']>, ParentType, ContextType, RequireFields<MutationCreateKarkunDutyArgs, 'dutyId' | 'karkunId'>>;
  createLocation?: Resolver<Maybe<ResolversTypes['Location']>, ParentType, ContextType, RequireFields<MutationCreateLocationArgs, 'name' | 'physicalStoreId'>>;
  createMehfil?: Resolver<Maybe<ResolversTypes['MehfilType']>, ParentType, ContextType, RequireFields<MutationCreateMehfilArgs, 'mehfilDate' | 'name'>>;
  createPhysicalStore?: Resolver<Maybe<ResolversTypes['PhysicalStore']>, ParentType, ContextType, RequireFields<MutationCreatePhysicalStoreArgs, 'name'>>;
  createPurchaseForm?: Resolver<Maybe<ResolversTypes['PurchaseForm']>, ParentType, ContextType, RequireFields<MutationCreatePurchaseFormArgs, 'physicalStoreId' | 'purchaseDate' | 'purchasedBy' | 'receivedBy'>>;
  createSalaries?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationCreateSalariesArgs, 'month'>>;
  createSecurityMehfilDuty?: Resolver<Maybe<ResolversTypes['MehfilDutyType']>, ParentType, ContextType, RequireFields<MutationCreateSecurityMehfilDutyArgs, 'name' | 'urduName'>>;
  createSecurityMehfilLangarDish?: Resolver<Maybe<ResolversTypes['MehfilLangarDishType']>, ParentType, ContextType, RequireFields<MutationCreateSecurityMehfilLangarDishArgs, 'name' | 'urduName'>>;
  createSecurityMehfilLangarLocation?: Resolver<Maybe<ResolversTypes['MehfilLangarLocationType']>, ParentType, ContextType, RequireFields<MutationCreateSecurityMehfilLangarLocationArgs, 'name' | 'urduName'>>;
  createSecurityVisitor?: Resolver<Maybe<ResolversTypes['VisitorType']>, ParentType, ContextType, RequireFields<MutationCreateSecurityVisitorArgs, 'ehadDate' | 'name' | 'parentName' | 'referenceName'>>;
  createStockAdjustment?: Resolver<Maybe<ResolversTypes['StockAdjustment']>, ParentType, ContextType, RequireFields<MutationCreateStockAdjustmentArgs, 'adjustedBy' | 'adjustmentDate' | 'isInflow' | 'physicalStoreId' | 'quantity' | 'stockItemId'>>;
  createStockItem?: Resolver<Maybe<ResolversTypes['StockItem']>, ParentType, ContextType, RequireFields<MutationCreateStockItemArgs, 'categoryId' | 'name' | 'physicalStoreId' | 'unitOfMeasurement'>>;
  createUser?: Resolver<Maybe<ResolversTypes['UserType']>, ParentType, ContextType, Partial<MutationCreateUserArgs>>;
  createUserGroup?: Resolver<Maybe<ResolversTypes['UserGroupType']>, ParentType, ContextType, RequireFields<MutationCreateUserGroupArgs, 'moduleName' | 'name'>>;
  createVendor?: Resolver<Maybe<ResolversTypes['Vendor']>, ParentType, ContextType, RequireFields<MutationCreateVendorArgs, 'name' | 'physicalStoreId'>>;
  createVisitorStay?: Resolver<Maybe<ResolversTypes['VisitorStayType']>, ParentType, ContextType, RequireFields<MutationCreateVisitorStayArgs, 'numOfDays' | 'visitorId'>>;
  deleteAllAttendances?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteAllAttendancesArgs, 'month'>>;
  deleteAllSalaries?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteAllSalariesArgs, 'month'>>;
  deleteAttendances?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteAttendancesArgs, 'ids' | 'month'>>;
  deleteHrKarkun?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteHrKarkunArgs, '_id'>>;
  deleteSalaries?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteSalariesArgs, 'ids' | 'month'>>;
  deleteSecurityVisitor?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteSecurityVisitorArgs, '_id'>>;
  deleteUserGroup?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteUserGroupArgs, '_id'>>;
  deleteVisitorStay?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationDeleteVisitorStayArgs, '_id'>>;
  fixCitySpelling?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationFixCitySpellingArgs, 'existingSpelling' | 'newSpelling'>>;
  fixNameSpelling?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationFixNameSpellingArgs, 'existingSpelling' | 'newSpelling'>>;
  importAttendances?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationImportAttendancesArgs, 'dutyId' | 'month'>>;
  importSecurityVisitorsCsvData?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationImportSecurityVisitorsCsvDataArgs, 'csvData'>>;
  mergeStockItems?: Resolver<Maybe<ResolversTypes['StockItem']>, ParentType, ContextType, RequireFields<MutationMergeStockItemsArgs, '_idToKeep' | '_idsToMerge' | 'physicalStoreId'>>;
  recalculateStockLevels?: Resolver<Maybe<Array<Maybe<ResolversTypes['StockItem']>>>, ParentType, ContextType, RequireFields<MutationRecalculateStockLevelsArgs, '_ids' | 'physicalStoreId'>>;
  registerUser?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationRegisterUserArgs, 'displayName' | 'email'>>;
  removeCity?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationRemoveCityArgs, '_id'>>;
  removeCityMehfil?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationRemoveCityMehfilArgs, '_id'>>;
  removeDuty?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationRemoveDutyArgs, '_id'>>;
  removeDutyLocation?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationRemoveDutyLocationArgs, '_id'>>;
  removeDutyShift?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationRemoveDutyShiftArgs, '_id'>>;
  removeHrKarkunAttachment?: Resolver<Maybe<ResolversTypes['KarkunType']>, ParentType, ContextType, RequireFields<MutationRemoveHrKarkunAttachmentArgs, '_id' | 'attachmentId'>>;
  removeIssuanceFormAttachment?: Resolver<Maybe<ResolversTypes['IssuanceForm']>, ParentType, ContextType, RequireFields<MutationRemoveIssuanceFormAttachmentArgs, '_id' | 'attachmentId' | 'physicalStoreId'>>;
  removeIssuanceForms?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationRemoveIssuanceFormsArgs, '_ids' | 'physicalStoreId'>>;
  removeItemCategory?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationRemoveItemCategoryArgs, '_id' | 'physicalStoreId'>>;
  removeJob?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationRemoveJobArgs, '_id'>>;
  removeKarkunDuty?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationRemoveKarkunDutyArgs, '_id'>>;
  removeLocation?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationRemoveLocationArgs, '_id' | 'physicalStoreId'>>;
  removeMehfil?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationRemoveMehfilArgs, '_id'>>;
  removeMehfilKarkun?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationRemoveMehfilKarkunArgs, '_id'>>;
  removePurchaseFormAttachment?: Resolver<Maybe<ResolversTypes['PurchaseForm']>, ParentType, ContextType, RequireFields<MutationRemovePurchaseFormAttachmentArgs, '_id' | 'attachmentId' | 'physicalStoreId'>>;
  removePurchaseForms?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationRemovePurchaseFormsArgs, '_ids' | 'physicalStoreId'>>;
  removeSecurityMehfilDuty?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationRemoveSecurityMehfilDutyArgs, '_id'>>;
  removeSecurityMehfilLangarDish?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationRemoveSecurityMehfilLangarDishArgs, '_id'>>;
  removeSecurityMehfilLangarLocation?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationRemoveSecurityMehfilLangarLocationArgs, '_id'>>;
  removeStockAdjustments?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationRemoveStockAdjustmentsArgs, '_ids' | 'physicalStoreId'>>;
  removeStockItem?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationRemoveStockItemArgs, '_id' | 'physicalStoreId'>>;
  removeVendor?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, RequireFields<MutationRemoveVendorArgs, '_id' | 'physicalStoreId'>>;
  resetPassword?: Resolver<Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<MutationResetPasswordArgs, 'userName'>>;
  setDutyDetail?: Resolver<Maybe<Array<Maybe<ResolversTypes['MehfilKarkunType']>>>, ParentType, ContextType, RequireFields<MutationSetDutyDetailArgs, 'ids'>>;
  setGroups?: Resolver<Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<MutationSetGroupsArgs, 'groups' | 'userId'>>;
  setHrKarkunEmploymentInfo?: Resolver<Maybe<ResolversTypes['KarkunType']>, ParentType, ContextType, RequireFields<MutationSetHrKarkunEmploymentInfoArgs, '_id' | 'isEmployee'>>;
  setHrKarkunProfileImage?: Resolver<Maybe<ResolversTypes['KarkunType']>, ParentType, ContextType, RequireFields<MutationSetHrKarkunProfileImageArgs, '_id' | 'imageId'>>;
  setHrKarkunWazaifAndRaabta?: Resolver<Maybe<ResolversTypes['KarkunType']>, ParentType, ContextType, RequireFields<MutationSetHrKarkunWazaifAndRaabtaArgs, '_id'>>;
  setInstanceAccess?: Resolver<Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<MutationSetInstanceAccessArgs, 'instances' | 'userId'>>;
  setPermissions?: Resolver<Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<MutationSetPermissionsArgs, 'permissions' | 'userId'>>;
  setSecurityUserPermissions?: Resolver<Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<MutationSetSecurityUserPermissionsArgs, 'permissions' | 'userId'>>;
  setSecurityVisitorImage?: Resolver<Maybe<ResolversTypes['VisitorType']>, ParentType, ContextType, RequireFields<MutationSetSecurityVisitorImageArgs, '_id' | 'imageId'>>;
  setStockItemImage?: Resolver<Maybe<ResolversTypes['StockItem']>, ParentType, ContextType, RequireFields<MutationSetStockItemImageArgs, '_id' | 'imageId' | 'physicalStoreId'>>;
  setUserGroupInstanceAccess?: Resolver<Maybe<ResolversTypes['UserGroupType']>, ParentType, ContextType, RequireFields<MutationSetUserGroupInstanceAccessArgs, '_id' | 'instances'>>;
  setUserGroupPermissions?: Resolver<Maybe<ResolversTypes['UserGroupType']>, ParentType, ContextType, RequireFields<MutationSetUserGroupPermissionsArgs, '_id' | 'permissions'>>;
  updateAttachment?: Resolver<Maybe<ResolversTypes['Attachment']>, ParentType, ContextType, RequireFields<MutationUpdateAttachmentArgs, '_id'>>;
  updateAttendance?: Resolver<Maybe<ResolversTypes['AttendanceType']>, ParentType, ContextType, RequireFields<MutationUpdateAttendanceArgs, '_id'>>;
  updateCity?: Resolver<Maybe<ResolversTypes['CityType']>, ParentType, ContextType, RequireFields<MutationUpdateCityArgs, '_id' | 'country' | 'name'>>;
  updateCityMehfil?: Resolver<Maybe<ResolversTypes['CityMehfilType']>, ParentType, ContextType, RequireFields<MutationUpdateCityMehfilArgs, '_id' | 'cityId' | 'name'>>;
  updateDuty?: Resolver<Maybe<ResolversTypes['DutyType']>, ParentType, ContextType, RequireFields<MutationUpdateDutyArgs, 'id' | 'name'>>;
  updateDutyLocation?: Resolver<Maybe<ResolversTypes['DutyLocationType']>, ParentType, ContextType, RequireFields<MutationUpdateDutyLocationArgs, 'id' | 'name'>>;
  updateDutyShift?: Resolver<Maybe<ResolversTypes['DutyShiftType']>, ParentType, ContextType, RequireFields<MutationUpdateDutyShiftArgs, '_id' | 'dutyId' | 'name'>>;
  updateHrKarkun?: Resolver<Maybe<ResolversTypes['KarkunType']>, ParentType, ContextType, RequireFields<MutationUpdateHrKarkunArgs, '_id' | 'name'>>;
  updateIssuanceForm?: Resolver<Maybe<ResolversTypes['IssuanceForm']>, ParentType, ContextType, RequireFields<MutationUpdateIssuanceFormArgs, '_id' | 'issueDate' | 'issuedBy' | 'issuedTo' | 'physicalStoreId'>>;
  updateItemCategory?: Resolver<Maybe<ResolversTypes['ItemCategory']>, ParentType, ContextType, RequireFields<MutationUpdateItemCategoryArgs, '_id' | 'name' | 'physicalStoreId'>>;
  updateJob?: Resolver<Maybe<ResolversTypes['JobType']>, ParentType, ContextType, RequireFields<MutationUpdateJobArgs, 'id' | 'name'>>;
  updateKarkunDuty?: Resolver<Maybe<ResolversTypes['KarkunDutyType']>, ParentType, ContextType, RequireFields<MutationUpdateKarkunDutyArgs, '_id' | 'dutyId' | 'karkunId'>>;
  updateLastActiveTime?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updateLocation?: Resolver<Maybe<ResolversTypes['Location']>, ParentType, ContextType, RequireFields<MutationUpdateLocationArgs, '_id' | 'name' | 'physicalStoreId'>>;
  updateLoginTime?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updateMehfil?: Resolver<Maybe<ResolversTypes['MehfilType']>, ParentType, ContextType, RequireFields<MutationUpdateMehfilArgs, '_id' | 'name'>>;
  updatePhysicalStore?: Resolver<Maybe<ResolversTypes['PhysicalStore']>, ParentType, ContextType, RequireFields<MutationUpdatePhysicalStoreArgs, 'id' | 'name'>>;
  updatePurchaseForm?: Resolver<Maybe<ResolversTypes['PurchaseForm']>, ParentType, ContextType, RequireFields<MutationUpdatePurchaseFormArgs, '_id' | 'physicalStoreId' | 'purchaseDate' | 'purchasedBy' | 'receivedBy'>>;
  updateSalary?: Resolver<Maybe<ResolversTypes['SalaryType']>, ParentType, ContextType, RequireFields<MutationUpdateSalaryArgs, '_id'>>;
  updateSecurityMehfilDuty?: Resolver<Maybe<ResolversTypes['MehfilDutyType']>, ParentType, ContextType, RequireFields<MutationUpdateSecurityMehfilDutyArgs, 'id' | 'name' | 'urduName'>>;
  updateSecurityMehfilLangarDish?: Resolver<Maybe<ResolversTypes['MehfilLangarDishType']>, ParentType, ContextType, RequireFields<MutationUpdateSecurityMehfilLangarDishArgs, 'id' | 'name' | 'urduName'>>;
  updateSecurityMehfilLangarLocation?: Resolver<Maybe<ResolversTypes['MehfilLangarLocationType']>, ParentType, ContextType, RequireFields<MutationUpdateSecurityMehfilLangarLocationArgs, 'id' | 'name' | 'urduName'>>;
  updateSecurityVisitor?: Resolver<Maybe<ResolversTypes['VisitorType']>, ParentType, ContextType, RequireFields<MutationUpdateSecurityVisitorArgs, '_id' | 'ehadDate' | 'name' | 'parentName' | 'referenceName'>>;
  updateSecurityVisitorNotes?: Resolver<Maybe<ResolversTypes['VisitorType']>, ParentType, ContextType, RequireFields<MutationUpdateSecurityVisitorNotesArgs, '_id'>>;
  updateStockAdjustment?: Resolver<Maybe<ResolversTypes['StockAdjustment']>, ParentType, ContextType, RequireFields<MutationUpdateStockAdjustmentArgs, '_id' | 'adjustedBy' | 'adjustmentDate' | 'isInflow' | 'physicalStoreId' | 'quantity'>>;
  updateStockItem?: Resolver<Maybe<ResolversTypes['StockItem']>, ParentType, ContextType, RequireFields<MutationUpdateStockItemArgs, '_id' | 'categoryId' | 'name' | 'physicalStoreId' | 'unitOfMeasurement'>>;
  updateUser?: Resolver<Maybe<ResolversTypes['UserType']>, ParentType, ContextType, RequireFields<MutationUpdateUserArgs, 'userId'>>;
  updateUserGroup?: Resolver<Maybe<ResolversTypes['UserGroupType']>, ParentType, ContextType, RequireFields<MutationUpdateUserGroupArgs, '_id'>>;
  updateVendor?: Resolver<Maybe<ResolversTypes['Vendor']>, ParentType, ContextType, RequireFields<MutationUpdateVendorArgs, '_id' | 'physicalStoreId'>>;
  updateVisitorStay?: Resolver<Maybe<ResolversTypes['VisitorStayType']>, ParentType, ContextType, RequireFields<MutationUpdateVisitorStayArgs, '_id' | 'fromDate' | 'toDate'>>;
  verifyStockItemLevel?: Resolver<Maybe<ResolversTypes['StockItem']>, ParentType, ContextType, RequireFields<MutationVerifyStockItemLevelArgs, '_id' | 'physicalStoreId'>>;
}>;

export type PagedAttendanceTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedAttendanceType'] = ResolversParentTypes['PagedAttendanceType']> = ResolversObject<{
  data?: Resolver<Maybe<Array<Maybe<ResolversTypes['AttendanceType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedAuditLogTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedAuditLogType'] = ResolversParentTypes['PagedAuditLogType']> = ResolversObject<{
  data?: Resolver<Maybe<Array<Maybe<ResolversTypes['AuditLogType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedCityTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedCityType'] = ResolversParentTypes['PagedCityType']> = ResolversObject<{
  data?: Resolver<Maybe<Array<Maybe<ResolversTypes['CityType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedImdadRequestTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedImdadRequestType'] = ResolversParentTypes['PagedImdadRequestType']> = ResolversObject<{
  data?: Resolver<Maybe<Array<Maybe<ResolversTypes['ImdadRequestType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedIssuanceFormResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedIssuanceForm'] = ResolversParentTypes['PagedIssuanceForm']> = ResolversObject<{
  data?: Resolver<Maybe<Array<Maybe<ResolversTypes['IssuanceForm']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedKarkunTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedKarkunType'] = ResolversParentTypes['PagedKarkunType']> = ResolversObject<{
  karkuns?: Resolver<Maybe<Array<Maybe<ResolversTypes['KarkunType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedPeopleTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedPeopleType'] = ResolversParentTypes['PagedPeopleType']> = ResolversObject<{
  data?: Resolver<Maybe<Array<Maybe<ResolversTypes['PersonType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedPurchaseFormResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedPurchaseForm'] = ResolversParentTypes['PagedPurchaseForm']> = ResolversObject<{
  data?: Resolver<Maybe<Array<Maybe<ResolversTypes['PurchaseForm']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedSalaryTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedSalaryType'] = ResolversParentTypes['PagedSalaryType']> = ResolversObject<{
  salaries?: Resolver<Maybe<Array<Maybe<ResolversTypes['SalaryType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedSecurityLogTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedSecurityLogType'] = ResolversParentTypes['PagedSecurityLogType']> = ResolversObject<{
  data?: Resolver<Maybe<Array<Maybe<ResolversTypes['SecurityLogType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedStockAdjustmentResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedStockAdjustment'] = ResolversParentTypes['PagedStockAdjustment']> = ResolversObject<{
  data?: Resolver<Maybe<Array<Maybe<ResolversTypes['StockAdjustment']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedStockItemResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedStockItem'] = ResolversParentTypes['PagedStockItem']> = ResolversObject<{
  data?: Resolver<Maybe<Array<Maybe<ResolversTypes['StockItem']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedUserGroupTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedUserGroupType'] = ResolversParentTypes['PagedUserGroupType']> = ResolversObject<{
  data?: Resolver<Maybe<Array<Maybe<ResolversTypes['UserGroupType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedUserTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedUserType'] = ResolversParentTypes['PagedUserType']> = ResolversObject<{
  data?: Resolver<Maybe<Array<Maybe<ResolversTypes['UserType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedVisitorStayTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedVisitorStayType'] = ResolversParentTypes['PagedVisitorStayType']> = ResolversObject<{
  data?: Resolver<Maybe<Array<Maybe<ResolversTypes['VisitorStayType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PagedVisitorTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PagedVisitorType'] = ResolversParentTypes['PagedVisitorType']> = ResolversObject<{
  data?: Resolver<Maybe<Array<Maybe<ResolversTypes['VisitorType']>>>, ParentType, ContextType>;
  totalResults?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type PersonEmployeeDataTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PersonEmployeeDataType'] = ResolversParentTypes['PersonEmployeeDataType']> = ResolversObject<{
  bankAccountDetails?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  employmentEndDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  employmentStartDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  job?: Resolver<Maybe<ResolversTypes['JobType']>, ParentType, ContextType>;
  jobId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type PersonKarkunDataTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PersonKarkunDataType'] = ResolversParentTypes['PersonKarkunDataType']> = ResolversObject<{
  attachmentIds?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  attachments?: Resolver<Maybe<Array<Maybe<ResolversTypes['Attachment']>>>, ParentType, ContextType>;
  city?: Resolver<Maybe<ResolversTypes['CityType']>, ParentType, ContextType>;
  cityId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cityMehfil?: Resolver<Maybe<ResolversTypes['CityMehfilType']>, ParentType, ContextType>;
  cityMehfilId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  duties?: Resolver<Maybe<Array<Maybe<ResolversTypes['KarkunDutyType']>>>, ParentType, ContextType>;
  ehadKarkun?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  ehadPermissionDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastTarteebDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mehfilRaabta?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  msLastVisitDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  msRaabta?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type PersonSharedDataTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PersonSharedDataType'] = ResolversParentTypes['PersonSharedDataType']> = ResolversObject<{
  birthDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  bloodGroup?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cnicNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber1?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber1Subscribed?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  contactNumber2?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber2Subscribed?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  currentAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deathDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  educationalQualification?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ehadDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emailAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['Attachment']>, ParentType, ContextType>;
  imageId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  meansOfEarning?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  parentName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  permanentAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  referenceName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type PersonTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PersonType'] = ResolversParentTypes['PersonType']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dataSource?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  employeeData?: Resolver<Maybe<ResolversTypes['PersonEmployeeDataType']>, ParentType, ContextType>;
  isEmployee?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isKarkun?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isVisitor?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  karkunData?: Resolver<Maybe<ResolversTypes['PersonKarkunDataType']>, ParentType, ContextType>;
  sharedData?: Resolver<Maybe<ResolversTypes['PersonSharedDataType']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  visitorData?: Resolver<Maybe<ResolversTypes['PersonVisitorDataType']>, ParentType, ContextType>;
}>;

export type PersonVisitorDataTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['PersonVisitorDataType'] = ResolversParentTypes['PersonVisitorDataType']> = ResolversObject<{
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  country?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  criminalRecord?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  otherNotes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export interface PhoneNumberScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['PhoneNumber'], any> {
  name: 'PhoneNumber';
}

export type PhysicalStoreResolvers<ContextType = any, ParentType extends ResolversParentTypes['PhysicalStore'] = ResolversParentTypes['PhysicalStore']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export interface PostalCodeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['PostalCode'], any> {
  name: 'PostalCode';
}

export type PurchaseFormResolvers<ContextType = any, ParentType extends ResolversParentTypes['PurchaseForm'] = ResolversParentTypes['PurchaseForm']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  approvedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  approvedOn?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  attachmentIds?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  attachments?: Resolver<Maybe<Array<Maybe<ResolversTypes['Attachment']>>>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  items?: Resolver<Maybe<Array<Maybe<ResolversTypes['ItemWithQuantityAndPrice']>>>, ParentType, ContextType>;
  locationId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  physicalStoreId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  purchaseDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  purchasedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  receivedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  refLocation?: Resolver<Maybe<ResolversTypes['Location']>, ParentType, ContextType>;
  refPhysicalStore?: Resolver<Maybe<ResolversTypes['PhysicalStore']>, ParentType, ContextType>;
  refPurchasedBy?: Resolver<Maybe<ResolversTypes['KarkunType']>, ParentType, ContextType>;
  refReceivedBy?: Resolver<Maybe<ResolversTypes['KarkunType']>, ParentType, ContextType>;
  refVendor?: Resolver<Maybe<ResolversTypes['Vendor']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  vendorId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  allAccessiblePhysicalStores?: Resolver<Maybe<Array<Maybe<ResolversTypes['PhysicalStore']>>>, ParentType, ContextType>;
  allCities?: Resolver<Maybe<Array<Maybe<ResolversTypes['CityType']>>>, ParentType, ContextType>;
  allCityMehfils?: Resolver<Maybe<Array<Maybe<ResolversTypes['CityMehfilType']>>>, ParentType, ContextType>;
  allDutyLocations?: Resolver<Maybe<Array<Maybe<ResolversTypes['DutyLocationType']>>>, ParentType, ContextType>;
  allDutyShifts?: Resolver<Maybe<Array<Maybe<ResolversTypes['DutyShiftType']>>>, ParentType, ContextType>;
  allJobs?: Resolver<Maybe<Array<Maybe<ResolversTypes['JobType']>>>, ParentType, ContextType>;
  allMSDuties?: Resolver<Maybe<Array<Maybe<ResolversTypes['DutyType']>>>, ParentType, ContextType>;
  allMehfilDuties?: Resolver<Maybe<Array<Maybe<ResolversTypes['DutyType']>>>, ParentType, ContextType>;
  allMehfils?: Resolver<Maybe<Array<Maybe<ResolversTypes['MehfilType']>>>, ParentType, ContextType>;
  allPhysicalStores?: Resolver<Maybe<Array<Maybe<ResolversTypes['PhysicalStore']>>>, ParentType, ContextType>;
  allSecurityMehfilDuties?: Resolver<Maybe<Array<Maybe<ResolversTypes['MehfilDutyType']>>>, ParentType, ContextType, Partial<QueryAllSecurityMehfilDutiesArgs>>;
  allSecurityMehfilLangarDishes?: Resolver<Maybe<Array<Maybe<ResolversTypes['MehfilLangarDishType']>>>, ParentType, ContextType>;
  allSecurityMehfilLangarLocations?: Resolver<Maybe<Array<Maybe<ResolversTypes['MehfilLangarLocationType']>>>, ParentType, ContextType>;
  attachmentsById?: Resolver<Maybe<Array<Maybe<ResolversTypes['Attachment']>>>, ParentType, ContextType, RequireFields<QueryAttachmentsByIdArgs, 'ids'>>;
  attendanceByBarcodeId?: Resolver<Maybe<ResolversTypes['AttendanceType']>, ParentType, ContextType, RequireFields<QueryAttendanceByBarcodeIdArgs, 'barcodeId'>>;
  attendanceByBarcodeIds?: Resolver<Maybe<Array<Maybe<ResolversTypes['AttendanceType']>>>, ParentType, ContextType, RequireFields<QueryAttendanceByBarcodeIdsArgs, 'barcodeIds'>>;
  attendanceById?: Resolver<Maybe<ResolversTypes['AttendanceType']>, ParentType, ContextType, RequireFields<QueryAttendanceByIdArgs, '_id'>>;
  attendanceByMonth?: Resolver<Maybe<Array<Maybe<ResolversTypes['AttendanceType']>>>, ParentType, ContextType, RequireFields<QueryAttendanceByMonthArgs, 'month'>>;
  cityById?: Resolver<Maybe<ResolversTypes['CityType']>, ParentType, ContextType, RequireFields<QueryCityByIdArgs, '_id'>>;
  cityMehfilById?: Resolver<Maybe<ResolversTypes['CityMehfilType']>, ParentType, ContextType, RequireFields<QueryCityMehfilByIdArgs, '_id'>>;
  cityMehfilsByCityId?: Resolver<Maybe<Array<Maybe<ResolversTypes['CityMehfilType']>>>, ParentType, ContextType, RequireFields<QueryCityMehfilsByCityIdArgs, 'cityId'>>;
  currentUser?: Resolver<Maybe<ResolversTypes['UserType']>, ParentType, ContextType>;
  distinctCities?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  distinctCountries?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  distinctRegions?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  distinctStayAllowedBy?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  dutyById?: Resolver<Maybe<ResolversTypes['DutyType']>, ParentType, ContextType, RequireFields<QueryDutyByIdArgs, 'id'>>;
  dutyLocationById?: Resolver<Maybe<ResolversTypes['DutyLocationType']>, ParentType, ContextType, RequireFields<QueryDutyLocationByIdArgs, 'id'>>;
  dutyShiftById?: Resolver<Maybe<ResolversTypes['DutyShiftType']>, ParentType, ContextType, RequireFields<QueryDutyShiftByIdArgs, 'id'>>;
  dutyShiftsByDutyId?: Resolver<Maybe<Array<Maybe<ResolversTypes['DutyShiftType']>>>, ParentType, ContextType, RequireFields<QueryDutyShiftsByDutyIdArgs, 'dutyId'>>;
  hrKarkunById?: Resolver<Maybe<ResolversTypes['KarkunType']>, ParentType, ContextType, RequireFields<QueryHrKarkunByIdArgs, '_id'>>;
  hrKarkunsById?: Resolver<Maybe<Array<Maybe<ResolversTypes['KarkunType']>>>, ParentType, ContextType, RequireFields<QueryHrKarkunsByIdArgs, '_ids'>>;
  inventoryStatistics?: Resolver<Maybe<ResolversTypes['InventoryStatistics']>, ParentType, ContextType, RequireFields<QueryInventoryStatisticsArgs, 'physicalStoreId'>>;
  issuanceFormById?: Resolver<Maybe<ResolversTypes['IssuanceForm']>, ParentType, ContextType, RequireFields<QueryIssuanceFormByIdArgs, '_id' | 'physicalStoreId'>>;
  issuanceFormsByMonth?: Resolver<Maybe<Array<Maybe<ResolversTypes['IssuanceForm']>>>, ParentType, ContextType, RequireFields<QueryIssuanceFormsByMonthArgs, 'month' | 'physicalStoreId'>>;
  issuanceFormsByStockItem?: Resolver<Maybe<Array<Maybe<ResolversTypes['IssuanceForm']>>>, ParentType, ContextType, RequireFields<QueryIssuanceFormsByStockItemArgs, 'physicalStoreId' | 'stockItemId'>>;
  itemCategoriesByPhysicalStoreId?: Resolver<Maybe<Array<Maybe<ResolversTypes['ItemCategory']>>>, ParentType, ContextType, RequireFields<QueryItemCategoriesByPhysicalStoreIdArgs, 'physicalStoreId'>>;
  itemCategoryById?: Resolver<Maybe<ResolversTypes['ItemCategory']>, ParentType, ContextType, RequireFields<QueryItemCategoryByIdArgs, '_id' | 'physicalStoreId'>>;
  jobById?: Resolver<Maybe<ResolversTypes['JobType']>, ParentType, ContextType, RequireFields<QueryJobByIdArgs, 'id'>>;
  karkunDutiesByKarkunId?: Resolver<Maybe<Array<Maybe<ResolversTypes['KarkunDutyType']>>>, ParentType, ContextType, RequireFields<QueryKarkunDutiesByKarkunIdArgs, 'karkunId'>>;
  karkunDutyById?: Resolver<Maybe<ResolversTypes['KarkunDutyType']>, ParentType, ContextType, RequireFields<QueryKarkunDutyByIdArgs, '_id'>>;
  locationById?: Resolver<Maybe<ResolversTypes['Location']>, ParentType, ContextType, RequireFields<QueryLocationByIdArgs, '_id' | 'physicalStoreId'>>;
  locationsByPhysicalStoreId?: Resolver<Maybe<Array<Maybe<ResolversTypes['Location']>>>, ParentType, ContextType, RequireFields<QueryLocationsByPhysicalStoreIdArgs, 'physicalStoreId'>>;
  mehfilById?: Resolver<Maybe<ResolversTypes['MehfilType']>, ParentType, ContextType, RequireFields<QueryMehfilByIdArgs, '_id'>>;
  mehfilKarkunByBarcodeId?: Resolver<Maybe<ResolversTypes['MehfilKarkunType']>, ParentType, ContextType, RequireFields<QueryMehfilKarkunByBarcodeIdArgs, 'barcode'>>;
  mehfilKarkunsByIds?: Resolver<Maybe<Array<Maybe<ResolversTypes['MehfilKarkunType']>>>, ParentType, ContextType, RequireFields<QueryMehfilKarkunsByIdsArgs, 'ids'>>;
  mehfilKarkunsByMehfilId?: Resolver<Maybe<Array<Maybe<ResolversTypes['MehfilKarkunType']>>>, ParentType, ContextType, RequireFields<QueryMehfilKarkunsByMehfilIdArgs, 'mehfilId'>>;
  pagedAttendanceByKarkun?: Resolver<Maybe<ResolversTypes['PagedAttendanceType']>, ParentType, ContextType, Partial<QueryPagedAttendanceByKarkunArgs>>;
  pagedCities?: Resolver<Maybe<ResolversTypes['PagedCityType']>, ParentType, ContextType, Partial<QueryPagedCitiesArgs>>;
  pagedHrAuditLogs?: Resolver<Maybe<ResolversTypes['PagedAuditLogType']>, ParentType, ContextType, Partial<QueryPagedHrAuditLogsArgs>>;
  pagedHrKarkuns?: Resolver<Maybe<ResolversTypes['PagedKarkunType']>, ParentType, ContextType, Partial<QueryPagedHrKarkunsArgs>>;
  pagedIssuanceForms?: Resolver<Maybe<ResolversTypes['PagedIssuanceForm']>, ParentType, ContextType, RequireFields<QueryPagedIssuanceFormsArgs, 'physicalStoreId'>>;
  pagedPeople?: Resolver<Maybe<ResolversTypes['PagedPeopleType']>, ParentType, ContextType, Partial<QueryPagedPeopleArgs>>;
  pagedPurchaseForms?: Resolver<Maybe<ResolversTypes['PagedPurchaseForm']>, ParentType, ContextType, RequireFields<QueryPagedPurchaseFormsArgs, 'physicalStoreId'>>;
  pagedSalariesByKarkun?: Resolver<Maybe<ResolversTypes['PagedSalaryType']>, ParentType, ContextType, Partial<QueryPagedSalariesByKarkunArgs>>;
  pagedSecurityAuditLogs?: Resolver<Maybe<ResolversTypes['PagedAuditLogType']>, ParentType, ContextType, Partial<QueryPagedSecurityAuditLogsArgs>>;
  pagedSecurityUsers?: Resolver<Maybe<ResolversTypes['PagedUserType']>, ParentType, ContextType, Partial<QueryPagedSecurityUsersArgs>>;
  pagedSecurityVisitors?: Resolver<Maybe<ResolversTypes['PagedVisitorType']>, ParentType, ContextType, Partial<QueryPagedSecurityVisitorsArgs>>;
  pagedStockAdjustments?: Resolver<Maybe<ResolversTypes['PagedStockAdjustment']>, ParentType, ContextType, RequireFields<QueryPagedStockAdjustmentsArgs, 'physicalStoreId'>>;
  pagedStockItems?: Resolver<Maybe<ResolversTypes['PagedStockItem']>, ParentType, ContextType, RequireFields<QueryPagedStockItemsArgs, 'physicalStoreId'>>;
  pagedUserGroups?: Resolver<Maybe<ResolversTypes['PagedUserGroupType']>, ParentType, ContextType, Partial<QueryPagedUserGroupsArgs>>;
  pagedUsers?: Resolver<Maybe<ResolversTypes['PagedUserType']>, ParentType, ContextType, Partial<QueryPagedUsersArgs>>;
  pagedVisitorStays?: Resolver<Maybe<ResolversTypes['PagedVisitorStayType']>, ParentType, ContextType, RequireFields<QueryPagedVisitorStaysArgs, 'queryString'>>;
  pagedVisitorStaysByVisitorId?: Resolver<Maybe<ResolversTypes['PagedVisitorStayType']>, ParentType, ContextType, RequireFields<QueryPagedVisitorStaysByVisitorIdArgs, 'visitorId'>>;
  pagedVisitors?: Resolver<Maybe<ResolversTypes['PagedVisitorType']>, ParentType, ContextType, Partial<QueryPagedVisitorsArgs>>;
  physicalStoreById?: Resolver<Maybe<ResolversTypes['PhysicalStore']>, ParentType, ContextType, RequireFields<QueryPhysicalStoreByIdArgs, 'id'>>;
  purchaseFormById?: Resolver<Maybe<ResolversTypes['PurchaseForm']>, ParentType, ContextType, RequireFields<QueryPurchaseFormByIdArgs, '_id' | 'physicalStoreId'>>;
  purchaseFormsByMonth?: Resolver<Maybe<Array<Maybe<ResolversTypes['PurchaseForm']>>>, ParentType, ContextType, RequireFields<QueryPurchaseFormsByMonthArgs, 'month' | 'physicalStoreId'>>;
  purchaseFormsByStockItem?: Resolver<Maybe<Array<Maybe<ResolversTypes['PurchaseForm']>>>, ParentType, ContextType, RequireFields<QueryPurchaseFormsByStockItemArgs, 'physicalStoreId' | 'stockItemId'>>;
  salariesByIds?: Resolver<Maybe<Array<Maybe<ResolversTypes['SalaryType']>>>, ParentType, ContextType, RequireFields<QuerySalariesByIdsArgs, 'ids'>>;
  salariesByMonth?: Resolver<Maybe<Array<Maybe<ResolversTypes['SalaryType']>>>, ParentType, ContextType, RequireFields<QuerySalariesByMonthArgs, 'month'>>;
  securityMehfilDutyById?: Resolver<Maybe<ResolversTypes['MehfilDutyType']>, ParentType, ContextType, RequireFields<QuerySecurityMehfilDutyByIdArgs, 'id'>>;
  securityMehfilLangarDishById?: Resolver<Maybe<ResolversTypes['MehfilLangarDishType']>, ParentType, ContextType, RequireFields<QuerySecurityMehfilLangarDishByIdArgs, 'id'>>;
  securityMehfilLangarLocationById?: Resolver<Maybe<ResolversTypes['MehfilLangarLocationType']>, ParentType, ContextType, RequireFields<QuerySecurityMehfilLangarLocationByIdArgs, 'id'>>;
  securityVisitorByCnic?: Resolver<Maybe<ResolversTypes['VisitorType']>, ParentType, ContextType, RequireFields<QuerySecurityVisitorByCnicArgs, 'cnicNumbers'>>;
  securityVisitorByCnicOrContactNumber?: Resolver<Maybe<ResolversTypes['VisitorType']>, ParentType, ContextType, Partial<QuerySecurityVisitorByCnicOrContactNumberArgs>>;
  securityVisitorById?: Resolver<Maybe<ResolversTypes['VisitorType']>, ParentType, ContextType, RequireFields<QuerySecurityVisitorByIdArgs, '_id'>>;
  stockAdjustmentById?: Resolver<Maybe<ResolversTypes['StockAdjustment']>, ParentType, ContextType, RequireFields<QueryStockAdjustmentByIdArgs, '_id' | 'physicalStoreId'>>;
  stockAdjustmentsByStockItem?: Resolver<Maybe<Array<Maybe<ResolversTypes['StockAdjustment']>>>, ParentType, ContextType, RequireFields<QueryStockAdjustmentsByStockItemArgs, 'physicalStoreId' | 'stockItemId'>>;
  stockItemById?: Resolver<Maybe<ResolversTypes['StockItem']>, ParentType, ContextType, RequireFields<QueryStockItemByIdArgs, '_id' | 'physicalStoreId'>>;
  stockItemsById?: Resolver<Maybe<Array<Maybe<ResolversTypes['StockItem']>>>, ParentType, ContextType, RequireFields<QueryStockItemsByIdArgs, '_ids' | 'physicalStoreId'>>;
  userById?: Resolver<Maybe<ResolversTypes['UserType']>, ParentType, ContextType, Partial<QueryUserByIdArgs>>;
  userGroupById?: Resolver<Maybe<ResolversTypes['UserGroupType']>, ParentType, ContextType, RequireFields<QueryUserGroupByIdArgs, '_id'>>;
  userNames?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType, Partial<QueryUserNamesArgs>>;
  vendorById?: Resolver<Maybe<ResolversTypes['Vendor']>, ParentType, ContextType, RequireFields<QueryVendorByIdArgs, '_id' | 'physicalStoreId'>>;
  vendorsByPhysicalStoreId?: Resolver<Maybe<Array<Maybe<ResolversTypes['Vendor']>>>, ParentType, ContextType, RequireFields<QueryVendorsByPhysicalStoreIdArgs, 'physicalStoreId'>>;
  visitorStayById?: Resolver<Maybe<ResolversTypes['VisitorStayType']>, ParentType, ContextType, RequireFields<QueryVisitorStayByIdArgs, '_id'>>;
}>;

export type SalaryTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['SalaryType'] = ResolversParentTypes['SalaryType']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  approvedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  approvedOn?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  approver?: Resolver<Maybe<ResolversTypes['KarkunType']>, ParentType, ContextType>;
  arrears?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  closingLoan?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  job?: Resolver<Maybe<ResolversTypes['JobType']>, ParentType, ContextType>;
  jobId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  karkun?: Resolver<Maybe<ResolversTypes['KarkunType']>, ParentType, ContextType>;
  karkunId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  loanDeduction?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  month?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  netPayment?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  newLoan?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  openingLoan?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  otherDeduction?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  rashanMadad?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  salary?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type SecurityLogTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['SecurityLogType'] = ResolversParentTypes['SecurityLogType']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dataSource?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dataSourceDetail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operationBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operationByImageId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operationByName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operationDetails?: Resolver<Maybe<ResolversTypes['JSONObject']>, ParentType, ContextType>;
  operationTime?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  operationType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userImageId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type StockAdjustmentResolvers<ContextType = any, ParentType extends ResolversParentTypes['StockAdjustment'] = ResolversParentTypes['StockAdjustment']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  adjustedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  adjustmentDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  adjustmentReason?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  approvedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  approvedOn?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isInflow?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  physicalStoreId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  quantity?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  refAdjustedBy?: Resolver<Maybe<ResolversTypes['KarkunType']>, ParentType, ContextType>;
  refPhysicalStore?: Resolver<Maybe<ResolversTypes['PhysicalStore']>, ParentType, ContextType>;
  refStockItem?: Resolver<Maybe<ResolversTypes['StockItem']>, ParentType, ContextType>;
  stockItemId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type StockItemResolvers<ContextType = any, ParentType extends ResolversParentTypes['StockItem'] = ResolversParentTypes['StockItem']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  categoryId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  categoryName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  company?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  currentStockLevel?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  details?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  formattedName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  issuanceFormsCount?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  minStockLevel?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  physicalStoreId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  purchaseFormsCount?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  refPhysicalStore?: Resolver<Maybe<ResolversTypes['PhysicalStore']>, ParentType, ContextType>;
  startingStockLevel?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  stockAdjustmentsCount?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  totalStockLevel?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  unitOfMeasurement?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  verifiedOn?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  instances?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  moduleName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  permissions?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
}>;

export type UserTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserType'] = ResolversParentTypes['UserType']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  displayName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emailVerified?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  groups?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  instances?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  karkun?: Resolver<Maybe<ResolversTypes['KarkunType']>, ParentType, ContextType>;
  lastActiveAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastLoggedInAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  locked?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  permissions?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  person?: Resolver<Maybe<ResolversTypes['PersonType']>, ParentType, ContextType>;
  personId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  username?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export interface UtcOffsetScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['UtcOffset'], any> {
  name: 'UtcOffset';
}

export type VendorResolvers<ContextType = any, ParentType extends ResolversParentTypes['Vendor'] = ResolversParentTypes['Vendor']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactPerson?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  physicalStoreId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  usageCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
}>;

export type VisitorStayTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['VisitorStayType'] = ResolversParentTypes['VisitorStayType']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cancelledDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dutyId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dutyName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dutyShiftName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fromDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isExpired?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isValid?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  numOfDays?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  refVisitor?: Resolver<Maybe<ResolversTypes['VisitorType']>, ParentType, ContextType>;
  shiftId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  shiftName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stayAllowedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stayReason?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  toDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  visitorId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type VisitorTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['VisitorType'] = ResolversParentTypes['VisitorType']> = ResolversObject<{
  _id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  birthDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cnicNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber1?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber1Subscribed?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  contactNumber2?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contactNumber2Subscribed?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  country?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  criminalRecord?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  currentAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dataSource?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  educationalQualification?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ehadDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['Attachment']>, ParentType, ContextType>;
  imageId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isKarkun?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  karkunId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  meansOfEarning?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  otherNotes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  parentName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  permanentAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  referenceName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  ApprovedImdadType?: ApprovedImdadTypeResolvers<ContextType>;
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
  ImdadRequestType?: ImdadRequestTypeResolvers<ContextType>;
  InventoryStatistics?: InventoryStatisticsResolvers<ContextType>;
  IssuanceForm?: IssuanceFormResolvers<ContextType>;
  ItemCategory?: ItemCategoryResolvers<ContextType>;
  ItemWithQuantity?: ItemWithQuantityResolvers<ContextType>;
  ItemWithQuantityAndPrice?: ItemWithQuantityAndPriceResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  JSONObject?: GraphQLScalarType;
  JobType?: JobTypeResolvers<ContextType>;
  KarkunDutyType?: KarkunDutyTypeResolvers<ContextType>;
  KarkunType?: KarkunTypeResolvers<ContextType>;
  KarkunUserType?: KarkunUserTypeResolvers<ContextType>;
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
  PagedImdadRequestType?: PagedImdadRequestTypeResolvers<ContextType>;
  PagedIssuanceForm?: PagedIssuanceFormResolvers<ContextType>;
  PagedKarkunType?: PagedKarkunTypeResolvers<ContextType>;
  PagedPeopleType?: PagedPeopleTypeResolvers<ContextType>;
  PagedPurchaseForm?: PagedPurchaseFormResolvers<ContextType>;
  PagedSalaryType?: PagedSalaryTypeResolvers<ContextType>;
  PagedSecurityLogType?: PagedSecurityLogTypeResolvers<ContextType>;
  PagedStockAdjustment?: PagedStockAdjustmentResolvers<ContextType>;
  PagedStockItem?: PagedStockItemResolvers<ContextType>;
  PagedUserGroupType?: PagedUserGroupTypeResolvers<ContextType>;
  PagedUserType?: PagedUserTypeResolvers<ContextType>;
  PagedVisitorStayType?: PagedVisitorStayTypeResolvers<ContextType>;
  PagedVisitorType?: PagedVisitorTypeResolvers<ContextType>;
  PersonEmployeeDataType?: PersonEmployeeDataTypeResolvers<ContextType>;
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
  VisitorType?: VisitorTypeResolvers<ContextType>;
}>;

export type DirectiveResolvers<ContextType = any> = ResolversObject<{
  checkInstanceAccess?: CheckInstanceAccessDirectiveResolver<any, any, ContextType>;
  checkPermissions?: CheckPermissionsDirectiveResolver<any, any, ContextType>;
}>;
