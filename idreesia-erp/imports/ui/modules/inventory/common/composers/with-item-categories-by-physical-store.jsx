import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

export default () => WrappedComponent => {
  const WithItemCategoriesByPhysicalStore = props => (
    <WrappedComponent {...props} />
  );

  WithItemCategoriesByPhysicalStore.propTypes = {
    physicalStoreId: PropTypes.string,
    itemCategoriesLoading: PropTypes.bool,
    itemCategoriesByPhysicalStoreId: PropTypes.array,
  };

  const itemCategoriesListQuery = gql`
    query itemCategoriesByPhysicalStoreId($physicalStoreId: String!) {
      itemCategoriesByPhysicalStoreId(physicalStoreId: $physicalStoreId) {
        _id
        name
        physicalStoreId
        stockItemCount
      }
    }
  `;

  return graphql(itemCategoriesListQuery, {
    props: ({ data }) => ({ itemCategoriesLoading: data.loading, ...data }),
    options: ({ physicalStoreId }) => ({ variables: { physicalStoreId } }),
  })(WithItemCategoriesByPhysicalStore);
};
