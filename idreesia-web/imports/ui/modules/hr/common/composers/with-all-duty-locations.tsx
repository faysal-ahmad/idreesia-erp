import React, { ComponentType } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import type {
  ComposerAllDutyLocationsQuery,
  ComposerAllDutyLocationsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

type AnyProps = Record<string, any>;

const ALL_DUTY_LOCATIONS_QUERY: TypedDocumentNode<
  ComposerAllDutyLocationsQuery,
  ComposerAllDutyLocationsQueryVariables
> = gql`
  query composerAllDutyLocations {
    allDutyLocations {
      _id
      name
    }
  }
`;

export const useAllDutyLocations = () => {
  const { data, loading, ...queryResult } = useQuery(ALL_DUTY_LOCATIONS_QUERY);

  return {
    ...queryResult,
    loading,
    allDutyLocationsLoading: loading,
    allDutyLocations: data?.allDutyLocations ?? null,
  };
};

export default () => (WrappedComponent: ComponentType<AnyProps>) => {
  const WithAllDutyLocations = (props: AnyProps) => {
    const allDutyLocationsProps = useAllDutyLocations();
    return React.createElement(WrappedComponent as any, { ...props, ...allDutyLocationsProps} as any);
  };

  WithAllDutyLocations.propTypes = {
    allDutyLocationsLoading: PropTypes.bool,
    allDutyLocations: PropTypes.array,
  };

  return WithAllDutyLocations;
};
