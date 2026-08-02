import React, { ComponentType } from 'react';
import { useQuery } from '@apollo/client/react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ComposerAllSecurityMehfilDutiesQuery,
  ComposerAllSecurityMehfilDutiesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const withAllSecurityMehfilDutiesQuery: TypedDocumentNode<
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

type InjectedProps = {
  allSecurityMehfilDutiesLoading: boolean;
  allSecurityMehfilDuties: SecurityMehfilDuty[];
  refetchAllSecurityMehfilDuties(): void;
};

export const useAllSecurityMehfilDuties = (mehfilId?: string) => {
  const { loading, data, refetch } = useQuery(
    withAllSecurityMehfilDutiesQuery,
    {
      variables: { mehfilId },
    }
  );

  return {
    loading,
    allSecurityMehfilDutiesLoading: loading,
    allSecurityMehfilDuties: (data?.allSecurityMehfilDuties ?? []).filter(
      (duty): duty is SecurityMehfilDuty => duty != null
    ),
    refetchAllSecurityMehfilDuties: refetch,
  };
};

export default <P extends { mehfilId?: string }>() =>
  (WrappedComponent: ComponentType<P & InjectedProps>) => {
    const WithAllMehfilDuties = (props: P) => {
      const { mehfilId } = props;
      const allSecurityMehfilDutiesProps = useAllSecurityMehfilDuties(mehfilId);

      return (
        <WrappedComponent {...props} {...allSecurityMehfilDutiesProps} />
      );
    };

    return WithAllMehfilDuties;
  };
