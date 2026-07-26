import React, { ComponentType } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';


type AnyProps = Record<string, any>;
const vendorsListQuery = gql`
  query vendorsByPhysicalStoreId($physicalStoreId: String!) {
    vendorsByPhysicalStoreId(physicalStoreId: $physicalStoreId) {
      _id
      name
      physicalStoreId
      contactPerson
      contactNumber
      address
      notes
      usageCount
    }
  }
`;

export const useVendorsByPhysicalStore = (physicalStoreId: string) => {
  const { data, loading, ...queryResult } = useQuery(vendorsListQuery as any, {
    variables: { physicalStoreId },
  });

  return {
    ...queryResult,
    loading,
    vendorsLoading: loading,
    vendorsByPhysicalStoreId: (data as any)?.vendorsByPhysicalStoreId ?? null,
  };
};

export default () => (WrappedComponent: ComponentType<AnyProps>) => {
  const WithVendorsByPhysicalStore = (props: AnyProps) => {
    const { physicalStoreId } = props;
    const vendorsProps = useVendorsByPhysicalStore(physicalStoreId);

    return React.createElement(WrappedComponent as any, { ...props, ...vendorsProps });
  };

  WithVendorsByPhysicalStore.propTypes = {
    physicalStoreId: PropTypes.string,
    vendorsLoading: PropTypes.bool,
    vendorsByPhysicalStoreId: PropTypes.array,
  };

  return WithVendorsByPhysicalStore;
};
