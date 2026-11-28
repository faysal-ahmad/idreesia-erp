import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ChangeEmployeeJobMutation,
  ChangeEmployeeJobMutationVariables,
  ConfirmEmployeeMutation,
  ConfirmEmployeeMutationVariables,
  EmploymentEventsByPersonIdQuery,
  EmploymentEventsByPersonIdQueryVariables,
  ExitEmployeeMutation,
  ExitEmployeeMutationVariables,
  HireEmployeeMutation,
  HireEmployeeMutationVariables,
  RejoinEmployeeMutation,
  RejoinEmployeeMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const HIRE_EMPLOYEE: TypedDocumentNode<
  HireEmployeeMutation,
  HireEmployeeMutationVariables
> = gql`
  mutation hireEmployee(
    $personId: String!
    $jobId: String!
    $jobShiftId: String
    $startDate: String!
    $onProbation: Boolean!
    $probationEndDate: String
    $remarks: String
  ) {
    hireEmployee(
      personId: $personId
      jobId: $jobId
      jobShiftId: $jobShiftId
      startDate: $startDate
      onProbation: $onProbation
      probationEndDate: $probationEndDate
      remarks: $remarks
    ) {
      _id
    }
  }
`;

export const REJOIN_EMPLOYEE: TypedDocumentNode<
  RejoinEmployeeMutation,
  RejoinEmployeeMutationVariables
> = gql`
  mutation rejoinEmployee(
    $personId: String!
    $jobId: String!
    $jobShiftId: String
    $startDate: String!
    $onProbation: Boolean!
    $probationEndDate: String
    $remarks: String
  ) {
    rejoinEmployee(
      personId: $personId
      jobId: $jobId
      jobShiftId: $jobShiftId
      startDate: $startDate
      onProbation: $onProbation
      probationEndDate: $probationEndDate
      remarks: $remarks
    ) {
      _id
    }
  }
`;

export const CONFIRM_EMPLOYEE: TypedDocumentNode<
  ConfirmEmployeeMutation,
  ConfirmEmployeeMutationVariables
> = gql`
  mutation confirmEmployee(
    $personId: String!
    $confirmationDate: String!
    $remarks: String
  ) {
    confirmEmployee(
      personId: $personId
      confirmationDate: $confirmationDate
      remarks: $remarks
    ) {
      _id
    }
  }
`;

export const CHANGE_EMPLOYEE_JOB: TypedDocumentNode<
  ChangeEmployeeJobMutation,
  ChangeEmployeeJobMutationVariables
> = gql`
  mutation changeEmployeeJob(
    $personId: String!
    $jobId: String!
    $jobShiftId: String
    $effectiveDate: String!
    $remarks: String
  ) {
    changeEmployeeJob(
      personId: $personId
      jobId: $jobId
      jobShiftId: $jobShiftId
      effectiveDate: $effectiveDate
      remarks: $remarks
    ) {
      _id
    }
  }
`;

export const EXIT_EMPLOYEE: TypedDocumentNode<
  ExitEmployeeMutation,
  ExitEmployeeMutationVariables
> = gql`
  mutation exitEmployee(
    $personId: String!
    $endDate: String!
    $exitReason: String!
    $remarks: String
  ) {
    exitEmployee(
      personId: $personId
      endDate: $endDate
      exitReason: $exitReason
      remarks: $remarks
    ) {
      _id
    }
  }
`;

export const EMPLOYMENT_EVENTS_BY_PERSON_ID: TypedDocumentNode<
  EmploymentEventsByPersonIdQuery,
  EmploymentEventsByPersonIdQueryVariables
> = gql`
  query employmentEventsByPersonId($personId: String!) {
    employmentEventsByPersonId(personId: $personId) {
      _id
      eventType
      effectiveDate
      exitReason
      details
      remarks
      createdAt
      createdBy
    }
  }
`;

/** Queries to refetch after any lifecycle change. */
export const LIFECYCLE_REFETCH_QUERIES = [
  'pagedHrEmployees',
  'hrEmployeeById',
  'employmentEventsByPersonId',
  'allJobs',
];
