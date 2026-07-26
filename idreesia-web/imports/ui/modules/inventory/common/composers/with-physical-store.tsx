import React, { ComponentType } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';


type AnyProps = Record<string, any>;
const physicalStoreByIdQuery = gql`
  query physicalStoreById($id: String!) {
    physicalStoreById(id: $id) {
      _id
      name
    }
  }
`;

export const usePhysicalStore = (physicalStoreId: string) => {
  const { data, loading, ...queryResult } = useQuery(physicalStoreByIdQuery as any, {
    variables: { id: physicalStoreId },
  });

  return {
    ...queryResult,
    loading,
    physicalStoreLoading: loading,
    physicalStoreById: (data as any)?.physicalStoreById ?? null,
  };
};

export default () => (WrappedComponent: ComponentType<AnyProps>) => {
  const WithPhysicalStore = (props: AnyProps) => {
    const { physicalStoreId } = props;
    const physicalStoreProps = usePhysicalStore(physicalStoreId);
    const { physicalStoreById, ...restPhysicalStoreProps } = physicalStoreProps;

    return React.createElement(WrappedComponent as any, {
      ...props,
      ...restPhysicalStoreProps,
      physicalStore: physicalStoreById,
    });
  };

  WithPhysicalStore.propTypes = {
    physicalStoreId: PropTypes.string,
    physicalStoreLoading: PropTypes.bool,
    physicalStoreById: PropTypes.object,
  };

  return WithPhysicalStore;
};
