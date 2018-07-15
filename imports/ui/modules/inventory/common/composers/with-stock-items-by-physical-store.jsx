import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

export default () => WrappedComponent => {
  const WithStockItemsByPhysicalStore = props => <WrappedComponent {...props} />;

  WithStockItemsByPhysicalStore.propTypes = {
    physicalStoreId: PropTypes.string,
    stockItemsLoading: PropTypes.bool,
    stockItemsByPhysicalStoreId: PropTypes.array,
  };

  const stockItemsByPhysicalStoreId = gql`
    query stockItemsByPhysicalStoreId($physicalStoreId: String!) {
      stockItemsByPhysicalStoreId(physicalStoreId: $physicalStoreId) {
        _id
        itemTypeId
        itemTypeName
        itemCategoryName
        currentStockLevel
      }
    }
  `;

  return graphql(stockItemsByPhysicalStoreId, {
    props: ({ data }) => ({ stockItemsLoading: data.loading, ...data }),
    options: ({ physicalStoreId }) => ({ variables: { physicalStoreId } }),
  })(WithStockItemsByPhysicalStore);
};
