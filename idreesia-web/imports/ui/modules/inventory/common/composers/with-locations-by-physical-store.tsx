import React, { ComponentType } from 'react';

import { usePhysicalStoreLocations } from '../hooks/use-physical-store-loctions';

type InjectedProps = {
  locationsLoading: boolean;
  locationsByPhysicalStoreId: ReturnType<
    typeof usePhysicalStoreLocations
  >['locationsByPhysicalStoreId'];
};

export { usePhysicalStoreLocations as useLocationsByPhysicalStore };

export default <P extends { physicalStoreId?: string | null }>() =>
  (WrappedComponent: ComponentType<P & InjectedProps>) => {
    const WithLocationsByPhysicalStore = (props: P) => {
      const { physicalStoreId } = props;
      const { locationsByPhysicalStoreId, locationsByPhysicalStoreIdLoading } =
        usePhysicalStoreLocations(physicalStoreId ?? '');

      return (
        <WrappedComponent
          {...props}
          locationsLoading={locationsByPhysicalStoreIdLoading}
          locationsByPhysicalStoreId={locationsByPhysicalStoreId}
        />
      );
    };

    return WithLocationsByPhysicalStore;
  };
