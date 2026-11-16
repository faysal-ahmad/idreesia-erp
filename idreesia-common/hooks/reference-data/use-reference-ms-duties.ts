import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import type {
  ReferenceMsDutiesQuery,
  ReferenceMsDutiesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const QUERY: TypedDocumentNode<
  ReferenceMsDutiesQuery,
  ReferenceMsDutiesQueryVariables
> = gql`
  query referenceMsDuties {
    referenceMsDuties {
      _id
      name
    }
  }
`;

const useReferenceMsDuties = () => {
  const { data, loading } = useQuery(QUERY);
  return {
    referenceMsDuties: data?.referenceMsDuties ?? null,
    referenceMsDutiesLoading: loading,
  };
};

export default useReferenceMsDuties;
