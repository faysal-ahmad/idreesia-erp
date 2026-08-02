import { useQuery } from '@apollo/client/react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MehfilByIdQuery,
  MehfilByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const mehfilByIdQuery: TypedDocumentNode<
  MehfilByIdQuery,
  MehfilByIdQueryVariables
> = gql`
  query mehfilById($_id: String!) {
    mehfilById(_id: $_id) {
      _id
      name
      mehfilDate
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export const useMehfil = (mehfilId?: string) => {
  const { loading, data, refetch } = useQuery(mehfilByIdQuery, {
    variables: { _id: mehfilId ?? '' },
    skip: !mehfilId,
  });

  return {
    loading,
    mehfilLoading: loading,
    mehfilById: data?.mehfilById,
    refetchMehfil: refetch,
  };
};
