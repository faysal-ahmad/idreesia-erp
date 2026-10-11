import gql from 'graphql-tag';

export default gql`
type DutyPlanWeekSlotType {
  shiftId: String
  teamId: String
  teamName: String
  teamColor: String
  startDate: String
}

type DutyPlanWeekType {
  shifts: [DutyShiftType]
  slots: [DutyPlanWeekSlotType]
}

type DutyPlanDaysKarkunType {
  karkunId: String
  name: String
  off: Boolean
  imageId: String
  imageThumbnailId: String
  attendance: String
}

type DutyPlanDaysSlotType {
  shiftId: String
  shiftName: String
  teamName: String
  teamKarkuns: [DutyPlanDaysKarkunType]
  addedKarkuns: [DutyPlanDaysKarkunType]
  addedKarkunIds: [String]
  absentKarkunIds: [String]
}

type DutyPlanDaysDayType {
  date: String
  dayOfWeek: String
  locked: Boolean
  slots: [DutyPlanDaysSlotType]
}

type DutyPlanDaysType {
  startDate: String
  days: [DutyPlanDaysDayType]
}

extend type Query {
  dutyPlanWeek(dutyId: String!, locationId: String!): DutyPlanWeekType
    @checkPermissions(permissions: [HR_VIEW_KARKUNS, HR_MANAGE_KARKUNS])
  dutyPlanDays(
    dutyId: String!
    locationId: String!
    startDate: String!
  ): DutyPlanDaysType
    @checkPermissions(permissions: [HR_VIEW_KARKUNS, HR_MANAGE_KARKUNS])
}

extend type Mutation {
  setDutyShiftTeam(
    dutyId: String!
    locationId: String!
    shiftId: String!
    teamId: String
  ): Boolean
    @checkPermissions(permissions: [HR_MANAGE_KARKUNS])
  setDutyDayOverride(
    dutyId: String!
    locationId: String!
    shiftId: String!
    date: String!
    addedKarkunIds: [String!]
    absentKarkunIds: [String!]
  ): Boolean
    @checkPermissions(permissions: [HR_MANAGE_KARKUNS])
  setDutyAttendance(
    dutyId: String!
    locationId: String!
    shiftId: String!
    date: String!
    karkunId: String!
    status: String
  ): Boolean
    @checkPermissions(permissions: [HR_MANAGE_KARKUNS])
}
`;
