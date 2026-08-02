import { useQuery } from '@apollo/client/react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ComposerAllSecurityMehfilDutiesQuery,
  ComposerAllSecurityMehfilDutiesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const allSecurityMehfilDutiesQuery: TypedDocumentNode<
  ComposerAllSecurityMehfilDutiesQuery,
  ComposerAllSecurityMehfilDutiesQueryVariables
> = gql`
  query composerAllSecurityMehfilDuties($mehfilId: String) {
    allSecurityMehfilDuties(mehfilId: $mehfilId) {
      _id
      name
      urduName
      overallUsedCount
      mehfilUsedCount
    }
  }
`;

export type SecurityMehfilDuty = NonNullable<
  NonNullable<
    ComposerAllSecurityMehfilDutiesQuery['allSecurityMehfilDuties']
  >[number]
>;

export const useAllSecurityMehfilDuties = (mehfilId?: string) => {
  const { loading, data, refetch } = useQuery(allSecurityMehfilDutiesQuery, {
    variables: { mehfilId },
  });

  return {
    loading,
    allSecurityMehfilDutiesLoading: loading,
    allSecurityMehfilDuties: (data?.allSecurityMehfilDuties ?? []).filter(
      (duty): duty is SecurityMehfilDuty => duty != null
    ),
    refetchAllSecurityMehfilDuties: refetch,
  };
};
