// @ts-nocheck
import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

const physicalStoreByIdQuery = gql`
  query physicalStoreById($id: String!) {
    physicalStoreById(id: $id) {
      _id
      name
    }
  }
`;

export const usePhysicalStore = physicalStoreId => {
  const { data, loading, ...queryResult } = useQuery(physicalStoreByIdQuery, {
    variables: { id: physicalStoreId },
  });

  return {
    ...queryResult,
    loading,
    physicalStoreLoading: loading,
    physicalStoreById: data ? data.physicalStoreById : null,
  };
};

export default () => WrappedComponent => {
  const WithPhysicalStore = props => {
    const { physicalStoreId } = props;
    const physicalStoreProps = usePhysicalStore(physicalStoreId);
    const { physicalStoreById, ...restPhysicalStoreProps } = physicalStoreProps;

    return (
      <WrappedComponent
        {...props}
        {...restPhysicalStoreProps}
        physicalStore={physicalStoreById}
      />
    );
  };

  WithPhysicalStore.propTypes = {
    physicalStoreId: PropTypes.string,
    physicalStoreLoading: PropTypes.bool,
    physicalStoreById: PropTypes.object,
  };

  return WithPhysicalStore;
};
