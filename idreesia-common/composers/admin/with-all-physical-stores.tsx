import React, { type ComponentType } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

type AnyProps = Record<string, unknown>;

interface AllPhysicalStoresData {
  allPhysicalStores: Array<{
    _id: string;
    name: string;
  }>;
}

const allPhysicalStoresQuery = gql`
  query allPhysicalStores {
    allPhysicalStores {
      _id
      name
    }
  }
`;

export default () => (WrappedComponent: ComponentType<AnyProps>) => {
  const WithAllPhysicalStores: React.FC<AnyProps> = props => {
    const { data, loading, ...queryResult } = useQuery<AllPhysicalStoresData>(
      allPhysicalStoresQuery
    );

    return React.createElement(WrappedComponent as any, {
      ...props,
      ...queryResult,
      loading,
      allPhysicalStoresLoading: loading,
      allPhysicalStores: data ? data.allPhysicalStores : null,
    });
  };

  WithAllPhysicalStores.propTypes = {
    allPhysicalStoresLoading: PropTypes.bool,
    allPhysicalStores: PropTypes.array,
  };

  return WithAllPhysicalStores;
};
