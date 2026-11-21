import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';

import type {
  MyDutiesAttendanceLocationsQuery,
  MyDutiesAttendanceLocationsQueryVariables,
  WorkspaceDaAccessQuery,
  WorkspaceDaAccessQueryVariables,
  WorkspaceDaAddDutyMemberMutation,
  WorkspaceDaAddDutyMemberMutationVariables,
  WorkspaceDaAttendanceSheetQuery,
  WorkspaceDaAttendanceSheetQueryVariables,
  WorkspaceDaAddDutiesMutation,
  WorkspaceDaAddDutiesMutationVariables,
  WorkspaceDaDutiesQuery,
  WorkspaceDaDutiesQueryVariables,
  WorkspaceDaMehfilDutiesQuery,
  WorkspaceDaMehfilDutiesQueryVariables,
  WorkspaceDaKarkunSearchQuery,
  WorkspaceDaKarkunSearchQueryVariables,
  WorkspaceDaPlanDaysQuery,
  WorkspaceDaPlanDaysQueryVariables,
  WorkspaceDaRemoveDutyMutation,
  WorkspaceDaRemoveDutyMutationVariables,
  WorkspaceDaRemoveDutyMemberMutation,
  WorkspaceDaRemoveDutyMemberMutationVariables,
  WorkspaceDaSetAttendanceMutation,
  WorkspaceDaSetAttendanceMutationVariables,
  WorkspaceDaSetDayOverrideMutation,
  WorkspaceDaSetDayOverrideMutationVariables,
  WorkspaceDaUpdateDutyMutation,
  WorkspaceDaUpdateDutyMutationVariables,
  WorkspaceDaUpdateDutyMemberMutation,
  WorkspaceDaUpdateDutyMemberMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const MY_DUTIES_ATTENDANCE_LOCATIONS: TypedDocumentNode<
  MyDutiesAttendanceLocationsQuery,
  MyDutiesAttendanceLocationsQueryVariables
> = gql`
  query myDutiesAttendanceLocations {
    myDutiesAttendanceLocations {
      locationId
      name
      type
      parentId
      hasWorkspace
      permissions
    }
  }
`;

export const WORKSPACE_DA_ACCESS: TypedDocumentNode<
  WorkspaceDaAccessQuery,
  WorkspaceDaAccessQueryVariables
> = gql`
  query workspaceDaAccess($locationId: String!) {
    workspaceDaAccess(locationId: $locationId) {
      locationId
      permissions
    }
  }
`;

export const WORKSPACE_DA_DUTIES: TypedDocumentNode<
  WorkspaceDaDutiesQuery,
  WorkspaceDaDutiesQueryVariables
> = gql`
  query workspaceDaDuties($locationId: String!) {
    workspaceDaDuties(locationId: $locationId) {
      _id
      mehfilDutyId
      name
      description
      isActive
      members {
        karkunId
        isCoordinator
        daysOfWeek
        karkun {
          _id
          sharedData {
            name
            contactNumber1
            contactNumber2
            imageUrl
            imageThumbnailUrl
          }
        }
      }
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export const WORKSPACE_DA_MEHFIL_DUTIES: TypedDocumentNode<
  WorkspaceDaMehfilDutiesQuery,
  WorkspaceDaMehfilDutiesQueryVariables
> = gql`
  query workspaceDaMehfilDuties($locationId: String!) {
    workspaceDaMehfilDuties(locationId: $locationId) {
      _id
      name
      description
    }
  }
`;

export const WORKSPACE_DA_PLAN_DAYS: TypedDocumentNode<
  WorkspaceDaPlanDaysQuery,
  WorkspaceDaPlanDaysQueryVariables
> = gql`
  query workspaceDaPlanDays(
    $locationId: String!
    $dutyId: String!
    $startDate: String!
  ) {
    workspaceDaPlanDays(
      locationId: $locationId
      dutyId: $dutyId
      startDate: $startDate
    ) {
      startDate
      days {
        date
        dayOfWeek
        locked
        addedKarkunIds
        absentKarkunIds
        karkuns {
          karkunId
          name
          off
          addedForDay
          imageUrl
          imageThumbnailUrl
          attendance
        }
      }
    }
  }
`;

export const WORKSPACE_DA_ATTENDANCE_SHEET: TypedDocumentNode<
  WorkspaceDaAttendanceSheetQuery,
  WorkspaceDaAttendanceSheetQueryVariables
> = gql`
  query workspaceDaAttendanceSheet(
    $locationId: String!
    $month: String!
    $dutyId: String
  ) {
    workspaceDaAttendanceSheet(
      locationId: $locationId
      month: $month
      dutyId: $dutyId
    ) {
      _id
      month
      karkunId
      name
      dutyId
      dutyName
      daysOnDuty
      presentCount
      lateCount
      absentCount
      unmarkedCount
      percentage
    }
  }
`;

export const WORKSPACE_DA_KARKUN_SEARCH: TypedDocumentNode<
  WorkspaceDaKarkunSearchQuery,
  WorkspaceDaKarkunSearchQueryVariables
> = gql`
  query workspaceDaKarkunSearch(
    $locationId: String!
    $name: String
    $cnicNumber: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    workspaceDaKarkunSearch(
      locationId: $locationId
      name: $name
      cnicNumber: $cnicNumber
      phoneNumber: $phoneNumber
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        _id
        name
        parentName
        cnicNumber
        contactNumber1
        imageUrl
        imageThumbnailUrl
      }
    }
  }
`;

export const WORKSPACE_DA_ADD_DUTIES: TypedDocumentNode<
  WorkspaceDaAddDutiesMutation,
  WorkspaceDaAddDutiesMutationVariables
> = gql`
  mutation workspaceDaAddDuties(
    $locationId: String!
    $mehfilDutyIds: [String!]!
  ) {
    workspaceDaAddDuties(
      locationId: $locationId
      mehfilDutyIds: $mehfilDutyIds
    ) {
      _id
    }
  }
`;

export const WORKSPACE_DA_UPDATE_DUTY: TypedDocumentNode<
  WorkspaceDaUpdateDutyMutation,
  WorkspaceDaUpdateDutyMutationVariables
> = gql`
  mutation workspaceDaUpdateDuty(
    $locationId: String!
    $dutyId: String!
    $isActive: Boolean
  ) {
    workspaceDaUpdateDuty(
      locationId: $locationId
      dutyId: $dutyId
      isActive: $isActive
    ) {
      _id
    }
  }
`;

export const WORKSPACE_DA_REMOVE_DUTY: TypedDocumentNode<
  WorkspaceDaRemoveDutyMutation,
  WorkspaceDaRemoveDutyMutationVariables
> = gql`
  mutation workspaceDaRemoveDuty($locationId: String!, $dutyId: String!) {
    workspaceDaRemoveDuty(locationId: $locationId, dutyId: $dutyId)
  }
`;

export const WORKSPACE_DA_ADD_DUTY_MEMBER: TypedDocumentNode<
  WorkspaceDaAddDutyMemberMutation,
  WorkspaceDaAddDutyMemberMutationVariables
> = gql`
  mutation workspaceDaAddDutyMember(
    $locationId: String!
    $dutyId: String!
    $karkunId: String!
    $isCoordinator: Boolean
    $daysOfWeek: [String]
  ) {
    workspaceDaAddDutyMember(
      locationId: $locationId
      dutyId: $dutyId
      karkunId: $karkunId
      isCoordinator: $isCoordinator
      daysOfWeek: $daysOfWeek
    ) {
      _id
    }
  }
`;

export const WORKSPACE_DA_UPDATE_DUTY_MEMBER: TypedDocumentNode<
  WorkspaceDaUpdateDutyMemberMutation,
  WorkspaceDaUpdateDutyMemberMutationVariables
> = gql`
  mutation workspaceDaUpdateDutyMember(
    $locationId: String!
    $dutyId: String!
    $karkunId: String!
    $isCoordinator: Boolean
    $daysOfWeek: [String]
  ) {
    workspaceDaUpdateDutyMember(
      locationId: $locationId
      dutyId: $dutyId
      karkunId: $karkunId
      isCoordinator: $isCoordinator
      daysOfWeek: $daysOfWeek
    ) {
      _id
    }
  }
`;

export const WORKSPACE_DA_REMOVE_DUTY_MEMBER: TypedDocumentNode<
  WorkspaceDaRemoveDutyMemberMutation,
  WorkspaceDaRemoveDutyMemberMutationVariables
> = gql`
  mutation workspaceDaRemoveDutyMember(
    $locationId: String!
    $dutyId: String!
    $karkunId: String!
  ) {
    workspaceDaRemoveDutyMember(
      locationId: $locationId
      dutyId: $dutyId
      karkunId: $karkunId
    ) {
      _id
    }
  }
`;

export const WORKSPACE_DA_SET_DAY_OVERRIDE: TypedDocumentNode<
  WorkspaceDaSetDayOverrideMutation,
  WorkspaceDaSetDayOverrideMutationVariables
> = gql`
  mutation workspaceDaSetDayOverride(
    $locationId: String!
    $dutyId: String!
    $date: String!
    $addedKarkunIds: [String]
    $absentKarkunIds: [String]
  ) {
    workspaceDaSetDayOverride(
      locationId: $locationId
      dutyId: $dutyId
      date: $date
      addedKarkunIds: $addedKarkunIds
      absentKarkunIds: $absentKarkunIds
    )
  }
`;

export const WORKSPACE_DA_SET_ATTENDANCE: TypedDocumentNode<
  WorkspaceDaSetAttendanceMutation,
  WorkspaceDaSetAttendanceMutationVariables
> = gql`
  mutation workspaceDaSetAttendance(
    $locationId: String!
    $dutyId: String!
    $date: String!
    $karkunId: String!
    $status: String
  ) {
    workspaceDaSetAttendance(
      locationId: $locationId
      dutyId: $dutyId
      date: $date
      karkunId: $karkunId
      status: $status
    )
  }
`;
