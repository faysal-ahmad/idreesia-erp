import gql from 'graphql-tag';

// Every operation names the location whose Duties and Attendance workspace it
// works in, and declares the workspace permission it needs with
// @checkDutiesAttendanceAccess. A super-admin holds every permission.
export default gql`
type DaAccessType {
  locationId: String!
  permissions: [String!]!
}

# A location whose workspace the caller can open, or one of its ancestors
# (hasWorkspace false), listed so the locations show in their hierarchy.
type DaMyLocationType {
  locationId: String!
  name: String!
  type: String!
  parentId: String
  hasWorkspace: Boolean!
  permissions: [String!]!
}

type DaDutyMemberType {
  karkunId: String!
  isCoordinator: Boolean
  # Empty: every day.
  daysOfWeek: [String]
  karkun: PersonBasicType
}

type DaDutyType {
  _id: String!
  workspaceId: String!
  name: String!
  description: String
  isActive: Boolean!
  members: [DaDutyMemberType]!

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

type DaPlanKarkunType {
  karkunId: String!
  name: String
  # On the roster, but taken off for this day.
  off: Boolean!
  # Added for this day only.
  addedForDay: Boolean!
  imageUrl: String
  imageThumbnailUrl: String
  # present, late or absent; null when not marked.
  attendance: String
}

type DaPlanDayType {
  date: String!
  dayOfWeek: String!
  # Today and earlier: the roster is fixed and attendance can be marked.
  locked: Boolean!
  karkuns: [DaPlanKarkunType]!
  addedKarkunIds: [String]!
  absentKarkunIds: [String]!
}

type DaPlanDaysType {
  startDate: String!
  days: [DaPlanDayType]!
}

type DaAttendanceSheetRowType {
  _id: String!
  # MM-yyyy
  month: String!
  karkunId: String!
  name: String
  dutyId: String!
  dutyName: String
  daysOnDuty: Int!
  presentCount: Int!
  lateCount: Int!
  absentCount: Int!
  unmarkedCount: Int!
  percentage: Int!
}

extend type Query {
  myDutiesAttendanceLocations: [DaMyLocationType]!

  workspaceDaAccess(locationId: String!): DaAccessType
    @checkDutiesAttendanceAccess(permission: VIEW)

  workspaceDaDuties(locationId: String!): [DaDutyType]
    @checkDutiesAttendanceAccess(permission: VIEW)

  workspaceDaDutyById(locationId: String!, dutyId: String!): DaDutyType
    @checkDutiesAttendanceAccess(permission: VIEW)

  # Seven days of the duty's plan from startDate (YYYY-MM-DD).
  workspaceDaPlanDays(
    locationId: String!
    dutyId: String!
    startDate: String!
  ): DaPlanDaysType @checkDutiesAttendanceAccess(permission: VIEW)

  # Karkuns to choose from when building a duty roster.
  workspaceDaKarkunSearch(
    locationId: String!
    name: String
    cnicNumber: String
    phoneNumber: String
    pageIndex: String
    pageSize: String
  ): PagedWorkspaceKarkunType
    @checkDutiesAttendanceAccess(permission: MANAGE_AND_PLAN_DUTIES)

  # month is MM-yyyy; without dutyId, every duty of the workspace.
  workspaceDaAttendanceSheet(
    locationId: String!
    month: String!
    dutyId: String
  ): [DaAttendanceSheetRowType]
    @checkDutiesAttendanceAccess(permission: VIEW)
}

input DaGeoLocationInput {
  latitude: Float!
  longitude: Float!
  # Metres.
  accuracy: Float
}

extend type Mutation {
  workspaceDaCreateDuty(
    locationId: String!
    name: String!
    description: String
  ): DaDutyType @checkDutiesAttendanceAccess(permission: MANAGE_AND_PLAN_DUTIES)

  workspaceDaUpdateDuty(
    locationId: String!
    dutyId: String!
    name: String
    description: String
    isActive: Boolean
  ): DaDutyType @checkDutiesAttendanceAccess(permission: MANAGE_AND_PLAN_DUTIES)

  workspaceDaRemoveDuty(locationId: String!, dutyId: String!): Boolean
    @checkDutiesAttendanceAccess(permission: MANAGE_AND_PLAN_DUTIES)

  workspaceDaAddDutyMember(
    locationId: String!
    dutyId: String!
    karkunId: String!
    isCoordinator: Boolean
    daysOfWeek: [String]
  ): DaDutyType @checkDutiesAttendanceAccess(permission: MANAGE_AND_PLAN_DUTIES)

  workspaceDaUpdateDutyMember(
    locationId: String!
    dutyId: String!
    karkunId: String!
    isCoordinator: Boolean
    daysOfWeek: [String]
  ): DaDutyType @checkDutiesAttendanceAccess(permission: MANAGE_AND_PLAN_DUTIES)

  workspaceDaRemoveDutyMember(
    locationId: String!
    dutyId: String!
    karkunId: String!
  ): DaDutyType @checkDutiesAttendanceAccess(permission: MANAGE_AND_PLAN_DUTIES)

  # Plans a future day: people added for the day and members taken off it.
  workspaceDaSetDayOverride(
    locationId: String!
    dutyId: String!
    date: String!
    addedKarkunIds: [String]
    absentKarkunIds: [String]
  ): Boolean @checkDutiesAttendanceAccess(permission: MANAGE_AND_PLAN_DUTIES)

  # status is present, late or absent; null clears the mark. source (how it
  # was marked) and geo (where from) are optional and kept with the mark.
  workspaceDaSetAttendance(
    locationId: String!
    dutyId: String!
    date: String!
    karkunId: String!
    status: String
    source: String
    geo: DaGeoLocationInput
  ): Boolean @checkDutiesAttendanceAccess(permission: MARK_ATTENDANCE)
}
`;
