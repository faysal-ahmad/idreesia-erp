/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type * as Types from './graphql';

export type AuditLogFilter = {
  entityId?: string | null | undefined;
  operationBy?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
};

export type CityFilter = {
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
  peripheryOf?: string | null | undefined;
  region?: string | null | undefined;
};

export type ItemWithQuantityAndPriceInput = {
  isInflow?: boolean | null | undefined;
  price?: number | null | undefined;
  quantity?: number | null | undefined;
  stockItemId?: string | null | undefined;
};

export type ItemWithQuantityInput = {
  isInflow?: boolean | null | undefined;
  quantity?: number | null | undefined;
  stockItemId?: string | null | undefined;
};

export type JobLogsFilterType = {
  event?: string | null | undefined;
  jobName?: string | null | undefined;
  level?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
};

export type KarkunFilter = {
  attendance?: string | null | undefined;
  bloodGroup?: string | null | undefined;
  cityId?: string | null | undefined;
  cityMehfilId?: string | null | undefined;
  cnicNumber?: string | null | undefined;
  dutyId?: string | null | undefined;
  dutyShiftId?: string | null | undefined;
  ehadKarkun?: string | null | undefined;
  isEmployee?: boolean | null | undefined;
  jobId?: string | null | undefined;
  lastTarteeb?: string | null | undefined;
  name?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
  phoneNumber?: string | null | undefined;
  predefinedFilterName?: string | null | undefined;
  predefinedFilterStoreId?: string | null | undefined;
  region?: string | null | undefined;
  showEmployees?: string | null | undefined;
  showVolunteers?: string | null | undefined;
  updatedBetween?: string | null | undefined;
  userAccount?: string | null | undefined;
};

export type PersonFilter = {
  city?: string | null | undefined;
  cnicNumber?: string | null | undefined;
  name?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
  phoneNumber?: string | null | undefined;
};

export type ScheduledJobsFilterType = {
  name?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
  status?: string | null | undefined;
};

export type UserFilter = {
  moduleAccess?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
  showActive?: string | null | undefined;
  showInactive?: string | null | undefined;
  showLocked?: string | null | undefined;
  showUnlocked?: string | null | undefined;
};

export type VisitorFilter = {
  additionalInfo?: string | null | undefined;
  city?: string | null | undefined;
  cnicNumber?: string | null | undefined;
  dataSource?: string | null | undefined;
  ehadDate?: string | null | undefined;
  ehadDuration?: string | null | undefined;
  name?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
  phoneNumber?: string | null | undefined;
  updatedBetween?: string | null | undefined;
};

export type AdminAllPhysicalStoresQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminAllPhysicalStoresQuery = { allPhysicalStores: Array<{ _id: string | null, name: string | null, address: string | null } | null> | null };

export type CommonAllCitiesQueryVariables = Exact<{ [key: string]: never; }>;


export type CommonAllCitiesQuery = { allCities: Array<{ _id: string | null, name: string | null, peripheryOf: string | null, country: string | null } | null> | null };

export type CommonAllCityMehfilsQueryVariables = Exact<{ [key: string]: never; }>;


export type CommonAllCityMehfilsQuery = { allCityMehfils: Array<{ _id: string | null, cityId: string | null, name: string | null, address: string | null } | null> | null };

export type CommonCurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type CommonCurrentUserQuery = { currentUser: { _id: string | null, username: string | null, displayName: string | null, permissions: Array<string | null> | null, instances: Array<string | null> | null, karkun: { _id: string | null, name: string | null, imageId: string | null } | null } | null };

export type SecurityDistinctCitiesQueryVariables = Exact<{ [key: string]: never; }>;


export type SecurityDistinctCitiesQuery = { distinctCities: Array<string | null> | null };

export type SecurityDistinctCountriesQueryVariables = Exact<{ [key: string]: never; }>;


export type SecurityDistinctCountriesQuery = { distinctCountries: Array<string | null> | null };

export type SecurityDistinctStayAllowedByQueryVariables = Exact<{ [key: string]: never; }>;


export type SecurityDistinctStayAllowedByQuery = { distinctStayAllowedBy: Array<string | null> | null };

export type RegisterUserMutationVariables = Exact<{
  displayName: string;
  email: string;
}>;


export type RegisterUserMutation = { registerUser: number | null };

export type UpdateLastActiveTimeMutationVariables = Exact<{ [key: string]: never; }>;


export type UpdateLastActiveTimeMutation = { updateLastActiveTime: number | null };

export type UpdateLoginTimeMutationVariables = Exact<{ [key: string]: never; }>;


export type UpdateLoginTimeMutation = { updateLoginTime: number | null };

export type CityByIdQueryVariables = Exact<{
  _id: string;
}>;


export type CityByIdQuery = { cityById: { _id: string | null, name: string | null, peripheryOf: string | null, country: string | null, region: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type CityMehfilsByCityIdQueryVariables = Exact<{
  cityId: string;
}>;


export type CityMehfilsByCityIdQuery = { cityMehfilsByCityId: Array<{ _id: string | null, cityId: string | null, name: string | null, address: string | null, karkunCount: number | null, mehfilStartYear: string | null, timingDetails: string | null, lcdAvailability: boolean | null, tabAvailability: boolean | null, otherMehfilDetails: string | null } | null> | null };

export type CreateCityMehfilMutationVariables = Exact<{
  name: string;
  cityId: string;
  address?: string | null | undefined;
  mehfilStartYear?: string | null | undefined;
  timingDetails?: string | null | undefined;
  lcdAvailability?: boolean | null | undefined;
  tabAvailability?: boolean | null | undefined;
  otherMehfilDetails?: string | null | undefined;
}>;


export type CreateCityMehfilMutation = { createCityMehfil: { _id: string | null, name: string | null, cityId: string | null, address: string | null, mehfilStartYear: string | null, timingDetails: string | null, lcdAvailability: boolean | null, tabAvailability: boolean | null, otherMehfilDetails: string | null } | null };

export type CreateCityMutationVariables = Exact<{
  name: string;
  peripheryOf?: string | null | undefined;
  country: string;
  region?: string | null | undefined;
}>;


export type CreateCityMutation = { createCity: { _id: string | null, name: string | null, peripheryOf: string | null, region: string | null, country: string | null } | null };

export type PagedCitiesQueryVariables = Exact<{
  filter?: Types.CityFilter | null | undefined;
}>;


export type PagedCitiesQuery = { pagedCities: { totalResults: number | null, data: Array<{ _id: string | null, name: string | null, peripheryOf: string | null, country: string | null, region: string | null, karkunCount: number | null, memberCount: number | null, peripheryOfCity: { _id: string | null, name: string | null } | null, mehfils: Array<{ _id: string | null, name: string | null } | null> | null } | null> | null } | null };

export type RemoveCityMehfilMutationVariables = Exact<{
  _id: string;
}>;


export type RemoveCityMehfilMutation = { removeCityMehfil: number | null };

export type RemoveCityMutationVariables = Exact<{
  _id: string;
}>;


export type RemoveCityMutation = { removeCity: number | null };

export type UpdateCityMehfilMutationVariables = Exact<{
  _id: string;
  name: string;
  cityId: string;
  address?: string | null | undefined;
  mehfilStartYear?: string | null | undefined;
  timingDetails?: string | null | undefined;
  lcdAvailability?: boolean | null | undefined;
  tabAvailability?: boolean | null | undefined;
  otherMehfilDetails?: string | null | undefined;
}>;


export type UpdateCityMehfilMutation = { updateCityMehfil: { _id: string | null, name: string | null, cityId: string | null, address: string | null, mehfilStartYear: string | null, timingDetails: string | null, lcdAvailability: boolean | null, tabAvailability: boolean | null, otherMehfilDetails: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type UpdateCityMutationVariables = Exact<{
  _id: string;
  name: string;
  peripheryOf?: string | null | undefined;
  country: string;
  region?: string | null | undefined;
}>;


export type UpdateCityMutation = { updateCity: { _id: string | null, name: string | null, peripheryOf: string | null, region: string | null, country: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type DistinctRegionsQueryVariables = Exact<{ [key: string]: never; }>;


export type DistinctRegionsQuery = { distinctRegions: Array<string | null> | null };

export type AllJobDefinitionsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllJobDefinitionsQuery = { allJobDefinitions: Array<{ _id: string | null, name: string | null, displayName: string | null, defaultSchedule: string | null, schedule: string | null, enabled: boolean | null, createdAt: unknown, updatedAt: unknown } | null> | null };

export type ClearJobDefinitionScheduleMutationVariables = Exact<{
  _id: string;
}>;


export type ClearJobDefinitionScheduleMutation = { clearJobDefinitionSchedule: { _id: string | null, schedule: string | null, updatedAt: unknown } | null };

export type IsJobProcessorActiveQueryVariables = Exact<{ [key: string]: never; }>;


export type IsJobProcessorActiveQuery = { isJobProcessorActive: boolean | null };

export type PagedJobLogsQueryVariables = Exact<{
  filter?: Types.JobLogsFilterType | null | undefined;
}>;


export type PagedJobLogsQuery = { pagedJobLogs: { totalResults: number | null, data: Array<{ _id: string | null, timestamp: unknown, level: string | null, event: string | null, jobId: string | null, jobName: string | null, message: string | null, duration: number | null, error: string | null, failCount: number | null, retryDelay: number | null, retryAttempt: number | null } | null> | null } | null };

export type PagedScheduledJobsQueryVariables = Exact<{
  filter?: Types.ScheduledJobsFilterType | null | undefined;
}>;


export type PagedScheduledJobsQuery = { pagedScheduledJobs: { totalResults: number | null, data: Array<{ _id: string | null, name: string | null, status: string | null, nextRunAt: unknown, lastRunAt: unknown, lastFinishedAt: unknown, failedAt: unknown, failReason: string | null, failCount: number | null, repeatInterval: string | null, disabled: boolean | null } | null> | null } | null };

export type ResetJobDefinitionScheduleMutationVariables = Exact<{
  _id: string;
}>;


export type ResetJobDefinitionScheduleMutation = { resetJobDefinitionSchedule: { _id: string | null, schedule: string | null, updatedAt: unknown } | null };

export type RetryFailedJobMutationVariables = Exact<{
  _id: string;
}>;


export type RetryFailedJobMutation = { retryFailedJob: boolean | null };

export type RunScheduledJobNowMutationVariables = Exact<{
  name: string;
}>;


export type RunScheduledJobNowMutation = { runScheduledJobNow: boolean | null };

export type SetJobDefinitionEnabledMutationVariables = Exact<{
  _id: string;
  enabled: boolean;
}>;


export type SetJobDefinitionEnabledMutation = { setJobDefinitionEnabled: { _id: string | null, enabled: boolean | null, updatedAt: unknown } | null };

export type SetScheduledJobEnabledMutationVariables = Exact<{
  _id: string;
  enabled: boolean;
}>;


export type SetScheduledJobEnabledMutation = { setScheduledJobEnabled: boolean | null };

export type UpdateJobDefinitionScheduleMutationVariables = Exact<{
  _id: string;
  schedule: string;
}>;


export type UpdateJobDefinitionScheduleMutation = { updateJobDefinitionSchedule: { _id: string | null, schedule: string | null, updatedAt: unknown } | null };

export type AllPeopleTagsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllPeopleTagsQuery = { allPeopleTags: Array<{ _id: string | null, name: string | null, color: string | null, textColor: string | null, moduleNames: Array<string | null> | null } | null> | null };

export type CreatePeopleTagMutationVariables = Exact<{
  name: string;
  color: string;
  textColor: string;
  moduleNames: Array<string | null | undefined> | string;
}>;


export type CreatePeopleTagMutation = { createPeopleTag: { _id: string | null, name: string | null, color: string | null, textColor: string | null, moduleNames: Array<string | null> | null } | null };

export type DeletePeopleTagMutationVariables = Exact<{
  _id: string;
}>;


export type DeletePeopleTagMutation = { deletePeopleTag: number | null };

export type UpdatePeopleTagMutationVariables = Exact<{
  _id: string;
  name: string;
  color: string;
  textColor: string;
  moduleNames: Array<string | null | undefined> | string;
}>;


export type UpdatePeopleTagMutation = { updatePeopleTag: { _id: string | null, name: string | null, color: string | null, textColor: string | null, moduleNames: Array<string | null> | null } | null };

export type AdminPhysicalStoreByIdQueryVariables = Exact<{
  id: string;
}>;


export type AdminPhysicalStoreByIdQuery = { physicalStoreById: { _id: string | null, name: string | null, address: string | null } | null };

export type CreatePhysicalStoreMutationVariables = Exact<{
  name: string;
  address?: string | null | undefined;
}>;


export type CreatePhysicalStoreMutation = { createPhysicalStore: { _id: string | null, name: string | null, address: string | null } | null };

export type UpdatePhysicalStoreMutationVariables = Exact<{
  id: string;
  name: string;
  address: string;
}>;


export type UpdatePhysicalStoreMutation = { updatePhysicalStore: { _id: string | null, name: string | null, address: string | null } | null };

export type CreateUserGroupMutationVariables = Exact<{
  name: string;
  moduleName: string;
  description?: string | null | undefined;
}>;


export type CreateUserGroupMutation = { createUserGroup: { _id: string | null, name: string | null, moduleName: string | null, description: string | null } | null };

export type DeleteUserGroupMutationVariables = Exact<{
  _id: string;
}>;


export type DeleteUserGroupMutation = { deleteUserGroup: number | null };

export type PagedUserGroupsQueryVariables = Exact<{
  queryString?: string | null | undefined;
}>;


export type PagedUserGroupsQuery = { pagedUserGroups: { totalResults: number | null, data: Array<{ _id: string | null, name: string | null, description: string | null } | null> | null } | null };

export type SetUserGroupInstanceAccessMutationVariables = Exact<{
  _id: string;
  instances: Array<string | null | undefined> | string;
}>;


export type SetUserGroupInstanceAccessMutation = { setUserGroupInstanceAccess: { _id: string | null, instances: Array<string | null> | null } | null };

export type SetUserGroupPermissionsMutationVariables = Exact<{
  _id: string;
  permissions: Array<string | null | undefined> | string;
}>;


export type SetUserGroupPermissionsMutation = { setUserGroupPermissions: { _id: string | null, permissions: Array<string | null> | null } | null };

export type UpdateUserGroupMutationVariables = Exact<{
  _id: string;
  name: string;
  description?: string | null | undefined;
}>;


export type UpdateUserGroupMutation = { updateUserGroup: { _id: string | null, name: string | null, description: string | null } | null };

export type UserGroupGeneralInfoByIdQueryVariables = Exact<{
  _id: string;
}>;


export type UserGroupGeneralInfoByIdQuery = { userGroupById: { _id: string | null, name: string | null, description: string | null } | null };

export type UserGroupInstanceAccessByIdQueryVariables = Exact<{
  _id: string;
}>;


export type UserGroupInstanceAccessByIdQuery = { userGroupById: { _id: string | null, instances: Array<string | null> | null } | null };

export type UserGroupPermissionsByIdQueryVariables = Exact<{
  _id: string;
}>;


export type UserGroupPermissionsByIdQuery = { userGroupById: { _id: string | null, permissions: Array<string | null> | null } | null };

export type CreateUserMutationVariables = Exact<{
  userName?: string | null | undefined;
  password?: string | null | undefined;
  email?: string | null | undefined;
  displayName?: string | null | undefined;
  personId?: string | null | undefined;
}>;


export type CreateUserMutation = { createUser: { _id: string | null } | null };

export type PagedUsersQueryVariables = Exact<{
  filter?: Types.UserFilter | null | undefined;
}>;


export type PagedUsersQuery = { pagedUsers: { totalResults: number | null, data: Array<{ _id: string | null, username: string | null, email: string | null, displayName: string | null, locked: boolean | null, lastActiveAt: string | null, karkun: { _id: string | null, name: string | null, imageId: string | null } | null } | null> | null } | null };

export type SetInstanceAccessMutationVariables = Exact<{
  userId: string;
  instances: Array<string | null | undefined> | string;
}>;


export type SetInstanceAccessMutation = { setInstanceAccess: { _id: string | null, instances: Array<string | null> | null } | null };

export type SetPermissionsMutationVariables = Exact<{
  userId: string;
  permissions: Array<string | null | undefined> | string;
}>;


export type SetPermissionsMutation = { setPermissions: { _id: string | null, permissions: Array<string | null> | null } | null };

export type UpdateUserMutationVariables = Exact<{
  userId: string;
  password?: string | null | undefined;
  email?: string | null | undefined;
  displayName?: string | null | undefined;
  locked?: boolean | null | undefined;
}>;


export type UpdateUserMutation = { updateUser: { _id: string | null, username: string | null, email: string | null, displayName: string | null, locked: boolean | null, personId: string | null, karkun: { _id: string | null, name: string | null } | null } | null };

export type AdminUserByIdQueryVariables = Exact<{
  _id: string;
}>;


export type AdminUserByIdQuery = { userById: { _id: string | null, username: string | null, email: string | null, displayName: string | null, locked: boolean | null, instances: Array<string | null> | null, permissions: Array<string | null> | null, personId: string | null, karkun: { _id: string | null, name: string | null } | null } | null };

export type UserNamesQueryVariables = Exact<{
  ids?: Array<string | null | undefined> | string | null | undefined;
}>;


export type UserNamesQuery = { userNames: Array<string | null> | null };

export type UpdateAttachmentMutationVariables = Exact<{
  _id: string;
  name?: string | null | undefined;
  description?: string | null | undefined;
}>;


export type UpdateAttachmentMutation = { updateAttachment: { _id: string | null, name: string | null, description: string | null, mimeType: string | null } | null };

export type PagedPeopleQueryVariables = Exact<{
  filter?: Types.PersonFilter | null | undefined;
}>;


export type PagedPeopleQuery = { pagedPeople: { totalResults: number | null, data: Array<{ _id: string | null, isVisitor: boolean | null, isKarkun: boolean | null, isEmployee: boolean | null, sharedData: { name: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber2: string | null, imageId: string | null, image: { _id: string | null, name: string | null, description: string | null, mimeType: string | null, data: string | null } | null } | null, visitorData: { city: string | null, country: string | null } | null, karkunData: { city: { _id: string | null, name: string | null, country: string | null } | null } | null } | null> | null } | null };

export type HelperPagedHrKarkunsQueryVariables = Exact<{
  filter?: Types.KarkunFilter | null | undefined;
}>;


export type HelperPagedHrKarkunsQuery = { pagedHrKarkuns: { totalResults: number | null, karkuns: Array<{ _id: string | null, name: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber1Subscribed: boolean | null, contactNumber2: string | null, contactNumber2Subscribed: boolean | null, lastTarteebDate: string | null, imageId: string | null, job: { _id: string | null, name: string | null } | null, duties: Array<{ _id: string | null, dutyId: string | null, shiftId: string | null, dutyName: string | null, shiftName: string | null, role: string | null } | null> | null } | null> | null } | null };

export type AttendanceByBarcodeIdsQueryVariables = Exact<{
  barcodeIds: string;
}>;


export type AttendanceByBarcodeIdsQuery = { attendanceByBarcodeIds: Array<{ _id: string | null, karkunId: string | null, month: string | null, dutyId: string | null, shiftId: string | null, absentCount: number | null, presentCount: number | null, percentage: number | null, meetingCardBarcodeId: string | null, karkun: { _id: string | null, name: string | null, bloodGroup: string | null, contactNumber1Subscribed: boolean | null, contactNumber2Subscribed: boolean | null, image: { _id: string | null, data: string | null } | null } | null, job: { _id: string | null, name: string | null } | null, duty: { _id: string | null, name: string | null } | null, shift: { _id: string | null, name: string | null } | null } | null> | null };

export type AttendanceByMonthQueryVariables = Exact<{
  month: string;
  categoryId?: string | null | undefined;
  subCategoryId?: string | null | undefined;
}>;


export type AttendanceByMonthQuery = { attendanceByMonth: Array<{ _id: string | null, karkunId: string | null, month: string | null, dutyId: string | null, shiftId: string | null, attendanceDetails: string | null, presentCount: number | null, absentCount: number | null, percentage: number | null, meetingCardBarcodeId: string | null, karkun: { _id: string | null, name: string | null, imageId: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber2: string | null, image: { _id: string | null, data: string | null } | null } | null, duty: { _id: string | null, name: string | null } | null, shift: { _id: string | null, name: string | null } | null, job: { _id: string | null, name: string | null } | null } | null> | null };

export type CreateAttendancesMutationVariables = Exact<{
  month: string;
}>;


export type CreateAttendancesMutation = { createAttendances: number | null };

export type UpdateAttendanceMutationVariables = Exact<{
  _id: string;
  attendanceDetails?: string | null | undefined;
  presentCount?: number | null | undefined;
  absentCount?: number | null | undefined;
  percentage?: number | null | undefined;
}>;


export type UpdateAttendanceMutation = { updateAttendance: { _id: string | null, attendanceDetails: string | null, presentCount: number | null, absentCount: number | null, percentage: number | null } | null };

export type DeleteAttendancesMutationVariables = Exact<{
  month: string;
  ids: Array<string | null | undefined> | string;
}>;


export type DeleteAttendancesMutation = { deleteAttendances: number | null };

export type DeleteAllAttendancesMutationVariables = Exact<{
  month: string;
  categoryId?: string | null | undefined;
  subCategoryId?: string | null | undefined;
}>;


export type DeleteAllAttendancesMutation = { deleteAllAttendances: number | null };

export type ImportAttendancesMutationVariables = Exact<{
  month: string;
  dutyId: string;
  shiftId?: string | null | undefined;
}>;


export type ImportAttendancesMutation = { importAttendances: number | null };

export type PagedHrAuditLogsQueryVariables = Exact<{
  filter?: Types.AuditLogFilter | null | undefined;
}>;


export type PagedHrAuditLogsQuery = { pagedHrAuditLogs: { totalResults: number | null, data: Array<{ _id: string | null, entityId: string | null, entityType: string | null, operationType: string | null, auditValues: Array<string | null> | null, operationTime: string | null, operationBy: string | null, operationByName: string | null, operationByImageId: string | null } | null> | null } | null };

export type ComposerAllDutyLocationsQueryVariables = Exact<{ [key: string]: never; }>;


export type ComposerAllDutyLocationsQuery = { allDutyLocations: Array<{ _id: string | null, name: string | null } | null> | null };

export type AllDutyShiftsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllDutyShiftsQuery = { allDutyShifts: Array<{ _id: string | null, dutyId: string | null, name: string | null, startTime: string | null, endTime: string | null } | null> | null };

export type AllJobsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllJobsQuery = { allJobs: Array<{ _id: string | null, name: string | null, description: string | null, usedCount: number | null } | null> | null };

export type ComposerAllMsDutiesQueryVariables = Exact<{ [key: string]: never; }>;


export type ComposerAllMsDutiesQuery = { allMSDuties: Array<{ _id: string | null, name: string | null } | null> | null };

export type DutyLocationByIdQueryVariables = Exact<{
  id: string;
}>;


export type DutyLocationByIdQuery = { dutyLocationById: { _id: string | null, name: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type UpdateDutyLocationMutationVariables = Exact<{
  id: string;
  name: string;
}>;


export type UpdateDutyLocationMutation = { updateDutyLocation: { _id: string | null, name: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type ListAllDutyLocationsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListAllDutyLocationsQuery = { allDutyLocations: Array<{ _id: string | null, name: string | null, usedCount: number | null } | null> | null };

export type CreateDutyLocationMutationVariables = Exact<{
  name: string;
}>;


export type CreateDutyLocationMutation = { createDutyLocation: { _id: string | null, name: string | null } | null };

export type RemoveDutyLocationMutationVariables = Exact<{
  _id: string;
}>;


export type RemoveDutyLocationMutation = { removeDutyLocation: number | null };

export type AddHrKarkunAttachmentMutationVariables = Exact<{
  _id: string;
  attachmentId: string;
}>;


export type AddHrKarkunAttachmentMutation = { addHrKarkunAttachment: { _id: string | null, attachments: Array<{ _id: string | null, name: string | null, description: string | null, mimeType: string | null } | null> | null } | null };

export type CreateHrKarkunMutationVariables = Exact<{
  name: string;
  parentName?: string | null | undefined;
  cnicNumber?: string | null | undefined;
  contactNumber1?: string | null | undefined;
  contactNumber2?: string | null | undefined;
  emailAddress?: string | null | undefined;
  currentAddress?: string | null | undefined;
  permanentAddress?: string | null | undefined;
  bloodGroup?: string | null | undefined;
  educationalQualification?: string | null | undefined;
  meansOfEarning?: string | null | undefined;
  ehadDate?: string | null | undefined;
  birthDate?: string | null | undefined;
  referenceName?: string | null | undefined;
}>;


export type CreateHrKarkunMutation = { createHrKarkun: { _id: string | null, name: string | null, parentName: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber2: string | null, emailAddress: string | null, currentAddress: string | null, permanentAddress: string | null, bloodGroup: string | null, educationalQualification: string | null, meansOfEarning: string | null, ehadDate: string | null, birthDate: string | null, lastTarteebDate: string | null, mehfilRaabta: string | null, msRaabta: string | null, referenceName: string | null } | null };

export type DeleteHrKarkunMutationVariables = Exact<{
  _id: string;
}>;


export type DeleteHrKarkunMutation = { deleteHrKarkun: number | null };

export type HrKarkunByIdForPeopleQueryVariables = Exact<{
  _id: string;
}>;


export type HrKarkunByIdForPeopleQuery = { hrKarkunById: { _id: string | null, name: string | null, parentName: string | null, cnicNumber: string | null, imageId: string | null, contactNumber1: string | null, contactNumber2: string | null, contactNumber1Subscribed: boolean | null, contactNumber2Subscribed: boolean | null, emailAddress: string | null, currentAddress: string | null, permanentAddress: string | null, cityId: string | null, cityMehfilId: string | null, bloodGroup: string | null, educationalQualification: string | null, meansOfEarning: string | null, ehadDate: string | null, ehadKarkun: boolean | null, ehadPermissionDate: string | null, birthDate: string | null, deathDate: string | null, lastTarteebDate: string | null, mehfilRaabta: string | null, msRaabta: string | null, referenceName: string | null, isEmployee: boolean | null, jobId: string | null, employmentStartDate: string | null, employmentEndDate: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, attachments: Array<{ _id: string | null, name: string | null, description: string | null, mimeType: string | null } | null> | null, job: { _id: string | null, name: string | null } | null, duties: Array<{ _id: string | null, dutyName: string | null, shiftName: string | null, locationName: string | null } | null> | null } | null };

export type HrKarkunsByIdQueryVariables = Exact<{
  _ids: string;
}>;


export type HrKarkunsByIdQuery = { hrKarkunsById: Array<{ _id: string | null, name: string | null, parentName: string | null, cnicNumber: string | null, imageId: string | null, contactNumber1: string | null, contactNumber2: string | null, image: { _id: string | null, data: string | null } | null, job: { _id: string | null, name: string | null } | null, duties: Array<{ _id: string | null, dutyName: string | null, shiftName: string | null, locationName: string | null } | null> | null } | null> | null };

export type HrPeoplePagedHrKarkunsQueryVariables = Exact<{
  filter?: Types.KarkunFilter | null | undefined;
}>;


export type HrPeoplePagedHrKarkunsQuery = { pagedHrKarkuns: { totalResults: number | null, karkuns: Array<{ _id: string | null, name: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber2: string | null, contactNumber1Subscribed: boolean | null, contactNumber2Subscribed: boolean | null, lastTarteebDate: string | null, imageId: string | null, job: { _id: string | null, name: string | null } | null, duties: Array<{ _id: string | null, dutyId: string | null, shiftId: string | null, dutyName: string | null, shiftName: string | null, role: string | null } | null> | null } | null> | null } | null };

export type PagedSalariesByKarkunQueryVariables = Exact<{
  queryString?: string | null | undefined;
}>;


export type PagedSalariesByKarkunQuery = { pagedSalariesByKarkun: { totalResults: number | null, salaries: Array<{ _id: string | null, month: string | null, salary: number | null, rashanMadad: number | null, openingLoan: number | null, loanDeduction: number | null, newLoan: number | null, closingLoan: number | null, otherDeduction: number | null, arrears: number | null, netPayment: number | null } | null> | null } | null };

export type RemoveHrKarkunAttachmentMutationVariables = Exact<{
  _id: string;
  attachmentId: string;
}>;


export type RemoveHrKarkunAttachmentMutation = { removeHrKarkunAttachment: { _id: string | null, attachments: Array<{ _id: string | null, name: string | null, description: string | null, mimeType: string | null } | null> | null } | null };

export type SetPeopleKarkunEmploymentInfoMutationVariables = Exact<{
  _id: string;
  isEmployee: boolean;
  jobId?: string | null | undefined;
  employmentStartDate?: string | null | undefined;
  employmentEndDate?: string | null | undefined;
}>;


export type SetPeopleKarkunEmploymentInfoMutation = { setHrKarkunEmploymentInfo: { _id: string | null, isEmployee: boolean | null, jobId: string | null, employmentStartDate: string | null, employmentEndDate: string | null } | null };

export type SetHrKarkunProfileImageMutationVariables = Exact<{
  _id: string;
  imageId: string;
}>;


export type SetHrKarkunProfileImageMutation = { setHrKarkunProfileImage: { _id: string | null, imageId: string | null } | null };

export type UpdateHrKarkunMutationVariables = Exact<{
  _id: string;
  name: string;
  parentName?: string | null | undefined;
  cnicNumber?: string | null | undefined;
  contactNumber1?: string | null | undefined;
  contactNumber2?: string | null | undefined;
  emailAddress?: string | null | undefined;
  currentAddress?: string | null | undefined;
  permanentAddress?: string | null | undefined;
  bloodGroup?: string | null | undefined;
  cityId?: string | null | undefined;
  cityMehfilId?: string | null | undefined;
  educationalQualification?: string | null | undefined;
  meansOfEarning?: string | null | undefined;
  ehadDate?: string | null | undefined;
  birthDate?: string | null | undefined;
  deathDate?: string | null | undefined;
  referenceName?: string | null | undefined;
}>;


export type UpdateHrKarkunMutation = { updateHrKarkun: { _id: string | null, name: string | null, parentName: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber2: string | null, emailAddress: string | null, currentAddress: string | null, permanentAddress: string | null, cityId: string | null, cityMehfilId: string | null, bloodGroup: string | null, educationalQualification: string | null, meansOfEarning: string | null, ehadDate: string | null, birthDate: string | null, deathDate: string | null, lastTarteebDate: string | null, mehfilRaabta: string | null, msRaabta: string | null, referenceName: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type JobByIdQueryVariables = Exact<{
  id: string;
}>;


export type JobByIdQuery = { jobById: { _id: string | null, name: string | null, description: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type UpdateJobMutationVariables = Exact<{
  id: string;
  name: string;
  description?: string | null | undefined;
}>;


export type UpdateJobMutation = { updateJob: { _id: string | null, name: string | null, description: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type CreateJobMutationVariables = Exact<{
  name: string;
  description?: string | null | undefined;
}>;


export type CreateJobMutation = { createJob: { _id: string | null, name: string | null, description: string | null } | null };

export type RemoveJobMutationVariables = Exact<{
  _id: string;
}>;


export type RemoveJobMutation = { removeJob: number | null };

export type CreateKarkunDutyMutationVariables = Exact<{
  karkunId: string;
  dutyId: string;
  shiftId?: string | null | undefined;
  locationId?: string | null | undefined;
  role?: string | null | undefined;
  daysOfWeek?: Array<string | null | undefined> | string | null | undefined;
}>;


export type CreateKarkunDutyMutation = { createKarkunDuty: { _id: string | null, dutyId: string | null, dutyName: string | null, shiftId: string | null, shiftName: string | null, locationId: string | null, locationName: string | null, role: string | null, daysOfWeek: Array<string | null> | null } | null };

export type HrKarkunByIdForKarkunsQueryVariables = Exact<{
  _id: string;
}>;


export type HrKarkunByIdForKarkunsQuery = { hrKarkunById: { _id: string | null, name: string | null, parentName: string | null, cnicNumber: string | null, imageId: string | null, contactNumber1: string | null, contactNumber2: string | null, contactNumber1Subscribed: boolean | null, contactNumber2Subscribed: boolean | null, emailAddress: string | null, currentAddress: string | null, permanentAddress: string | null, cityId: string | null, cityMehfilId: string | null, bloodGroup: string | null, educationalQualification: string | null, meansOfEarning: string | null, ehadDate: string | null, ehadKarkun: boolean | null, ehadPermissionDate: string | null, birthDate: string | null, deathDate: string | null, lastTarteebDate: string | null, mehfilRaabta: string | null, msRaabta: string | null, referenceName: string | null, isEmployee: boolean | null, jobId: string | null, employmentStartDate: string | null, employmentEndDate: string | null, bankAccountDetails: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, attachments: Array<{ _id: string | null, name: string | null, description: string | null, mimeType: string | null } | null> | null, job: { _id: string | null, name: string | null } | null, duties: Array<{ _id: string | null, dutyName: string | null, shiftName: string | null, locationName: string | null } | null> | null } | null };

export type KarkunDutiesByKarkunIdQueryVariables = Exact<{
  karkunId: string;
}>;


export type KarkunDutiesByKarkunIdQuery = { karkunDutiesByKarkunId: Array<{ _id: string | null, dutyId: string | null, dutyName: string | null, shiftId: string | null, shiftName: string | null, locationName: string | null, role: string | null, daysOfWeek: Array<string | null> | null } | null> | null };

export type PagedAttendanceByHrKarkunQueryVariables = Exact<{
  queryString?: string | null | undefined;
}>;


export type PagedAttendanceByHrKarkunQuery = { pagedAttendanceByKarkun: { totalResults: number | null, data: Array<{ _id: string | null, dutyId: string | null, shiftId: string | null, jobId: string | null, month: string | null, absentCount: number | null, presentCount: number | null, percentage: number | null, job: { _id: string | null, name: string | null } | null, duty: { _id: string | null, name: string | null } | null, shift: { _id: string | null, name: string | null } | null } | null> | null } | null };

export type HrKarkunsPagedHrKarkunsQueryVariables = Exact<{
  filter?: Types.KarkunFilter | null | undefined;
}>;


export type HrKarkunsPagedHrKarkunsQuery = { pagedHrKarkuns: { totalResults: number | null, karkuns: Array<{ _id: string | null, name: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber2: string | null, contactNumber1Subscribed: boolean | null, contactNumber2Subscribed: boolean | null, lastTarteebDate: string | null, imageId: string | null, job: { _id: string | null, name: string | null } | null, duties: Array<{ _id: string | null, dutyId: string | null, shiftId: string | null, dutyName: string | null, shiftName: string | null, role: string | null } | null> | null } | null> | null } | null };

export type RemoveKarkunDutyMutationVariables = Exact<{
  _id: string;
}>;


export type RemoveKarkunDutyMutation = { removeKarkunDuty: number | null };

export type UpdateKarkunDutyMutationVariables = Exact<{
  _id: string;
  karkunId: string;
  dutyId: string;
  shiftId?: string | null | undefined;
  locationId?: string | null | undefined;
  role?: string | null | undefined;
  daysOfWeek?: Array<string | null | undefined> | string | null | undefined;
}>;


export type UpdateKarkunDutyMutation = { updateKarkunDuty: { _id: string | null, dutyId: string | null, dutyName: string | null, shiftId: string | null, shiftName: string | null, locationId: string | null, locationName: string | null, role: string | null, daysOfWeek: Array<string | null> | null } | null };

export type DutyByIdQueryVariables = Exact<{
  id: string;
}>;


export type DutyByIdQuery = { dutyById: { _id: string | null, name: string | null, description: string | null, attendanceSheet: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type UpdateDutyMutationVariables = Exact<{
  id: string;
  name: string;
  description?: string | null | undefined;
  attendanceSheet?: string | null | undefined;
}>;


export type UpdateDutyMutation = { updateDuty: { _id: string | null, name: string | null, description: string | null, attendanceSheet: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type CreateDutyShiftMutationVariables = Exact<{
  name: string;
  dutyId: string;
  startTime?: string | null | undefined;
  endTime?: string | null | undefined;
  attendanceSheet?: string | null | undefined;
}>;


export type CreateDutyShiftMutation = { createDutyShift: { _id: string | null, name: string | null, dutyId: string | null, startTime: string | null, endTime: string | null, attendanceSheet: string | null } | null };

export type DutyShiftsByDutyIdQueryVariables = Exact<{
  dutyId: string;
}>;


export type DutyShiftsByDutyIdQuery = { dutyShiftsByDutyId: Array<{ _id: string | null, dutyId: string | null, name: string | null, startTime: string | null, endTime: string | null, attendanceSheet: string | null, canDelete: boolean | null } | null> | null };

export type RemoveDutyShiftMutationVariables = Exact<{
  _id: string;
}>;


export type RemoveDutyShiftMutation = { removeDutyShift: number | null };

export type UpdateDutyShiftMutationVariables = Exact<{
  _id: string;
  name: string;
  dutyId: string;
  startTime?: string | null | undefined;
  endTime?: string | null | undefined;
  attendanceSheet?: string | null | undefined;
}>;


export type UpdateDutyShiftMutation = { updateDutyShift: { _id: string | null, name: string | null, dutyId: string | null, startTime: string | null, endTime: string | null, attendanceSheet: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type ListAllMsDutiesQueryVariables = Exact<{ [key: string]: never; }>;


export type ListAllMsDutiesQuery = { allMSDuties: Array<{ _id: string | null, name: string | null, description: string | null, canDelete: boolean | null, shifts: Array<{ _id: string | null, name: string | null } | null> | null } | null> | null };

export type CreateDutyMutationVariables = Exact<{
  name: string;
  isMehfilDuty: boolean;
  description?: string | null | undefined;
  attendanceSheet?: string | null | undefined;
}>;


export type CreateDutyMutation = { createDuty: { _id: string | null, name: string | null, isMehfilDuty: boolean | null, description: string | null, attendanceSheet: string | null } | null };

export type RemoveDutyMutationVariables = Exact<{
  _id: string;
}>;


export type RemoveDutyMutation = { removeDuty: number | null };

export type CreateSalariesMutationVariables = Exact<{
  month: string;
}>;


export type CreateSalariesMutation = { createSalaries: number | null };

export type CurrentMonthSalariesQueryVariables = Exact<{
  month: string;
  jobId?: string | null | undefined;
}>;


export type CurrentMonthSalariesQuery = { salariesByMonth: Array<{ _id: string | null, karkunId: string | null, month: string | null, jobId: string | null, salary: number | null, openingLoan: number | null, loanDeduction: number | null, newLoan: number | null, closingLoan: number | null, otherDeduction: number | null, arrears: number | null, netPayment: number | null, rashanMadad: number | null, approvedOn: string | null, approvedBy: string | null, approver: { _id: string | null, name: string | null } | null, karkun: { _id: string | null, name: string | null, parentName: string | null, imageId: string | null, cnicNumber: string | null, contactNumber1: string | null, bankAccountDetails: string | null } | null, job: { _id: string | null, name: string | null } | null } | null> | null };

export type DeleteAllSalariesMutationVariables = Exact<{
  month: string;
}>;


export type DeleteAllSalariesMutation = { deleteAllSalaries: number | null };

export type DeleteSalariesMutationVariables = Exact<{
  month: string;
  ids: Array<string | null | undefined> | string;
}>;


export type DeleteSalariesMutation = { deleteSalaries: number | null };

export type PreviousMonthSalariesQueryVariables = Exact<{
  month: string;
  jobId?: string | null | undefined;
}>;


export type PreviousMonthSalariesQuery = { salariesByMonth: Array<{ _id: string | null, karkunId: string | null, month: string | null, jobId: string | null, salary: number | null, otherDeduction: number | null, arrears: number | null, rashanMadad: number | null } | null> | null };

export type UpdateSalaryMutationVariables = Exact<{
  _id: string;
  salary?: number | null | undefined;
  openingLoan?: number | null | undefined;
  loanDeduction?: number | null | undefined;
  newLoan?: number | null | undefined;
  otherDeduction?: number | null | undefined;
  arrears?: number | null | undefined;
  rashanMadad?: number | null | undefined;
}>;


export type UpdateSalaryMutation = { updateSalary: { _id: string | null, karkunId: string | null, jobId: string | null, month: string | null, salary: number | null, openingLoan: number | null, loanDeduction: number | null, newLoan: number | null, closingLoan: number | null, otherDeduction: number | null, arrears: number | null, netPayment: number | null, rashanMadad: number | null } | null };

export type EidReceiptSalariesByIdsQueryVariables = Exact<{
  ids: string;
}>;


export type EidReceiptSalariesByIdsQuery = { salariesByIds: Array<{ _id: string | null, karkunId: string | null, month: string | null, jobId: string | null, salary: number | null, karkun: { _id: string | null, name: string | null, parentName: string | null, cnicNumber: string | null, contactNumber1: string | null, image: { _id: string | null, data: string | null } | null } | null, job: { _id: string | null, name: string | null } | null } | null> | null };

export type RashanReceiptSalariesByIdsQueryVariables = Exact<{
  ids: string;
}>;


export type RashanReceiptSalariesByIdsQuery = { salariesByIds: Array<{ _id: string | null, karkunId: string | null, month: string | null, jobId: string | null, rashanMadad: number | null, karkun: { _id: string | null, name: string | null, parentName: string | null, cnicNumber: string | null, contactNumber1: string | null, image: { _id: string | null, data: string | null } | null } | null, job: { _id: string | null, name: string | null } | null } | null> | null };

export type SalaryReceiptSalariesByIdsQueryVariables = Exact<{
  ids: string;
}>;


export type SalaryReceiptSalariesByIdsQuery = { salariesByIds: Array<{ _id: string | null, karkunId: string | null, month: string | null, jobId: string | null, salary: number | null, openingLoan: number | null, loanDeduction: number | null, newLoan: number | null, closingLoan: number | null, otherDeduction: number | null, arrears: number | null, netPayment: number | null, karkun: { _id: string | null, name: string | null, parentName: string | null, cnicNumber: string | null, contactNumber1: string | null, image: { _id: string | null, data: string | null } | null } | null, job: { _id: string | null, name: string | null } | null } | null> | null };

export type PagedSecurityAuditLogsQueryVariables = Exact<{
  filter?: Types.AuditLogFilter | null | undefined;
}>;


export type PagedSecurityAuditLogsQuery = { pagedSecurityAuditLogs: { totalResults: number | null, data: Array<{ _id: string | null, entityId: string | null, entityType: string | null, operationType: string | null, auditValues: Array<string | null> | null, operationTime: string | null, operationBy: string | null, operationByName: string | null, operationByImageId: string | null } | null> | null } | null };

export type ComposerAllSecurityMehfilDutiesQueryVariables = Exact<{
  mehfilId?: string | null | undefined;
}>;


export type ComposerAllSecurityMehfilDutiesQuery = { allSecurityMehfilDuties: Array<{ _id: string | null, name: string | null, urduName: string | null, overallUsedCount: number | null, mehfilUsedCount: number | null } | null> | null };

export type ComposerSecurityMehfilDutyByIdQueryVariables = Exact<{
  id: string;
}>;


export type ComposerSecurityMehfilDutyByIdQuery = { securityMehfilDutyById: { _id: string | null, name: string | null, urduName: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type MehfilByIdQueryVariables = Exact<{
  _id: string;
}>;


export type MehfilByIdQuery = { mehfilById: { _id: string | null, name: string | null, mehfilDate: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type MehfilKarkunByBarcodeIdQueryVariables = Exact<{
  barcode: string;
}>;


export type MehfilKarkunByBarcodeIdQuery = { mehfilKarkunByBarcodeId: { _id: string | null, mehfilId: string | null, karkunId: string | null, dutyId: string | null, dutyDetail: string | null, dutyCardBarcodeId: string | null, mehfil: { _id: string | null, name: string | null, mehfilDate: string | null } | null, karkun: { _id: string | null, sharedData: { name: string | null, image: { _id: string | null, data: string | null } | null } | null } | null } | null };

export type AddMehfilKarkunMutationVariables = Exact<{
  mehfilId: string;
  karkunId: string;
  dutyId: string;
}>;


export type AddMehfilKarkunMutation = { addMehfilKarkun: { _id: string | null, mehfilId: string | null, karkunId: string | null, dutyId: string | null, dutyDetail: string | null, dutyCardBarcodeId: string | null } | null };

export type MehfilKarkunsByIdsQueryVariables = Exact<{
  ids: string;
}>;


export type MehfilKarkunsByIdsQuery = { mehfilKarkunsByIds: Array<{ _id: string | null, mehfilId: string | null, karkunId: string | null, dutyId: string | null, dutyDetail: string | null, dutyCardBarcodeId: string | null, duty: { _id: string | null, name: string | null, urduName: string | null } | null, karkun: { _id: string | null, isKarkun: boolean | null, sharedData: { name: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber2: string | null, image: { _id: string | null, data: string | null } | null } | null, visitorData: { city: string | null, country: string | null } | null, karkunData: { city: { _id: string | null, name: string | null, country: string | null } | null } | null } | null } | null> | null };

export type MehfilKarkunsByMehfilIdQueryVariables = Exact<{
  mehfilId: string;
  dutyId?: string | null | undefined;
}>;


export type MehfilKarkunsByMehfilIdQuery = { mehfilKarkunsByMehfilId: Array<{ _id: string | null, mehfilId: string | null, karkunId: string | null, dutyId: string | null, dutyDetail: string | null, dutyCardBarcodeId: string | null, karkun: { _id: string | null, isKarkun: boolean | null, sharedData: { name: string | null, imageId: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber2: string | null } | null, visitorData: { city: string | null, country: string | null } | null, karkunData: { city: { _id: string | null, name: string | null, country: string | null } | null } | null } | null } | null> | null };

export type RemoveMehfilKarkunMutationVariables = Exact<{
  _id: string;
}>;


export type RemoveMehfilKarkunMutation = { removeMehfilKarkun: number | null };

export type SetDutyDetailMutationVariables = Exact<{
  ids: Array<string | null | undefined> | string;
  dutyDetail: string;
}>;


export type SetDutyDetailMutation = { setDutyDetail: Array<{ _id: string | null, mehfilId: string | null, karkunId: string | null, dutyId: string | null, dutyDetail: string | null, dutyCardBarcodeId: string | null } | null> | null };

export type AllMehfilsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllMehfilsQuery = { allMehfils: Array<{ _id: string | null, name: string | null, mehfilDate: string | null, karkunCount: number | null } | null> | null };

export type CreateMehfilMutationVariables = Exact<{
  name: string;
  mehfilDate: string;
}>;


export type CreateMehfilMutation = { createMehfil: { _id: string | null, name: string | null, mehfilDate: string | null } | null };

export type RemoveMehfilMutationVariables = Exact<{
  _id: string;
}>;


export type RemoveMehfilMutation = { removeMehfil: number | null };

export type UpdateMehfilMutationVariables = Exact<{
  _id: string;
  name: string;
  mehfilDate: string;
}>;


export type UpdateMehfilMutation = { updateMehfil: { _id: string | null, name: string | null, mehfilDate: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type PagedSecurityUsersQueryVariables = Exact<{
  filter?: Types.UserFilter | null | undefined;
}>;


export type PagedSecurityUsersQuery = { pagedSecurityUsers: { totalResults: number | null, data: Array<{ _id: string | null, username: string | null, locked: boolean | null, lastActiveAt: string | null, permissions: Array<string | null> | null, person: { _id: string | null, sharedData: { name: string | null, imageId: string | null } | null } | null } | null> | null } | null };

export type SetSecurityUserPermissionsMutationVariables = Exact<{
  userId: string;
  permissions: Array<string | null | undefined> | string;
}>;


export type SetSecurityUserPermissionsMutation = { setSecurityUserPermissions: { _id: string | null, permissions: Array<string | null> | null } | null };

export type SecurityUserByIdQueryVariables = Exact<{
  _id: string;
}>;


export type SecurityUserByIdQuery = { userById: { _id: string | null, username: string | null, email: string | null, displayName: string | null, locked: boolean | null, instances: Array<string | null> | null, permissions: Array<string | null> | null, personId: string | null, person: { _id: string | null, sharedData: { name: string | null } | null } | null } | null };

export type CreateSecurityMehfilDutyMutationVariables = Exact<{
  name: string;
  urduName: string;
}>;


export type CreateSecurityMehfilDutyMutation = { createSecurityMehfilDuty: { _id: string | null, name: string | null, urduName: string | null } | null };

export type RemoveSecurityMehfilDutyMutationVariables = Exact<{
  _id: string;
}>;


export type RemoveSecurityMehfilDutyMutation = { removeSecurityMehfilDuty: number | null };

export type SetupAllSecurityMehfilDutiesQueryVariables = Exact<{ [key: string]: never; }>;


export type SetupAllSecurityMehfilDutiesQuery = { allSecurityMehfilDuties: Array<{ _id: string | null, name: string | null, urduName: string | null, overallUsedCount: number | null } | null> | null };

export type SetupSecurityMehfilDutyByIdQueryVariables = Exact<{
  id: string;
}>;


export type SetupSecurityMehfilDutyByIdQuery = { securityMehfilDutyById: { _id: string | null, name: string | null, urduName: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type UpdateSecurityMehfilDutyMutationVariables = Exact<{
  id: string;
  name: string;
  urduName: string;
}>;


export type UpdateSecurityMehfilDutyMutation = { updateSecurityMehfilDuty: { _id: string | null, name: string | null, urduName: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type AllSecurityMehfilLangarDishesQueryVariables = Exact<{ [key: string]: never; }>;


export type AllSecurityMehfilLangarDishesQuery = { allSecurityMehfilLangarDishes: Array<{ _id: string | null, name: string | null, urduName: string | null, overallUsedCount: number | null } | null> | null };

export type CreateSecurityMehfilLangarDishMutationVariables = Exact<{
  name: string;
  urduName: string;
}>;


export type CreateSecurityMehfilLangarDishMutation = { createSecurityMehfilLangarDish: { _id: string | null, name: string | null, urduName: string | null } | null };

export type RemoveSecurityMehfilLangarDishMutationVariables = Exact<{
  _id: string;
}>;


export type RemoveSecurityMehfilLangarDishMutation = { removeSecurityMehfilLangarDish: number | null };

export type SecurityMehfilLangarDishByIdQueryVariables = Exact<{
  id: string;
}>;


export type SecurityMehfilLangarDishByIdQuery = { securityMehfilLangarDishById: { _id: string | null, name: string | null, urduName: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type UpdateSecurityMehfilLangarDishMutationVariables = Exact<{
  id: string;
  name: string;
  urduName: string;
}>;


export type UpdateSecurityMehfilLangarDishMutation = { updateSecurityMehfilLangarDish: { _id: string | null, name: string | null, urduName: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type AllSecurityMehfilLangarLocationsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllSecurityMehfilLangarLocationsQuery = { allSecurityMehfilLangarLocations: Array<{ _id: string | null, name: string | null, urduName: string | null, overallUsedCount: number | null } | null> | null };

export type CreateSecurityMehfilLangarLocationMutationVariables = Exact<{
  name: string;
  urduName: string;
}>;


export type CreateSecurityMehfilLangarLocationMutation = { createSecurityMehfilLangarLocation: { _id: string | null, name: string | null, urduName: string | null } | null };

export type RemoveSecurityMehfilLangarLocationMutationVariables = Exact<{
  _id: string;
}>;


export type RemoveSecurityMehfilLangarLocationMutation = { removeSecurityMehfilLangarLocation: number | null };

export type SecurityMehfilLangarLocationByIdQueryVariables = Exact<{
  id: string;
}>;


export type SecurityMehfilLangarLocationByIdQuery = { securityMehfilLangarLocationById: { _id: string | null, name: string | null, urduName: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type UpdateSecurityMehfilLangarLocationMutationVariables = Exact<{
  id: string;
  name: string;
  urduName: string;
}>;


export type UpdateSecurityMehfilLangarLocationMutation = { updateSecurityMehfilLangarLocation: { _id: string | null, name: string | null, urduName: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type CreateSecurityVisitorMutationVariables = Exact<{
  name: string;
  parentName: string;
  cnicNumber: string;
  ehadDate: string;
  birthDate?: string | null | undefined;
  referenceName: string;
  contactNumber1?: string | null | undefined;
  contactNumber2?: string | null | undefined;
  city?: string | null | undefined;
  country?: string | null | undefined;
  currentAddress?: string | null | undefined;
  permanentAddress?: string | null | undefined;
  educationalQualification?: string | null | undefined;
  meansOfEarning?: string | null | undefined;
}>;


export type CreateSecurityVisitorMutation = { createSecurityVisitor: { _id: string | null, name: string | null, parentName: string | null, cnicNumber: string | null, ehadDate: string | null, birthDate: string | null, referenceName: string | null, contactNumber1: string | null, contactNumber2: string | null, city: string | null, country: string | null, currentAddress: string | null, permanentAddress: string | null, educationalQualification: string | null, meansOfEarning: string | null } | null };

export type DeleteSecurityVisitorMutationVariables = Exact<{
  _id: string;
}>;


export type DeleteSecurityVisitorMutation = { deleteSecurityVisitor: number | null };

export type ImportSecurityVisitorsCsvDataMutationVariables = Exact<{
  csvData: string;
}>;


export type ImportSecurityVisitorsCsvDataMutation = { importSecurityVisitorsCsvData: string | null };

export type PagedSecurityVisitorsQueryVariables = Exact<{
  filter?: Types.VisitorFilter | null | undefined;
}>;


export type PagedSecurityVisitorsQuery = { pagedSecurityVisitors: { totalResults: number | null, data: Array<{ _id: string | null, name: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber2: string | null, city: string | null, country: string | null, imageId: string | null, criminalRecord: string | null, otherNotes: string | null } | null> | null } | null };

export type SecurityVisitorByCnicQueryVariables = Exact<{
  cnicNumbers: Array<string | null | undefined> | string;
}>;


export type SecurityVisitorByCnicQuery = { securityVisitorByCnic: { _id: string | null, name: string | null, cnicNumber: string | null, parentName: string | null, ehadDate: string | null, birthDate: string | null, referenceName: string | null, contactNumber1: string | null, city: string | null, country: string | null, imageId: string | null, criminalRecord: string | null, otherNotes: string | null } | null };

export type SecurityRegistrationVisitorByIdQueryVariables = Exact<{
  _id: string;
}>;


export type SecurityRegistrationVisitorByIdQuery = { securityVisitorById: { _id: string | null, name: string | null, parentName: string | null, cnicNumber: string | null, ehadDate: string | null, birthDate: string | null, referenceName: string | null, contactNumber1: string | null, contactNumber2: string | null, city: string | null, country: string | null, currentAddress: string | null, permanentAddress: string | null, educationalQualification: string | null, meansOfEarning: string | null, criminalRecord: string | null, otherNotes: string | null, imageId: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type SetSecurityVisitorImageMutationVariables = Exact<{
  _id: string;
  imageId: string;
}>;


export type SetSecurityVisitorImageMutation = { setSecurityVisitorImage: { _id: string | null, imageId: string | null } | null };

export type UpdateSecurityVisitorNotesMutationVariables = Exact<{
  _id: string;
  criminalRecord?: string | null | undefined;
  otherNotes?: string | null | undefined;
}>;


export type UpdateSecurityVisitorNotesMutation = { updateSecurityVisitorNotes: { _id: string | null, criminalRecord: string | null, otherNotes: string | null } | null };

export type UpdateSecurityVisitorMutationVariables = Exact<{
  _id: string;
  name: string;
  parentName: string;
  cnicNumber?: string | null | undefined;
  ehadDate: string;
  birthDate?: string | null | undefined;
  referenceName: string;
  contactNumber1?: string | null | undefined;
  contactNumber2?: string | null | undefined;
  city?: string | null | undefined;
  country?: string | null | undefined;
  currentAddress?: string | null | undefined;
  permanentAddress?: string | null | undefined;
  educationalQualification?: string | null | undefined;
  meansOfEarning?: string | null | undefined;
}>;


export type UpdateSecurityVisitorMutation = { updateSecurityVisitor: { _id: string | null, name: string | null, parentName: string | null, cnicNumber: string | null, ehadDate: string | null, birthDate: string | null, referenceName: string | null, contactNumber1: string | null, contactNumber2: string | null, city: string | null, country: string | null, currentAddress: string | null, permanentAddress: string | null, educationalQualification: string | null, meansOfEarning: string | null } | null };

export type FixCitySpellingMutationVariables = Exact<{
  existingSpelling: string;
  newSpelling: string;
}>;


export type FixCitySpellingMutation = { fixCitySpelling: number | null };

export type FixNameSpellingMutationVariables = Exact<{
  existingSpelling: string;
  newSpelling: string;
}>;


export type FixNameSpellingMutation = { fixNameSpelling: number | null };

export type ReportPagedVisitorStaysQueryVariables = Exact<{
  queryString: string;
}>;


export type ReportPagedVisitorStaysQuery = { pagedVisitorStays: { totalResults: number | null, data: Array<{ _id: string | null, visitorId: string | null, fromDate: string | null, toDate: string | null, numOfDays: number | null, stayReason: string | null, stayAllowedBy: string | null, refVisitor: { _id: string | null, name: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber2: string | null, city: string | null, country: string | null, imageId: string | null, criminalRecord: string | null, otherNotes: string | null } | null } | null> | null } | null };

export type CancelVisitorStayMutationVariables = Exact<{
  _id: string;
}>;


export type CancelVisitorStayMutation = { cancelVisitorStay: { _id: string | null, visitorId: string | null, fromDate: string | null, toDate: string | null, numOfDays: number | null, stayReason: string | null, cancelledDate: string | null } | null };

export type CreateVisitorStayMutationVariables = Exact<{
  visitorId: string;
  numOfDays: number;
  stayReason?: string | null | undefined;
  stayAllowedBy?: string | null | undefined;
  dutyId?: string | null | undefined;
  shiftId?: string | null | undefined;
}>;


export type CreateVisitorStayMutation = { createVisitorStay: { _id: string | null, visitorId: string | null, fromDate: string | null, toDate: string | null, stayReason: string | null, stayAllowedBy: string | null, dutyId: string | null, shiftId: string | null } | null };

export type EditVisitorStayByIdQueryVariables = Exact<{
  _id: string;
}>;


export type EditVisitorStayByIdQuery = { visitorStayById: { _id: string | null, visitorId: string | null, fromDate: string | null, toDate: string | null, numOfDays: number | null, stayReason: string | null, stayAllowedBy: string | null, dutyId: string | null, shiftId: string | null } | null };

export type VisitorStaysPagedVisitorStaysQueryVariables = Exact<{
  queryString: string;
}>;


export type VisitorStaysPagedVisitorStaysQuery = { pagedVisitorStays: { totalResults: number | null, data: Array<{ _id: string | null, visitorId: string | null, fromDate: string | null, toDate: string | null, numOfDays: number | null, stayReason: string | null, dutyShiftName: string | null, cancelledDate: string | null } | null> | null } | null };

export type UpdateVisitorStayMutationVariables = Exact<{
  _id: string;
  fromDate: string;
  toDate: string;
  stayReason?: string | null | undefined;
  stayAllowedBy?: string | null | undefined;
  dutyId?: string | null | undefined;
  shiftId?: string | null | undefined;
}>;


export type UpdateVisitorStayMutation = { updateVisitorStay: { _id: string | null, visitorId: string | null, fromDate: string | null, toDate: string | null, numOfDays: number | null, stayReason: string | null, stayAllowedBy: string | null, dutyId: string | null, shiftId: string | null } | null };

export type VerificationVisitorStayByIdQueryVariables = Exact<{
  _id: string;
}>;


export type VerificationVisitorStayByIdQuery = { visitorStayById: { _id: string | null, visitorId: string | null, fromDate: string | null, toDate: string | null, numOfDays: number | null, stayReason: string | null, stayAllowedBy: string | null, dutyName: string | null, shiftName: string | null, cancelledDate: string | null, isValid: boolean | null, refVisitor: { _id: string | null, name: string | null, parentName: string | null, referenceName: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber2: string | null, city: string | null, country: string | null, imageId: string | null, criminalRecord: string | null, otherNotes: string | null } | null } | null };

export type ViewVisitorStayByIdQueryVariables = Exact<{
  _id: string;
}>;


export type ViewVisitorStayByIdQuery = { visitorStayById: { _id: string | null, visitorId: string | null, fromDate: string | null, toDate: string | null, numOfDays: number | null, stayReason: string | null, stayAllowedBy: string | null, dutyShiftName: string | null } | null };

export type VisitorStayCardByIdQueryVariables = Exact<{
  _id: string;
}>;


export type VisitorStayCardByIdQuery = { visitorStayById: { _id: string | null, fromDate: string | null, toDate: string | null, stayReason: string | null, stayAllowedBy: string | null, dutyName: string | null, shiftName: string | null } | null };

export type VisitorStayCardSecurityVisitorByIdQueryVariables = Exact<{
  _id: string;
}>;


export type VisitorStayCardSecurityVisitorByIdQuery = { securityVisitorById: { _id: string | null, name: string | null, parentName: string | null, cnicNumber: string | null, referenceName: string | null, contactNumber1: string | null, city: string | null, country: string | null, criminalRecord: string | null, image: { _id: string | null, data: string | null } | null } | null };

export type ItemCategoriesByPhysicalStoreIdQueryVariables = Exact<{
  physicalStoreId: string;
}>;


export type ItemCategoriesByPhysicalStoreIdQuery = { itemCategoriesByPhysicalStoreId: Array<{ _id: string | null, name: string | null, physicalStoreId: string | null, stockItemCount: number | null } | null> | null };

export type LocationsByPhysicalStoreIdQueryVariables = Exact<{
  physicalStoreId: string;
}>;


export type LocationsByPhysicalStoreIdQuery = { locationsByPhysicalStoreId: Array<{ _id: string | null, name: string | null, physicalStoreId: string | null, parentId: string | null, description: string | null, isInUse: boolean | null, refParent: { _id: string | null, name: string | null } | null } | null> | null };

export type VendorsByPhysicalStoreIdQueryVariables = Exact<{
  physicalStoreId: string;
}>;


export type VendorsByPhysicalStoreIdQuery = { vendorsByPhysicalStoreId: Array<{ _id: string | null, name: string | null, physicalStoreId: string | null, contactPerson: string | null, contactNumber: string | null, address: string | null, notes: string | null, usageCount: number | null } | null> | null };

export type UseInventoryPhysicalStoreByIdQueryVariables = Exact<{
  id: string;
}>;


export type UseInventoryPhysicalStoreByIdQuery = { physicalStoreById: { _id: string | null, name: string | null } | null };

export type StockItemsByIdQueryVariables = Exact<{
  physicalStoreId: string;
  _ids: Array<string | null | undefined> | string;
}>;


export type StockItemsByIdQuery = { stockItemsById: Array<{ _id: string | null, name: string | null, formattedName: string | null, unitOfMeasurement: string | null } | null> | null };

export type AddIssuanceFormAttachmentMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
  attachmentId: string;
}>;


export type AddIssuanceFormAttachmentMutation = { addIssuanceFormAttachment: { _id: string | null, attachments: Array<{ _id: string | null, name: string | null, description: string | null, mimeType: string | null } | null> | null } | null };

export type ApproveIssuanceFormsMutationVariables = Exact<{
  physicalStoreId: string;
  _ids: Array<string | null | undefined> | string;
}>;


export type ApproveIssuanceFormsMutation = { approveIssuanceForms: Array<{ _id: string | null, issueDate: string | null, issuedBy: string | null, issuedTo: string | null, locationId: string | null, physicalStoreId: string | null, approvedOn: string | null, items: Array<{ stockItemId: string | null, quantity: number | null, isInflow: boolean | null } | null> | null, refIssuedTo: { _id: string | null, name: string | null } | null } | null> | null };

export type CreateIssuanceFormMutationVariables = Exact<{
  issueDate: string;
  issuedBy: string;
  issuedTo: string;
  handedOverTo?: string | null | undefined;
  physicalStoreId: string;
  locationId?: string | null | undefined;
  items?: Array<Types.ItemWithQuantityInput | null | undefined> | Types.ItemWithQuantityInput | null | undefined;
  notes?: string | null | undefined;
}>;


export type CreateIssuanceFormMutation = { createIssuanceForm: { _id: string | null, issueDate: string | null, physicalStoreId: string | null, locationId: string | null, notes: string | null, items: Array<{ stockItemId: string | null, quantity: number | null, isInflow: boolean | null } | null> | null } | null };

export type IssuanceFormByIdQueryVariables = Exact<{
  physicalStoreId: string;
  _id: string;
}>;


export type IssuanceFormByIdQuery = { issuanceFormById: { _id: string | null, issueDate: string | null, issuedBy: string | null, issuedTo: string | null, handedOverTo: string | null, locationId: string | null, physicalStoreId: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, approvedOn: string | null, approvedBy: string | null, notes: string | null, items: Array<{ stockItemId: string | null, quantity: number | null, isInflow: boolean | null, refStockItem: { _id: string | null, name: string | null, unitOfMeasurement: string | null } | null } | null> | null, refLocation: { _id: string | null, name: string | null } | null, refIssuedBy: { _id: string | null, name: string | null } | null, refIssuedTo: { _id: string | null, name: string | null } | null, attachments: Array<{ _id: string | null, name: string | null, description: string | null, mimeType: string | null } | null> | null } | null };

export type PagedIssuanceFormsQueryVariables = Exact<{
  physicalStoreId: string;
  queryString?: string | null | undefined;
}>;


export type PagedIssuanceFormsQuery = { pagedIssuanceForms: { totalResults: number | null, data: Array<{ _id: string | null, issueDate: string | null, issuedBy: string | null, issuedTo: string | null, handedOverTo: string | null, locationId: string | null, physicalStoreId: string | null, approvedOn: string | null, items: Array<{ stockItemId: string | null, quantity: number | null, isInflow: boolean | null, refStockItem: { _id: string | null, name: string | null, unitOfMeasurement: string | null } | null } | null> | null, attachments: Array<{ _id: string | null, name: string | null } | null> | null, refIssuedTo: { _id: string | null, name: string | null } | null, refLocation: { _id: string | null, name: string | null } | null } | null> | null } | null };

export type RemoveIssuanceFormAttachmentMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
  attachmentId: string;
}>;


export type RemoveIssuanceFormAttachmentMutation = { removeIssuanceFormAttachment: { _id: string | null, attachments: Array<{ _id: string | null, name: string | null, description: string | null, mimeType: string | null } | null> | null } | null };

export type RemoveIssuanceFormsMutationVariables = Exact<{
  physicalStoreId: string;
  _ids: Array<string | null | undefined> | string;
}>;


export type RemoveIssuanceFormsMutation = { removeIssuanceForms: number | null };

export type UpdateIssuanceFormMutationVariables = Exact<{
  _id: string;
  issueDate: string;
  issuedBy: string;
  issuedTo: string;
  handedOverTo?: string | null | undefined;
  locationId?: string | null | undefined;
  physicalStoreId: string;
  items?: Array<Types.ItemWithQuantityInput | null | undefined> | Types.ItemWithQuantityInput | null | undefined;
  notes?: string | null | undefined;
}>;


export type UpdateIssuanceFormMutation = { updateIssuanceForm: { _id: string | null, issueDate: string | null, locationId: string | null, physicalStoreId: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, notes: string | null, items: Array<{ stockItemId: string | null, quantity: number | null, isInflow: boolean | null } | null> | null, refIssuedBy: { _id: string | null, name: string | null } | null, refIssuedTo: { _id: string | null, name: string | null } | null } | null };

export type IssuanceFormsByMonthQueryVariables = Exact<{
  physicalStoreId: string;
  month: string;
}>;


export type IssuanceFormsByMonthQuery = { issuanceFormsByMonth: Array<{ _id: string | null, issueDate: string | null, locationId: string | null, items: Array<{ stockItemId: string | null, quantity: number | null, isInflow: boolean | null, refStockItem: { _id: string | null, name: string | null, imageId: string | null, categoryName: string | null, unitOfMeasurement: string | null } | null } | null> | null } | null> | null };

export type CreateItemCategoryMutationVariables = Exact<{
  name: string;
  physicalStoreId: string;
}>;


export type CreateItemCategoryMutation = { createItemCategory: { _id: string | null, name: string | null, physicalStoreId: string | null } | null };

export type ItemCategoryByIdQueryVariables = Exact<{
  _id: string;
  physicalStoreId: string;
}>;


export type ItemCategoryByIdQuery = { itemCategoryById: { _id: string | null, name: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type RemoveItemCategoryMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
}>;


export type RemoveItemCategoryMutation = { removeItemCategory: number | null };

export type UpdateItemCategoryMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
  name: string;
}>;


export type UpdateItemCategoryMutation = { updateItemCategory: { _id: string | null, name: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type CreateLocationMutationVariables = Exact<{
  name: string;
  physicalStoreId: string;
  parentId?: string | null | undefined;
  description?: string | null | undefined;
}>;


export type CreateLocationMutation = { createLocation: { _id: string | null, name: string | null, parentId: string | null, description: string | null } | null };

export type LocationByIdQueryVariables = Exact<{
  _id: string;
  physicalStoreId: string;
}>;


export type LocationByIdQuery = { locationById: { _id: string | null, name: string | null, parentId: string | null, description: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type RemoveLocationMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
}>;


export type RemoveLocationMutation = { removeLocation: number | null };

export type UpdateLocationMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
  name: string;
  parentId?: string | null | undefined;
  description?: string | null | undefined;
}>;


export type UpdateLocationMutation = { updateLocation: { _id: string | null, name: string | null, parentId: string | null, description: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type AddPurchaseFormAttachmentMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
  attachmentId: string;
}>;


export type AddPurchaseFormAttachmentMutation = { addPurchaseFormAttachment: { _id: string | null, attachments: Array<{ _id: string | null, name: string | null, description: string | null, mimeType: string | null } | null> | null } | null };

export type ApprovePurchaseFormsMutationVariables = Exact<{
  physicalStoreId: string;
  _ids: Array<string | null | undefined> | string;
}>;


export type ApprovePurchaseFormsMutation = { approvePurchaseForms: Array<{ _id: string | null, purchaseDate: string | null, receivedBy: string | null, purchasedBy: string | null, physicalStoreId: string | null, approvedOn: string | null, items: Array<{ stockItemId: string | null, quantity: number | null, isInflow: boolean | null } | null> | null } | null> | null };

export type CreatePurchaseFormMutationVariables = Exact<{
  purchaseDate: string;
  receivedBy: string;
  purchasedBy: string;
  physicalStoreId: string;
  locationId?: string | null | undefined;
  vendorId?: string | null | undefined;
  items?: Array<Types.ItemWithQuantityAndPriceInput | null | undefined> | Types.ItemWithQuantityAndPriceInput | null | undefined;
  notes?: string | null | undefined;
}>;


export type CreatePurchaseFormMutation = { createPurchaseForm: { _id: string | null, purchaseDate: string | null, physicalStoreId: string | null, locationId: string | null, vendorId: string | null, notes: string | null, items: Array<{ stockItemId: string | null, quantity: number | null, isInflow: boolean | null, price: number | null } | null> | null, refReceivedBy: { _id: string | null, name: string | null } | null, refPurchasedBy: { _id: string | null, name: string | null } | null } | null };

export type PagedPurchaseFormsQueryVariables = Exact<{
  physicalStoreId: string;
  queryString?: string | null | undefined;
}>;


export type PagedPurchaseFormsQuery = { pagedPurchaseForms: { totalResults: number | null, data: Array<{ _id: string | null, purchaseDate: string | null, receivedBy: string | null, purchasedBy: string | null, physicalStoreId: string | null, approvedOn: string | null, items: Array<{ stockItemId: string | null, quantity: number | null, isInflow: boolean | null, refStockItem: { _id: string | null, name: string | null, unitOfMeasurement: string | null } | null } | null> | null, attachments: Array<{ _id: string | null, name: string | null } | null> | null, refReceivedBy: { _id: string | null, name: string | null } | null, refPurchasedBy: { _id: string | null, name: string | null } | null, refLocation: { _id: string | null, name: string | null } | null } | null> | null } | null };

export type InventoryPurchaseFormByIdQueryVariables = Exact<{
  _id: string;
  physicalStoreId: string;
}>;


export type InventoryPurchaseFormByIdQuery = { purchaseFormById: { _id: string | null, purchaseDate: string | null, receivedBy: string | null, purchasedBy: string | null, physicalStoreId: string | null, locationId: string | null, vendorId: string | null, approvedOn: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, notes: string | null, items: Array<{ stockItemId: string | null, quantity: number | null, isInflow: boolean | null, price: number | null, refStockItem: { _id: string | null, name: string | null, unitOfMeasurement: string | null } | null } | null> | null, attachments: Array<{ _id: string | null, name: string | null, description: string | null, mimeType: string | null } | null> | null, refReceivedBy: { _id: string | null, name: string | null } | null, refPurchasedBy: { _id: string | null, name: string | null } | null, refVendor: { _id: string | null, name: string | null } | null, refLocation: { _id: string | null, name: string | null } | null } | null };

export type RemovePurchaseFormAttachmentMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
  attachmentId: string;
}>;


export type RemovePurchaseFormAttachmentMutation = { removePurchaseFormAttachment: { _id: string | null, attachments: Array<{ _id: string | null, name: string | null, description: string | null, mimeType: string | null } | null> | null } | null };

export type RemovePurchaseFormsMutationVariables = Exact<{
  physicalStoreId: string;
  _ids: Array<string | null | undefined> | string;
}>;


export type RemovePurchaseFormsMutation = { removePurchaseForms: number | null };

export type UpdatePurchaseFormMutationVariables = Exact<{
  _id: string;
  purchaseDate: string;
  receivedBy: string;
  purchasedBy: string;
  physicalStoreId: string;
  locationId?: string | null | undefined;
  vendorId?: string | null | undefined;
  items?: Array<Types.ItemWithQuantityAndPriceInput | null | undefined> | Types.ItemWithQuantityAndPriceInput | null | undefined;
  notes?: string | null | undefined;
}>;


export type UpdatePurchaseFormMutation = { updatePurchaseForm: { _id: string | null, purchaseDate: string | null, physicalStoreId: string | null, locationId: string | null, vendorId: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, notes: string | null, items: Array<{ stockItemId: string | null, quantity: number | null, isInflow: boolean | null, price: number | null } | null> | null, refReceivedBy: { _id: string | null, name: string | null } | null, refPurchasedBy: { _id: string | null, name: string | null } | null } | null };

export type PurchaseFormsByMonthQueryVariables = Exact<{
  physicalStoreId: string;
  month: string;
}>;


export type PurchaseFormsByMonthQuery = { purchaseFormsByMonth: Array<{ _id: string | null, purchaseDate: string | null, locationId: string | null, items: Array<{ stockItemId: string | null, quantity: number | null, isInflow: boolean | null, price: number | null, refStockItem: { _id: string | null, name: string | null, imageId: string | null, categoryName: string | null, unitOfMeasurement: string | null } | null } | null> | null } | null> | null };

export type AllAccessiblePhysicalStoresQueryVariables = Exact<{ [key: string]: never; }>;


export type AllAccessiblePhysicalStoresQuery = { allAccessiblePhysicalStores: Array<{ _id: string | null, name: string | null } | null> | null };

export type ApproveStockAdjustmentsMutationVariables = Exact<{
  physicalStoreId: string;
  _ids: Array<string | null | undefined> | string;
}>;


export type ApproveStockAdjustmentsMutation = { approveStockAdjustments: Array<{ _id: string | null, physicalStoreId: string | null, stockItemId: string | null, adjustmentDate: string | null, adjustedBy: string | null, quantity: number | null, isInflow: boolean | null, adjustmentReason: string | null, approvedOn: string | null, approvedBy: string | null } | null> | null };

export type CreateStockAdjustmentMutationVariables = Exact<{
  physicalStoreId: string;
  stockItemId: string;
  adjustmentDate: string;
  adjustedBy: string;
  quantity: number;
  isInflow: boolean;
  adjustmentReason?: string | null | undefined;
}>;


export type CreateStockAdjustmentMutation = { createStockAdjustment: { _id: string | null, physicalStoreId: string | null, stockItemId: string | null, adjustmentDate: string | null, adjustedBy: string | null, quantity: number | null, isInflow: boolean | null, adjustmentReason: string | null } | null };

export type EditStockAdjustmentByIdQueryVariables = Exact<{
  _id: string;
  physicalStoreId: string;
}>;


export type EditStockAdjustmentByIdQuery = { stockAdjustmentById: { _id: string | null, physicalStoreId: string | null, stockItemId: string | null, adjustmentDate: string | null, adjustedBy: string | null, quantity: number | null, isInflow: boolean | null, adjustmentReason: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, refStockItem: { _id: string | null, name: string | null, formattedName: string | null } | null, refAdjustedBy: { _id: string | null, name: string | null } | null } | null };

export type PagedStockAdjustmentsQueryVariables = Exact<{
  physicalStoreId: string;
  queryString?: string | null | undefined;
}>;


export type PagedStockAdjustmentsQuery = { pagedStockAdjustments: { totalResults: number | null, data: Array<{ _id: string | null, physicalStoreId: string | null, stockItemId: string | null, adjustmentDate: string | null, adjustedBy: string | null, quantity: number | null, isInflow: boolean | null, adjustmentReason: string | null, approvedOn: string | null, refStockItem: { _id: string | null, formattedName: string | null, imageId: string | null } | null, refAdjustedBy: { _id: string | null, name: string | null } | null } | null> | null } | null };

export type RemoveStockAdjustmentsMutationVariables = Exact<{
  physicalStoreId: string;
  _ids: Array<string | null | undefined> | string;
}>;


export type RemoveStockAdjustmentsMutation = { removeStockAdjustments: number | null };

export type UpdateStockAdjustmentMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
  adjustmentDate: string;
  adjustedBy: string;
  quantity: number;
  isInflow: boolean;
  adjustmentReason?: string | null | undefined;
}>;


export type UpdateStockAdjustmentMutation = { updateStockAdjustment: { _id: string | null, physicalStoreId: string | null, stockItemId: string | null, adjustmentDate: string | null, adjustedBy: string | null, quantity: number | null, isInflow: boolean | null, adjustmentReason: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, refStockItem: { _id: string | null, name: string | null, formattedName: string | null } | null, refAdjustedBy: { _id: string | null, name: string | null } | null } | null };

export type ViewStockAdjustmentByIdQueryVariables = Exact<{
  _id: string;
  physicalStoreId: string;
}>;


export type ViewStockAdjustmentByIdQuery = { stockAdjustmentById: { _id: string | null, physicalStoreId: string | null, stockItemId: string | null, adjustmentDate: string | null, adjustedBy: string | null, quantity: number | null, isInflow: boolean | null, adjustmentReason: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, approvedOn: string | null, approvedBy: string | null, refStockItem: { _id: string | null, name: string | null, formattedName: string | null } | null, refAdjustedBy: { _id: string | null, name: string | null } | null } | null };

export type StockAdjustmentsByStockItemQueryVariables = Exact<{
  physicalStoreId: string;
  stockItemId: string;
}>;


export type StockAdjustmentsByStockItemQuery = { stockAdjustmentsByStockItem: Array<{ _id: string | null, physicalStoreId: string | null, stockItemId: string | null, adjustmentDate: string | null, adjustedBy: string | null, quantity: number | null, isInflow: boolean | null, adjustmentReason: string | null, approvedOn: string | null, refAdjustedBy: { _id: string | null, name: string | null } | null } | null> | null };

export type IssuanceFormsByStockItemQueryVariables = Exact<{
  physicalStoreId: string;
  stockItemId: string;
}>;


export type IssuanceFormsByStockItemQuery = { issuanceFormsByStockItem: Array<{ _id: string | null, issueDate: string | null, issuedBy: string | null, issuedTo: string | null, physicalStoreId: string | null, approvedOn: string | null, items: Array<{ stockItemId: string | null, quantity: number | null, isInflow: boolean | null, refStockItem: { _id: string | null, name: string | null } | null } | null> | null, refIssuedTo: { _id: string | null, name: string | null } | null, refLocation: { _id: string | null, name: string | null } | null } | null> | null };

export type PurchaseFormsByStockItemQueryVariables = Exact<{
  physicalStoreId: string;
  stockItemId: string;
}>;


export type PurchaseFormsByStockItemQuery = { purchaseFormsByStockItem: Array<{ _id: string | null, purchaseDate: string | null, receivedBy: string | null, purchasedBy: string | null, physicalStoreId: string | null, approvedOn: string | null, items: Array<{ stockItemId: string | null, quantity: number | null, isInflow: boolean | null, price: number | null, refStockItem: { _id: string | null, name: string | null } | null } | null> | null, refReceivedBy: { _id: string | null, name: string | null } | null, refPurchasedBy: { _id: string | null, name: string | null } | null } | null> | null };

export type CreateStockItemMutationVariables = Exact<{
  name: string;
  company?: string | null | undefined;
  details?: string | null | undefined;
  unitOfMeasurement: string;
  categoryId: string;
  physicalStoreId: string;
  minStockLevel?: number | null | undefined;
  currentStockLevel?: number | null | undefined;
}>;


export type CreateStockItemMutation = { createStockItem: { _id: string | null, name: string | null, company: string | null, details: string | null, unitOfMeasurement: string | null, categoryId: string | null, physicalStoreId: string | null, minStockLevel: number | null, currentStockLevel: number | null } | null };

export type MergeStockItemsMutationVariables = Exact<{
  _idToKeep: string;
  _idsToMerge: Array<string | null | undefined> | string;
  physicalStoreId: string;
}>;


export type MergeStockItemsMutation = { mergeStockItems: { _id: string | null, currentStockLevel: number | null, purchaseFormsCount: number | null, issuanceFormsCount: number | null, stockAdjustmentsCount: number | null } | null };

export type PagedStockItemsQueryVariables = Exact<{
  physicalStoreId: string;
  queryString?: string | null | undefined;
}>;


export type PagedStockItemsQuery = { pagedStockItems: { totalResults: number | null, data: Array<{ _id: string | null, name: string | null, formattedName: string | null, company: string | null, details: string | null, imageId: string | null, categoryName: string | null, unitOfMeasurement: string | null, minStockLevel: number | null, currentStockLevel: number | null, totalStockLevel: number | null, verifiedOn: string | null, purchaseFormsCount: number | null, issuanceFormsCount: number | null, stockAdjustmentsCount: number | null } | null> | null } | null };

export type RecalculateStockLevelsMutationVariables = Exact<{
  _ids: Array<string | null | undefined> | string;
  physicalStoreId: string;
}>;


export type RecalculateStockLevelsMutation = { recalculateStockLevels: Array<{ _id: string | null, currentStockLevel: number | null, purchaseFormsCount: number | null, issuanceFormsCount: number | null, stockAdjustmentsCount: number | null } | null> | null };

export type RemoveStockItemMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
}>;


export type RemoveStockItemMutation = { removeStockItem: number | null };

export type SetStockItemImageMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
  imageId: string;
}>;


export type SetStockItemImageMutation = { setStockItemImage: { _id: string | null, imageId: string | null } | null };

export type StockItemByIdQueryVariables = Exact<{
  _id: string;
  physicalStoreId: string;
}>;


export type StockItemByIdQuery = { stockItemById: { _id: string | null, physicalStoreId: string | null, name: string | null, company: string | null, details: string | null, imageId: string | null, categoryId: string | null, unitOfMeasurement: string | null, startingStockLevel: number | null, currentStockLevel: number | null, minStockLevel: number | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type UpdateStockItemMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
  name: string;
  company?: string | null | undefined;
  details?: string | null | undefined;
  unitOfMeasurement: string;
  categoryId: string;
  minStockLevel?: number | null | undefined;
}>;


export type UpdateStockItemMutation = { updateStockItem: { _id: string | null, physicalStoreId: string | null, name: string | null, company: string | null, details: string | null, categoryId: string | null, unitOfMeasurement: string | null, minStockLevel: number | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type VerifyStockItemLevelMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
}>;


export type VerifyStockItemLevelMutation = { verifyStockItemLevel: { _id: string | null, verifiedOn: string | null } | null };

export type CreateVendorMutationVariables = Exact<{
  name: string;
  physicalStoreId: string;
  contactPerson?: string | null | undefined;
  contactNumber?: string | null | undefined;
  address?: string | null | undefined;
  notes?: string | null | undefined;
}>;


export type CreateVendorMutation = { createVendor: { _id: string | null, name: string | null, physicalStoreId: string | null, contactPerson: string | null, contactNumber: string | null, address: string | null, notes: string | null } | null };

export type RemoveVendorMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
}>;


export type RemoveVendorMutation = { removeVendor: number | null };

export type UpdateVendorMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
  name: string;
  contactPerson?: string | null | undefined;
  contactNumber?: string | null | undefined;
  address?: string | null | undefined;
  notes?: string | null | undefined;
}>;


export type UpdateVendorMutation = { updateVendor: { _id: string | null, physicalStoreId: string | null, name: string | null, contactPerson: string | null, contactNumber: string | null, address: string | null, notes: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type VendorByIdQueryVariables = Exact<{
  _id: string;
  physicalStoreId: string;
}>;


export type VendorByIdQuery = { vendorById: { _id: string | null, physicalStoreId: string | null, name: string | null, contactPerson: string | null, contactNumber: string | null, address: string | null, notes: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };
