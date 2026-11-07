import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

import type {
  MyCommitteesQuery,
  MyCommitteesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export type MyCommittee = NonNullable<
  NonNullable<MyCommitteesQuery['myCommittees']>[number]
>;

const MY_COMMITTEES: TypedDocumentNode<
  MyCommitteesQuery,
  MyCommitteesQueryVariables
> = gql`
  query myCommittees {
    myCommittees {
      _id
      name
      color
      features
    }
  }
`;

// Committees the logged-in user is currently a member of. Uses
// cache-and-network so a removed membership disappears on the next visit.
export const useMyCommittees = () => {
  const { data, loading } = useQuery(MY_COMMITTEES, {
    fetchPolicy: 'cache-and-network',
  });

  const committees = (data?.myCommittees ?? []).filter(
    (row): row is MyCommittee => row != null && row._id != null
  );

  return { committees, loading: loading && !data };
};
