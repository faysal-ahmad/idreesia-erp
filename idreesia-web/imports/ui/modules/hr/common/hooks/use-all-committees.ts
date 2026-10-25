import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import type {
  ComposerAllCommitteesQuery,
  ComposerAllCommitteesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ALL_COMMITTEES_QUERY: TypedDocumentNode<
  ComposerAllCommitteesQuery,
  ComposerAllCommitteesQueryVariables
> = gql`
  query composerAllCommittees {
    allCommittees {
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
    allCommittees: data?.allCommittees ?? null,
  };
};
