// @ts-nocheck
import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

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

export default () => WrappedComponent => {
  const WithAllCityMehfils = props => {
    const { data, loading, ...queryResult } = useQuery(withAllCityMehfilsQuery);

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
