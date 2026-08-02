import React, { ComponentType } from 'react';

import { usePhysicalStore } from '../hooks/use-physical-store';

type InjectedProps = ReturnType<typeof usePhysicalStore> & {
  physicalStoreLoading: boolean;
};

export { usePhysicalStore };

export default <P extends { physicalStoreId?: string | null }>() =>
  (WrappedComponent: ComponentType<P & InjectedProps>) => {
    const WithPhysicalStore = (props: P) => {
      const { physicalStoreId } = props;
      const physicalStoreProps = usePhysicalStore(physicalStoreId ?? '');

      return (
        <WrappedComponent
          {...props}
          {...physicalStoreProps}
          physicalStoreLoading={physicalStoreProps.physicalStoreLoading}
        />
      );
    };

    return WithPhysicalStore;
  };
