import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import type {
  AllDutyShiftsQuery,
  AllDutyShiftsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ALL_DUTY_SHIFTS_QUERY: TypedDocumentNode<
  AllDutyShiftsQuery,
  AllDutyShiftsQueryVariables
> = gql`
  query allDutyShifts {
    allDutyShifts {
      _id
      dutyId
      name
      startTime
      endTime
    }
  }
`;

// skip: when the caller doesn't show duties (e.g. a person picker), so it
// doesn't load karkun management's data.
export const useAllDutyShifts = ({ skip = false }: { skip?: boolean } = {}) => {
  const { data, loading, ...queryResult } = useQuery(ALL_DUTY_SHIFTS_QUERY, { skip });

  return {
    ...queryResult,
    loading,
    allDutyShiftsLoading: loading,
    allDutyShifts: data?.allDutyShifts ?? null,
  };
};
