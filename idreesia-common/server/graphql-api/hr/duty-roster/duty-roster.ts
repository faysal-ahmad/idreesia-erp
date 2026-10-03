import gql from 'graphql-tag';

export default gql`
type DutyRosterType {
  _id: String
  dutyId: String
  locationId: String
  startDate: String
  endDate: String
  status: String
  duty: DutyType
  location: DutyLocationType

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

type PagedDutyRosterType {
  totalResults: Int
  data: [DutyRosterType]
}

type DutyRosterKarkunRefType {
  karkunId: String
  name: String
}

type DutyRosterWeekSlotType {
  shiftId: String
  teamId: String
  teamName: String
  teamColor: String
}

type DutyRosterWeekType {
  roster: DutyRosterType
  shifts: [DutyShiftType]
  slots: [DutyRosterWeekSlotType]
}

type DutyRosterResolvedSourceType {
  type: String
  teamId: String
  teamName: String
}

type DutyRosterResolvedKarkunType {
  karkunId: String
  name: String
  sources: [DutyRosterResolvedSourceType]
}

type DutyRosterDaySlotType {
  shiftId: String
  shiftName: String
  startTime: String
  endTime: String
  karkuns: [DutyRosterResolvedKarkunType]
  addedKarkunIds: [String]
  absentKarkunIds: [String]
  absentKarkuns: [DutyRosterKarkunRefType]
  fromSnapshot: Boolean
}

type DutyRosterDayType {
  date: String
  dayOfWeek: String
  inRange: Boolean
  isPast: Boolean
  slots: [DutyRosterDaySlotType]
}

type DutyRosterDaysKarkunType {
  karkunId: String
  name: String
  off: Boolean
}

type DutyRosterDaysSlotType {
  shiftId: String
  shiftName: String
  teamName: String
  teamKarkuns: [DutyRosterDaysKarkunType]
  addedKarkuns: [DutyRosterKarkunRefType]
  addedKarkunIds: [String]
  absentKarkunIds: [String]
}

type DutyRosterDaysDayType {
  date: String
  dayOfWeek: String
  inRange: Boolean
  isPast: Boolean
  slots: [DutyRosterDaysSlotType]
}

type DutyRosterDaysType {
  startDate: String
  days: [DutyRosterDaysDayType]
}

extend type Query {
  pagedDutyRosters(
    dutyId: String
    locationId: String
    status: String
    pageIndex: Int
    pageSize: Int
  ): PagedDutyRosterType
    @checkPermissions(permissions: [HR_VIEW_KARKUNS, HR_MANAGE_KARKUNS])
  activeDutyRosters(dutyId: String, locationId: String): [DutyRosterType]
    @checkPermissions(permissions: [HR_VIEW_KARKUNS, HR_MANAGE_KARKUNS])
  dutyRosterById(id: String!): DutyRosterType
    @checkPermissions(permissions: [HR_VIEW_KARKUNS, HR_MANAGE_KARKUNS])
  dutyRosterWeek(rosterId: String!): DutyRosterWeekType
    @checkPermissions(permissions: [HR_VIEW_KARKUNS, HR_MANAGE_KARKUNS])
  dutyRosterDay(rosterId: String!, date: String!): DutyRosterDayType
    @checkPermissions(permissions: [HR_VIEW_KARKUNS, HR_MANAGE_KARKUNS])
  dutyRosterDays(rosterId: String!, startDate: String!): DutyRosterDaysType
    @checkPermissions(permissions: [HR_VIEW_KARKUNS, HR_MANAGE_KARKUNS])
}

extend type Mutation {
  createDutyRoster(
    dutyId: String!
    locationId: String!
    startDate: String!
    endDate: String
  ): DutyRosterType
    @checkPermissions(permissions: [HR_MANAGE_KARKUNS])
  updateDutyRoster(id: String!, endDate: String): DutyRosterType
    @checkPermissions(permissions: [HR_MANAGE_KARKUNS])
  archiveDutyRoster(id: String!): DutyRosterType
    @checkPermissions(permissions: [HR_MANAGE_KARKUNS])
  setDutyRosterShiftTeam(
    rosterId: String!
    shiftId: String!
    teamId: String
  ): DutyRosterWeekType
    @checkPermissions(permissions: [HR_MANAGE_KARKUNS])
  setDutyRosterDayOverride(
    rosterId: String!
    shiftId: String!
    date: String!
    addedKarkunIds: [String!]
    absentKarkunIds: [String!]
  ): DutyRosterDayType
    @checkPermissions(permissions: [HR_MANAGE_KARKUNS])
}
`;
