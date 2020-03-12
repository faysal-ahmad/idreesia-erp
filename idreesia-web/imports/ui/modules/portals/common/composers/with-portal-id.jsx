import React from 'react';
import PropTypes from 'prop-types';

import { get } from 'meteor/idreesia-common/utilities/lodash';

export default () => WrappedComponent => {
  const WithPortalId = props => {
    const { match } = props;
    const portalId = get(match, ['params', 'portalId'], null);
    return <WrappedComponent portalId={portalId} {...props} />;
  };

  WithPortalId.propTypes = {
    location: PropTypes.object,
    history: PropTypes.object,
    match: PropTypes.object,
  };

  return WithPortalId;
};
