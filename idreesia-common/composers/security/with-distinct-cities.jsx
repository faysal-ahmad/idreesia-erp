import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { useQuery } from '@apollo/client/react';

const withDistinctCitiesQuery = gql`
  query distinctCities {
    distinctCities
  }
`;

export default () => WrappedComponent => {
  const WithDistinctCities = props => {
    const { data, loading, ...queryResult } = useQuery(withDistinctCitiesQuery, {
      fetchPolicy: "no-cache",
    });

    return (
      <WrappedComponent
        {...props}
        {...queryResult}
        loading={loading}
        distinctCitiesLoading={loading}
        distinctCities={data ? data.distinctCities : null}
      />
    );
  };

  WithDistinctCities.propTypes = {
    distinctCitiesLoading: PropTypes.bool,
    distinctCities: PropTypes.array,
  };

  return WithDistinctCities;
};
