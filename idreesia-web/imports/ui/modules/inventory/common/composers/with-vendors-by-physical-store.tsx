// @ts-nocheck
import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

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

export const useVendorsByPhysicalStore = physicalStoreId => {
  const { data, loading, ...queryResult } = useQuery(vendorsListQuery, {
    variables: { physicalStoreId },
  });

  return {
    ...queryResult,
    loading,
    vendorsLoading: loading,
    vendorsByPhysicalStoreId: data ? data.vendorsByPhysicalStoreId : null,
  };
};

export default () => WrappedComponent => {
  const WithVendorsByPhysicalStore = props => {
    const { physicalStoreId } = props;
    const vendorsProps = useVendorsByPhysicalStore(physicalStoreId);

    return <WrappedComponent {...props} {...vendorsProps} />;
  };

  WithVendorsByPhysicalStore.propTypes = {
    physicalStoreId: PropTypes.string,
    vendorsLoading: PropTypes.bool,
    vendorsByPhysicalStoreId: PropTypes.array,
  };

  return WithVendorsByPhysicalStore;
};
