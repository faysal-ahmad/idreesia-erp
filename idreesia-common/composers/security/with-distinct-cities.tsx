import React, { type ComponentType } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { useQuery } from '@apollo/client/react';

type AnyProps = Record<string, unknown>;

interface DistinctCitiesData {
  distinctCities: string[];
}

const withDistinctCitiesQuery = gql`
  query distinctCities {
    distinctCities
  }
`;

export default () => (WrappedComponent: ComponentType<AnyProps>) => {
  const WithDistinctCities: React.FC<AnyProps> = props => {
    const { data, loading, ...queryResult } = useQuery<DistinctCitiesData>(
      withDistinctCitiesQuery,
      {
        fetchPolicy: "no-cache",
      }
    );

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
