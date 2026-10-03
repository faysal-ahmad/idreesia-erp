import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ArchiveDutyRosterMutation,
  ArchiveDutyRosterMutationVariables,
  CreateDutyRosterMutation,
  CreateDutyRosterMutationVariables,
  DutyRosterDayQuery,
  DutyRosterDayQueryVariables,
  DutyRosterDaysQuery,
  DutyRosterDaysQueryVariables,
  DutyRosterTeamsQuery,
  DutyRosterTeamsQueryVariables,
  DutyRosterWeekQuery,
  DutyRosterWeekQueryVariables,
  ActiveDutyRostersQuery,
  ActiveDutyRostersQueryVariables,
  SetDutyRosterDayOverrideMutation,
  SetDutyRosterDayOverrideMutationVariables,
  SetDutyRosterShiftTeamMutation,
  SetDutyRosterShiftTeamMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const ACTIVE_DUTY_ROSTERS: TypedDocumentNode<
  ActiveDutyRostersQuery,
  ActiveDutyRostersQueryVariables
> = gql`
  query activeDutyRosters($dutyId: String, $locationId: String) {
    activeDutyRosters(dutyId: $dutyId, locationId: $locationId) {
      _id
      dutyId
      locationId
      startDate
      endDate
      status
      duty {
        _id
        name
      }
      location {
        _id
        name
      }
    }
  }
`;

export const DUTY_ROSTER_WEEK: TypedDocumentNode<
  DutyRosterWeekQuery,
  DutyRosterWeekQueryVariables
> = gql`
  query dutyRosterWeek($rosterId: String!) {
    dutyRosterWeek(rosterId: $rosterId) {
      roster {
        _id
        dutyId
        locationId
        startDate
        endDate
        status
        duty {
          _id
          name
        }
        location {
          _id
          name
        }
      }
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
      }
    }
  }
`;

export const DUTY_ROSTER_DAY: TypedDocumentNode<
  DutyRosterDayQuery,
  DutyRosterDayQueryVariables
> = gql`
  query dutyRosterDay($rosterId: String!, $date: String!) {
    dutyRosterDay(rosterId: $rosterId, date: $date) {
      date
      dayOfWeek
      inRange
      isPast
      slots {
        shiftId
        shiftName
        startTime
        endTime
        fromSnapshot
        addedKarkunIds
        absentKarkunIds
        karkuns {
          karkunId
          name
          sources {
            type
            teamId
            teamName
          }
        }
        absentKarkuns {
          karkunId
          name
        }
      }
    }
  }
`;

export const DUTY_ROSTER_DAYS: TypedDocumentNode<
  DutyRosterDaysQuery,
  DutyRosterDaysQueryVariables
> = gql`
  query dutyRosterDays($rosterId: String!, $startDate: String!) {
    dutyRosterDays(rosterId: $rosterId, startDate: $startDate) {
      startDate
      days {
        date
        dayOfWeek
        inRange
        slots {
          shiftId
          shiftName
          teamName
          teamKarkuns {
            karkunId
            name
            off
          }
          addedKarkuns {
            karkunId
            name
          }
          addedKarkunIds
          absentKarkunIds
        }
      }
    }
  }
`;

export const DUTY_ROSTER_TEAMS: TypedDocumentNode<
  DutyRosterTeamsQuery,
  DutyRosterTeamsQueryVariables
> = gql`
  query dutyRosterTeams {
    allTeams {
      _id
      name
      color
      dutyId
    }
  }
`;

export const CREATE_DUTY_ROSTER: TypedDocumentNode<
  CreateDutyRosterMutation,
  CreateDutyRosterMutationVariables
> = gql`
  mutation createDutyRoster(
    $dutyId: String!
    $locationId: String!
    $startDate: String!
    $endDate: String
  ) {
    createDutyRoster(
      dutyId: $dutyId
      locationId: $locationId
      startDate: $startDate
      endDate: $endDate
    ) {
      _id
    }
  }
`;

export const ARCHIVE_DUTY_ROSTER: TypedDocumentNode<
  ArchiveDutyRosterMutation,
  ArchiveDutyRosterMutationVariables
> = gql`
  mutation archiveDutyRoster($id: String!) {
    archiveDutyRoster(id: $id) {
      _id
      status
      endDate
    }
  }
`;

export const SET_DUTY_ROSTER_SHIFT_TEAM: TypedDocumentNode<
  SetDutyRosterShiftTeamMutation,
  SetDutyRosterShiftTeamMutationVariables
> = gql`
  mutation setDutyRosterShiftTeam(
    $rosterId: String!
    $shiftId: String!
    $teamId: String
  ) {
    setDutyRosterShiftTeam(
      rosterId: $rosterId
      shiftId: $shiftId
      teamId: $teamId
    ) {
      roster {
        _id
      }
    }
  }
`;

export const SET_DUTY_ROSTER_DAY_OVERRIDE: TypedDocumentNode<
  SetDutyRosterDayOverrideMutation,
  SetDutyRosterDayOverrideMutationVariables
> = gql`
  mutation setDutyRosterDayOverride(
    $rosterId: String!
    $shiftId: String!
    $date: String!
    $addedKarkunIds: [String!]
    $absentKarkunIds: [String!]
  ) {
    setDutyRosterDayOverride(
      rosterId: $rosterId
      shiftId: $shiftId
      date: $date
      addedKarkunIds: $addedKarkunIds
      absentKarkunIds: $absentKarkunIds
    ) {
      date
    }
  }
`;
