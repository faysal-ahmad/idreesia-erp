import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

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

export const useItemCategoriesByPhysicalStore = physicalStoreId => {
  const { data, loading, ...queryResult } = useQuery(itemCategoriesListQuery, {
    variables: { physicalStoreId },
  });

  return {
    ...queryResult,
    loading,
    itemCategoriesLoading: loading,
    itemCategoriesByPhysicalStoreId: data
      ? data.itemCategoriesByPhysicalStoreId
      : null,
  };
};

export default () => WrappedComponent => {
  const WithItemCategoriesByPhysicalStore = props => {
    const { physicalStoreId } = props;
    const itemCategoriesProps =
      useItemCategoriesByPhysicalStore(physicalStoreId);

    return <WrappedComponent {...props} {...itemCategoriesProps} />;
  };

  WithItemCategoriesByPhysicalStore.propTypes = {
    physicalStoreId: PropTypes.string,
    itemCategoriesLoading: PropTypes.bool,
    itemCategoriesByPhysicalStoreId: PropTypes.array,
  };

  return WithItemCategoriesByPhysicalStore;
};
