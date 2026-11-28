import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import type {
  ComposerHrCommitteeOptionsQuery,
  ComposerHrCommitteeOptionsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ALL_COMMITTEES_QUERY: TypedDocumentNode<
  ComposerHrCommitteeOptionsQuery,
  ComposerHrCommitteeOptionsQueryVariables
> = gql`
  query composerHrCommitteeOptions {
    hrCommitteeOptions {
      _id
      name
    }
  }
`;

export const useAllCommittees = () => {
  const { data, loading, ...queryResult } = useQuery(ALL_COMMITTEES_QUERY);

  return {
    ...queryResult,
    loading,
    allCommitteesLoading: loading,
    allCommittees: data?.hrCommitteeOptions ?? null,
  };
};
