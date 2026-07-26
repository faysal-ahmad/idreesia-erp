import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

const ALL_DUTY_LOCATIONS_QUERY = gql`
  query allDutyLocations {
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
    allDutyLocations: data ? data.allDutyLocations : null,
  };
};

export default () => WrappedComponent => {
  const WithAllDutyLocations = props => {
    const allDutyLocationsProps = useAllDutyLocations();
    return <WrappedComponent {...props} {...allDutyLocationsProps} />;
  };

  WithAllDutyLocations.propTypes = {
    allDutyLocationsLoading: PropTypes.bool,
    allDutyLocations: PropTypes.array,
  };

  return WithAllDutyLocations;
};
