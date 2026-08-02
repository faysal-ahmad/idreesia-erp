import React, { ComponentType } from 'react';

import { usePhysicalStoreItemCategories } from '../hooks/use-physical-store-item-categories';

type InjectedProps = {
  itemCategoriesLoading: boolean;
  itemCategoriesByPhysicalStoreId: ReturnType<
    typeof usePhysicalStoreItemCategories
  >['itemCategoriesByPhysicalStoreId'];
};

export { usePhysicalStoreItemCategories as useItemCategoriesByPhysicalStore };

export default <P extends { physicalStoreId?: string | null }>() =>
  (WrappedComponent: ComponentType<P & InjectedProps>) => {
    const WithItemCategoriesByPhysicalStore = (props: P) => {
      const { physicalStoreId } = props;
      const {
        itemCategoriesByPhysicalStoreId,
        itemCategoriesByPhysicalStoreIdLoading,
      } = usePhysicalStoreItemCategories(physicalStoreId ?? '');

      return (
        <WrappedComponent
          {...props}
          itemCategoriesLoading={itemCategoriesByPhysicalStoreIdLoading}
          itemCategoriesByPhysicalStoreId={itemCategoriesByPhysicalStoreId}
        />
      );
    };

    return WithItemCategoriesByPhysicalStore;
  };
