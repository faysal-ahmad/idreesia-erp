import React from "react";
import PropTypes from "prop-types";
import { get } from "lodash";

export default () => WrappedComponent => {
  const WithMehfilId = props => {
    const { match } = props;
    const mehfilId = get(match, ["params", "mehfilId"], null);
    return <WrappedComponent mehfilId={mehfilId} {...props} />;
  };

  WithMehfilId.propTypes = {
    location: PropTypes.object,
    history: PropTypes.object,
    match: PropTypes.object,
  };

  return WithMehfilId;
};
