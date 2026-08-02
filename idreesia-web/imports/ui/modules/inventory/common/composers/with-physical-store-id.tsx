import React, { ComponentType } from 'react';
import { type match } from 'react-router';

type InjectedProps = {
  physicalStoreId: string | null;
};

export default <P extends object>() =>
  (WrappedComponent: ComponentType<P & InjectedProps>) => {
    const WithPhysicalStoreId = (
      props: P & { match?: match<{ physicalStoreId: string }> }
    ) => {
      const physicalStoreId = props.match?.params.physicalStoreId ?? null;
      return <WrappedComponent {...props} physicalStoreId={physicalStoreId} />;
    };

    return WithPhysicalStoreId;
  };
