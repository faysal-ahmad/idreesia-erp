import React, { ComponentType } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';


type AnyProps = Record<string, any>;
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

export const useLocationsByPhysicalStore = (physicalStoreId: string) => {
  const { data, loading, ...queryResult } = useQuery(locationsListQuery as any, {
    variables: { physicalStoreId },
  });

  return {
    ...queryResult,
    loading,
    locationsLoading: loading,
    locationsByPhysicalStoreId: (data as any)?.locationsByPhysicalStoreId ?? null,
  };
};

export default () => (WrappedComponent: ComponentType<AnyProps>) => {
  const WithLocationsByPhysicalStore = (props: AnyProps) => {
    const { physicalStoreId } = props;
    const locationsProps = useLocationsByPhysicalStore(physicalStoreId);

    return React.createElement(WrappedComponent as any, { ...props, ...locationsProps });
  };

  WithLocationsByPhysicalStore.propTypes = {
    physicalStoreId: PropTypes.string,
    locationsLoading: PropTypes.bool,
    locationsByPhysicalStoreId: PropTypes.array,
  };

  return WithLocationsByPhysicalStore;
};
