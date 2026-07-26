// @ts-nocheck
import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

const allPhysicalStoresQuery = gql`
  query allPhysicalStores {
    allPhysicalStores {
      _id
      name
    }
  }
`;

export default () => WrappedComponent => {
  const WithAllPhysicalStores = props => {
    const { data, loading, ...queryResult } = useQuery(allPhysicalStoresQuery);

    return (
      <WrappedComponent
        {...props}
        {...queryResult}
        loading={loading}
        allPhysicalStoresLoading={loading}
        allPhysicalStores={data ? data.allPhysicalStores : null}
      />
    );
  };

  WithAllPhysicalStores.propTypes = {
    allPhysicalStoresLoading: PropTypes.bool,
    allPhysicalStores: PropTypes.array,
  };

  return WithAllPhysicalStores;
};
