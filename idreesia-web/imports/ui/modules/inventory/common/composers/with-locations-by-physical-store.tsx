// @ts-nocheck
import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

const locationsListQuery = gql`
  query locationsByPhysicalStoreId($physicalStoreId: String!) {
    locationsByPhysicalStoreId(physicalStoreId: $physicalStoreId) {
      _id
      name
      physicalStoreId
      parentId
      description
      isInUse
      refParent {
        _id
        name
      }
    }
  }
`;

export const useLocationsByPhysicalStore = physicalStoreId => {
  const { data, loading, ...queryResult } = useQuery(locationsListQuery, {
    variables: { physicalStoreId },
  });

  return {
    ...queryResult,
    loading,
    locationsLoading: loading,
    locationsByPhysicalStoreId: data ? data.locationsByPhysicalStoreId : null,
  };
};

export default () => WrappedComponent => {
  const WithLocationsByPhysicalStore = props => {
    const { physicalStoreId } = props;
    const locationsProps = useLocationsByPhysicalStore(physicalStoreId);

    return <WrappedComponent {...props} {...locationsProps} />;
  };

  WithLocationsByPhysicalStore.propTypes = {
    physicalStoreId: PropTypes.string,
    locationsLoading: PropTypes.bool,
    locationsByPhysicalStoreId: PropTypes.array,
  };

  return WithLocationsByPhysicalStore;
};
