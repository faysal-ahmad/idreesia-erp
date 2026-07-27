import React, { type ComponentType } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

type AnyProps = Record<string, unknown>;

interface AllCitiesData {
  allCities: Array<{
    _id: string;
    name: string;
    peripheryOf?: string | null;
  }>;
}

const withAllCitiesQuery = gql`
  query allCities {
    allCities {
      _id
      name
      peripheryOf
    }
  }
`;

export default () => (WrappedComponent: ComponentType<AnyProps>) => {
  const WithAllCities: React.FC<AnyProps> = props => {
    const { data, loading, ...queryResult } = useQuery<AllCitiesData>(
      withAllCitiesQuery,
      {
        fetchPolicy: 'no-cache',
      }
    );

    return React.createElement(WrappedComponent as any, {
      ...props,
      ...queryResult,
      loading,
      allCitiesLoading: loading,
      allCities: data ? data.allCities : null,
    });
  };

  WithAllCities.propTypes = {
    allCitiesLoading: PropTypes.bool,
    allCities: PropTypes.array,
  };

  return WithAllCities;
};
