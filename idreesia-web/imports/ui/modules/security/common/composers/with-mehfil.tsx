import React, { ComponentType } from 'react';
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

type InjectedProps = {
  mehfilLoading: boolean;
  mehfilById?: MehfilByIdQuery['mehfilById'];
};

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

export default <P extends { mehfilId?: string }>() =>
  (WrappedComponent: ComponentType<P & InjectedProps>) => {
    const WithMehfil = (props: P) => {
      const { mehfilId, ...rest } = props;
      const mehfilProps = useMehfil(mehfilId);

      return (
        <WrappedComponent
          {...(rest as P)}
          mehfilId={mehfilId}
          mehfilLoading={mehfilProps.mehfilLoading}
          mehfilById={mehfilProps.mehfilById}
        />
      );
    };

    return WithMehfil;
  };
