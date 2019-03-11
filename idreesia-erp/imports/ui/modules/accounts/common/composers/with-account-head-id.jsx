import React from "react";
import PropTypes from "prop-types";
import { get } from "lodash";

export default () => WrappedComponent => {
  const WithAccountHeadId = props => {
    const { match } = props;
    const accountHeadId = get(match, ["params", "accountHeadId"], null);
    return <WrappedComponent accountHeadId={accountHeadId} {...props} />;
  };

  WithAccountHeadId.propTypes = {
    location: PropTypes.object,
    history: PropTypes.object,
    match: PropTypes.object,
  };

  return WithAccountHeadId;
};
