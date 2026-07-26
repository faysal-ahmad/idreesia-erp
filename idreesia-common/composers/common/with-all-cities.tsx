// @ts-nocheck
import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

const withAllCitiesQuery = gql`
  query allCities {
    allCities {
      _id
      name
      peripheryOf
    }
  }
`;

export default () => WrappedComponent => {
  const WithAllCities = props => {
    const { data, loading, ...queryResult } = useQuery(withAllCitiesQuery, {
      fetchPolicy: 'no-cache',
    });

    return (
      <WrappedComponent
        {...props}
        {...queryResult}
        loading={loading}
        allCitiesLoading={loading}
        allCities={data ? data.allCities : null}
      />
    );
  };

  WithAllCities.propTypes = {
    allCitiesLoading: PropTypes.bool,
    allCities: PropTypes.array,
  };

  return WithAllCities;
};
