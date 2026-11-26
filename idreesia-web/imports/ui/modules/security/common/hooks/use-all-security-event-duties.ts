import { useQuery } from '@apollo/client/react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ComposerAllSecurityEventDutiesQuery,
  ComposerAllSecurityEventDutiesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const allSecurityEventDutiesQuery: TypedDocumentNode<
  ComposerAllSecurityEventDutiesQuery,
  ComposerAllSecurityEventDutiesQueryVariables
> = gql`
  query composerAllSecurityEventDuties($eventId: String) {
    allSecurityEventDuties(eventId: $eventId) {
      _id
      name
      urduName
      overallUsedCount
      eventUsedCount
    }
  }
`;

export type SecurityEventDuty = NonNullable<
  NonNullable<
    ComposerAllSecurityEventDutiesQuery['allSecurityEventDuties']
  >[number]
>;

export const useAllSecurityEventDuties = (eventId?: string) => {
  const { loading, data, refetch } = useQuery(allSecurityEventDutiesQuery, {
    variables: { eventId },
  });

  return {
    loading,
    allSecurityEventDutiesLoading: loading,
    allSecurityEventDuties: (data?.allSecurityEventDuties ?? []).filter(
      (duty): duty is SecurityEventDuty => duty != null
    ),
    refetchAllSecurityEventDuties: refetch,
  };
};
