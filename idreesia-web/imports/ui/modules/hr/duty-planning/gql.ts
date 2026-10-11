import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DutyPlanDaysQuery,
  DutyPlanDaysQueryVariables,
  DutyPlanTeamsQuery,
  DutyPlanTeamsQueryVariables,
  DutyPlanWeekQuery,
  DutyPlanWeekQueryVariables,
  SetDutyAttendanceMutation,
  SetDutyAttendanceMutationVariables,
  SetDutyDayOverrideMutation,
  SetDutyDayOverrideMutationVariables,
  SetDutyShiftTeamMutation,
  SetDutyShiftTeamMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const DUTY_PLAN_WEEK: TypedDocumentNode<
  DutyPlanWeekQuery,
  DutyPlanWeekQueryVariables
> = gql`
  query dutyPlanWeek($dutyId: String!, $locationId: String!) {
    dutyPlanWeek(dutyId: $dutyId, locationId: $locationId) {
      shifts {
        _id
        name
        startTime
        endTime
      }
      slots {
        shiftId
        teamId
        teamName
        teamColor
        startDate
      }
    }
  }
`;

export const DUTY_PLAN_DAYS: TypedDocumentNode<
  DutyPlanDaysQuery,
  DutyPlanDaysQueryVariables
> = gql`
  query dutyPlanDays(
    $dutyId: String!
    $locationId: String!
    $startDate: String!
  ) {
    dutyPlanDays(
      dutyId: $dutyId
      locationId: $locationId
      startDate: $startDate
    ) {
      startDate
      days {
        date
        dayOfWeek
        locked
        slots {
          shiftId
          shiftName
          teamName
          teamKarkuns {
            karkunId
            name
            off
            imageId
            imageThumbnailId
            attendance
          }
          addedKarkuns {
            karkunId
            name
            imageId
            imageThumbnailId
            attendance
          }
          addedKarkunIds
          absentKarkunIds
        }
      }
    }
  }
`;

export const DUTY_PLAN_TEAMS: TypedDocumentNode<
  DutyPlanTeamsQuery,
  DutyPlanTeamsQueryVariables
> = gql`
  query dutyPlanTeams {
    allTeams {
      _id
      name
      color
      dutyId
    }
  }
`;

export const SET_DUTY_SHIFT_TEAM: TypedDocumentNode<
  SetDutyShiftTeamMutation,
  SetDutyShiftTeamMutationVariables
> = gql`
  mutation setDutyShiftTeam(
    $dutyId: String!
    $locationId: String!
    $shiftId: String!
    $teamId: String
  ) {
    setDutyShiftTeam(
      dutyId: $dutyId
      locationId: $locationId
      shiftId: $shiftId
      teamId: $teamId
    )
  }
`;

export const SET_DUTY_DAY_OVERRIDE: TypedDocumentNode<
  SetDutyDayOverrideMutation,
  SetDutyDayOverrideMutationVariables
> = gql`
  mutation setDutyDayOverride(
    $dutyId: String!
    $locationId: String!
    $shiftId: String!
    $date: String!
    $addedKarkunIds: [String!]
    $absentKarkunIds: [String!]
  ) {
    setDutyDayOverride(
      dutyId: $dutyId
      locationId: $locationId
      shiftId: $shiftId
      date: $date
      addedKarkunIds: $addedKarkunIds
      absentKarkunIds: $absentKarkunIds
    )
  }
`;

export const SET_DUTY_ATTENDANCE: TypedDocumentNode<
  SetDutyAttendanceMutation,
  SetDutyAttendanceMutationVariables
> = gql`
  mutation setDutyAttendance(
    $dutyId: String!
    $locationId: String!
    $shiftId: String!
    $date: String!
    $karkunId: String!
    $status: String
  ) {
    setDutyAttendance(
      dutyId: $dutyId
      locationId: $locationId
      shiftId: $shiftId
      date: $date
      karkunId: $karkunId
      status: $status
    )
  }
`;
