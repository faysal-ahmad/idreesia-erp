import React, { ComponentType } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import type {
  ComposerAllMsDutiesQuery,
  ComposerAllMsDutiesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

type AnyProps = Record<string, any>;

const ALL_MS_DUTIES_QUERY: TypedDocumentNode<
  ComposerAllMsDutiesQuery,
  ComposerAllMsDutiesQueryVariables
> = gql`
  query composerAllMSDuties {
    allMSDuties {
      _id
      name
    }
  }
`;

export const useAllMSDuties = () => {
  const { data, loading, ...queryResult } = useQuery(ALL_MS_DUTIES_QUERY);

  return {
    ...queryResult,
    loading,
    allMSDutiesLoading: loading,
    allMSDuties: data?.allMSDuties ?? null,
  };
};

export default () => (WrappedComponent: ComponentType<AnyProps>) => {
  const WithAllMSDuties = (props: AnyProps) => {
    const allMSDutiesProps = useAllMSDuties();
    return React.createElement(WrappedComponent as any, { ...props, ...allMSDutiesProps} as any);
  };

  WithAllMSDuties.propTypes = {
    allMSDutiesLoading: PropTypes.bool,
    allMSDuties: PropTypes.array,
  };

  return WithAllMSDuties;
};
