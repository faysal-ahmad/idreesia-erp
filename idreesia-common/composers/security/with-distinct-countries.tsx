import React, { type ComponentType } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { useQuery } from '@apollo/client/react';

type AnyProps = Record<string, unknown>;

interface DistinctCountriesData {
  distinctCountries: string[];
}

const withDistinctCountriesQuery = gql`
  query distinctCountries {
    distinctCountries
  }
`;

export default () => (WrappedComponent: ComponentType<AnyProps>) => {
  const WithDistinctCountries: React.FC<AnyProps> = props => {
    const { data, loading, ...queryResult } = useQuery<DistinctCountriesData>(
      withDistinctCountriesQuery,
      {
        fetchPolicy: "no-cache",
      }
    );

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
