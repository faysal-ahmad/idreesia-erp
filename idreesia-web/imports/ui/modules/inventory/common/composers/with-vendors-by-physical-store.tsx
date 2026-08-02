import React, { ComponentType } from 'react';

import { usePhysicalStoreVendors } from '../hooks/use-physical-store-vendors';

type InjectedProps = {
  vendorsLoading: boolean;
  vendorsByPhysicalStoreId: ReturnType<
    typeof usePhysicalStoreVendors
  >['vendorsByPhysicalStoreId'];
};

export { usePhysicalStoreVendors as useVendorsByPhysicalStore };

export default <P extends { physicalStoreId?: string | null }>() =>
  (WrappedComponent: ComponentType<P & InjectedProps>) => {
    const WithVendorsByPhysicalStore = (props: P) => {
      const { physicalStoreId } = props;
      const { vendorsByPhysicalStoreId, vendorsByPhysicalStoreIdLoading } =
        usePhysicalStoreVendors(physicalStoreId ?? '');

      return (
        <WrappedComponent
          {...props}
          vendorsLoading={vendorsByPhysicalStoreIdLoading}
          vendorsByPhysicalStoreId={vendorsByPhysicalStoreId}
        />
      );
    };

    return WithVendorsByPhysicalStore;
  };
