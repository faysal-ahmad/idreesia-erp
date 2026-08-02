import React, { ComponentType } from 'react';
import { useQuery } from '@apollo/client/react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ComposerSecurityMehfilDutyByIdQuery,
  ComposerSecurityMehfilDutyByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const securityMehfilDutyByIdQuery: TypedDocumentNode<
  ComposerSecurityMehfilDutyByIdQuery,
  ComposerSecurityMehfilDutyByIdQueryVariables
> = gql`
  query composerSecurityMehfilDutyById($id: String!) {
    securityMehfilDutyById(id: $id) {
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

type InjectedProps = {
  securityMehfilDutyByIdLoading: boolean;
  securityMehfilDutyById?: ComposerSecurityMehfilDutyByIdQuery['securityMehfilDutyById'];
  mehfilDutyById?: ComposerSecurityMehfilDutyByIdQuery['securityMehfilDutyById'];
};

export const useMehfilDuty = (mehfilDutyId?: string) => {
  const { loading, data, refetch } = useQuery(securityMehfilDutyByIdQuery, {
    variables: { id: mehfilDutyId ?? '' },
    skip: !mehfilDutyId,
  });

  return {
    loading,
    mehfilDutyById: data?.securityMehfilDutyById,
    securityMehfilDutyById: data?.securityMehfilDutyById,
    securityMehfilDutyByIdLoading: loading,
    refetchMehfilDuty: refetch,
  };
};

export default <P extends { mehfilDutyId?: string }>() =>
  (WrappedComponent: ComponentType<P & InjectedProps>) => {
    const WithMehfilDuty = (props: P) => {
      const { mehfilDutyId, ...rest } = props;
      const mehfilDutyProps = useMehfilDuty(mehfilDutyId);

      return (
        <WrappedComponent
          {...(rest as P)}
          mehfilDutyId={mehfilDutyId}
          mehfilDutyById={mehfilDutyProps.mehfilDutyById}
          securityMehfilDutyById={mehfilDutyProps.securityMehfilDutyById}
          securityMehfilDutyByIdLoading={mehfilDutyProps.securityMehfilDutyByIdLoading}
        />
      );
    };

    return WithMehfilDuty;
  };
