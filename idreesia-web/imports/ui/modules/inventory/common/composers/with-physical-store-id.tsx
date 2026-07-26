import React, { ComponentType } from 'react';
import PropTypes from 'prop-types';

import { get } from 'meteor/idreesia-common/utilities/lodash';

type AnyProps = Record<string, any>;

export default () => (WrappedComponent: ComponentType<AnyProps>) => {
  const WithPhysicalStoreId = (props: AnyProps) => {
    const { match } = props;
    const physicalStoreId = get(match, ['params', 'physicalStoreId'], null);
    return React.createElement(WrappedComponent as any, {
      physicalStoreId,
      ...props,
    });
  };

  WithPhysicalStoreId.propTypes = {
    location: PropTypes.object,
    history: PropTypes.object,
    match: PropTypes.object,
  };

  return WithPhysicalStoreId;
};
