import { useQuery } from '@apollo/client/react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ComposerSecurityEventDutyByIdQuery,
  ComposerSecurityEventDutyByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const securityEventDutyByIdQuery: TypedDocumentNode<
  ComposerSecurityEventDutyByIdQuery,
  ComposerSecurityEventDutyByIdQueryVariables
> = gql`
  query composerSecurityEventDutyById($id: String!) {
    securityEventDutyById(id: $id) {
      _id
      name
      urduName
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export const useEventDuty = (eventDutyId?: string) => {
  const { loading, data, refetch } = useQuery(securityEventDutyByIdQuery, {
    variables: { id: eventDutyId ?? '' },
    skip: !eventDutyId,
  });

  return {
    loading,
    eventDutyById: data?.securityEventDutyById,
    securityEventDutyById: data?.securityEventDutyById,
    securityEventDutyByIdLoading: loading,
    refetchEventDuty: refetch,
  };
};
