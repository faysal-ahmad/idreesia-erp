import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import type {
  ReferenceDutyShiftsQuery,
  ReferenceDutyShiftsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const QUERY: TypedDocumentNode<
  ReferenceDutyShiftsQuery,
  ReferenceDutyShiftsQueryVariables
> = gql`
  query referenceDutyShifts {
    referenceDutyShifts {
      _id
      dutyId
      name
    }
  }
`;

const useReferenceDutyShifts = () => {
  const { data, loading } = useQuery(QUERY);
  return {
    referenceDutyShifts: data?.referenceDutyShifts ?? null,
    referenceDutyShiftsLoading: loading,
  };
};

export default useReferenceDutyShifts;
