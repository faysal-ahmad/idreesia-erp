import React, { ComponentType } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

type AnyProps = Record<string, any>;
interface QueryData { allDutyLocations?: unknown[] | null; }

const ALL_DUTY_LOCATIONS_QUERY = gql`
  query composerAllDutyLocations {
    allDutyLocations {
      _id
      name
    }
  }
`;

export const useAllDutyLocations = () => {
  const { data, loading, ...queryResult } = useQuery(ALL_DUTY_LOCATIONS_QUERY as any);

  return {
    ...queryResult,
    loading,
    allDutyLocationsLoading: loading,
    allDutyLocations: data ? (data as QueryData).allDutyLocations : null,
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
