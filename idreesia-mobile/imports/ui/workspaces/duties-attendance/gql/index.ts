import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileDaAccessQuery,
  MobileDaAccessQueryVariables,
  MobileDaAddDutiesMutation,
  MobileDaAddDutiesMutationVariables,
  MobileDaAddDutyMemberMutation,
  MobileDaAddDutyMemberMutationVariables,
  MobileDaAttendanceSheetQuery,
  MobileDaAttendanceSheetQueryVariables,
  MobileDaDutiesQuery,
  MobileDaDutiesQueryVariables,
  MobileDaKarkunSearchQuery,
  MobileDaKarkunSearchQueryVariables,
  MobileDaMehfilDutiesQuery,
  MobileDaMehfilDutiesQueryVariables,
  MobileDaPlanDaysQuery,
  MobileDaPlanDaysQueryVariables,
  MobileDaRemoveDutyMemberMutation,
  MobileDaRemoveDutyMemberMutationVariables,
  MobileDaRemoveDutyMutation,
  MobileDaRemoveDutyMutationVariables,
  MobileDaSetAttendanceMutation,
  MobileDaSetAttendanceMutationVariables,
  MobileDaSetDayOverrideMutation,
  MobileDaSetDayOverrideMutationVariables,
  MobileDaUpdateDutyMemberMutation,
  MobileDaUpdateDutyMemberMutationVariables,
  MobileDaUpdateDutyMutation,
  MobileDaUpdateDutyMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

// Duties and Attendance of a mehfil: the same server operations as the web's
// Workspaces module. Each names the location and is checked against the
// caller's permissions there.

export const MOBILE_DA_ACCESS: TypedDocumentNode<MobileDaAccessQuery, MobileDaAccessQueryVariables> = gql`
  query mobileDaAccess($locationId: String!) {
    workspaceDaAccess(locationId: $locationId) {
      locationId
      permissions
    }
  }
`;

export const MOBILE_DA_DUTIES: TypedDocumentNode<MobileDaDutiesQuery, MobileDaDutiesQueryVariables> = gql`
  query mobileDaDuties($locationId: String!) {
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
    }
  }
`;

export const MOBILE_DA_MEHFIL_DUTIES: TypedDocumentNode<
  MobileDaMehfilDutiesQuery,
  MobileDaMehfilDutiesQueryVariables
> = gql`
  query mobileDaMehfilDuties($locationId: String!) {
    workspaceDaMehfilDuties(locationId: $locationId) {
      _id
      name
      description
    }
  }
`;

export const MOBILE_DA_PLAN_DAYS: TypedDocumentNode<MobileDaPlanDaysQuery, MobileDaPlanDaysQueryVariables> = gql`
  query mobileDaPlanDays($locationId: String!, $dutyId: String!, $startDate: String!) {
    workspaceDaPlanDays(locationId: $locationId, dutyId: $dutyId, startDate: $startDate) {
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
          contactNumber1
          contactNumber2
          attendance
        }
      }
    }
  }
`;

export const MOBILE_DA_ATTENDANCE_SHEET: TypedDocumentNode<
  MobileDaAttendanceSheetQuery,
  MobileDaAttendanceSheetQueryVariables
> = gql`
  query mobileDaAttendanceSheet($locationId: String!, $month: String!, $dutyId: String) {
    workspaceDaAttendanceSheet(locationId: $locationId, month: $month, dutyId: $dutyId) {
      _id
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

export const MOBILE_DA_KARKUN_SEARCH: TypedDocumentNode<
  MobileDaKarkunSearchQuery,
  MobileDaKarkunSearchQueryVariables
> = gql`
  query mobileDaKarkunSearch(
    $locationId: String!
    $name: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    workspaceDaKarkunSearch(
      locationId: $locationId
      name: $name
      phoneNumber: $phoneNumber
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        _id
        name
        parentName
        contactNumber1
        imageUrl
        imageThumbnailUrl
      }
    }
  }
`;

export const MOBILE_DA_ADD_DUTIES: TypedDocumentNode<
  MobileDaAddDutiesMutation,
  MobileDaAddDutiesMutationVariables
> = gql`
  mutation mobileDaAddDuties($locationId: String!, $mehfilDutyIds: [String!]!) {
    workspaceDaAddDuties(locationId: $locationId, mehfilDutyIds: $mehfilDutyIds) {
      _id
    }
  }
`;

export const MOBILE_DA_UPDATE_DUTY: TypedDocumentNode<
  MobileDaUpdateDutyMutation,
  MobileDaUpdateDutyMutationVariables
> = gql`
  mutation mobileDaUpdateDuty($locationId: String!, $dutyId: String!, $isActive: Boolean) {
    workspaceDaUpdateDuty(locationId: $locationId, dutyId: $dutyId, isActive: $isActive) {
      _id
    }
  }
`;

export const MOBILE_DA_REMOVE_DUTY: TypedDocumentNode<
  MobileDaRemoveDutyMutation,
  MobileDaRemoveDutyMutationVariables
> = gql`
  mutation mobileDaRemoveDuty($locationId: String!, $dutyId: String!) {
    workspaceDaRemoveDuty(locationId: $locationId, dutyId: $dutyId)
  }
`;

export const MOBILE_DA_ADD_DUTY_MEMBER: TypedDocumentNode<
  MobileDaAddDutyMemberMutation,
  MobileDaAddDutyMemberMutationVariables
> = gql`
  mutation mobileDaAddDutyMember($locationId: String!, $dutyId: String!, $karkunId: String!) {
    workspaceDaAddDutyMember(locationId: $locationId, dutyId: $dutyId, karkunId: $karkunId) {
      _id
    }
  }
`;

export const MOBILE_DA_UPDATE_DUTY_MEMBER: TypedDocumentNode<
  MobileDaUpdateDutyMemberMutation,
  MobileDaUpdateDutyMemberMutationVariables
> = gql`
  mutation mobileDaUpdateDutyMember(
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

export const MOBILE_DA_REMOVE_DUTY_MEMBER: TypedDocumentNode<
  MobileDaRemoveDutyMemberMutation,
  MobileDaRemoveDutyMemberMutationVariables
> = gql`
  mutation mobileDaRemoveDutyMember($locationId: String!, $dutyId: String!, $karkunId: String!) {
    workspaceDaRemoveDutyMember(locationId: $locationId, dutyId: $dutyId, karkunId: $karkunId) {
      _id
    }
  }
`;

export const MOBILE_DA_SET_DAY_OVERRIDE: TypedDocumentNode<
  MobileDaSetDayOverrideMutation,
  MobileDaSetDayOverrideMutationVariables
> = gql`
  mutation mobileDaSetDayOverride(
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

export const MOBILE_DA_SET_ATTENDANCE: TypedDocumentNode<
  MobileDaSetAttendanceMutation,
  MobileDaSetAttendanceMutationVariables
> = gql`
  mutation mobileDaSetAttendance(
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
