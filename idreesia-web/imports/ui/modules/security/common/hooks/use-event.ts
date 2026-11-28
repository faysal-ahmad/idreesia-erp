import { useQuery } from '@apollo/client/react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SecurityEventByIdQuery,
  SecurityEventByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const securityEventByIdQuery: TypedDocumentNode<
  SecurityEventByIdQuery,
  SecurityEventByIdQueryVariables
> = gql`
  query securityEventById($_id: String!) {
    securityEventById(_id: $_id) {
      _id
      name
      eventDate
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export const useEvent = (eventId?: string) => {
  const { loading, data, refetch } = useQuery(securityEventByIdQuery, {
    variables: { _id: eventId ?? '' },
    skip: !eventId,
  });

  return {
    loading,
    eventLoading: loading,
    securityEventById: data?.securityEventById,
    refetchEvent: refetch,
  };
};
