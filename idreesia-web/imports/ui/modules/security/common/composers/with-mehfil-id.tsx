import React, { ComponentType } from 'react';
import { useParams } from 'react-router-dom';

type InjectedProps = {
  mehfilId: string;
};

export const useMehfilIdParam = () => {
  const { mehfilId = '' } = useParams<{ mehfilId: string }>();
  return mehfilId;
};

export default <P extends object>() =>
  (WrappedComponent: ComponentType<P & InjectedProps>) => {
    const WithMehfilId = (props: P) => {
      const mehfilId = useMehfilIdParam();

      return <WrappedComponent {...props} mehfilId={mehfilId} />;
    };

    return WithMehfilId;
  };
