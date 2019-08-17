import React from "react";
import PropTypes from "prop-types";
import { get } from "lodash";

export default () => WrappedComponent => {
  const WithCompanyId = props => {
    const { match } = props;
    const companyId = get(match, ["params", "companyId"], null);
    return <WrappedComponent companyId={companyId} {...props} />;
  };

  WithCompanyId.propTypes = {
    location: PropTypes.object,
    history: PropTypes.object,
    match: PropTypes.object,
  };

  return WithCompanyId;
};
