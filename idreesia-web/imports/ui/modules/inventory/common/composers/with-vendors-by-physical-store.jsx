import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

export default () => WrappedComponent => {
  const WithVendorsByPhysicalStore = props => <WrappedComponent {...props} />;

  WithVendorsByPhysicalStore.propTypes = {
    physicalStoreId: PropTypes.string,
    vendorsLoading: PropTypes.bool,
    vendorsByPhysicalStoreId: PropTypes.array,
  };

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

  return graphql(vendorsListQuery, {
    props: ({ data }) => ({ vendorsLoading: data.loading, ...data }),
    options: ({ physicalStoreId }) => ({ variables: { physicalStoreId } }),
  })(WithVendorsByPhysicalStore);
};
