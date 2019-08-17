import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

export default () => WrappedComponent => {
  const WithPhysicalStoreId = props => {
    const { match } = props;
    const physicalStoreId = get(match, ['params', 'physicalStoreId'], null);
    return <WrappedComponent physicalStoreId={physicalStoreId} {...props} />;
  };

  WithPhysicalStoreId.propTypes = {
    location: PropTypes.object,
    history: PropTypes.object,
    match: PropTypes.object,
  };

  return WithPhysicalStoreId;
};
