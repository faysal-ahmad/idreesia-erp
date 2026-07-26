import React, { type ComponentType } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

type AnyProps = Record<string, unknown>;

interface AllCityMehfilsData {
  allCityMehfils: Array<{
    _id: string;
    cityId: string;
    name: string;
    address?: string | null;
  }>;
}

const withAllCityMehfilsQuery = gql`
  query allCityMehfils {
    allCityMehfils {
      _id
      cityId
      name
      address
    }
  }
`;

export default () => (WrappedComponent: ComponentType<AnyProps>) => {
  const WithAllCityMehfils: React.FC<AnyProps> = props => {
    const { data, loading, ...queryResult } = useQuery<AllCityMehfilsData>(
      withAllCityMehfilsQuery
    );

    return (
      <WrappedComponent
        {...props}
        {...queryResult}
        loading={loading}
        allCityMehfilsLoading={loading}
        allCityMehfils={data ? data.allCityMehfils : null}
      />
    );
  };

  WithAllCityMehfils.propTypes = {
    allCityMehfilsLoading: PropTypes.bool,
    allCityMehfils: PropTypes.array,
  };

  return WithAllCityMehfils;
};
