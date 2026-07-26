import React, { ComponentType } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';


type AnyProps = Record<string, any>;
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

export const useItemCategoriesByPhysicalStore = (physicalStoreId: string) => {
  const { data, loading, ...queryResult } = useQuery(itemCategoriesListQuery as any, {
    variables: { physicalStoreId },
  });

  return {
    ...queryResult,
    loading,
    itemCategoriesLoading: loading,
    itemCategoriesByPhysicalStoreId: (data as any)?.itemCategoriesByPhysicalStoreId ?? null,
  };
};

export default () => (WrappedComponent: ComponentType<AnyProps>) => {
  const WithItemCategoriesByPhysicalStore = (props: AnyProps) => {
    const { physicalStoreId } = props;
    const itemCategoriesProps =
      useItemCategoriesByPhysicalStore(physicalStoreId);

    return React.createElement(WrappedComponent as any, { ...props, ...itemCategoriesProps });
  };

  WithItemCategoriesByPhysicalStore.propTypes = {
    physicalStoreId: PropTypes.string,
    itemCategoriesLoading: PropTypes.bool,
    itemCategoriesByPhysicalStoreId: PropTypes.array,
  };

  return WithItemCategoriesByPhysicalStore;
};
