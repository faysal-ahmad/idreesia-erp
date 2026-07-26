// @ts-nocheck
import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { useQuery } from '@apollo/client/react';

const withDistinctCountriesQuery = gql`
  query distinctCountries {
    distinctCountries
  }
`;

export default () => WrappedComponent => {
  const WithDistinctCountries = props => {
    const { data, loading, ...queryResult } = useQuery(withDistinctCountriesQuery, {
      fetchPolicy: "no-cache",
    });

    return (
      <WrappedComponent
        {...props}
        {...queryResult}
        loading={loading}
        distinctCountriesLoading={loading}
        distinctCountries={data ? data.distinctCountries : null}
      />
    );
  };

  WithDistinctCountries.propTypes = {
    distinctCountriesLoading: PropTypes.bool,
    distinctCountries: PropTypes.array,
  };

  return WithDistinctCountries;
};
