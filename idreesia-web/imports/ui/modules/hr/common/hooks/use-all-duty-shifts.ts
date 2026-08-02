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

export const useAllDutyShifts = () => {
  const { data, loading, ...queryResult } = useQuery(ALL_DUTY_SHIFTS_QUERY);

  return {
    ...queryResult,
    loading,
    allDutyShiftsLoading: loading,
    allDutyShifts: data?.allDutyShifts ?? null,
  };
};
